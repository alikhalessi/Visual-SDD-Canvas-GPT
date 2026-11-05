# ADR-015 — Read-only GitHub PR evidence and human-declared task associations

Date: 2026-11-05  
Status: Adopted (Sprint 06)

## Problem
Visible traceability is often faked by drawing lines from task IDs to random commits or CI badges. A genuine Spec-Driven Development operating environment needs a verifiable source of facts and a separate, explicit statement of how those facts relate to business requirements.

## Decision
Use the GitHub public REST API directly from the browser as a **read-only metadata provider**. When a user gives an HTTPS PR URL, look up its full metadata, assert exact repository/PR identity, head SHA and current state, then retrieve changed file names and check runs for that exact SHA. No access token is transmitted by the app. The user explicitly chooses which approved Task the PR is associated with.

Persist the association as a browser-local record containing the Task ID, repository, PR number, exact head SHA and the Specification/Technical Plan/Task Break­down revision identifiers. Do not persist or blindly cache a "passed" CI result. On reload, all check states start unverified until the user refreshes public metadata.

## Status semantics
- **Task linkage** = human-declared, current only if all referenced SDD approvals and revisions still match.
- **PR verification** = returned GitHub metadata for the exact PR. Does not verify behavior.
- **Code files** = file paths listed by GitHub as changed in that PR; no semantic attribution to the requirement.
- **CI evidence** = check runs associated with that head commit, with explicit missing/partial/unavailable states.
- **Passed checks** = only when *all* fetched check runs are complete and successful. A check that is skipped, neutral, missing or beyond first-page enumeration is not reported as a full pass.
- **Product verification** = separate from all above; not implemented by this PR integration.

## Security
Do not store a GitHub PAT in the browser or the repository. Only public GitHub projects are supported. Restrict accepted PR URLs to a canonical `https://github.com/owner/repo/pull/N` origin, and derive network paths only from validated repo and numeric PR components. Treat returned titles, checks and file names as untrusted text (React escaping). Never execute code from GitHub responses. All links must be user-initiated and bound to an approved planning revision.

## Alternatives rejected
- Inferring PR-to-requirement mapping from textual similarity or shared IDs: too unreliable for an accountability tool.
- Assuming a green GitHub check is proof of complete acceptance: misleading.
- Adding a GitHub personal token/client secret to browser code: unsafe.
- Posting the private Specification to GitHub as an automatic Issue or PR: privacy risk.

## Carry-forward
Introduce authenticated GitHub App integration for private repositories, server-verified links with signed approval history, hosted Plan/Task persistence, pagination and stronger artifact-to-test coverage only after separate product and security gates.
