# Sprint 05 — Visual Change Impact Analysis

Status: implemented; build, delivery and Product Owner verification tracked separately.

## Intended outcome
A product owner can see **what changed** in a Specification and **which approved downstream decisions and task links require reconsideration** before an agent run. This feature analyzes explicit user-authored artifacts, not hypothetical AI-generated dependencies.

## Shipped code
- `lib/impact-core.ts`: deterministic specification baseline snapshots, schema validation, ID-based requirement/criterion comparison, product-field comparison, direct task links, broader review candidates and Markdown report export.
- Newly created Technical Plans capture an independent structural snapshot of the **current, human-approved** Specification (revision + product intent + requirements + acceptance criteria).
- Existing browser-local plans without that snapshot remain readable. They are **not given an invented history**; the assessment states that exact changes are unknowable and treats all tasks as requiring review.
- SDD Canvas now has three graph modes: **Workflow graph**, **Traceability graph**, and **Change impact**.
- The Change Impact view offers selectable changed items, before/after details, linked task IDs, stale gate indicators, unlinked/potential task warnings and navigation back to Spec/Plan/Tasks.
- Human-readable Markdown export. No automatic plan update, task rewrite, approval transfer or agent invocation.
- `tests/change-impact.test.mjs` covers requirement addition/removal, acceptance changes, global context, links, revision staleness, legacy schema, parser safety and reporting.
- `tests/impact-wiring.test.mjs` covers interactive UI connections and accessibility.

## Acceptance cases

| ID | Expected | Evidence |
|---|---|---|
| S05-01 | New approved plan captures exact independent Spec snapshot | Unit tests |
| S05-02 | Requirement add/remove/edit is identifiable by ID | Unit tests |
| S05-03 | Acceptance Criterion add/remove/edit is identifiable by ID | Unit tests |
| S05-04 | Changed Criterion links to the specific task(s) referencing it | Unit tests |
| S05-05 | Changed product goal is treated as a system-wide potential impact | Unit tests |
| S05-06 | Stale or reopened Specification blocks dependent approvals and Implement | Unit tests and existing workflow gates |
| S05-07 | Legacy plans remain usable without fabricating old specification history | Unit tests |
| S05-08 | Current/previous values, affected tasks and uncertainty are accessible | UI + wiring tests; manual browser pending |
| S05-09 | Markdown impact report can be exported | Pure function + UI wiring |
| S05-10 | Existing Auth, project storage and GitHub run evidence remain intact | Build and route review; real browser test pending |
| S05-11 | Automated suite, typecheck, production build and deployment READY | Vercel logs |
| S05-12 | English DOCX report and Product Owner review | Delivery gate |

## Governance limits
- Change analysis uses **explicit IDs and recorded text**, not full semantic dependency inference. A change to one requirement can affect unlinked tasks; those are listed separately for review rather than marked safe.
- Snapshot content is stored in the same browser as plans/tasks; it is not an independently signed historical attestation.
- The original Specification still uses incremental IDs based on present items. Deleting and recreating an item could reuse an ID. This assessment detects changed text but cannot prove entity identity after ID reuse. Durable globally unique identifiers are a future hardening task.
- If the Spec is reapproved with a new revision but text is unchanged, dependent planning remains stale and must be re-reviewed. The assessment does not automatically carry approval forward.
- Plan and Task persistence is still browser-local; cloud synchronization remains pending.
- Sprint 04's verified GitHub Actions validate-only run does **not** constitute execution of Codex, verified source code or a production release.

## Definition of Done
Push code and docs → Vercel automated tests + TypeScript + Next build → confirm READY and alias → English Word report → owner review. No Sprint 06 until owner approval.
