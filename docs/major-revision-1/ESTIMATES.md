# Major revision 1 estimate basis and scenarios

Baseline estimate date: **2026-11-23**, Europe/Helsinki.
Unit: **active engineer hours with AI assistance**, including implementation, code review, relevant tests, debugging and the sprint's documentation.
This is an initial work breakdown estimate. There is no measured velocity yet for this document-extraction/shared-review architecture. It is not a promise of autonomous-agent completion time.

## Assumptions

- One engineer with AI assistance and **30 productive hours per week**; no assumed speedup from parallel agents or a second engineer.
- Reuse the audited TypeScript/Next.js/Neon foundation; preserve existing projects. No rewrite of the entire application.
- One English text/Markdown intake contract, bounded inputs, one model provider, one bounded actor/behavior graph and equivalent text.
- Six source documents over three domains. New corpus expansion beyond the acceptance set is separately estimated.
- Asynchronous invited project review, not real-time concurrent editing or enterprise administration.
- A formative pilot with at least two BA/stakeholder sessions and one bounded correction cycle.
- Model credentials/account access, independent reviewers, human participants and required approvals are available when their gates require them. Their waiting time is not included.
- MR-12 provides revised English setup/manual material; MR-01 provides the revised English proposal draft. Full thesis writing and a formal empirical study are excluded.
- MR-14 can package and validate the artifact; granting a license and main/production publication still require the relevant explicit owner decisions.

## Three-point work breakdown

O, M and P are judgment-based optimistic, most likely and pessimistic estimates for the declared scope. The weighted figure uses **W = (O + 4M + P) / 6** for planning. This is not a calibrated probability distribution, confidence interval or P80 prediction.

| Sprint | O hours | M hours | P hours | W hours |
| --- | --- | --- | --- | --- |
| MR-01 | 8 | 12 | 20 | 12.7 |
| MR-02 | 10 | 16 | 24 | 16.3 |
| MR-03 | 16 | 24 | 36 | 24.7 |
| MR-04 | 20 | 32 | 48 | 32.7 |
| MR-05 | 16 | 24 | 36 | 24.7 |
| MR-06 | 20 | 32 | 48 | 32.7 |
| MR-07 | 12 | 20 | 32 | 20.7 |
| MR-08 | 30 | 44 | 68 | 45.7 |
| MR-09 | 18 | 28 | 42 | 28.7 |
| MR-10 | 16 | 24 | 36 | 24.7 |
| MR-11 | 16 | 24 | 40 | 25.3 |
| MR-12 | 12 | 20 | 32 | 20.7 |
| MR-13 | 12 | 20 | 32 | 20.7 |
| MR-14 | 8 | 12 | 20 | 12.7 |
| **Total** | **214** | **332** | **514** | **342.7** |

The weighted total is **342.6667 hours**, rounded to 342.7. A separate **20% unallocated integration/correction reserve** adds 68.5333 hours, for **411.2 hours**. Displaying decimals makes the arithmetic auditable, not the work predictable to a fraction of an hour. The reserve is not a second charge for already-budgeted testing or documentation.

## Delivery horizons

| Deliverable | Scope | W hours | W plus 20% reserve | At 30 productive hours/week |
| --- | --- | --- | --- | --- |
| Real document to first traceable visual slice | MR-01–06 | 143.7 | 172.4 | About 6 working weeks |
| Shared engineering release candidate | MR-01–12 | 309.3 | 371.2 | About 13 working weeks |
| Pilot-informed research artifact | MR-01–14 | 342.7 | 411.2 | About 14 working weeks |

These horizons are cumulative, not additive. No calendar finish date is committed because the implementation start date, actual weekly allocation and external waiting are not fixed.

| Full-plan scenario | Active effort | At 30 productive hours/week |
| --- | --- | --- |
| All optimistic task estimates, before reserve | 214 hours | 7.1 working weeks |
| All most likely task estimates, before reserve | 332 hours | 11.1 working weeks |
| Weighted planning baseline including reserve | 411.2 hours | 13.7 working weeks |
| All pessimistic task estimates, before reserve | 514 hours | 17.1 working weeks |
| Pessimistic stress case plus 20% reserve | 616.8 hours | 20.6 working weeks |

Do not read the optimistic/pessimistic sums as guaranteed lower/upper limits: scope growth or extended waits can exceed them. At 20 productive hours/week the same 411.2 hours occupy about 21 working weeks; at 40 hours/week about 11. Capacity assumptions materially change the forecast.

## Effort outside the engineering total

Independent BA/domain annotation/adjudication, stakeholder participation and supervisor time are additional person-hours to be scheduled at MR-01/02. MR-13 includes the engineer's preparation, session support, analysis and one correction cycle, but does not count other people's effort as engineer capacity.

Calendar waiting includes model account/budget authorization, owner/supervisor decisions, recruitment/scheduling and institutional research/ethics processing. These dependencies have no defensible duration yet. Track their start, owner and resolved date; add measured waiting separately instead of inventing a fixed allowance. Paid model usage and hosting costs also need a separate budget; hours are not a monetary quote.

PDF/OCR/Word layout handling, multilingual support, additional model providers, generated applications, enterprise features, a formal powered participant study, long-term operations and the full thesis manuscript are outside this estimate.

## Re-estimation rules

At MR-04 and MR-06, record actual active effort for completed tasks, remaining work by task, extraction quality, observed latency/failure rate, BA correction burden and new dependencies. Recalculate the remaining three-point estimate and reserve; retain the old baseline and explain every change.

Do not claim a measured development speed from CI runtime or elapsed chat time. A blocked provider/BA/research gate stays blocked; progress on independent work is reported separately. An input-language/format change, new provider, collaboration redesign, failed quality gate or material scope increase triggers an immediate estimate revision.

A sprint issue records planned O/M/P, actual active effort when credibly measured, external wait, remaining effort and variance reason. If actual active effort is not measured, record it as unknown rather than retroactively fabricate it.
