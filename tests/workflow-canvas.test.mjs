import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../lib/spec-core.ts';
import {createPlanningDocument,reviseTechnical,validateTechnical,approveTechnical,addLinkedTask,reviseLinkedTask,approveTaskBreakdown,validateTaskBreakdown,workflowGraph,traceabilityGraph,requirementCoverage,readPlanningDocument,localPlanningKey,planningMarkdown,technicalApproved,tasksApproved,planIsCurrent} from '../lib/workflow-core.ts';

const NOW='2026-11-05T20:00:00.000Z';
const IDEA='Appointment scheduling application for a community healthcare office';
function spec(){
 let x=createSpecification(IDEA,NOW);
 x=revise(x,{title:'Appointments online',goal:'Patients can reserve a clinic appointment online without phone calls.',audience:'Patients and office staff'},NOW);
 x=updateRequirement(x,'REQ-001',{title:'Reserve a time slot',statement:'Patients can reserve a free appointment slot with confirmation.'},NOW);
 x=updateCriterion(x,'REQ-001','AC-001','Given a free slot, when saved, then a reservation confirmation appears.',NOW);
 return x;
}
function approved(){return approveSpecification(spec(),NOW);}
function planReady(){let s=approved(),p=createPlanningDocument(s,NOW);p=reviseTechnical(p,{architecture:'Next.js application, REST endpoints and PostgreSQL persistence.',risks:'Time slot race conditions and duplicate reservations require locking.'},NOW);p=approveTechnical(s,p,NOW);return {s,p};}
function taskReady(){let {s,p}=planReady();p=addLinkedTask(s,p,NOW);const id=p.breakdown.tasks[0].id;p=reviseLinkedTask(p,id,{title:'Implement slot reservation and confirmation',criterionIds:['AC-001']},NOW);return {s,p};}

test('planning blocked before human approves specification',()=>assert.throws(()=>createPlanningDocument(spec(),NOW),/Approve/));
test('create plan binds exact approved spec revision without inventing design',()=>{
 const s=approved(),p=createPlanningDocument(s,NOW);
 assert.equal(p.specRevision,s.revision);assert.equal(p.technical.architecture,'');assert.equal(p.breakdown.tasks.length,0);
});
test('technical approval rejects incomplete plan',()=>{let s=approved(),p=createPlanningDocument(s,NOW);assert.ok(validateTechnical(s,p).length>=2);assert.throws(()=>approveTechnical(s,p,NOW));});
test('technical plan approval is revision-scoped',()=>{const {p}=planReady();assert.equal(p.technical.approval.revision,p.technical.revision);assert.ok(technicalApproved(p));});
test('editing an approved technical plan invalidates approvals downstream',()=>{
 let {s,p}=taskReady();p=approveTaskBreakdown(s,p,NOW);
 p=reviseTechnical(p,{architecture:'Use a transactional booking service with an API gateway and explicit validation.'},NOW);
 assert.equal(technicalApproved(p),false);assert.equal(tasksApproved(p),false);
});
test('adding tasks requires an approved technical plan',()=>{
 const s=approved(),p=createPlanningDocument(s,NOW);
 assert.throws(()=>addLinkedTask(s,p,NOW),/Approve/);
});
test('linked task IDs stay stable and monotonic',()=>{
 let {s,p}=planReady();p=addLinkedTask(s,p,NOW);p=addLinkedTask(s,p,NOW);
 assert.deepEqual(p.breakdown.tasks.map(t=>t.id),['TASK-001','TASK-002']);
 assert.equal(p.breakdown.nextTaskNumber,3);
});
test('task approval fails when criteria are not linked',()=>{
 let {s,p}=planReady();p=addLinkedTask(s,p,NOW);
 p=reviseLinkedTask(p,'TASK-001',{title:'Implement the appointment booking service'},NOW);
 assert.ok(validateTaskBreakdown(s,p).some(e=>e.includes('acceptance criterion')));
});
test('task approval accepts traceable, human-reviewed definitions',()=>{
 let {s,p}=taskReady();p=approveTaskBreakdown(s,p,NOW);assert.ok(tasksApproved(p));
 assert.deepEqual(traceabilityGraph(s,p),[{requirementId:'REQ-001',taskId:'TASK-001',criterionId:'AC-001'}]);
 assert.deepEqual(requirementCoverage(s,p),{covered:1,total:1});
});
test('task changes invalidate only task acceptance, not approved architecture',()=>{
 let {s,p}=taskReady();p=approveTaskBreakdown(s,p,NOW);p=reviseLinkedTask(p,'TASK-001',{title:'Build booking transaction and confirmation email'},NOW);
 assert.equal(technicalApproved(p),true);assert.equal(tasksApproved(p),false);
});
test('a new specification revision makes previous plan stale and gates block',()=>{
 let {s,p}=taskReady();s=revise(s,{goal:'Patients can reserve an appointment and cancel it online without calling.'},NOW);
 assert.equal(planIsCurrent(s,p),false);
 assert.equal(workflowGraph(s,p,s.sourceIdea).find(x=>x.id==='plan')?.state,'blocked');
});
test('workflow graph has seven ordered stages with future execution disabled',()=>{
 const {s,p}=taskReady();const nodes=workflowGraph(s,p,s.sourceIdea);
 assert.deepEqual(nodes.map(x=>x.id),['idea','specify','plan','tasks','implement','verify','release']);
 assert.equal(nodes.find(x=>x.id==='plan')?.state,'complete');
 assert.equal(nodes.find(x=>x.id==='tasks')?.state,'available');
 assert.equal(nodes.find(x=>x.id==='implement')?.state,'future');
});
test('no plan is falsely marked as approved for a draft spec',()=>{
 const s=spec();const states=workflowGraph(s,null,s.sourceIdea);
 assert.equal(states.find(x=>x.id==='specify')?.state,'available');
 assert.equal(states.find(x=>x.id==='plan')?.state,'blocked');
});
test('trace links are derived from explicit criterion references only',()=>{
 let {s,p}=planReady();p=addLinkedTask(s,p,NOW);
 assert.deepEqual(traceabilityGraph(s,p),[]);assert.equal(requirementCoverage(s,p).covered,0);
});
test('read parser safely rejects malformed documents and stale approval revisions',()=>{
 let {s,p}=taskReady();p=approveTaskBreakdown(s,p,NOW);
 assert.deepEqual(readPlanningDocument(JSON.parse(JSON.stringify(p))),p);
 const changed=structuredClone(p);changed.breakdown.approval.revision=1;
 assert.equal(readPlanningDocument(changed),null);
 assert.equal(readPlanningDocument({schemaVersion:1,sourceIdea:'invalid'}),null);
});
test('planning storage key separates projects and ideas',()=>{
 const s=approved();assert.notEqual(localPlanningKey(s,'cloud-1'),localPlanningKey(s,'cloud-2'));
 assert.notEqual(localPlanningKey(s),localPlanningKey(s,'cloud-1'));
});
test('Markdown artifact is honest about no agent execution',()=>{
 const {s,p}=taskReady();const out=planningMarkdown(s,p);
 assert.match(out,/TASK-001/);assert.match(out,/REQ-001\/AC-001/);assert.match(out,/No agents ran/);
});
