import type {Specification,Requirement,Criterion} from './spec-core.ts';
import type {PlanningDocument,LinkedTask} from './workflow-core.ts';
import {planIsCurrent,specIsApproved,technicalApproved,tasksApproved,validateTaskBreakdown} from './workflow-core.ts';

export type RunMode='validate_only'|'codex';
export type RunManifest={
 schemaVersion:1;kind:'visual-sdd-agent-run';repository:'alikhalessi/Visual-SDD-Canvas-GPT';
 mode:RunMode;runId:string;createdAt:string;
 product:{title:string;idea:string};
 approvals:{specRevision:number;specApprovedAt:string;planRevision:number;planApprovedAt:string;tasksRevision:number;tasksApprovedAt:string};
 technical:{architecture:string;risks:string;assumptions:string};
 requirement:{id:string;title:string;statement:string;priority:string;criteria:Criterion[]};
 task:{id:string;title:string;requirementId:string;criterionIds:string[]};
};
const MAX_BYTES=16000;
const UID=/^[a-zA-Z0-9-]{8,72}$/;
const taskPattern=/^TASK-\d{3,}$/;
const ISSUE_HEAD='<!-- visual-sdd-run:v1 -->';
const ISSUE_TAIL='<!-- /visual-sdd-run:v1 -->';
export function runGate(spec:Specification|null,plan:PlanningDocument|null):string[]{
 const issues:string[]=[];
 if(!specIsApproved(spec))issues.push('Approve the current Specification revision before requesting an agent run.');
 if(!planIsCurrent(spec,plan))issues.push('A technical Plan tied to this approved Specification revision is required.');
 if(!technicalApproved(plan))issues.push('Approve the current Technical Plan before running agents.');
 if(!tasksApproved(plan))issues.push('Approve the current Task Breakdown before running agents.');
 if(spec&&plan&&planIsCurrent(spec,plan)&&validateTaskBreakdown(spec,plan).length)issues.push('Linked tasks must pass structural validation.');
 return issues;
}
function copyRequirement(r:Requirement,task:LinkedTask){
 return {id:r.id,title:r.title,statement:r.statement,priority:r.priority,criteria:r.criteria.filter(c=>task.criterionIds.includes(c.id)).map(c=>({id:c.id,text:c.text}))};
}
export function makeRunManifest(
 spec:Specification|null,plan:PlanningDocument|null,taskId:string,mode:RunMode,runId:string,now=new Date().toISOString()
):RunManifest{
 const issues=runGate(spec,plan);
 if(issues.length||!spec||!plan)throw Error(issues.join(' ')||'Missing approved artifacts.');
 if(mode!=='validate_only'&&mode!=='codex')throw Error('Unknown execution mode.');
 if(!UID.test(runId))throw Error('Invalid run identifier.');
 const task=plan.breakdown.tasks.find(x=>x.id===taskId);
 if(!task||!taskPattern.test(task.id))throw Error('Select an approved task.');
 const requirement=spec.requirements.find(x=>x.id===task.requirementId);
 if(!requirement||!task.criterionIds.length)throw Error('Task needs a valid requirement with linked acceptance criteria.');
 if(!Number.isFinite(Date.parse(now)))throw Error('Invalid run timestamp.');
 const manifest:RunManifest={
  schemaVersion:1,kind:'visual-sdd-agent-run',repository:'alikhalessi/Visual-SDD-Canvas-GPT',
  mode,runId,createdAt:now,
  product:{title:spec.title,idea:spec.sourceIdea},
  approvals:{
   specRevision:spec.revision,specApprovedAt:spec.approval.approvedAt!,
   planRevision:plan.technical.revision,planApprovedAt:plan.technical.approval.at!,
   tasksRevision:plan.breakdown.revision,tasksApprovedAt:plan.breakdown.approval.at!
  },
  technical:{architecture:plan.technical.architecture,risks:plan.technical.risks,assumptions:plan.technical.assumptions},
  requirement:copyRequirement(requirement,task),
  task:{id:task.id,title:task.title,requirementId:task.requirementId,criterionIds:[...task.criterionIds]}
 };
 if(new TextEncoder().encode(JSON.stringify(manifest)).length>MAX_BYTES)throw Error('Run payload exceeds 16 KB. Shorten the selected task.');
 return manifest;
}
export function manifestIssueBody(manifest:RunManifest):string{
 const payload=JSON.stringify(manifest,null,2);
 const fence=String.fromCharCode(96).repeat(3);
 return [
  ISSUE_HEAD,'','This request was exported from Visual SDD. It is publicly visible in this repository.','',
  fence+'json',payload,fence,'',ISSUE_TAIL,'',
  'Execution requires an owner-created issue and GitHub Actions. A Codex run additionally requires a repository OPENAI_API_KEY secret.',
  'No agent result is accepted until the run produces its own GitHub Actions evidence. Never paste secrets into this issue.'
 ].join('\n');
}
export function manifestIssueUrl(manifest:RunManifest):string{
 const title='[Visual SDD Run] '+manifest.task.id+' — '+manifest.mode;
 return 'https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/issues/new?title='+encodeURIComponent(title);
}
export function describeRunManifest(manifest:RunManifest){
 return {task:manifest.task.id,criteria:manifest.requirement.criteria.length,mode:manifest.mode,approvedSpec:manifest.approvals.specRevision};
}
export function manifestMarkers(){return {head:ISSUE_HEAD,tail:ISSUE_TAIL};}
