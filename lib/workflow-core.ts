import type {Specification,Requirement} from './spec-core.ts';
import {SDD_STAGES,type StageId} from './sdd-core.ts';
import {snapshotSpecification,isValidBaseline,type SpecificationBaseline} from './impact-core.ts';

export type WorkflowApproval={status:'draft'|'approved';revision:number|null;at:string|null};
export type LinkedTask={id:string;title:string;requirementId:string;criterionIds:string[]};
export type PlanningDocument={
 schemaVersion:1;sourceIdea:string;specRevision:number;updatedAt:string;
 specBaseline?:SpecificationBaseline;
 technical:{architecture:string;risks:string;assumptions:string;revision:number;approval:WorkflowApproval};
 breakdown:{tasks:LinkedTask[];revision:number;nextTaskNumber:number;approval:WorkflowApproval};
};
export type StageState='complete'|'available'|'blocked'|'future';
export type StageRecord={id:StageId;label:string;state:StageState;detail:string};
export type TraceLink={requirementId:string;taskId:string;criterionId:string};
const draft=():WorkflowApproval=>({status:'draft',revision:null,at:null});
const updated=(now?:string)=>now??new Date().toISOString();
export function specIsApproved(spec:Specification|null):spec is Specification{
 return !!spec&&spec.approval.status==='approved'&&spec.approval.approvedRevision===spec.revision;
}
export function planIsCurrent(spec:Specification|null,doc:PlanningDocument|null):boolean{
 return specIsApproved(spec)&&!!doc&&doc.sourceIdea===spec.sourceIdea&&doc.specRevision===spec.revision;
}
export function technicalApproved(doc:PlanningDocument|null):boolean{
 return !!doc&&doc.technical.approval.status==='approved'&&doc.technical.approval.revision===doc.technical.revision;
}
export function tasksApproved(doc:PlanningDocument|null):boolean{
 return !!doc&&doc.breakdown.approval.status==='approved'&&doc.breakdown.approval.revision===doc.breakdown.revision;
}
export function createPlanningDocument(spec:Specification,now?:string):PlanningDocument{
 if(!specIsApproved(spec))throw Error('Approve the specification before opening the technical plan.');
 return {schemaVersion:1,sourceIdea:spec.sourceIdea,specRevision:spec.revision,updatedAt:updated(now),specBaseline:snapshotSpecification(spec),
 technical:{architecture:'',risks:'',assumptions:'',revision:1,approval:draft()},
 breakdown:{tasks:[],revision:0,nextTaskNumber:1,approval:draft()}};
}
/** Capture a baseline for pre-Sprint-05 plans ONLY when the original approved revision is still current. */
export function backfillCurrentBaseline(spec:Specification|null,doc:PlanningDocument):PlanningDocument{
 if(doc.specBaseline||!planIsCurrent(spec,doc)||!spec)return doc;
 return {...doc,specBaseline:snapshotSpecification(spec)};
}
export function reviseTechnical(doc:PlanningDocument,patch:Partial<Pick<PlanningDocument['technical'],'architecture'|'risks'|'assumptions'>>,now?:string):PlanningDocument{
 return {...doc,updatedAt:updated(now),technical:{...doc.technical,...patch,revision:doc.technical.revision+1,approval:draft()},breakdown:{...doc.breakdown,approval:draft()}};
}
export function validateTechnical(spec:Specification,doc:PlanningDocument):string[]{
 const issues:string[]=[];
 if(!planIsCurrent(spec,doc))issues.push('The source specification must be approved at the linked revision.');
 if(doc.technical.architecture.trim().length<25)issues.push('Describe the proposed technical approach (25+ characters).');
 if(doc.technical.risks.trim().length<12)issues.push('Identify at least one risk or uncertainty (12+ characters).');
 return issues;
}
export function approveTechnical(spec:Specification,doc:PlanningDocument,now?:string):PlanningDocument{
 const issues=validateTechnical(spec,doc);if(issues.length)throw Error(issues.join(' '));
 return {...doc,updatedAt:updated(now),technical:{...doc.technical,approval:{status:'approved',revision:doc.technical.revision,at:updated(now)}}};
}
function changeTasks(doc:PlanningDocument,tasks:LinkedTask[],nextNumber:number,now?:string):PlanningDocument{
 return {...doc,updatedAt:updated(now),breakdown:{tasks,revision:doc.breakdown.revision+1,nextTaskNumber:nextNumber,approval:draft()}};
}
export function addLinkedTask(spec:Specification,doc:PlanningDocument,now?:string):PlanningDocument{
 if(!planIsCurrent(spec,doc)||!technicalApproved(doc))throw Error('Approve the current technical plan before defining tasks.');
 if(doc.breakdown.tasks.length>=60)throw Error('Maximum 60 tasks per project.');
 const n=doc.breakdown.nextTaskNumber;
 const task:LinkedTask={id:'TASK-'+String(n).padStart(3,'0'),title:'',requirementId:spec.requirements[0]?.id||'',criterionIds:[]};
 return changeTasks(doc,[...doc.breakdown.tasks,task],n+1,now);
}
export function reviseLinkedTask(doc:PlanningDocument,id:string,patch:Partial<Pick<LinkedTask,'title'|'requirementId'|'criterionIds'>>,now?:string):PlanningDocument{
 if(!doc.breakdown.tasks.some(t=>t.id===id))return doc;
 return changeTasks(doc,doc.breakdown.tasks.map(t=>t.id===id?{...t,...patch}:t),doc.breakdown.nextTaskNumber,now);
}
export function removeLinkedTask(doc:PlanningDocument,id:string,now?:string):PlanningDocument{
 return changeTasks(doc,doc.breakdown.tasks.filter(t=>t.id!==id),doc.breakdown.nextTaskNumber,now);
}
export function validateTaskBreakdown(spec:Specification,doc:PlanningDocument):string[]{
 const issues:string[]=[];
 if(!planIsCurrent(spec,doc)||!technicalApproved(doc))issues.push('Approve the current technical plan first.');
 if(!doc.breakdown.tasks.length)issues.push('Add at least one implementation task.');
 const allowed=new Map(spec.requirements.map(r=>[r.id,new Set(r.criteria.map(c=>c.id))]));
 const ids=new Set<string>();
 for(const t of doc.breakdown.tasks){
  if(ids.has(t.id))issues.push('Task IDs must be unique.');ids.add(t.id);
  if(t.title.trim().length<12)issues.push(t.id+': describe an actionable task (12+ characters).');
  if(!allowed.has(t.requirementId))issues.push(t.id+': select an existing requirement.');
  if(!t.criterionIds.length)issues.push(t.id+': link at least one acceptance criterion.');
  for(const cid of t.criterionIds)if(!allowed.get(t.requirementId)?.has(cid))issues.push(t.id+': invalid acceptance criterion '+cid+'.');
 }
 for(const r of spec.requirements)if(!doc.breakdown.tasks.some(t=>t.requirementId===r.id))issues.push(r.id+': no linked task covers this requirement.');
 return issues;
}
export function approveTaskBreakdown(spec:Specification,doc:PlanningDocument,now?:string):PlanningDocument{
 const issues=validateTaskBreakdown(spec,doc);if(issues.length)throw Error(issues.join(' '));
 return {...doc,updatedAt:updated(now),breakdown:{...doc.breakdown,approval:{status:'approved',revision:doc.breakdown.revision,at:updated(now)}}};
}
export function workflowGraph(spec:Specification|null,doc:PlanningDocument|null,idea:string):StageRecord[]{
 const hasIdea=idea.trim().length>=12;
 const approved=specIsApproved(spec);
 const current=planIsCurrent(spec,doc);
 const planDone=current&&technicalApproved(doc);
 const tasksDone=planDone&&tasksApproved(doc);
 return SDD_STAGES.map(s=>{
  const id=s.id;
  if(id==='idea')return {id,label:s.label,state:hasIdea?'complete':'available',detail:hasIdea?'Idea captured':'Describe an idea to begin'};
  if(id==='specify')return {id,label:s.label,state:approved?'complete':spec?'available':'blocked',detail:approved?'Approved revision '+spec!.revision:spec?'Specification requires human approval':'Start from a saved idea'};
  if(id==='plan')return {id,label:s.label,state:planDone?'complete':approved?'available':'blocked',detail:planDone?'Technical plan approved':current?'Plan needs review':approved?'Create a technical plan':'Approve specification first'};
  if(id==='tasks')return {id,label:s.label,state:tasksDone?'complete':planDone?'available':'blocked',detail:tasksDone?'Task breakdown approved':planDone?'Define and link tasks':'Approve technical plan first'};
  if(id==='implement')return {id,label:s.label,state:tasksDone?'available':'blocked',detail:tasksDone?'An approved task can be handed to GitHub Actions. Codex needs an API key; no run is implied.':'Approve linked tasks to unlock the controlled agent handoff.'};
  return {id,label:s.label,state:'future',detail:'Code verification and release are not connected'};
 });
}
export function traceabilityGraph(spec:Specification|null,doc:PlanningDocument|null):TraceLink[]{
 if(!spec||!doc||doc.sourceIdea!==spec.sourceIdea)return [];
 const result:TraceLink[]=[];
 for(const task of doc.breakdown.tasks)for(const cid of task.criterionIds)result.push({requirementId:task.requirementId,taskId:task.id,criterionId:cid});
 return result;
}
export function requirementCoverage(spec:Specification,doc:PlanningDocument|null):{covered:number;total:number}{
 return {covered:spec.requirements.filter(r=>doc?.breakdown.tasks.some(t=>t.requirementId===r.id&&t.criterionIds.length>0)).length,total:spec.requirements.length};
}
export function localPlanningKey(spec:Specification,projectId?:string|null):string{
 const key=(projectId||'guest')+'|'+spec.sourceIdea;
 let hash=2166136261;
 for(let i=0;i<key.length;i++){hash^=key.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return 'visual-sdd-planning-v1-'+(hash>>>0).toString(36);
}
export function readPlanningDocument(raw:unknown):PlanningDocument|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as PlanningDocument;
 if(v.schemaVersion!==1||typeof v.sourceIdea!=='string'||v.sourceIdea.length>600||!Number.isSafeInteger(v.specRevision)||v.specRevision<1||typeof v.updatedAt!=='string'||!v.technical||!v.breakdown)return null;
 if(v.specBaseline!==undefined&&(!isValidBaseline(v.specBaseline)||v.specBaseline.revision!==v.specRevision||v.specBaseline.sourceIdea!==v.sourceIdea))return null;
 const t=v.technical,b=v.breakdown;
 if(typeof t.architecture!=='string'||t.architecture.length>5000||typeof t.risks!=='string'||t.risks.length>2500||typeof t.assumptions!=='string'||t.assumptions.length>2500||!Number.isSafeInteger(t.revision)||t.revision<1)return null;
 if(!Array.isArray(b.tasks)||b.tasks.length>60||!Number.isSafeInteger(b.revision)||b.revision<0||!Number.isSafeInteger(b.nextTaskNumber)||b.nextTaskNumber<1)return null;
 for(const x of b.tasks)if(!x||typeof x.id!=='string'||!/^TASK-\d{3,}$/.test(x.id)||typeof x.title!=='string'||x.title.length>800||typeof x.requirementId!=='string'||!Array.isArray(x.criterionIds)||x.criterionIds.length>12||!x.criterionIds.every(z=>typeof z==='string'))return null;
 const approvals=[{value:t.approval,revision:t.revision},{value:b.approval,revision:b.revision}];
 for(const {value,revision} of approvals){
  if(!value||!['draft','approved'].includes(value.status)||!(value.revision===null||Number.isSafeInteger(value.revision))||!(value.at===null||typeof value.at==='string'))return null;
  if(value.status==='approved'&&(value.revision!==revision||!value.at))return null;
 }
 return v;
}
export function planningMarkdown(spec:Specification,doc:PlanningDocument):string{
 const lines=['# '+spec.title+' — SDD Planning Artifact','','Specification: '+spec.id+' revision '+doc.specRevision,'Plan approval: '+doc.technical.approval.status,'Tasks approval: '+doc.breakdown.approval.status,'','## Proposed approach','',doc.technical.architecture,'','## Risks','',doc.technical.risks,'','## Assumptions','',doc.technical.assumptions||'Not specified','','## Linked implementation tasks',''];
 for(const t of doc.breakdown.tasks)lines.push('### '+t.id+' — '+t.title.replace(/[\r\n]/g,' '),'','Requirement: '+t.requirementId,'Acceptance links: '+t.criterionIds.map(x=>t.requirementId+'/'+x).join(', '),'');
 lines.push('---','Generated from user-editable planning and task definitions. No agents ran and no code was implemented, tested or released.','');
 return lines.join('\n');
}
