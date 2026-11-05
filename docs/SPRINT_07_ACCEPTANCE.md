# Sprint 07 — UX & Quality Acceptance

**Status:** implementation in progress; tests and production deployment to be verified separately.  
**Approval:** Product Owner acceptance pending; Sprint 08 not authorized.

## Release intent
Turn Visual SDD from a feature-heavy prototype into a clearer, safer and more readable human-governed pilot, without weakening approval gates or overstating cloud/agent capabilities.

## Delivered implementation
1. Replace passive marketing-only Overview column with a state-aware project command center, next action and accurate Browser/Cloud-linked label.
2. Plain Language mode reduces visual duplication; Professional mode reveals expanded seven-stage Overview and traceability detail. Both retain the same controls/permission boundaries.
3. Fix stale UX copy that said Technical Planning was unavailable, although it has been implemented.
4. A Specification approved at the current revision exposes a direct Continue to Technical Planning action.
5. Show validation feedback beside title, goal, audience, Requirement title/behavior and acceptance criteria with aria-invalid / aria-describedby.
6. Protect unreadable local Specifications from silent overwrite, preserve original text, support recovery download and require user confirmation before a focused cache clear.
7. Reject invalid incoming cloud Specifications before replacing the current project state.
8. Improve responsive text scale, keyboard focus, mobile touch targets and input size through a dedicated non-destructive quality stylesheet.
9. Deliver Mermaid UX journey maps and a source-based UX/security audit that identifies carry-over limitations.

## Acceptance matrix
| ID | Acceptance | Evidence source |
|---|---|---|
| S07-01 | Clear next action based on actual Idea and Specification state | quality-core tests |
| S07-02 | No fabricated agent or overall project completion | readiness unit tests, UI copy |
| S07-03 | Browser / Cloud-linked storage wording accurate | quality-core + wiring tests |
| S07-04 | Plain/Professional actually change the density of UI | JSX wiring + CSS |
| S07-05 | Field-level validation accessible to assistive technology | editor wiring + source review |
| S07-06 | Unreadable Specification is preserved, exportable, and cleared only on explicit approval | recovery unit + wiring tests |
| S07-07 | Invalid cloud Specification cannot erase local context | cloud-load guard wiring tests |
| S07-08 | Navigation, focus and touch controls remain reachable | CSS and wiring tests; device QA pending |
| S07-09 | Existing SDD approval, impact, GitHub and Neon Auth functionality preserved | full Node test suite, TypeScript & Next.js build |
| S07-10 | Production release is READY and alias points to it | Vercel release data |
| S07-11 | UX map, audit, English DOCX report and downloadable backup provided | GitHub docs and verified Word/ZIP |
| S07-12 | Real-device/real-browser end-to-end acceptance | **Pending manual user/browser validation** |

## Excluded
No real Codex code production, no automatic source merge, no private GitHub App, no cloud Plan/Task migration, no formal WCAG AA conformance certificate, no claims of successful mobile screenshots or in-person usability study. These require separate approvals.

## Product Owner gate
Owner reviews new user experience and recovery semantics, then explicitly approves or requests revisions. Do not advance into unapproved Sprints 08–10.
