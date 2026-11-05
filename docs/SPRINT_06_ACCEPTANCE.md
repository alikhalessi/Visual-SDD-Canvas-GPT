# Sprint 06 — GitHub PR and Code-Evidence Traceability

**Release:** v0.6.0, production deployment `dpl_D27YAGhzh1SkjZCkueUFMJs35Mjp`, READY.
**Owner status:** Sprint completed technically; independent browser acceptance pending. Sprint 07 is gated.

## Scope delivered

1. A fourth interactive SDD Canvas view, **GitHub traceability**, with a directed graph from Requirement → Acceptance Criterion → Task → public GitHub Pull Request → exact head commit SHA.
2. A fail-closed model in `lib/github-trace-core.ts`: canonical HTTPS pull URL validation, strict returned repository/PR metadata, 40-character commit-SHA checks, bounded changed-file lists and check-run parsing.
3. Read-only browser queries to GitHub REST API for public PR identity, changed files and check runs for its head SHA. API token not required for public repositories, subject to public rate limits.
4. Human-selected links from an approved Task to an independently inspected GitHub PR. This **human-declared association** is not misrepresented as independently demonstrated software functionality.
5. Approvals and links are revision-bound. Changed Specification/Plan/Task revision or updated PR head SHA invalidates the notion of current, refreshed evidence.
6. Separate GitHub check statuses: passed only when all reported check runs were fetched and completed with `success`; failures, pending, skipped-only, absent and truncated responses are not green. No acceptance-test or deployment claim.
7. Browser-local per-project associations, explicit unlink, manual refresh, Markdown trace export and JSON backup.
8. A synthetic documentation-only **draft Pull Request #4** in this repo demonstrates real PR metadata, real file paths, a real commit and GitHub CI. No merge, no deployment and no agent task implementation.

## Evidence

- Main repository: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT
- Synthetic demo PR: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/4
- Demo PR was opened as draft. Its source is `docs/SPRINT_06_PUBLIC_PR_FIXTURE.md` only; the PR has no real product requirement attached.
- Vercel deployment: https://vercel.com/aleksi9/visual-sdd-platform/D27YAGhzh1SkjZCkueUFMJs35Mjp
- Production: https://visual-sdd-platform.vercel.app
- Vercel enforced **136/136 automated Node tests, TypeScript, and successful Next.js production build**.
- GitHub CI smoke PR originally passed tests and typechecking but failed at Next.js build because the unprivileged runner lacked a runtime Auth cookie secret. The GitHub workflow was amended to generate an **ephemeral, nonproduction cookie secret for CI builds only**, without exposing live environment variables. A new PR head was pushed to re-run CI; record the final outcome after inspection.

## Acceptance cases

| ID | Required behavior | Evidence |
|---|---|---|
| S06-01 | Only valid HTTPS GitHub Pull Request identities allowed | Unit tests |
| S06-02 | Provider PR must match exact requested repository and number | Unit tests |
| S06-03 | PR head SHA and changed file metadata derive only from provider | Unit tests and synthetic PR #4 |
| S06-04 | Check-run success/failure/unknown never fabricated | Unit tests |
| S06-05 | Missing or partial check-run data never marked passed | Unit tests |
| S06-06 | Human expressly chooses which approved Task to attach | UI wiring, core gate |
| S06-07 | New revisions and PR force-push invalidate current matching | Unit tests |
| S06-08 | Trace graph follows actual requirement and criterion IDs | Unit tests |
| S06-09 | Links saved per project in browser, exportable and removable | UI wiring |
| S06-10 | Public PR proven with actual GitHub draft PR | PR #4 |
| S06-11 | Full Node/TypeScript/Next Vercel build succeeds | 136/136 tests; deployment READY |
| S06-12 | Product Owner can open browser, inspect PR #4 and link it to an approved Task | Manual browser acceptance pending |
| S06-13 | English DOCX, ZIP alternative and source documentation delivered | Sprint report delivery |

## Strict limitations

- **No AI coding run was performed by this sprint.** Sprint 04's run only proved a deterministic artifact-validation chain.
- Public GitHub only; no private repository token/authorization, no write access, no automatic PR creation from the Canvas, no automatic merge/deploy.
- One user choosing a PR for a Task is an assertion of relevance; Github only validates PR facts and check runs. Passing CI is not proof that every Acceptance Criterion was met.
- Changed files and checks are limited to the first 100; further pagination, full source AST analysis and semantic dependency inference remain future work.
- Task–PR associations are stored locally. Authentication, cloud idea/spec storage and legacy-plan baseline behavior are preserved, but Plan/Tasks and PR links are not cloud-synced.
- Real browser usability and integration with arbitrary repositories need manual testing; public API may rate limit.
- A PR may target a fork, and its head SHA may change. The evidence view treats unrefreshed/mismatched PR head SHAs as unverified.
- Never publish private Specification content in a public repo just to test integration.

## Release gate
Sprint 07 must not start before Product Owner acceptance of Sprint 06.
