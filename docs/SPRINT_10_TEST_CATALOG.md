# Sprint 10 scenario catalog and evidence

This versioned catalog records scenarios and their expected outcomes. Code fixtures are synthetic and isolated from the owner's account. CI captures every test name/result, exact head/run context, build/typecheck logs, browser JSON/HTML reports, attachment evidence and failure traces. Verification and report-render artifacts request 90-day retention; test code and expectations remain in Git history after artifacts expire.

## Domain and compatibility cases

[Agent handoff tests](../tests/agent-handoff.test.mjs) cover: known SHA-256 vector; repeated byte identity; object/record ordering; NFC/LF normalization; unsupported fields; duplicate IDs; cycles/non-JSON/oversized/deep input; draft placeholders and missing reviews; retained open scheduled flags; stale review refusal; archived removed-rule notes; complete local sign-off fields; revision, same-revision and rationale staleness; superseding changes-requested decisions; malformed history; short/invalid reviewer input; code-fence/HTML injection; project-key separation; actual Python v1 validation of the validate-only bridge; stale/tampered/unapproved/missing-baseline bridge refusal; missing source approval time; forged review approval with open coverage; and history-cap preservation.

[Parity tests](../tests/parity-verification.test.mjs) independently mutate requirement wording, acceptance condition, workflow kind, example precondition, source approval, review decision, coverage label, rule presence, execution authorization, Markdown content and unknown manifest fields. Each must fail parity; untouched projections must pass.

[Business impact tests](../tests/business-impact.test.mjs) verify baseline uncertainty, actual recorded workflow/task relationships, open timing-question semantics, missing background examples and rejection of foreign review identity. [Cloud-link tests](../tests/cloud-link.test.mjs) additionally check exact sign-off copying and compensation when its write fails. Existing source/review/import/planning/runner tests remain active.

## Browser cases

Each case in [the executable browser suite](../tests_browser/handoff.spec.mjs) runs in desktop/mobile Chromium, desktop Firefox and mobile WebKit. Seven cases produce 28 results in addition to the existing 48-result matrix.

| ID | Setup and action | Expected result |
| --- | --- | --- |
| S10-B01 | Approved source, an open queued-delivery flag, attempt approval and download draft manifest | Approval disabled; flag retained as open, only original interactive workflow retained, readiness blocked and execution false |
| S10-B02 | Complete source/review, explicit named approval/rationale/confirmation, reload, then edit goal | Current decision persists; after edit it is stale; original history remains; no execution claim |
| S10-B03 | Invalid sign-off JSON at the project key | Original bytes preserved; raw recovery download identical; normal export unavailable |
| S10-B04 | Change stored source as another tab while dialog remains open | Current export refused before download; stale state not accepted |
| S10-B05 | Open native dialog, inspect at 320px, Escape | Focus stays inside modal, modal fits width and focus returns to trigger; Chromium WCAG A/AA audit has no violations |
| S10-B06 | Inject one failed sign-off write, then explicit retry | First attempt leaves history unchanged; retry records exactly one changes-requested decision |
| S10-B07 | Switch to Engineering impact using the same source/review | The identical recorded timing question and non-workflow warning remain visible |

Passing tests are not product comprehension acceptance, authenticated signatures, full interoperability, physical-device evidence or proof that implemented business behaviour is correct. Exact final CI/preview/deployed-browser evidence and any protection/tool limitations belong in the PR verification record. No unexecuted case is counted as passed.
