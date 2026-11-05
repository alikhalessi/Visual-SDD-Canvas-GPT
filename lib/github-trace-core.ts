import type {Specification} from './spec-core.ts';
import type {PlanningDocument} from './workflow-core.ts';
import {planIsCurrent,technicalApproved,tasksApproved} from './workflow-core.ts';

export type PullLocator={repo:string;number:number};
export type PullFact={repo:string;number:number;url:string;title:string;headSha:string;state:'open'|'closed';draft:boolean;merged:boolean;changedFiles:number};
export type FileFact={path:string;status:string};
export type CheckFact={name:string;status:string;conclusion:string|null;url:string};
export type CheckSummary={state:'passed'|'failed'|'pending'|'unknown';total:number;passed:number;failed:number;pending:number;complete:boolean;checks:CheckFact[]};
export type PublicPullEvidence={pull:PullFact;files:FileFact[];filesComplete:boolean;checks:CheckSummary;checkedAt:string};
export type TaskPullLink={schemaVersion:1;repo:string;number:number;taskId:string;headSha:string;specRevision:number;planRevision:number;tasksRevision:number;linkedAt:string};
export type GitHubTraceEdge={requirementId:string;criterionIds:string[];taskId:string;repo:string;number:number;headSha:string;current:boolean};
const REPO=/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9_.-]{1,100}$/;
const SHA=/^[a-fA-F0-9]{40}$/;
const ID=/^TASK-\d{3,}$/;

export function parsePublicPullUrl(input:string):PullLocator|null{
 const value=input.trim();
 if(value.length>260)return null;
 let m=value.match(/^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/pull\/([1-9]\d{0,8})\/?$/);
 if(!m)m=value.match(/^([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)#([1-9]\d{0,8})$/);
 if(!m)return null;
 const repo=m[1]+'/'+m[2],number=Number(m[3]);
 return REPO.test(repo)&&!repo.includes('..')&&Number.isSafeInteger(number)&&number>=1&&number<=999999999?{repo,number}:null;
}
function obj(v:unknown):Record<string,unknown>|null{return v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null;}
function str(v:unknown,max=500):string|null{return typeof v==='string'&&v.length<=max?v:null;}
export function parsePullFact(raw:unknown,locator:PullLocator):PullFact|null{
 const p=obj(raw),head=obj(p?.head),baseRepo=obj(obj(p?.base)?.repo);
 if(!p||!head||!baseRepo)return null;
 const sha=str(head.sha,40),url=str(p.html_url,300),title=str(p.title,300),repo=str(baseRepo.full_name,150);
 if(p.number!==locator.number||!repo||repo.toLowerCase()!==locator.repo.toLowerCase()||
  !sha||!SHA.test(sha)||url!=='https://github.com/'+repo+'/pull/'+locator.number||title===null)return null;
 if(p.state!=='open'&&p.state!=='closed')return null;
 if(typeof p.draft!=='boolean'||!Number.isSafeInteger(p.changed_files)||Number(p.changed_files)<0||Number(p.changed_files)>20000)return null;
 return {repo,number:locator.number,url,title:title.slice(0,200),headSha:sha.toLowerCase(),
  state:p.state,draft:p.draft,merged:typeof p.merged_at==='string',changedFiles:Number(p.changed_files)};
}
const FILE_STATUS=new Set(['added','modified','removed','renamed','copied','changed','unchanged']);
export function parsePullFiles(raw:unknown,expectedCount:number):{files:FileFact[];complete:boolean}{
 if(!Array.isArray(raw))throw Error('GitHub returned an invalid changed-files response.');
 const files:FileFact[]=[];
 for(const row of raw.slice(0,100)){
  const f=obj(row),path=str(f?.filename,400),status=str(f?.status,30);
  if(path&&status&&FILE_STATUS.has(status))files.push({path,status});
 }
 return {files,complete:expectedCount<=100&&raw.length===expectedCount&&files.length===expectedCount};
}
export function parseCheckRuns(raw:unknown,expectedSha:string):CheckSummary{
 const o=obj(raw),runs=o?.check_runs;
 if(!o||!Number.isSafeInteger(o.total_count)||Number(o.total_count)<0||!Array.isArray(runs))return {state:'unknown',total:0,passed:0,failed:0,pending:0,complete:false,checks:[]};
 const checks:CheckFact[]=[];
 for(const item of runs.slice(0,100)){
  const x=obj(item),sha=str(x?.head_sha,40),name=str(x?.name,180);
  if(!x||!sha||sha.toLowerCase()!==expectedSha.toLowerCase()||!name)continue;
  const status=x.status==='completed'?'completed':x.status==='in_progress'?'in_progress':'queued';
  const conclusion=x.conclusion===null?null:str(x.conclusion,40);
  const url=str(x.html_url,400)||'';
  checks.push({name,status,conclusion,url:url.startsWith('https://github.com/')?url:''});
 }
 const total=Number(o.total_count),complete=total<=100&&checks.length===total;
 const failed=checks.filter(c=>c.status==='completed'&&!['success','skipped','neutral'].includes(c.conclusion||'')).length;
 const passed=checks.filter(c=>c.status==='completed'&&c.conclusion==='success').length;
 const pending=checks.filter(c=>c.status!=='completed').length;
 const state:CheckSummary['state']=failed?'failed':!complete||total===0?'unknown':pending?'pending':passed===total?'passed':'unknown';
 return {state,total,passed,failed,pending,complete,checks};
}
export function createPullLink(spec:Specification|null,plan:PlanningDocument|null,taskId:string,evidence:PublicPullEvidence,now=new Date().toISOString()):TaskPullLink{
 if(!spec||!plan||!planIsCurrent(spec,plan)||!technicalApproved(plan)||!tasksApproved(plan))throw Error('Current Specification, Plan and Tasks must be approved before linking code evidence.');
 if(!ID.test(taskId)||!plan.breakdown.tasks.some(t=>t.id===taskId))throw Error('Choose a current approved task.');
 const parsed=parsePublicPullUrl(evidence.pull.url);
 if(!parsed||parsed.repo.toLowerCase()!==evidence.pull.repo.toLowerCase()||parsed.number!==evidence.pull.number||!SHA.test(evidence.pull.headSha))throw Error('An independently verified public GitHub PR is required.');
 return {schemaVersion:1,repo:evidence.pull.repo,number:evidence.pull.number,taskId,headSha:evidence.pull.headSha,
  specRevision:spec.revision,planRevision:plan.technical.revision,tasksRevision:plan.breakdown.revision,linkedAt:now};
}
export function readPullLinks(raw:unknown):TaskPullLink[]{
 if(!Array.isArray(raw)||raw.length>100)return [];
 const output:TaskPullLink[]=[];
 for(const row of raw){
  const x=obj(row);
  if(!x||x.schemaVersion!==1||typeof x.repo!=='string'||!REPO.test(x.repo)||
   !Number.isSafeInteger(x.number)||Number(x.number)<1||Number(x.number)>999999999||
   typeof x.taskId!=='string'||!ID.test(x.taskId)||typeof x.headSha!=='string'||!SHA.test(x.headSha)||
   ![x.specRevision,x.planRevision,x.tasksRevision].every(n=>Number.isSafeInteger(n)&&Number(n)>=1)||
   typeof x.linkedAt!=='string'||!Number.isFinite(Date.parse(x.linkedAt)))continue;
  output.push(x as unknown as TaskPullLink);
 }
 return output;
}
export function isPullLinkCurrent(link:TaskPullLink,spec:Specification|null,plan:PlanningDocument|null):boolean{
 return !!spec&&!!plan&&planIsCurrent(spec,plan)&&technicalApproved(plan)&&tasksApproved(plan)&&
  link.specRevision===spec.revision&&link.planRevision===plan.technical.revision&&link.tasksRevision===plan.breakdown.revision&&plan.breakdown.tasks.some(t=>t.id===link.taskId);
}
export function linksToTraceEdges(spec:Specification|null,plan:PlanningDocument|null,links:TaskPullLink[]):GitHubTraceEdge[]{
 if(!plan)return [];
 return links.flatMap(link=>{const t=plan.breakdown.tasks.find(t=>t.id===link.taskId);
  return t?[{requirementId:t.requirementId,criterionIds:[...t.criterionIds],taskId:t.id,repo:link.repo,number:link.number,headSha:link.headSha,current:isPullLinkCurrent(link,spec,plan)}]:[];
 });
}
export function linkHasVerifiedHead(link:TaskPullLink,evidence:PublicPullEvidence|null):boolean{
 return !!evidence&&link.repo.toLowerCase()===evidence.pull.repo.toLowerCase()&&link.number===evidence.pull.number&&link.headSha===evidence.pull.headSha;
}
export function traceMarkdown(links:TaskPullLink[],spec:Specification|null,plan:PlanningDocument|null):string{
 const lines=['# Visual SDD — GitHub Traceability','','These are browser-local, human asserted Task → Pull Request associations.',
  'GitHub PR metadata and check results must be independently refreshed for current verification.',
  'A successful check does not prove user acceptance, deployment, or AI execution.','','## Associations',''];
 for(const edge of linksToTraceEdges(spec,plan,links))lines.push('- '+edge.requirementId+' / '+edge.criterionIds.join(', ')+' → '+edge.taskId+' → https://github.com/'+edge.repo+'/pull/'+edge.number+' → '+edge.headSha+(edge.current?' [revision-aligned]':' [stale — re-review required]'));
 if(!links.length)lines.push('No Task-to-GitHub associations recorded.');
 return lines.join('\n')+'\n';
}
