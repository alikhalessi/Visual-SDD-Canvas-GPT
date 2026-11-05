# ADR-013 — Verified evidence is separate from AI execution

**Decision date:** 2026-11-05  
**Status:** Adopted in Sprint 04

## Problem
The first owner-dispatched workflow in Sprint 03 used malformed GitHub Actions expressions. A Next.js production build appeared successful while no trustworthy remote workflow evidence was available. This violated the project's own emphasis on accountability.

## Decision
Every human-approved agent request moves through explicit stages with independent evidence:
1. The user deliberately submits an issue (public repo warning).
2. GitHub checks the issue author's identity and parses versioned JSON as data.
3. A deterministic Python adapter creates Spec Kit-compatible artifacts.
4. A separate verifier checks task/criterion consistency and calculates file SHA256 values.
5. GitHub Actions uploads the evidence and comments a run URL on the source issue.
6. The website's read-only evidence viewer checks that the comment is authored by `github-actions[bot]`, that a corresponding GitHub Actions run has `event=issues`, `conclusion=success` and the expected workflow name, and that a matching unexpired evidence artifact exists.
7. The evidence viewer **never infers** AI execution, deployed code or product acceptance from this result.

## Safety boundary
- No OpenAI API key is required in validate-only mode.
- Optional Codex lives in a separate job and is only entered for a manifest requesting that mode.
- The GitHub issue body can contain untrusted or intentionally malicious instructions. The adapter parses JSON fields, does not evaluate commands, and only emits bounded Markdown.
- The browser sends no credentials or private user project data to GitHub when checking publicly available evidence.
- Issue comments alone are not trusted; run metadata and artifact metadata must agree.
- SHA256 hashes establish artifact integrity for the generated package, but do not prove that owner-declared approvals are cryptographically authentic.
- New issue-triggered Actions are not equivalent to verified application functionality.

## Follow-up
A future authenticated GitHub App should replace public issue payloads before external beta use. Planning artifacts should move to a private authenticated cloud, and Codex should run with hardened settings, model audit logs and explicit human review.
