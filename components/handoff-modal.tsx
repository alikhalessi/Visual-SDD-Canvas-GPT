'use client';
import {useEffect,useRef,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import {localStakeholderKey,readStakeholderReview,type StakeholderReviewDocument} from '../lib/stakeholder-view-core';
import {localPlanningKey,readPlanningDocument,type PlanningDocument} from '../lib/workflow-core';
import {canonicalJSON,canonicalSnapshot,compileAgentHandoff,emptyHandoffHistory,readHandoffHistory,recordHandoffDecision,readinessIssues,verifyInformationParity,translateHandoffToLegacy,localHandoffHistoryKey,type HandoffHistory,type HandoffDecision} from '../lib/agent-handoff-core';
import {describeBusinessImpact} from '../lib/business-impact-core';

type Props={spec:Specification;review:StakeholderReviewDocument|null;projectId:string|null;reviewReady:boolean};
type Bundle=Awaited<ReturnType<typeof compileAgentHandoff>>;
function download(name:string,value:string,mime='application/json'){
 const url=URL.createObjectURL(new Blob([value],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function HandoffModal({spec,review,projectId,reviewReady}:Props){
 const [open,setOpen]=useState(false),[history,setHistory]=useState<HandoffHistory|null>(null),[bundle,setBundle]=useState<Bundle|null>(null);
 const [plan,setPlan]=useState<PlanningDocument|null>(null),[rawRecovery,setRawRecovery]=useState<string|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [actor,setActor]=useState(''),[rationale,setRationale]=useState(''),[decision,setDecision]=useState<HandoffDecision['decision']>('changes_requested'),[confirmed,setConfirmed]=useState(false),[taskId,setTaskId]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),storedHistory=useRef<string|null>(null);
 const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
 const latest=useRef({spec,review,history});latest.current={spec,review,history};
 const key=localHandoffHistoryKey(spec,projectId),sourceFingerprint=JSON.stringify([spec,review]);
 useEffect(()=>{
  if(!open)return;
  dialog.current?.showModal();
  return ()=>{dialog.current?.close();trigger.current?.focus();};
 },[open]);
 useEffect(()=>{
  if(!open)return;
  setHistory(null);setBundle(null);setRawRecovery(null);setError('');setNotice('');setConfirmed(false);
  try{
   const raw=localStorage.getItem(key);storedHistory.current=raw;
   const value=raw===null?emptyHandoffHistory():raw.length<=500000?readHandoffHistory(JSON.parse(raw)):null;
   if(!value){setRawRecovery(raw??'');setError('Sign-off history is unreadable. Original data is preserved; export a recovery copy.');return;}
   setHistory(value);
  }catch{setRawRecovery(storedHistory.current);setError('Sign-off history could not be read. No stored record was changed.');}
  try{const raw=localStorage.getItem(localPlanningKey(spec,projectId));setPlan(raw?readPlanningDocument(JSON.parse(raw)):null);}catch{setPlan(null);}
 // Identity changes reload the sidecar; revision changes retain its history.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[open,key]);
 useEffect(()=>{
  if(!open||!history||!reviewReady){setBundle(null);return;}
  let cancelled=false;setBundle(null);setConfirmed(false);
  void compileAgentHandoff(spec,review,history).then(result=>{if(!cancelled)setBundle(result);}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Handoff validation failed.');});
  return ()=>{cancelled=true;};
 // The fingerprint captures every source/review fact without depending on reference churn.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[open,sourceFingerprint,history,reviewReady]);
 function fresh(){
  if(!mounted.current)throw Error('The handoff view is no longer current.');
  if(!history||!reviewReady)throw Error('Current source and review must be safely loaded.');
  const rawSource=localStorage.getItem('visual-sdd-specification-v1'),rawReview=localStorage.getItem(localStakeholderKey(spec,projectId));
  const savedSource=rawSource?JSON.parse(rawSource):null,savedReview=rawReview?readStakeholderReview(JSON.parse(rawReview)):null;
  if(canonicalJSON(canonicalSnapshot(savedSource,savedReview))!==canonicalJSON(canonicalSnapshot(latest.current.spec,latest.current.review))||localStorage.getItem(key)!==storedHistory.current)throw Error('Source, review or sign-off history changed in this browser. Close and reopen the handoff before continuing.');
 }
 async function checkedBundle(){
  fresh();if(!bundle||!history)throw Error('Wait for current parity verification.');
  const before=canonicalJSON(latest.current),result=await verifyInformationParity(canonicalSnapshot(spec,review),history,bundle.business,bundle.markdown,bundle.manifest);
  fresh();if(before!==canonicalJSON(latest.current)||!result.passed)throw Error('Handoff changed or failed information parity. Export stopped.');
  return bundle;
 }
 async function exportFile(kind:'markdown'|'json'|'legacy'){
  setBusy(true);setError('');setNotice('');
  try{
   const current=await checkedBundle();
   if(kind==='legacy'){
    if(!history)throw Error('Review history unavailable.');
    const rawPlan=localStorage.getItem(localPlanningKey(spec,projectId));
    const currentPlan=rawPlan?readPlanningDocument(JSON.parse(rawPlan)):null;
    if(canonicalJSON(currentPlan)!==canonicalJSON(plan))throw Error('The planning document changed. Reopen this handoff before exporting a bridge.');
    const bridged=await translateHandoffToLegacy(current,spec,review,history,plan,taskId,crypto.randomUUID(),new Date().toISOString());fresh();
    const after=localStorage.getItem(localPlanningKey(spec,projectId));
    if(after!==rawPlan)throw Error('The planning document changed while validating the bridge.');
    download('legacy-validation-bridge.json',JSON.stringify(bridged,null,2));
    setNotice('Validation-only bridge exported with companion digest. Keep the full bundle with it. No runner was dispatched.');
   }else{
    download(kind==='markdown'?'AGENT_SPEC.md':'spec.manifest.json',kind==='markdown'?current.markdown:current.json,kind==='markdown'?'text/markdown;charset=utf-8':'application/json');
    setNotice((current.manifest.readiness.canImplement?'Reviewed':'Draft / blocked')+' handoff exported after current parity verification. No execution was authorized.');
   }
  }catch(e){setError(e instanceof Error?e.message:'Export failed.');}finally{setBusy(false);}
 }
 async function saveDecision(){
  setBusy(true);setError('');setNotice('');
  try{
   fresh();if(!history)throw Error('Review history unavailable.');
   if(decision==='approved'&&!confirmed)throw Error('Explicitly confirm review of this complete snapshot.');
   const before=canonicalJSON(latest.current),next=await recordHandoffDecision(canonicalSnapshot(spec,review),history,actor,rationale,decision,new Date().toISOString());
   fresh();if(before!==canonicalJSON(latest.current))throw Error('Source changed while recording the decision.');
   const raw=JSON.stringify(next);localStorage.setItem(key,raw);storedHistory.current=raw;setHistory(next);setConfirmed(false);
   setNotice('Local reviewer assertion recorded for this exact snapshot. History preserved; no authenticated signature or execution permission is implied.');
  }catch(e){setError(e instanceof Error?e.message:'Decision could not be saved.');}finally{setBusy(false);}
 }
 const impact=describeBusinessImpact(spec,review,plan),approvalIssues=bundle?readinessIssues(bundle.manifest.canonical):['Wait for snapshot validation.'];
 return <section className="handoff-entry" aria-label="Impact and agent handoff">
  <div><strong>Understand change before handing it over.</strong><p>Keep rules, examples, open questions and review decisions together in a version-bound export.</p></div>
  <button ref={trigger} className="business-outline" disabled={!reviewReady} onClick={()=>setOpen(true)}>Review impact &amp; agent handoff</button>
  {open&&<dialog ref={dialog} className="handoff-dialog" aria-labelledby="handoff-title" onCancel={()=>setOpen(false)}>
   <div className="handoff-heading"><div><span className="eyebrow">SPRINT 10 · REVIEW AND HANDOFF</span><h2 id="handoff-title">Review impact and preserve the meaning.</h2></div><button className="business-outline" onClick={()=>setOpen(false)} aria-label="Close handoff review">Close</button></div>
   <p>Exports are specification data. They never run an agent. Reviewer names and decisions are local assertions, not authenticated signatures.</p>
   <h3>What needs attention?</h3>
   {impact.findings.length?<ul className="handoff-findings">{impact.findings.map(f=><li key={f.key}><strong>{f.certainty==='unknown'?'Uncertainty: ':'Recorded: '}</strong>{f.message}</li>)}</ul>:<p>No source differences from the verified planning baseline. Current review and approval gates still apply.</p>}
   {bundle&&<>
    <p className="handoff-result"><strong>Information parity: {bundle.parity.passed?'passed':'blocked'}</strong> · Handoff sign-off: {bundle.manifest.signOff.status} · {bundle.manifest.readiness.canImplement?'Review gates current':'Draft only / implementation blocked'}</p>
    <h3>Business information included in the handoff</h3>
    <p><strong>{bundle.business.snapshot.source.title}</strong> · Source revision {spec.revision} · Review revision {review?.revision??'missing'}</p>
    <p>{bundle.business.snapshot.source.goal||'Product goal not specified.'}</p>
    {bundle.business.cards.map(card=><article className="handoff-rule" key={card.id}><h4>{card.id} · {card.title||'Untitled rule'}</h4><p>{card.statement||'Behaviour not specified.'}</p><p>{card.coverage} · {card.workflows.length} workflow(s) · {card.edges.filter(e=>e.status==='open').length} open question(s)</p>
     <ul>{card.sourceCriteria.map(c=><li key={c.id}>{c.id}: {c.text||'Acceptance condition not specified.'}</li>)}{card.workflows.map(w=><li key={w.id}>{w.id}: {w.label} ({w.kind})</li>)}{card.edges.map(e=><li key={e.id}>{e.id}: {e.description} — {e.status}{e.reviewNote?' · '+e.reviewNote:''}</li>)}{card.examples.map(e=><li key={e.id}>{e.id} → {e.workflowId}: Given {e.given}; When {e.when}; Then {e.then}</li>)}</ul><p>Rationale: {card.rationale||'Not recorded.'}</p></article>)}
    {!!bundle.business.archivedRequirementIds.length&&<p>Archived review records retained: {bundle.business.archivedRequirementIds.join(', ')}</p>}
    <details><summary>Read the complete structured specification</summary><pre className="handoff-text">{bundle.markdown}</pre></details>
    <h3>Record a decision about this complete snapshot</h3>
    {approvalIssues.length>0&&<div className="handoff-issues"><p>Approval remains blocked until these items are resolved. Draft exports preserve them.</p><ul>{approvalIssues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></div>}
    <div className="handoff-fields"><label>Reviewer name<input value={actor} maxLength={120} onChange={e=>setActor(e.target.value)}/></label><label>Decision<select value={decision} onChange={e=>{setDecision(e.target.value as HandoffDecision['decision']);setConfirmed(false);}}><option value="changes_requested">Changes requested</option><option value="approved">Approve this snapshot</option></select></label></div>
    <label className="handoff-rationale">Decision rationale<textarea value={rationale} maxLength={2000} onChange={e=>setRationale(e.target.value)}/></label>
    {decision==='approved'&&<label className="handoff-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I reviewed all rules, examples and timing questions in this complete snapshot.</label>}
    <button className="business-primary" disabled={busy||actor.trim().length<2||rationale.trim().length<12||decision==='approved'&&(approvalIssues.length>0||!confirmed)} onClick={()=>void saveDecision()}>Record snapshot decision</button>
    <details><summary>Decision history ({history?.records.length??0})</summary><ul>{history?.records.map(r=><li key={r.id}>{r.id}: {r.actor.label} · {r.decision} · {r.at} · {r.digest===bundle.manifest.digest?'matching snapshot':'superseded snapshot'}<p>{r.rationale}</p></li>)}</ul></details>
    <div className="handoff-actions"><button className="business-outline" disabled={busy||!bundle.parity.passed} onClick={()=>void exportFile('markdown')}>{bundle.manifest.readiness.canImplement?'Export agent spec':'Export draft agent spec'}</button><button className="business-outline" disabled={busy||!bundle.parity.passed} onClick={()=>void exportFile('json')}>{bundle.manifest.readiness.canImplement?'Export manifest':'Export draft manifest'}</button></div>
    <details><summary>Legacy runner compatibility</summary><p>This bridge validates one approved task only. Keep the complete exported bundle with it; legacy records cannot express all workflows, examples or timing decisions. No execution or public issue is created.</p><label>Approved task<select value={taskId} onChange={e=>setTaskId(e.target.value)}><option value="">Choose a task</option>{plan?.breakdown.tasks.map(t=><option key={t.id} value={t.id}>{t.id} · {t.title}</option>)}</select></label><button className="business-outline" disabled={busy||!taskId||!bundle.manifest.readiness.canImplement} onClick={()=>void exportFile('legacy')}>Export validation-only bridge</button></details>
   </>}
   {rawRecovery!==null&&<button className="business-outline" onClick={()=>download('handoff-history-recovery.txt',rawRecovery,'text/plain')}>Export original sign-off history</button>}
   {error&&<p role="alert" className="handoff-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </dialog>}
 </section>;
}
