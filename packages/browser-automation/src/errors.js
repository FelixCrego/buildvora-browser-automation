export class BrowserAutomationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "BrowserAutomationError";
    this.code = options.code ?? "BROWSER_AUTOMATION_ERROR";
    this.cause = options.cause;
  }
}

export class ValidationError extends BrowserAutomationError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? "VALIDATION_ERROR" });
    this.name = "ValidationError";
  }
}

export class ApprovalRequiredError extends BrowserAutomationError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? "APPROVAL_REQUIRED" });
    this.name = "ApprovalRequiredError";
  }
}

export class CreditLimitError extends BrowserAutomationError {
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code ?? "CREDIT_LIMIT_ERROR" });
    this.name = "CreditLimitError";
  }
}
