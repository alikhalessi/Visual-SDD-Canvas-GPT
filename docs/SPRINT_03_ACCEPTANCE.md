# Sprint 03 — Controlled Spec Kit / Codex Agent Handoff

Status: implementation committed, production build & external end-to-end run subject to verification.

## What is actually implemented

- A fail-closed TypeScript adapter that accepts only an approved current Specification + Technical Plan + Task Breakdown and one explicitly linked Task.
- Stable, bounded execution manifests with provenance (artifact revision, approval timestamps, requirement and acceptance links).
- A responsive human-consent UI inside the **Implement** Canvas stage. It offers:
  - **validate_only**: generate a GitHub Actions request with no AI/model costs and no code changes.
  - **codex**: request one bounded coding task, but **only** after GitHub owner dispatch and repository secret configuration.
- Public-repository warning and an opt-in checkbox before producing a copyable issue body.
- The issue URL intentionally contains only a task ID and mode, not idea/Specification text; issue body is never submitted automatically.
- GitHub Actions workflow accepts only an owner-created issue with a strict versioned marker.
- Python stdlib adapter validates the schema, owner identity, max payload size, approvals, IDs and task/criterion relations, then emits Spec Kit-compatible spec.md / plan.md / tasks.md and a bounded agent prompt.
- Workflow uploads validated artifacts. For Codex mode it requires a repo Actions OPENAI_API_KEY secret; missing credentials block execution.
- When configured, Codex is restricted to isolated agent-preview/<issue>/ and is intended to produce a human-reviewed PR, never a merge or production deployment.

## Mandatory limitations

1. **Not an end-to-end verified Codex run.** No OPENAI_API_KEY GitHub Actions secret was confirmed, and no billable AI invocation was performed.
2. Repo is **public**. The issue body is public. Never submit sensitive or proprietary project data through this channel.
3. The ownership/approval bridge is not cryptographically attested to the Google/Neon cloud account; the workflow restricts dispatch to the GitHub repository owner and validates the manifest, but cannot independently verify each human approval event from Visual SDD's browser-local state.
4. GitHub Actions workflow availability and results must be independently verified. GitHub issue smoke tests: #1, #2; validation success cannot be claimed without a run link / artifact.
5. Plans/tasks remain browser-local and do not automatically synchronize to Neon.
6. Existing account sign-in/out was user-confirmed; cloud save/reload acceptance still pending.
7. This is **Spec Kit-compatible artifact generation**, not a claim that Spec Kit's CLI /specify, /plan, /tasks or /implement workflow commands have been executed.
8. No generated source is merged into the application; pull request access can be limited by GitHub repository Actions settings.

## Acceptance checks

| ID | Verification | Evidence |
|---|---|---|
| S03-01 | Missing or outdated approvals block handoff | TypeScript unit tests |
| S03-02 | Valid manifest binds one approved Task and its linked Criteria | TypeScript unit tests |
| S03-03 | Public GitHub disclosure requires explicit consent | UI + wiring test |
| S03-04 | Manifests and issue payload have bounded sizes and strict schema | TypeScript + Python self-test |
| S03-05 | Workflow only acts on owner-created issue | Python self-test and Action condition |
| S03-06 | Spec Kit-compatible artifacts are emitted | Python self-test / Action artifacts |
| S03-07 | Codex cannot run when API secret absent | Workflow credential gate; external run pending |
| S03-08 | Generated files are scoped to isolated preview, not main | Workflow diff guard |
| S03-09 | Code pushed, tests/typecheck/build succeed; production READY | GitHub/Vercel |
| S03-10 | Live issue-to-Actions run and (with key) pull request evidence | Pending external validation |
| S03-11 | DOCX report and owner sign-off | Delivery gate |

## Next sprint boundary

Sprint 04 should verify a real agent output end-to-end with reproducible code checks, optional secured runtime status in the visual UI and explicit human acceptance. Do not start without Product Owner approval.
