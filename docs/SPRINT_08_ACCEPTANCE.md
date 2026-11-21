# Sprint 08 — Dual-Mode Stakeholder Experience: Acceptance Matrix

**Status:** Implementation package prepared; full repository tests/CI/build, browser acceptance, deployment and owner sign-off NOT YET VERIFIED.
**Baseline:** Sprint 07 on `main`, 160 Node tests previously recorded as passing, owner/browser acceptance still pending.
**Branch/deployment:** No branch commit, production deployment or real user-study result is claimed by this package.

| ID | Acceptance criterion | Planned verification | Status |
| --- | --- | --- | --- |
| S08-01 | Business Review is the initial default, Engineering Cockpit retains a read-only stakeholder governance summary and all legacy panels | React wiring test + browser navigation | Source implemented; browser pending |
| S08-02 | Switching modes does not mutate Specification or Plan/Task revisions | Unit + UI test | Core designed; browser pending |
| S08-03 | Four linked primitives: rule, UI/background workflows, edges/timing, examples | Projection unit + wiring tests | Source implemented; integrated tests pending |
| S08-04 | Source requirement IDs/wording, priority and acceptance criteria come directly from Specification | Projection tests | Source implemented; integrated tests pending |
| S08-05 | Unmapped background paths remain explicitly unmapped; no implied workflow creation | Unit tests | Source implemented; integrated tests pending |
| S08-06 | "Example Attached" does not equal "Behaviour Reviewed & Approved" | Unit tests | Source implemented; integrated tests pending |
| S08-07 | Open edge flags and missing examples/workflow/rationale block sign-off; flagged paths require linked example and resolution rationale | Unit tests + browser | Source implemented; browser pending |
| S08-08 | Sign-off binds exact spec/rule revision; editing/rebasing invalidates previous sign-off | Unit tests | Source implemented; integrated tests pending |
| S08-09 | Rule edits use existing `updateRequirement`, invalidating existing source approval | Regression + browser | Source implemented; browser pending |
| S08-10 | Review notes are isolated and exportable; invalid local cache never silently overwritten | Unit/wiring + browser recovery | Source implemented; browser pending |
| S08-11 | Engineering panels and gates, cloud API, migrations and runners unchanged | Existing 160 Node tests, Python, CI diff | Not yet fully verified |
| S08-12 | `npm test`, typecheck and Next build pass in full repo | Terminal + CI logs | Pending |
| S08-13 | Real keyboard, mobile, project-switch and persistence tests | Browser acceptance checklist | Pending |
| S08-14 | ADR, roadmap, Owner Guide, code, unit/wiring tests delivered | File inventory | Prepared |
| S08-15 | DOCX, commit/push, production URL, Product Owner sign-off | Release checklist | Pending; not claimed |

## Manual acceptance script

1. Start from fresh storage: default Business Review; no technical tools visible. Switch to Engineering Cockpit and verify old tabs, approvals, GitHub traceability, agent handoff and evidence panels still exist.
2. Create or load a specification with an interactive permission revocation and a queued background report scenario. Back in Business Review, verify both path types must be **explicitly** mapped.
3. Attach a scenario for the UI path only. Verify status is **Example Attached**, not approved. Add the queued path; verify its missing example blocks sign-off.
4. Flag a delayed/queued access leak; verify approval is blocked. Add a background example, link it to the flag with an explicit resolution note, write the overall review rationale and explicitly approve. Verify status is **Behaviour Reviewed & Approved** with the current spec revision.
5. Edit any example/rationale or change the source rule wording. Verify the approval becomes stale and returns to non-approved coverage without silently removing notes.
6. Reload, export JSON and confirm scoped persistence. Introduce malformed cache; verify no silent overwrite and that export/explicit clearing controls appear.
7. Check keyboard focus, labels, contrast and responsive presentation. Confirm no source Plan/Task cloud-sync claim.

**Release gate:** Owner acceptance only after complete CI evidence and manual checks. Sprint 09 not authorized by this document.
