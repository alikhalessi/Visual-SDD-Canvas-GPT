# ADR-017 — Dual-Mode Stakeholder View over revision-linked specification records

**Status:** Proposed implementation for Sprint 08; owner acceptance pending.

## Context

Sprints 00–07 have a versioned `Specification` (schema v1) with requirements and criteria, and a separate browser-local planning model. These records are used by `workflow-core.ts`, `impact-core.ts`, existing GitHub evidence panels, and the owner-gated runner. They must remain stable. `workflow-core.ts` represents *delivery stages*, not the product's UI/background workflows. The legacy cloud workspace route persists only known v1 specification shapes and cannot safely promise storage of new review metadata.

## Decision

1. **Single conceptual specification model, additive versioned records.** Keep v1 `Specification` as the sole source for each business rule's text, ID, priority, acceptance criteria, revision and source approval. Use an explicitly linked, versioned `StakeholderReviewDocument` to store stakeholder-authored business workflows, uncovered/edge conditions, scenario examples, rationale and review decisions. `projectStakeholderRules(spec, review)` is a deterministic projection, not an independent copy of requirements. No new field is silently injected into `Specification`.
2. **No invented business paths.** Workflow classifications are explicitly supplied by a reviewer (`interactive` or `background`). A missing workflow is shown as missing. Existing acceptance criteria are displayed as source context and never silently treated as reviewed Given–When–Then examples.
3. **Distinct governance states.** `No Example`, `Example Attached` and `Behaviour Reviewed & Approved` are separate statuses. Approval requires an explicit human confirmation, at least one mapped workflow and an example per workflow, a rationale, and no open edge flags. Resolving an edge flag requires linking an existing behavioural example and writing a case-specific rationale; deleting that example reopens the flag. This is documentation review, not proven behavioral completeness, tests or source specification approval.
4. **Revision binding.** Every change to a rule's review content increments its review revision and clears its review sign-off; changed source specification revisions rebase matching review notes, clear all review sign-offs and preserve source links. Removed requirement notes are retained in the local review document but excluded from the active projection. An approved review records both its rule revision and source specification revision.
5. **Default Business Review mode.** The top-level mode switch defaults to Business Review, while Engineering Cockpit retains all existing panels and legacy Simple/Professional density settings. Mode switches do not mutate any domain record or reset approval. Engineering Cockpit includes a read-only `StakeholderEngineeringSummary` projected from the exact same Specification and locally persisted review sidecar, exposing open edge flags without taking control of them.
6. **Browser-local, recoverable persistence.** A project-identity-scoped localStorage key saves the review sidecar, distinct from v1 source and Plan/Task storage. Invalid caches are not overwritten and require export/explicit clearing. The review model can be exported as JSON. The UI says clearly that the sidecar is not cloud-synced. No database migration or workspace API change is implied.
7. **Bounded, pure operations.** `lib/stakeholder-view-core.ts` contains validation, projection, mutations, revision and approval checks; `components/business-review-canvas.tsx` and `components/stakeholder-engineering-summary.tsx` contain React state and presentation; `app/business-review.css` contains presentation. Any user text is rendered as React escaped text, not HTML.

## Alternatives considered

- **Rewrite `spec-core.ts` schema v1:** rejected: breaks read/approval/persistence interoperability.
- **Store review state in React only:** rejected: ephemeral and not revision-aware.
- **Infer background paths from words such as "send" or "report":** rejected for Sprint 08: speculative behavior could be mistaken for fact. Explicit candidate inference belongs in Sprint 09.
- **Store workflow records in `PlanningDocument`:** rejected: business flows are not technical delivery steps, and business reviewers must be able to work before a Plan is approved.

## Risks and limitations

- **Conceptual SUM versus single physical table:** two linked schema v1 documents form one revision-linked model, but browser-local review notes are not present in the existing Neon cloud record. Sprint 10 parity work must use the combined canonical model and verify all exported fields; this sprint does not claim full across-device or export parity.
- **No cryptographic signature:** sign-off is a browser-local human assertion. No authenticated reviewer identity or tamper resistance is claimed.
- **No automatic completeness proof:** checking one scenario per recorded workflow is a minimal review gate, not an assurance that unknown workflows or edges were discovered.
- **Manual browser acceptance remains necessary:** keyboard navigation and CSS semantics require real-browser checks, as do storage failure and project-switch cases.
- **Old `workflow-core`, `spec-core`, agent runner, Python scripts and existing migrations must remain unchanged.**

## Verification requirements

`npm test`, `npm run typecheck`, `npm run build`, existing Python regression checks, CI, manual project switching, malformed-cache recovery and stakeholder usability walkthrough. Evidence must be collected before release acceptance.
