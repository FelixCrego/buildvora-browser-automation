import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import postgres, { type Sql } from "postgres";
import {
  BrowserAutomationHarness,
  createPlaywrightAdapter,
  CreditLimitError,
} from "@buildvora/browser-automation";
import {
  CREDIT_EXPLAINER,
  TRIAL_POLICY,
  getBillingProviderLabel,
  getPayPalEnvironment,
  getPublicPayPalClientId,
  isPayPalConfigured,
} from "./browserAutomationBilling";
import type { BrowserAutomationSession } from "./browserAutomationAuth";
import type {
  AuditEvent,
  AuditSeverity,
  BillingState,
  BrowserAutomationAccount,
  BrowserAutomationApproval,
  BrowserAutomationConnection,
  BrowserAutomationRun,
  BrowserAutomationWorkflow,
  ConnectionStatus,
  CreditLedgerEntry,
  PlanType,
  RiskLevel,
  RunClass,
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

type RunMeteringEstimate = {
  runClass: RunClass;
  estimatedCredits: number;
  holdCredits: number;
  estimatedVendorCostUsd: number;
  breakdown: Array<{ label: string; credits: number }>;
  explanation: string;
};

type AdminEconomicsSnapshot = {
  totals: {
    mrrUsd: number;
    creditsSold: number;
    creditsBurned: number;
    creditsGranted: number;
    trialAccounts: number;
    activeAccounts: number;
    trialToPaidConversionRate: number;
    averageCreditsPerRun: number;
    averageRevenuePerRunUsd: number;
    averageCostPerRunUsd: number;
    grossMarginUsd: number;
  };
  runsByClass: Array<{
    runClass: RunClass;
    runs: number;
    creditsBurned: number;
    revenueUsd: number;
    costUsd: number;
    grossMarginUsd: number;
  }>;
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

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function plusDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function resolveWorkspaceIdentity(input: { email: string; workspaceCode: string }, state: BrowserAutomationState) {
  const normalizedCode = input.workspaceCode.trim().toUpperCase();
  const normalizedEmail = input.email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1] ?? "client-workspace.local";

  if (normalizedCode.startsWith("NSC") || domain.includes("northshore")) {
    return {
      accountSlug: state.accounts.find((account) => account.slug === "northshore-clinics")?.slug ?? "northshore-clinics",
      isExisting: true,
    };
  }

  if (normalizedCode.startsWith("HLG") || normalizedCode.startsWith("HARBOR") || domain.includes("harbor")) {
    return {
      accountSlug: state.accounts.find((account) => account.slug === "harbor-legal-group")?.slug ?? "harbor-legal-group",
      isExisting: true,
    };
  }

  return {
    accountSlug: `${slugify(domain.replace(/\.[a-z]+$/i, "")) || "trial-workspace"}-${slugify(normalizedCode).slice(0, 10) || "trial"}`,
    isExisting: false,
  };
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

function getManagedStateDatabaseUrl() {
  return readEnv("BROWSER_AUTOMATION_DATABASE_URL")
    || readEnv("POSTGRES_URL")
    || readEnv("DATABASE_URL");
}

function shouldUseManagedStateStore() {
  return Boolean(getManagedStateDatabaseUrl());
}

let postgresClient: Sql | null = null;
let managedStateInitPromise: Promise<void> | null = null;
let inMemoryFallbackState: BrowserAutomationState | null = null;

function getPostgresClient() {
  if (!postgresClient) {
    postgresClient = postgres(getManagedStateDatabaseUrl(), {
      max: 1,
      prepare: false,
      idle_timeout: 5,
      connect_timeout: 10,
    });
  }

  return postgresClient;
}

async function readLocalState(): Promise<BrowserAutomationState> {
  if (!inMemoryFallbackState) {
    inMemoryFallbackState = buildSeedState();
  }

  return deepClone(inMemoryFallbackState);
}

async function writeLocalState(state: BrowserAutomationState) {
  inMemoryFallbackState = deepClone(state);
}

async function ensureManagedStateTable() {
  if (managedStateInitPromise) {
    return managedStateInitPromise;
  }

  const sql = getPostgresClient();
  managedStateInitPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS browser_automation_state_store (
        key TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })();

  try {
    await managedStateInitPromise;
  } catch (error) {
    managedStateInitPromise = null;
    throw error;
  }
}

async function readManagedState(): Promise<BrowserAutomationState> {
  await ensureManagedStateTable();
  const sql = getPostgresClient();
  const rows = await sql<{ json: string }[]>`
    SELECT json
    FROM browser_automation_state_store
    WHERE key = 'browser-automation-state'
    LIMIT 1
  `;

  if (rows.length === 0) {
    const seed = buildSeedState();
    await writeManagedState(seed);
    return seed;
  }

  return JSON.parse(rows[0].json) as BrowserAutomationState;
}

async function writeManagedState(state: BrowserAutomationState) {
  await ensureManagedStateTable();
  const sql = getPostgresClient();
  await sql`
    INSERT INTO browser_automation_state_store (key, json, updated_at)
    VALUES ('browser-automation-state', ${JSON.stringify(state)}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET json = EXCLUDED.json, updated_at = EXCLUDED.updated_at
  `;
}

async function readState(): Promise<BrowserAutomationState> {
  if (shouldUseManagedStateStore()) {
    return readManagedState();
  }

  return readLocalState();
}

async function writeState(state: BrowserAutomationState) {
  if (shouldUseManagedStateStore()) {
    await writeManagedState(state);
    return;
  }

  await writeLocalState(state);
}

export async function getLaunchDiagnostics() {
  const storageMode = shouldUseManagedStateStore() ? "postgres" : "local-fallback";
  const playwrightRuntimeEnabled = readEnv("BROWSER_AUTOMATION_RUNTIME") === "playwright";
  const openAiConfigured = Boolean(readEnv("OPENAI_API_KEY"));
  const paypalConfigured = isPayPalConfigured();
  const managedDatabaseConfigured = Boolean(getManagedStateDatabaseUrl());
  let databaseStatus: "ready" | "error" = "ready";
  let databaseMessage = "State store reachable.";
  let stateSnapshot: {
    accounts: number;
    workflows: number;
    runs: number;
    approvals: number;
  } | null = null;

  try {
    const state = await readState();
    stateSnapshot = {
      accounts: state.accounts.length,
      workflows: state.workflows.length,
      runs: state.runs.length,
      approvals: state.approvals.length,
    };
  } catch (error) {
    databaseStatus = "error";
    databaseMessage = error instanceof Error ? error.message : "Unknown state store error.";
  }

  const blockers: string[] = [];
  const actions: string[] = [];

  if (!managedDatabaseConfigured) {
    blockers.push("Managed Postgres is not configured.");
    actions.push("Set BROWSER_AUTOMATION_DATABASE_URL or DATABASE_URL in Vercel.");
  }

  if (!paypalConfigured) {
    blockers.push("PayPal live credentials are missing.");
    actions.push("Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, and live plan IDs.");
  }

  if (!openAiConfigured) {
    blockers.push("OPENAI_API_KEY is missing.");
    actions.push("Add OPENAI_API_KEY and, optionally, BROWSER_AUTOMATION_MODEL to Vercel.");
  }

  if (!playwrightRuntimeEnabled) {
    blockers.push("Browser runtime is still set to simulated mode.");
    actions.push("Set BROWSER_AUTOMATION_RUNTIME=playwright in Vercel to enable live browser execution.");
  }

  if (databaseStatus !== "ready") {
    blockers.push("Managed state store is not reachable.");
    actions.push("Check Neon connectivity and the configured Postgres URL.");
  }

  const launchReady = blockers.length === 0;

  return {
    checkedAt: nowIso(),
    launchReady,
    blockers,
    actions,
    storageMode,
    database: {
      status: databaseStatus,
      message:
        storageMode === "local-fallback"
          ? "Managed database not configured. Using in-memory fallback state for this process."
          : databaseMessage,
      managedUrlPresent: Boolean(getManagedStateDatabaseUrl()),
      snapshot: stateSnapshot,
    },
    billing: {
      provider: getBillingProviderLabel(),
      paypalConfigured,
      paypalEnvironment: getPayPalEnvironment(),
      paypalClientIdPresent: Boolean(getPublicPayPalClientId()),
    },
    runtime: {
      browserRuntime: playwrightRuntimeEnabled ? "playwright" : "simulated",
      openAiConfigured,
      workerMode: playwrightRuntimeEnabled ? "live-browser" : "simulated-browser",
      model: readEnv("BROWSER_AUTOMATION_MODEL") || "gpt-5.5",
    },
  };
}

function getBalanceFromLedger(state: BrowserAutomationState, accountSlug: string) {
  return state.creditLedger
    .filter((entry) => entry.accountSlug === accountSlug)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function syncAccountLifecycle(state: BrowserAutomationState) {
  const now = Date.now();

  for (const account of state.accounts) {
    if (account.planType === "trial") {
      const trialExpiresAt = account.trialExpiresAt ? Date.parse(account.trialExpiresAt) : null;
      const trialExpired = trialExpiresAt !== null && trialExpiresAt <= now;

      account.trialCreditsRemaining = Math.max(0, Math.min(account.trialCreditsTotal, getBalanceFromLedger(state, account.slug)));
      account.canPublish = false;
      account.concurrencyLimit = TRIAL_POLICY.maxConcurrentRuns;

      if (trialExpired) {
        account.billingStatus = "inactive";
        account.status = "restricted";
      } else {
        account.billingStatus = "trialing";
        account.status = "trial";
      }
    } else if (account.billingStatus !== "past_due") {
      account.billingStatus = "active";
      account.status = "active";
      account.canPublish = true;
    }
  }
}

function syncAccountDerivedFields(state: BrowserAutomationState) {
  syncAccountLifecycle(state);

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
  const runtimeSeconds =
    runtimeRun.result.completedAt
      ? Math.max(
          1,
          Math.round(
            (Date.parse(runtimeRun.result.completedAt) - Date.parse(runtimeRun.result.startedAt)) / 1000,
          ),
        )
      : Math.max(60, runtimeRun.result.stepResults.length * 90);
  const runClass: RunClass =
    runtimeRun.result.credits.estimated <= 12
      ? "light"
      : runtimeRun.result.credits.estimated <= 22
        ? "standard"
        : "heavy";
  const runRecord: BrowserAutomationRun = {
    id: runtimeRun.runId,
    accountSlug: runtimeRun.accountId,
    workflowSlug: runtimeRun.workflowSlug,
    requestedBy: runtimeRun.actor,
    runClass,
    status: runtimeRun.result.status,
    startedAt: runtimeRun.result.startedAt,
    completedAt: runtimeRun.result.completedAt ?? undefined,
    estimatedCredits: runtimeRun.result.credits.estimated,
    actualCredits: runtimeRun.result.credits.actualBurn,
    runtimeSeconds,
    retryCount: 0,
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
  if (readEnv("BROWSER_AUTOMATION_RUNTIME") !== "playwright") {
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
    async getBalance(accountId: string) {
      const state = await readState();
      return getBalanceFromLedger(state, accountId);
    },
    async reserve(accountId: string, amount: number, metadata: Record<string, unknown> = {}) {
      const state = await readState();
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
      await writeState(state);
      return { holdId, accountId, held: amount, balanceAfter: nextBalance, metadata };
    },
    hold(accountId: string, amount: number, metadata: Record<string, unknown> = {}) {
      return this.reserve(accountId, amount, metadata);
    },
    async getHold(holdId: string) {
      const state = await readState();
      return state.creditHolds.find((hold) => hold.holdId === holdId) ?? null;
    },
    async capture(holdId: string, actualBurn: number, metadata: Record<string, unknown> = {}) {
      const state = await readState();
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
      await writeState(state);

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
    async create(run: StoredRuntimeRun) {
      const state = await readState();
      state.runtimeRuns = state.runtimeRuns.filter((current) => current.runId !== run.runId);
      state.runtimeRuns.unshift(run);
      syncPublicRunRecord(state, run);
      normalizeWorkerMetrics(state);
      await writeState(state);
      return deepClone(run);
    },
    async get(runId: string) {
      const state = await readState();
      const run = state.runtimeRuns.find((current) => current.runId === runId);
      return run ? deepClone(run) : null;
    },
    async update(runId: string, updates: Partial<StoredRuntimeRun>) {
      const state = await readState();
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
      await writeState(state);
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
      const state = await readState();
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
        await writeState(state);
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
  const state = await readState();
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

    const nextState = await readState();
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
      await writeState(nextState);
    }

    return { result, workflow };
  } finally {
    await browserRuntime.dispose();
  }
}

export async function launchWorkflowRun(payload: LaunchPayload) {
  const preview = await estimateRunLaunch(payload);
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
    run: await getRunById(run.result.runId),
  };
}

export async function resolveWorkflowApproval(payload: ApprovalDecisionPayload) {
  const state = await readState();
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
  await writeState(state);

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
  const state = await readState();
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
  await writeState(state);

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

export async function operateConnection(payload: ConnectionActionPayload) {
  const state = await readState();
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
  await writeState(state);
  return connection;
}

export async function operateWorker(payload: WorkerActionPayload) {
  const state = await readState();
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
  await writeState(state);
  return worker;
}

function buildControlPlaneSnapshot(state: BrowserAutomationState) {
  const totalCreditsAvailable = state.accounts.reduce((sum, account) => sum + account.availableCredits, 0);
  const activeRuns = state.runs.filter((run) =>
    ["running", "awaiting_approval", "queued", "paused"].includes(run.status),
  ).length;
  const pendingApprovals = state.approvals.filter((approval) => approval.status === "pending").length;
  const monthlyRevenue = state.accounts.reduce((sum, account) => sum + getPlanRevenueMonthly(account), 0);
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

export async function getBrowserAutomationAccounts() {
  const state = await readState();
  syncAccountDerivedFields(state);
  return state.accounts;
}

export async function getBrowserAutomationWorkflows() {
  return (await readState()).workflows;
}

export async function getWorkflowVersions() {
  return (await readState()).workflowVersions;
}

export async function getBrowserAutomationRuns() {
  return (await readState()).runs;
}

export async function getBrowserAutomationApprovals() {
  return (await readState()).approvals;
}

export async function getBrowserAutomationConnections() {
  return (await readState()).connections;
}

export async function getCreditLedgerEntries() {
  return (await readState()).creditLedger;
}

export async function getWorkerNodes() {
  return (await readState()).workers;
}

export async function getAuditEvents() {
  return (await readState()).auditEvents;
}

export async function getAccountBySlug(accountSlug: string) {
  const state = await readState();
  syncAccountDerivedFields(state);
  return state.accounts.find((account) => account.slug === accountSlug) ?? null;
}

export async function getWorkflowBySlug(workflowSlug: string) {
  return (await readState()).workflows.find((workflow) => workflow.slug === workflowSlug) ?? null;
}

export async function getWorkflowVersionsBySlug(workflowSlug: string) {
  return (await readState()).workflowVersions.filter((version) => version.workflowSlug === workflowSlug);
}

export async function getRunById(runId: string) {
  return (await readState()).runs.find((run) => run.id === runId) ?? null;
}

export async function getPrimaryWorkspaceAccount() {
  return (await getBrowserAutomationAccounts())[0];
}

export async function resolveWorkspaceAccount(session: BrowserAutomationSession | null) {
  if (!session) {
    return getPrimaryWorkspaceAccount();
  }

  const existing = await getAccountBySlug(session.accountSlug);
  if (existing) {
    return existing;
  }

  return {
    id: `acct_${session.accountSlug}`,
    slug: session.accountSlug,
    name: session.accountName ?? "Client Workspace",
    vertical: session.planType === "trial" ? "Self-Serve Trial" : "Browser Automation",
    planType: session.planType ?? "trial",
    planName: session.planName ?? "Free Trial",
    billingStatus: session.billingStatus,
    monthlyCredits: session.monthlyCredits ?? session.trialCreditsTotal ?? 0,
    availableCredits: session.availableCredits ?? session.trialCreditsRemaining ?? 0,
    softLimitCredits: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
    monthlySpendUsd: 0,
    renewalDate: session.trialExpiresAt?.slice(0, 10) ?? nowIso().slice(0, 10),
    seats: 1,
    status: session.billingStatus === "trialing" ? "trial" : session.billingStatus === "active" ? "active" : "restricted",
    concurrencyLimit: session.concurrencyLimit ?? 1,
    canPublish: session.canPublish ?? false,
    trialStartedAt: session.signedInAt,
    trialExpiresAt: session.trialExpiresAt,
    trialCreditsTotal: session.trialCreditsTotal ?? 0,
    trialCreditsRemaining: session.trialCreditsRemaining ?? 0,
  } satisfies BrowserAutomationAccount;
}

export async function ensureWorkspaceAccount(input: { email: string; workspaceCode: string }) {
  const state = await readState();
  syncAccountDerivedFields(state);

  const identity = resolveWorkspaceIdentity(input, state);
  const existing = state.accounts.find((account) => account.slug === identity.accountSlug);
  if (existing) {
    return existing;
  }

  const domain = input.email.trim().toLowerCase().split("@")[1] ?? "client-workspace.local";
  const accountName = `${domain.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())} Trial Workspace`;
  const startedAt = nowIso();
  const expiresAt = plusDaysIso(TRIAL_POLICY.durationDays);

  const trialAccount: BrowserAutomationAccount = {
    id: `acct_${randomUUID().slice(0, 8)}`,
    slug: identity.accountSlug,
    name: accountName,
    vertical: "Self-Serve Trial",
    planType: "trial",
    planName: "Free Trial",
    billingStatus: "trialing",
    monthlyCredits: TRIAL_POLICY.credits,
    availableCredits: 0,
    softLimitCredits: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
    monthlySpendUsd: 0,
    renewalDate: expiresAt.slice(0, 10),
    seats: 1,
    status: "trial",
    concurrencyLimit: TRIAL_POLICY.maxConcurrentRuns,
    canPublish: false,
    trialStartedAt: startedAt,
    trialExpiresAt: expiresAt,
    trialCreditsTotal: TRIAL_POLICY.credits,
    trialCreditsRemaining: TRIAL_POLICY.credits,
  };

  state.accounts.unshift(trialAccount);
  state.creditLedger.unshift({
    id: `led_${randomUUID().slice(0, 8)}`,
    accountSlug: trialAccount.slug,
    type: "grant",
    amount: TRIAL_POLICY.credits,
    balanceAfter: TRIAL_POLICY.credits,
    createdAt: startedAt,
    note: `${TRIAL_POLICY.durationDays}-day free trial credit grant`,
    source: "billing",
  });
  state.auditEvents.unshift({
    id: `aud_${randomUUID().slice(0, 8)}`,
    accountSlug: trialAccount.slug,
    actor: "system",
    event: "trial.started",
    target: trialAccount.slug,
    createdAt: startedAt,
    severity: "info",
    detail: `${TRIAL_POLICY.credits} trial credits granted through the ${TRIAL_POLICY.durationDays}-day self-serve trial.`,
  });

  syncAccountDerivedFields(state);
  await writeState(state);
  return state.accounts.find((account) => account.slug === trialAccount.slug) ?? trialAccount;
}

export async function getAccountWorkflows(accountSlug: string) {
  return (await readState()).workflows.filter((workflow) => workflow.accountSlug === accountSlug);
}

export async function getAccountRuns(accountSlug: string) {
  return (await readState()).runs.filter((run) => run.accountSlug === accountSlug);
}

export async function getAccountApprovals(accountSlug: string) {
  return (await readState()).approvals.filter((approval) => approval.accountSlug === accountSlug);
}

export async function getAccountConnections(accountSlug: string) {
  return (await readState()).connections.filter((connection) => connection.accountSlug === accountSlug);
}

export async function getAccountLedger(accountSlug: string) {
  return (await readState()).creditLedger.filter((entry) => entry.accountSlug === accountSlug);
}

export async function getAccountAuditEvents(accountSlug: string) {
  return (await readState()).auditEvents.filter((event) => event.accountSlug === accountSlug);
}

export async function getWorkerById(workerId: string) {
  return (await readState()).workers.find((worker) => worker.id === workerId) ?? null;
}

export async function getAdminControlPlaneSnapshot() {
  const state = await readState();
  syncAccountDerivedFields(state);
  normalizeWorkerMetrics(state);
  return buildControlPlaneSnapshot(state);
}

function inferApprovalCount(workflow: BrowserAutomationWorkflow) {
  if (workflow.riskLevel === "high" || !/no approval needed/i.test(workflow.approvalPolicy)) {
    return 1;
  }

  return 0;
}

function estimateMeteringForWorkflow(input: {
  workflow: BrowserAutomationWorkflow;
  targetCount: number;
  verificationMode: "standard" | "heavy";
}): RunMeteringEstimate {
  const { workflow, targetCount, verificationMode } = input;
  const executionBlocks = Math.max(1, Math.ceil(targetCount / 4));
  const stepRate = workflow.riskLevel === "high" ? 3 : workflow.riskLevel === "medium" ? 2 : 1;
  const approvalCount = inferApprovalCount(workflow);
  const launchFee = 5;
  const stepCredits = executionBlocks * stepRate;
  const verificationCredits = verificationMode === "heavy" ? 5 : 2;
  const approvalCredits = approvalCount * CREDIT_EXPLAINER.approvalCheckpoint;
  const runtimeBandCredits = targetCount > 20 ? 7 : targetCount > 10 ? 3 : 0;
  const estimatedCredits = launchFee + stepCredits + verificationCredits + approvalCredits + runtimeBandCredits;
  const runClass: RunClass =
    estimatedCredits <= 12 ? "light" : estimatedCredits <= 22 ? "standard" : "heavy";
  const runClassFloor =
    runClass === "light"
      ? CREDIT_EXPLAINER.lightRun
      : runClass === "standard"
        ? CREDIT_EXPLAINER.standardRun
        : CREDIT_EXPLAINER.heavyRun;
  const finalCredits = Math.max(estimatedCredits, runClassFloor);
  const breakdown = [
    { label: "Launch fee", credits: launchFee },
    { label: `${executionBlocks} execution blocks`, credits: stepCredits },
    { label: verificationMode === "heavy" ? "Heavy verification" : "Standard verification", credits: verificationCredits },
    ...(approvalCredits > 0 ? [{ label: `${approvalCount} approval gate`, credits: approvalCredits }] : []),
    ...(runtimeBandCredits > 0 ? [{ label: "Extended runtime buffer", credits: runtimeBandCredits }] : []),
  ];

  return {
    runClass,
    estimatedCredits: finalCredits,
    holdCredits: finalCredits,
    estimatedVendorCostUsd: Number((finalCredits * 0.17).toFixed(2)),
    breakdown,
    explanation:
      runClass === "light"
        ? "Short browser task with standard verification."
        : runClass === "standard"
          ? "Multi-step browser run with moderate verification or approval needs."
          : "Longer or sensitive browser run with deeper verification, runtime buffer, or approval controls.",
  };
}

function getPlanRevenueMonthly(account: BrowserAutomationAccount) {
  const monthlyRevenueByPlan: Record<PlanType, number> = {
    trial: 0,
    starter: 99,
    operator: 499,
    scale: 1499,
  };

  return monthlyRevenueByPlan[account.planType] ?? account.monthlySpendUsd;
}

function getRevenuePerCredit(account: BrowserAutomationAccount) {
  if (account.planType === "trial") {
    return 0;
  }

  if (account.planType === "starter") {
    return 0.99;
  }

  if (account.planType === "scale") {
    return 0.75;
  }

  return 0.83;
}

export async function getAdminEconomicsSnapshot(): Promise<AdminEconomicsSnapshot> {
  const state = await readState();
  syncAccountDerivedFields(state);

  const runs = state.runs.filter((run) => run.actualCredits > 0);
  const creditsBurned = runs.reduce((sum, run) => sum + run.actualCredits, 0);
  const creditsGranted = state.creditLedger.filter((entry) => entry.type === "grant").reduce((sum, entry) => sum + entry.amount, 0);
  const creditsSold = state.creditLedger.filter((entry) => entry.source === "billing" && entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
  const mrrUsd = state.accounts.reduce((sum, account) => sum + getPlanRevenueMonthly(account), 0);
  const trialAccounts = state.accounts.filter((account) => account.planType === "trial").length;
  const activeAccounts = state.accounts.filter((account) => account.planType !== "trial").length;
  const revenueByRuns = runs.reduce((sum, run) => {
    const account = state.accounts.find((item) => item.slug === run.accountSlug);
    return sum + run.actualCredits * (account ? getRevenuePerCredit(account) : 1);
  }, 0);
  const costByRuns = runs.reduce((sum, run) => sum + run.vendorCostUsd, 0);

  const runsByClass = (["light", "standard", "heavy"] as RunClass[]).map((runClass) => {
    const classRuns = runs.filter((run) => run.runClass === runClass);
    const credits = classRuns.reduce((sum, run) => sum + run.actualCredits, 0);
    const cost = classRuns.reduce((sum, run) => sum + run.vendorCostUsd, 0);
    const revenue = classRuns.reduce((sum, run) => {
      const account = state.accounts.find((item) => item.slug === run.accountSlug);
      return sum + run.actualCredits * (account ? getRevenuePerCredit(account) : 1);
    }, 0);

    return {
      runClass,
      runs: classRuns.length,
      creditsBurned: credits,
      revenueUsd: Number(revenue.toFixed(2)),
      costUsd: Number(cost.toFixed(2)),
      grossMarginUsd: Number((revenue - cost).toFixed(2)),
    };
  });

  return {
    totals: {
      mrrUsd,
      creditsSold,
      creditsBurned,
      creditsGranted,
      trialAccounts,
      activeAccounts,
      trialToPaidConversionRate: Number(
        ((activeAccounts / Math.max(activeAccounts + trialAccounts, 1)) * 100).toFixed(1),
      ),
      averageCreditsPerRun: Number((creditsBurned / Math.max(runs.length, 1)).toFixed(1)),
      averageRevenuePerRunUsd: Number((revenueByRuns / Math.max(runs.length, 1)).toFixed(2)),
      averageCostPerRunUsd: Number((costByRuns / Math.max(runs.length, 1)).toFixed(2)),
      grossMarginUsd: Number((revenueByRuns - costByRuns).toFixed(2)),
    },
    runsByClass,
  };
}

export async function estimateRunLaunch(input: {
  workflowSlug: string;
  targetCount?: number;
  verificationMode?: "standard" | "heavy";
}) {
  const workflow = await getWorkflowBySlug(input.workflowSlug);

  if (!workflow) {
    return null;
  }

  const targetCount = Math.max(1, Math.min(input.targetCount ?? 6, 50));
  const verificationMode = input.verificationMode ?? "standard";
  const metering = estimateMeteringForWorkflow({
    workflow,
    targetCount,
    verificationMode,
  });

  return {
    workflow,
    targetCount,
    verificationMode,
    runClass: metering.runClass,
    estimatedCredits: metering.estimatedCredits,
    estimatedVendorCostUsd: metering.estimatedVendorCostUsd,
    holdCredits: metering.holdCredits,
    breakdown: metering.breakdown,
    explanation: metering.explanation,
    projectedStatus: workflow.riskLevel === "high" ? "may_pause_for_approval" : "launch_ready",
  };
}

export async function grantCreditsToAccount(input: {
  accountSlug: string;
  amount: number;
  note: string;
  source?: "billing" | "admin";
  actor?: string;
  externalRef?: string;
}) {
  const state = await readState();
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
  await writeState(state);
  return state.accounts.find((item) => item.slug === input.accountSlug) ?? account;
}

export async function spendCreditsFromAccount(input: {
  accountSlug: string;
  amount: number;
  note: string;
  actor?: string;
  source?: "billing" | "run" | "admin";
  externalRef?: string;
}) {
  const state = await readState();
  const account = state.accounts.find((item) => item.slug === input.accountSlug);

  if (!account) {
    throw new Error("Account not found.");
  }

  if (input.amount <= 0) {
    throw new Error("Debit amount must be positive.");
  }

  const externalRef = input.externalRef ?? null;
  if (
    externalRef &&
    state.creditLedger.some(
      (entry) => entry.accountSlug === input.accountSlug && entry.note.includes(externalRef),
    )
  ) {
    return state.accounts.find((item) => item.slug === input.accountSlug) ?? account;
  }

  const balance = getBalanceFromLedger(state, input.accountSlug);
  if (balance < input.amount) {
    throw new CreditLimitError(`Insufficient credits for ${input.accountSlug}.`);
  }

  const nextBalance = balance - input.amount;
  state.creditLedger.unshift({
    id: `led_${randomUUID().slice(0, 8)}`,
    accountSlug: input.accountSlug,
    type: "debit",
    amount: -input.amount,
    balanceAfter: nextBalance,
    createdAt: nowIso(),
    note: externalRef ? `${input.note} [ref:${externalRef}]` : input.note,
    source: input.source ?? "run",
  });

  addAuditEvent(state, {
    accountSlug: input.accountSlug,
    actor: input.actor ?? "system",
    event: "credits.debited",
    target: input.accountSlug,
    severity: "info",
    detail: `${input.amount} credits consumed for ${input.note}.`,
  });

  syncAccountDerivedFields(state);
  await writeState(state);
  return state.accounts.find((item) => item.slug === input.accountSlug) ?? account;
}

export async function activateAccountBilling(input: {
  accountSlug: string;
  billingPlan: string;
  actor?: string;
  note?: string;
  externalRef?: string;
}) {
  const state = await readState();
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
    account.planType = "operator";
    account.planName = "Operator";
    account.monthlyCredits = 1800;
    account.monthlySpendUsd = 499;
    account.concurrencyLimit = 3;
  } else if (input.billingPlan === "scale") {
    account.planType = "scale";
    account.planName = "Scale";
    account.monthlyCredits = 4800;
    account.monthlySpendUsd = 1499;
    account.concurrencyLimit = 10;
  } else if (input.billingPlan === "starter") {
    account.planType = "starter";
    account.planName = "Starter";
    account.monthlyCredits = 100;
    account.monthlySpendUsd = 99;
    account.concurrencyLimit = 1;
  }

  if (input.billingPlan !== "topup") {
    account.billingStatus = "active";
    account.status = "active";
    account.canPublish = true;
    account.trialCreditsRemaining = 0;
  }

  addAuditEvent(state, {
    accountSlug: input.accountSlug,
    actor: input.actor ?? "billing",
    event: "billing.activated",
    target: input.accountSlug,
    severity: "info",
    detail: `${input.note ?? `${input.billingPlan} plan activated.`}${externalRef ? ` [ref:${externalRef}]` : ""}`,
  });

  await writeState(state);
  return account;
}

export async function getBillingAuditEvents(accountSlug?: string) {
  return (await readState()).auditEvents.filter(
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
