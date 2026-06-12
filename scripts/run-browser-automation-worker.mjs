import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  BrowserAutomationHarness,
  createPlaywrightAdapter,
  HeuristicWorkflowBuilder,
  InMemoryCreditLedger,
  InMemoryRunStore,
  OpenAIWorkflowBuilder,
} from "@buildvora/browser-automation";

async function readWorkflowInput() {
  if (process.env.BROWSER_AUTOMATION_WORKFLOW_FILE) {
    const absolutePath = path.resolve(process.env.BROWSER_AUTOMATION_WORKFLOW_FILE);
    const raw = await fs.readFile(absolutePath, "utf8");
    return JSON.parse(raw);
  }

  const transcript = process.env.BROWSER_AUTOMATION_TRANSCRIPT;
  if (!transcript) {
    throw new Error(
      "Set BROWSER_AUTOMATION_WORKFLOW_FILE or BROWSER_AUTOMATION_TRANSCRIPT before starting the worker.",
    );
  }

  const builder = process.env.OPENAI_API_KEY
    ? new OpenAIWorkflowBuilder({ model: process.env.BROWSER_AUTOMATION_MODEL })
    : new HeuristicWorkflowBuilder();

  const draft = await builder.buildFromTranscript({
    company: process.env.BROWSER_AUTOMATION_COMPANY ?? "BuildVora Client Workspace",
    transcript,
  });

  return {
    workflow: draft.workflow,
    accountId: process.env.BROWSER_AUTOMATION_ACCOUNT_ID ?? "acct_demo",
    actor: process.env.BROWSER_AUTOMATION_ACTOR ?? "worker@buildvora.ai",
  };
}

async function main() {
  const input = await readWorkflowInput();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const harness = new BrowserAutomationHarness({
      browser: createPlaywrightAdapter(page, {
        screenshotDir:
          process.env.BROWSER_AUTOMATION_SCREENSHOT_DIR ??
          path.join(process.cwd(), "artifacts", "browser-automation"),
        custom: async () => true,
      }),
      creditLedger: new InMemoryCreditLedger({
        [input.accountId ?? "acct_demo"]: Number(process.env.BROWSER_AUTOMATION_STARTING_CREDITS ?? 1000),
      }),
      runStore: new InMemoryRunStore(),
      approvals: {
        async requestApproval({ step }) {
          if (process.env.BROWSER_AUTOMATION_AUTO_APPROVE === "false" && step.requiresApproval) {
            return { pending: true };
          }

          return {
            approved: true,
            approver: process.env.BROWSER_AUTOMATION_ACTOR ?? "worker@buildvora.ai",
          };
        },
      },
    });

    const result = await harness.run({
      accountId: input.accountId ?? "acct_demo",
      workflow: input.workflow,
      actor: input.actor ?? "worker@buildvora.ai",
    });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
