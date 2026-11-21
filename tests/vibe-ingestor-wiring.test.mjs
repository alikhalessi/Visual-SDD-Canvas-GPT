import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const parser=source('lib/vibe-ingestor-core.ts');
const ui=source('components/vibe-import-panel.tsx');
const review=source('components/business-review-canvas.tsx');
const page=source('app/page.tsx');
const layout=source('app/layout.tsx');
const css=source('app/vibe-import.css');

test('Business Review exposes the import panel without replacing prior workflows',()=>{
 assert.match(review,/import VibeImportPanel/);
 assert.match(review,/<VibeImportPanel spec=\{spec\}/);
 assert.match(review,/projectStakeholderRules/);
 assert.match(review,/onSpecificationChange\(updateRequirement\(spec,active.id,\{statement\}\)\)/);
});
test('candidate proposals require preview, editable human selection and confirmation',()=>{
 assert.match(ui,/parseVibeBrief\(brief\)/);
 assert.match(ui,/defaultImportChoices\(next\)/);
 assert.match(ui,/checkbox/);
 assert.match(ui,/Review changes &amp; commit draft/);
 assert.match(ui,/window.confirm/);
 assert.match(ui,/setProposal\(null\)/);
});
test('no LLM calls, public Issue upload or agent dispatch in the import core',()=>{
 assert.doesNotMatch(parser,/fetch\(|OpenAI|\.issue\(|process\.env|axios|agentRun/);
 assert.match(parser,/readSpecification\(nextSpec\)/);
 assert.match(parser,/readStakeholderReview\(nextReview\)/);
 assert.match(parser,/revise\(base/);
 assert.match(parser,/approval\.status!=='draft'/);
});
test('client saves source and review locally and rolls back if persistence fails',()=>{
 assert.match(review,/localStorage\.setItem\(nextKey,JSON.stringify\(result.review\)\)/);
 assert.match(review,/localStorage\.setItem\(sourceKey,JSON.stringify\(result.spec\)\)/);
 assert.match(review,/if\(originalReview===null\)localStorage\.removeItem\(nextKey\)/);
 assert.match(review,/onSpecificationChange\(result.spec\)/);
 assert.match(review,/if\(!canImport\)throw Error/);
 assert.match(page,/canImport=\{hydrated&&unreadableSpec===null\}/);
});
test('newly imported idea is surfaced in canonical workspace and no auto cloud save occurs',()=>{
 assert.match(page,/onImportedSourceIdea=\{\(source\)=>/);
 assert.match(page,/setDraft\(buildIdeaDraft\(source\)\)/);
 assert.doesNotMatch(ui,/\/api\/workspace/);
});
test('mobile and keyboard focus affordances exist',()=>{
 assert.match(layout,/vibe-import\.css/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(ui,/aria-labelledby="vibe-title"/);
 assert.match(ui,/role="status"/);
});
