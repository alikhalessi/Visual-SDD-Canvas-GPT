# Visual SDD Canvas

**Sprint 07 — Human-Centered UX & Quality Foundation**

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

## Sprint 07: clearer navigation, accessible editing and safe recovery

**v0.7.0 production verified:** 160/160 Node tests, TypeScript, Next.js build and canonical Vercel deployment READY. See [release evidence](docs/SPRINT_07_RELEASE_EVIDENCE.md). Manual mobile and cloud save/reload acceptance remains pending.

- Live, state-aware **Current project** command center: one next step, honest approval stage, Browser vs Cloud-linked status.
- Plain Language defaults to fewer competing panels; Professional reveals expanded process details while preserving every governance control.
- Specification editor now includes inline field-level validation and a direct handoff to Technical Planning after human approval.
- Browser-local Specification recovery is **fail-closed**: malformed cached JSON is never silently overwritten or removed. The original can be exported and then cleared only by explicit owner confirmation.
- Incoming cloud documents are validated before changing current browser work.
- Readability, keyboard focus, touch targets and mobile input sizes receive a dedicated responsive quality stylesheet.
- UX journey diagrams and a source-grounded UX audit: [journey map](docs/SPRINT_07_UX_MAP.md), [audit](docs/SPRINT_07_UX_AUDIT.md), [acceptance criteria](docs/SPRINT_07_ACCEPTANCE.md).
- **Not claimed:** live screenshot-based mobile testing, formal WCAG certification, completed cloud Plan/Task persistence or a successfully executed Codex coding task.

## Sprint 06: evidence-linked GitHub traceability

The SDD Canvas now offers a fourth visualization: **GitHub traceability**.
An approved Task can be explicitly linked to a public GitHub Pull Request after inspecting its real PR metadata. The trace graph connects Requirement → Acceptance Criterion → Task → PR → verified head SHA, and shows provider-listed changed file paths and GitHub check runs.

- Task-to-PR connections are **human-declared**, never inferred by guessing or text similarity.
- GitHub API metadata is fetched read-only; no personal access token, Specification body, or customer data is sent.
- Check-run state is only green when every reported check was returned and completed successfully. No checks, incomplete lists, in-progress runs and skipped-only runs are not called `passed`.
- Links are tied to the exact approved Spec, Plan and Task revisions. A new revision or PR force-push makes prior evidence stale until reviewed.
- Links persist **in the current browser only**, separately from account-backed idea/Specification storage; Markdown/JSON exports are available.
- Real synthetic documentation-only draft PR: [#4](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/4); its GitHub Actions CI [run 42110519364](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42110519364) completed successfully.
- Production v0.6.0: **136/136 Node tests, TypeScript and Next.js Build passed**. An earlier GitHub PR CI run exposed the need for an Auth cookie secret during build; CI now generates an ephemeral, nonproduction secret solely for testing. Real secrets are not copied to CI.
- **Not implemented:** private-repository OAuth/GitHub App, semantic source-code-to-requirement proof, CI-based acceptance coverage, auto-merge, deployment evidence and cloud synchronization for Plan/Task/PR links. No Codex agent was invoked in this sprint.

See `docs/SPRINT_06_ACCEPTANCE.md`, `docs/ADR-015-GITHUB-TRACEABILITY.md`, and `docs/SPRINT_06_OWNER_GUIDE.md`.

## Sprint 05: Explainable change impact

- Every new Technical Plan captures a structural snapshot of its *approved source Specification*. Existing plans without a snapshot show an honest "legacy baseline missing" warning.
- New **SDD Canvas → Change impact** view compares current content with that snapshot: changed Requirements, Acceptance Criteria and product intent; before/after text; directly linked and potentially affected tasks; and stale governance gates.
- The user can inspect individual changes, return to related tasks and export an impact analysis as Markdown.
- No reapproval is granted automatically, no task is declared safe solely because its explicit link is absent, and no AI code execution is implied.
- Historical snapshots for Plan/Tasks are still browser-local, not signed audit records or cloud synced.

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
