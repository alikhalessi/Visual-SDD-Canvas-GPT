# Sprint 07 — Source-grounded UX / Security / Accessibility Audit

## Method and limitations
Reviewed current Next.js page, spec editor, guided UX, cloud status, local storage handling, CSS and test assertions. Browser connector did not provide an interactive screenshot session. Findings are code-grounded, not a visual regression test or formal WCAG conformance report.

| Priority | Source finding | User consequence | Resolution |
|---|---|---|---|
| P0 | Overview claimed working planning was unavailable | Misleads users about capabilities | Next action now opens Technical Plan in Canvas |
| P0 | Invalid cached Specification could be removed when null was auto-persisted | Irrecoverable work loss | Fail-closed preservation, recovery download, explicit clear |
| P1 | Marketing box and duplicated process preview competed with next step | High cognitive load | Replace marketing box with live project command center; full overview diagram limited to Professional |
| P1 | Header always said LOCAL even with a cloud-linked project | Wrong assumptions about persistence | Browser vs Cloud-linked, manual resave reminders |
| P1 | Small controls and 10–12px labels were common | Mobile/keyboard difficulty | Larger typography, 44px targets, 16px mobile forms, visible keyboard focus |
| P1 | Validation was mainly an aggregate list | Hard to find incomplete fields | Inline errors and aria-invalid / aria-describedby, assisted next action |
| P1 | Invalid cloud Specification could replace local project state with null | Unexpected context loss | Validate incoming cloud document before changing project state |
| P2 | Simple/Professional mode mostly changed terminology | Low perceived utility | Distinct progressive disclosure and professional trace summary |
| P2 | Mobile Google sign-in was reduced to an unclear single letter | Discoverability | Show textual sign-in label with accessible tap target |
| P2 | Old sprint references implied unavailable functionality | Confidence and accuracy risk | Replace stale copy in editor, cloud and overview |

## Remaining risks
- Browser/device interaction and formal accessibility conformance are **not verified**.
- Cloud save/reload after sign-in remains untested end-to-end by this assistant. Google sign-in/out previously reported working by owner.
- Plans, Tasks, GitHub task links are browser-local and lack cross-device synchronization.
- Public GitHub requests are not suited to confidential user specifications.
- No successful live Codex code-production run is claimed; deterministic spec validation is not code generation.
- Multi-stage Task/Plan forms remain complex and may need further simplification during a user pilot.

## Quality and honesty gates
Existing tests, new recovery tests, TypeScript and production Next.js build must pass. Report production READY only when Vercel confirms it. Do not claim usability certification or independent mobile/browser smoke tests without the evidence.
