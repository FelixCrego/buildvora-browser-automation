export type RiskLevel = "low" | "medium" | "high";
export type RunStatus = "queued" | "running" | "awaiting_approval" | "completed" | "failed" | "paused" | "cancelled";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type ConnectionStatus = "healthy" | "needs_attention" | "disconnected";
export type WorkerStatus = "healthy" | "degraded" | "offline";
export type WorkflowState = "draft" | "published" | "paused";
export type AuditSeverity = "info" | "warning" | "critical";

export type BrowserAutomationAccount = {
  id: string;
  slug: string;
  name: string;
  vertical: string;
  planName: string;
  monthlyCredits: number;
  availableCredits: number;
  softLimitCredits: number;
  activeWorkflows: number;
  pendingApprovals: number;
  monthlySpendUsd: number;
  renewalDate: string;
  seats: number;
  status: "active" | "trial" | "restricted";
  concurrencyLimit: number;
};

export type BrowserAutomationWorkflow = {
  id: string;
  slug: string;
  accountSlug: string;
  name: string;
  summary: string;
  systems: string[];
  riskLevel: RiskLevel;
  approvalPolicy: string;
  estimatedCredits: string;
  lastRunStatus: RunStatus;
  latestVersion: string;
  runtimeNotes: string[];
  requiredConnections: string[];
  state: WorkflowState;
  concurrencyLimit: number;
  retryPolicy: string;
  verificationMode: string;
  owner: string;
};

export type WorkflowVersion = {
  id: string;
  workflowSlug: string;
  version: string;
  state: "draft" | "published" | "archived";
  createdAt: string;
  createdBy: string;
  approvalChecksum: string;
  releaseNote: string;
};

export type BrowserAutomationRun = {
  id: string;
  accountSlug: string;
  workflowSlug: string;
  requestedBy: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  estimatedCredits: number;
  actualCredits: number;
  vendorCostUsd: number;
  approvalsTriggered: number;
  summary: string;
  evidence: string[];
  workerId: string;
  queueLane: "priority" | "standard" | "nightly";
  timeline: Array<{
    label: string;
    status: "done" | "active" | "blocked" | "queued";
    note: string;
  }>;
};

export type BrowserAutomationApproval = {
  id: string;
  accountSlug: string;
  workflowSlug: string;
  runId: string;
  stepLabel: string;
  status: ApprovalStatus;
  requestedAt: string;
  expiresAt: string;
  requestedFrom: string;
  context: string;
  requiredRole: string;
};

export type BrowserAutomationConnection = {
  id: string;
  accountSlug: string;
  provider: string;
  label: string;
  status: ConnectionStatus;
  lastVerifiedAt: string;
  scope: string;
  environment: "production" | "staging";
  rotationWindow: string;
};

export type CreditLedgerEntry = {
  id: string;
  accountSlug: string;
  type: "grant" | "hold" | "release" | "debit" | "refund" | "manual_adjustment";
  amount: number;
  balanceAfter: number;
  createdAt: string;
  note: string;
  source: "billing" | "run" | "admin";
};

export type WorkerNode = {
  id: string;
  label: string;
  region: string;
  status: WorkerStatus;
  activeRuns: number;
  queueDepth: number;
  lastHeartbeatAt: string;
  runtime: string;
  browserPool: string;
};

export type AuditEvent = {
  id: string;
  accountSlug?: string;
  actor: string;
  event: string;
  target: string;
  createdAt: string;
  severity: AuditSeverity;
  detail: string;
};

const accounts: BrowserAutomationAccount[] = [
  {
    id: "acct_harbor_legal",
    slug: "harbor-legal-group",
    name: "Harbor Legal Group",
    vertical: "Legal Operations",
    planName: "Operator Deployment",
    monthlyCredits: 1800,
    availableCredits: 942,
    softLimitCredits: 200,
    activeWorkflows: 3,
    pendingApprovals: 2,
    monthlySpendUsd: 6840,
    renewalDate: "2026-06-28",
    seats: 6,
    status: "active",
    concurrencyLimit: 3,
  },
  {
    id: "acct_northshore",
    slug: "northshore-clinics",
    name: "Northshore Clinics",
    vertical: "Healthcare Admin",
    planName: "Portfolio Rollout",
    monthlyCredits: 4200,
    availableCredits: 2380,
    softLimitCredits: 400,
    activeWorkflows: 5,
    pendingApprovals: 1,
    monthlySpendUsd: 12980,
    renewalDate: "2026-06-24",
    seats: 14,
    status: "active",
    concurrencyLimit: 6,
  },
];

const workflows: BrowserAutomationWorkflow[] = [
  {
    id: "wf_harbor_intake",
    slug: "case-intake-routing",
    accountSlug: "harbor-legal-group",
    name: "Case Intake Routing",
    summary: "Pull intake form submissions, validate required fields, enrich matter details, and route qualified matters into Clio with attorney review gates.",
    systems: ["Intake Portal", "Gmail", "Clio", "HubSpot"],
    riskLevel: "high",
    approvalPolicy: "Attorney approval before client-facing email or matter creation edits.",
    estimatedCredits: "55-110 credits / run",
    lastRunStatus: "awaiting_approval",
    latestVersion: "v1.4",
    runtimeNotes: [
      "Verification after each portal state change.",
      "Client-facing messaging remains paused until explicit approval.",
      "Artifacts retained for 30 days.",
    ],
    requiredConnections: ["Intake Portal", "Gmail", "Clio"],
    state: "published",
    concurrencyLimit: 1,
    retryPolicy: "2 retries with selector fallback",
    verificationMode: "Heavy",
    owner: "Maya Chen",
  },
  {
    id: "wf_harbor_status",
    slug: "court-portal-status-checks",
    accountSlug: "harbor-legal-group",
    name: "Court Portal Status Checks",
    summary: "Check court portals, capture filing state updates, and sync status changes back to the internal tracker.",
    systems: ["Court Portal", "Internal Tracker", "Gmail"],
    riskLevel: "medium",
    approvalPolicy: "No approval needed unless filing state mismatch triggers external escalation.",
    estimatedCredits: "28-60 credits / run",
    lastRunStatus: "completed",
    latestVersion: "v1.2",
    runtimeNotes: [
      "Optimized for nightly sweeps.",
      "Automatic retry on transient portal failures.",
      "Escalation email drafted but not sent without approval.",
    ],
    requiredConnections: ["Court Portal", "Internal Tracker"],
    state: "published",
    concurrencyLimit: 2,
    retryPolicy: "3 retries on transport failures",
    verificationMode: "Standard",
    owner: "Maya Chen",
  },
  {
    id: "wf_northshore_benefits",
    slug: "benefits-verification-queue",
    accountSlug: "northshore-clinics",
    name: "Benefits Verification Queue",
    summary: "Open payer portals, verify eligibility, collect policy details, and update scheduling records before appointments.",
    systems: ["Payer Portal", "Gmail", "Scheduling Platform", "CRM"],
    riskLevel: "high",
    approvalPolicy: "Ops lead approval before patient-facing reschedule or account edits.",
    estimatedCredits: "75-140 credits / run",
    lastRunStatus: "running",
    latestVersion: "v2.1",
    runtimeNotes: [
      "Heavy verification load due to portal variance.",
      "Screenshots captured at all patient-impacting decision points.",
      "Runs automatically pause if policy coverage cannot be verified.",
    ],
    requiredConnections: ["Payer Portal", "Scheduling Platform", "CRM"],
    state: "published",
    concurrencyLimit: 4,
    retryPolicy: "2 retries with human escalation after mismatch",
    verificationMode: "Heavy",
    owner: "Ari Gomez",
  },
  {
    id: "wf_northshore_followup",
    slug: "non-clinical-follow-up",
    accountSlug: "northshore-clinics",
    name: "Non-Clinical Follow-Up",
    summary: "Coordinate reminder and document follow-up for non-clinical patient admin workflows across inbox and scheduling surfaces.",
    systems: ["Gmail", "Scheduling Platform"],
    riskLevel: "medium",
    approvalPolicy: "Approval required only for messaging template changes.",
    estimatedCredits: "22-48 credits / run",
    lastRunStatus: "completed",
    latestVersion: "v1.7",
    runtimeNotes: [
      "Built for repeated batch execution.",
      "Low-friction launch path for office managers.",
      "Brand-safe messaging template validation included.",
    ],
    requiredConnections: ["Gmail", "Scheduling Platform"],
    state: "published",
    concurrencyLimit: 5,
    retryPolicy: "1 retry on send interruption",
    verificationMode: "Standard",
    owner: "Ari Gomez",
  },
  {
    id: "wf_northshore_draft",
    slug: "payer-exception-escalations",
    accountSlug: "northshore-clinics",
    name: "Payer Exception Escalations",
    summary: "Draft escalation packets for unresolved payer exceptions and hold them for ops review before outbound action.",
    systems: ["Payer Portal", "CRM", "Gmail"],
    riskLevel: "high",
    approvalPolicy: "All outbound communication and schedule changes require ops approval.",
    estimatedCredits: "48-92 credits / run",
    lastRunStatus: "paused",
    latestVersion: "v0.9",
    runtimeNotes: [
      "Draft workflow awaiting credential rotation.",
      "Escalation templates still under review.",
    ],
    requiredConnections: ["Payer Portal", "CRM", "Gmail"],
    state: "draft",
    concurrencyLimit: 0,
    retryPolicy: "Disabled until publish",
    verificationMode: "Heavy",
    owner: "Ari Gomez",
  },
];

const workflowVersions: WorkflowVersion[] = [
  { id: "wv_101", workflowSlug: "case-intake-routing", version: "v1.4", state: "published", createdAt: "2026-06-06T14:10:00Z", createdBy: "Maya Chen", approvalChecksum: "APP-4F2A", releaseNote: "Added outbound hold before client confirmation." },
  { id: "wv_102", workflowSlug: "case-intake-routing", version: "v1.3", state: "archived", createdAt: "2026-05-29T10:00:00Z", createdBy: "Maya Chen", approvalChecksum: "APP-4E91", releaseNote: "Baseline matter draft sync." },
  { id: "wv_201", workflowSlug: "benefits-verification-queue", version: "v2.1", state: "published", createdAt: "2026-06-08T09:20:00Z", createdBy: "Ari Gomez", approvalChecksum: "APP-93C4", releaseNote: "Improved payer mismatch detection and screenshot retention." },
  { id: "wv_202", workflowSlug: "payer-exception-escalations", version: "v0.9", state: "draft", createdAt: "2026-06-10T15:05:00Z", createdBy: "Ari Gomez", approvalChecksum: "APP-09D1", releaseNote: "Draft escalation flow pending publish review." },
];

const workers: WorkerNode[] = [
  { id: "wrk_iad_01", label: "IAD Browser Worker 01", region: "iad1", status: "healthy", activeRuns: 2, queueDepth: 3, lastHeartbeatAt: "2026-06-11T15:29:10Z", runtime: "codex-browser-v2", browserPool: "chrome-stable" },
  { id: "wrk_iad_02", label: "IAD Browser Worker 02", region: "iad1", status: "degraded", activeRuns: 1, queueDepth: 5, lastHeartbeatAt: "2026-06-11T15:28:54Z", runtime: "codex-browser-v2", browserPool: "chrome-stable" },
  { id: "wrk_dfw_01", label: "DFW Queue Worker 01", region: "dfw1", status: "offline", activeRuns: 0, queueDepth: 0, lastHeartbeatAt: "2026-06-11T13:01:12Z", runtime: "codex-browser-v1", browserPool: "chrome-stable" },
];

const runs: BrowserAutomationRun[] = [
  {
    id: "run_2401",
    accountSlug: "harbor-legal-group",
    workflowSlug: "case-intake-routing",
    requestedBy: "Maya Chen",
    status: "awaiting_approval",
    startedAt: "2026-06-10T12:08:00Z",
    estimatedCredits: 96,
    actualCredits: 71,
    vendorCostUsd: 12.84,
    approvalsTriggered: 1,
    summary: "Qualified two intake submissions and paused before outbound client confirmation.",
    evidence: ["/browser-automation-stills/still-07.jpg", "/browser-automation-stills/still-05.jpg"],
    workerId: "wrk_iad_01",
    queueLane: "priority",
    timeline: [
      { label: "Pull intake queue", status: "done", note: "Three new submissions loaded from the intake portal." },
      { label: "Validate required fields", status: "done", note: "Two qualified. One missing incident date." },
      { label: "Create matter draft", status: "done", note: "Drafts written into Clio with evidence captured." },
      { label: "Send client confirmation", status: "blocked", note: "Waiting for attorney approval before outbound email." },
      { label: "Finalize CRM sync", status: "queued", note: "Will execute immediately after approval." },
    ],
  },
  {
    id: "run_2399",
    accountSlug: "harbor-legal-group",
    workflowSlug: "court-portal-status-checks",
    requestedBy: "Maya Chen",
    status: "completed",
    startedAt: "2026-06-10T09:42:00Z",
    completedAt: "2026-06-10T09:56:00Z",
    estimatedCredits: 44,
    actualCredits: 38,
    vendorCostUsd: 6.72,
    approvalsTriggered: 0,
    summary: "Captured eight portal updates and synced six status changes into the internal tracker.",
    evidence: ["/browser-automation-stills/still-03.jpg"],
    workerId: "wrk_iad_02",
    queueLane: "nightly",
    timeline: [
      { label: "Open portal batch", status: "done", note: "Eight tracked matters loaded." },
      { label: "Capture filing states", status: "done", note: "State snapshots stored for each matter." },
      { label: "Sync tracker updates", status: "done", note: "Six changes pushed to the internal tracker." },
      { label: "Draft escalation digest", status: "done", note: "No escalation approvals needed." },
    ],
  },
  {
    id: "run_8821",
    accountSlug: "northshore-clinics",
    workflowSlug: "benefits-verification-queue",
    requestedBy: "Ari Gomez",
    status: "running",
    startedAt: "2026-06-10T12:16:00Z",
    estimatedCredits: 118,
    actualCredits: 64,
    vendorCostUsd: 14.91,
    approvalsTriggered: 0,
    summary: "Payer portal verification in progress across the afternoon appointment queue.",
    evidence: ["/browser-automation-stills/still-08.jpg"],
    workerId: "wrk_iad_01",
    queueLane: "standard",
    timeline: [
      { label: "Load afternoon queue", status: "done", note: "Twelve appointments prepared for verification." },
      { label: "Check payer portal coverage", status: "active", note: "Seven of twelve verified. Continuing through portal sequence." },
      { label: "Update scheduling records", status: "queued", note: "Pending completion of portal checks." },
      { label: "Prepare exceptions report", status: "queued", note: "Will open if coverage mismatch is found." },
    ],
  },
  {
    id: "run_8813",
    accountSlug: "northshore-clinics",
    workflowSlug: "payer-exception-escalations",
    requestedBy: "Ari Gomez",
    status: "paused",
    startedAt: "2026-06-11T08:22:00Z",
    estimatedCredits: 62,
    actualCredits: 12,
    vendorCostUsd: 2.91,
    approvalsTriggered: 0,
    summary: "Draft escalation workflow paused because Gmail production credential is not healthy.",
    evidence: ["/browser-automation-stills/still-04.jpg"],
    workerId: "wrk_iad_02",
    queueLane: "priority",
    timeline: [
      { label: "Load unresolved payer queue", status: "done", note: "Five unresolved items staged." },
      { label: "Attach exception notes", status: "done", note: "Notes created for all staged items." },
      { label: "Draft escalation email", status: "blocked", note: "Paused by connection policy on Gmail credential." },
    ],
  },
];

const approvals: BrowserAutomationApproval[] = [
  {
    id: "apr_501",
    accountSlug: "harbor-legal-group",
    workflowSlug: "case-intake-routing",
    runId: "run_2401",
    stepLabel: "Send qualified intake confirmation email",
    status: "pending",
    requestedAt: "2026-06-10T12:19:00Z",
    expiresAt: "2026-06-10T16:19:00Z",
    requestedFrom: "Partner Approver",
    context: "Two qualified matters are ready for outbound confirmation. Review draft language and matter details before release.",
    requiredRole: "Attorney",
  },
  {
    id: "apr_488",
    accountSlug: "northshore-clinics",
    workflowSlug: "benefits-verification-queue",
    runId: "run_8807",
    stepLabel: "Patient reschedule recommendation",
    status: "pending",
    requestedAt: "2026-06-10T08:12:00Z",
    expiresAt: "2026-06-10T15:12:00Z",
    requestedFrom: "Ops Lead",
    context: "Coverage mismatch found. Approval required before patient-facing schedule change notice is sent.",
    requiredRole: "Operations Lead",
  },
];

const connections: BrowserAutomationConnection[] = [
  { id: "conn_1", accountSlug: "harbor-legal-group", provider: "Intake Portal", label: "Main Intake Workspace", status: "healthy", lastVerifiedAt: "2026-06-10T11:40:00Z", scope: "Submission queue + draft retrieval", environment: "production", rotationWindow: "90 days" },
  { id: "conn_2", accountSlug: "harbor-legal-group", provider: "Clio", label: "Production Matter Sync", status: "healthy", lastVerifiedAt: "2026-06-10T11:42:00Z", scope: "Matter drafts + contact sync", environment: "production", rotationWindow: "120 days" },
  { id: "conn_3", accountSlug: "harbor-legal-group", provider: "Gmail", label: "Client Intake Mailbox", status: "needs_attention", lastVerifiedAt: "2026-06-09T20:05:00Z", scope: "Draft creation only until re-authenticated", environment: "production", rotationWindow: "30 days" },
  { id: "conn_4", accountSlug: "northshore-clinics", provider: "Payer Portal", label: "Regional Benefits Hub", status: "healthy", lastVerifiedAt: "2026-06-10T12:02:00Z", scope: "Eligibility and benefits read access", environment: "production", rotationWindow: "60 days" },
  { id: "conn_5", accountSlug: "northshore-clinics", provider: "Scheduling Platform", label: "Front Office Scheduler", status: "disconnected", lastVerifiedAt: "2026-06-08T17:31:00Z", scope: "Update access blocked until token rotation", environment: "production", rotationWindow: "30 days" },
];

const creditLedger: CreditLedgerEntry[] = [
  { id: "led_1", accountSlug: "harbor-legal-group", type: "grant", amount: 1800, balanceAfter: 1800, createdAt: "2026-06-01T00:00:00Z", note: "Monthly plan credit grant", source: "billing" },
  { id: "led_2", accountSlug: "harbor-legal-group", type: "debit", amount: -38, balanceAfter: 980, createdAt: "2026-06-10T09:56:00Z", note: "Court Portal Status Checks run_2399 finalized", source: "run" },
  { id: "led_3", accountSlug: "harbor-legal-group", type: "hold", amount: -96, balanceAfter: 942, createdAt: "2026-06-10T12:08:00Z", note: "Case Intake Routing run_2401 hold placed", source: "run" },
  { id: "led_4", accountSlug: "northshore-clinics", type: "grant", amount: 4200, balanceAfter: 4200, createdAt: "2026-06-01T00:00:00Z", note: "Monthly plan credit grant", source: "billing" },
  { id: "led_5", accountSlug: "northshore-clinics", type: "debit", amount: -88, balanceAfter: 2444, createdAt: "2026-06-10T07:44:00Z", note: "Benefits Verification Queue morning batch", source: "run" },
  { id: "led_6", accountSlug: "northshore-clinics", type: "hold", amount: -64, balanceAfter: 2380, createdAt: "2026-06-10T12:16:00Z", note: "Benefits Verification Queue afternoon batch hold", source: "run" },
  { id: "led_7", accountSlug: "northshore-clinics", type: "manual_adjustment", amount: 150, balanceAfter: 2530, createdAt: "2026-06-11T09:18:00Z", note: "Ops-approved service recovery credit", source: "admin" },
];

const auditEvents: AuditEvent[] = [
  { id: "aud_1", accountSlug: "harbor-legal-group", actor: "Maya Chen", event: "workflow.publish", target: "case-intake-routing:v1.4", createdAt: "2026-06-06T14:10:00Z", severity: "info", detail: "Published v1.4 with new outbound approval hold." },
  { id: "aud_2", accountSlug: "harbor-legal-group", actor: "system", event: "approval.requested", target: "run_2401", createdAt: "2026-06-10T12:19:00Z", severity: "warning", detail: "Attorney approval requested before client-facing confirmation email." },
  { id: "aud_3", accountSlug: "northshore-clinics", actor: "system", event: "connection.health.degraded", target: "conn_5", createdAt: "2026-06-11T08:20:00Z", severity: "critical", detail: "Scheduling Platform token refresh failed; production writes blocked." },
  { id: "aud_4", accountSlug: "northshore-clinics", actor: "Ari Gomez", event: "run.pause", target: "run_8813", createdAt: "2026-06-11T08:23:00Z", severity: "warning", detail: "Paused escalation draft after connection policy blocked Gmail send stage." },
  { id: "aud_5", actor: "system", event: "worker.degraded", target: "wrk_iad_02", createdAt: "2026-06-11T15:18:00Z", severity: "critical", detail: "Browser worker latency exceeded threshold for 12 minutes." },
];

export function getBrowserAutomationAccounts() {
  return accounts;
}

export function getBrowserAutomationWorkflows() {
  return workflows;
}

export function getWorkflowVersions() {
  return workflowVersions;
}

export function getBrowserAutomationRuns() {
  return runs;
}

export function getBrowserAutomationApprovals() {
  return approvals;
}

export function getBrowserAutomationConnections() {
  return connections;
}

export function getCreditLedgerEntries() {
  return creditLedger;
}

export function getWorkerNodes() {
  return workers;
}

export function getAuditEvents() {
  return auditEvents;
}

export function getAccountBySlug(accountSlug: string) {
  return accounts.find((account) => account.slug === accountSlug) ?? null;
}

export function getWorkflowBySlug(workflowSlug: string) {
  return workflows.find((workflow) => workflow.slug === workflowSlug) ?? null;
}

export function getWorkflowVersionsBySlug(workflowSlug: string) {
  return workflowVersions.filter((version) => version.workflowSlug === workflowSlug);
}

export function getRunById(runId: string) {
  return runs.find((run) => run.id === runId) ?? null;
}

export function getPrimaryWorkspaceAccount() {
  return accounts[0];
}

export function getAccountWorkflows(accountSlug: string) {
  return workflows.filter((workflow) => workflow.accountSlug === accountSlug);
}

export function getAccountRuns(accountSlug: string) {
  return runs.filter((run) => run.accountSlug === accountSlug);
}

export function getAccountApprovals(accountSlug: string) {
  return approvals.filter((approval) => approval.accountSlug === accountSlug);
}

export function getAccountConnections(accountSlug: string) {
  return connections.filter((connection) => connection.accountSlug === accountSlug);
}

export function getAccountLedger(accountSlug: string) {
  return creditLedger.filter((entry) => entry.accountSlug === accountSlug);
}

export function getAccountAuditEvents(accountSlug: string) {
  return auditEvents.filter((event) => event.accountSlug === accountSlug);
}

export function getWorkerById(workerId: string) {
  return workers.find((worker) => worker.id === workerId) ?? null;
}

export function getAdminControlPlaneSnapshot() {
  const totalCreditsAvailable = accounts.reduce((sum, account) => sum + account.availableCredits, 0);
  const activeRuns = runs.filter((run) => ["running", "awaiting_approval", "queued", "paused"].includes(run.status)).length;
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending").length;
  const monthlyRevenue = accounts.reduce((sum, account) => sum + account.monthlySpendUsd, 0);
  const degradedWorkers = workers.filter((worker) => worker.status !== "healthy").length;
  const queueDepth = workers.reduce((sum, worker) => sum + worker.queueDepth, 0);
  const drafts = workflows.filter((workflow) => workflow.state === "draft").length;
  const disconnectedConnections = connections.filter((connection) => connection.status !== "healthy").length;

  return {
    totals: {
      accounts: accounts.length,
      workflows: workflows.length,
      activeRuns,
      pendingApprovals,
      totalCreditsAvailable,
      monthlyRevenue,
      degradedWorkers,
      queueDepth,
      drafts,
      disconnectedConnections,
    },
    accounts,
    workflows,
    runs,
    approvals,
    workers,
    auditEvents,
  };
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
