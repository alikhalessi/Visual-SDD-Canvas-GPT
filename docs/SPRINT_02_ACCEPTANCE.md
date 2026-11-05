# Sprint 02 — Interactive Visual SDD Canvas

Status: implemented; verification and owner acceptance pending.

## Goal
Replace the static process preview in the SDD Canvas tab with an actual, user-editable, human-governed workflow. This is **visual SDD**, not autonomous app generation.

## Implemented scope

- Clickable 7-node workflow graph deriving statuses from real project artifacts and approval state.
- Two separate graph models: (1) workflow stages & gates; (2) requirement/acceptance/task traceability.
- Human-authored technical plan linked to exact approved Specification revision.
- Technical planning gate requiring an approved Specification; approved Plan unlocks task authoring.
- Tasks with explicit Requirement and Acceptance Criteria associations, plus coverage indicators.
- Human approval of current Plan and current Task Breakdown revisions.
- Editing a plan resets its own approval and downstream task approval. Editing tasks resets task approval only.
- Reopening the Specification or changing its revision invalidates current Plan/Tasks eligibility.
- Local storage recovery, per-project key, Markdown and JSON exports, mobile and keyboard-friendly views.
- Code execution, autonomous agents, test evidence and actual releases clearly remain disconnected.

## Acceptance matrix
| ID | Expected behavior | Evidence |
| --- | --- | --- |
| S02-01 | New and unapproved specs cannot create a technical plan | Workflow unit tests |
| S02-02 | Approved spec revision unlocks plan | Workflow unit tests |
| S02-03 | Approved technical plan unlocks task editor | Workflow unit tests, UI |
| S02-04 | Task definitions must reference valid Requirement and Criterion IDs | Workflow unit tests |
| S02-05 | Task coverage is calculated from stored explicit links | Workflow unit tests |
| S02-06 | Spec revision changes invalidate plan use, without silently deleting it | Workflow unit tests |
| S02-07 | Approvals bind to document revisions and are revoked after edits | Workflow unit tests |
| S02-08 | Workflow and traceability are distinct selectable visualizations | UI and wiring tests |
| S02-09 | Canvas is keyboard accessible and responsive | CSS and wiring tests; manual browser pending |
| S02-10 | Plan and task exports are user downloadable; local persistence explicit | Wiring tests; manual browser pending |
| S02-11 | Source is pushed, tests/typecheck/build succeed, deployment READY | GitHub & Vercel |
| S02-12 | English DOCX report and Product Owner review | Delivery gate |

## Known limitations and carry-over
Google sign-in/sign-out was reported working by the Product Owner, but end-to-end saving/loading cloud projects was deliberately deferred. Sprint 02 plans/tasks are stored **only in the browser** (and exportable), not yet persisted to the My Projects cloud database; this must be addressed before production-ready multi-device workflow support. The Vercel Git integration is not automatically connected; direct source deployment may be used. Browser interaction still needs real-device verification.

## Explicit exclusions
No Spec Kit adapter, AI coding runner, generated source code, real test evidence, remote Git diff, multi-user collaboration, drag-and-drop graph editing or cloud synchronization for planning artifacts. These should not be represented as implemented.
