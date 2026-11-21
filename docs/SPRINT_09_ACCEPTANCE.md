# Sprint 09 — Vibe-to-Spec Ingestion: Acceptance Matrix

**Status:** Implementation in feature branch; initial automated and real-browser verification pending. No production release or owner sign-off is claimed.

| ID | Contract | Evidence required | Status |
| --- | --- | --- | --- |
| S09-01 | Offline, bounded deterministic parser with original source spans | Unit tests plus repeated same-input run | Implementation prepared; CI pending |
| S09-02 | Clear explicit-vs-speculative classifications and blind spots | Unit tests and owner preview | Implementation prepared; browser pending |
| S09-03 | Hidden queued/report/cache/session/role paths only proposed | Unit tests and walkthrough | Implementation prepared; browser pending |
| S09-04 | Every proposed rule and path starts unselected; title, statement, priority can be edited | UI wiring and browser interaction | Implementation prepared; browser pending |
| S09-05 | Preview and confirmed import are distinct; no silent source or review approval | Unit and browser tests | Implementation prepared; browser pending |
| S09-06 | Convert to v1 requirements plus versioned, project-linked review records | Domain unit/validation tests | Implementation prepared; CI pending |
| S09-07 | Duplicate/malformed/hostile/oversized input fails closed without partial source change | Negative/fuzz unit tests | Implementation prepared; CI pending |
| S09-08 | Source change invalidates source and stakeholder approvals, retaining prior notes | Unit tests and real browser | Implementation prepared; browser pending |
| S09-09 | Browser-local persistence rollback and recovery are explicit, no cloud claims | Unit/wiring and failed-storage browser tests | Implementation prepared; browser pending |
| S09-10 | Preserve all Sprint 00–08 Node/Python, typing and build tests | Real CI run | Pending |
| S09-11 | Accessible mobile and keyboard-only interaction | Real device and keyboard QA | Pending |
| S09-12 | ADR, owner guide, roadmap, PR/review, deployment evidence and owner sign-off | GitHub record and real deployment | Pending |

## Manual owner acceptance scenario

Paste: "An athlete must be able to revoke coach access to the dashboard. The system should queue weekly reports and check permissions when delivering a report."

Expected: two rule candidates with source quotes; at least one potential background/timing path is presented as **speculative**. Nothing is selected by default. Select one or both rules, optionally choose interactive links and open edge flags. Confirm. Newly imported requirements are source **draft**, not approved; acceptance criteria still need human editing. Old records are not removed. Refresh; confirm persistence. Edit a source rule; any previous sign-off must become stale.

Also test unsafe/duplicated brief errors, selecting a path whose rule is unselected, an unrelated project and storage failure. A successful CI result is not a substitute for mobile/keyboard or owner acceptance.

**Gate to Sprint 10:** Owner verifies preview/commit and explicitly approves candidate-to-canonical mapping. Do not advance automatically.
