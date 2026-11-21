# Sprint 10 owner guide

## Release authorization

The owner explicitly authorized PR #7 merge and production publication. The approved application tree is preserved; release closeout updates only documentation. Exact current deployment and post-deploy evidence are in [the release record](SPRINT_10_RELEASE_RECORD.md) and PR #7. The implementation Word report below is the historical review package, not a claim of authenticated signatures or a user study.

## Product behavior

Open **Review impact & agent handoff** in Business Review Mode. The view lists recorded consequences and unanswered timing questions, then shows source rules, acceptance conditions, workflows, examples, rationale and current review state. Missing baselines or links remain uncertainty. The complete structured specification is available in a disclosure.

Draft exports are allowed so missing information is not hidden. They contain blocked implementation readiness and preserve open edge flags. Exporting never creates a workflow, records a human approval, dispatches an agent or publishes an issue.

A snapshot decision requires an explicit reviewer name, rationale and decision. Approval additionally requires current source and behavioural approvals, complete structural coverage and confirmation of reviewing the complete snapshot. It records a browser-local assertion only. Editing a source fact or review rationale changes the content digest and stales the prior handoff sign-off while keeping its history.

The agent text and JSON carry the same canonical information. Every export rechecks current source/review/history and parity. A stale open dialog or another-tab write must be closed and reopened rather than exported. Unreadable history remains untouched with an original-byte recovery download. Failed storage does not silently claim that the decision was saved.

Legacy validation is available only for a current approved complete package and an approved task/planning chain with a matching baseline. It produces a validation-only bridge and companion digest. The full package must stay with it; the legacy format cannot encode all business/timing information. No agent is run by this interface.

Records and sign-off history remain project-scoped browser data. First cloud save preserves the guest originals and copies into empty project-local keys; this does not synchronize them across devices. Digests are consistency checks, not identity authentication or tamper-proof audit logs.

The [scenario catalog](SPRINT_10_TEST_CATALOG.md) identifies exact automated cases and evidence retention. The [Persian implementation report](reports/SPRINT_10_IMPLEMENTATION_REPORT_FA.docx) is part of the review package. Merge and production publication were subsequently authorized by the owner. New sprint work and any expansion of runner permission remain separate decisions.
