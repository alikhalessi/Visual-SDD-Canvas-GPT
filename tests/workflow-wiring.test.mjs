import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../components/visual-sdd-canvas.tsx',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/live-canvas.css',import.meta.url),'utf8');
test('real canvas component is accessible from SDD Canvas tab',()=>{
 assert.match(page,/tab==='canvas'&&<VisualSDDCanvas/);
 assert.match(page,/onSpecification=\{openSpec\}/);
});
test('workflow graph has accessible selectable nodes and state-driven labels',()=>{
 assert.match(canvas,/workflowGraph\(spec,plan,idea\)/);
 assert.match(canvas,/aria-pressed=\{selected===n.id\}/);
 assert.match(canvas,/state-\$\{n.state\}/);
});
test('real traceability graph comes from criterion links',()=>{
 assert.match(canvas,/traceabilityGraph\(spec,plan\)/);
 assert.match(canvas,/requirementCoverage\(spec,plan\)/);
 assert.match(canvas,/t.criterionIds.map/);
});
test('plan approval gate is not an execution claim',()=>{
 assert.match(canvas,/approveTechnical\(spec,plan\)/);
 assert.match(canvas,/approveTaskBreakdown\(spec,plan\)/);
 assert.match(canvas,/Code execution remains disabled until Sprint 03/);
});
test('planning state is restored locally and exporting is explicit',()=>{
 assert.match(canvas,/localStorage\.getItem\(key\)/);
 assert.match(canvas,/localStorage\.setItem\(key,JSON.stringify\(plan\)\)/);
 assert.match(canvas,/planningMarkdown\(spec,plan\)/);
});
test('cloud sync for planning is explicitly not yet connected',()=>{
 assert.match(canvas,/not yet synchronized to My Projects/);
});
test('canvas stylesheet loads with keyboard and responsive support',()=>{
 assert.match(layout,/live-canvas\.css/);
 assert.match(css,/canvas-node\.is-selected/);
 assert.match(css,/@media\(max-width:760px\)/);
});
