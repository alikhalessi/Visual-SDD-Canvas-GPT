import {createSpecification,revise,addRequirement,updateRequirement,updateCriterion,readSpecification,type Specification} from './spec-core.ts';
import {createStakeholderReview,addBusinessWorkflow,proposeBehaviourExample,flagEdgeCondition,localStakeholderKey} from './stakeholder-view-core.ts';
import {localVibeHistoryKey} from './vibe-ingestor-core.ts';
import {localHandoffHistoryKey} from './agent-handoff-core.ts';
import {localPlanningKey} from './workflow-core.ts';

export const DEMO_PROJECT_ID='setpilot-demo-v1';
export const DEMO_MARKER='visual-sdd-setpilot-demo-v1';
export const DEMO_SOURCE_KEY='visual-sdd-specification-v1';
const TIME='2026-11-22T09:00:00.000Z';
type StorageAccess=Pick<Storage,'getItem'|'setItem'|'removeItem'>;

/** An editable product demonstration, separate from the frozen evaluation scenarios. */
export function createDemoSample(){
 let source=createSpecification('An athlete can revoke coach access. A weekly report may already be queued when that access is withdrawn.',TIME);
 source=revise(source,{title:'SetPilot — Coach access and weekly reports',goal:'Athletes control dashboard access and review what happens to weekly reports queued before access is withdrawn.',audience:'Athletes and coaches',exclusions:'Billing, training plans and implementation execution.'},TIME);
 source=updateRequirement(source,'REQ-001',{title:'Withdraw coach access',statement:'An athlete must be able to withdraw coach access and block subsequent dashboard reads.'},TIME);
 source=updateCriterion(source,'REQ-001','AC-001','Given coach access exists, when the athlete withdraws it, then subsequent dashboard reads by that coach are denied.',TIME);
 source=addRequirement(source,TIME);
 source=updateRequirement(source,'REQ-002',{title:'Check access before weekly report delivery',statement:'A queued weekly report must check current coach access at delivery time.'},TIME);
 source=updateCriterion(source,'REQ-002','AC-001','Given a weekly report was queued before access withdrawal, when delivery is attempted, then it is withheld from the revoked coach.',TIME);
 let review=createStakeholderReview(source,TIME);
 review=addBusinessWorkflow(review,'REQ-001','Coach opens the dashboard','interactive',TIME);
 review=proposeBehaviourExample(review,'REQ-001',review.rules[0].workflows[0].id,'Coach access has been withdrawn','The coach requests the dashboard','The request is denied',TIME);
 review=flagEdgeCondition(review,'REQ-001','A weekly report was queued before access was withdrawn. Review delivery-time access checks before accepting this background path; it is not a confirmed workflow.',TIME);
 review=flagEdgeCondition(review,'REQ-002','What happens if access changes after a weekly report is queued but before delivery? No background workflow or delivery example has been confirmed.',TIME);
 return {source,review};
}
export function demoRecordKeys(source:Specification){return [DEMO_SOURCE_KEY,'visual-sdd-idea',localStakeholderKey(source,DEMO_PROJECT_ID),localVibeHistoryKey(source,DEMO_PROJECT_ID),localHandoffHistoryKey(source,DEMO_PROJECT_ID),localPlanningKey(source,DEMO_PROJECT_ID),DEMO_MARKER];}

/** Reset known demo records only; unrelated workspace and evaluation records are retained. */
export function installDemoSample(storage:StorageAccess,reset=false):Specification{
 const original=storage.getItem(DEMO_SOURCE_KEY),owned=storage.getItem(DEMO_MARKER)==='1';
 if(original!==null&&!owned)throw Error('Existing browser work was preserved. Open the demo on its independent website address.');
 if(!reset&&original!==null){let source:Specification|null=null;try{source=readSpecification(JSON.parse(original));}catch{}if(!source)throw Error('Saved demo source is unreadable. Use Reset demo sample to restore the fictitious records.');return source;}
 const fixture=createDemoSample();
 let previous:Specification|null=null;try{previous=original?readSpecification(JSON.parse(original)):null;}catch{}
 const keys=[...new Set([...demoRecordKeys(fixture.source),...(previous?demoRecordKeys(previous):[])])];
 const before=new Map(keys.map(k=>[k,storage.getItem(k)]));
 try{
  for(const k of keys)storage.removeItem(k);
  storage.setItem(DEMO_SOURCE_KEY,JSON.stringify(fixture.source));
  storage.setItem('visual-sdd-idea',JSON.stringify({id:DEMO_PROJECT_ID,title:fixture.source.title,description:fixture.source.sourceIdea,status:'draft'}));
  storage.setItem(localStakeholderKey(fixture.source,DEMO_PROJECT_ID),JSON.stringify(fixture.review));
  storage.setItem(DEMO_MARKER,'1');
 }catch{
  let restored=true;for(const [k,v]of before)try{if(v===null)storage.removeItem(k);else storage.setItem(k,v);}catch{restored=false;}
  throw Error(restored?'Demo reset could not be saved; previous records were restored.':'Browser storage failed during reset and recovery. Preserve any open work before leaving.');
 }
 return fixture.source;
}
