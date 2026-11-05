import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCloudPayload,inferCloudEvent,isSameOrigin} from '../lib/cloud-core.ts';
import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../lib/spec-core.ts';

const idea='A clinic appointment booking platform for patients and staff';
function specFor(){
 let s=createSpecification(idea,'2026-11-05T10:00:00Z');
 s=revise(s,{title:'Patient Booking',goal:'Patients can schedule appointments online without calling.',audience:'Patients and practice staff'},'2026-11-05T10:00:00Z');
 s=updateRequirement(s,'REQ-001',{title:'Book an appointment',statement:'Patients can choose a free appointment and receive confirmation.'},'2026-11-05T10:00:00Z');
 return updateCriterion(s,'REQ-001','AC-001','Given an open slot, when booking is confirmed, then it is reserved.','2026-11-05T10:00:00Z');
}
test('idea-only project payload is accepted',()=>{
 const x=parseCloudPayload({idea,title:'Patient Booking',specification:null});
 assert.equal(x.id,null);assert.equal(x.idea,idea);assert.equal(x.specification,null);
});
test('valid specification is linked to original idea',()=>{
 const x=parseCloudPayload({idea,title:'Patient Booking',specification:specFor()});
 assert.equal(x.specification?.id,'SPEC-001');
});
test('tampered or unrelated specification is rejected',()=>{
 const spec=specFor();spec.sourceIdea='Entirely different source idea';
 assert.throws(()=>parseCloudPayload({idea,title:'Patient Booking',specification:spec}),/source idea/);
});
test('invalid cloud id and missing concurrency token rejected',()=>{
 assert.throws(()=>parseCloudPayload({id:'../../etc',idea,title:'Patient Booking',specification:null}),/identifier/);
 assert.throws(()=>parseCloudPayload({id:'11111111-1111-4111-8111-111111111111',idea,title:'Patient Booking',specification:null}),/revision token/);
});
test('approved document can be persisted with unchanged revision',()=>{
 const spec=approveSpecification(specFor(),'2026-11-05T12:00:00Z');
 const x=parseCloudPayload({idea,title:'Patient Booking',specification:spec});
 assert.equal(x.specification?.approval.status,'approved');
});
test('cloud event types reflect real approval state transitions',()=>{
 assert.equal(inferCloudEvent(null,{hasSpec:false,approved:false}),'project_created');
 assert.equal(inferCloudEvent({hasSpec:true,approved:false},{hasSpec:true,approved:true}),'specification_approved');
 assert.equal(inferCloudEvent({hasSpec:true,approved:true},{hasSpec:true,approved:false}),'specification_reopened');
 assert.equal(inferCloudEvent({hasSpec:true,approved:false},{hasSpec:true,approved:false}),'specification_saved');
});
test('same-origin change requests reject external domains',()=>{
 assert.equal(isSameOrigin('https://visual-sdd-platform.vercel.app','https://visual-sdd-platform.vercel.app/api/workspace'),true);
 assert.equal(isSameOrigin('https://attacker.example','https://visual-sdd-platform.vercel.app/api/workspace'),false);
 assert.equal(isSameOrigin(null,'https://visual-sdd-platform.vercel.app/api/workspace'),false);
});
test('project title and idea input size are bounded',()=>{
 assert.throws(()=>parseCloudPayload({idea:'short',title:'Patient Booking'}),/12/);
 assert.throws(()=>parseCloudPayload({idea,title:'x'.repeat(151)}),/150/);
});
