# ADR-016 — Next-action clarity and fail-closed local recovery

Status: Adopted — Sprint 07.

## Decision
Default to one clear next action based on Idea and actual Specification approval. Show technical stage details as progressive disclosure without changing permission or validation gates. Differentiate browser-local persistence, explicit Google cloud saves, and read-only public GitHub evidence.

When local Specification JSON is invalid, prevent automatic overwriting or deletion. Preserve the exact original locally, offer a recovery download and require a separate explicit confirmation before clearing only the unreadable Specification cache key.

## Why
A governance product cannot risk false completion labels or silent destruction of evidence. UX decisions favor trustworthy state, recoverability, keyboard access and plain wording over impressive-looking metrics.

## Deliberate exclusions
No new cloud Plan/Task storage, private GitHub App, Codex execution, or claim of complete WCAG certification. These require independent security and acceptance gates.
