# Sprint 11 reproducible scenario catalog

Every scenario below has executable code. Prior sprint definitions remain unchanged. Exact head SHA, run/attempt, per-case outcomes, screenshots and JSON attachments are retained in the PR verification record and the `sprint-11-verification-<sha>-<attempt>` artifact. Artifact retention is 90 days; test/scenario definitions remain versioned in Git. No owner data, real participant response or private reference answer is uploaded.

## Core and research scoring

`tests/evaluation-sandbox.test.mjs` covers valid frozen legacy records; exact distinct scenario digests; absence of keys in public data; equal projections; separate missing/extra/duplicate/changed-wording/changed-link/hidden-flag negatives; balanced allocation and invalid slots; consent/pseudonym/unit bounds; required distinct rule findings and known evidence; independent prediction gates and valid options; bounded timers and date order; all four complete replayable assignments; stale/malformed session fields, hashes, conditions, consent, evidence, predictions, completion and order; retained interrupted history and restart limit; CSV multiline/formula handling; artificial-reference scoring; and invalid reference versions/digests/options.

The artificial scoring oracle is deliberately different from the real study reference, so tests do not publish the reference key. Actual answers are frozen in a private local package bound to the public scenario hashes, and are used only by the separate offline scorer. Unit tests and local scoring rehearsals are engineering evidence, not participant observations.

## Browser scenarios

`tests_browser/evaluation.spec.mjs` runs each case below on desktop Chromium, mobile Chromium, desktop Firefox and mobile WebKit. There are no retries. Chromium performs the automated axe audit; Firefox/WebKit check functional flow, keyboard/focus and layout.

| Case | Input / action | Expected outcome |
| --- | --- | --- |
| E11-B01–04 | Allocation slots 0, 1, 2 and 3 | Both scenarios/conditions complete; review locked before quiz; exact replayable JSON/CSV, positive elapsed times, no API request, owner-key sentinels unchanged |
| E11-B05 | Same scenario in visual and text conditions | DOM record IDs and substantive text identical; open status preserved; synthetic screenshots attached |
| E11-B06 | Corrupt stored JSON | Raw download exactly preserves bytes; no silent fresh session |
| E11-B07 | Evaluation write throws | Prior bytes unchanged; explanation still editable; explicit retry advances once |
| E11-B08 | Another-tab change before submission | Stale submission rejected; external bytes retained |
| E11-B09 | Reload active trial, restart, cancel then confirm withdrawal | Abandoned history retained; same pseudonym; cancellation preserves; confirmation clears only evaluation state |
| E11-B10 | Keyboard and 320px visual review | Heading focus moves to judgement control; no horizontal overflow; Chromium axe has no reported violations |

Completed synthetic rehearsal JSON is attached for each allocation cell. DOM parity images, completion image and accessibility JSON are attached. The overall suite also retains the existing importer, handoff, cloud-isolation and accessibility scenarios. Full reports include actual per-project outcome/duration and attempt, rather than only aggregate counts.

## Boundaries

The route is an English-language, client-local, read-only research projection. It does not measure real-world implementation success, prove human comprehension, or prevent a determined participant from inspecting public source or developer tools. No physical-device or screen-reader-user study is claimed. Future participant protocol, sampling, analysis, secure reference access and any required approvals must be settled before empirical collection.
