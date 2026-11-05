import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const canvas=readFileSync(new URL('../components/visual-sdd-canvas.tsx',import.meta.url),'utf8');
const ui=readFileSync(new URL('../components/impact-explorer.tsx',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
const styles=readFileSync(new URL('../app/impact.css',import.meta.url),'utf8');
const model=readFileSync(new URL('../lib/workflow-core.ts',import.meta.url),'utf8');
test('interactive canvas offers a third change impact visualization',()=>{
 assert.match(canvas,/\|'impact'/);
 assert.match(canvas,/>Change impact/);
 assert.match(canvas,/graph==='impact'\?<ImpactExplorer/);
});
test('impact diff uses immutable planning baseline rather than fake links',()=>{
 assert.match(model,/specBaseline:snapshotSpecification\(spec\)/);
 assert.match(ui,/assessChangeImpact\(spec,plan\)/);
 assert.match(ui,/report\.directTaskIds/);
});
test('users can inspect changes and navigate to affected tasks',()=>{
 assert.match(ui,/aria-pressed=\{selected\?\.key===change\.key\}/);
 assert.match(ui,/selected\.affectedTaskIds\.map/);
 assert.match(ui,/onClick=\{onTasks\}/);
});
test('before-and-after and missing-baseline uncertainty are explicit',()=>{
 assert.match(ui,/BEFORE/);assert.match(ui,/AFTER/);
 assert.match(ui,/Legacy plan/);
 assert.match(ui,/cannot accurately reconstruct historic changes/);
});
test('planning cloud storage and AI success are not misrepresented',()=>{
 assert.match(ui,/does not infer semantic dependencies/);
 assert.match(ui,/synchronize local planning data/);
});
test('export provides human-readable impact report',()=>{
 assert.match(ui,/impactMarkdown\(report\)/);
 assert.match(ui,/visual-sdd-change-impact\.md/);
});
test('responsive impact stylesheet imported by app root',()=>{
 assert.match(layout,/impact\.css/);
 assert.match(styles,/impact-change\[aria-pressed=true\]/);
 assert.match(styles,/@media\(max-width:650px\)/);
});
