'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import type {PlanningDocument} from '../lib/workflow-core';
import {planIsCurrent,technicalApproved,tasksApproved,localPlanningKey} from '../lib/workflow-core';
import {
 parsePublicPullUrl,parsePullFact,parsePullFiles,parseCheckRuns,createPullLink,readPullLinks,
 isPullLinkCurrent,linksToTraceEdges,linkHasVerifiedHead,traceMarkdown,
 type PublicPullEvidence,type TaskPullLink
} from '../lib/github-trace-core';

type Props={spec:Specification|null;plan:PlanningDocument|null;projectId:string|null;onReviewTasks:()=>void};
const API='https://api.github.com/repos/';
const API_HEADERS={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
async function fetchPublic(path:string):Promise<unknown>{
 const response=await fetch(API+path,{headers:API_HEADERS,cache:'no-store'});
 if(!response.ok){
  if(response.status===403||response.status===429)throw Error('GitHub public API rate limit or access restriction (HTTP '+response.status+'). Try again after the limit resets.');
  if(response.status===404)throw Error('Public GitHub resource not found. Private repositories are not supported in Sprint 06.');
  throw Error('GitHub API returned HTTP '+response.status+'.');
 }
 return response.json();
}
function download(filename:string,data:string,type:string){
 const u=URL.createObjectURL(new Blob([data],{type}));
 const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);
}
function prUrl(link:TaskPullLink){return 'https://github.com/'+link.repo+'/pull/'+link.number;}
export default function GithubTracePanel({spec,plan,projectId,onReviewTasks}:Props){
 const [input,setInput]=useState('');
 const [task,setTask]=useState('');
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [evidence,setEvidence]=useState<PublicPullEvidence|null>(null);
 const [links,setLinks]=useState<TaskPullLink[]>([]);
 const [loadedKey,setLoadedKey]=useState('');
 const [storageIssue,setStorageIssue]=useState('');
 const key=useMemo(()=>spec?localPlanningKey(spec,projectId)+'-github-links-v1':'',[spec?.sourceIdea,projectId]);
 const tasks=plan?.breakdown.tasks||[];
 const selectedTask=tasks.find(t=>t.id===task)||tasks[0]||null;
 const canLink=!!spec&&!!plan&&planIsCurrent(spec,plan)&&technicalApproved(plan)&&tasksApproved(plan);
 const edges=useMemo(()=>linksToTraceEdges(spec,plan,links),[spec,plan,links]);
 useEffect(()=>{
  if(!key){setLinks([]);setLoadedKey('');return;}
  try{const saved=localStorage.getItem(key);setLinks(saved?readPullLinks(JSON.parse(saved)):[]);setStorageIssue('');}
  catch{setLinks([]);setStorageIssue('Browser storage cannot restore your saved GitHub associations. No existing data was deleted.');}
  setLoadedKey(key);setEvidence(null);setInput('');setMessage('');
 },[key]);
 useEffect(()=>{
  if(!key||loadedKey!==key)return;
  try{localStorage.setItem(key,JSON.stringify(links));}
  catch{setStorageIssue('Browser storage failed. Export the associations before leaving this page.');}
 },[key,loadedKey,links]);
 async function inspect(url:string){
  const locator=parsePublicPullUrl(url);setError('');setMessage('');setEvidence(null);
  if(!locator){setError('Enter a canonical public GitHub pull request URL, e.g. https://github.com/owner/repo/pull/1');return;}
  setInput('https://github.com/'+locator.repo+'/pull/'+locator.number);
  setLoading(true);
  try{
   const raw=await fetchPublic(locator.repo+'/pulls/'+locator.number);
   const pull=parsePullFact(raw,locator);
   if(!pull)throw Error('GitHub returned unexpected PR metadata. Nothing was linked.');
   const responses=await Promise.allSettled([
    fetchPublic(locator.repo+'/pulls/'+locator.number+'/files?per_page=100'),
    fetchPublic(locator.repo+'/commits/'+pull.headSha+'/check-runs?per_page=100')
   ]);
   const fileResult=responses[0].status==='fulfilled'?parsePullFiles(responses[0].value,pull.changedFiles):{files:[],complete:false};
   const checkResult=responses[1].status==='fulfilled'?parseCheckRuns(responses[1].value,pull.headSha):parseCheckRuns(null,pull.headSha);
   setEvidence({pull,files:fileResult.files,filesComplete:fileResult.complete,checks:checkResult,checkedAt:new Date().toISOString()});
   setMessage('GitHub PR identity and head SHA verified. File/check results may be incomplete or unavailable; see their independent statuses.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to inspect GitHub.');}
  finally{setLoading(false);}
 }
 function attach(){
  if(!evidence||!selectedTask)return;
  try{
   const item=createPullLink(spec,plan,selectedTask.id,evidence);
   const existing=links.find(l=>l.taskId===item.taskId&&l.repo.toLowerCase()===item.repo.toLowerCase()&&l.number===item.number);
   if(existing&&existing.headSha!==item.headSha&&!window.confirm('The PR head SHA changed. Replace the old link with the newly verified commit? Previous code evidence will remain in any exported backup.'))return;
   if(!window.confirm('Link '+selectedTask.id+' to PR #'+item.number+'? This is your explicit association, not proof that the PR implements the requirement.'))return;
   setLinks(old=>[...old.filter(l=>!(l.taskId===item.taskId&&l.repo.toLowerCase()===item.repo.toLowerCase()&&l.number===item.number)),item].slice(-100));
   setMessage('Explicit task-to-PR association saved in this browser. GitHub check status must be refreshed independently.');
  }catch(e){setError(e instanceof Error?e.message:'Cannot link this PR.');}
 }
 function unlink(link:TaskPullLink){
  if(!window.confirm('Remove this local task-to-PR association? The GitHub PR remains unchanged.'))return;
  setLinks(old=>old.filter(x=>!(x.taskId===link.taskId&&x.repo===link.repo&&x.number===link.number&&x.linkedAt===link.linkedAt)));
  setMessage('Local association removed. GitHub content was not modified.');
 }
 return <section className="github-trace" aria-labelledby="github-trace-title">
  <div className="github-trace-intro"><div><span className="eyebrow">SPRINT 06 · GITHUB TRACEABILITY</span>
   <h3 id="github-trace-title">Connect approved tasks to real code evidence.</h3>
   <p>Attach a public GitHub Pull Request to a specific approved task. Inspect the actual PR head commit, changed files and GitHub check runs without inventing source-code dependencies.</p></div>
   <span className="github-trace-readonly">Read-only GitHub API</span></div>
  <div className="github-trace-metrics">
   <div><small>Recorded Task–PR links</small><strong>{links.length}</strong></div>
   <div><small>Revision-aligned links</small><strong>{edges.filter(e=>e.current).length}</strong></div>
   <div><small>Stale or unlinked</small><strong>{links.length-edges.filter(e=>e.current).length}</strong></div>
  </div>
  {!canLink&&<div className="github-trace-warning" role="status"><strong>Approval gate closed.</strong>
   <p>Current Specification, Plan and Task Breakdown approvals are required before creating any new code association. Existing links remain visible but are not automatically reapproved.</p>
   <button className="canvas-outline" onClick={onReviewTasks}>Review linked tasks →</button></div>}
  <div className="github-trace-form">
   <label><strong>Approved Task</strong><select value={selectedTask?.id||''} disabled={!canLink||loading} onChange={e=>setTask(e.target.value)}>
    {tasks.length?tasks.map(t=><option key={t.id} value={t.id}>{t.id} — {t.title}</option>):<option value="">No task definitions yet</option>}
   </select></label>
   <label><strong>Public GitHub Pull Request URL</strong><input type="url" value={input} maxLength={260} onChange={e=>{setInput(e.target.value);setEvidence(null);setError('');}} placeholder="https://github.com/owner/repo/pull/123" autoComplete="off" spellCheck={false}/></label>
   <div className="github-trace-buttons"><button className="canvas-outline" disabled={loading} onClick={()=>void inspect(input)}>{loading?'Checking GitHub…':'Inspect public PR'}</button>
    <button className="action" disabled={!canLink||!evidence||loading||!selectedTask} onClick={attach}>Link verified PR head to Task</button></div>
   <p>Only the PR URL is sent to GitHub. Specification text and Task descriptions are not uploaded. Links are stored in this browser, not in your cloud workspace.</p>
  </div>
  {error&&<p role="alert" className="github-trace-error">{error}</p>}
  {message&&<p role="status" className="github-trace-message">{message}</p>}
  {evidence&&<article className="github-trace-facts"><div className="github-trace-fact-head"><div><span className="eyebrow">VERIFIED GITHUB METADATA</span><h4>{evidence.pull.title}</h4><small>{evidence.pull.repo} · PR #{evidence.pull.number} · {evidence.pull.merged?'Merged':evidence.pull.state} · {evidence.pull.draft?'Draft':'Reviewable'}</small></div>
    <a href={evidence.pull.url} target="_blank" rel="noreferrer">Open PR ↗</a></div>
   <p className="github-trace-sha">Head commit: <code>{evidence.pull.headSha}</code></p>
   <div className="github-trace-fact-grid">
    <div><strong>Changed files — {evidence.pull.changedFiles}</strong><small>{evidence.filesComplete?'Complete first-page listing':'Incomplete or unavailable; do not infer all source changes'}</small>
     <ul>{evidence.files.slice(0,12).map((f,i)=><li key={f.path+i}><span>{f.status}</span><code>{f.path}</code></li>)}</ul>
     {evidence.pull.changedFiles>12&&<small>Showing only the first 12 filenames. GitHub may paginate beyond 100 files.</small>}
    </div>
    <div><strong>GitHub check runs</strong><small>Status: {evidence.checks.state.toUpperCase()} · {evidence.checks.passed}/{evidence.checks.total} successful check runs</small>
     {evidence.checks.total===0||!evidence.checks.complete?<p>Full check-run evidence is unavailable or missing. This is not a passing-test claim.</p>:null}
     <ul>{evidence.checks.checks.slice(0,12).map((c,i)=><li key={i}><span>{c.conclusion||c.status}</span>{c.url?<a href={c.url} target="_blank" rel="noreferrer">{c.name} ↗</a>:c.name}</li>)}</ul>
     <p>Even a successful GitHub check does not establish acceptance criteria, a release, or an executed AI agent.</p>
    </div>
   </div>
  </article>}
  <div className="github-trace-graph">
   <div className="github-trace-graph-head"><h4>Requirement → Criterion → Task → PR → Commit</h4><span>Human association + read-only provider facts</span></div>
   {!edges.length?<p className="github-trace-empty">No task-to-GitHub associations yet. Create an approved task, inspect a public PR, then explicitly link its current head.</p>:
    <div className="github-trace-rows">{edges.map((e,i)=>{
     const link=links.find(l=>l.taskId===e.taskId&&l.repo===e.repo&&l.number===e.number&&l.headSha===e.headSha);
     const matched=!!link&&linkHasVerifiedHead(link,evidence);
     const checksVerified=matched&&evidence?.checks.state==='passed';
     return <div className="github-trace-row" key={e.taskId+e.repo+e.number+e.headSha+i}>
      <div className="github-trace-path"><span><small>Requirement</small><b>{e.requirementId}</b></span><i>→</i><span><small>Criteria</small><b>{e.criterionIds.join(', ')||'Missing'}</b></span><i>→</i><span><small>Task</small><b>{e.taskId}</b></span><i>→</i><span><small>Pull Request</small><b>{e.repo} #{e.number}</b></span><i>→</i><span><small>PR head SHA</small><b>{e.headSha.slice(0,10)}</b></span></div>
      <div className="github-trace-row-footer"><span className={e.current?'github-trace-status-good':'github-trace-status-stale'}>{e.current?'Revision aligned':'Stale / review required'}</span>
       <span>{matched?'PR head independently refreshed':'Head not refreshed this session'} · {checksVerified?'All reported check runs passed':matched?'No complete passing check evidence':'Check status unknown'}</span>
       <button onClick={()=>void inspect(prUrl(link!))} disabled={loading}>Refresh GitHub</button>
       <button onClick={()=>unlink(link!)} className="github-trace-remove">Unlink</button></div>
     </div>;
    })}</div>}
  </div>
  <div className="github-trace-footer"><button className="canvas-outline" onClick={()=>download('visual-sdd-github-traceability.md',traceMarkdown(links,spec,plan),'text/markdown')}>↓ Export traceability (.md)</button>
    <button className="canvas-outline" onClick={()=>download('visual-sdd-github-links.json',JSON.stringify(links,null,2),'application/json')}>↓ Backup links (.json)</button></div>
  <p className="github-trace-disclaimer">Trust boundary: GitHub confirms PR metadata, changed file paths and check runs; a user explicitly associates a PR with a Task. No source-code semantic analysis, tested acceptance criteria, merge approval or deployment is inferred. Private repositories, pagination beyond 100 files/checks and cross-device link synchronization are not supported yet.</p>
  {storageIssue&&<p className="github-trace-error" role="alert">{storageIssue}</p>}
 </section>;
}
