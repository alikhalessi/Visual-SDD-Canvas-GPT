import type {Specification,Requirement} from './spec-core.ts';
import type {PlanningDocument,LinkedTask} from './workflow-core.ts';

/** Immutable snapshot of the approved specification when technical planning began. */
export type BaselineRequirement={
 id:string;title:string;statement:string;priority:Requirement['priority'];
 criteria:{id:string;text:string}[];
};
export type SpecificationBaseline={
 schemaVersion:1;revision:number;sourceIdea:string;
 title:string;goal:string;audience:string;exclusions:string;
 requirements:BaselineRequirement[];
};
export type ChangeKind='added'|'removed'|'modified'|'unchanged';
export type ChangeScope='product'|'requirement'|'criterion';
export type ImpactChange={
 key:string;scope:ChangeScope;kind:Exclude<ChangeKind,'unchanged'>;
 label:string;before:string|null;after:string|null;requirementId:string|null;criterionId:string|null;
 affectedTaskIds:string[];
};
export type ImpactAssessment={
 state:'no_plan'|'missing_baseline'|'current'|'changed';
 baselineRevision:number|null;currentRevision:number|null;
 changes:ImpactChange[];
 directTaskIds:string[];potentialTaskIds:string[];
 staleApprovalStages:('specify'|'plan'|'tasks'|'implement')[];
 summary:string;
};
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function snapshotSpecification(s:Specification):SpecificationBaseline{
 return {
  schemaVersion:1,revision:s.revision,sourceIdea:s.sourceIdea,title:s.title,goal:s.goal,
  audience:s.audience,exclusions:s.exclusions,
  requirements:s.requirements.map(r=>({id:r.id,title:r.title,statement:r.statement,
   priority:r.priority,criteria:r.criteria.map(c=>({id:c.id,text:c.text}))}))
 };
}
export function isValidBaseline(raw:unknown):raw is SpecificationBaseline{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const b=raw as SpecificationBaseline;
 if(b.schemaVersion!==1||!Number.isSafeInteger(b.revision)||b.revision<1)return false;
 if(typeof b.sourceIdea!=='string'||b.sourceIdea.length>600||typeof b.title!=='string'||b.title.length>120||typeof b.goal!=='string'||b.goal.length>2000||typeof b.audience!=='string'||b.audience.length>500||typeof b.exclusions!=='string'||b.exclusions.length>1000)return false;
 if(!Array.isArray(b.requirements)||b.requirements.length>30)return false;
 const ids=new Set<string>();
 for(const r of b.requirements){
  if(!r||typeof r!=='object'||typeof r.id!=='string'||!/^REQ-\d{3,}$/.test(r.id)||ids.has(r.id))return false;
  ids.add(r.id);
  if(typeof r.title!=='string'||r.title.length>160||typeof r.statement!=='string'||r.statement.length>2000||!['must','should','could'].includes(r.priority))return false;
  if(!Array.isArray(r.criteria)||r.criteria.length>12)return false;
  const cids=new Set<string>();
  for(const c of r.criteria){
   if(!c||typeof c.id!=='string'||!/^AC-\d{3,}$/.test(c.id)||cids.has(c.id)||typeof c.text!=='string'||c.text.length>1000)return false;
   cids.add(c.id);
  }
 }
 return true;
}
const sorted=(v:Iterable<string>)=>[...new Set(v)].sort();
export function assessChangeImpact(spec:Specification|null,plan:PlanningDocument|null):ImpactAssessment{
 if(!plan)return {state:'no_plan',baselineRevision:null,currentRevision:spec?.revision??null,changes:[],directTaskIds:[],potentialTaskIds:[],staleApprovalStages:[],summary:'Create an approved technical plan to establish a change baseline.'};
 const stale:ImpactAssessment['staleApprovalStages']=!spec||spec.revision!==plan.specRevision||spec.sourceIdea!==plan.sourceIdea||spec.approval.status!=='approved'
  ?['specify','plan','tasks','implement']:[];
 const allTaskIds=sorted(plan.breakdown.tasks.map(t=>t.id));
 const old=plan.specBaseline;
 if(!isValidBaseline(old)||old.revision!==plan.specRevision){
  return {state:'missing_baseline',baselineRevision:plan.specRevision,currentRevision:spec?.revision??null,changes:[],directTaskIds:[],potentialTaskIds:allTaskIds,staleApprovalStages:stale,
   summary:'This older plan has no verified specification snapshot. Exact changes cannot be reconstructed; review every task before reapproval.'};
 }
 if(!spec){
  return {state:'changed',baselineRevision:old.revision,currentRevision:null,changes:[{key:'spec:missing',scope:'product',kind:'removed',label:'Specification unavailable',before:old.title,after:null,requirementId:null,criterionId:null,affectedTaskIds:allTaskIds}],directTaskIds:allTaskIds,potentialTaskIds:allTaskIds,staleApprovalStages:stale,summary:'Specification is missing; all dependent work requires review.'};
 }
 const changes:ImpactChange[]=[];
 const add=(item:Omit<ImpactChange,'affectedTaskIds'>,matches:(t:LinkedTask)=>boolean)=>{
  const affectedTaskIds=sorted(plan.breakdown.tasks.filter(matches).map(t=>t.id));
  changes.push({...item,affectedTaskIds});
 };
 for(const field of ['title','goal','audience','exclusions','sourceIdea'] as const){
  if(old[field]!==spec[field])add({key:'product:'+field,scope:'product',kind:'modified',label:'Product '+field,before:old[field],after:spec[field],requirementId:null,criterionId:null},()=>true);
 }
 const oldMap=new Map(old.requirements.map(r=>[r.id,r]));
 const newMap=new Map(spec.requirements.map(r=>[r.id,r]));
 for(const id of sorted([...oldMap.keys(),...newMap.keys()])){
  const prev=oldMap.get(id),next=newMap.get(id);
  if(!prev&&next){add({key:id,scope:'requirement',kind:'added',label:id+' new requirement',before:null,after:next.title,requirementId:id,criterionId:null},t=>t.requirementId===id);continue;}
  if(prev&&!next){add({key:id,scope:'requirement',kind:'removed',label:id+' removed requirement',before:prev.title,after:null,requirementId:id,criterionId:null},t=>t.requirementId===id);continue;}
  if(!prev||!next)continue;
  if(!equal({title:prev.title,statement:prev.statement,priority:prev.priority},{title:next.title,statement:next.statement,priority:next.priority})){
   add({key:id,scope:'requirement',kind:'modified',label:id+' changed requirement',before:prev.title+' — '+prev.statement+' ['+prev.priority+']',after:next.title+' — '+next.statement+' ['+next.priority+']',requirementId:id,criterionId:null},t=>t.requirementId===id);
  }
  const oldCriteria=new Map(prev.criteria.map(c=>[c.id,c]));
  const newCriteria=new Map(next.criteria.map(c=>[c.id,c]));
  for(const cid of sorted([...oldCriteria.keys(),...newCriteria.keys()])){
   const a=oldCriteria.get(cid),b=newCriteria.get(cid);
   if(a?.text===b?.text)continue;
   const kind:ImpactChange['kind']=!a?'added':!b?'removed':'modified';
   add({key:id+'/'+cid,scope:'criterion',kind,label:id+' / '+cid+' '+kind+' criterion',before:a?.text??null,after:b?.text??null,requirementId:id,criterionId:cid},
    t=>t.requirementId===id&&t.criterionIds.includes(cid));
  }
 }
 const directTaskIds=sorted(changes.flatMap(x=>x.affectedTaskIds));
 const changedRequirements=new Set(changes.filter(x=>x.scope==='requirement').map(x=>x.requirementId));
 const nonLocalChange=changes.some(x=>x.scope==='product');
 // Approval is revision-wide: all tasks require review even if only some are directly linked.
 const potentialTaskIds=changes.length||stale.length?allTaskIds.filter(id=>!directTaskIds.includes(id)):allTaskIds.filter(id=>changedRequirements.size>0&&!directTaskIds.includes(id));
 const state:ImpactAssessment['state']=changes.length||stale.length?'changed':'current';
 const summary=state==='current'
  ?'No specification content difference from the planning baseline. Current approval and revision checks still apply.'
  :changes.length+' change(s) found, '+directTaskIds.length+' directly linked task(s), '+potentialTaskIds.length+' additional task(s) require impact review.';
 return {state,baselineRevision:old.revision,currentRevision:spec.revision,changes,directTaskIds,potentialTaskIds,staleApprovalStages:stale,summary};
}
export function impactMarkdown(report:ImpactAssessment):string{
 const lines=['# Visual SDD — Change Impact Assessment','',
  'Baseline revision: '+(report.baselineRevision??'none'),
  'Current revision: '+(report.currentRevision??'none'),
  'Assessment: '+report.state,'',
  report.summary,'',
  '## Changed artifacts',''];
 if(!report.changes.length)lines.push(report.state==='missing_baseline'?'Unknown; original specification snapshot was unavailable.':'No individual content changes identified.');
 for(const c of report.changes)lines.push('### '+c.label,'','- Change: '+c.kind,'- Previous: '+(c.before??'—').replace(/[\r\n]/g,' '),'- Current: '+(c.after??'—').replace(/[\r\n]/g,' '),'- Direct task links: '+(c.affectedTaskIds.join(', ')||'none'),'');
 lines.push('## Governance','',
  'Directly linked tasks: '+(report.directTaskIds.join(', ')||'none'),
  'Other tasks requiring review: '+(report.potentialTaskIds.join(', ')||'none'),
  'Stale gates: '+(report.staleApprovalStages.join(' -> ')||'none'),'',
  'This analysis is advisory: it never automatically transfers approval, executes an agent, or verifies implemented code.','');
 return lines.join('\n');
}
