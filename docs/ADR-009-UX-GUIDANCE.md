# ADR-009 — Guided UX, honest readiness, and responsive access

Date: 2026-11-05
Status: Implemented for Sprint 01A

## Decision
The introductory workspace displays a state-driven three-step path: capture an idea, define requirements, review and approve. Each state is derived from the actual browser-local idea and specification. The stage Canvas remains an orientation aid; no status suggests that the future agent, planning, or release stages are already available.

## Rationale
The product serves both nontechnical founders and Product Owners. A high-fidelity dashboard alone did not tell first-time users what to do. The next action and contextual writing help address that cognitive load while retaining the same SDD data model.

## Accessibility and usability decisions
- Keep the dark brand visual language, use clear focus treatment and a skip-to-main link.
- Provide mobile navigation explicitly rather than hiding the sidebar without an alternative.
- Preserve Simple/Professional mode locally; switching never alters the underlying document.
- Show browser-only persistence accurately; no Google login or cloud sync in 01A.
- Honor reduced-motion user preferences.

## Future
Authentication and cloud persistence belong to Sprint 01B, separately approved.
