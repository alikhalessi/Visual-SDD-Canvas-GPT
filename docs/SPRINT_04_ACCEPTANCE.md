# Sprint 04 — End-to-End Evidence and Verified Execution Boundary

**Delivery status:** production READY and real validate-only GitHub Actions run verified; Product Owner acceptance pending.

## Shipped
- Repaired missing GitHub Actions expression delimiters in `.github/workflows/sdd-agent.yml` that blocked Sprint 03 issue events.
- Converted owner-created public run issue into the verified chain: Issue → GitHub Actions → strict adapter → Spec Kit-compatible documents → Python checks → SHA256 evidence artifact → GitHub issue comment.
- Split validation and optional Codex into jobs. Validation has no write access to source code; Codex is a separate privileged job that is **skipped** for validate-only.
- Fail-closed checks for owner identity, schema, requirement and acceptance links, version claims, generated artifacts and tampering.
- Created `scripts/verify_run.py` and Python regression suite; expanded GitHub CI to include it.
- Integrated read-only **Verify evidence** in the Implement stage. It fetches issue comments, run metadata and artifact metadata from the public GitHub REST API, and reports only a validated handoff—not generated code or AI execution.
- Preserved human approval gates and deliberate, manual GitHub Issue submission.

## Live evidence (synthetic public data; no AI)
- GitHub Issue: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/3
- Actions Run: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42102571615
- Job `Verify owner-requested artifacts`: **success**.
- Job `Optional isolated Codex proposal`: **skipped**.
- Python regression tests in live run: **9/9 passed**.
- Artifact verification checks: **9/9 passed**.
- Uploaded evidence artifact: `visual-sdd-evidence-3`, ID `13450387405`.
- Artifact ZIP SHA256 reported by GitHub Action:
  `686c7e54c40842e455836a9001b2e99ed796f9b67755d061b6d1427f9c6a06ab`.
- No API calls to models; no user application source changes; no deployment from GitHub Actions.

## Acceptance cases
| ID | Expected | Status / proof |
|---|---|---|
| S04-01 | New owner issue triggers valid Actions workflow | PASS — Issue #3 |
| S04-02 | Owner/repository/schema checks enforced | PASS — Python tests and live job |
| S04-03 | Spec Kit-compatible docs generated from one task | PASS — live uploaded package |
| S04-04 | Acceptance IDs and document content verified | PASS — 9 evidence checks |
| S04-05 | SHA256 artifact digests produced | PASS — evidence.json and ZIP SHA256 |
| S04-06 | Result linked to original public Issue | PASS — GitHub Actions bot comment |
| S04-07 | No API secret required for validate-only | PASS — Codex job skipped |
| S04-08 | New UI performs read-only official GitHub check | Code/tests delivered; manual browser verification pending |
| S04-09 | Full TS/Next production tests and typecheck | PASS — 91/91, Vercel READY, dpl_42GA1o6x6LEGJFkC4WqLfBFgvmb7 |
| S04-10 | Real Codex creates candidate source and PR | **NOT VERIFIED** — requires an API key and owner approval |
| S04-11 | English DOCX report and owner acceptance | Report delivered; owner review pending |

## Explicit limitations
This sprint **proves execution of the deterministic validation pipeline, not AI coding**. The `codex` mode requires a GitHub secret `OPENAI_API_KEY`, model quota and a genuine run. The old Sprint 03 user account save/reload test is still deferred. Plans/tasks remain browser-local, not synchronized to cloud. The public issue flow is unsuitable for confidential specifications. The approval assertions in issue JSON are not signed server-side attestations.

## Next gate
Do not start Sprint 05 until owner approves Sprint 04. If the owner wants an AI-coding demonstration, configure a dedicated, least-privilege credential in GitHub and perform a separate controlled Codex run. Do not claim this happened within Sprint 04.
