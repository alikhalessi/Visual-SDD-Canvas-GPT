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

Automated Chromium/mobile emulation is not a real phone, screen reader, Safari/Firefox, live Google consent/login, cross-device/cloud save/reload, or a human comprehension/semantic acceptance study. The existing two-rule owner acceptance remains credited. Owner sign-off on the revised count and selected-path meaning remains a product decision, not a technical test result. No new operator instructions or re-entry of the owner's existing rules are required by this work.

Review sidecar and provenance remain browser-local/exportable, not cloud-synced or tamper-evident. Storage compensation was verified for recoverable single-write failures; crash-atomic or permanently failed rollback is not promised. Project-key separation and an unrelated sentinel were checked; a signed-in live cloud-project-switch acceptance was not claimed. Sprint 10, main merge, schema changes and production release are outside this authorization.
