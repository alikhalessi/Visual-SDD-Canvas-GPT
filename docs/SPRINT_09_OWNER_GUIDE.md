# Sprint 09 — Owner Guide (Preview / Draft)

## Purpose

Convert a written prototype or feature brief into **unapproved, reviewable candidates** that retain original source quotations. The importer runs fully offline in the browser; it does not inspect a live application or generate working code.

## Use

1. Open the **Business Review Mode** and expand **Import a prototype or feature brief**.
2. Paste 12–8000 characters. Describe behaviors with verbs such as "must", "should", "can", and concrete timing/state constraints.
3. Select **Preview candidates**. Review each candidate's original quotation and offset; revise its title, rule statement and priority. Nothing starts selected.
4. Explicitly check each rule you intend to import. If it really is a known user-visible workflow, optionally check the corresponding workflow link.
5. Review **potentially missed paths** separately. An accepted suggestion becomes an **open review flag**, *not* a confirmed background job. If its rule was not selected, the import is blocked.
6. Review the blind-spots section. Select **Review changes & commit draft**, then confirm the count. A failed validation leaves the existing source and review unchanged.
7. Open **Engineering Cockpit → Specification** to add real Given–When–Then acceptance criteria and complete missing goal/audience fields. Review all flags, examples and rationale in Business Review. Neither source nor stakeholder review becomes approved automatically.

## Privacy and persistence

The written brief stays in the browser while editing. The resulting Specification and stakeholder-review sidecar are stored in separate browser keys, and the review sidecar is **not** cloud-synced. Export backups before changing computers or clearing browser storage. To save the source Specification to the cloud, use the existing explicit **My Projects** action.

## Known limits

No screenshot-to-code or URL import, no optical recognition, no automatic background-job assertion, no authenticated/cryptographic stakeholder sign-off, no automatic acceptance criteria, no LLM invocation, no working coding-agent execution. Do not confuse a suggestion or an export with verified behavior.

## Release checks

Run the full Node/Python/typecheck/build/CI matrix and manually verify a real browser on desktop/mobile, keyboard navigation, duplicate behavior, review-storage recovery, revision invalidation and separate project preservation. **Owner approval and deployment are pending until recorded.**
