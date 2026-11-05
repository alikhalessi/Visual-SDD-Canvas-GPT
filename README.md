# Visual SDD Canvas

**Sprint 01B — Google Login & Persistent Workspace**

Visual SDD is a visual operating environment for Spec-Driven Development. Its core product is the **visible, reviewable, and controllable SDD process**, rather than a generic AI app builder.

## What Sprint 00 delivers

- Responsive workspace with an Idea entry point.
- An interactive seven-stage SDD canvas.
- Simple and Professional views of the same workflow.
- Guided state-based journey with real completion status and clear next actions.
- Browser-local idea draft and structured visual specification editor.
- Accessible mobile workspace navigation, keyboard skip link and readable writing examples.
- Saved Simple/Professional display preference.
- Add/remove requirements and testable acceptance criteria.
- Explicit approval linked to document revision; any edit resets approval.
- Markdown / JSON export and browser-local persistence.
- Testable SDD domain model, a CI workflow, roadmap and design decisions.

**Not implemented yet:** AI agent execution, automatic specification generation, repository synchronization, team accounts, persistent cloud storage, production code generation, and release verification.

## Sprint 01B cloud workspace

- Google sign-in using Neon-managed Better Auth (shared Google provider).
- A dedicated Neon PostgreSQL project in EU Central, separate from SetPilot.
- Account-owned projects with explicit save, open and delete operations.
- Persistent specifications plus recorded cloud save/approval history.
- Server-side session validation, owner-scoped SQL, and stale-revision protection (409).
- Browser-only drafts remain possible for guests, with explicit migration to cloud.

**Important:** Google OAuth still requires a real sign-in verification with a browser. No automatic cross-device sync occurs until users save. Agent execution and SDD automation remain future work.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

## Delivery policy

Each sprint requires implementation, CI evidence, Git commit, DOCX report, verified production deployment and explicit Product Owner approval before the next sprint.
