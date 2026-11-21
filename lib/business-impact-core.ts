import type {Specification} from './spec-core.ts';
import type {StakeholderReviewDocument} from './stakeholder-view-core.ts';
import type {PlanningDocument} from './workflow-core.ts';
import {assessChangeImpact} from './impact-core.ts';

/** Plain-language projection of actual recorded links, never inferred safety. */
export function describeBusinessImpact(spec:Specification,review:StakeholderReviewDocument|null,plan:PlanningDocument|null){
 if(review&&(review.specId!==spec.id||review.sourceIdea!==spec.sourceIdea))review=null;
 const report=assessChangeImpact(spec,plan);
 const findings:{key:string;message:string;workflowIds:string[];edgeIds:string[];certainty:'recorded'|'unknown'}[]=[];
 if(report.state==='no_plan'||report.state==='missing_baseline')findings.push({key:'baseline',message:'No verified comparison baseline is available. We cannot identify all changed behaviour; missing links do not establish safety.',workflowIds:[],edgeIds:[],certainty:'unknown'});
 if(review&&review.specRevision!==spec.revision)findings.push({key:'stale-review',message:'The business review belongs to an older source revision. Its recorded links need fresh review before they can support the current change.',workflowIds:[],edgeIds:[],certainty:'unknown'});
 for(const change of report.changes){
  const rules=review?.rules.filter(r=>change.requirementId===null||r.requirementId===change.requirementId)??[];
  const workflows=rules.flatMap(r=>r.workflows),edges=rules.flatMap(r=>r.edges);
  findings.push({key:change.key,message:change.label+': review '+(workflows.length?workflows.map(w=>w.label).join(', '):'the affected behaviour; no workflow link was recorded')+'. '+change.affectedTaskIds.length+' task(s) have direct recorded links. Other effects remain possible.',workflowIds:workflows.map(w=>w.id),edgeIds:edges.map(e=>e.id),certainty:workflows.length?'recorded':'unknown'});
 }
 if(!review)findings.push({key:'review',message:'Business review is unavailable. Workflow and timing coverage are unknown.',workflowIds:[],edgeIds:[],certainty:'unknown'});
 for(const rule of review?.rules??[]){
  if(!spec.requirements.some(r=>r.id===rule.requirementId))continue;
  for(const edge of rule.edges.filter(e=>e.status==='open'))findings.push({key:rule.requirementId+'/'+edge.id,message:rule.requirementId+' has an unanswered timing or edge question: '+edge.description+' This is an open question, not a confirmed workflow.',workflowIds:[],edgeIds:[edge.id],certainty:'recorded'});
  for(const flow of rule.workflows.filter(w=>w.kind==='background')){
   const examples=rule.examples.filter(e=>e.workflowId===flow.id);
   findings.push({key:rule.requirementId+'/'+flow.id,message:flow.label+': '+(examples.length?'Attached examples need human review for delayed delivery, state changes and revoked access; attachment alone does not prove coverage.':'No example records the precondition, trigger and expected result. Review delayed delivery and changes of access before sign-off.'),workflowIds:[flow.id],edgeIds:[],certainty:examples.length?'unknown':'recorded'});
  }
 }
 return {state:report.state,findings,directTaskIds:report.directTaskIds,potentialTaskIds:report.potentialTaskIds};
}
