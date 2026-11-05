# Sprint 06 — Owner demonstration guide

1. Open https://visual-sdd-platform.vercel.app and select **SDD Canvas → GitHub traceability**.
2. With a Specification already approved, approve a Technical Plan and Task Breakdown containing a Task linked to at least one acceptance criterion.
3. Choose a Task. Paste the synthetic public demo URL: **https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/4**.
4. Click **Inspect public PR**. The site should show the real draft PR title, exact head SHA, provider-listed file path(s) and GitHub check-run results. This observation is independent of the Task.
5. If the approvals are current, click **Link verified PR head to Task** and confirm the association. A new traceability row will show Requirement → Criterion → Task → PR → Commit.
6. Refresh GitHub separately to verify HEAD and check status. If the PR is force-pushed, the old SHA is not silently accepted. If the Task or Specification is edited, the link is marked stale.
7. Export the Markdown trace and JSON backup, or unlink the association. The PR in GitHub is untouched.

**Privacy warning:** Public PRs only. Specification text is not sent to GitHub by inspection, but the PR itself is public. Do not put private ideas or credentials into a public PR for testing.

**Meaning of a green GitHub check:** GitHub's CI for that PR head passed its checks. It does not prove code meets your Acceptance Criteria, that Codex ran, or that the project was deployed.

**What remains deferred:** a real browser end-to-end user acceptance pass, cloud Plan/Task and link persistence, private GitHub App access and code-level semantic dependency verification. No Sprint 07 before owner approval.
