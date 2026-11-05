import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,updateRequirement,updateCriterion,addCriterion,removeCriterion,addRequirement,removeRequirement,approveSpecification} from '../lib/spec-core.ts';
import {createPlanningDocument,reviseTechnical,approveTechnical,addLinkedTask,reviseLinkedTask,approveTaskBreakdown,readPlanningDocument} from '../lib/workflow-core.ts';
import {snapshotSpecification,isValidBaseline,assessChangeImpact,impactMarkdown} from '../lib/impact-core.ts';
const NOW='2026-11-05T20:00:00.000Z',IDEA='Online booking system for a local therapy and movement clinic';
function approved(){
 let s=createSpecification(IDEA,NOW);
 s=revise(s,{title:'Therapy appointment booking',goal:'Patients can book an open appointment and receive confirmation.',audience:'Clients and reception staff'},NOW);
 s=updateRequirement(s,'REQ-001',{title:'Choose appointment time',statement:'Patients select an open appointment and receive confirmation.'},NOW);
 s=updateCriterion(s,'REQ-001','AC-001','Given a free slot, when booked, then show confirmation.',NOW);
 return approveSpecification(s,NOW);
}
function baseline(){
 const s=approved();let p=createPlanningDocument(s,NOW);
 p=reviseTechnical(p,{architecture:'Next.js front end with a protected appointment booking service.',risks:'Double bookings can happen without transactional locking.'},NOW);
 p=approveTechnical(s,p,NOW);p=addLinkedTask(s,p,NOW);
 p=reviseLinkedTask(p,'TASK-001',{title:'Build an appointment time selection and confirmation workflow',criterionIds:['AC-001']},NOW);
 p=approveTaskBreakdown(s,p,NOW);
 return {s,p};
}
test('plan captures the exact original approved specification content',()=>{
 const {s,p}=baseline();
 assert.deepEqual(p.specBaseline,snapshotSpecification(s));
 assert.ok(isValidBaseline(p.specBaseline));
 assert.ok(readPlanningDocument(JSON.parse(JSON.stringify(p))));
});
test('matching content and current approval produce no change',()=>{
 const {s,p}=baseline();const report=assessChangeImpact(s,p);
 assert.equal(report.state,'current');assert.equal(report.changes.length,0);
 assert.deepEqual(report.directTaskIds,[]);assert.deepEqual(report.staleApprovalStages,[]);
});
test('edited acceptance text highlights exactly the connected task',()=>{
 const {s,p}=baseline();
 const edited=updateCriterion(s,'REQ-001','AC-001','Given a free time, booking confirms with a new reservation number.',NOW);
 const report=assessChangeImpact(edited,p);
 assert.equal(report.state,'changed');
 assert.equal(report.changes[0].key,'REQ-001/AC-001');
 assert.equal(report.changes[0].kind,'modified');
 assert.deepEqual(report.changes[0].affectedTaskIds,['TASK-001']);
 assert.ok(report.staleApprovalStages.includes('implement'));
});
test('removed criterion preserves historical direct links',()=>{
 const {s,p}=baseline();const updated=removeCriterion(s,'REQ-001','AC-001',NOW);
 const r=assessChangeImpact(updated,p);
 assert.equal(r.changes[0].kind,'removed');assert.deepEqual(r.directTaskIds,['TASK-001']);
});
test('removed requirement finds tasks even though it no longer appears in specification',()=>{
 const {s,p}=baseline();const updated=removeRequirement(s,'REQ-001',NOW);
 const r=assessChangeImpact(updated,p);
 assert.equal(r.changes[0].key,'REQ-001');assert.equal(r.changes[0].kind,'removed');
 assert.deepEqual(r.directTaskIds,['TASK-001']);
});
test('new requirement with no links is not falsely claimed as directly covered',()=>{
 const {s,p}=baseline();const updated=addRequirement(s,NOW);
 const r=assessChangeImpact(updated,p);
 assert.ok(r.changes.some(x=>x.key==='REQ-002'&&x.kind==='added'&&x.affectedTaskIds.length===0));
 assert.deepEqual(r.directTaskIds,[]);assert.deepEqual(r.potentialTaskIds,['TASK-001']);
});
test('edited task approval does not alter recorded specification baseline',()=>{
 const {s,p}=baseline();
 const changed=reviseLinkedTask(p,'TASK-001',{title:'Implement a new booking widget and confirmation notice'},NOW);
 assert.deepEqual(changed.specBaseline,p.specBaseline);
 assert.deepEqual(assessChangeImpact(s,changed).changes,[]);
});
test('global product goal change flags every task even with no criterion change',()=>{
 const {s,p}=baseline();const updated=revise(s,{goal:'Patients can book a time and receive an email reminder.'},NOW);
 const r=assessChangeImpact(updated,p);
 assert.ok(r.changes.some(x=>x.key==='product:goal'));
 assert.deepEqual(r.directTaskIds,['TASK-001']);
});
test('new document without plan indicates missing baseline, not fabricated diffs',()=>{
 const r=assessChangeImpact(approved(),null);
 assert.equal(r.state,'no_plan');assert.equal(r.changes.length,0);
});
test('pre-Sprint-05 plans cannot be diffed against an invented old specification',()=>{
 const {s,p}=baseline();const legacy={...p};delete legacy.specBaseline;
 assert.ok(readPlanningDocument(legacy));
 const r=assessChangeImpact(updateCriterion(s,'REQ-001','AC-001','Given a free slot, booking shows an instant confirmation and email.',NOW),legacy);
 assert.equal(r.state,'missing_baseline');
 assert.deepEqual(r.potentialTaskIds,['TASK-001']);
 assert.equal(r.changes.length,0);
});
test('corrupted baseline is rejected at local load',()=>{
 const {p}=baseline();
 const corrupt={...p,specBaseline:{schemaVersion:1,revision:p.specRevision,requirements:[{id:'REQ-001',criteria:'invalid'}]}};
 assert.equal(readPlanningDocument(corrupt),null);
});
test('reapproved unchanged document revision remains stale and requires review',()=>{
 const {s,p}=baseline();const next=approveSpecification(revise(s,{title:s.title},NOW),NOW);
 const r=assessChangeImpact(next,p);
 assert.equal(r.changes.length,0);
 assert.equal(r.state,'changed');assert.deepEqual(r.potentialTaskIds,['TASK-001']);
 assert.ok(r.staleApprovalStages.includes('plan'));
});
test('impact markdown contains changes and governance without implying code execution',()=>{
 const {s,p}=baseline();const changed=updateCriterion(s,'REQ-001','AC-001','Given free time, show reservation confirmation and summary.',NOW);
 const text=impactMarkdown(assessChangeImpact(changed,p));
 assert.match(text,/TASK-001/);assert.match(text,/REQ-001 \/ AC-001/);assert.match(text,/never automatically transfers approval/);
});
test('unchanged approved spec has a stable, deterministic snapshot',()=>{
 const s=approved();assert.deepEqual(snapshotSpecification(s),snapshotSpecification(s));
});
test('unsaved specification reopens all dependent approval gates',()=>{
 const {s,p}=baseline();const draft=revise(s,{exclusions:'No insurance integration.'},NOW);
 const r=assessChangeImpact(draft,p);
 assert.deepEqual(r.staleApprovalStages,['specify','plan','tasks','implement']);
});
test('impact results use actual linked criteria, not all tasks in the same requirement',()=>{
 const {s,p}=baseline();
 const s2=addCriterion(s,'REQ-001',NOW);
 const changed=updateCriterion(s2,'REQ-001','AC-002','Given an invalid date, validation prevents booking.',NOW);
 const r=assessChangeImpact(changed,p);
 const added=r.changes.find(x=>x.key==='REQ-001/AC-002');
 assert.deepEqual(added?.affectedTaskIds,[]);
 assert.deepEqual(r.potentialTaskIds,['TASK-001']);
});
