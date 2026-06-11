# @buildvora/browser-automation

Node.js harness for the product BuildVora is monetizing: OpenAI-backed browser automation with guarded execution, approval checkpoints, and credits metering.

## Install

```bash
npm install @buildvora/browser-automation
```

The package expects an OpenAI API key in `OPENAI_API_KEY` unless you pass your own configured client.

## What it provides

- workflow building from a plain-English or voice transcript
- OpenAI-backed planning
- deterministic step execution against a browser adapter
- approval gates before protected actions
- credits estimation, holds, debits, and releases
- run lifecycle events for the admin/backend portal

## Quick start

```js
import {
  BrowserAutomationHarness,
  OpenAIWorkflowBuilder,
  InMemoryCreditLedger,
} from "@buildvora/browser-automation";

const browser = {
  async navigate(url) {},
  async click(selector) {},
  async type(selector, value) {},
  async waitFor(selector) {},
  async assertState(assertion) {},
  async captureEvidence(label) {
    return { label, capturedAt: new Date().toISOString() };
  },
};

const harness = new BrowserAutomationHarness({
  browser,
  workflowBuilder: new OpenAIWorkflowBuilder(),
  creditLedger: new InMemoryCreditLedger(),
  approvals: {
    async requestApproval({ runId, step }) {
      return { approved: true, approver: "ops@example.com" };
    },
  },
});

const draft = await harness.buildWorkflowFromTranscript({
  company: "Harbor Legal Group",
  transcript:
    "Open our intake portal, review new submissions, enrich them with Clio details, pause before any client email, then push approved cases into our CRM.",
});

const result = await harness.run({
  accountId: "acct_harbor_legal",
  workflow: draft.workflow,
  actor: "ops@harborlegalgroup.com",
});

console.log(result.status, result.credits.actualBurn);
```

## Core concepts

### `BrowserAutomationHarness`

Main runtime. Orchestrates:

- credit hold
- execution
- approval checks
- evidence capture
- final debit/release

### `OpenAIWorkflowBuilder`

Uses the OpenAI Responses API to turn a transcript or goal into a normalized workflow draft.

### `InMemoryCreditLedger`

Reference ledger implementation for development. Replace with Postgres/Stripe-backed persistence in production.

### Browser adapter contract

The harness does not force a browser engine. You provide an adapter with methods like:

- `navigate(url)`
- `click(selector)`
- `type(selector, value)`
- `waitFor(selector)`
- `assertState(assertion)`
- `captureEvidence(label)`

This makes it easy to wire Playwright or another browser runtime under the hood.

## Production notes

For real monetization, replace the in-memory pieces with:

- Postgres-backed workflow storage
- durable credit ledger
- Stripe billing sync
- real approval service
- real queue / worker runtime
