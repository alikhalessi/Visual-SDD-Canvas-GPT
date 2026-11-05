# Sprint 03 — Owner setup & smoke testing

## Test the no-AI path
1. In Visual SDD create an Idea, write/approve a Specification, then approve a Technical Plan and Task Breakdown with at least one Requirement/Acceptance link.
2. Open the SDD Canvas → Implement. Select **Validate the handoff**.
3. Confirm public repository disclosure. Prepare a manifest; review it, use **Copy issue body**, then **Open GitHub issue form**.
4. Paste the issue body and submit as **alikhalessi**. Merely opening the issue form does not start an Action.
5. Open the repository's Actions tab and select **Visual SDD — Approved Agent Handoff**. Look for the new issue-triggered run.
6. Confirm the upload contains spec.md, plan.md and tasks.md. The validate-only mode should never run Codex or change code.

## Enable real Codex later (requires explicit approval and billing)
1. Go to GitHub repository Settings → Secrets and variables → Actions → New repository secret.
2. Add the secret **OPENAI_API_KEY** using your own API account credentials. Do not paste it in ChatGPT or a public issue.
3. The token must have valid billing/quota; ChatGPT subscription alone is not an API key.
4. In Visual SDD select **Run Codex**, review publication scope and task; manually submit the issue.
5. Inspect the corresponding Actions run, proposed code and pull request. Do not merge automatically.
6. If GitHub blocks PR creation, inspect repository Actions permissions, but do not broaden security settings without understanding their effect.

## Evidence and privacy
The repo is public: any user can read issue payloads. Never use this pilot with private or sensitive projects. Use synthetic tasks for proof. The app deliberately cannot submit issues without owner action. The workflow has no server-side secret connection from Vercel.
