import { ValidationError } from "./errors.js";

const VALID_ACTIONS = ["navigate", "click", "type", "wait_for", "assert_state", "custom"];
const VALID_RISK_LEVELS = ["low", "medium", "high"];

export function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}

function assertOptionalString(value, fieldName) {
  if (value != null && typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string when provided.`);
  }
}

function assertBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new ValidationError(`${fieldName} must be a boolean.`);
  }
}

export function validateWorkflowStep(step, index) {
  if (!step || typeof step !== "object") {
    throw new ValidationError(`workflow.steps[${index}] must be an object.`);
  }

  assertNonEmptyString(step.id ?? `step-${index + 1}`, `workflow.steps[${index}].id`);
  assertNonEmptyString(step.title, `workflow.steps[${index}].title`);
  assertNonEmptyString(step.action, `workflow.steps[${index}].action`);

  if (!VALID_ACTIONS.includes(step.action)) {
    throw new ValidationError(
      `workflow.steps[${index}].action must be one of: ${VALID_ACTIONS.join(", ")}.`,
    );
  }

  assertOptionalString(step.target, `workflow.steps[${index}].target`);
  assertOptionalString(step.input, `workflow.steps[${index}].input`);
  assertOptionalString(step.verification, `workflow.steps[${index}].verification`);
  assertBoolean(step.requiresApproval, `workflow.steps[${index}].requiresApproval`);

  if (["navigate", "click", "type", "wait_for"].includes(step.action)) {
    assertNonEmptyString(step.target, `workflow.steps[${index}].target`);
  }

  if (step.action === "type" && typeof step.input !== "string") {
    throw new ValidationError(`workflow.steps[${index}].input is required for type actions.`);
  }

  if (step.action === "assert_state" && !step.verification && !step.target) {
    throw new ValidationError(
      `workflow.steps[${index}] must define verification or target for assert_state actions.`,
    );
  }
}

export function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== "object") {
    throw new ValidationError("workflow is required.");
  }

  assertNonEmptyString(workflow.name, "workflow.name");
  assertNonEmptyString(workflow.objective, "workflow.objective");

  if (
    workflow.riskLevel != null &&
    (typeof workflow.riskLevel !== "string" || !VALID_RISK_LEVELS.includes(workflow.riskLevel))
  ) {
    throw new ValidationError(`workflow.riskLevel must be one of: ${VALID_RISK_LEVELS.join(", ")}.`);
  }

  if (workflow.systems != null && !Array.isArray(workflow.systems)) {
    throw new ValidationError("workflow.systems must be an array when provided.");
  }

  if (workflow.approvals != null && !Array.isArray(workflow.approvals)) {
    throw new ValidationError("workflow.approvals must be an array when provided.");
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    throw new ValidationError("workflow.steps must contain at least one step.");
  }

  workflow.steps.forEach(validateWorkflowStep);
  return workflow;
}
