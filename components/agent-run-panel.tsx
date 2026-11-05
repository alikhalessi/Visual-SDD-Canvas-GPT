'use client';
import {useMemo,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import type {PlanningDocument} from '../lib/workflow-core';
import {runGate,makeRunManifest,manifestIssueBody,manifestIssueUrl,type RunManifest,type RunMode} from '../lib/agent-run-core';

type Props={spec:Specification|null;plan:PlanningDocument|null;onReviewPlan:()=>void};
function download(name:string,data:string){
 const url=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name;
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function AgentRunPanel({spec,plan,onReviewPlan}:Props){
 const [taskId,setTaskId]=useState('');
 const [mode,setMode]=useState<RunMode>('validate_only');
 const [consent,setConsent]=useState(false);
 const [manifest,setManifest]=useState<RunManifest|null>(null);
 const [message,setMessage]=useState('');
 const issues=useMemo(()=>runGate(spec,plan),[spec,plan]);
 const effectiveTask=plan?.breakdown.tasks.find(t=>t.id===taskId)||plan?.breakdown.tasks[0]||null;
 const manifestIsCurrent=manifest&&manifest.task.id===effectiveTask?.id&&manifest.mode===mode&&manifest.approvals.specRevision===spec?.revision&&manifest.approvals.planRevision===plan?.technical.revision&&manifest.approvals.tasksRevision===plan?.breakdown.revision&&issues.length===0;
 function prepare(){
  setMessage('');
  if(!spec||!plan||!effectiveTask||issues.length)return;
  if(!consent){setMessage('You must first authorize publication of the selected task context on public GitHub.');return;}
  try{
   const runId=typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():'run-'+String(Date.now());
   const next=makeRunManifest(spec,plan,effectiveTask.id,mode,runId);
   setManifest(next);setMessage('Review the prepared manifest below. Nothing has been submitted to GitHub yet.');
  }catch(e){setMessage(e instanceof Error?e.message:'The handoff could not be prepared.');}
 }
 async function copyBody(){
  if(!manifestIsCurrent||!manifest)return;
  try{await navigator.clipboard.writeText(manifestIssueBody(manifest));setMessage('Issue body copied. Open GitHub and paste it into the issue description.');}
  catch{setMessage('Clipboard access failed. Select and copy the issue body manually below.');}
 }
 function openIssue(){
  if(!manifestIsCurrent||!manifest)return;
  window.open(manifestIssueUrl(manifest),'_blank','noopener,noreferrer');
  setMessage('GitHub issue form opened. Paste the copied issue body and press Submit new issue. Merely opening the link does NOT start a run.');
 }
 return <div className="agent-control" aria-labelledby="agent-control-title">
  <div className="agent-control-head"><div><span className="eyebrow">SPRINT 03 · CONTROLLED EXECUTION HANDOFF</span><h4 id="agent-control-title">Prepare one bounded agent run</h4><p>Turn your approved Specification, Plan and one Task into a real GitHub Actions handoff. The run is never started just by preparing it.</p></div><span className="agent-run-state">Human approval required</span></div>
  <div className="agent-readiness">
   {[
    {text:'Approved specification at current revision',ok:!!spec&&spec.approval.status==='approved'&&spec.approval.approvedRevision===spec.revision},
    {text:'Approved technical plan',ok:!!plan&&plan.technical.approval.status==='approved'&&plan.technical.approval.revision===plan.technical.revision},
    {text:'Approved task breakdown',ok:!!plan&&plan.breakdown.approval.status==='approved'&&plan.breakdown.approval.revision===plan.breakdown.revision},
    {text:'Current artifacts and valid task traceability',ok:issues.length===0}
   ].map((item,i)=><div key={i} className={'agent-check '+(item.ok?'agent-ok':'agent-blocked')}><span aria-hidden="true">{item.ok?'✓':'○'}</span><span>{item.text}</span></div>)}
  </div>
  {issues.length>0?<div className="agent-gate-issues"><strong>Execution gate is closed.</strong><ul>{issues.map((x,i)=><li key={i}>{x}</li>)}</ul><button className="canvas-outline" onClick={onReviewPlan}>Review workflow gates</button></div>:
  <div className="agent-request-form">
   <label className="agent-label"><span>Approved task</span><select value={effectiveTask?.id||''} onChange={e=>{setTaskId(e.target.value);setManifest(null);setConsent(false);}}>{plan?.breakdown.tasks.map(t=><option key={t.id} value={t.id}>{t.id} — {t.title}</option>)}</select></label>
   <fieldset className="agent-modes"><legend>GitHub Actions request mode</legend>
    <label><input type="radio" name="agent-mode" checked={mode==='validate_only'} onChange={()=>{setMode('validate_only');setManifest(null);setConsent(false);}}/><span><strong>Validate the handoff</strong><small>Real remote validation and Spec Kit artifact generation. No AI calls, no code edits, no API costs.</small></span></label>
    <label><input type="radio" name="agent-mode" checked={mode==='codex'} onChange={()=>{setMode('codex');setManifest(null);setConsent(false);}}/><span><strong>Run Codex in a restricted workspace</strong><small>Requires a GitHub Actions OPENAI_API_KEY secret. Produces an isolated proposal and Pull Request; never merges or deploys.</small></span></label>
   </fieldset>
   <div className="agent-safety"><strong>Public repository — explicit disclosure</strong><p>The Visual SDD GitHub repository is public. This handoff includes your selected idea, technical approach, requirement and acceptance checks. Do not use it for confidential ideas, customer data, credentials or private intellectual property. Only the repository owner can trigger this workflow.</p>
    <label><input type="checkbox" checked={consent} onChange={e=>{setConsent(e.target.checked);setManifest(null);}}/><span>I reviewed the selected task and explicitly authorize publishing this context in a public GitHub issue.</span></label>
   </div>
   <button className="action agent-prepare" disabled={!consent} onClick={prepare}>Prepare reviewable run manifest →</button>
  </div>}
  {manifestIsCurrent&&manifest&&<div className="agent-manifest">
   <div className="agent-manifest-title"><div><strong>Prepared GitHub run · {manifest.task.id}</strong><small>{mode==='validate_only'?'Validation-only; no agent execution':'Codex requested; secret and GitHub approvals required'} · {manifest.runId}</small></div><span>NOT SUBMITTED</span></div>
   <p>Inspect the data before sharing it. First copy the issue body, then open GitHub and paste it into the new issue. You must press Submit on GitHub to initiate an Actions workflow.</p>
   <div className="agent-manifest-actions"><button className="canvas-outline" onClick={()=>download('visual-sdd-'+manifest.task.id+'-run.json',JSON.stringify(manifest,null,2))}>↓ Download JSON</button><button className="canvas-outline" onClick={()=>void copyBody()}>Copy issue body</button><button className="action" onClick={openIssue}>Open GitHub issue form ↗</button></div>
   <details><summary>Inspect the public GitHub issue body</summary><textarea readOnly rows={11} aria-label="GitHub issue manifest (copyable)" value={manifestIssueBody(manifest)} onFocus={e=>e.currentTarget.select()}/></details>
   <a href="https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/workflows/sdd-agent.yml" target="_blank" rel="noreferrer">Check GitHub Actions run history ↗</a>
  </div>}
  {message&&<p className="agent-message" role="status">{message}</p>}
  <div className="agent-trust-footer"><span>GitHub Actions adapter</span><b>Installed</b><span>Codex provider credential</span><b>Not verified</b><span>Automated merge / deployment</span><b>Disabled</b></div>
 </div>;
}
