import { validateWorkflow } from "./schema.js";
import { ValidationError } from "./errors.js";

function dedupe(items) {
  return Array.from(new Set(items));
}

function detectSystems(transcript) {
  const lower = transcript.toLowerCase();
  const systems = [];

  if (lower.includes("linkedin")) systems.push("LinkedIn");
  if (lower.includes("gmail") || lower.includes("email") || lower.includes("inbox")) systems.push("Gmail");
  if (lower.includes("clio")) systems.push("Clio");
  if (lower.includes("crm")) systems.push("CRM");
  if (lower.includes("hubspot")) systems.push("HubSpot");
  if (lower.includes("portal")) systems.push("Portal");
  if (lower.includes("scheduler") || lower.includes("scheduling")) systems.push("Scheduling Platform");
  if (lower.includes("payer") || lower.includes("insurance")) systems.push("Payer Portal");
  if (lower.includes("amazon")) systems.push("Amazon");
  if (lower.includes("robinhood") || lower.includes("broker")) systems.push("Broker Dashboard");

  return dedupe(systems.length ? systems : ["Browser Portal", "Gmail", "CRM"]);
}

function detectRiskLevel(transcript) {
  const lower = transcript.toLowerCase();
  if (
    lower.includes("patient") ||
    lower.includes("legal") ||
    lower.includes("client") ||
    lower.includes("finance") ||
    lower.includes("approval")
  ) {
    return "high";
  }
  if (lower.includes("portal") || lower.includes("crm") || lower.includes("verify")) {
    return "medium";
  }
  return "low";
}

function detectApprovals(transcript) {
  const lower = transcript.toLowerCase();
  const approvals = [];

  if (lower.includes("email") || lower.includes("message")) approvals.push("Require approval before outbound communication.");
  if (lower.includes("edit") || lower.includes("update") || lower.includes("change")) approvals.push("Require approval before record or account changes.");
  if (lower.includes("submit") || lower.includes("send")) approvals.push("Pause before final submission or send action.");
  if (lower.includes("client") || lower.includes("patient") || lower.includes("customer")) approvals.push("Keep customer-facing moments behind explicit operator release.");

  return dedupe(approvals.length ? approvals : ["Require approval before any external message, submission, or irreversible action."]);
}

export class HeuristicWorkflowBuilder {
  async buildFromTranscript(input) {
    if (!input?.transcript || input.transcript.trim().length < 20) {
      throw new ValidationError("transcript must contain enough detail to build a workflow.");
    }

    const transcript = input.transcript.trim();
    const company = input.company?.trim() || "Client Workspace";
    const systems = detectSystems(transcript);
    const approvals = detectApprovals(transcript);
    const riskLevel = detectRiskLevel(transcript);

    const workflow = {
      name: `${company} ${systems[0]} Automation`,
      objective: transcript,
      riskLevel,
      systems,
      approvals,
      steps: [
        {
          id: "step-1",
          title: "Open target browser surface",
          action: "navigate",
          target: "about:blank",
          input: null,
          requiresApproval: false,
          verification: "Browser surface is reachable.",
        },
        {
          id: "step-2",
          title: "Perform core browser task",
          action: "custom",
          target: systems[0],
          input: transcript,
          requiresApproval: false,
          verification: "Primary task completed and intermediate state captured.",
        },
        {
          id: "step-3",
          title: "Run verification checkpoint",
          action: "assert_state",
          target: "verified-state",
          input: null,
          requiresApproval: false,
          verification: "Expected browser state is present after execution.",
        },
        {
          id: "step-4",
          title: "Protected external action",
          action: "custom",
          target: "protected-action",
          input: null,
          requiresApproval: true,
          verification: "Protected step approved and action released.",
        },
      ],
      sourceTranscript: transcript,
      model: "heuristic-fallback",
      rawResponseId: null,
    };

    validateWorkflow(workflow);

    return {
      workflow,
      metadata: {
        responseId: null,
        model: "heuristic-fallback",
      },
    };
  }
}
