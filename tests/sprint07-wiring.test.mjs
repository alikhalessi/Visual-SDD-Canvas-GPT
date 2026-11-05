import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const brief=readFileSync(new URL('../components/workspace-brief.tsx',import.meta.url),'utf8');
const quality=readFileSync(new URL('../lib/quality-core.ts',import.meta.url),'utf8');
const spec=readFileSync(new URL('../components/spec-editor.tsx',import.meta.url),'utf8');
const guide=readFileSync(new URL('../components/ux-guide.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/sprint07.css',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
test('project command center replaces generic marketing card with state-driven actions',()=>{
 assert.match(page,/<WorkspaceBrief spec=\{spec\}/);
 assert.match(brief,/projectReadiness\(spec,ideaCaptured\)/);
 assert.match(brief,/onCanvas/);
});
test('simple mode reduces redundant overview process graph while professional mode shows it',()=>{
 assert.match(page,/tab==='overview'&&displayDetailedOverview\(\)&&<section className="panel workflow"/);
 assert.match(brief,/aria-pressed=\{mode==='simple'\}/);
 assert.match(brief,/aria-pressed=\{mode==='professional'\}/);
});
test('unreadable local documents are preserved until explicit recovery action',()=>{
 assert.match(page,/inspectCachedSpecification\(localStorage\.getItem\('visual-sdd-specification-v1'\)\)/);
 assert.match(page,/if\(!hydrated\|\|unreadableSpec!==null\)return/);
 assert.match(page,/unreadableSpec!==null&&<section className="recovery-banner"/);
});
test('recovery offers user-owned backup and conscious cache-clear gate',()=>{
 assert.match(page,/visual-sdd-unreadable-specification-recovery\.txt/);
 assert.match(page,/window\.confirm\('Delete only the unreadable browser Specification/);
 assert.match(page,/localStorage\.removeItem\('visual-sdd-specification-v1'\)/);
});
test('invalid cloud Specification cannot replace valid current local work',()=>{
 assert.match(page,/project\.specification&&!incoming/);
 assert.match(page,/Your current work was not replaced/);
});
test('field-level validation and accessible invalid markers are present',()=>{
 assert.match(spec,/aria-invalid=\{hasIssue\('goal'\)\}/);
 assert.match(spec,/spec-field-error/);
 assert.match(spec,/aria-invalid=\{hasIssue\(req\.id\+'\.'\+c\.id\)\}/);
});
test('approved Specification has a genuine handoff action to Plan',()=>{
 assert.match(spec,/Continue to technical planning/);
 assert.match(spec,/onClick=\{onCanvas\}/);
 assert.match(spec,/mode==='professional'/);
});
test('guided journey no longer claims that implemented planning is unavailable',()=>{
 assert.match(guide,/Technical planning and GitHub evidence continue/);
 assert.match(guide,/Continue to planning/);
});
test('typography and mobile controls are readable and focus is visible',()=>{
 assert.match(css,/--s07-focus:/);
 assert.match(css,/button:focus-visible/);
 assert.match(css,/font-size:16px/);
 assert.match(css,/min-height:44px/);
});
test('quality stylesheet is layered after existing domain styles',()=>{
 assert.match(layout,/import '\.\/github-trace\.css';\s*import '\.\/sprint07\.css';/);
});
test('roadmap completion is not fabricated from progress indicators',()=>{
 assert.match(brief,/first 3 review steps complete/);
 assert.match(quality,/Nothing executes automatically/);
});
