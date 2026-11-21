import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../../lib/spec-core.ts';
import {createStakeholderReview,addBusinessWorkflow,proposeBehaviourExample,recordReviewRationale,approveBehaviourReview} from '../../lib/stakeholder-view-core.ts';
import {createPlanningDocument,reviseTechnical,approveTechnical,addLinkedTask,reviseLinkedTask,approveTaskBreakdown} from '../../lib/workflow-core.ts';
export const TIME='2026-11-21T18:00:00.000Z';
export function readyFixture(){
 let source=createSpecification('An athlete must be able to revoke coach access to a private dashboard.',TIME);
 source=revise(source,{title:'Athlete access governance',goal:'An athlete controls which coaches can read their personal dashboard.',audience:'Athletes and their coaches'},TIME);
 source=updateRequirement(source,'REQ-001',{title:'Revoke coach access',statement:'The athlete can revoke a coach access grant and immediately block dashboard access.'},TIME);
 source=updateCriterion(source,'REQ-001','AC-001','Given an active coach grant, when revoked, dashboard reads are denied.',TIME);
 source=approveSpecification(source,TIME);
 let review=createStakeholderReview(source,TIME);
 review=addBusinessWorkflow(review,'REQ-001','Revoke a dashboard access grant','interactive',TIME);
 review=proposeBehaviourExample(review,'REQ-001',review.rules[0].workflows[0].id,'An active coach grant exists','The athlete revokes the grant','The coach dashboard read is denied',TIME);
 review=recordReviewRationale(review,'REQ-001','The stated example covers the linked dashboard access workflow.',TIME);
 review=approveBehaviourReview(source,review,'REQ-001',TIME);
 let plan=createPlanningDocument(source,TIME);
 plan=reviseTechnical(plan,{architecture:'A server-controlled access check enforces the athlete grant on each dashboard request.',risks:'Cached access must be invalidated when grants are revoked.'},TIME);
 plan=approveTechnical(source,plan,TIME);plan=addLinkedTask(source,plan,TIME);
 plan=reviseLinkedTask(plan,'TASK-001',{title:'Implement grant revocation enforcement',criterionIds:['AC-001']},TIME);plan=approveTaskBreakdown(source,plan,TIME);
 return {source,review,plan};
}
