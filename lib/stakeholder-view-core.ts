/** Sprint 08 — pure, framework-independent stakeholder review model.
 * The existing Specification remains the authority for requirement wording and approval.
 * This versioned, project-scoped extension stores only explicitly reviewed business paths,
 * examples and decisions. It never fabricates workflows from acceptance criteria.
 */
import type {Specification,Requirement} from './spec-core.ts';

export type WorkflowKind='interactive'|'background';
export type BusinessWorkflow={id:string;label:string;kind:WorkflowKind};
export type EdgeCondition={id:string;description:string;status:'open'|'resolved';evidenceExampleId:string|null;reviewNote:string};
export type BehaviourExample={id:string;workflowId:string;given:string;when:string;then:string};
export type ReviewDecision={status:'draft'|'approved';at:string|null;ruleRevision:number|null;specRevision:number|null};
export type RuleReview={requirementId:string;revision:number;workflows:BusinessWorkflow[];edges:EdgeCondition[];examples:BehaviourExample[];rationale:string;decision:ReviewDecision};
export type StakeholderReviewDocument={schemaVersion:1;kind:'stakeholder-review';specId:string;sourceIdea:string;specRevision:number;revision:number;nextId:number;updatedAt:string;rules:RuleReview[]};
export type CoverageStatus='No Example'|'Example Attached'|'Behaviour Reviewed & Approved';
export type RuleCard={id:string;title:string;statement:string;priority:Requirement['priority'];sourceCriteria:{id:string;text:string}[];workflows:BusinessWorkflow[];edges:EdgeCondition[];examples:BehaviourExample[];rationale:string;coverage:CoverageStatus;approvedAt:string|null;issues:string[];revision:number};
const DRAFT:ReviewDecision={status:'draft',at:null,ruleRevision:null,specRevision:null};
const idPattern=/^(FLOW|EDGE|EX)-\d{3,}$/;
const nowDefault=()=>new Date().toISOString();
const validDate=(v:string)=>Number.isFinite(Date.parse(v));
const bounded=(v:unknown,max:number,min=0):v is string=>typeof v==='string'&&v.trim().length>=min&&v.length<=max;
const distinct=(arr:string[])=>new Set(arr).size===arr.length;

function emptyRule(requirementId:string):RuleReview{
 return {requirementId,revision:1,workflows:[],edges:[],examples:[],rationale:'',decision:{...DRAFT}};
}
export function createStakeholderReview(spec:Specification,now=nowDefault()):StakeholderReviewDocument{
 return {schemaVersion:1,kind:'stakeholder-review',specId:spec.id,sourceIdea:spec.sourceIdea,specRevision:spec.revision,revision:1,nextId:1,updatedAt:now,rules:spec.requirements.map(r=>emptyRule(r.id))};
}
/** Rebase only matching source identities. Preserve review notes, invalidate all sign-offs.
 * Removed requirements remain in the extension for recovery; they are not projected.
 */
export function rebaseStakeholderReview(doc:StakeholderReviewDocument,spec:Specification,now=nowDefault()):StakeholderReviewDocument{
 if(doc.specId!==spec.id||doc.sourceIdea!==spec.sourceIdea)return createStakeholderReview(spec,now);
 const missing=spec.requirements.filter(r=>!doc.rules.some(x=>x.requirementId===r.id));
 if(doc.specRevision===spec.revision&&!missing.length)return doc;
 return {...doc,specRevision:spec.revision,revision:doc.revision+1,updatedAt:now,rules:[
  ...doc.rules.map(x=>({...x,revision:x.revision+1,decision:{...DRAFT}})),...missing.map(r=>emptyRule(r.id))
 ]};
}
export function readStakeholderReview(value:unknown):StakeholderReviewDocument|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const d=value as StakeholderReviewDocument;
 if(d.schemaVersion!==1||d.kind!=='stakeholder-review'||!bounded(d.specId,80,1)||!bounded(d.sourceIdea,600,12)||
   !Number.isSafeInteger(d.specRevision)||d.specRevision<1||!Number.isSafeInteger(d.revision)||d.revision<1||
   !Number.isSafeInteger(d.nextId)||d.nextId<1||!bounded(d.updatedAt,45,10)||!validDate(d.updatedAt)||
   !Array.isArray(d.rules)||d.rules.length>100)return null;
 const ids:string[]=[];
 for(const r of d.rules){
  if(!r||typeof r!=='object'||!/^REQ-\d{3,}$/.test(r.requirementId)||!Number.isSafeInteger(r.revision)||r.revision<1||
    !Array.isArray(r.workflows)||r.workflows.length>20||!Array.isArray(r.edges)||r.edges.length>30||
    !Array.isArray(r.examples)||r.examples.length>60||!bounded(r.rationale,2000))return null;
  ids.push(r.requirementId);
  const recordIds=[...r.workflows,...r.edges,...r.examples].map(x=>x?.id);
  if(!recordIds.every(x=>typeof x==='string'&&idPattern.test(x))||!distinct(recordIds))return null;
  const flowIds=r.workflows.map(w=>w.id);
  if(!r.workflows.every(w=>w.id.startsWith('FLOW-')&&bounded(w.label,180,3)&&['interactive','background'].includes(w.kind))||
     !r.edges.every(e=>e.id.startsWith('EDGE-')&&bounded(e.description,600,8)&&['open','resolved'].includes(e.status)&&bounded(e.reviewNote,600)&&
       (e.evidenceExampleId===null||typeof e.evidenceExampleId==='string'&&r.examples.some(ex=>ex.id===e.evidenceExampleId))&&
       (e.status==='open'||e.evidenceExampleId!==null&&e.reviewNote.trim().length>=12))||
     !r.examples.every(e=>e.id.startsWith('EX-')&&flowIds.includes(e.workflowId)&&bounded(e.given,500,3)&&bounded(e.when,500,3)&&bounded(e.then,500,3)))return null;
  const a=r.decision;
  if(!a||!['draft','approved'].includes(a.status)||!(a.at===null||bounded(a.at,45,10)&&validDate(a.at))||
     !(a.ruleRevision===null||Number.isSafeInteger(a.ruleRevision))||!(a.specRevision===null||Number.isSafeInteger(a.specRevision)))return null;
  if(a.status==='approved'&&(!a.at||a.ruleRevision!==r.revision||a.specRevision!==d.specRevision))return null;
 }
 if(!distinct(ids))return null;
 const allIds=d.rules.flatMap(r=>[...r.workflows,...r.edges,...r.examples].map(x=>x.id));
 if(!distinct(allIds))return null;
 if(allIds.some(id=>Number(id.slice(id.indexOf('-')+1))>=d.nextId))return null;
 return d;
}
function mutate(doc:StakeholderReviewDocument,reqId:string,transform:(rule:RuleReview,doc:StakeholderReviewDocument)=>RuleReview,now:string):StakeholderReviewDocument{
 if(!doc.rules.some(r=>r.requirementId===reqId))throw Error('Review is not linked to a source requirement.');
 return {...doc,revision:doc.revision+1,updatedAt:now,rules:doc.rules.map(r=>r.requirementId!==reqId?r:{
  ...transform(r,doc),revision:r.revision+1,decision:{...DRAFT}
 })};
}
function nextId(doc:StakeholderReviewDocument,prefix:'FLOW'|'EDGE'|'EX'){
 return `${prefix}-${String(doc.nextId).padStart(3,'0')}`;
}
export function addBusinessWorkflow(doc:StakeholderReviewDocument,reqId:string,label:string,kind:WorkflowKind,now=nowDefault()){
 if(!bounded(label,180,3)||!['interactive','background'].includes(kind))throw Error('Enter a workflow name and choose its type.');
 const current=doc.rules.find(r=>r.requirementId===reqId);
 if(!current||current.workflows.length>=20)throw Error('Workflow limit reached or rule missing.');
 const result=mutate(doc,reqId,r=>({...r,workflows:[...r.workflows,{id:nextId(doc,'FLOW'),label:label.trim(),kind}]}),now);
 return {...result,nextId:doc.nextId+1};
}
export function removeBusinessWorkflow(doc:StakeholderReviewDocument,reqId:string,workflowId:string,now=nowDefault()){
 const rule=doc.rules.find(r=>r.requirementId===reqId);
 if(!rule?.workflows.some(x=>x.id===workflowId))throw Error('Workflow link does not exist.');
 return mutate(doc,reqId,r=>{
  const remaining=r.examples.filter(x=>x.workflowId!==workflowId);
  return {...r,workflows:r.workflows.filter(x=>x.id!==workflowId),examples:remaining,edges:r.edges.map(e=>e.evidenceExampleId&&!remaining.some(x=>x.id===e.evidenceExampleId)?{...e,status:'open',evidenceExampleId:null,reviewNote:''}:e)};
 },now);
}
export function flagEdgeCondition(doc:StakeholderReviewDocument,reqId:string,description:string,now=nowDefault()){
 if(!bounded(description,600,8))throw Error('Describe the uncovered edge or timing condition.');
 const rule=doc.rules.find(r=>r.requirementId===reqId);
 if(!rule||rule.edges.length>=30)throw Error('Edge condition limit reached or rule missing.');
 const result=mutate(doc,reqId,r=>({...r,edges:[...r.edges,{id:nextId(doc,'EDGE'),description:description.trim(),status:'open',evidenceExampleId:null,reviewNote:''}]}),now);
 return {...result,nextId:doc.nextId+1};
}
/** A reviewer must explicitly point to an example covering this flagged path and
 * explain why it resolves the issue; a one-click acknowledgement is insufficient. */
export function resolveEdgeCondition(doc:StakeholderReviewDocument,reqId:string,edgeId:string,exampleId:string,note:string,now=nowDefault()){
 const rule=doc.rules.find(r=>r.requirementId===reqId);
 if(!rule?.edges.some(x=>x.id===edgeId))throw Error('Uncovered path not found.');
 if(!rule.examples.some(e=>e.id===exampleId)||!bounded(note,600,12))throw Error('Link a real behavioural example and explain the resolution (12+ characters).');
 return mutate(doc,reqId,r=>({...r,edges:r.edges.map(x=>x.id===edgeId?{...x,status:'resolved',evidenceExampleId:exampleId,reviewNote:note.trim()}:x)}),now);
}
export function proposeBehaviourExample(doc:StakeholderReviewDocument,reqId:string,workflowId:string,given:string,when:string,then:string,now=nowDefault()){
 if(![given,when,then].every(x=>bounded(x,500,3)))throw Error('Fill in Given, When and Then (3+ characters each).');
 const rule=doc.rules.find(r=>r.requirementId===reqId);
 if(!rule?.workflows.some(x=>x.id===workflowId)||rule.examples.length>=60)throw Error('Choose an existing workflow before adding an example.');
 const result=mutate(doc,reqId,r=>({...r,examples:[...r.examples,{id:nextId(doc,'EX'),workflowId,given:given.trim(),when:when.trim(),then:then.trim()}]}),now);
 return {...result,nextId:doc.nextId+1};
}
export function removeBehaviourExample(doc:StakeholderReviewDocument,reqId:string,exampleId:string,now=nowDefault()){
 const rule=doc.rules.find(r=>r.requirementId===reqId);
 if(!rule?.examples.some(x=>x.id===exampleId))throw Error('Example not found.');
 return mutate(doc,reqId,r=>({...r,examples:r.examples.filter(x=>x.id!==exampleId),edges:r.edges.map(e=>e.evidenceExampleId===exampleId?{...e,status:'open',evidenceExampleId:null,reviewNote:''}:e)}),now);
}
export function recordReviewRationale(doc:StakeholderReviewDocument,reqId:string,rationale:string,now=nowDefault()){
 if(!bounded(rationale,2000))throw Error('Rationale is too long.');
 return mutate(doc,reqId,r=>({...r,rationale:rationale.trim()}),now);
}
export function reviewIssues(spec:Specification,doc:StakeholderReviewDocument,reqId:string):string[]{
 const req=spec.requirements.find(r=>r.id===reqId),r=doc.rules.find(r=>r.requirementId===reqId);
 if(!req||!r)return ['Rule has no matching source requirement.'];
 const issues:string[]=[];
 if(spec.id!==doc.specId||spec.sourceIdea!==doc.sourceIdea||spec.revision!==doc.specRevision)issues.push('Source specification revision changed; refresh the review first.');
 if(r.workflows.length===0)issues.push('Map at least one affected workflow.');
 for(const w of r.workflows)if(!r.examples.some(e=>e.workflowId===w.id))issues.push(`${w.label}: add a Given / When / Then example.`);
 if(r.edges.some(e=>e.status==='open'))issues.push('Resolve or document all flagged uncovered paths before sign-off.');
 if(r.rationale.trim().length<12)issues.push('Record a review rationale (at least 12 characters).');
 return issues;
}
export function approveBehaviourReview(spec:Specification,doc:StakeholderReviewDocument,reqId:string,now=nowDefault()):StakeholderReviewDocument{
 const issues=reviewIssues(spec,doc,reqId);
 if(issues.length)throw Error(issues.join(' '));
 return {...doc,revision:doc.revision+1,updatedAt:now,rules:doc.rules.map(r=>r.requirementId!==reqId?r:{...r,decision:{status:'approved',at:now,ruleRevision:r.revision,specRevision:spec.revision}})};
}
export function projectStakeholderRules(spec:Specification,doc:StakeholderReviewDocument|null):RuleCard[]{
 return spec.requirements.map(req=>{
  const linked=doc&&doc.specId===spec.id&&doc.sourceIdea===spec.sourceIdea?doc.rules.find(r=>r.requirementId===req.id):undefined;
  const r=linked??emptyRule(req.id);
  const approved=!!doc&&doc.specRevision===spec.revision&&r.decision.status==='approved'&&r.decision.ruleRevision===r.revision&&r.decision.specRevision===spec.revision;
  const coverage:CoverageStatus=approved?'Behaviour Reviewed & Approved':r.examples.length?'Example Attached':'No Example';
  return {id:req.id,title:req.title,statement:req.statement,priority:req.priority,sourceCriteria:req.criteria.map(c=>({...c})),
   workflows:r.workflows,edges:r.edges,examples:r.examples,rationale:r.rationale,coverage,approvedAt:approved?r.decision.at:null,
   revision:r.revision,issues:doc?reviewIssues(spec,doc,req.id):['Review not loaded.']};
 });
}
/** Non-cryptographic identifier for browser-local separation; never use as a security boundary. */
export function localStakeholderKey(spec:Specification,projectId:string|null):string{
 const source=(projectId||'guest')+'|'+spec.sourceIdea+'|'+spec.id;
 let hash=2166136261;
 for(const ch of source){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return 'visual-sdd-stakeholder-v1-'+(hash>>>0).toString(36);
}
