# ADR-011 — Two-graph interactive SDD canvas
**Status:** Adopted in Sprint 02

## Context
The previous overview displayed a seven-step diagram but did not change process artifacts. It was insufficient for a product intended to make Spec-Driven Development *visually operable*.

## Decision
Maintain separate data projections for **Workflow Graph** (stages, gating and human approval) and **Traceability Graph** (Requirement -> Acceptance Criterion -> Task). Both derive from the same structured Specification and PlanningDocument; neither stores invented links.

The UI allows human editing and gated approval of the Technical Plan and Task Breakdown. Plan approval binds to a specific Specification revision. Editing the plan invalidates its own approval and all downstream approvals; editing task definitions invalidates task approval. Reapproval of Specification creates a stale boundary that prevents reuse of outdated planning approvals.

Use a dependency-light HTML/CSS/SVG presentation with keyboard-reachable node buttons. Do not claim drag-and-drop editing or agent orchestration until implemented.

## Persistence boundary
Plan and task drafts are browser-local for this sprint, keyed to the original idea and the linked cloud project if available, with explicit Markdown/JSON export. The existing Neon cloud accounts still store only ideas and specifications. A subsequent migration can add cloud planning persistence with proper owner authorization and optimistic concurrency.

## Security / correctness
No untrusted generated code executes on the application service. All future-run nodes are non-actionable. Validate user-entered fields, revision consistency, stable entity identifiers, and explicit criterion linking before approval.
