# Sprint 09 — Owner review guide

## What is ready for review

The importer proposes requirements from a written brief, keeps source quotations and asks for explicit confirmation. Existing requirements, including empty placeholders, are retained. The change summary now explains both populated and empty rows, making the final requirement count predictable.

A selected potential scheduled/background path becomes an **open edge-review flag** linked to its requirement. It does not establish a background workflow, prove implemented behavior, or grant approval. A separately selected user-facing link is an unapproved interactive workflow. Open flags block stakeholder sign-off.

The exported import history links each new requirement to its original source span. New selected-path entries also identify the created edge and label their import disposition `open-edge-flag`. Older exports remain supported. An event's disposition is historical: subsequent human resolution does not rewrite that import receipt.

## Evidence already available

The owner's two-rule import and source export are credited. Automated checks now cover scheduled-path commit/reload/export, rejected orphan paths, cancellation, stale review previews, three storage-write failures, basic keyboard selection and mobile viewport behavior. See [test evidence](SPRINT_09_TEST_EVIDENCE.md), [acceptance matrix](SPRINT_09_ACCEPTANCE.md) and the exact-head CI/preview record in [PR #6](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/6).

The owner's existing requirements do not need to be entered again. Test data lives in isolated browser contexts, not the owner's session. No manual technical commands are required for this review package.

## Human decision still pending

The owner must decide whether the revised counts and the visible meaning of a selected open path are understandable and acceptable for the product. Real phone/screen-reader behavior, live Google sign-in, signed-in project switching and cross-device cloud round trips are separate unverified acceptance areas. Automated Chromium mobile emulation is not evidence for every browser or assistive technology.

## Persistence and limits

Source, stakeholder review and import receipts have separate local keys. The importer attempts rollback of all three after a storage-write failure. Single recoverable failures were tested; browser crash-atomic storage and permanent device failures are not guaranteed. Review notes and provenance are browser-local and exportable, not automatically cloud-synced, cryptographically authenticated or tamper-evident. Existing explicit cloud-save behavior is unchanged.

Text heuristics can miss or invent potential paths. No live prototype crawl, image/code parser, automatic acceptance criteria, LLM execution or coding-agent implementation is claimed. Newly imported source acceptance criteria deliberately remain blank until specified by a human. Merge, production publication and Sprint 10 require separate owner authorization.

## Cloud-link clarification

The first explicit cloud save now copies the current browser review and import history into the new project's local keys; the original browser-draft copies remain available. Reopening an existing project keeps that project's own records. A source-bound local project link survives reload, including its conflict token. This preserves local identity; it does not synchronize review notes, provenance, plans or tasks across devices. The source Specification alone is saved to the cloud through the existing explicit action. The server still verifies the account and project owner on every request.
