import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { ApprovalRequiredError, BrowserAutomationError, ValidationError } from "./errors.js";
import { estimateWorkflowCredits, InMemoryCreditLedger } from "./credits.js";
import { validateWorkflow } from "./schema.js";

function defaultApprovalHandler() {
  return {
    async requestApproval({ step }) {
      return {
        approved: !step.requiresApproval,
        approver: step.requiresApproval ? null : "system",
      };
    },
  };
}

function assertBrowserAdapter(browser) {
  const required = ["navigate", "click", "type", "waitFor", "assertState", "captureEvidence"];
  for (const method of required) {
    if (!browser || typeof browser[method] !== "function") {
      throw new ValidationError(`browser adapter must implement ${method}().`);
    }
  }
}

export class BrowserAutomationHarness extends EventEmitter {
  constructor(options = {}) {
    super();

    assertBrowserAdapter(options.browser);

    this.browser = options.browser;
    this.workflowBuilder = options.workflowBuilder;
    this.creditLedger = options.creditLedger ?? new InMemoryCreditLedger();
    this.approvals = options.approvals ?? defaultApprovalHandler();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async buildWorkflowFromTranscript(input) {
    if (!this.workflowBuilder || typeof this.workflowBuilder.buildFromTranscript !== "function") {
      throw new ValidationError("workflowBuilder with buildFromTranscript() is required.");
    }

    this.emit("workflow.build.started", { input });
    const draft = await this.workflowBuilder.buildFromTranscript(input);
    this.emit("workflow.build.completed", { workflow: draft.workflow, metadata: draft.metadata });
    return draft;
  }

  async run(input) {
    if (!input || typeof input !== "object") {
      throw new ValidationError("run input is required.");
    }

    validateWorkflow(input.workflow);

    const accountId = input.accountId;
    if (!accountId) {
      throw new ValidationError("accountId is required.");
    }

    const runId = input.runId ?? `run_${randomUUID()}`;
    const workflow = input.workflow;
    const actor = input.actor ?? "system";
    const estimated = estimateWorkflowCredits(workflow);
    const hold = this.creditLedger.hold(accountId, estimated.estimatedCredits, {
      runId,
      workflow: workflow.name,
      actor,
    });

    const result = {
      runId,
      status: "running",
      startedAt: this.now(),
      completedAt: null,
      actor,
      accountId,
      workflowName: workflow.name,
      evidence: [],
      stepResults: [],
      credits: {
        estimated: estimated.estimatedCredits,
        actualBurn: 0,
        released: 0,
        balanceAfter: hold.balanceAfter,
      },
    };

    this.emit("run.started", { runId, workflow, actor, estimatedCredits: estimated.estimatedCredits });

    try {
      for (const step of workflow.steps) {
        this.emit("run.step.started", { runId, step });

        if (step.requiresApproval) {
          const approval = await this.approvals.requestApproval({
            runId,
            step,
            workflow,
            actor,
          });

          this.emit("run.step.approval", { runId, step, approval });

          if (!approval?.approved) {
            throw new ApprovalRequiredError(`Approval denied for step ${step.title}.`);
          }
        }

        const stepResult = await this.executeStep(step);
        result.stepResults.push(stepResult);
        if (stepResult.evidence) {
          result.evidence.push(stepResult.evidence);
        }

        this.emit("run.step.completed", { runId, step, stepResult });
      }

      const actualBurn = Math.max(
        Math.ceil(estimated.estimatedCredits * 0.82),
        result.stepResults.length * 5,
      );

      const finalized = this.creditLedger.finalize(accountId, estimated.estimatedCredits, actualBurn, {
        runId,
        workflow: workflow.name,
        actor,
      });

      result.status = "completed";
      result.completedAt = this.now();
      result.credits.actualBurn = finalized.actualBurn;
      result.credits.released = finalized.released;
      result.credits.balanceAfter = finalized.balanceAfter;

      this.emit("run.completed", { runId, result });
      return result;
    } catch (error) {
      const failedBurn = Math.max(Math.ceil(estimated.estimatedCredits * 0.25), 6);
      const finalized = this.creditLedger.finalize(accountId, estimated.estimatedCredits, failedBurn, {
        runId,
        workflow: workflow.name,
        actor,
        failure: true,
      });

      result.status = error instanceof ApprovalRequiredError ? "awaiting_approval" : "failed";
      result.completedAt = this.now();
      result.credits.actualBurn = finalized.actualBurn;
      result.credits.released = finalized.released;
      result.credits.balanceAfter = finalized.balanceAfter;
      result.error = error instanceof Error ? error.message : "Unexpected automation failure.";

      this.emit("run.failed", { runId, result, error });
      return result;
    }
  }

  async executeStep(step) {
    switch (step.action) {
      case "navigate":
        await this.browser.navigate(step.target);
        break;
      case "click":
        await this.browser.click(step.target);
        break;
      case "type":
        await this.browser.type(step.target, step.input ?? "");
        break;
      case "wait_for":
        await this.browser.waitFor(step.target);
        break;
      case "assert_state":
        await this.browser.assertState(step.verification ?? step.target);
        break;
      case "custom":
        if (typeof this.browser.custom !== "function") {
          throw new BrowserAutomationError("browser adapter does not implement custom() for custom step.");
        }
        await this.browser.custom(step);
        break;
      default:
        throw new BrowserAutomationError(`Unsupported step action ${step.action}.`);
    }

    const evidence = await this.browser.captureEvidence(step.title);

    return {
      stepId: step.id,
      title: step.title,
      action: step.action,
      evidence,
      completedAt: this.now(),
    };
  }
}
