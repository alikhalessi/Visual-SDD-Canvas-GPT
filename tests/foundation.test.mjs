import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SDD_STAGES,getStage,buildIdeaDraft,normalizeIdea,progressFor} from '../lib/sdd-core.ts';
test('seven ordered unique SDD stages',()=>{assert.deepEqual(SDD_STAGES.map(s=>s.id),['idea','specify','plan','tasks','implement','verify','release']);assert.equal(new Set(SDD_STAGES.map(s=>s.id)).size,7);});
test('idea is a local draft, not AI output',()=>{const d=buildIdeaDraft('  An appointment     booking website  ');assert.equal(d.status,'draft');assert.equal(d.description,'An appointment booking website');});
test('short idea rejected',()=>assert.throws(()=>buildIdeaDraft('short'),/12 characters/));
test('stage lookup preserves artifacts',()=>assert.equal(getStage('verify').artifact,'Test evidence'));
test('progress reaches 100 on release',()=>{assert.equal(progressFor('release'),100);assert.ok(progressFor('specify')<100);});
test('idea truncated at 600 characters',()=>assert.equal(normalizeIdea('a'.repeat(900)).length,600));
