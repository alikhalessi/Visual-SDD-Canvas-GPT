# Sprint 08 — Local Engineering Test Evidence

**Date:** 2026-11-21 (project time zone: Europe/Helsinki)
**Source:** Implementation bundle prepared against `alikhalessi/Visual-SDD-Canvas-GPT` main as inspected through the GitHub connector.

## Checks executed

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Node 22.16.0, `node --experimental-strip-types --test tests/stakeholder-view.test.mjs tests/stakeholder-view-wiring.test.mjs` | **24 passed / 0 failed** | The newly authored TS domain tests and source-wiring tests in an anchored synthetic integration fixture. The original Sprints 00–07 repository is not present in the local executable workspace. |
| Guarded `apply-sprint08.mjs --apply` on anchored source fixture | **Passed** | Source anchors validated, new files copied, page/layout patch applied. This is not a Next.js build. |
| Global `tsc` on new `stakeholder-view-core.ts` and two new `.tsx` files with limited React/Specification type shims | **Passed** | Isolated compilation only; does not replace `npm run typecheck`. |
| `npm test` against the full GitHub checkout | **Not executed** | Network restrictions prevented cloning; no claim that the existing 160 Node tests pass after modification. |
| `npm run build`, Python suites, live CI | **Not executed** | No full repository dependencies available; no verified GitHub branch or deployment. |
| Live/browser/mobile evaluation | **Not executed** | Owner acceptance gate remains open. |

## Test intent

- Source-linked business-rule projection: no invented workflows or false coverage.
- Explicit interactive versus background workflow classification.
- Attached Given–When–Then example does not constitute human review approval.
- Open edge flag blocks sign-off; resolution requires linked scenario plus written rationale.
- Removing a linked scenario reopens its edge flag.
- Revision-locked stakeholder approval; source revision changes clear prior sign-offs while retaining notes.
- Distinct source Specification approval versus stakeholder behaviour approval.
- Fail-closed validation of malformed review records; separate browser-local project keys.
- Default Business Review and retained Engineering Cockpit wiring; read-only engineering summary.

## Required next verification

In a genuine repository checkout, run:

```bash
npm install
npm test
npm run typecheck
npm run build
python3 -m unittest discover -s tests_python -v
```

Record outputs, GitHub CI/commit, verified deployment URL, and the Product Owner's real-browser acceptance in `docs/SPRINT_08_ACCEPTANCE.md`. Keep Sprint 09 blocked until authorized.
