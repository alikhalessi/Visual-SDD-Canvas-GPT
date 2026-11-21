# Sprint 09 released baseline

The owner explicitly authorized merge and production publication after the release-candidate checks. PR #6 merged on 2026-11-21. This closeout corrects the previously stale roadmap status; it does not change the deployed Sprint 09 application.

- Merged PR: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/6
- Production/main commit: `528b9280c849cdb0eca716b1b415fad5c0f20061`
- Tree: `09ee1ce62a3c5b238b82318f2249ed1269da2a1e`, identical to the reviewed head tree.
- Production deployment: `dpl_DZM9Luv2MqAVVFp9KEsizhaH661W`, READY, production target, no alias error.
- Canonical URL: https://visual-sdd-platform.vercel.app/
- Main CI #211: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/44928231749
- CI results: 220 Node checks, 9 Python checks, adapter self-test, typecheck/build, 48 browser cases, all successful.
- CI evidence artifact: https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/44928231749/artifacts/14716463875
- Artifact SHA-256: `782ede45ddc64975da4edd7df2097c370b053a7fcfd84f0d155962141719bd6d`
- Post-deploy: all 28 importer checks passed against the production URL in isolated desktop/mobile Chromium, Firefox and WebKit contexts. Source retrieval through the existing owner's signed-in session matched the original backup structurally; cloud identity survived reload.
- HTTP checks: home 200; guest workspace 401/no-store; cross-origin empty POST/DELETE 403 before mutation.
- No browser console errors or matching error/fatal runtime records were found in the observed deployment-scoped window. Continuous monitoring is not claimed.

The Persian Word closeout is [the released Sprint 09 report](reports/SPRINT_09_RELEASE_REPORT_FA.docx). CI renders the versioned reports to PDF/PNG for visual inspection, since this Windows runtime has no bundled LibreOffice executable. Private account screenshots and source exports remain local; only synthetic test evidence and non-private hashes are public.

Physical-phone and screen-reader-user studies remain unclaimed. Review/provenance are origin-local and are not automatically synchronized from preview to production. Single-write compensation does not prove crash-atomic persistence.

Sprint 10 implementation was separately authorized in the continuation of this task. Its merge and production publication still require a separate owner decision.
