# Visual SDD Canvas — Engineering & MSc Thesis Roadmap v0.2

**Repository:** `alikhalessi/Visual-SDD-Canvas-GPT` (`main`)
**Current delivery baseline:** Sprint 08 production (merged PR #5, deployment READY at https://visual-sdd-platform.vercel.app/; manually deferred QA documented)
**Current engineering work:** Sprint 09 on `sprint-09-vibe-to-spec`: scheduled/open-edge browser regression suite and explicit placeholder counts prepared for owner review. Earlier owner rule/provenance acceptance is credited. Exact final CI/preview evidence is recorded in PR #6; final product sign-off and production release remain pending.
**Research context:** MSc Computer Science, Åbo Akademi University. This roadmap is an engineering and study plan, not an approved thesis protocol or a claim of experimental results.

## 1. Product direction

Visual SDD Canvas is a **human-governed specification environment**, not a general-purpose AI app builder. Its research problem is the loss of stakeholder visibility, comprehension and effective oversight when rapid natural-language prototyping is transferred into developer-oriented, agent-executable specification workflows.

The proposed response is a **Dual-Mode Experience over a Single Underlying Model (SUM)**:

1. **Business Review Mode (default):** Plain-language, visual inspection and proposal of business rules; interactive, background, scheduled and queued workflows; edge/timing conditions; behavioral examples; coverage gaps; and revision-bound review decisions.
2. **Engineering Cockpit:** Existing specification editor, SDD delivery workflow, impact analysis, task traceability, GitHub evidence and controlled agent-run tools, retained rather than replaced.
3. **Structured Text View:** A non-graphical projection of the same records, designed to preserve the same *substantive specification information* for research comparison.
4. **Agent Spec Export:** A deterministic, revision-identified rendering of the same canonical records; never an independently editable source of truth.

**Core invariants:** one canonical set of versioned records; stable identifiers; explicit provenance; no implied behavior coverage; no automatic human approval; no agent execution merely because an export succeeds; stale approval when source records change; and fail-closed behavior on corrupted or incomplete artifacts.

## 2. Baseline and status

| Sprint | Existing deliverable | Status at roadmap update |
| --- | --- | --- |
| 00 | Project foundation, interactive SDD overview, CI, production link and report | Delivered; owner acceptance pending |
| 01 | Idea to reviewable specification through a visual editor | Production delivered; browser acceptance pending |
| 01A | Guided UX, contextual help, accessible mobile navigation and persisted display mode | Delivered; owner sign-off pending |
| 01B | Google login, secure user-scoped projects and activity history | Deployed; sign-in/out confirmed; cloud save/reload verification pending |
| 02 | Workflow stages, traceability, approved plans and linked tasks | Delivered; owner-approved |
| 03 | Owner-gated Spec Kit artifact adapter and optional GitHub Codex runner | Delivered; no verified Codex implementation run |
| 04 | Owner issue to validate-only GitHub Actions, SHA-256-backed evidence and read-only verification | Production READY; owner-approved |
| 05 | Baseline-aware change impact, dependent task review and stale approval gates | Delivered; owner-approved |
| 06 | Public PR/commit/check evidence and revision-bound task traceability | Production READY; 136 tests and real CI evidence; owner acceptance pending |
| 07 | State-aware UX, progressive disclosure, safe local recovery, accessibility fixes and audit | Production READY; **160/160 Node tests**, typecheck/build verified; owner/real-browser acceptance pending |
| **08** | **Dual-Mode Stakeholder Experience** | **Owner-authorized production release, PR #5 merged; CI and production READY; deferred keyboard/recovery/project-isolation QA remains** |
| **09** | **Vibe-to-Spec Ingestion Bridge** | **214 Node / 9 Python regressions and automated desktop/mobile browser scenarios; selected-path provenance and count clarification prepared for PR #6 owner review; final sign-off and production pending** |
| **10** | **Human-Readable Impact & Agent Handoff** | **Planned — not started** |
| **11** | **Empirical Evaluation Sandbox** | **Planned — not started** |

Existing source-of-truth files include `lib/spec-core.ts`, `lib/workflow-core.ts`, `lib/impact-core.ts`, `lib/github-trace-core.ts`, `lib/agent-run-core.ts`, `lib/run-evidence-core.ts`, `scripts/sdd_runner_adapter.py`, `scripts/verify_run.py`, `app/api/workspace/route.ts` and `SPRINT_01B_MIGRATION.sql`.

**Important baseline distinction:** `workflow-core.ts` currently represents the *SDD delivery workflow* (idea/specification/plan/tasks/implement), not the proposed *product/business workflows* (UI, queued, scheduled, background). Sprint 08 must add or adapt business-workflow records without silently reinterpreting existing SDD stage records. `spec-core.ts` currently has a validated `schemaVersion: 1` requirement/acceptance-criterion format. New semantics must not invalidate existing saved specifications.

## 3. Cross-sprint engineering contract

### 3.1 Compatibility and architecture

- **Preserve all Sprint 00–07 APIs and behavior.** Retain existing domain cores, database migrations, API routes, Python scripts, CI workflows and Node/Python tests. Prefer additive modules and explicit adapters; any necessary legacy modification must be backward-compatible and regression-tested.
- **Separate pure logic from views:** implement domain models, projections, parsing, validation, deterministic ordering, serialization, diffing, approval checks and parity verification in `lib/<module>-core.ts`; implement presentation in `components/<module>.tsx` and styling in `app/<module>.css` or the established app styles.
- **Versioned canonical records:** link business rules, business workflows, triggers/states, examples, coverage evidence, reviews and signatures to canonical specification IDs/revisions. Choose and document a backward-compatible sidecar/extension persistence strategy before implementation. Do **not** silently add fields that legacy `readSpecification` or the existing Neon workspace API cannot round-trip.
- **Explicit migrations only when justified:** preserve `SPRINT_01B_MIGRATION.sql`; add separate, reviewed migrations if server persistence is needed. Until independently verified, mark any new records as browser-local/exportable rather than cloud-synchronized.
- **Deterministic projections:** Business, Engineering, Text and Agent representations consume the same normalized records and stable IDs; lossless round-trip/parity checks cover semantically material facts, not purely visual layout.
- **Human governance:** proposals, previews, example attachment, review, approval, export, dispatch, execution and verified evidence are distinct states. Import or LLM output never counts as approved; editing any depended-on revision stales its sign-off.
- **Privacy and security:** sanitize untrusted text, bound parser/export size, prevent prompt-injection instructions from becoming authority, do not leak project data to public GitHub Issues without explicit disclosure/consent, and never place secrets in artifacts.
- **Evidence discipline:** CI success and a well-formed handoff do not prove a coding agent wrote safe software, nor that business behavior was implemented correctly.

### 3.2 Compatibility with existing agent tooling

The current `lib/agent-run-core.ts` and `scripts/sdd_runner_adapter.py` enforce a strict **v1, task-scoped, owner-gated `visual-sdd-agent-run` manifest**, and `scripts/verify_run.py` verifies the adapter's generated artifacts. The proposed `spec.manifest.json` is a **new handoff schema**, not a drop-in replacement for that legacy run manifest. Sprint 10 must define an explicit, tested compatibility/translation path (and state its supported scope), preserving the existing `validate_only` path and human authorization gates. Do not claim full Codex/Spec Kit interoperability until proven end to end.

### 3.3 Sprint Definition of Done

For **each** Sprint 08–11:

1. ADR created (`ADR-017` through `ADR-020`) with decision, alternatives, compatibility and security implications.
2. Working, accessible UI plus pure-core logic and bounded validation; legacy behavior retained.
3. Required feature unit tests and wiring/integration tests; prior Node and Python regression tests passing.
4. `npm test`, `npm run typecheck`, `npm run build`, relevant Python checks, and CI all pass with recorded evidence. Manual browser/device acceptance remains separately identified.
5. `docs/ROADMAP.md` updated to reflect actual, not aspirational, status; `docs/SPRINT_XX_ACCEPTANCE.md` and `docs/SPRINT_XX_OWNER_GUIDE.md` created.
6. English DOCX delivery report, commit/push proof and verified production deployment URL where deployment is part of the approved release; unresolved omissions are explicitly recorded.
7. Product Owner acceptance explicitly recorded. **No automatic advancement** based solely on green tests.

No invented deadlines. Gates are evidence- and owner-based.

---

## 4. Sprint 08 — Dual-Mode Stakeholder Experience

**Status:** Implementation package prepared; integration and acceptance pending.
**ADR:** `docs/ADR-017-DUAL-MODE-STAKEHOLDER-VIEW.md`
**Goal:** Make behavioral governance usable by non-technical stakeholders without removing engineering capabilities.

**Canonical/business projection:** `lib/stakeholder-view-core.ts`

- Project versioned requirements into four stakeholder-facing primitives: **Business Rule**, **Affected Business Workflows** (`Interactive / UI`, `Background / Scheduled / Queued`), **Edge & Timing Conditions**, and **Behavioral Examples** (Given–When–Then).
- Preserve stable source IDs and references back to requirements/acceptance criteria; distinguish declared facts from inferred or proposed paths.
- Expose separate coverage states: **`Example Attached`** and **`Behaviour Reviewed & Approved`**. Coverage by one example must never imply exhaustive or edge-case coverage.
- Represent missing paths, revocation, concurrency, delayed execution and state transitions explicitly, including unresolved/unknown states.
- Support proposals and review rationales without auto-approving existing specifications.

**UI:** `components/business-review-canvas.tsx`, `app/page.tsx`, `app/<module>.css`.

- Add a top-level **Business Review Mode** (new default) / **Engineering Cockpit** switch; keep the existing `Simple` / `Professional` density preference logically separate and backward-compatible.
- In Business mode, present linked cards from Rule → Business Workflows → Edge/Timing/Coverage → Examples. Hide technical cockpit panels, raw schemas, GitHub traceability and run evidence; do not delete or disable their underlying records.
- Allow a reviewer to flag a missing path, propose a Given–When–Then example, and record rationale. Show pending vs approved states in accessible language and keyboard-operable controls.
- In Engineering mode, preserve access to all existing functionality and approval gates.

**Acceptance criteria:** A stakeholder can find a queued/background path; incomplete coverage remains visibly incomplete; mode switching is non-destructive; proposal/review records retain source links; legacy pages and exports still function.

**Tests:** `tests/stakeholder-view.test.mjs`, `tests/stakeholder-view-wiring.test.mjs`.

**Required documents:** `docs/SPRINT_08_ACCEPTANCE.md`, `docs/SPRINT_08_OWNER_GUIDE.md`, ADR-017, this roadmap update.

**Gate to Sprint 09:** Owner confirms comprehension/interaction in a real browser and accepts the non-breaking record/persistence strategy.

---

## 5. Sprint 09 — Vibe-to-Spec Ingestion Bridge

**Status:** In implementation on `sprint-09-vibe-to-spec`; owner acceptance pending. Initial delivery is a deterministic offline *text-brief* importer, not screenshot crawling.
**ADR:** `docs/ADR-018-VIBE-TO-SPEC-INGESTION.md`
**Goal:** Turn an exploratory prototype description or feature brief into reviewable, linked specification *candidates*.

**Core:** `lib/vibe-ingestor-core.ts`

- Build a bounded, deterministic heuristic parser for offline tests; support an **optional** LLM JSON adapter whose output is untrusted and must pass the same schema validation.
- Extract candidate business rules, primary interactive workflows, and **potential** hidden/scheduled/queued/background paths. Probe scheduled jobs, notification queues, pending reports, cached access, stale sessions and role/guest boundary leaks.
- Attach source spans/provenance, confidence or review-required markers, and explicit blind spots; never present a speculative path as confirmed fact.
- Convert reviewed candidates through backwards-compatible adapters to valid `spec-core` records plus versioned business-workflow records. Preserve revision semantics, limits, identity and approval invalidation; fail safely on duplicates or contradictory input.
- Preview diffs before committing; make commit atomic and recoverable with no partial updates on validation failure.

**UI:** `components/vibe-import-panel.tsx`, accessible from Business Review Mode.

- Paste a feature brief or prototype behavior summary; preview candidate cards and likely missing background paths; edit/accept/reject each proposal; commit to the canonical model only after deliberate confirmation.
- Display what was extracted, inferred, omitted and not yet approved. No requirement for an LLM key or network service to run deterministic tests.

**Acceptance criteria:** Offline import is reproducible; background-path suggestions are transparent; invalid/oversized/hostile input fails closed; imports never silently approve a specification; old saved specifications remain readable.

**Tests:** `tests/vibe-ingestor.test.mjs`, `tests/vibe-ingestor-wiring.test.mjs`.

**Required documents:** `docs/SPRINT_09_ACCEPTANCE.md`, `docs/SPRINT_09_OWNER_GUIDE.md`, ADR-018, roadmap update.

**Gate to Sprint 10:** Owner verifies preview/commit and approves the candidate-to-canonical-record mapping.

---

## 6. Sprint 10 — Human-Readable Impact & Deterministic Agent Handoff

**Status:** Planned / not started; depends on accepted Sprint 09.
**ADR:** `docs/ADR-019-HUMAN-IMPACT-AND-AGENT-HANDOFF.md`
**Goal:** Make downstream change consequences intelligible and export a verifiable, revision-locked agent specification.

**Core:** `lib/agent-handoff-core.ts`, additive integration with `lib/impact-core.ts`.

- Turn actual dependency/change findings into human-readable impact statements, including directly linked workflows, possibly affected paths, missing post-revocation examples, and uncertainty where no baseline exists. Do not claim absent links prove safety.
- Record **Stakeholder Sign-Off & Rationale** with actor/provenance, canonical revision/hash, decision, timestamp and covered scope. Distinguish local assertions from authenticated/auditable approval; any relevant edit invalidates current sign-off without deleting its history.
- Implement deterministic compilation of **`AGENT_SPEC.md`** and **`spec.manifest.json`** using canonical ordering, normalized text, stable identifiers, a documented schema version and SHA-256 over canonical serialized content. Prevent ambiguous or forged Markdown sections.
- Include business rules, affected workflows, timing/state invariants, preconditions/postconditions, Gherkin examples, explicit uncovered paths, review decisions and approval provenance; make unsupported/unknown states visible.
- Provide a formally documented adapter/bridge to the **existing v1 task-level runner contract**. Handoff compilation is not an execution permission; legacy run gates, consent and evidence verification remain active.
- Implement **Information Parity Verification** across the Business projection, Structured Text projection and agent bundle for every material record, link, coverage flag and approval decision. Fail closed on missing, stale or mismatched material information.

**UI:** `components/handoff-modal.tsx` and additive updates to `components/impact-explorer.tsx`.

- **Review Impact & Export for Coding Agent**: inspect affected paths and unanswered questions, review sign-offs, validate parity, then explicitly export. Block or clearly flag unsafe/stale sign-off conditions rather than concealing them.

**Acceptance criteria:** Identical canonical input gives byte-stable content/hash; single-record changes change the revision digest and stale approvals; missing links and uncovered edges survive every projection; the original Python v1 validation flow still passes; no agent run is falsely reported.

**Tests:** `tests/agent-handoff.test.mjs`, `tests/parity-verification.test.mjs`, `tests/agent-handoff-wiring.test.mjs` (including modal/impact/legacy runner regression checks).

**Required documents:** `docs/SPRINT_10_ACCEPTANCE.md`, `docs/SPRINT_10_OWNER_GUIDE.md`, ADR-019, roadmap update.

**Gate to Sprint 11:** Owner approves parity evidence, the compatibility matrix and the exact permitted export/runner behavior.

---

## 7. Sprint 11 — Empirical Evaluation Sandbox

**Status:** Planned / not started; depends on accepted Sprint 10.
**ADR:** `docs/ADR-020-EVALUATION-SANDBOX.md`
**Goal:** Enable a controlled MSc study of how well non-technical stakeholders and PO–developer pairs find and explain behavioral mismatches in visual versus structured-text specifications.

**Core:** `lib/evaluation-core.ts`

- Generate **information-equivalent** text directly from the same frozen canonical scenario records used by the visual canvas: identical facts, IDs, wording, links and coverage labels; different navigation and visual affordances only.
- Freeze and version two scenarios, including reference answers and explicit evidence locations, without displaying answer keys to participants before submission:
  - **A — SetPilot Coaching Platform:** At **10:00**, the athlete withdraws coach access; the live dashboard is blocked (covered), but a report queued at **09:55** remains set to deliver at **10:05** (uncovered post-revocation timing behavior).
  - **B — Member-Only Checkout:** Standard product-page loyalty pricing is correct (covered), but guest express checkout inherits cached member-session pricing (uncovered state/role behavior).
- Create a counterbalanced study allocation (scenario order × display condition), using reproducible session/assignment IDs. Avoid learning, order and scenario difficulty being perfectly confounded with the display format.
- Capture elapsed time, mismatch detections, selected evidence, written rationale, and a **post-review independent behavior-prediction quiz** to measure understanding rather than mere agreement. Predetermine definitions for detection accuracy, false positives, completeness and time.
- Export privacy-minimized, pseudonymous JSON/CSV with schema/version, condition, order and outcomes. No participant names, credentials, hidden answer key or sensitive application data in normal participant exports; research access to keys is separately controlled.
- Keep study records isolated from production workspace data. Respect participant consent, withdrawal/data-handling rules and Åbo Akademi research-ethics guidance; this roadmap itself does not constitute ethics approval.

**UI:** `components/evaluation-sandbox.tsx`, route `/evaluate` (or documented isolated toggle).

- Scenario A/B, Visual/Text condition, standardized instructions, timer, mismatch/rationale submission and prediction check. Prevent presentation-specific hints or answer leakage; support keyboard interaction.

**Acceptance criteria:** Both conditions show equivalent substantive information, randomized/counterbalanced allocation is reproducible, telemetry can be replayed/validated, exports contain no direct identifying data, answer keys remain hidden, and production SDD approval/runner behavior is unchanged.

**Tests:** `tests/evaluation-sandbox.test.mjs`, `tests/evaluation-wiring.test.mjs` (including parity, counterbalancing, scoring, serialization and answer-leak checks).

**Required documents:** `docs/SPRINT_11_ACCEPTANCE.md`, `docs/SPRINT_11_OWNER_GUIDE.md`, ADR-020, roadmap update.

**Gate to empirical use:** Owner acceptance **plus** study-pilot validation and any required institutional ethics/data-protection review. Passing unit tests does not authorize recruitment or prove research validity.

---

## 8. Thesis evaluation traceability

| Thesis construct / question | Product mechanism | Evidence or planned measure |
| --- | --- | --- |
| Can non-technical stakeholders inspect hidden and asynchronous behavior? | Sprint 08 business-rule/path/edge/example cards | Task completion, accurately cited paths, usability observations |
| Can an exploratory brief become a governed specification without silent invention? | Sprint 09 candidate extraction, provenance and explicit commit | Extraction precision/recall against curated cases; reviewer corrections |
| Do business decisions survive agent handoff without semantic loss? | Sprint 10 deterministic export and parity gate | Automated record-level parity, hashes, approval staleness tests |
| Does visual presentation improve mismatch detection or shared understanding versus equivalent text? | Sprint 11 counterbalanced Visual/Text study | Correct detections, false positives, detection time, rationales, independent predictions |

**Research discipline:** The visual system's effectiveness is a **hypothesis**, not an established finding. Preserve both positive and negative results, report sample size and limitations, and do not infer causality from an uncontrolled demo. Research variables, recruitment, analysis plan and ethics handling must be finalized before data collection.

## 9. Release sequence and explicit stop rule

`Sprint 07 baseline` → `Sprint 08 stakeholder experience` → `Sprint 09 ingestion` → `Sprint 10 parity + agent handoff` → `Sprint 11 evaluation sandbox` → `owner-accepted research pilot`.

Each arrow is gated by implementation evidence and explicit owner approval. **Sprint 08 is authorized for implementation. Do not begin Sprint 09 until Sprint 08 has passed integration checks, browser acceptance and explicit owner approval.**
