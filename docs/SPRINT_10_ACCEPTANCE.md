# Sprint 10 acceptance matrix

Engineering verification remains distinct from human comprehension studies. The owner explicitly authorized PR #7 merge and production publication after the candidate checks. Exact final counts, approved code head, documentation closeout, production deployment and post-deploy results are linked in [the release record](SPRINT_10_RELEASE_RECORD.md) and PR #7; no earlier green run is substituted for a later source revision.

| ID | Contract | Verification |
| --- | --- | --- |
| S10-01 | Explain actual task/workflow relationships and uncertainty | Business impact unit checks; engineering browser projection of the same open edge |
| S10-02 | Preserve all supported source/review facts and archived removed-rule notes | Canonical snapshot and archived-record tests; unsupported fields and ambiguous IDs rejected |
| S10-03 | Identical canonical input gives stable bytes and SHA-256 | Repeated compile, insertion/collection order and NFC/LF normalization; known SHA-256 vector |
| S10-04 | Every material edit invalidates current snapshot sign-off | Source revision, same-revision content and rationale edits; browser edit/reload scenario; history retained |
| S10-05 | Actor, provenance, decision, rationale, time, scope and digest are recorded | Local assertion schema and complete history tests; full history refuses append rather than trimming |
| S10-06 | Open edges and incomplete review never authorize implementation | Draft export retains open flag; approval disabled; forged unresolved approval rejected |
| S10-07 | Business/text/agent parity fails closed | Independent negatives alter rule, condition, workflow kind, example, decision, coverage, execution claim, text or manifest |
| S10-08 | Untrusted Markdown cannot forge sections | Exact whole-text verification and escaped code fences/HTML in data |
| S10-09 | Export does not dispatch or grant execution | Manifest authorization always false; UI exports only; bridge restricted to validate-only |
| S10-10 | Legacy compatibility is scoped and tested | New bundle translated to one approved task, validated with actual Python v1 validator; no full-interoperability claim |
| S10-11 | Stale cross-tab source, history or plan stops writes/download | Fresh checks around asynchronous validation; browser another-tab source case |
| S10-12 | Corrupt storage and write failure preserve originals | Raw recovery download and explicit failed-write/retry browser cases; first-save copy compensation tests |
| S10-13 | Keyboard, focus and narrow modal remain usable | Native dialog Escape/focus restoration, 320px bounds, Chromium axe audit and functional cross-engine matrix |
| S10-14 | Existing v1 readers/API/runner and prior sprints remain compatible | Full Node/Python/browser regression suite; no Neon schema change |
| S10-15 | Scenario definitions and per-run evidence remain reviewable | Versioned catalog, 90-day CI logs/HTML/JSON/attachments, rendered delivery reports |

Draft export is intentionally available when review is incomplete; the exported package explicitly states blocked readiness and carries every open question. It does not grant approval. Physical device/screen-reader-user studies and authenticated/auditable sign-off remain outside the verified scope. The owner subsequently gave the separate merge/publication authorization. Sprint 11 remains unauthorized.
