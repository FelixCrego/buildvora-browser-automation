import { ValidationError } from "./errors.js";

export function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${fieldName} is required.`);
  }
}

export function validateWorkflowStep(step, index) {
  if (!step || typeof step !== "object") {
    throw new ValidationError(`workflow.steps[${index}] must be an object.`);
  }

  assertNonEmptyString(step.id ?? `step-${index + 1}`, `workflow.steps[${index}].id`);
  assertNonEmptyString(step.title, `workflow.steps[${index}].title`);
  assertNonEmptyString(step.action, `workflow.steps[${index}].action`);

  const validActions = ["navigate", "click", "type", "wait_for", "assert_state", "custom"];
  if (!validActions.includes(step.action)) {
    throw new ValidationError(
      `workflow.steps[${index}].action must be one of: ${validActions.join(", ")}.`,
    );
  }
}

export function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== "object") {
    throw new ValidationError("workflow is required.");
  }

  assertNonEmptyString(workflow.name, "workflow.name");
  assertNonEmptyString(workflow.objective, "workflow.objective");

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    throw new ValidationError("workflow.steps must contain at least one step.");
  }

  workflow.steps.forEach(validateWorkflowStep);
  return workflow;
}
