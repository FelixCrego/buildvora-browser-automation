import { randomUUID } from "node:crypto";
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
    this.holds = new Map();
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

  reserve(accountId, amount, metadata = {}) {
    const balance = this.getBalance(accountId);
    if (balance < amount) {
      throw new CreditLimitError(`Insufficient credits for account ${accountId}.`);
    }

    const next = balance - amount;
    const holdId = metadata.holdId ?? `hold_${randomUUID()}`;
    this.balances.set(accountId, next);
    const hold = {
      holdId,
      accountId,
      held: amount,
      balanceAfter: next,
      metadata,
      createdAt: new Date().toISOString(),
      status: "held",
    };
    this.holds.set(holdId, hold);
    this.events.push({ accountId, holdId, type: "hold", amount: -amount, balanceAfter: next, metadata, createdAt: hold.createdAt });
    return hold;
  }

  hold(accountId, amount, metadata = {}) {
    return this.reserve(accountId, amount, metadata);
  }

  getHold(holdId) {
    return this.holds.get(holdId) ?? null;
  }

  capture(holdId, actualBurn, metadata = {}) {
    const hold = this.getHold(holdId);
    if (!hold) {
      throw new CreditLimitError(`Unknown credit hold ${holdId}.`, { code: "UNKNOWN_CREDIT_HOLD" });
    }

    if (hold.status !== "held") {
      throw new CreditLimitError(`Credit hold ${holdId} is already ${hold.status}.`, {
        code: "HOLD_ALREADY_FINALIZED",
      });
    }

    const releaseAmount = Math.max(hold.held - actualBurn, 0);
    const debitedAmount = Math.min(actualBurn, hold.held);
    let balance = this.getBalance(hold.accountId);
    const eventMetadata = { ...hold.metadata, ...metadata };

    if (releaseAmount > 0) {
      balance += releaseAmount;
      this.balances.set(hold.accountId, balance);
      this.events.push({
        accountId: hold.accountId,
        holdId,
        type: "release",
        amount: releaseAmount,
        balanceAfter: balance,
        metadata: eventMetadata,
        createdAt: new Date().toISOString(),
      });
    }

    this.events.push({
      accountId: hold.accountId,
      holdId,
      type: "debit",
      amount: -debitedAmount,
      balanceAfter: balance,
      metadata: eventMetadata,
      createdAt: new Date().toISOString(),
    });

    hold.status = "captured";
    hold.actualBurn = debitedAmount;
    hold.released = releaseAmount;
    hold.balanceAfter = balance;

    return {
      holdId,
      actualBurn: debitedAmount,
      released: releaseAmount,
      balanceAfter: balance,
    };
  }

  release(holdId, metadata = {}) {
    const hold = this.getHold(holdId);
    if (!hold) {
      throw new CreditLimitError(`Unknown credit hold ${holdId}.`, { code: "UNKNOWN_CREDIT_HOLD" });
    }

    if (hold.status !== "held") {
      throw new CreditLimitError(`Credit hold ${holdId} is already ${hold.status}.`, {
        code: "HOLD_ALREADY_FINALIZED",
      });
    }

    const balance = this.getBalance(hold.accountId) + hold.held;
    this.balances.set(hold.accountId, balance);
    hold.status = "released";
    hold.released = hold.held;
    hold.balanceAfter = balance;

    this.events.push({
      accountId: hold.accountId,
      holdId,
      type: "release",
      amount: hold.held,
      balanceAfter: balance,
      metadata: { ...hold.metadata, ...metadata },
      createdAt: new Date().toISOString(),
    });

    return {
      holdId,
      released: hold.held,
      balanceAfter: balance,
    };
  }

  finalize(accountId, holdAmount, actualBurn, metadata = {}) {
    const hold = this.reserve(accountId, holdAmount, metadata);
    return this.capture(hold.holdId, actualBurn, metadata);
  }

  listEvents(accountId) {
    return this.events.filter((event) => !accountId || event.accountId === accountId);
  }
}
