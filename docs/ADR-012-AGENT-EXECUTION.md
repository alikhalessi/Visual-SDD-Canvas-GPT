# ADR-012 — Owner-gated GitHub Actions/Codex execution adapter
Date: 2026-11-05
Status: adopted for Sprint 03 pilot

## Decision
Use GitHub issue dispatch as the first low-cost, user-controlled integration into GitHub Actions. This is a two-system handoff: the browser creates a structured manifest, the user copies the payload and **manually** submits a GitHub issue, then an Actions workflow enforces repository-owner identity and strict payload validation.

The workflow has two modes. **validate_only** produces reviewed, Spec Kit-compatible artifacts without invoking AI. **codex** requires an explicitly configured OPENAI_API_KEY repository secret; it is blocked until the prerequisite exists. On a valid Codex run, the task is scoped to the agent-preview directory and a human-reviewed pull request. No automatic merge, deployment or acceptance testing is performed.

## Reasons
- No server-side GitHub installation token or configured Codex API key exists today.
- The target repository is public; requiring an explicit disclosure checkbox prevents surprise exposure of local ideas in an issue URL.
- Automated running of arbitrary shell commands from user-supplied issue text is prohibited. JSON is parsed as data, validated and converted only into Markdown.
- The choice preserves source traceability without pretending that a model action succeeded or billing the user unexpectedly.
- The adapter uses the same Requirement, Criterion and Task IDs from the Visual SDD data model.

## Design risks
- Public GitHub issues are inappropriate for confidential specifications. A future GitHub App / private repository connector should replace this pilot for general customers.
- GitHub username ownership checks and manifest approval metadata are not cryptographic proofs of the approval history. Future integrations must use a signed server-side run record.
- Codex Actions is an external dependency. Pin version and review workflow updates before introducing secrets. Credential configuration must occur inside GitHub, not in chat.
- Action PR creation may require repository setting changes. Failure must be visible and not misreported as a successful coding run.
- Browser-local planning is not cross-device durable. Add authenticated cloud persistence before inviting external users.
