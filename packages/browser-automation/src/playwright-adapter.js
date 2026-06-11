import { ValidationError } from "./errors.js";

function assertPage(page) {
  if (!page || typeof page.goto !== "function") {
    throw new ValidationError("createPlaywrightAdapter requires a Playwright page instance.");
  }
}

export function createPlaywrightAdapter(page, options = {}) {
  assertPage(page);

  const screenshot = options.screenshot ?? (async ({ label }) => {
    const sanitized = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const path = options.screenshotDir
      ? `${options.screenshotDir}/${Date.now()}-${sanitized || "evidence"}.png`
      : undefined;
    if (!path) {
      return {
        label,
        capturedAt: new Date().toISOString(),
        kind: "playwright-screenshot-skipped",
      };
    }

    await page.screenshot({ path, fullPage: true });
    return {
      label,
      path,
      capturedAt: new Date().toISOString(),
      kind: "playwright-screenshot",
    };
  });

  return {
    async navigate(url) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
    },
    async click(selector) {
      await page.click(selector);
    },
    async type(selector, value) {
      await page.fill(selector, value);
    },
    async waitFor(selector) {
      await page.waitForSelector(selector);
    },
    async assertState(assertion) {
      if (assertion.startsWith("text:")) {
        const text = assertion.slice(5);
        const body = await page.textContent("body");
        if (!body?.includes(text)) {
          throw new ValidationError(`Expected page text to include "${text}".`, {
            code: "ASSERTION_FAILED",
          });
        }
        return;
      }

      await page.waitForSelector(assertion);
    },
    async captureEvidence(label) {
      return screenshot({ label, page });
    },
    async custom(step) {
      if (typeof options.custom !== "function") {
        throw new ValidationError(
          `No custom handler configured for step ${step.id ?? step.title ?? "custom-step"}.`,
          { code: "CUSTOM_HANDLER_MISSING" },
        );
      }

      return options.custom(step, page);
    },
  };
}
