# Major revision 1 micro sprint contracts

Plan version: **MR-1 plan 1.0**, 2026-11-23. All implementation sprints below are **planned**, not implemented.
The roadmap/backlog publication itself is the planning delivery, outside the remaining-work estimate.
Each estimate is active engineer hours with AI assistance. O = optimistic, M = most likely, P = pessimistic; W = (O + 4M + P) / 6. [Full estimate basis](ESTIMATES.md).

## Definition of Done shared by every implementation sprint

1. Deliver a user-observable outcome and link the affected R-01–R-14 requirements.
2. Satisfy every sprint-specific criterion; preserve legacy behavior through the documented adapter/persistence contract.
3. Implement the relevant named positive, negative, failure and recovery cases. The 42 seed cases below are a minimum planning catalog and may expand; they are not existing passed tests.
4. Record results as passed, failed, blocked, skipped or not run, with exact source revision, environment and evidence. Ordinary CI uses deterministic provider fixtures; a marked live-provider result is separately required where specified.
5. Run appropriate core/integration/browser regression checks, typecheck and build; record current CI for the candidate. Do not replace a required live/human result with a mocked result.
6. Update the sprint issue, case catalog, decisions, known limits and estimate actuals. Take screenshots for changed user flows and preserve before/after evidence where useful.
7. Report engineering completion separately from human/academic acceptance and publication authorization. Routine check completion does not require repeated owner confirmation.

## Evidence and retention

The repository stores scenario definitions, input/expected outcome, requirement mapping, test path and evidence manifest. The manifest records case ID/name, result, attempts, commit/tree, command, browser/environment, run URL, attachment path/hash, provider mode and redaction status. Failed attempts remain visible. Each completed sprint creates `docs/major-revision-1/evidence/MR-XX/manifest.json` and a concise `REPORT.md`; material before/after images and publishable small records are committed.

Large CI artifacts may expire after the configured retention period. Keep an owner-controlled backup, byte count and SHA-256, link it from the manifest and verify retrieval; do not describe a 90-day upload as permanent evidence. Publish permitted summaries/definitions in Git and retain private source text, credentials, actual answer keys and participant records in the approved private location. Verify those boundaries before uploading artifacts.

Human review includes the reviewer/session role, scope, date, revision and outcome. Named participants are only recorded privately where permitted. A developer's walkthrough is an engineering check and cannot stand in for an independent BA or intended stakeholder.

## Sprint summary

| Sprint | Outcome | Dependencies | O / M / P hours | W hours |
| --- | --- | --- | --- | --- |
| [MR-01](#mr-01) | Product contract, proposal revision and implementation baseline | Planning delivery | 8 / 12 / 20 | 12.7 |
| [MR-02](#mr-02) | Reference documents, independent annotations and baseline | MR-01 | 10 / 16 / 24 | 16.3 |
| [MR-03](#mr-03) | Document intake and versioned semantic records | MR-01, MR-02 | 16 / 24 / 36 | 24.7 |
| [MR-04](#mr-04) | Real model extraction and grounding | MR-03 | 20 / 32 / 48 | 32.7 |
| [MR-05](#mr-05) | Business analyst review workbench | MR-04 | 16 / 24 / 36 | 24.7 |
| [MR-06](#mr-06) | Source-linked visual and text projections | MR-05 | 20 / 32 / 48 | 32.7 |
| [MR-07](#mr-07) | Cross-domain fidelity and uncertainty quality gate | MR-02, MR-06 | 12 / 20 / 32 | 20.7 |
| [MR-08](#mr-08) | Durable shared projects and role authorization | MR-07 | 30 / 44 / 68 | 45.7 |
| [MR-09](#mr-09) | Stakeholder feedback and requirement change loop | MR-08 | 18 / 28 / 42 | 28.7 |
| [MR-10](#mr-10) | Evaluation protocol and scoring for the revised question | MR-07, MR-09 | 16 / 24 / 36 | 24.7 |
| [MR-11](#mr-11) | System verification, accessibility and failure recovery | MR-08, MR-09, MR-10 | 16 / 24 / 40 | 25.3 |
| [MR-12](#mr-12) | Independent demo and engineering release candidate | MR-11 | 12 / 20 / 32 | 20.7 |
| [MR-13](#mr-13) | Human formative pilot and bounded corrections | MR-10, MR-12 | 12 / 20 / 32 | 20.7 |
| [MR-14](#mr-14) | Open-source research artifact and final handoff | MR-12, MR-13 | 8 / 12 / 20 | 12.7 |

<a id="mr-01"></a>

## MR-01 Product contract, proposal revision and implementation baseline

**Issue:** [#11](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/11). **Status:** planned. **Phase:** Definition. **Dependencies:** Planning delivery.
**Estimate:** O 8 / M 12 / P 20 hours; weighted 12.7 hours before reserve.

Freeze the document-to-visual-review product contract before implementation.

### Work

- Record BA, stakeholder and developer responsibilities and the complete first-use journey.
- Write the English proposal revision draft and a delta against the existing English proposal; distinguish the unavailable university-approved original.
- Inventory reusable code from main and PRs #8/#9 by path, licensing and test coverage; select explicit ports rather than merging pending PRs implicitly.
- Define CI triggers for feature PRs targeting major-revision-1, supported input limits, language, browser matrix and risk gates.

- Build a focused related-work matrix covering requirements-to-diagram generation, BA/human review, source traceability and stakeholder evaluation; narrow the research gap without claiming first-ever novelty.

### Definition of Done

- [ ] The contract maps every current owner requirement to a sprint and observable acceptance evidence.
- [ ] The revised research question, contribution boundaries and study assumptions are written; academic approval is recorded separately.
- [ ] The reuse decision names paths/commits and the migration strategy preserves v1 saved specifications.
- [ ] Quality thresholds and corpus split are frozen before model tuning; implementation can proceed without another scope question.

- [ ] The proposal's research gap is supported by primary literature and distinguishes existing techniques from the contribution being evaluated.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-01-T01 | Contract walkthrough | Trace a new specification through BA correction, stakeholder question and proposed revision; every transition has an owner and persisted artifact. | review |
| MR-01-T02 | Legacy compatibility plan | List v1 readers, source/review sidecars, Auth/API paths and regression coverage; document every proposed change. | review |
| MR-01-T03 | CI branch routing | A feature PR against major-revision-1 triggers the required checks without production secrets. | integration |


<a id="mr-02"></a>

## MR-02 Reference documents, independent annotations and baseline

**Issue:** [#12](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/12). **Status:** planned. **Phase:** Definition. **Dependencies:** [MR-01](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/11).
**Estimate:** O 10 / M 16 / P 24 hours; weighted 16.3 hours before reserve.

Create a small, auditable cross-domain corpus and an independent semantic reference.

### Work

- Prepare six English text/Markdown specifications from three domains, initially SetPilot access/reporting, commerce and booking; two documents per domain.
- Use bounded documents of approximately 1,500–6,000 characters with explicit conditions, decisions and exceptions; record rights and document hashes.
- Split three development and three held-out documents before tuning; include an ambiguous document and an incomplete document.
- An independent BA/domain reviewer checks source spans and critical facts; disagreement is adjudicated and retained.

### Definition of Done

- [ ] All six documents have versioned IDs, provenance/rights, split membership and critical-fact annotations.
- [ ] Every reference fact/relationship has a source span or an explicit missing-information label.
- [ ] The reference records draft annotations, independent review and adjudication separately; unreviewed data cannot be called an independent benchmark.
- [ ] Current main/manual and heuristic-importer behavior is measured as a baseline with its supported input limits.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-02-T01 | Reference integrity | Alter a source document; its old hash and dependent reference are rejected as current. | automatic |
| MR-02-T02 | Held-out isolation | The split manifest prevents held-out documents from entering tuning prompts/examples. | automatic |
| MR-02-T03 | Independent annotation | A second human reviewer records agreement/disagreement and resolutions without copying the model answer. | human |


<a id="mr-03"></a>

## MR-03 Document intake and versioned semantic records

**Issue:** [#13](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/13). **Status:** planned. **Phase:** Vertical slice. **Dependencies:** [MR-01](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/11), [MR-02](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/12).
**Estimate:** O 16 / M 24 / P 36 hours; weighted 24.7 hours before reserve.

Accept a real specification and preserve its text, identity and traceable semantic records.

### Work

- Add bounded UTF-8 .txt/.md upload and paste; preserve original bytes/text, normalized text, digest and exact span mapping.
- Define a versioned model for source documents, actors, rules, triggers, actions, conditions, decisions, relations and questions.
- Keep origin classification (explicit, inferred, human-added) separate from review state (proposed, accepted, rejected, unresolved).
- Add export/import and an explicit adapter boundary to legacy Specification v1; retain unsupported content as source rather than dropping it.

### Definition of Done

- [ ] A supported uploaded document can be reopened and exported without source loss.
- [ ] Invalid size/type/encoding, duplicate IDs, bad spans and dangling links fail with an actionable result.
- [ ] Every semantic record retains document revision and evidence; partial extraction is visible.
- [ ] No legacy saved record is silently migrated or overwritten.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-03-T01 | Input bounds and exact spans | Accept valid text including Unicode; reject empty, oversized and unsupported files; source spans still select the exact original quotation. | automatic |
| MR-03-T02 | Record validation | Reject duplicate IDs and invalid relation endpoints; preserve unsupported paragraphs in the source view. | automatic |
| MR-03-T03 | Round trip and legacy data | Export/import preserves source and records; existing v1 fixtures still load unchanged. | automatic |


<a id="mr-04"></a>

## MR-04 Real model extraction and grounding

**Issue:** [#14](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/14). **Status:** planned. **Phase:** Vertical slice. **Dependencies:** [MR-03](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/13).
**Estimate:** O 20 / M 32 / P 48 hours; weighted 32.7 hours before reserve.

Prove a real model can propose grounded records from the uploaded document.

### Work

- Select one provider/model after a documented capability, availability and cost check; implement a server-only adapter with schema validation.
- Treat document text as untrusted data; provide no tool execution, browsing or repository authority to extracted instructions.
- Validate evidence spans and relation endpoints; label inferences and omissions instead of manufacturing approvals.
- Bound input/output, request timeout, retry count and spend; record model/version, prompt hash, usage and errors without exposing private text publicly.

### Definition of Done

- [ ] At least one real credentialed provider request over development documents is evidenced; mocks alone do not satisfy the sprint.
- [ ] The UI identifies the selected provider and outbound data action; no credential appears in the client, Git history or artifact.
- [ ] Malformed/truncated responses and invalid evidence leave the previous document/model intact.
- [ ] Development-set raw precision, recall, critical omissions, latency and usage are reported; gate G1 is explicitly passed or stopped.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-04-T01 | Provider failure matrix | Missing configuration, timeout, rate limit, malformed JSON and truncated output preserve prior work and allow bounded retry. | automatic |
| MR-04-T02 | Grounding and prompt injection | Unsupported evidence and dangling links are rejected; malicious instructions inside the source never become tools, approvals or code execution. | automatic |
| MR-04-T03 | Live provider smoke | Record actual request metadata, source/prompt/model hashes and resulting validated records for the development corpus. | live integration |


<a id="mr-05"></a>

## MR-05 Business analyst review workbench

**Issue:** [#15](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/15). **Status:** planned. **Phase:** Vertical slice. **Dependencies:** [MR-04](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/14).
**Estimate:** O 16 / M 24 / P 36 hours; weighted 24.7 hours before reserve.

Let the BA control and correct the interpretation without losing its origin.

### Work

- Show source and proposed records together with accept, edit, reject and unresolved actions.
- Support a human-added fact/question with rationale and explicit origin; approval never rewrites source history.
- Persist revision-bound actions locally for the first slice; export all review decisions.
- Mark previous decisions stale when dependent source/record content changes.

### Definition of Done

- [ ] The BA can correct an extraction and inspect its original evidence and model proposal.
- [ ] Proposals, accepted interpretations and unresolved questions remain visibly distinct.
- [ ] Reload preserves decisions; failed storage writes and another-tab conflicts cannot silently replace work.
- [ ] Changed source/records invalidate only the documented dependent decisions and retain prior history.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-05-T01 | Correction and rejection | Edit a proposed relation, reject an invented action and add a human question; each action retains author role, reason and source revision. | browser |
| MR-05-T02 | Revision invalidation | Change a source span or relation; its prior review becomes stale and cannot be exported as current acceptance. | automatic |
| MR-05-T03 | Persistence failure and conflict | Exercise save failure, corrupt storage and concurrent-tab edit without silent data loss. | browser |


<a id="mr-06"></a>

## MR-06 Source-linked visual and text projections

**Issue:** [#16](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/16). **Status:** planned. **Phase:** Vertical slice. **Dependencies:** [MR-05](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/15).
**Estimate:** O 20 / M 32 / P 48 hours; weighted 32.7 hours before reserve.

Complete the first real document-to-visual-review journey.

### Work

- Render a deterministic actor-lane behavior graph with triggers, decisions, conditions, actions and exceptions from the reviewed model.
- Selecting a node or relation reveals its exact source span and review/origin state.
- Provide an equivalent structured-text projection from the same canonical records, including unknowns.
- Use the same pipeline for a fresh document with no document-specific code path or pre-authored graph.

### Definition of Done

- [ ] A fresh supported document passes upload, real extraction, BA correction, graph inspection and export end to end.
- [ ] Graph topology changes when the underlying relations change; the view is a model projection rather than fixed sample artwork.
- [ ] Every displayed factual node/relation has valid evidence or an explicit human/inferred/unknown label.
- [ ] Visual/text material facts and states match; keyboard operation, narrow layout and a readable text alternative work.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-06-T01 | Fresh document journey | Import a previously unused supported document through the normal UI and trace selected visual elements back to exact source passages. | live integration |
| MR-06-T02 | Topology and parity | Change an actor, condition and branch; both visual and text projections update from the same records without lost questions. | automatic |
| MR-06-T03 | Keyboard and narrow viewport | Navigate node details and source links at 390px and desktop widths without pointer-only actions or clipped essential content. | browser |


<a id="mr-07"></a>

## MR-07 Cross-domain fidelity and uncertainty quality gate

**Issue:** [#17](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/17). **Status:** planned. **Phase:** Review workflow. **Dependencies:** [MR-02](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/12), [MR-06](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/16).
**Estimate:** O 12 / M 20 / P 32 hours; weighted 20.7 hours before reserve.

Measure the pipeline against independent references, including incomplete specifications.

### Work

- Freeze extraction settings, run the held-out corpus and compare facts/relationships with adjudicated references.
- Report raw extraction and BA-corrected quality separately; track BA correction count/effort and model usage.
- Handle queued/scheduled/background paths as source-supported behavior or open questions according to evidence.
- Implement missing-information and unsupported-relationship reports with source links; preserve coverage denominators.

### Definition of Done

- [ ] All three held-out documents use the generic path and have item-level errors and correction records.
- [ ] Gate G3 thresholds are evaluated against a frozen reference; failed thresholds cause a recorded correction/retest cycle, not an unannounced threshold change.
- [ ] A source-supported path, a speculative path and a genuinely unspecified condition are distinguishable in UI and exports.
- [ ] No benchmark result is described as universal semantic correctness.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-07-T01 | Scheduled-path positive case | An explicitly stated queued delivery path is extracted with its source condition and remains unapproved until human review. | integration |
| MR-07-T02 | Scheduled-path negative case | An unstated post-revocation rule stays an open question; selecting a speculative path does not create an approved workflow. | integration |
| MR-07-T03 | Held-out benchmark | Publish per-document denominators, raw/corrected precision and recall, critical omissions, invalid links and human adjudications. | human + live integration |


<a id="mr-08"></a>

## MR-08 Durable shared projects and role authorization

**Issue:** [#18](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/18). **Status:** planned. **Phase:** Review workflow. **Dependencies:** [MR-07](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/17).
**Estimate:** O 30 / M 44 / P 68 hours; weighted 45.7 hours before reserve.

Allow a BA and invited stakeholders to review the same durable project across devices.

### Work

- Persist source revisions, semantic model, review decisions and questions in a versioned Neon project envelope through authenticated server routes.
- Add project membership/invitation and BA/editor/reviewer permissions enforced by the server.
- Support invitation expiry/revocation, optimistic revision checks and explicit local-draft reconciliation.
- Use an isolated database branch for migrations and recovery tests; document backup/export and revocation limits.

### Definition of Done

- [ ] Two independent authenticated users can open the same invited project on different browser contexts and read the same saved revision.
- [ ] Reviewers cannot alter authoritative source/BA decisions; unrelated users cannot read, write or export the project.
- [ ] Reload/new browser preserves the whole review envelope; stale concurrent updates are rejected without silent loss.
- [ ] Migration/recovery has evidence on an isolated branch; existing v1 projects remain readable.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-08-T01 | Two-user collaboration | BA saves, invited reviewer reloads in a fresh context and sees the exact same document/model/review revision. | live integration |
| MR-08-T02 | Access control and revocation | Unauthenticated, unrelated and revoked users cannot read/write/export; reviewer source mutation and cross-project access are denied. | integration |
| MR-08-T03 | Conflict and migration recovery | Two clients submit the same base revision; one stale write is rejected; legacy data and failed migrations remain recoverable. | integration |


<a id="mr-09"></a>

## MR-09 Stakeholder feedback and requirement change loop

**Issue:** [#19](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/19). **Status:** planned. **Phase:** Review workflow. **Dependencies:** [MR-08](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/18).
**Estimate:** O 18 / M 28 / P 42 hours; weighted 28.7 hours before reserve.

Connect stakeholder understanding and disagreement to reviewable specification changes.

### Work

- Provide a simplified stakeholder view with progressive disclosure, questions, disagreement and proposed-change actions.
- Persist feedback against exact node/relation/source revision; track resolution, rationale and the responsible role.
- Allow the BA to propose an explicit new source/model revision and show impact on earlier decisions.
- Add bounded links to an external prototype and hypothesis/test/metric/threshold/evidence records; do not generate an application or claim market success.

### Definition of Done

- [ ] A stakeholder question survives reload and is visible to the BA on the shared project.
- [ ] Feedback can be resolved or converted to a proposed change without silently editing the original source.
- [ ] Accepting a source revision exposes affected interpretations/decisions and retains the complete previous revision.
- [ ] A hypothesis record distinguishes untested, evidence recorded and decision made; an external prototype link is clearly external.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-09-T01 | Feedback across roles | An invited reviewer attaches a question to a branch; the BA sees and resolves it with a source-linked rationale. | browser + integration |
| MR-09-T02 | Change impact | A changed condition stales the affected decisions while preserving unrelated feedback and historical exports. | automatic |
| MR-09-T03 | Evidence without overclaim | Save prototype/hypothesis/test evidence; no entry grants behavior approval, proof of implementation or market validation. | integration |


<a id="mr-10"></a>

## MR-10 Evaluation protocol and scoring for the revised question

**Issue:** [#20](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/20). **Status:** planned. **Phase:** Research preparation. **Dependencies:** [MR-07](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/17), [MR-09](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/19).
**Estimate:** O 16 / M 24 / P 36 hours; weighted 24.7 hours before reserve.

Prepare a fair study of BA-mediated visual review and a replayable evaluation tool.

### Work

- Revise the English study protocol and preserve equivalent source/model facts in both conditions with comparable BA facilitation.
- Define primary comprehension/gap-detection outcomes and separate extraction fidelity, BA effort and subjective usability.
- Extend reference/scoring schemas if insufficient information is a correct answer; retain unsure as abstention where specified.
- Define recruitment/unit of analysis/sample justification, coding procedure, ordering, answer-key access and data handling with supervisor input.

### Definition of Done

- [ ] The protocol distinguishes visual presentation effects from model extraction quality and BA presence.
- [ ] A paired session is the analysis unit when pairs are used; sample size is justified rather than inherited as 12 or 24.
- [ ] Synthetic sessions replay exactly against a separately controlled reference, including a valid insufficient-information answer.
- [ ] Research authorization/consent and supervisor decisions remain explicit prerequisites to human data collection.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-10-T01 | Information and facilitation parity | Both conditions preserve the same substantive records and use the same BA facilitation script and limits. | review + automatic |
| MR-10-T02 | Scoring answer states | Correct mismatch, no mismatch and insufficient-information references score as designed; unsure/abstention and missing answers remain distinct. | automatic |
| MR-10-T03 | Replay and key isolation | Recompute synthetic session scores from a frozen reference; participant bundles/artifacts do not contain the actual answer key. | automatic |


<a id="mr-11"></a>

## MR-11 System verification, accessibility and failure recovery

**Issue:** [#21](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/21). **Status:** planned. **Phase:** Release candidate. **Dependencies:** [MR-08](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/18), [MR-09](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/19), [MR-10](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/20).
**Estimate:** O 16 / M 24 / P 40 hours; weighted 25.3 hours before reserve.

Verify the complete revised workflow with named positive and negative evidence.

### Work

- Run the full regression suite and new source/provider/project/review browser flows in the agreed four browser projects.
- Audit source-based graph correctness separately from graph rendering and inspect representative screenshots.
- Test malicious document content, access isolation, failed saves, interrupted extraction, concurrent updates and recovery.
- Measure response/interaction performance at the supported input limits and document remaining usability issues.

### Definition of Done

- [ ] Every acceptance case has a result, exact commit, command/run, environment and evidence link; blocked/skipped cases stay visible.
- [ ] Node/Python checks, type checking, build and all required browser suites pass on the exact candidate.
- [ ] No unresolved blocker/high-severity defect remains in the core journey, access controls or data preservation.
- [ ] Accessibility evidence covers automated checks plus a manual keyboard/readability walkthrough; no certification claim is made.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-11-T01 | Complete end-to-end flow | Run upload, real extraction, BA correction, source navigation, invite, stakeholder feedback, revised source, reload and export. | live integration |
| MR-11-T02 | Recovery and hostile inputs | Run prompt-injection, malformed output, provider interruption, denied access, save failure and concurrent update scenarios. | integration |
| MR-11-T03 | Browser and accessibility matrix | Record named cases in desktop/mobile Chromium, desktop Firefox and mobile WebKit; review keyboard and screenshots. | browser + human |


<a id="mr-12"></a>

## MR-12 Independent demo and engineering release candidate

**Issue:** [#22](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/22). **Status:** planned. **Phase:** Release candidate. **Dependencies:** [MR-11](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/21).
**Estimate:** O 12 / M 20 / P 32 hours; weighted 20.7 hours before reserve.

Deliver an inspectable candidate with honest demo and live-model modes.

### Work

- Deploy to an isolated preview/demo project with synthetic samples and a working Reset demo sample control.
- Keep public sample exploration separate from credentialed live document extraction; identify cached samples and real calls clearly.
- Write the revised English quickstart/user manual and setup/migration/known-limit documentation.
- Bind deployment, CI and evidence manifests to the same candidate commit; prepare rollback and owner publication decision.

### Definition of Done

- [ ] The public sample opens in a fresh unauthenticated browser without a hosting login and exposes no private project or model credential.
- [ ] Reset restores the sample exactly and cannot erase unrelated user/project data.
- [ ] A credentialed live-mode smoke proves the real pipeline; public cached-mode evidence is labeled separately.
- [ ] Candidate URL, version, commit, CI, manual and unresolved research dependencies are documented; merge/production remain owner decisions.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-12-T01 | Anonymous sample and reset | Edit a synthetic sample, cancel reset, confirm reset and reload; verify exact restoration in a fresh browser. | browser |
| MR-12-T02 | Demo isolation and abuse bounds | Public sample requests cannot reach private data or an unrestricted paid model endpoint; live mode requires its documented authorization/budget limits. | integration |
| MR-12-T03 | Release identity | Match CI checkout/head, deployed source revision, artifact hashes and migration version; verify rollback procedure. | integration |


<a id="mr-13"></a>

## MR-13 Human formative pilot and bounded corrections

**Issue:** [#23](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/23). **Status:** planned. **Phase:** Human pilot. **Dependencies:** [MR-10](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/20), [MR-12](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/22).
**Estimate:** O 12 / M 20 / P 32 hours; weighted 20.7 hours before reserve.

Check whether intended users can actually perform the workflow before an empirical study.

### Work

- After the required research/consent approvals, run at least two formative review sessions involving a BA and nondeveloper stakeholders.
- Use the revised artifact, source documents and facilitator script; observe comprehension, task completion, confusing language and BA interventions.
- Separate observed user problems from researcher interpretations and implement one bounded correction cycle.
- Re-run affected automated/live checks and record unresolved limitations; freeze material changes before a formal study.

### Definition of Done

- [ ] Actual consented human sessions have dated evidence and a transparent participant/session description; bots or developer self-tests do not count.
- [ ] Each observed blocker has a fix/retest or a documented deferral and its implication for study readiness.
- [ ] The resulting readiness decision is reviewed by the researcher/supervisor as applicable.
- [ ] No significance, market-fit or general effectiveness claim is drawn from the formative pilot.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-13-T01 | Human comprehension walkthrough | Observe users predicting a normal and an exceptional/background outcome and explaining the source evidence. | human |
| MR-13-T02 | BA mediation and feedback | Observe a BA correcting a misunderstanding and a stakeholder submitting a traceable concern without developer coaching. | human |
| MR-13-T03 | Pilot correction regression | Re-test each implemented pilot correction with the affected browser/core scenarios and, when material, a human follow-up. | human + integration |


<a id="mr-14"></a>

## MR-14 Open-source research artifact and final handoff

**Issue:** [#24](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/24). **Status:** planned. **Phase:** Research artifact. **Dependencies:** [MR-12](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/22), [MR-13](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/23).
**Estimate:** O 8 / M 12 / P 20 hours; weighted 12.7 hours before reserve.

Package an installable, inspectable research artifact and an explicit acceptance record.

### Work

- Record the owner's license/rights decision, dependency notices and sample/data publication permissions before applying a license.
- Package source, English setup/manual, architecture, synthetic corpus, prompt/model configuration, scenario catalog, scripts and permitted evaluation material.
- Verify installation and synthetic evaluation replay from a clean checkout with no project-private files.
- Prepare a versioned release candidate, contribution guidance and final product/research acceptance matrix; publish only within explicit owner authorization.

### Definition of Done

- [ ] An appropriate software license and required notices are present after the rights decision; public-repository visibility alone is never called open source.
- [ ] A clean environment can install, run the synthetic sample, execute tests and replay permitted evaluation records using documented steps.
- [ ] Real participant data/keys/private documents are excluded unless publication is separately permitted; model nondeterminism is explained.
- [ ] All requirements link to evidence or a named limitation; engineering, pilot, publication and formal study outcomes have separate statuses.

### Seed acceptance scenarios

| ID | Scenario | Expected result | Evidence mode |
| --- | --- | --- | --- |
| MR-14-T01 | Clean checkout reproducibility | Install and run sample/tests/replay without undocumented local files or private credentials; report where a live provider is needed. | integration |
| MR-14-T02 | Publication contents | Check license/notices, sample rights and accidental secrets/participant identifiers in the artifact. | review + automatic |
| MR-14-T03 | Acceptance traceability | Every requirement points to versioned evidence; no planned/blocked/human-pending item appears as completed. | review |
