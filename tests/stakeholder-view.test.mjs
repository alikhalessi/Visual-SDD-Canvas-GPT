import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 createStakeholderReview,rebaseStakeholderReview,readStakeholderReview,projectStakeholderRules,
 addBusinessWorkflow,removeBusinessWorkflow,flagEdgeCondition,resolveEdgeCondition,
 proposeBehaviourExample,removeBehaviourExample,recordReviewRationale,reviewIssues,approveBehaviourReview,localStakeholderKey
} from '../lib/stakeholder-view-core.ts';
const TIME='2026-11-21T08:00:00.000Z';
const SOURCE='Create an athlete-coach platform with access-controlled coaching data.';
function spec(revision=4){return {schemaVersion:1,id:'SPEC-001',sourceIdea:SOURCE,title:'SetPilot coaching',goal:'Coach access is controlled by the athlete.',audience:'Athletes and coaches',exclusions:'',revision,updatedAt:TIME,approval:{status:'draft',approvedAt:null,approvedRevision:null},requirements:[
 {id:'REQ-001',title:'Access withdrawal',statement:'Athletes can withdraw coach access at any point in time.',priority:'must',criteria:[{id:'AC-001',text:'Coach loses live dashboard access after withdrawal.'}]},
 {id:'REQ-002',title:'Scheduled reports',statement:'Private data cannot leak in delayed reports after access withdrawal.',priority:'should',criteria:[{id:'AC-001',text:'A queued weekly email requires an access check at send time.'}]}
 ]};}
function approvedWithExample(source=spec()){
 let doc=createStakeholderReview(source,TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Live access dashboard','interactive',TIME);
 doc=proposeBehaviourExample(doc,'REQ-001',doc.rules[0].workflows[0].id,'Coach already has dashboard open','Athlete withdraws access','Dashboard denies the next request',TIME);
 doc=recordReviewRationale(doc,'REQ-001','Reviewed permission withdrawal and downstream privacy expectations.',TIME);
 return {doc:approveBehaviourReview(source,doc,'REQ-001',TIME),source};
}

test('starts with source-linked rules only, not invented workflows or coverage',()=>{
 const s=spec(),doc=createStakeholderReview(s,TIME),cards=projectStakeholderRules(s,doc);
 assert.equal(doc.specRevision,s.revision);
 assert.equal(cards.length,2);
 assert.deepEqual(cards.map(r=>r.id),['REQ-001','REQ-002']);
 assert.equal(cards[0].statement,s.requirements[0].statement);
 assert.deepEqual(cards[0].sourceCriteria,s.requirements[0].criteria);
 assert.equal(cards[0].coverage,'No Example');
 assert.equal(cards[0].workflows.length,0);
 assert.equal(cards[1].edges.length,0);
});
test('workflows are explicitly classified as UI or scheduled/queued background paths',()=>{
 const s=spec();let doc=createStakeholderReview(s,TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Live athlete dashboard','interactive',TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Queued weekly email report','background',TIME);
 assert.deepEqual(doc.rules[0].workflows.map(x=>x.kind),['interactive','background']);
 assert.notEqual(doc.rules[0].workflows[0].id,doc.rules[0].workflows[1].id);
 assert.equal(projectStakeholderRules(s,doc)[0].coverage,'No Example');
});
test('an attached happy-path example is not a review approval',()=>{
 const s=spec();let doc=createStakeholderReview(s,TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Live dashboard','interactive',TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Queued report','background',TIME);
 doc=proposeBehaviourExample(doc,'REQ-001',doc.rules[0].workflows[0].id,'Access exists','Athlete revokes','UI denies access',TIME);
 assert.equal(projectStakeholderRules(s,doc)[0].coverage,'Example Attached');
 assert.match(reviewIssues(s,doc,'REQ-001').join(';'),/Queued report/);
 assert.throws(()=>approveBehaviourReview(s,doc,'REQ-001',TIME),/Queued report/);
});
test('open edge flags block approval and the human must resolve them explicitly',()=>{
 const {source}=approvedWithExample();let doc=createStakeholderReview(source,TIME);
 doc=addBusinessWorkflow(doc,'REQ-001','Live UI','interactive',TIME);
 const flow=doc.rules[0].workflows[0].id;
 doc=proposeBehaviourExample(doc,'REQ-001',flow,'Access is active','Athlete withdraws','The UI denies data',TIME);
 doc=recordReviewRationale(doc,'REQ-001','Reviewer checked the covered UI case.',TIME);
 doc=flagEdgeCondition(doc,'REQ-001','Queued report may deliver after revocation',TIME);
 assert.match(reviewIssues(source,doc,'REQ-001').join(' '),/uncovered paths/);
 assert.throws(()=>approveBehaviourReview(source,doc,'REQ-001',TIME));
 assert.throws(()=>resolveEdgeCondition(doc,'REQ-001',doc.rules[0].edges[0].id,'EX-999','Missing supporting example',TIME));
 assert.throws(()=>resolveEdgeCondition(doc,'REQ-001',doc.rules[0].edges[0].id,doc.rules[0].examples[0].id,'too short',TIME));
 doc=resolveEdgeCondition(doc,'REQ-001',doc.rules[0].edges[0].id,doc.rules[0].examples[0].id,'This example confirms access is rejected at the review checkpoint.',TIME);
 assert.deepEqual(reviewIssues(source,doc,'REQ-001'),[]);
 assert.equal(projectStakeholderRules(source,approveBehaviourReview(source,doc,'REQ-001',TIME))[0].coverage,'Behaviour Reviewed & Approved');
});
test('review approval is revision-locked but not confused with Specification approval',()=>{
 const {source,doc}=approvedWithExample();
 assert.equal(source.approval.status,'draft');
 assert.equal(doc.rules[0].decision.specRevision,source.revision);
 assert.equal(doc.rules[0].decision.ruleRevision,doc.rules[0].revision);
 assert.equal(projectStakeholderRules(source,doc)[0].coverage,'Behaviour Reviewed & Approved');
});
test('editing rationale invalidates review approval without changing source Specification',()=>{
 const {source,doc}=approvedWithExample();
 const updated=recordReviewRationale(doc,'REQ-001','New rationale after discovering an access boundary.',TIME);
 assert.equal(updated.rules[0].decision.status,'draft');
 assert.equal(updated.rules[0].revision,doc.rules[0].revision+1);
 assert.equal(projectStakeholderRules(source,updated)[0].coverage,'Example Attached');
 assert.equal(source.revision,4);
});
test('source revision rebase preserves notes and invalidates all stakeholder sign-offs',()=>{
 const {source,doc}=approvedWithExample();
 const revised={...source,revision:5};
 assert.equal(projectStakeholderRules(revised,doc)[0].coverage,'Example Attached');
 const next=rebaseStakeholderReview(doc,revised,TIME);
 assert.equal(next.specRevision,5);
 assert.equal(next.rules[0].workflows.length,1);
 assert.equal(next.rules[0].examples.length,1);
 assert.equal(next.rules[0].decision.status,'draft');
 assert.deepEqual(reviewIssues(revised,next,'REQ-001'),[]);
});
test('rebase retains removed requirement notes for recovery, but hides them in active projection',()=>{
 const s=spec();let d=createStakeholderReview(s,TIME);
 d=addBusinessWorkflow(d,'REQ-002','Weekly report','background',TIME);
 const shorter={...s,revision:5,requirements:s.requirements.slice(0,1)};
 const b=rebaseStakeholderReview(d,shorter,TIME);
 assert.ok(b.rules.some(r=>r.requirementId==='REQ-002'));
 assert.deepEqual(projectStakeholderRules(shorter,b).map(r=>r.id),['REQ-001']);
 const restored={...s,revision:6};
 assert.equal(projectStakeholderRules(restored,rebaseStakeholderReview(b,restored,TIME))[1].workflows.length,1);
});
test('new project identity does not accidentally inherit an unrelated stakeholder review',()=>{
 const s=spec(),doc=approvedWithExample(s).doc;
 const unrelated={...s,sourceIdea:'A different coaching product with a separate implementation detail'};
 const other=rebaseStakeholderReview(doc,unrelated,TIME);
 assert.equal(other.rules[0].examples.length,0);
 assert.notEqual(localStakeholderKey(s,null),localStakeholderKey(unrelated,null));
 assert.notEqual(localStakeholderKey(s,'project-1'),localStakeholderKey(s,'project-2'));
});
test('removing workflow also deletes its attached examples only when explicitly requested',()=>{
 const {doc,source}=approvedWithExample();
 const flow=doc.rules[0].workflows[0].id;
 const removed=removeBusinessWorkflow(doc,'REQ-001',flow,TIME);
 assert.equal(removed.rules[0].examples.length,0);
 assert.equal(projectStakeholderRules(source,removed)[0].coverage,'No Example');
 assert.equal(removed.rules[0].decision.status,'draft');
});
test('deleting example invalidates sign-off and reveals missing example gate',()=>{
 const {source,doc}=approvedWithExample();
 const changed=removeBehaviourExample(doc,'REQ-001',doc.rules[0].examples[0].id,TIME);
 assert.equal(projectStakeholderRules(source,changed)[0].coverage,'No Example');
 assert.match(reviewIssues(source,changed,'REQ-001').join(','),/add a Given/);
});
test('deleting a linked evidence example re-opens its previously resolved edge',()=>{
 const source=spec();let d=createStakeholderReview(source,TIME);
 d=addBusinessWorkflow(d,'REQ-001','Live dashboard','interactive',TIME);
 d=proposeBehaviourExample(d,'REQ-001',d.rules[0].workflows[0].id,'Coach holds permission','Access is revoked','Data is no longer available',TIME);
 d=flagEdgeCondition(d,'REQ-001','Previously queued data must not arrive',TIME);
 const id=d.rules[0].examples[0].id;
 d=resolveEdgeCondition(d,'REQ-001',d.rules[0].edges[0].id,id,'Reviewed the late revocation access condition.',TIME);
 assert.equal(d.rules[0].edges[0].status,'resolved');
 const changed=removeBehaviourExample(d,'REQ-001',id,TIME);
 assert.equal(changed.rules[0].edges[0].status,'open');
 assert.equal(changed.rules[0].edges[0].evidenceExampleId,null);
 assert.match(reviewIssues(source,changed,'REQ-001').join(' '),/uncovered/);
});
test('valid reviews round-trip exactly and keep stable source IDs',()=>{
 const {doc}=approvedWithExample();
 assert.deepEqual(readStakeholderReview(JSON.parse(JSON.stringify(doc))),doc);
});
test('tampered/malformed review caches fail closed',()=>{
 const {doc}=approvedWithExample();
 assert.equal(readStakeholderReview({schemaVersion:1}),null);
 assert.equal(readStakeholderReview({...doc,revision:-1}),null);
 assert.equal(readStakeholderReview({...doc,rules:[...doc.rules,doc.rules[0]]}),null);
 assert.equal(readStakeholderReview({...doc,rules:doc.rules.map((r,i)=>i? r:{...r,decision:{...r.decision,specRevision:0}})}),null);
 const duplicated=JSON.parse(JSON.stringify(doc));duplicated.rules[0].examples[0].workflowId='FLOW-999';
 assert.equal(readStakeholderReview(duplicated),null);
});
test('bounded input and unknown workflow pointers are rejected',()=>{
 const d=createStakeholderReview(spec(),TIME);
 assert.throws(()=>addBusinessWorkflow(d,'REQ-001','x','interactive',TIME));
 assert.throws(()=>addBusinessWorkflow(d,'REQ-001','Good label','invalid',TIME));
 assert.throws(()=>flagEdgeCondition(d,'REQ-001','short',TIME));
 assert.throws(()=>proposeBehaviourExample(d,'REQ-001','FLOW-999','good','good','good',TIME));
 assert.throws(()=>recordReviewRationale(d,'REQ-001','x'.repeat(2001),TIME));
 assert.throws(()=>approveBehaviourReview(spec(),d,'REQ-001',TIME));
});
test('rehydration without a source change is idempotent',()=>{
 const s=spec(),d=createStakeholderReview(s,TIME);
 assert.equal(rebaseStakeholderReview(d,s,TIME),d);
});
