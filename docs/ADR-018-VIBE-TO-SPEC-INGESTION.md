# ADR-018 — Vibe-to-Spec ingestion with bounded proposals and human-confirmed commit

**Status:** Implemented on the Sprint 09 feature branch; automated verification and earlier owner source-provenance evidence recorded. Final product acceptance/release decision remains pending in PR #6.

## Context

Sprint 08 stores v1 source requirements in \`Specification\` and stakeholder workflows, edge flags, examples and review decisions in a separate project-scoped, browser-local \`StakeholderReviewDocument\`. Prototype descriptions and exploratory "vibe" builds often omit background actions and state boundaries. Turning descriptions into approved requirements automatically would create false evidence and bypass human oversight.

## Decision

1. **Offline deterministic extraction first.** \`lib/vibe-ingestor-core.ts\` accepts a bounded (12–8000 character) written prototype/feature brief. It extracts behavioral sentences with source offsets and quotations. It provides proposals with explicit or review-required confidence markers. It never crawls a URL, accesses an LLM, or treats text inside a brief as an instruction to the system.
2. **Speculation remains explicit.** Access revocation, stale permissions, guest/member roles, queued reports, notifications, scheduled jobs and UI actions generate *potential* path cards with reason and source evidence. Selecting a potential path records an *open edge-review flag*, not an established system workflow or reviewed acceptance test.
3. **Human selection, edit and confirmation.** Every rule/path starts unchecked. A user can correct a rule's title, observable statement and priority, independently select it, and optionally link a user-facing workflow. Before committing, the UI displays the change count and requires an explicit confirmation. Imported requirements have blank source acceptance criteria and remain drafts until completed in the Specification Editor.
4. **Backward-compatible source updates.** The pure adapter adds \`REQ-###\` candidates using a single \`spec-core.revise\` operation, preserving existing requirements and old schema. Existing source and stakeholder approval are invalidated on a source revision change. No migrations, \`workflow-core\` changes, or agent-runner authority changes are made.
5. **Review metadata is a separate linked document.** The adapter produces an updated, validated sidecar with open candidate flags and only explicitly selected interactive links. It reuses the existing project-keyed browser-local storage and fail-closed validation. Neither record is claimed to be automatically cloud synchronized.
6. **Preflight and rollback.** The core prepares a complete validated source/review pair without mutating previous records. The UI writes both browser keys before updating React; it attempts restoration of both keys if either write fails and stops on invalid review caches. A storage failure is never reported as success.
7. **Bounded untrusted input.** Unsafe control characters and narrow instruction/spoofing or executable-markup patterns are rejected. Content is rendered as escaped React text; source quotes are not directly executed or used as a privileged prompt. This is defensive parsing, not a guarantee against all possible hostile language.
8. **Optional LLM adapter deferred.** The core schema is available for a future untrusted JSON adapter, but no model service, key, pricing or factual behavior inference is included in this release. Any future adapter must be separately reviewed and pass the same candidate/provenance validation.

## Rejected alternatives

- Direct writing of generated source requirements without preview: fails human-governance requirements.
- Importing guessed background jobs as factual \`BusinessWorkflow\` records: risks false coverage.
- Rewriting \`Specification\` schema v1 or silently persisting to Neon: breaks old data compatibility.
- Requiring a network model to parse every brief: increases cost and makes offline reproducibility impossible.
- Treating any imported proposal as source approval or permission for an agent run: violates downstream governance.

## Risks, limits and acceptance obligations

This is text-description ingestion, **not visual code/image inspection, website crawling, screenshot OCR, source-code reverse engineering or proof of actual behavior**. Sentence heuristics can miss behavior or suggest false positives. Duplicate detection is normalized text, not semantic equivalence. Placeholder criteria mean source approval needs human work. The browser-local commit of two keys is best-effort compensating rollback, not a database transaction; the public cloud workspace remains unchanged until separately saved.

Test the acceptance matrix and real mobile/keyboard behavior before approval; document every outstanding manual check rather than asserting the algorithm is exhaustive. Sprint 10 agent handoff stays blocked until Sprint 09 owner approval.

## Provenance retention refinement

A third project-scoped, browser-local document (`vibe-import-history-v1`) stores append-only import receipts with the original brief, original source spans and quotes, source/target requirement IDs, edited statements, explicitly selected potential paths, specification revision and recording timestamp. Receipt history is independently bounded and validated; malformed history prevents import rather than being overwritten. The Business Review mode offers an explicit JSON export. This record is **not** a cryptographic audit trail, is **not** cloud-synchronized, and may be lost if browser storage is cleared before export. The import handler attempts to roll back source, stakeholder and provenance keys together on storage-write failure; browser storage cannot promise crash-atomic durability.

## Selected-path review refinement (2026-11-21)

New path receipts add optional `edgeId` and `disposition: open-edge-flag` fields, retaining legacy v1 read compatibility. They identify the open flag created at import, never a verified workflow. The reader rejects null entries and duplicate proposal mappings. Change summaries include all retained source rows and list empty placeholder IDs. A pending preview is invalidated by any source/review content change, and project identity changes discard the old preview. Desktop/mobile browser tests cover scheduled-path persistence and export, orphan rejection, cancellation, stale review, and recoverable failure of each of the three storage writes. Human acceptance and production release remain separate decisions.

## Browser-to-cloud identity refinement

A versioned browser-only cloud-link hint binds project ID and conflict token to the current source identity, restoring the same local review namespace on reload. On the first explicit cloud creation only, guest review/provenance bytes are copied into unoccupied project keys before activating that identity; guest originals are retained and a failed copy attempts destination rollback. Existing-project opens never migrate guest records. Authentication and server-side ownership checks remain authoritative; this hint carries no credential and does not claim automatic cloud synchronization.
