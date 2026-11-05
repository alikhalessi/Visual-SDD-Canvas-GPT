import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../components/run-evidence.tsx',import.meta.url),'utf8');
const panel=readFileSync(new URL('../components/agent-run-panel.tsx',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
test('GitHub evidence panel is included in Implement without starting an agent',()=>{
 assert.match(panel,/<RunEvidence\/>/);
 assert.match(ui,/Verify evidence/);
 assert.match(ui,/read-only verification/);
});
test('evidence requests use only the public API and no API key',()=>{
 assert.match(ui,/https:\/\/api\.github\.com\/repos\/alikhalessi/);
 assert.match(ui,/extractBotRunId/); // bot identity verified through pure helper
 assert.ok(!ui.includes('OPENAI_API_KEY'));
 assert.ok(!ui.includes('Authorization: Bearer'));
});
test('rate limits and validation failures are not presented as success',()=>{
 assert.match(ui,/rate limit or access restriction/);
 assert.match(ui,/did not meet verification requirements/);
});
test('evidence stylesheet is wired',()=>assert.match(layout,/evidence\.css/));
