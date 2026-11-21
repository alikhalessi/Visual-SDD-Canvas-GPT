# Sprint 09 — Integrated Engineering Test Evidence (Preview)

**Date:** 2026-11-21 · **Repository:** alikhalessi/Visual-SDD-Canvas-GPT

## Implemented source

- \`lib/vibe-ingestor-core.ts\`: bounded offline extraction, original text spans, explicit-vs-speculative evidence, potential hidden-path candidates, read/commit validators, backwards-compatible source/review adapters.
- \`components/vibe-import-panel.tsx\`, \`app/vibe-import.css\`: accessible preview, explicit acceptance/rejection, editable text, change summary, human confirmation.
- \`components/business-review-canvas.tsx\`, \`app/page.tsx\`, \`app/layout.tsx\`: on-device import wiring, protection of malformed existing source cache, compensating storage rollback and preservation of source/review separation.
- \`tests/vibe-ingestor.test.mjs\` and \`tests/vibe-ingestor-wiring.test.mjs\`: parser, provenance, no automatic approval, invalid/oversize/unsafe text, duplicate identifiers, candidate edits, old requirement history, project link and UI wiring regressions.

## Independently observed automation

| Evidence | Result | Scope |
| --- | --- | --- |
| GitHub Actions **Visual SDD CI #199** | **SUCCESS** | Full checkout with Sprints 00–09; npm installation, Python adapter self-test, Python unit tests, Node tests, TypeScript check, production build |
| Vercel preview for commit \`bfe378e50df3f7acc1dc78d19da7fc79534b0576\` | **READY** | Non-production build; deployment \`dpl_5o1KGhKmk8ecg8BBrSJN8dgoVMea\` |
| Preview branch URL | \`https://visual-sdd-platform-git-sprint-09-vibe-to-spec-aleksi9.vercel.app/\` | Exact preview origin added to Neon Auth trusted origins; real OAuth on preview **not yet manually tested** |

The Vercel preview status and GitHub test result were rechecked. The exact preview branch alias was registered as a trusted redirect origin in Neon Auth. **No** actual Sprint 09 browser OAuth interaction, keyboard-only mobile acceptance, failure-injected storage rollback, cloud-project switch or Product Owner approval is claimed by these checks.

## Known limitations and follow-up verification

Text-only descriptions are parsed; no live prototype, screenshots, code, APIs or third-party systems are inspected. Potential background and role-boundary paths are open questions and remain unapproved. Newly created acceptance criteria are intentionally blank until reviewed. A separate, append-only browser-local provenance history and manual JSON export have now been implemented, retaining source spans, original quotations and imported revision links. It is not tamper-proof or cloud-synced; it is **not yet manually verified** in a real browser. A research-grade authenticated/tamper-evident archive is outside this sprint.

Deployment readiness and CI success alone do not establish user comprehension, accessibility, real OAuth, semantic equivalence to a prototype, or acceptance for Sprint 10.

## Latest CI and preview confirmation

On source commit `8caddfef2bc3b77f122d331dbdcde231cd5b8ba1`, GitHub Actions run **#206** completed **SUCCESS**, including **208/208 Node tests** and **9/9 Python tests**. Vercel deployment `dpl_6LA6HgcCt3yx1dtL1DYzSMZeagN4` reached **READY**; its branch alias is `https://visual-sdd-platform-git-sprint-09-vibe-to-spec-aleksi9.vercel.app/`. The production domain still targets Sprint 08.
