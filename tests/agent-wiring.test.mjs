import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const panel=readFileSync(new URL('../components/agent-run-panel.tsx',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../components/visual-sdd-canvas.tsx',import.meta.url),'utf8');
const workflow=readFileSync(new URL('../.github/workflows/sdd-agent.yml',import.meta.url),'utf8');
const adapter=readFileSync(new URL('../scripts/sdd_runner_adapter.py',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
test('Implement stage uses a real handoff panel, not a fake success node',()=>{
 assert.match(canvas,/selected==='implement'&&<AgentRunPanel/);
 assert.match(canvas,/tasksApproved\(plan\)/);
});
test('public GitHub dispatch requires an affirmative checkbox',()=>{
 assert.match(panel,/checked=\{consent\}/);
 assert.match(panel,/disabled=\{!consent\}/);
 assert.match(panel,/public GitHub issue/);
});
test('manifest preparation does not automatically submit to GitHub',()=>{
 assert.match(panel,/manifestIssueUrl\(manifest\)/);
 assert.match(panel,/GitHub issue form opened/);
 assert.ok(!panel.includes("fetch('https://api.github.com"));
});
test('workflow restricts issue actor and enforces API-key gate',()=>{
 assert.match(workflow,/github\.event\.issue\.user\.login == 'alikhalessi'/);
 assert.match(workflow,/scripts\/sdd_runner_adapter\.py --event/);
 assert.match(workflow,/CODEX_KEY/);
 assert.match(workflow,/OPENAI_API_KEY/);
});
test('workflow rejects changes outside an isolated prototype scope',()=>{
 assert.match(workflow,/change outside isolated prototype scope/);
 assert.match(workflow,/agent-preview/);
});
test('adapter never evals issue contents as a shell script',()=>{
 assert.match(adapter,/Only the owner can dispatch a run/);
 assert.match(adapter,/validate\(json\.loads\(contents\)\)/);
 assert.match(adapter,/spec\.md/);
 assert.ok(!adapter.includes('shell=True'));
});
test('agent stylesheet is loaded',()=>assert.match(layout,/agent\.css/));
