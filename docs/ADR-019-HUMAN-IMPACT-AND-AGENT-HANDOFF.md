# ADR 019 Human impact and deterministic agent handoff

Date: 2026-11-21. Status: implemented for review on the Sprint 10 branch; release permission pending.

## Problem and decision

Source v1 and the project-scoped stakeholder sidecar already contain the business facts. A lossy task-only export can conceal an open queued-delivery question or imply that attached examples authorize implementation. Export a new versioned, bounded, canonical package while leaving the legacy specification and Neon API unchanged.

`canonicalSnapshot` accepts exactly the supported source/review fields, rejects ambiguous IDs and stale identities/revisions, sorts identifier-based collections, normalizes text to NFC/LF, and serializes object keys in ordinal order. Full source and review records, including archived removed-rule notes, remain present. Given/When/Then retain stated preconditions, triggers and expected outcomes. Additional state-machine/invariant semantics are not fabricated from prose. Unknown coverage is explicit.

The SHA-256 digest covers the entire canonical source/review snapshot, including decisions, revisions and timestamps. Handoff decision history is separate to avoid a self-referential hash. Every decision records actor label, explicitly browser-local provenance, decision/rationale/time, full-snapshot scope, source/review revisions and digest. Only the latest decision can be current. Relevant edits stale it without deleting history. A current handoff approval additionally requires current source and per-rule review approval and complete structural coverage; it never proves implementation or authenticated human identity.

Business projection, structured Markdown and agent manifest are generated from the same snapshot. Parity verification compares every supported record and the entire Markdown document against fresh expected projections, including governance history. Unknown fields, forged sections, missing facts, modified coverage, stale digests and execution claims fail closed. Markdown embeds untrusted strings in JSON with backticks and HTML delimiters escaped. No permissive extraction of one trusted-looking section is used.

## User interaction and persistence

The Business view opens a native modal for impact, full review, explicit decision and export. Open edges remain draft-only. Actor and rationale input does not silently approve anything. A fresh storage/source/history check runs before and after asynchronous verification, including before bridge export. Another-tab writes, corrupt sidecars and storage failures stop the action; original bytes remain recoverable. Histories use a source/project-scoped local key, are bounded to 100 decisions and are never silently trimmed. First cloud save copies the history alongside review/provenance into unoccupied project-local keys while retaining the originals and compensating failed copies. This is not cloud synchronization.

Engineering impact adds plain-language descriptions of recorded workflow/task relationships, open timing questions and missing/legacy baselines. No recorded link is not evidence of safety. Foreign review identities are not used as dependency evidence.

## Compatibility contract

| Path | Supported meaning | Restrictions |
| --- | --- | --- |
| New Markdown and JSON | Complete supported source/review model, archived notes, coverage and local sign-off provenance | Export only; no execution authorization or authenticated signature |
| New bundle to v1 validation bridge | One approved legacy task and precisely linked criteria, with companion full-bundle digest | Current parity, full review/sign-off and legacy approval chain required; only `validate_only`; full bundle must accompany it |
| Legacy coding-agent execution | Existing owner-created issue and original dispatch/approval controls | Unchanged; new bundle is not automatically consumed or dispatched |
| State-machine inference and full Spec Kit/Codex interoperability | Not established | Unsupported semantics remain explicit uncertainty; no execution/interoperability claim |

The bridge is deliberately not a lossy substitute for the full package. Python v1 validates the translated task structure only. The new interface offers no network dispatch or issue publication.

## Alternatives and consequences

Extending v1 source/runner schemas would break older readers and imply unsupported execution semantics. Cloud-signing review assertions would require an authenticated server record and migration; it is outside this sprint. Hashing only rule wording would miss timing questions and review edits. Dropping old sign-offs would erase the audit trail. These options were rejected.

Local assertions can be edited by someone controlling the browser. Digest/parity checks establish content correspondence, not authenticity or implemented behavior. Exports can contain private product text and remain deliberate local downloads. No API keys, model calls, new cloud schema or automatic code execution are introduced.

## Verification

See [the Sprint 10 scenario catalog](SPRINT_10_TEST_CATALOG.md), [acceptance matrix](SPRINT_10_ACCEPTANCE.md) and exact-head CI/preview evidence in the Sprint 10 PR. Node negatives cover content/governance tampering and ambiguous Markdown; browser scenarios cover end-to-end export, approval staleness, recovery, concurrent writes, focus, narrow layouts and failed storage. Python v1 validation and prior regressions remain required.
