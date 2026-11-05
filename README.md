# Visual SDD Canvas

**Sprint 04 — Verified GitHub Actions Evidence**

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

**Not implemented yet:** AI agent execution, automatic specification generation, repository synchronization, team accounts, cloud synchronization of planning/tasks, production code generation, and release verification.

## Sprint 04: real, verifiable Actions evidence

- Corrected malformed GitHub Actions expressions that had prevented trustworthy issue-triggered results.
- Verified a real end-to-end **validate-only** workflow: synthetic public Issue #3 → Actions run [42102571615](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42102571615) → 9 Python checks → 9 artifact checks → SHA256 evidence upload → issue comment.
- Added a read-only **Verify evidence** panel to the Implement stage. It verifies a GitHub Actions bot comment, successful official run metadata, and an unexpired, correctly named evidence artifact.
- The Codex job was **skipped** during this run. AI implementation, code changes and PR creation remain unverified, contingent on a repo API secret and separate owner approval.
- Planning and Task drafts remain browser-local; do not put proprietary ideas in this public GitHub Issue channel.

## Sprint 03: controlled GitHub handoff

- The Implement stage creates a bounded JSON run manifest from explicitly approved Specification → Plan → Tasks.
- A user-approved **validate-only** GitHub Actions handoff generates Spec Kit-compatible spec.md, plan.md and tasks.md (no AI).
- Optional OpenAI Codex runner using GitHub Actions is designed to write ONLY isolated proposed files under agent-preview/<issue-number> and request human PR review.
- **Codex is not enabled unless OPENAI_API_KEY is configured as a GitHub Actions secret.** No model call is claimed until an actual GitHub Actions run proves it.
- The repository is public: the UI asks for explicit consent before exposing a selected task and its context as an Issue. Issue URL never includes idea text.
- GitHub issue submission is manual. Only owner-submitted issues qualify. The adapter does not cryptographically attest browser-local human approval.
- Account-based activity tracking and cloud storage for Plan/Tasks remain future work; the Codex runner doesn't deploy or merge automatically.

## Sprint 02: Interactive workflow and traceability

- Clickable workflow graph with live, artifact-driven statuses and approval gates.
- Separate traceability graph generated from explicit Requirement / Acceptance Criterion / Task relationships.
- Technical Plan and Task definitions are genuinely editable; human approval is tied to the current revision.
- An edited Specification invalidates dependent planning approvals; agent execution remains disabled.
- Planning artifacts are **stored in this browser only**, with Markdown and JSON export. They do **not** yet synchronize to the My Projects cloud workspace.

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
