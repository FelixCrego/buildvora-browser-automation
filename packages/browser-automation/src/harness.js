import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { BrowserAutomationError, RunStateError, ValidationError } from "./errors.js";
import { estimateWorkflowCredits, InMemoryCreditLedger } from "./credits.js";
import { InMemoryRunStore } from "./run-store.js";
import { validateWorkflow } from "./schema.js";

function defaultApprovalHandler() {
  return {
    async requestApproval({ step }) {
      return {
        approved: !step.requiresApproval,
        pending: Boolean(step.requiresApproval),
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
    this.runStore = options.runStore ?? new InMemoryRunStore();
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
    const hold = this.creditLedger.reserve(accountId, estimated.estimatedCredits, {
      runId,
      workflow: workflow.name,
      actor,
    });

    const state = this.runStore.create({
      runId,
      workflow,
      actor,
      accountId,
      estimatedCredits: estimated.estimatedCredits,
      holdId: hold.holdId,
      currentStepIndex: 0,
      status: "queued",
      pendingApproval: null,
      approvedStepIds: [],
      result: {
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
          holdId: hold.holdId,
          balanceAfter: hold.balanceAfter,
        },
      },
    });

    this.emit("run.started", { runId, workflow, actor, estimatedCredits: estimated.estimatedCredits });
    return this.executeStoredRun(state.runId);
  }

  async resume(runId, approval = {}) {
    const state = this.runStore.get(runId);
    if (!state) {
      throw new RunStateError(`Unknown run ${runId}.`);
    }

    if (state.status !== "awaiting_approval" || !state.pendingApproval) {
      throw new RunStateError(`Run ${runId} is not waiting on approval.`);
    }

    const decision = {
      approved: Boolean(approval.approved),
      denied: approval.denied === true || approval.approved === false,
      pending: false,
      approver: approval.approver ?? "operator",
      notes: approval.notes ?? null,
    };

    this.emit("run.approval.resolved", {
      runId,
      approval: state.pendingApproval,
      decision,
    });

    if (decision.denied) {
      return this.finalizeStoredRun(state, state.result, {
        status: "cancelled",
        error: `Approval denied for step ${state.pendingApproval.stepTitle}.`,
        actualBurn: this.calculateCancelledBurn(state),
      });
    }

    this.runStore.update(runId, {
      status: "running",
      pendingApproval: null,
      currentStepIndex: state.pendingApproval.stepIndex,
      approvedStepIds: [...new Set([...(state.approvedStepIds ?? []), state.pendingApproval.stepId])],
    });

    return this.executeStoredRun(runId);
  }

  async executeStoredRun(runId) {
    const state = this.runStore.get(runId);
    if (!state) {
      throw new RunStateError(`Unknown run ${runId}.`);
    }

    const result = {
      ...state.result,
      startedAt: this.now(),
    };
    const workflow = state.workflow;

    try {
      this.runStore.update(runId, { status: "running" });

      for (let stepIndex = state.currentStepIndex; stepIndex < workflow.steps.length; stepIndex += 1) {
        const step = workflow.steps[stepIndex];
        this.emit("run.step.started", { runId, step, stepIndex });

        if (step.requiresApproval && !(state.approvedStepIds ?? []).includes(step.id)) {
          const approval = await this.approvals.requestApproval({
            runId,
            step,
            workflow,
            actor: state.actor,
          });

          this.emit("run.step.approval", { runId, step, stepIndex, approval });

          if (approval?.approved) {
            this.emit("run.step.approved", { runId, step, stepIndex, approval });
          } else if (approval?.denied) {
            return this.finalizeStoredRun(state, result, {
              status: "cancelled",
              error: `Approval denied for step ${step.title}.`,
              actualBurn: this.calculateCancelledBurn(state),
            });
          } else {
            const pendingApproval = {
              stepId: step.id,
              stepTitle: step.title,
              stepIndex,
              requestedAt: this.now(),
            };

            this.runStore.update(runId, {
              status: "awaiting_approval",
              currentStepIndex: stepIndex,
              pendingApproval,
              result: {
                ...result,
                status: "awaiting_approval",
              },
            });

            return {
              ...result,
              status: "awaiting_approval",
              pendingApproval,
            };
          }
        }

        const stepResult = await this.executeStep(step);
        result.stepResults.push(stepResult);
        if (stepResult.evidence) {
          result.evidence.push(stepResult.evidence);
        }

        this.emit("run.step.completed", { runId, step, stepIndex, stepResult });
        this.runStore.update(runId, {
          currentStepIndex: stepIndex + 1,
          result,
        });
      }

      return this.finalizeStoredRun(state, result, {
        status: "completed",
        actualBurn: this.calculateSuccessBurn(state, result),
      });
    } catch (error) {
      return this.finalizeStoredRun(state, result, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unexpected automation failure.",
        actualBurn: this.calculateFailureBurn(state, result),
      });
    }
  }

  calculateSuccessBurn(state, result) {
    return Math.max(
      Math.ceil(state.estimatedCredits * 0.82),
      result.stepResults.length * 5,
    );
  }

  calculateFailureBurn(state, result) {
    return Math.max(
      Math.ceil(state.estimatedCredits * 0.25),
      result.stepResults.length * 3,
      6,
    );
  }

  calculateCancelledBurn(state) {
    return Math.max(Math.ceil(state.estimatedCredits * 0.1), 3);
  }

  finalizeStoredRun(state, result, options) {
    const finalized = this.creditLedger.capture(state.holdId, options.actualBurn, {
      runId: state.runId,
      workflow: state.workflow.name,
      actor: state.actor,
      status: options.status,
    });

    const finalizedResult = {
      ...result,
      status: options.status,
      completedAt: this.now(),
      error: options.error,
      pendingApproval: null,
      credits: {
        ...result.credits,
        actualBurn: finalized.actualBurn,
        released: finalized.released,
        balanceAfter: finalized.balanceAfter,
      },
    };

    this.runStore.update(state.runId, {
      status: options.status,
      pendingApproval: null,
      result: finalizedResult,
    });

    if (options.status === "completed") {
      this.emit("run.completed", { runId: state.runId, result: finalizedResult });
    } else {
      this.emit("run.failed", { runId: state.runId, result: finalizedResult, error: options.error });
    }

    return finalizedResult;
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
