# Sprint 09 — Acceptance matrix for owner review

Date: 2026-11-21. Engineering verification is separate from owner acceptance and production release. Exact remote evidence: [PR #6](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/6).

| ID | Contract | Evidence / status |
| --- | --- | --- |
| S09-01 | Bounded deterministic extraction with original spans | Node regression tests passed; supplied owner export confirms two mappings |
| S09-02 | Explicit/speculative wording and blind spots | Domain and UI browser assertions; human comprehension decision pending |
| S09-03 | Scheduled/revocation suggestions become open flags, never confirmed background workflows | All background proposals tested in core; scheduled flag verified through browser commit/reload/export |
| S09-04 | Rules and paths start unchecked, explicit selection | Desktop/mobile automated browser checks passed; title/statement editing covered by core/wiring |
| S09-05 | Preview, confirmation, persistence and approval remain distinct | Cancel preserves records; orphan path rejected before dialog; confirmed import remains draft |
| S09-06 | Existing v1 requirements retained and IDs linked | REQ-001 preserved, C-001 → REQ-002 and C-002 → REQ-003 verified |
| S09-07 | Duplicate, unsafe, oversized or corrupt input fails closed | Core negatives; malformed provenance and ambiguous mappings rejected |
| S09-08 | Changes invalidate source/stakeholder approval; preserve notes | Regression tests; browser blocks stale preview after rationale edit |
| S09-09 | Browser-local source/review/provenance rollback | Injected failure of each of three writes passed on desktop/mobile; permanent storage/crash durability unclaimed |
| S09-10 | Preserve prior sprint regressions | 214 Node tests, 9 Python tests, adapter self-test, typecheck/build passed locally; final CI linked in PR |
| S09-11 | Keyboard/mobile usability | Space/focus and viewport overflow automated in Chromium/mobile emulation; real device, screen reader and human UX acceptance pending |
| S09-12 | Documentation, PR and exact deployment evidence | Updated matrix/evidence/guide/ADR/roadmap; owner release decision pending |
| S09-13 | Export source/path provenance and reload | Owner's earlier two-rule export verified; new scheduled-path browser download equals stored history and links edge ID |
| S09-14 | Counts include existing empty placeholders | 1 total retained, 0 with text, 1 empty REQ-001, 3 after two new rules; core and browser assertions |

## Decision boundary

The owner already verified importing two rules and their source provenance. The previously missing selected-path engineering check is now automated through a real Chromium engine, including reload and download. Final owner approval of the revised preview remains pending; automation does not impersonate that approval.

Live Google sign-in, real mobile/accessibility acceptance, signed-in cloud-project switching and cross-device persistence remain unverified here. Notes/provenance are explicitly browser-local. No merge to main, production publication or Sprint 10 advancement is authorized by a green test result.
