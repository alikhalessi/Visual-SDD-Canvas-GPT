# Sprint 08 — Owner Guide

## What changed

Visual SDD now starts in **Business Review Mode**. Each card comes from the original versioned Specification requirement. It shows the business rule, any workflows you explicitly link, uncovered timing/state paths, concrete Given–When–Then examples, and the current review state.

Use the top-level **Engineering Cockpit** switch to return to the existing Specification Editor, SDD Canvas, Technical Plan, Tasks, Change Impact, GitHub Traceability, Agent Runner and evidence panels. Engineering Cockpit also shows a read-only stakeholder review status summary sourced from the same local review notes. The older **Simple/Professional** toggle is still an engineering display-density preference, not the Business/Engineering mode selector.

## First-time review

1. If no source specification exists, select **Start a specification**. This opens the existing editor; fill and save the source requirements, then return to Business Review mode.
2. Select a business rule card. Review its plain-language wording; select **Save rule wording** only if you intend to revise the original Specification (which invalidates old source approval and dependent gates).
3. Link every **Affected workflow** you know about and classify as **Interactive / UI** or **Background / Scheduled / Queued**. The software deliberately invents none.
4. Flag uncovered edge/timing paths, especially delayed actions, access revocation, stale sessions, queued jobs and role boundaries.
5. Attach a Given–When–Then example to each mapped workflow; review coverage status. **Example Attached** is not approval.
6. Record why the behavior was reviewed and what remains uncertain; resolve a flag only after linking a relevant behavioral example and writing a case-specific explanation. Removing that example reopens the flag.
7. If all documented review gates pass, explicitly select **Approve reviewed behaviour** and confirm. The decision is bound to the source Specification and review-rule revisions, and never implies tests were run or source Specification approved.

## Storage and recovery

- Specification and its approval continue under the prior storage rules. Stakeholder review metadata is a **separate browser-local, revision-linked document**, not automatically synced to Google/Neon cloud workspace.
- Select **Export review JSON** to retain a human-readable backup. If storage is blocked, export before leaving.
- If a previous review cache cannot be parsed, it is left untouched. Select **Download original**, then clear only with explicit confirmation if you deliberately choose to start a clean review.
- Switching to a different cloud project switches the review's browser key. When the Specification changes revision, existing review comments remain available but prior stakeholder sign-offs are reset.

## How to accept Sprint 08

Follow `docs/SPRINT_08_ACCEPTANCE.md` step by step, including one queued/background route, one incomplete example, an open flag, revision invalidation, a reload and a mobile/keyboard check. Do not claim that an approved stakeholder review proves complete behavioral coverage or verified code.

## Limitations

No ingestion from Vibe prototypes (Sprint 09), deterministic agent-spec bundle or full information-parity verifier (Sprint 10), counterbalanced research sandbox (Sprint 11), cloud synchronization for review metadata, cryptographic sign-offs, verified agent implementation, or thesis study findings are included in Sprint 08.
