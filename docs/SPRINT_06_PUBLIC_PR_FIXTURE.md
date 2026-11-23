# Sprint 06 — Synthetic GitHub PR evidence fixture

This intentionally tiny documentation-only change is an **observable PR evidence fixture** for Visual SDD Sprint 06.

## Purpose
- Demonstrate the real GitHub Pull Request metadata, changed-file listing and head commit SHA.
- Make it possible to inspect any CI check runs associated with the PR's real commit.
- Provide a safe public example that contains **no user Specification, no customer data, no private information, and no credentials**.

## Important limitations
This file does not implement any user's task, and a successful CI job does **not** prove the satisfaction of any Requirement or Acceptance Criterion. Visual SDD's link from an approved Task to a PR is a human-declared relationship; the GitHub API independently verifies only public PR/commit/check facts. No Codex execution is implied.

This fixture is proposed as an unmerged draft PR and should remain review-only.

## Reproducible CI boundary
The Pull Request runs the repository's test, TypeScript and Next.js build workflow using a synthetic ephemeral cookie secret for CI. It never uses production credentials or runs application login tests.
