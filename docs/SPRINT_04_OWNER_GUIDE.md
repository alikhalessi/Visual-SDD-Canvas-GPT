# Sprint 04 — Reproduce and verify real evidence

The first verified issue was **#3** (synthetic fixture), with Actions run **42102571615**. See https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42102571615. Its evidence artifact is called `visual-sdd-evidence-3`.

## Check in the app
1. Open https://visual-sdd-platform.vercel.app and enter the SDD Canvas → Implement.
2. Scroll to **Verify a real GitHub run**.
3. Click **Use synthetic smoke-test Issue #3**, then **Verify evidence**.
4. If the public API is available, the app should display **Verified artifact handoff** and official links.
5. Click the evidence artifact to inspect `evidence.json` and the four other generated docs.

## What was actually checked
The owner-issued GitHub Issue #3 triggered the GitHub Actions `verify-handoff` job, which passed nine Python regression tests and nine checks on five generated files. SHA256 hashes were emitted in `evidence.json`; the Action uploaded the zip and posted a comment on the Issue.

## What is NOT proved
No Codex model invocation, no automatically implemented source code, no software functionality testing, no GitHub PR and no production deploy from the issue workflow. The Codex job was deliberately **skipped** for this validation-only request. Sprint 04 does not enable coding-agent spending without separate API key configuration and explicit owner review.

## Troubleshooting
If the evidence viewer reports a GitHub rate limit, open the linked GitHub Action directly. If there is no verified bot comment, check the Actions job logs. Do not share credentials, Google tokens or personal project specs in public issues. Existing cloud idea save/reload requires separate user acceptance later.
