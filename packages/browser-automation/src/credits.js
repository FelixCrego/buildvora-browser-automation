import { CreditLimitError } from "./errors.js";

export function estimateWorkflowCredits(workflow) {
  const steps = workflow.steps ?? [];
  const riskMultiplier =
    workflow.riskLevel === "high" ? 1.8 : workflow.riskLevel === "medium" ? 1.35 : 1;
  const protectedSteps = steps.filter((step) => step.requiresApproval).length;
  const verificationSteps = steps.filter((step) => step.action === "assert_state" || step.verification).length;

  const base = 18;
  const stepCost = steps.length * 4;
  const approvalCost = protectedSteps * 8;
  const verificationCost = verificationSteps * 5;

  const estimated = Math.ceil((base + stepCost + approvalCost + verificationCost) * riskMultiplier);

  return {
    estimatedCredits: estimated,
    breakdown: {
      base,
      stepCost,
      approvalCost,
      verificationCost,
      riskMultiplier,
    },
  };
}

export class InMemoryCreditLedger {
  constructor(initialBalances = {}) {
    this.balances = new Map(Object.entries(initialBalances));
    this.events = [];
  }

  getBalance(accountId) {
    return this.balances.get(accountId) ?? 0;
  }

  grant(accountId, amount, metadata = {}) {
    const next = this.getBalance(accountId) + amount;
    this.balances.set(accountId, next);
    this.events.push({ accountId, type: "grant", amount, balanceAfter: next, metadata, createdAt: new Date().toISOString() });
    return next;
  }

  hold(accountId, amount, metadata = {}) {
    const balance = this.getBalance(accountId);
    if (balance < amount) {
      throw new CreditLimitError(`Insufficient credits for account ${accountId}.`);
    }

    const next = balance - amount;
    this.balances.set(accountId, next);
    this.events.push({ accountId, type: "hold", amount: -amount, balanceAfter: next, metadata, createdAt: new Date().toISOString() });
    return { held: amount, balanceAfter: next };
  }

  finalize(accountId, holdAmount, actualBurn, metadata = {}) {
    const releaseAmount = Math.max(holdAmount - actualBurn, 0);
    const debitedAmount = Math.min(actualBurn, holdAmount);
    let balance = this.getBalance(accountId);

    if (releaseAmount > 0) {
      balance += releaseAmount;
      this.balances.set(accountId, balance);
      this.events.push({ accountId, type: "release", amount: releaseAmount, balanceAfter: balance, metadata, createdAt: new Date().toISOString() });
    }

    this.events.push({ accountId, type: "debit", amount: -debitedAmount, balanceAfter: balance, metadata, createdAt: new Date().toISOString() });

    return {
      actualBurn: debitedAmount,
      released: releaseAmount,
      balanceAfter: balance,
    };
  }

  listEvents(accountId) {
    return this.events.filter((event) => !accountId || event.accountId === accountId);
  }
}
