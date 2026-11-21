# Sprint 08 — Dual-Mode Stakeholder Experience: Acceptance Matrix

**Status (2026-11-21):** Full-checkout automated tests and PR #5 GitHub CI passed; manual stakeholder review and revision invalidation passed. Mobile/keyboard, malformed-cache recovery, project-switch isolation, real Google authentication, deployment and Product Owner final sign-off remain unverified.
**Baseline:** Sprint 07 on `main`, 160 Node tests previously recorded as passing, owner/browser acceptance still pending.
**Branch/deployment:** `sprint-08-dual-mode`, commit `7cec6eb`, PR #5 (`https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/5`). No production release or empirical user study is claimed.

| ID | Acceptance criterion | Planned verification | Status |
| --- | --- | --- | --- |
| S08-01 | Business Review is the initial default, Engineering Cockpit retains a read-only stakeholder governance summary and all legacy panels | React wiring test + browser navigation | Partially passed: default business view, mode switch and legacy panels observed; detailed keyboard/mobile check pending |
| S08-02 | Switching modes does not mutate Specification or Plan/Task revisions | Unit + UI test | Automated checks passed; dedicated visual check of Plan/Task revision stability pending |
| S08-03 | Four linked primitives: rule, UI/background workflows, edges/timing, examples | Projection unit + wiring tests | Passed: automated suite and live browser UI/background workflow mapping |
| S08-04 | Source requirement IDs/wording, priority and acceptance criteria come directly from Specification | Projection tests | Passed in automated tests; linked source requirement visible in browser |
| S08-05 | Unmapped background paths remain explicitly unmapped; no implied workflow creation | Unit tests | Passed in automated tests; gaps were explicitly flagged in browser |
| S08-06 | "Example Attached" does not equal "Behaviour Reviewed & Approved" | Unit tests | Passed: attaching examples did not grant review approval |
| S08-07 | Open edge flags and missing examples/workflow/rationale block sign-off; flagged paths require linked example and resolution rationale | Unit tests + browser | Passed: open flagged path blocked approval; linked example and rationale unblocked it |
| S08-08 | Sign-off binds exact spec/rule revision; editing/rebasing invalidates previous sign-off | Unit tests | Passed: signed revision 12, then rationale edit invalidated sign-off |
| S08-09 | Rule edits use existing `updateRequirement`, invalidating existing source approval | Regression + browser | Passed: source wording edit advanced r12 to r13, returned source to draft and removed review approval |
| S08-10 | Review notes are isolated and exportable; invalid local cache never silently overwritten | Unit/wiring + browser recovery | Partial: reload persistence and export control observed; malformed-cache and project-switch recovery not manually tested |
| S08-11 | Engineering panels and gates, cloud API, migrations and runners unchanged | Existing 160 Node tests, Python, CI diff | Partial: all regression suites passed; real cloud/auth and deployment not retested |
| S08-12 | `npm test`, typecheck and Next build pass in full repo | Terminal + CI logs | Passed: local 184/184 Node, 9/9 Python, typecheck and build; PR #5 GitHub CI success |
| S08-13 | Real keyboard, mobile, project-switch and persistence tests | Browser acceptance checklist | Partial: reload passed; mobile, keyboard, project-switch pending |
| S08-14 | ADR, roadmap, Owner Guide, code, unit/wiring tests delivered | File inventory | Passed: 15 Sprint 08 files committed and PR opened |
| S08-15 | DOCX, commit/push, production URL, Product Owner sign-off | Release checklist | Pending: PR unmerged, production and owner sign-off unverified |

## Manual acceptance script

1. Start from fresh storage: default Business Review; no technical tools visible. Switch to Engineering Cockpit and verify old tabs, approvals, GitHub traceability, agent handoff and evidence panels still exist.
2. Create or load a specification with an interactive permission revocation and a queued background report scenario. Back in Business Review, verify both path types must be **explicitly** mapped.
3. Attach a scenario for the UI path only. Verify status is **Example Attached**, not approved. Add the queued path; verify its missing example blocks sign-off.
4. Flag a delayed/queued access leak; verify approval is blocked. Add a background example, link it to the flag with an explicit resolution note, write the overall review rationale and explicitly approve. Verify status is **Behaviour Reviewed & Approved** with the current spec revision.
5. Edit any example/rationale or change the source rule wording. Verify the approval becomes stale and returns to non-approved coverage without silently removing notes.
6. Reload, export JSON and confirm scoped persistence. Introduce malformed cache; verify no silent overwrite and that export/explicit clearing controls appear.
7. Check keyboard focus, labels, contrast and responsive presentation. Confirm no source Plan/Task cloud-sync claim.

**Release gate:** Owner acceptance only after complete CI evidence and manual checks. Sprint 09 not authorized by this document.

## Integration checkpoint — 2026-11-21

Evidence from the owner's actual Windows checkout and screenshots:

- `npm test`: **184 passed / 0 failed** (160 baseline plus 24 Sprint 08).
- Python unittest discovery: **9 passed / 0 failed**; TypeScript typecheck and Next.js production build passed. The local build used non-production placeholder Auth variables and does **not** verify Google sign-in.
- Git commit `7cec6eb` pushed to `sprint-08-dual-mode`; pull request **#5** opened; GitHub Actions **Visual SDD CI #186** showed a green success status (~41 seconds) in the owner's screenshot.
- Real-browser SetPilot test: reviewed live dashboard and queued background report workflows; missing scenarios and unresolved flags blocked approval; adding examples, resolving flagged paths with rationale, and explicit human confirmation approved source revision **r12**.
- F5 reload retained stakeholder records and approved status. Modifying review rationale invalidated the approval. Editing source requirement wording advanced **r12 → r13** and invalidated both prior source and behavior approval while retaining linked examples and workflows.
- Still **not verified**: mobile responsiveness, keyboard-only navigation, separate project review isolation, malformed cache recovery, genuine Google login (earlier local **502** with dummy Auth URL), production deployment, final owner acceptance. A CI green check alone does not clear these gates.

**Release decision:** Code is on an open PR, not a claimed production release. Do not mark Sprint 08 fully accepted until remaining gates are resolved or explicitly waived and documented by the owner.

## Mobile Google authentication recheck — 2026-11-21

- The owner opened the Sprint 08 Vercel preview in a mobile browser. The page rendered, but Google sign-in initially showed HTTP 403.
- Neon Auth trusted-origin inspection found only the production domain and localhost allowed. The exact preview origin `https://visual-sdd-platform-kkothma88-aleksi9.vercel.app` was added to the allowlist and verified to appear in the Neon Auth settings. No Auth secrets or existing origins were changed.
- The owner subsequently retested Google sign-in on the same mobile preview and explicitly confirmed: **works, no problem**.
- Therefore **preview-domain Google sign-in on the tested mobile device is PASS**. This does not certify all browsers, keyboard-only access, project isolation, corrupted-cache recovery, or production release.
- The Vercel preview deployment for commit `95d29c5` was reported **READY**; GitHub Actions run **#188** for the branch completed **successfully** after the documentary updates.
