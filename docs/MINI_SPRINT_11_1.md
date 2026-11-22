# Mini-sprint 11.1 — Business review and SetPilot demo

Owner authorization: 22 November 2026. Base commit: `30d9a0a1799059ea03848e0116e0007a03f94b06` on `sprint-11-evaluation-sandbox`. This branch targets that branch for review; it does not merge PR #8 or publish the main product.

## Delivered scope

- Business Review moves technical exports and identifiers into keyboard-accessible Details & exports / Reference details disclosures. Source approval, browser-only storage and open questions stay visible. Export schemas and approval semantics are unchanged.
- The independent demo starts with an editable, fictitious SetPilot coach-access and queued weekly-report sample. The source and behaviour decisions are drafts. The potential background path remains an OPEN question, not a confirmed workflow. This fixture is separate from the frozen study scenarios.
- Reset demo sample requires confirmation, restores the original sample and removes only its known review/provenance/planning/handoff records. Unrelated evaluation and workspace records survive. A failed write attempts restoration and reports its actual outcome. Browser crash recovery is not an atomic storage guarantee.
- Demo edits remain local. The demo build uses only the public `NEXT_PUBLIC_VISUAL_SDD_DEMO=1` switch; no Auth or database credential is provisioned. Cloud/API and OAuth callback paths are gated before Auth initialization. The normal build retains existing authentication and owner checks.
- Full User Manual revision is deferred by the owner. Research scenarios, scoring, allocation and participant counts are unchanged.

## Screenshots

Same synthetic source/review records and viewport sizes are used for the normal workspace before/after comparison. Stored-state comparison files are included beside the screenshots.

| Viewport | Before | After |
| --- | --- | --- |
| Desktop 1280 px | [Before](evidence/ms-11-1/before-1280.png) | [After](evidence/ms-11-1/after-1280.png) |
| Narrow 390 px | [Before](evidence/ms-11-1/before-390.png) | [After](evidence/ms-11-1/after-390.png) |

## Reproducible scenario catalog

| ID | Executable check | Expected result |
| --- | --- | --- |
| MS-U01 | `tests/demo.test.mjs`: fixture validity and draft/open states | Two valid rules; no background workflow or automatic approval |
| MS-U02 | Independent fixture copies | Mutation does not alter later samples |
| MS-U03 | Initial install / revisit | Initial sample installed; later edits retained |
| MS-U04 | Reset scope | Demo restored; unrelated records retained |
| MS-U05 | Unowned source | Existing work is never silently replaced |
| MS-U06 | Corrupt source | Bytes preserved until explicit reset |
| MS-U07 | Failed write | Previous bytes restored when storage permits |
| MS-B01 | `tests_browser/business-review.spec.mjs` | Disclosures do not mutate data; exported review remains exact |
| MS-D01 | `tests_browser/demo.spec.mjs`: first visit | Draft SetPilot, open questions, no account API calls |
| MS-D02 | Edit / reload / cancel reset | Edits persist; cancellation changes nothing |
| MS-D03 | Confirm reset | Exact initial source/review restored; unrelated data retained |
| MS-D04 | Failed reset | Failure reported; previous records preserved |
| MS-D05 | Another tab | Stale editing paused; explicit reload restores saved state |
| MS-D06 | Corrupt source | Recovery requires deliberate reset |
| MS-D07 | Auth/workspace endpoints | Refused without contacting live account/database services |
| MS-D08 | Keyboard, widths and accessibility | Disclosures operable; no horizontal overflow; Chromium accessibility audit |

Normal regression and demo builds run separately. Each browser suite runs desktop Chromium, mobile Chromium, desktop Firefox and mobile WebKit in CI with zero retries. Local Chrome verification is supplementary, not a claim to have tested other engines locally. CI keeps logs, JSON, screenshots and failure traces for 90 days; executable definitions and this catalog remain in Git history.

## Final verification and access

Final commit, CI runs, deployment URL, anonymous-access evidence and remaining limitations are recorded in the PR after verification. Automated engineering checks do not establish stakeholder comprehension or research validity.
