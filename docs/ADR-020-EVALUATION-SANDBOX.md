# ADR 020 Visual SDD evaluation rehearsal

Status: implementation authorized by the owner on 2026-11-21; release and empirical acceptance remain distinct.

The thesis direction is Visual SDD: visual stakeholder inspection and human governance of specification-driven development. It is not visual storytelling. An evaluation must compare equivalent information without rewriting the underlying specification between conditions or leaking an answer key.

## Decision

Use a separate public `/evaluate` rehearsal route. Freeze two synthetic scenarios in `lib/evaluation-core.ts` using the existing Specification and StakeholderReview builders. Both conditions consume the same `projectStakeholderRules` projection, including requirement/criterion IDs, workflows, attached examples, open edges, draft decisions and observed event records. Layout/navigation differ; substantive wording and evidence IDs do not. Source/review/observation/question records have fixed revisions and SHA-256 digests. The evaluation is a read-only projection, not the full editing cockpit.

Four deterministic allocation cells cross scenario order with display order. Consecutive researcher-assigned slots balance all cells. Arbitrary or participant-selected slots do not guarantee cohort balance; no claim of concealed random assignment is made. Each individual or PO–developer pair reviews two scenarios, locks each rule judgement/evidence/rationale, then completes a prediction quiz with the specification hidden. No correctness feedback is shown before the second trial.

Timing uses the browser monotonic clock within an open phase and includes idle/background time. Reload never invents elapsed time: an interrupted trial must be explicitly abandoned and restarted, its prior record retained and restart count exported. These are self-reported local records, not authenticated telemetry or a controlled study by themselves.

Only the versioned `visual-sdd-evaluation-v1` storage key is used. Existing source, planning, review, cloud links and sign-offs are never read or written by the evaluation route. Explicit local-rehearsal consent is required; there is no recruitment, participant identity form or automatic submission endpoint. Completed JSON and CSV are replay-validated and include allocation, versions, IDs, timings, judgements, evidence, rationales and predictions. CSV cells neutralize formula prefixes. Free text can still contain information a reviewer types; inspection/redaction before sharing remains necessary.

## Reference answers and research access

The actual frozen reference package is kept **outside the public repository and outside participant JavaScript, storage, downloads and CI artifacts**. Its two scenario digests and revision IDs bind it to this precise scenario set. A researcher supplies this private file to `scripts/score_evaluation.mjs`, which verifies the completed export and reference before producing a separate result file. The script refuses to overwrite an existing output. Production does not need a reference secret or new API.

Unit tests use an intentionally artificial oracle that is not the real study reference. The owner receives a private local reference package for preparation; it is not a participant artifact. The repository is public: source descriptions and the scenario itself remain inspectable. The browser hides the specification during prediction, but cannot prevent inspection through developer tools or another tab. This is a rehearsal suitable for supervised pilot validation, not secure remote assessment or an anti-cheating system. An actual study needs controlled distribution and finalized protocol/access arrangements.

The scorer reports rule-level true/false positives/negatives, abstentions, accuracy, reference-evidence completeness and precision, independent prediction accuracy, timings and restarts. Rationale quality requires independent human coding; no LLM or keyword match is presented as semantic grading. Abandoned records remain in raw JSON and are excluded from completed-trial scoring; restarted trials are visibly flagged for the analysis plan.

## Compatibility and alternatives

No change to Auth, Neon schema, workspace API, v1 specification readers, legacy runner or agent execution permissions. No new runtime dependency or model credential. A shared live-workspace evaluation was rejected because it could disclose owner data and mix study state with operational approvals. Participant-side answer keys were rejected. A new research database and automatic telemetry collection were deferred until research governance and collection requirements are approved.

## Acceptance boundaries

Engineering success, owner publication approval, supervised pilot validation and institutional research/data-protection requirements are separate gates. Synthetic checks are not empirical participant results. Physical-device and screen-reader-user studies remain unclaimed. No effectiveness, causal or commercial-maturity conclusion follows from passing CI.
