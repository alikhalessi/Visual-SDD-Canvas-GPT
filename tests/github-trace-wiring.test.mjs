import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const canvas=readFileSync(new URL('../components/visual-sdd-canvas.tsx',import.meta.url),'utf8');
const ui=readFileSync(new URL('../components/github-trace-panel.tsx',import.meta.url),'utf8');
const model=readFileSync(new URL('../lib/github-trace-core.ts',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../app/github-trace.css',import.meta.url),'utf8');
test('fourth interactive graph mode is routed from Canvas to GitHub traceability',()=>{
 assert.match(canvas,/\|'github'/);
 assert.match(canvas,/>GitHub traceability<\/button>/);
 assert.match(canvas,/graph==='github'\?<GithubTracePanel/);
});
test('GitHub API is read-only and public, never sends private task text',()=>{
 assert.match(ui,/https:\/\/api\.github\.com\/repos\//);
 assert.match(ui,/fetch\(API\+path/);
 assert.ok(!ui.includes("method:'POST'"));
 assert.match(ui,/Specification text and Task descriptions are not uploaded/);
});
test('linking demands an approved task and explicit human choice',()=>{
 assert.match(model,/tasksApproved\(plan\)/);
 assert.match(ui,/Link verified PR head to Task/);
 assert.match(ui,/window\.confirm\('Link '/);
 assert.match(ui,/does not establish acceptance criteria/);
});
test('force push is a visible mismatch not a silent update',()=>{
 assert.match(model,/link\.headSha===evidence\.pull\.headSha/);
 assert.match(ui,/The PR head SHA changed/);
});
test('local association storage includes per-project namespace and export',()=>{
 assert.match(ui,/localPlanningKey\(spec,projectId\)/);
 assert.match(ui,/readPullLinks\(JSON\.parse\(saved\)\)/);
 assert.match(ui,/localStorage\.setItem\(key,JSON\.stringify\(links\)\)/);
 assert.match(ui,/traceMarkdown\(links,spec,plan\)/);
});
test('PR facts include file paths and independently checked check runs',()=>{
 assert.match(ui,/parsePullFiles/);
 assert.match(ui,/parseCheckRuns/);
 assert.match(ui,/GitHub check runs/);
 assert.match(ui,/No complete passing check evidence/);
});
test('UI distinguishes revision-aligned task mapping from refreshed PR head and CI',()=>{
 assert.match(ui,/Revision aligned/);
 assert.match(ui,/Head not refreshed this session/);
 assert.match(ui,/checksVerified/);
});
test('responsive GitHub stylesheet is included and keyboard focus is visible',()=>{
 assert.match(layout,/github-trace\.css/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/:focus-visible/);
});
