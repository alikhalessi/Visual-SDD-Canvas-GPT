# ADR-008 — Sprint 01 browser-local structured specification

We implement a revisioned, user-editable specification as the first durable SDD artifact.
The initial draft intentionally contains no invented user behavior. Users must write the goal, audience, behavioral requirements and testable acceptance criteria.
An approval gate accepts only the exact validated revision and is invalidated by any edit.
Browser-local persistence and Markdown/JSON export are explicit limitations, not a cloud backend.
A future SDD adapter will import/export this model; it must never infer approval from an agent's claim.
