# ADR-014 — Version-bound snapshots and explainable change impact

Status: Accepted for Sprint 05
Date: 2026-11-05

## Context
An approval-gated SDD graph that only shows `stale` does not help a product owner understand why. An impact view must show **differences and traceable consequences**, without suggesting that an AI understands undisclosed business dependencies.

## Decision
At the instant a user creates a Plan based on an approved Specification, capture a structural copy of that approved Specification as `specBaseline` inside `PlanningDocument` (same browser-local persistence key). This snapshot contains product intent, requirement fields, criterion text, stable-in-scope IDs and revision number.

When viewing Change Impact, compare the current Spec against the captured baseline. Emit changes with:
- scope (`product`, `requirement` or `criterion`);
- action (`added`, `removed`, `modified`);
- prior/current human-authored text;
- Task IDs directly linked to the changed requirement or criterion.

Map the remaining task IDs to a **potential review** set rather than declaring them unaffected. Carry forward existing governance gates: an edited/unapproved Spec blocks Plan/Tasks/Implement. No automatic reapproval or AI-run dispatch.

## Legacy compatibility
Pre-Sprint-05 Plans did not capture a baseline. They remain readable, but **every task is conservatively marked for manual review**. Fabricating past text would create false traceability.

## Consequences
The diff is transparent, deterministic and reproducible for a stored snapshot, but not semantic. It does not prove requirements have correct persistent identity if deleted IDs are reused. The baseline is user-editable local JSON and therefore not a tamper-evident audit ledger. A future authenticated, server-signed history plus immutable entity IDs is required before regulated or collaborative use.

## Alternatives rejected
- Marking all tasks affected without explaining direct links: too coarse.
- Comparing only revision counters: cannot show the actual changed text.
- Reconstructing old specs from latest cloud data: unreliable without a revision history.
- Automatically carrying old approval to edited artifacts: violates human-in-the-loop governance.
