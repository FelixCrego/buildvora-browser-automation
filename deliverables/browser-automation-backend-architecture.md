# BuildVora Browser Automation Backend Architecture

## What exists today

The current `browser-automation` product page is a premium lead + scoping experience. It:

- frames the product as credits-based browser automation
- emphasizes human approvals and verification
- lets the user download a JSON architecture brief

It does **not** yet implement:

- user accounts
- paid plans
- credit balances
- signed-client workspace
- job execution
- approvals
- run logs
- billing
- Codex session orchestration

## Recommended product model

Treat this as a managed automation platform with three layers:

1. **Commercial layer**
   - plans
   - subscriptions
   - prepaid credits / monthly credit grants
   - invoices and overage billing

2. **Control layer**
   - workflow definitions
   - approval policies
   - run permissions
   - audit log

3. **Execution layer**
   - queued automation jobs
   - Codex-backed browser workers
   - step telemetry
   - retry / verification pipeline

4. **Client workspace layer**
   - signed-in customer dashboard
   - workflow import / activation
   - run launcher
   - approval inbox
   - evidence and logs
   - credit and billing visibility

## Core recommendation

Do **not** start by making AWS the center of the system.

Start with:

- `Next.js` on Vercel for app + API routes
- `Postgres` for source-of-truth data
- `Redis` for queues, locks, and short-lived state
- `Stripe` for subscriptions, top-ups, invoices, and payment collection
- a dedicated worker service for Codex/browser execution

Then choose worker hosting like this:

- **Phase 1:** one isolated worker VM/container service is enough
- **Phase 2:** move workers to AWS only when you need stronger isolation, autoscaling, VPC controls, or per-run ephemeral environments

## Should AWS be used?

### Short answer

Not for the first version of the billing and credits backend.

### Use AWS when one or more of these become true

- you need ephemeral per-run browser containers
- you need stricter tenant isolation
- you need private networking into client systems
- you need heavy queue throughput
- you need durable artifact storage for videos, screenshots, traces, and logs

### Practical split

- **Vercel / app tier**
  - dashboard
  - authenticated APIs
  - Stripe webhooks
  - approval UI
  - reporting UI

- **Postgres**
  - customers
  - workflows
  - runs
  - credit ledger
  - billing events

- **Redis / queue**
  - pending jobs
  - approval wait states
  - worker heartbeats
  - idempotency locks

- **Worker tier**
  - Codex-run job orchestration
  - browser automation execution
  - screenshots / evidence
  - step-level telemetry

- **Optional AWS later**
  - ECS/Fargate or EKS for workers
  - S3 for artifacts
  - SQS/EventBridge for job fanout
  - Secrets Manager / KMS

## How credits should work

Do **not** bill directly from raw OpenAI invoice totals. Use your own internal credit system and reconcile it against vendor cost.

### Why

OpenAI cost and usage APIs are useful for reconciliation and finance reporting, but customer billing should be based on your own run ledger and pricing rules, not delayed aggregate vendor invoices.

### Credit model

Each automation run should produce:

- `base_run_credits`
- `browser_step_credits`
- `verification_credits`
- `cross_system_handoff_credits`
- `retry_credits`
- `premium_guardrail_credits`

Example formula:

`credits = base_fee + step_count + verification_checks + retries * retry_multiplier + external_handoffs * handoff_fee`

Example pricing:

- simple run: `20-40` credits
- medium run with verification: `40-90` credits
- high-risk run with approvals and retries: `90-200+` credits

### Important rule

Price by **business workload**, not by tokens alone.

Tokens should be one input into your margin model, but the customer-facing meter should reflect:

- browser depth
- fragility / retries
- runtime length
- human approval overhead
- artifact generation
- support tier

## Metering strategy

Each run needs two ledgers:

1. **Customer ledger**
   - how many credits were reserved
   - how many were finally burned
   - what pricing rule caused the burn

2. **Vendor cost ledger**
   - OpenAI model usage
   - browser worker runtime
   - storage / artifact cost
   - any third-party API cost

### Reservation pattern

When a run starts:

- estimate max credits
- place a temporary hold
- reject the run if balance is insufficient

When the run finishes:

- compute actual burn
- convert hold into final debit
- release unused reserved credits

This prevents users from launching expensive runs they cannot pay for.

## Minimal data model

### `accounts`

- id
- name
- stripe_customer_id
- plan_id
- status

### `users`

- id
- account_id
- email
- role

### `workflows`

- id
- account_id
- name
- source_brief_id nullable
- target_systems
- risk_level
- approval_policy_id
- status
- latest_published_version_id nullable

### `workflow_versions`

- id
- workflow_id
- version_number
- definition_json
- prompt_pack
- execution_config_json
- created_by_user_id
- published_at

### `automation_briefs`

- id
- account_id nullable
- created_by_user_id nullable
- company
- contact_name
- email
- brief_json
- conversion_status
- workflow_id nullable

### `vault_connections`

- id
- account_id
- provider
- label
- encrypted_secret_reference
- status
- last_verified_at

### `runs`

- id
- account_id
- workflow_id
- status
- requested_by_user_id
- started_at
- completed_at
- estimated_credits
- actual_credits
- vendor_cost_usd

### `run_steps`

- id
- run_id
- step_type
- target_system
- status
- started_at
- completed_at
- retry_count

### `approvals`

- id
- run_id
- step_id
- status
- requested_from_user_id
- approved_by_user_id
- approved_at
- expires_at
- decision_note

### `credit_ledger`

- id
- account_id
- run_id nullable
- type
- amount
- balance_after
- source
- metadata

Ledger event types:

- `grant`
- `hold`
- `release`
- `debit`
- `refund`
- `manual_adjustment`
- `overage_invoice_pending`

### `vendor_usage_events`

- id
- run_id
- provider
- model
- input_tokens
- output_tokens
- request_count
- vendor_cost_usd
- raw_reference

## Client interface after sign-on

Yes, this absolutely needs a client interface after the customer signs on.

The download file alone is not enough if the customer is supposed to actually run the automation they bought. The file is useful as:

- a scoping artifact
- a handoff artifact
- an import source
- an audit record

But the real product should be a signed-in workspace where that artifact becomes a runnable workflow.

### Required customer portal sections

#### 1. Workspace home

- current credit balance
- plan and renewal date
- active workflows
- recent runs
- approvals waiting
- recent failures / alerts

#### 2. Workflow library

- imported workflows
- draft vs published versions
- workflow summary
- supported systems
- risk level
- last run status

#### 3. Workflow detail page

- workflow definition summary
- uploaded/imported brief
- guardrails
- systems involved
- required credentials
- approval policy
- estimated credit range per run
- run button

#### 4. Run launcher

Before execution, the client should be able to:

- choose workflow version
- provide run inputs
- choose environment or account
- review estimated credits
- see whether approval checkpoints are enabled
- confirm execution

#### 5. Live run view

- queued / running / waiting for approval / completed / failed states
- step-by-step timeline
- screenshots or evidence frames
- current credit estimate vs actual
- operator logs
- retry notices

#### 6. Approval inbox

- pending approvals
- run context
- screenshot / evidence
- approve / reject / expire
- comment field

#### 7. Billing and credits

- current credit balance
- monthly credit grant
- top-up button
- credit burn history
- invoice history
- projected remaining capacity

#### 8. Connections / credentials

- connected systems
- credential status
- last verification timestamp
- reconnect / rotate secret flow

## How the file should be used

The architecture brief JSON should become an importable asset, not the end product.

### Recommended lifecycle

1. Visitor scopes workflow on the marketing page.
2. System generates the architecture brief JSON.
3. After purchase or onboarding, the brief is attached to the customer account.
4. Internal admin or onboarding flow converts the brief into a `workflow` + `workflow_version`.
5. Customer signs in, reviews the workflow, connects credentials, and launches runs.

### Important distinction

There are really two files:

1. **Scoping brief**
   - what exists today
   - business and workflow definition
   - useful for sales and onboarding

2. **Runnable workflow package**
   - normalized execution config
   - approval policies
   - required secrets
   - step graph / prompt config
   - versioned for production use

The customer should be able to download both, but only the second one should be used for direct execution.

## Recommended signed-client UX

### Phase 1

- BuildVora provisions the workflow for the customer
- customer logs in to run an already-configured workflow
- customer can see runs, approvals, credits, and evidence

This is the right first version.

### Phase 2

- customer can import a workflow package
- customer can duplicate and adjust run-time inputs
- customer can manage multiple workflow versions

### Phase 3

- customer can self-serve new workflow creation from templates
- customer can clone workflows across teams
- customer can define approval rules in the UI

## New execution flow with customer portal

1. Customer signs in.
2. Customer selects a workflow from the library.
3. Customer checks whether required credentials are connected.
4. Customer launches the run with inputs.
5. System estimates credits and places a hold.
6. Worker executes the run.
7. Approval steps pause in the approval inbox when necessary.
8. Customer or approver releases the next step.
9. Run completes and evidence is stored.
10. Final credits are burned and dashboard totals update.

## What to build first for this interface

If the goal is to get this sellable and runnable fast, the first post-sale surface should include:

- account auth
- customer dashboard
- workflow detail page
- run launcher
- live run page
- approval inbox
- credits and invoices page
- connections page

Do **not** start with self-serve workflow editing. Start with self-serve workflow execution.

## Execution flow

1. User launches a workflow run.
2. API validates account, permissions, workflow status, and available credits.
3. System estimates cost and creates a credit hold.
4. Job enters queue.
5. Worker claims job and starts Codex/browser execution.
6. Worker emits step telemetry during execution.
7. Sensitive step triggers approval request if policy requires it.
8. Run resumes after approval or expires on timeout.
9. Worker writes final result, artifacts, and usage metrics.
10. Billing service finalizes credit burn and releases unused hold.
11. Reporting service updates customer dashboard.

## How Codex should fit

Codex should be treated as part of the execution layer, not the billing system.

### Worker responsibilities

- create the run context
- pass workflow instructions and guardrails
- capture step-level events
- detect approval boundaries
- persist evidence
- emit usage metadata

### Billing responsibilities

Separate service logic should:

- reserve credits before execution
- finalize debits after execution
- reconcile actual vendor cost later

## How to measure OpenAI usage

Use two sources:

1. **Per-run app-side tracking**
   - store model name
   - store request counts
   - store token usage returned by run-time API responses when available

2. **Periodic OpenAI reconciliation**
   - query organization usage and costs APIs
   - reconcile against internal run totals
   - alert on drift

OpenAI’s docs show admin usage endpoints for aggregated completions usage and costs, including token counts, request counts, and monetary values by time bucket. They also document background responses for long-running work that can be polled asynchronously.

## Stripe recommendation

Use Stripe for:

- subscription checkout
- monthly platform fee
- monthly credit grants
- one-time top-up purchases
- overage invoices

### Best customer-facing pricing structure

- base subscription includes support + platform access + monthly credits
- credits burn down as runs execute
- optional top-up packs
- optional overage when credits go negative or soft-limit is exceeded

### Implementation note

Stripe’s modern billing stack supports usage-based billing, meters, and credit-oriented models. For BuildVora, Stripe should own cash collection and invoicing while your app remains the source of truth for run-level credit debits.

## Approval system

Approval checkpoints should be first-class objects, not ad hoc pauses.

Approval policies should support:

- required approver roles
- max wait time
- auto-cancel vs auto-expire
- step categories that require approval

Examples:

- send external email
- submit legal form
- modify financial setting
- place order
- edit CRM records

## First version scope

### Build now

- auth
- account model
- client dashboard
- workflow model
- workflow version model
- run queue
- credit ledger
- Stripe subscription + top-up flow
- approval checkpoints
- run detail page with evidence
- connections / secrets management
- admin reconciliation job

### Skip for now

- multi-region workers
- enterprise SSO
- custom contract billing
- per-client VPC deployments
- advanced pricing-plan preview features unless needed immediately

## Recommended rollout

### Phase 1

- Next.js + Postgres + Redis + Stripe
- one worker service
- one credit ledger
- simple reserve/finalize billing logic
- internal admin dashboard
- signed client dashboard for running provisioned workflows

### Phase 2

- S3 artifact storage
- isolated worker containers
- richer approval workflows
- automated vendor-cost reconciliation
- soft and hard credit thresholds
- workflow import and version management

### Phase 3

- AWS worker autoscaling
- enterprise audit exports
- policy packs by vertical
- contract pricing and account-level SLAs

## Final recommendation

Build the first backend as a **credits ledger + queued execution platform**, not as a direct wrapper around OpenAI billing.

The right initial stack is:

- `Next.js` on Vercel
- `Postgres`
- `Redis`
- `Stripe`
- one dedicated worker runtime for Codex/browser runs

Add AWS when worker isolation and scale justify it. Do not make AWS a prerequisite for version one.
