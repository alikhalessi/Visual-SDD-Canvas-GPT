# Sprint 09 — Verification evidence for PR #6

Date: 2026-11-21. Repository: alikhalessi/Visual-SDD-Canvas-GPT.

## Baseline and owner evidence

The incoming branch head was `3eaaf3e4aa3c2901ee2eab682d4ee81e478c94e0`; [CI #207](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/44911187131) succeeded. The existing preview served code commit `8caddfef2bc3b77f122d331dbdcde231cd5b8ba1` (deployment `dpl_6LA6HgcCt3yx1dtL1DYzSMZeagN4`, READY). These are distinct commits; intervening commits only changed documentation.

The owner's supplied browser export was independently read: schema v1, specification revision 2, C-001 → REQ-002 and C-002 → REQ-003, correct original source spans, and `paths: []`. The owner confirmed that export. It proves rule provenance, not selected-path persistence: no path was selected. The private owner export is not committed to this public repository.

## Fixed findings

- The old background-path test selected the first proposal, which was an interactive path. Its universal assertion could also pass on an empty edge list. New parameterized tests explicitly select every background proposal in the revocation/report brief and require a nonempty edge on the correct requirement.
- The change summary hid the existing empty REQ-001. It now separately reports all retained requirements, those with text, empty placeholder IDs, and the resulting total. The one-placeholder/two-rule case reads 1 retained, 0 with text, 1 empty, 3 after import.
- New path receipts explicitly record `disposition: open-edge-flag` and the created `edgeId`. Legacy receipts remain readable. The disposition describes the import event, not the edge's eventual review status.
- The provenance reader now rejects null records, duplicate candidate/path identifiers and invalid new mappings without throwing or replacing history.
- Pending previews now detect source or review changes, including same-revision content changes. Changing project identity remounts the panel so a preview cannot be reused across projects.

## Automated coverage

Local Windows/Node 22 checkout: **214/214 Node tests**, **9/9 Python tests**, adapter self-test, TypeScript and optimized Next.js build passed. The build used ephemeral test-only Auth configuration, never production secrets.

`tests_browser/vibe-import.spec.mjs` runs seven scenarios in desktop Chromium and Pixel 7 mobile emulation (**14 cases**). Each gets a fresh isolated browser context, synthetic source with an empty REQ-001, and unrelated-project storage sentinel. Local runs stub only guest Auth session reads; deployed-preview runs do not stub Auth.

1. All choices begin unchecked; scheduled-path selection adds one open flag on REQ-003, one explicitly selected interactive workflow on REQ-002, no background workflow, no approval. Cancel first: all three records stay unchanged. Confirm: reload restores the same source/review; downloaded JSON exactly matches stored provenance and links the quote, requirement and edge ID. Stakeholder approval remains disabled.
2. Selecting the scheduled path with its parent rule unselected fails before confirmation or storage writes.
3. Editing stakeholder rationale after preview blocks commit and preserves the new note.
4–6. One-shot failures of review, history and source writes each restore all three original records, retain the unrelated-project sentinel, and leave the source at revision 1.
7. Keyboard Space selects the rule/path and commit is focusable. The import panel has no horizontal overflow at the configured desktop/mobile viewport.

The full CI workflow now installs the pinned browser-test dependency from the lockfile and runs these browser cases after the production build. Screenshots and synthetic provenance are attached to the positive browser test; the machine-readable local run record is `test-results/results.json` (ignored, not a source artifact).

## Final remote evidence

The exact final branch head, fresh CI run, matching Vercel preview deployment, deployed-browser result and protected-access limitations are recorded in the live [PR #6 verification record](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/6). This avoids claiming that an earlier green build verifies later code. The PR is the current release-candidate record; merge and production release require a separate owner decision.

## Remaining human scope

The expanded Chromium/Firefox/WebKit matrix and live Google sign-in are documented below. Emulation is not a physical phone, a screen-reader-user study, or human comprehension/semantic acceptance. Exact live cloud outcomes are recorded in PR #6. The existing two-rule owner acceptance remains credited. Owner sign-off on the revised count and selected-path meaning remains a product decision, not a technical test result. No new operator instructions or re-entry of the owner's existing rules are required by this work.

Review sidecar and provenance remain browser-local/exportable, not cloud-synced or tamper-evident. Storage compensation was verified for recoverable single-write failures; crash-atomic or permanently failed rollback is not promised. Project-key separation and an unrelated sentinel were checked; signed-in live cloud outcomes are explicitly separated from mock-API regression coverage in PR #6. Sprint 10, main merge, schema changes and production release are outside this authorization.

## Extended release-readiness verification

The permanent [scenario catalog](SPRINT_09_TEST_CATALOG.md) maps all 12 browser cases to their inputs, assertions and source files. CI preserves per-test Node/Python logs, build/typecheck logs, exact head/run context, machine-readable and HTML browser results, attachments and failure traces as a downloadable verification artifact with a requested 90-day retention. Private live-account evidence remains local; its outcome and hashes are recorded in PR #6.

Follow-up verification reproduced two real project-link defects before fixing them: assigning the first cloud ID hid guest-local review/provenance, and reloading lost the cloud project identity. The first-save path now copies (never removes) guest records into the newly assigned project key, preserves existing target records, and compensates failed copies. A versioned local cloud-link hint restores the project ID and optimistic-concurrency token only when its specification/source identity matches. It contains no login credential and grants no server access. Loading another existing project does not copy guest notes into it.

Six domain checks cover identity round trips, source mismatch, idea-only projects, malformed references, byte-preserving copies, destination preservation and failed-copy compensation. Three browser scenarios test first-save review/history retention, reload/switch isolation, and preservation of an unreadable source even when the cloud-link hint is also corrupt, with independent mock Auth/API data (not a claim of live DB persistence).

Unreadable-source recovery and storage alerts now remain visible in both business and engineering views. A regression case confirms that a corrupt cloud-link hint cannot bypass the source recovery guard or erase either original byte sequence.

A 320px viewport check also found a real header overflow: the Google button could escape the viewport when the account toolbar shrank. Reserving its width lets the workspace breadcrumb truncate as intended. Cross-browser import checks found an initial-hydration remount that could close a just-opened disclosure; the importer is now keyed by cloud project identity, while its existing source/review snapshot guard still rejects stale commits.

Keyboard and 320/390/768px layout checks run in Chromium, Firefox and WebKit. Automated WCAG A/AA rules are audited with axe on Chromium; axe injection crashed the Windows Firefox test process, so Firefox/WebKit remain functional/keyboard/layout checks rather than axe audit claims. Mobile profiles emulate browser characteristics; no physical phone or assistive-technology user study is claimed.

Real Google OAuth on the stable Sprint 09 preview completed using the already signed-in account and returned to the app. No credentials were read or changed. Live cloud save/reload, project-switch and concurrency outcomes, exact new CI/deployment IDs and any remaining blockers are recorded in PR #6 after final verification. Owner release permission remains separate.

The expanded local source passes 220 Node checks and 9 Python checks. The browser matrix contains 48 scenarios (12 cases across desktop/mobile Chromium, desktop Firefox and mobile WebKit); exact final results and the matched CI head are recorded in PR #6. Chromium performs the axe WCAG audit; the other engines retain keyboard/layout and all functional assertions.
