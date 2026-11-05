import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../lib/spec-core.ts';
import {inspectCachedSpecification,saveStatusLabel,projectReadiness} from '../lib/quality-core.ts';
const IDEA='Create a booking platform that manages group studio appointments';
const NOW='2026-11-05T18:00:00.000Z';
function completed(){
 let spec=createSpecification(IDEA,NOW);
 spec=revise(spec,{title:'Studio appointment booking',goal:'Customers can reserve appointment times without a phone call.',audience:'Clients and studio staff'},NOW);
 spec=updateRequirement(spec,'REQ-001',{title:'Reserve a free appointment',statement:'Customers can reserve an open time and receive a confirmation.'},NOW);
 return updateCriterion(spec,'REQ-001','AC-001','Given a free appointment time, when selected, it is confirmed.',NOW);
}
test('empty local document does not create a fake Specification',()=>{
 assert.deepEqual(inspectCachedSpecification(null),{status:'empty',spec:null,raw:null});
});
test('valid draft cache restores without modifying its revision or approvals',()=>{
 const src=JSON.stringify(completed()),result=inspectCachedSpecification(src);
 assert.equal(result.status,'valid');if(result.status==='valid'){assert.equal(result.spec.approval.status,'draft');assert.equal(result.spec.revision,4);}
});
test('approved cache is only restored with a valid matching revision',()=>{
 const approved=approveSpecification(completed(),NOW);
 const result=inspectCachedSpecification(JSON.stringify(approved));
 assert.equal(result.status,'valid');if(result.status==='valid')assert.equal(result.spec.approval.approvedRevision,approved.revision);
});
test('malformed JSON is retained exactly for explicit user recovery',()=>{
 const raw='{"schemaVersion":1,"title":"unfinished"';
 const result=inspectCachedSpecification(raw);
 assert.equal(result.status,'unreadable');assert.equal(result.raw,raw);assert.equal(result.spec,null);
});
test('valid JSON with an unsafe or partial schema is not silently accepted',()=>{
 const raw=JSON.stringify({schemaVersion:1,title:'false success'});
 const result=inspectCachedSpecification(raw);
 assert.equal(result.status,'unreadable');assert.equal(result.raw,raw);
});
test('oversize cache remains preserved but cannot be parsed as active work',()=>{
 const raw='x'.repeat(250001),result=inspectCachedSpecification(raw);
 assert.equal(result.status,'unreadable');assert.equal(result.raw.length,250001);
});
test('tampered approval revision is flagged for recovery, not counted approved',()=>{
 const doc=approveSpecification(completed(),NOW);
 doc.approval.approvedRevision=0;
 assert.equal(inspectCachedSpecification(JSON.stringify(doc)).status,'unreadable');
});
test('new project begins at idea, not technical execution',()=>{
 const state=projectReadiness(null,false);
 assert.deepEqual([state.state,state.completed],['idea',0]);
});
test('captured idea leads to Specification editor',()=>{
 const state=projectReadiness(null,true);
 assert.deepEqual([state.state,state.completed],['specification',1]);
});
test('complete but unapproved Specification requires human review',()=>{
 const state=projectReadiness(completed(),true);
 assert.deepEqual([state.state,state.completed],['approval',2]);
});
test('approved Specification leads to the available governed Canvas',()=>{
 const state=projectReadiness(approveSpecification(completed(),NOW),true);
 assert.equal(state.state,'planning');
 assert.equal(state.completed,3);
 assert.match(state.description,/Nothing executes automatically/);
});
test('cloud-linked status never implies in-browser changes were synced',()=>{
 assert.match(saveStatusLabel(true,true),/save again to sync changes/);
 assert.match(saveStatusLabel(false,true),/browser only/);
});
