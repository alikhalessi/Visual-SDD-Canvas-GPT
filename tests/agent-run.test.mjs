import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../lib/spec-core.ts';
import {createPlanningDocument,reviseTechnical,approveTechnical,addLinkedTask,reviseLinkedTask,approveTaskBreakdown} from '../lib/workflow-core.ts';
import {runGate,makeRunManifest,manifestIssueBody,manifestIssueUrl,manifestMarkers} from '../lib/agent-run-core.ts';

const TIME='2026-11-05T21:00:00.000Z';
const IDEA='A scheduling product for a local community therapy studio';
function approvedArtifacts(){
 let s=createSpecification(IDEA,TIME);
 s=revise(s,{title:'Community therapy scheduling',goal:'Customers can reserve appointment times and get confirmation online.',audience:'Clients and reception staff'},TIME);
 s=updateRequirement(s,'REQ-001',{title:'Select appointment',statement:'A client can select a free appointment time and receive confirmation.'},TIME);
 s=updateCriterion(s,'REQ-001','AC-001','Given a free appointment, when submitted it is reserved.',TIME);
 s=approveSpecification(s,TIME);
 let p=createPlanningDocument(s,TIME);
 p=reviseTechnical(p,{architecture:'Next.js frontend with a server-side booking API and relational store.',risks:'Conflicting concurrent reservations require transactional handling.'},TIME);
 p=approveTechnical(s,p,TIME);
 p=addLinkedTask(s,p,TIME);
 p=reviseLinkedTask(p,'TASK-001',{title:'Implement an appointment picker interface',criterionIds:['AC-001']},TIME);
 p=approveTaskBreakdown(s,p,TIME);
 return {s,p};
}
test('no spec or plan cannot trigger an agent run',()=>assert.ok(runGate(null,null).length>=3));
test('a complete approved chain opens the handoff gate',()=>{const {s,p}=approvedArtifacts();assert.deepEqual(runGate(s,p),[])});
test('an unapproved spec blocks even an earlier approved planning chain',()=>{
 const {s,p}=approvedArtifacts();const changed=revise(s,{goal:'Customers can book and change appointments online securely.'},TIME);
 assert.ok(runGate(changed,p).length>0);
});
test('a task edit reopens task approval and blocks execution',()=>{
 const {s,p}=approvedArtifacts();
 const newer=reviseLinkedTask(p,'TASK-001',{title:'Build appointment pickers for recurring bookings'},TIME);
 assert.ok(runGate(s,newer).some(x=>x.includes('Task Breakdown')));
});
test('manifest binds exactly one approved task and only linked acceptance checks',()=>{
 const {s,p}=approvedArtifacts();
 const m=makeRunManifest(s,p,'TASK-001','validate_only','test-run-1234',TIME);
 assert.equal(m.repository,'alikhalessi/Visual-SDD-Canvas-GPT');
 assert.deepEqual(m.task.criterionIds,['AC-001']);
 assert.equal(m.requirement.criteria.length,1);
 assert.equal(m.approvals.specRevision,s.revision);
});
test('bogus mode, task and unsafe identifier are refused',()=>{
 const {s,p}=approvedArtifacts();
 assert.throws(()=>makeRunManifest(s,p,'TASK-999','codex','test-run-1234',TIME),/Select/);
 assert.throws(()=>makeRunManifest(s,p,'TASK-001','unexpected','test-run-1234',TIME),/mode/);
 assert.throws(()=>makeRunManifest(s,p,'TASK-001','codex','../invalid',TIME),/identifier/);
});
test('issue body is fenced by strict markers and has an honest public warning',()=>{
 const {s,p}=approvedArtifacts();
 const m=makeRunManifest(s,p,'TASK-001','validate_only','test-run-1234',TIME);
 const body=manifestIssueBody(m);
 assert.ok(body.includes(manifestMarkers().head));assert.ok(body.includes(manifestMarkers().tail));
 assert.match(body,/publicly visible/);assert.match(body,/No agent result is accepted/);
});
test('GitHub issue URL does not leak task text or original ideas in query',()=>{
 const {s,p}=approvedArtifacts();const m=makeRunManifest(s,p,'TASK-001','codex','test-run-1234',TIME);
 const url=manifestIssueUrl(m);
 assert.ok(url.startsWith('https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/new?title='));
 assert.ok(!url.includes('community therapy'));assert.ok(!url.includes('architecture'));
});
test('requesting Codex does not produce execution claims',()=>{
 const {s,p}=approvedArtifacts();
 const m=makeRunManifest(s,p,'TASK-001','codex','test-run-1234',TIME);
 assert.equal(m.mode,'codex');assert.match(manifestIssueBody(m),/requires.*OPENAI_API_KEY/);
});
