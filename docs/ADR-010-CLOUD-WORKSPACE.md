# ADR-010 — Account-owned cloud workspace
**Status:** Sprint 01B implementation
**Date:** 2026-11-05

## Decision
Use a dedicated Neon Postgres project (EU Central, Free plan) and Neon-managed Better Auth with Google OAuth. No project data is reused from Nordljud or SetPilot.

The public idea/specification editor stays available without authentication. Google sign-in is offered in the persistent workspace. Import from browser-local storage requires an explicit **Save to my account** action.

Each cloud project belongs to one authenticated user ID, verified by the server against the managed session. Every application query filters by that ID. The API stores a JSON specification and an append-only record of *cloud save* events. It never claims to record all unsaved typing or future agent execution.

Optimistic concurrency checks the last server update timestamp; a stale request returns HTTP 409. Project deletion is owner-scoped and permanently deletes that project's events via the database foreign key.

## Risks and limits
- Google OAuth completion needs a real browser walkthrough; provider configuration and build success do not prove the consent redirect works.
- Database access uses a privileged server-only credential; browser-accessible DB credentials are not exposed. RLS is enabled and no broad public policies are installed, but authorization enforcement here depends on server checks.
- Saved edits are explicit, not automatic; users need to press Save to my account for each revision.
- No team roles or invitation functionality.
- Neon Auth SDK is a pinned beta dependency; monitor updates and integration changes.
- Google sign-in to Neon may display Neon branding with its shared OAuth client.
