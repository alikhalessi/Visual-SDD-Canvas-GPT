# Sprint 01B — Google Login and Cloud Workspace

## Goal
Add genuine Google authentication and user-owned persistent projects to Visual SDD. The same browser-local Idea and Specification editing flows remain available without login.

## Infrastructure
- Dedicated Neon project `Visual SDD Platform` in EU Central (not shared with SetPilot).
- Neon-managed Better Auth with Google shared OAuth provider.
- Vercel environment stores connection credentials and session signing secret; no credentials in Git.
- `visual_sdd_projects` and `visual_sdd_activity` tables, both with row-level security enabled.
- Application API validates the Neon Auth server session on each request and scopes every query to its user ID.
- User must explicitly request a cloud save or import; no silent migration of previous browser data.

## Acceptance criteria
AC-01B-01: Google sign-in button initiates real Neon Auth Google OAuth.
AC-01B-02: Unauthenticated API requests to /api/workspace are rejected.
AC-01B-03: Signed-in users can save an idea and optional structured specification.
AC-01B-04: A user can view, reopen, and delete only their own projects.
AC-01B-05: Events record project creation and later saves/approvals/reopening.
AC-01B-06: Cloud edits use an optimistic concurrency token; no silent overwrites.
AC-01B-07: Browser-local work can be saved after login, with consent.
AC-01B-08: TypeScript, automated tests, Production build pass.
AC-01B-09: A DOCX report and deployed URL are delivered; owner approves before Sprint 02.

## Not part of this sprint
Shared team permissions, SDD engine / agent execution, billing, Google Drive access, or cross-user project sharing.

## Security notes
Cloud project data is stored server-side and never queried using an unverified client-provided user ID.
Do not state that the Google callback has been end-to-end tested unless a real browser OAuth roundtrip was observed.
