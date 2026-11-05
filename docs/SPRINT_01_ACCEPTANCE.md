# Sprint 01 — Visual Specification Editor
Status: implemented; release verification and Product Owner sign-off pending.

## Scope
- Start a structured specification from a validated saved idea (no AI model required).
- Edit product intent, audience, exclusions, requirements, priorities and acceptance criteria.
- Stable requirement / criterion identities within the current document.
- Live structural validation and explicit, two-step human approval.
- Any revision automatically invalidates prior approval.
- Browser-local persistence with checked schema; no cloud data claims.
- Export user-edited artifact to Markdown and JSON, showing approval and revision metadata.
- Integrate editor with the existing Visual SDD workspace and Specify stage.

## Acceptance criteria
| ID | Criterion | Verification |
| --- | --- | --- |
| AC-01-01 | Idea creates a draft specification with provenance | Unit test & UI action |
| AC-01-02 | Editor allows changing goal, audience and scope | Browser interaction |
| AC-01-03 | Requirements and testable acceptance checks can be added/edited/removed | Unit test & UI action |
| AC-01-04 | Approval impossible for incomplete specifications | Unit test |
| AC-01-05 | Valid specification receives approval of exact revision | Unit test |
| AC-01-06 | A new edit reopens the draft | Unit test |
| AC-01-07 | Browser storage roundtrip and malformed document rejection | Unit test |
| AC-01-08 | Downloadable Markdown and JSON exports contain current data | Unit test and UI |
| AC-01-09 | Source push, successful production build and URL | GitHub / Vercel |
| AC-01-10 | DOCX report and owner sign-off | Delivery gate |

## Out of scope
No AI-generated specification, coding agent orchestration, executable workflow canvas, external repository synchronization, shared accounts or multi-tenant data persistence. The browser-local approval is a workflow decision and never authorizes code execution.

## Known limitations
The current storage is browser-local; different devices do not sync. The visual stage canvas is still an informational diagram. Vercel Git integration may require separate account setup; direct API deployment is used if not available.
