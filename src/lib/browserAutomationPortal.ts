import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BrowserAutomationHarness,
  createPlaywrightAdapter,
  CreditLimitError,
} from "@buildvora/browser-automation";
import type {
  AuditEvent,
  AuditSeverity,
  BrowserAutomationAccount,
  BrowserAutomationApproval,
  BrowserAutomationConnection,
  BrowserAutomationRun,
  BrowserAutomationWorkflow,
  ConnectionStatus,
  CreditLedgerEntry,
  RiskLevel,
  RunStatus,
  WorkerNode,
  WorkflowVersion,
} from "./browserAutomationSeed";
import {
  getAuditEvents as getSeedAuditEvents,
  getBrowserAutomationAccounts as getSeedAccounts,
  getBrowserAutomationApprovals as getSeedApprovals,
  getBrowserAutomationConnections as getSeedConnections,
  getBrowserAutomationRuns as getSeedRuns,
  getBrowserAutomationWorkflows as getSeedWorkflows,
  getCreditLedgerEntries as getSeedLedger,
  getWorkerNodes as getSeedWorkers,
  getWorkflowVersions as getSeedWorkflowVersions,
} from "./browserAutomationSeed";

type WorkflowAction = "navigate" | "click" | "type" | "wait_for" | "assert_state" | "custom";

type HarnessWorkflow = {
  name: string;
  objective: string;
  riskLevel: RiskLevel;
  systems: string[];
  approvals: string[];
  steps: Array<{
    id: string;
    title: string;
    action: WorkflowAction;
    target: string;
    input: string | null;
    requiresApproval: boolean;
    verification: string;
  }>;
  sourceTranscript?: string;
  model?: string;
  rawResponseId?: string | null;
  builtAt?: string;
};

type RuntimeApprovalState = {
  stepId: string;
  stepTitle: string;
  stepIndex: number;
  requestedAt: string;
};

type StoredRuntimeRun = {
  runId: string;
  workflowSlug: string;
  accountId: string;
  actor: string;
  estimatedCredits: number;
  holdId: string;
  currentStepIndex: number;
  status: RunStatus;
  pendingApproval: RuntimeApprovalState | null;
  approvedStepIds: string[];
  workerId: string;
  workflow: HarnessWorkflow;
  result: {
    runId: string;
    status: RunStatus;
    startedAt: string;
    completedAt: string | null;
    actor: string;
    accountId: string;
    workflowName: string;
    evidence: Array<{ label?: string; path?: string; kind?: string; capturedAt?: string }>;
    stepResults: Array<{
      stepId: string;
      title: string;
      action: WorkflowAction;
      evidence?: { label?: string; path?: string; kind?: string; capturedAt?: string };
      completedAt: string;
    }>;
    credits: {
      estimated: number;
      actualBurn: number;
      released: number;
      holdId: string;
      balanceAfter: number;
    };
    error?: string;
  };
};

type StoredCreditHold = {
  holdId: string;
  accountId: string;
  held: number;
  balanceAfter: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  status: "held" | "captured" | "released";
  actualBurn?: number;
  released?: number;
};

type BrowserAutomationState = {
  accounts: BrowserAutomationAccount[];
  workflows: BrowserAutomationWorkflow[];
  workflowVersions: WorkflowVersion[];
  runs: BrowserAutomationRun[];
  approvals: BrowserAutomationApproval[];
  connections: BrowserAutomationConnection[];
  creditLedger: CreditLedgerEntry[];
  workers: WorkerNode[];
  auditEvents: AuditEvent[];
  runtimeRuns: StoredRuntimeRun[];
  creditHolds: StoredCreditHold[];
};

type LaunchPayload = {
  workflowSlug: string;
  targetCount?: number;
  verificationMode?: "standard" | "heavy";
  requestedBy?: string;
};

type ApprovalDecisionPayload = {
  approvalId: string;
  approved: boolean;
  approver?: string;
  notes?: string;
};

type RunActionPayload = {
  runId: string;
  action: "pause" | "cancel" | "retry";
  actor?: string;
};

type ConnectionActionPayload = {
  connectionId: string;
  action: "reverify" | "rotate";
  actor?: string;
};

type WorkerActionPayload = {
  workerId: string;
  action: "drain" | "restore";
  actor?: string;
};

const EVIDENCE_STILLS = [
  "/browser-automation-stills/still-03.jpg",
  "/browser-automation-stills/still-04.jpg",
  "/browser-automation-stills/still-05.jpg",
  "/browser-automation-stills/still-07.jpg",
  "/browser-automation-stills/still-08.jpg",
];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function resolveStateFilePath() {
  if (process.env.BROWSER_AUTOMATION_STATE_PATH) {
    return process.env.BROWSER_AUTOMATION_STATE_PATH;
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "buildvora-browser-automation.db");
  }

  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "browser-automation.db");
}

function buildSeedState(): BrowserAutomationState {
  return {
    accounts: deepClone(getSeedAccounts()),
    workflows: deepClone(getSeedWorkflows()),
    workflowVersions: deepClone(getSeedWorkflowVersions()),
    runs: deepClone(getSeedRuns()),
    approvals: deepClone(getSeedApprovals()),
    connections: deepClone(getSeedConnections()),
    creditLedger: deepClone(getSeedLedger()),
    workers: deepClone(getSeedWorkers()),
    auditEvents: deepClone(getSeedAuditEvents()),
    runtimeRuns: [],
    creditHolds: [],
  };
}

function withDatabase<T>(
  callback: (database: DatabaseSync) => T,
  options: { initialize?: boolean } = {},
) {
  const databasePath = resolveStateFilePath();
  const directory = path.dirname(databasePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const database = new DatabaseSync(databasePath);
  if (options.initialize) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS state_store (
        key TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  try {
    return callback(database);
  } finally {
    database.close();
  }
}

function readState(): BrowserAutomationState {
  const databasePath = resolveStateFilePath();
  if (!fs.existsSync(databasePath)) {
    return buildSeedState();
  }

  return withDatabase((database) => {
    const row = database
      .prepare("SELECT json FROM state_store WHERE key = ?")
      .get("browser-automation-state") as { json: string } | undefined;

    if (!row) {
      return buildSeedState();
    }

    return JSON.parse(row.json) as BrowserAutomationState;
  });
}

function writeState(state: BrowserAutomationState) {
  withDatabase((database) => {
    database
      .prepare(`
        INSERT INTO state_store (key, json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at
      `)
      .run("browser-automation-state", JSON.stringify(state), nowIso());
  }, { initialize: true });
}

function getBalanceFromLedger(state: BrowserAutomationState, accountSlug: string) {
  return state.creditLedger
    .filter((entry) => entry.accountSlug === accountSlug)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function syncAccountDerivedFields(state: BrowserAutomationState) {
  for (const account of state.accounts) {
    account.availableCredits = getBalanceFromLedger(state, account.slug);
    account.pendingApprovals = state.approvals.filter(
      (approval) => approval.accountSlug === account.slug && approval.status === "pending",
    ).length;
    account.activeWorkflows = state.workflows.filter(
      (workflow) => workflow.accountSlug === account.slug && workflow.state === "published",
    ).length;
  }
}

function severityForStatus(status: RunStatus): AuditSeverity {
  if (status === "failed" || status === "cancelled") return "critical";
  if (status === "awaiting_approval" || status === "paused") return "warning";
  return "info";
}

function addAuditEvent(
  state: BrowserAutomationState,
  input: {
    accountSlug?: string;
    actor: string;
    event: string;
    target: string;
    severity: AuditSeverity;
    detail: string;
  },
) {
  state.auditEvents.unshift({
    id: `aud_${randomUUID().slice(0, 8)}`,
    accountSlug: input.accountSlug,
    actor: input.actor,
    event: input.event,
    target: input.target,
    createdAt: nowIso(),
    severity: input.severity,
    detail: input.detail,
  });
}

function upsertRun(state: BrowserAutomationState, run: BrowserAutomationRun) {
  const index = state.runs.findIndex((current) => current.id === run.id);
  if (index >= 0) {
    state.runs[index] = run;
  } else {
    state.runs.unshift(run);
  }
}

function normalizeWorkerMetrics(state: BrowserAutomationState) {
  for (const worker of state.workers) {
    const assignedRuns = state.runs.filter(
      (run) =>
        run.workerId === worker.id &&
        ["queued", "running", "awaiting_approval", "paused"].includes(run.status),
    );
    worker.activeRuns = assignedRuns.filter((run) => run.status === "running").length;
    worker.queueDepth = assignedRuns.length;
    worker.lastHeartbeatAt = nowIso();
  }
}

function evidencePathForIndex(index: number) {
  return EVIDENCE_STILLS[index % EVIDENCE_STILLS.length];
}

function summaryForRun(runtimeRun: StoredRuntimeRun, workflow: BrowserAutomationWorkflow) {
  switch (runtimeRun.result.status) {
    case "completed":
      return `${workflow.name} completed with ${runtimeRun.result.stepResults.length} executed steps and evidence captured for review.`;
    case "awaiting_approval":
      return `${workflow.name} is waiting on a protected approval step before execution can continue.`;
    case "running":
      return `${workflow.name} is running through the current browser task sequence.`;
    case "cancelled":
      return `${workflow.name} stopped because a protected approval step was denied.`;
    case "failed":
      return `${workflow.name} failed before the protected execution path could settle cleanly.`;
    default:
      return `${workflow.name} is staged in the execution runtime.`;
  }
}

function buildTimeline(runtimeRun: StoredRuntimeRun) {
  const completedStepIds = new Set(runtimeRun.result.stepResults.map((step) => step.stepId));
  return runtimeRun.workflow.steps.map((step, index) => {
    let status: "done" | "active" | "blocked" | "queued" = "queued";

    if (completedStepIds.has(step.id)) {
      status = "done";
    } else if (runtimeRun.pendingApproval?.stepId === step.id) {
      status = "blocked";
    } else if (
      runtimeRun.result.status === "running" &&
      runtimeRun.currentStepIndex === index &&
      !completedStepIds.has(step.id)
    ) {
      status = "active";
    }

    return {
      label: step.title,
      status,
      note: step.verification || step.target || "Browser step prepared for execution.",
    };
  });
}

function syncWorkflowRunStatus(state: BrowserAutomationState, workflowSlug: string, status: RunStatus) {
  const workflow = state.workflows.find((item) => item.slug === workflowSlug);
  if (workflow) {
    workflow.lastRunStatus = status;
  }
}

function syncPublicRunRecord(state: BrowserAutomationState, runtimeRun: StoredRuntimeRun) {
  const workflow = state.workflows.find((item) => item.slug === runtimeRun.workflowSlug);
  if (!workflow) {
    return;
  }

  const approvalCount = state.approvals.filter((approval) => approval.runId === runtimeRun.runId).length;
  const runRecord: BrowserAutomationRun = {
    id: runtimeRun.runId,
    accountSlug: runtimeRun.accountId,
    workflowSlug: runtimeRun.workflowSlug,
    requestedBy: runtimeRun.actor,
    status: runtimeRun.result.status,
    startedAt: runtimeRun.result.startedAt,
    completedAt: runtimeRun.result.completedAt ?? undefined,
    estimatedCredits: runtimeRun.result.credits.estimated,
    actualCredits: runtimeRun.result.credits.actualBurn,
    vendorCostUsd: Number((runtimeRun.result.credits.actualBurn * 0.17).toFixed(2)),
    approvalsTriggered: approvalCount,
    summary: summaryForRun(runtimeRun, workflow),
    evidence:
      runtimeRun.result.evidence.length > 0
        ? runtimeRun.result.evidence.map((evidence, index) => evidence.path ?? evidencePathForIndex(index))
        : [evidencePathForIndex(0)],
    workerId: runtimeRun.workerId,
    queueLane: workflow.riskLevel === "high" ? "priority" : workflow.riskLevel === "medium" ? "standard" : "nightly",
    timeline: buildTimeline(runtimeRun),
  };

  upsertRun(state, runRecord);
  syncWorkflowRunStatus(state, runtimeRun.workflowSlug, runRecord.status);
}

function selectWorker(state: BrowserAutomationState) {
  const sorted = [...state.workers].sort((left, right) => {
    const healthRank = (worker: WorkerNode) =>
      worker.status === "healthy" ? 0 : worker.status === "degraded" ? 1 : 2;
    return healthRank(left) - healthRank(right) || left.queueDepth - right.queueDepth;
  });

  return sorted[0] ?? state.workers[0];
}

function createHarnessWorkflow(
  workflow: BrowserAutomationWorkflow,
  targetCount: number,
  verificationMode: "standard" | "heavy",
): HarnessWorkflow {
  const protectedAction =
    workflow.riskLevel === "high" ||
    /approval|client-facing|outbound|send|change|edit/i.test(workflow.approvalPolicy);

  const steps: HarnessWorkflow["steps"] = [
    {
      id: "step-1",
      title: `Open ${workflow.systems[0] ?? "browser workspace"}`,
      action: "navigate",
      target: process.env.BROWSER_AUTOMATION_BASE_URL ?? "about:blank",
      input: null,
      requiresApproval: false,
      verification: "Browser workspace opened successfully.",
    },
    {
      id: "step-2",
      title: `Collect ${targetCount} target items`,
      action: "custom",
      target: workflow.systems.join(", "),
      input: workflow.summary,
      requiresApproval: false,
      verification: `Loaded ${targetCount} target items for browser processing.`,
    },
    {
      id: "step-3",
      title: "Execute core browser automation",
      action: "custom",
      target: workflow.name,
      input: workflow.summary,
      requiresApproval: false,
      verification: "Primary browser automation tasks completed.",
    },
  ];

  if (verificationMode === "heavy") {
    steps.push({
      id: "step-4",
      title: "Run verification checkpoint",
      action: "assert_state",
      target: "body",
      input: null,
      requiresApproval: false,
      verification: "Browser state passed heavy verification.",
    });
  }

  if (protectedAction) {
    steps.push({
      id: "step-5",
      title: "Release protected action",
      action: "custom",
      target: workflow.approvalPolicy,
      input: workflow.summary,
      requiresApproval: true,
      verification: "Protected action released after explicit approval.",
    });
  }

  return {
    name: workflow.name,
    objective: workflow.summary,
    riskLevel: workflow.riskLevel,
    systems: workflow.systems,
    approvals: [workflow.approvalPolicy],
    steps,
    sourceTranscript: workflow.summary,
    model: "buildvora-runtime-v1",
    rawResponseId: null,
    builtAt: nowIso(),
  };
}

function createSimulatedBrowserAdapter() {
  let evidenceIndex = 0;
  return {
    async navigate() {
      return true;
    },
    async click() {
      return true;
    },
    async type() {
      return true;
    },
    async waitFor() {
      return true;
    },
    async assertState() {
      return true;
    },
    async captureEvidence(label: string) {
      const path = evidencePathForIndex(evidenceIndex);
      evidenceIndex += 1;
      return {
        label,
        path,
        kind: "simulated-evidence",
        capturedAt: nowIso(),
      };
    },
    async custom() {
      return true;
    },
  };
}

async function createRuntimeBrowserAdapter() {
  if (process.env.BROWSER_AUTOMATION_RUNTIME !== "playwright") {
    return {
      adapter: createSimulatedBrowserAdapter(),
      dispose: async () => undefined,
    };
  }

  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const adapter = createPlaywrightAdapter(page, {
    screenshotDir: process.env.BROWSER_AUTOMATION_SCREENSHOT_DIR ?? path.join(os.tmpdir(), "browser-automation-shots"),
    custom: async () => true,
  });

  return {
    adapter,
    dispose: async () => {
      await page.close();
      await browser.close();
    },
  };
}

function createPersistentCreditLedger() {
  return {
    getBalance(accountId: string) {
      const state = readState();
      return getBalanceFromLedger(state, accountId);
    },
    reserve(accountId: string, amount: number, metadata: Record<string, unknown> = {}) {
      const state = readState();
      const balance = getBalanceFromLedger(state, accountId);

      if (balance < amount) {
        throw new CreditLimitError(`Insufficient credits for account ${accountId}.`);
      }

      const holdId = `hold_${randomUUID()}`;
      const nextBalance = balance - amount;
      state.creditHolds.push({
        holdId,
        accountId,
        held: amount,
        balanceAfter: nextBalance,
        metadata,
        createdAt: nowIso(),
        status: "held",
      });
      state.creditLedger.unshift({
        id: `led_${randomUUID().slice(0, 8)}`,
        accountSlug: accountId,
        type: "hold",
        amount: -amount,
        balanceAfter: nextBalance,
        createdAt: nowIso(),
        note: `${metadata.workflow ?? "Workflow"} ${metadata.runId ?? ""} hold placed`.trim(),
        source: "run",
      });
      syncAccountDerivedFields(state);
      writeState(state);
      return { holdId, accountId, held: amount, balanceAfter: nextBalance, metadata };
    },
    hold(accountId: string, amount: number, metadata: Record<string, unknown> = {}) {
      return this.reserve(accountId, amount, metadata);
    },
    getHold(holdId: string) {
      const state = readState();
      return state.creditHolds.find((hold) => hold.holdId === holdId) ?? null;
    },
    capture(holdId: string, actualBurn: number, metadata: Record<string, unknown> = {}) {
      const state = readState();
      const hold = state.creditHolds.find((entry) => entry.holdId === holdId);

      if (!hold || hold.status !== "held") {
        throw new CreditLimitError(`Unknown or finalized credit hold ${holdId}.`);
      }

      const releaseAmount = Math.max(hold.held - actualBurn, 0);
      const debitAmount = Math.min(actualBurn, hold.held);
      let balance = getBalanceFromLedger(state, hold.accountId);

      if (releaseAmount > 0) {
        balance += releaseAmount;
        state.creditLedger.unshift({
          id: `led_${randomUUID().slice(0, 8)}`,
          accountSlug: hold.accountId,
          type: "release",
          amount: releaseAmount,
          balanceAfter: balance,
          createdAt: nowIso(),
          note: `${metadata.workflow ?? "Workflow"} ${metadata.runId ?? ""} released unused credits`.trim(),
          source: "run",
        });
      }

      state.creditLedger.unshift({
        id: `led_${randomUUID().slice(0, 8)}`,
        accountSlug: hold.accountId,
        type: "debit",
        amount: -debitAmount,
        balanceAfter: balance,
        createdAt: nowIso(),
        note: `${metadata.workflow ?? "Workflow"} ${metadata.runId ?? ""} finalized`.trim(),
        source: "run",
      });

      hold.status = "captured";
      hold.actualBurn = debitAmount;
      hold.released = releaseAmount;
      hold.balanceAfter = balance;
      syncAccountDerivedFields(state);
      writeState(state);

      return {
        holdId,
        actualBurn: debitAmount,
        released: releaseAmount,
        balanceAfter: balance,
      };
    },
  };
}

function createPersistentRunStore() {
  return {
    create(run: StoredRuntimeRun) {
      const state = readState();
      state.runtimeRuns = state.runtimeRuns.filter((current) => current.runId !== run.runId);
      state.runtimeRuns.unshift(run);
      syncPublicRunRecord(state, run);
      normalizeWorkerMetrics(state);
      writeState(state);
      return deepClone(run);
    },
    get(runId: string) {
      const state = readState();
      const run = state.runtimeRuns.find((current) => current.runId === runId);
      return run ? deepClone(run) : null;
    },
    update(runId: string, updates: Partial<StoredRuntimeRun>) {
      const state = readState();
      const index = state.runtimeRuns.findIndex((current) => current.runId === runId);
      if (index < 0) {
        throw new Error(`Unknown run ${runId}.`);
      }

      const next = {
        ...state.runtimeRuns[index],
        ...deepClone(updates),
      } as StoredRuntimeRun;
      state.runtimeRuns[index] = next;
      syncPublicRunRecord(state, next);
      normalizeWorkerMetrics(state);
      writeState(state);
      return deepClone(next);
    },
  };
}

function createApprovalService(accountSlug: string, workflowSlug: string, actor: string) {
  return {
    async requestApproval({
      runId,
      step,
    }: {
      runId: string;
      step: { id: string; title: string };
    }) {
      const state = readState();
      const existing = state.approvals.find(
        (approval) => approval.runId === runId && approval.stepLabel === step.title,
      );

      if (existing?.status === "approved") {
        return {
          approved: true,
          approver: existing.requestedFrom,
        };
      }

      if (existing?.status === "rejected") {
        return {
          denied: true,
          approver: existing.requestedFrom,
        };
      }

      if (!existing) {
        const workflow = state.workflows.find((item) => item.slug === workflowSlug);
        state.approvals.unshift({
          id: `apr_${randomUUID().slice(0, 8)}`,
          accountSlug,
          workflowSlug,
          runId,
          stepLabel: step.title,
          status: "pending",
          requestedAt: nowIso(),
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          requestedFrom: actor,
          context: workflow?.approvalPolicy ?? "Protected action requires explicit operator approval.",
          requiredRole: workflow?.riskLevel === "high" ? "Operator" : "Reviewer",
        });
        addAuditEvent(state, {
          accountSlug,
          actor: "system",
          event: "approval.requested",
          target: runId,
          severity: "warning",
          detail: `Approval requested for ${step.title}.`,
        });
        syncAccountDerivedFields(state);
        writeState(state);
      }

      return {
        pending: true,
      };
    },
  };
}

async function runHarnessForWorkflow(input: {
  accountSlug: string;
  actor: string;
  workflowSlug: string;
  targetCount: number;
  verificationMode: "standard" | "heavy";
}) {
  const state = readState();
  const workflow = state.workflows.find((item) => item.slug === input.workflowSlug);
  if (!workflow) {
    throw new Error("Workflow not found.");
  }

  const worker = selectWorker(state);
  const harnessWorkflow = createHarnessWorkflow(workflow, input.targetCount, input.verificationMode);
  const browserRuntime = await createRuntimeBrowserAdapter();
  const runStore = createPersistentRunStore();
  const creditLedger = createPersistentCreditLedger();
  const approvals = createApprovalService(input.accountSlug, input.workflowSlug, input.actor);

  try {
    const harness = new BrowserAutomationHarness({
      browser: browserRuntime.adapter,
      creditLedger,
      runStore,
      approvals,
    });

    const result = await harness.run({
      accountId: input.accountSlug,
      workflow: harnessWorkflow,
      actor: input.actor,
      runId: `run_${randomUUID().slice(0, 8)}`,
    });

    const nextState = readState();
    const runtimeRun = nextState.runtimeRuns.find((item) => item.runId === result.runId);
    if (runtimeRun) {
      runtimeRun.workflowSlug = input.workflowSlug;
      runtimeRun.workerId = worker.id;
      syncPublicRunRecord(nextState, runtimeRun);
      normalizeWorkerMetrics(nextState);
      addAuditEvent(nextState, {
        accountSlug: input.accountSlug,
        actor: input.actor,
        event: `run.${result.status}`,
        target: result.runId,
        severity: severityForStatus(result.status),
        detail: `${workflow.name} ${result.status}.`,
      });
      writeState(nextState);
    }

    return { result, workflow };
  } finally {
    await browserRuntime.dispose();
  }
}

export async function launchWorkflowRun(payload: LaunchPayload) {
  const preview = estimateRunLaunch(payload);
  if (!preview) {
    throw new Error("Workflow not found.");
  }

  const workflow = preview.workflow;
  const actor = payload.requestedBy ?? workflow.owner;
  const run = await runHarnessForWorkflow({
    accountSlug: workflow.accountSlug,
    actor,
    workflowSlug: payload.workflowSlug,
    targetCount: preview.targetCount,
    verificationMode: preview.verificationMode,
  });

  return {
    launch: preview,
    run: getRunById(run.result.runId),
  };
}

export async function resolveWorkflowApproval(payload: ApprovalDecisionPayload) {
  const state = readState();
  const approval = state.approvals.find((item) => item.id === payload.approvalId);
  if (!approval) {
    throw new Error("Approval not found.");
  }

  approval.status = payload.approved ? "approved" : "rejected";
  approval.requestedFrom = payload.approver ?? approval.requestedFrom;
  addAuditEvent(state, {
    accountSlug: approval.accountSlug,
    actor: payload.approver ?? "operator",
    event: payload.approved ? "approval.approved" : "approval.rejected",
    target: approval.runId,
    severity: payload.approved ? "info" : "warning",
    detail: `${approval.stepLabel} ${payload.approved ? "approved" : "rejected"}.`,
  });
  syncAccountDerivedFields(state);
  writeState(state);

  const runtimeRun = state.runtimeRuns.find((item) => item.runId === approval.runId);
  if (!runtimeRun) {
    return getRunById(approval.runId);
  }

  const browserRuntime = await createRuntimeBrowserAdapter();
  const runStore = createPersistentRunStore();
  const creditLedger = createPersistentCreditLedger();

  try {
    const harness = new BrowserAutomationHarness({
      browser: browserRuntime.adapter,
      creditLedger,
      runStore,
      approvals: createApprovalService(approval.accountSlug, approval.workflowSlug, payload.approver ?? "operator"),
    });

    await harness.resume(approval.runId, {
      approved: payload.approved,
      approver: payload.approver ?? "operator",
      notes: payload.notes ?? null,
    });
  } finally {
    await browserRuntime.dispose();
  }

  return getRunById(approval.runId);
}

export async function operateRun(payload: RunActionPayload) {
  const state = readState();
  const run = state.runs.find((item) => item.id === payload.runId);
  if (!run) {
    throw new Error("Run not found.");
  }

  if (payload.action === "pause" && ["queued", "running"].includes(run.status)) {
    run.status = "paused";
  } else if (payload.action === "cancel" && !["completed", "cancelled"].includes(run.status)) {
    run.status = "cancelled";
    run.completedAt = nowIso();
  } else if (payload.action === "retry") {
    run.status = "queued";
    run.completedAt = undefined;
    run.summary = `${run.summary} Retry queued by operator.`;
  }

  const runtimeRun = state.runtimeRuns.find((item) => item.runId === payload.runId);
  if (runtimeRun) {
    if (payload.action === "pause" && ["queued", "running"].includes(runtimeRun.status)) {
      runtimeRun.status = "paused";
      runtimeRun.result.status = "paused";
    } else if (payload.action === "cancel") {
      runtimeRun.status = "cancelled";
      runtimeRun.result.status = "cancelled";
      runtimeRun.result.completedAt = nowIso();
    } else if (payload.action === "retry") {
      runtimeRun.status = "queued";
      runtimeRun.currentStepIndex = 0;
      runtimeRun.pendingApproval = null;
      runtimeRun.result.status = "queued";
      runtimeRun.result.completedAt = null;
      runtimeRun.result.error = undefined;
      runtimeRun.result.stepResults = [];
      runtimeRun.result.evidence = [];
      runtimeRun.result.credits.actualBurn = 0;
      runtimeRun.result.credits.released = 0;
    }
  }

  syncWorkflowRunStatus(state, run.workflowSlug, run.status);
  normalizeWorkerMetrics(state);
  addAuditEvent(state, {
    accountSlug: run.accountSlug,
    actor: payload.actor ?? "operator",
    event: `run.${payload.action}`,
    target: run.id,
    severity: payload.action === "cancel" ? "critical" : "warning",
    detail: `${payload.action} applied to ${run.id}.`,
  });
  writeState(state);

  if (payload.action === "retry") {
    const workflow = state.workflows.find((item) => item.slug === run.workflowSlug);
    if (workflow) {
      return launchWorkflowRun({
        workflowSlug: workflow.slug,
        requestedBy: payload.actor ?? run.requestedBy,
        targetCount: 6,
        verificationMode: workflow.verificationMode.toLowerCase() === "heavy" ? "heavy" : "standard",
      });
    }
  }

  return getRunById(payload.runId);
}

export function operateConnection(payload: ConnectionActionPayload) {
  const state = readState();
  const connection = state.connections.find((item) => item.id === payload.connectionId);
  if (!connection) {
    throw new Error("Connection not found.");
  }

  if (payload.action === "reverify") {
    connection.status = "healthy";
    connection.lastVerifiedAt = nowIso();
  } else if (payload.action === "rotate") {
    connection.status = "needs_attention";
    connection.lastVerifiedAt = nowIso();
  }

  addAuditEvent(state, {
    accountSlug: connection.accountSlug,
    actor: payload.actor ?? "operator",
    event: `connection.${payload.action}`,
    target: connection.id,
    severity: payload.action === "rotate" ? "warning" : "info",
    detail: `${payload.action} applied to ${connection.provider}.`,
  });
  writeState(state);
  return connection;
}

export function operateWorker(payload: WorkerActionPayload) {
  const state = readState();
  const worker = state.workers.find((item) => item.id === payload.workerId);
  if (!worker) {
    throw new Error("Worker not found.");
  }

  if (payload.action === "drain") {
    worker.status = "degraded";
    worker.queueDepth = 0;
  } else if (payload.action === "restore") {
    worker.status = "healthy";
  }

  worker.lastHeartbeatAt = nowIso();
  addAuditEvent(state, {
    actor: payload.actor ?? "operator",
    event: `worker.${payload.action}`,
    target: worker.id,
    severity: payload.action === "drain" ? "warning" : "info",
    detail: `${payload.action} applied to ${worker.label}.`,
  });
  writeState(state);
  return worker;
}

function buildControlPlaneSnapshot(state: BrowserAutomationState) {
  const totalCreditsAvailable = state.accounts.reduce((sum, account) => sum + account.availableCredits, 0);
  const activeRuns = state.runs.filter((run) =>
    ["running", "awaiting_approval", "queued", "paused"].includes(run.status),
  ).length;
  const pendingApprovals = state.approvals.filter((approval) => approval.status === "pending").length;
  const monthlyRevenue = state.accounts.reduce((sum, account) => sum + account.monthlySpendUsd, 0);
  const degradedWorkers = state.workers.filter((worker) => worker.status !== "healthy").length;
  const queueDepth = state.workers.reduce((sum, worker) => sum + worker.queueDepth, 0);
  const drafts = state.workflows.filter((workflow) => workflow.state === "draft").length;
  const disconnectedConnections = state.connections.filter(
    (connection) => connection.status !== "healthy",
  ).length;

  return {
    totals: {
      accounts: state.accounts.length,
      workflows: state.workflows.length,
      activeRuns,
      pendingApprovals,
      totalCreditsAvailable,
      monthlyRevenue,
      degradedWorkers,
      queueDepth,
      drafts,
      disconnectedConnections,
    },
    accounts: state.accounts,
    workflows: state.workflows,
    runs: state.runs,
    approvals: state.approvals,
    workers: state.workers,
    auditEvents: state.auditEvents,
  };
}

export function getBrowserAutomationAccounts() {
  const state = readState();
  syncAccountDerivedFields(state);
  return state.accounts;
}

export function getBrowserAutomationWorkflows() {
  return readState().workflows;
}

export function getWorkflowVersions() {
  return readState().workflowVersions;
}

export function getBrowserAutomationRuns() {
  return readState().runs;
}

export function getBrowserAutomationApprovals() {
  return readState().approvals;
}

export function getBrowserAutomationConnections() {
  return readState().connections;
}

export function getCreditLedgerEntries() {
  return readState().creditLedger;
}

export function getWorkerNodes() {
  return readState().workers;
}

export function getAuditEvents() {
  return readState().auditEvents;
}

export function getAccountBySlug(accountSlug: string) {
  return readState().accounts.find((account) => account.slug === accountSlug) ?? null;
}

export function getWorkflowBySlug(workflowSlug: string) {
  return readState().workflows.find((workflow) => workflow.slug === workflowSlug) ?? null;
}

export function getWorkflowVersionsBySlug(workflowSlug: string) {
  return readState().workflowVersions.filter((version) => version.workflowSlug === workflowSlug);
}

export function getRunById(runId: string) {
  return readState().runs.find((run) => run.id === runId) ?? null;
}

export function getPrimaryWorkspaceAccount() {
  return getBrowserAutomationAccounts()[0];
}

export function getAccountWorkflows(accountSlug: string) {
  return readState().workflows.filter((workflow) => workflow.accountSlug === accountSlug);
}

export function getAccountRuns(accountSlug: string) {
  return readState().runs.filter((run) => run.accountSlug === accountSlug);
}

export function getAccountApprovals(accountSlug: string) {
  return readState().approvals.filter((approval) => approval.accountSlug === accountSlug);
}

export function getAccountConnections(accountSlug: string) {
  return readState().connections.filter((connection) => connection.accountSlug === accountSlug);
}

export function getAccountLedger(accountSlug: string) {
  return readState().creditLedger.filter((entry) => entry.accountSlug === accountSlug);
}

export function getAccountAuditEvents(accountSlug: string) {
  return readState().auditEvents.filter((event) => event.accountSlug === accountSlug);
}

export function getWorkerById(workerId: string) {
  return readState().workers.find((worker) => worker.id === workerId) ?? null;
}

export function getAdminControlPlaneSnapshot() {
  const state = readState();
  syncAccountDerivedFields(state);
  normalizeWorkerMetrics(state);
  return buildControlPlaneSnapshot(state);
}

export function estimateRunLaunch(input: {
  workflowSlug: string;
  targetCount?: number;
  verificationMode?: "standard" | "heavy";
}) {
  const workflow = getWorkflowBySlug(input.workflowSlug);

  if (!workflow) {
    return null;
  }

  const targetCount = Math.max(1, Math.min(input.targetCount ?? 6, 50));
  const verificationMode = input.verificationMode ?? "standard";
  const baseCredits = workflow.riskLevel === "high" ? 28 : workflow.riskLevel === "medium" ? 18 : 12;
  const stepCredits = targetCount * (workflow.riskLevel === "high" ? 5 : 3);
  const verificationCredits = verificationMode === "heavy" ? 18 : 8;
  const approvalReserve = workflow.riskLevel === "high" ? 12 : 4;
  const estimatedCredits = baseCredits + stepCredits + verificationCredits + approvalReserve;
  const estimatedVendorCostUsd = Number((estimatedCredits * 0.17).toFixed(2));

  return {
    workflow,
    targetCount,
    verificationMode,
    estimatedCredits,
    estimatedVendorCostUsd,
    holdCredits: estimatedCredits,
    projectedStatus: workflow.riskLevel === "high" ? "may_pause_for_approval" : "launch_ready",
  };
}

export function grantCreditsToAccount(input: {
  accountSlug: string;
  amount: number;
  note: string;
  source?: "billing" | "admin";
  actor?: string;
  externalRef?: string;
}) {
  const state = readState();
  const account = state.accounts.find((item) => item.slug === input.accountSlug);

  if (!account) {
    throw new Error("Account not found.");
  }

  const externalRef = input.externalRef ?? null;

  if (
    externalRef &&
    state.creditLedger.some(
      (entry) =>
        entry.accountSlug === input.accountSlug &&
        entry.note.includes(externalRef),
    )
  ) {
    return state.accounts.find((item) => item.slug === input.accountSlug) ?? account;
  }

  const balance = getBalanceFromLedger(state, input.accountSlug);
  const nextBalance = balance + input.amount;

  state.creditLedger.unshift({
    id: `led_${randomUUID().slice(0, 8)}`,
    accountSlug: input.accountSlug,
    type: "grant",
    amount: input.amount,
    balanceAfter: nextBalance,
    createdAt: nowIso(),
    note: externalRef ? `${input.note} [ref:${externalRef}]` : input.note,
    source: input.source ?? "billing",
  });

  addAuditEvent(state, {
    accountSlug: input.accountSlug,
    actor: input.actor ?? "billing",
    event: "credits.granted",
    target: input.accountSlug,
    severity: "info",
    detail: `${input.amount} credits added to ${account.name}.`,
  });

  syncAccountDerivedFields(state);
  writeState(state);
  return state.accounts.find((item) => item.slug === input.accountSlug) ?? account;
}

export function activateAccountBilling(input: {
  accountSlug: string;
  billingPlan: string;
  actor?: string;
  note?: string;
  externalRef?: string;
}) {
  const state = readState();
  const account = state.accounts.find((item) => item.slug === input.accountSlug);
  const externalRef = input.externalRef ?? null;

  if (!account) {
    throw new Error("Account not found.");
  }

  if (
    externalRef &&
    state.auditEvents.some(
      (event) =>
        event.accountSlug === input.accountSlug &&
        event.event === "billing.activated" &&
        event.detail.includes(externalRef),
    )
  ) {
    return account;
  }

  if (input.billingPlan === "operator") {
    account.planName = "Operator";
    account.monthlyCredits = 1800;
  } else if (input.billingPlan === "scale") {
    account.planName = "Scale";
    account.monthlyCredits = 4800;
  }

  addAuditEvent(state, {
    accountSlug: input.accountSlug,
    actor: input.actor ?? "billing",
    event: "billing.activated",
    target: input.accountSlug,
    severity: "info",
    detail: `${input.note ?? `${input.billingPlan} plan activated.`}${externalRef ? ` [ref:${externalRef}]` : ""}`,
  });

  writeState(state);
  return account;
}

export function getBillingAuditEvents(accountSlug?: string) {
  return readState().auditEvents.filter(
    (event) =>
      (!accountSlug || event.accountSlug === accountSlug) &&
      (event.event.startsWith("billing.") || event.event.startsWith("credits.")),
  );
}

export type {
  AuditEvent,
  AuditSeverity,
  BrowserAutomationAccount,
  BrowserAutomationApproval,
  BrowserAutomationConnection,
  BrowserAutomationRun,
  BrowserAutomationWorkflow,
  ConnectionStatus,
  CreditLedgerEntry,
  RiskLevel,
  RunStatus,
  WorkerNode,
  WorkflowVersion,
};
