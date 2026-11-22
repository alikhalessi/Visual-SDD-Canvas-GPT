'use client';
import HandoffModal from './handoff-modal';
import {useEffect,useMemo,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import VibeImportPanel from './vibe-import-panel';
import {localVibeHistoryKey,readVibeImportHistory,appendVibeImportHistory,type ImportResult} from '../lib/vibe-ingestor-core.ts';
import {updateRequirement} from '../lib/spec-core';
import {
 createStakeholderReview,rebaseStakeholderReview,readStakeholderReview,projectStakeholderRules,localStakeholderKey,
 addBusinessWorkflow,removeBusinessWorkflow,flagEdgeCondition,resolveEdgeCondition,
 proposeBehaviourExample,removeBehaviourExample,recordReviewRationale,approveBehaviourReview,
 type StakeholderReviewDocument,type RuleCard,type WorkflowKind,type EdgeCondition,type BehaviourExample
} from '../lib/stakeholder-view-core';

type Props={spec:Specification|null;idea:string;projectId:string|null;onSpecificationChange:(s:Specification)=>void;onCreateSpecification:()=>void;onOpenSpecification:()=>void;onImportedSourceIdea:(text:string)=>void;canImport:boolean};
function download(name:string,value:string){
 const url=URL.createObjectURL(new Blob([value],{type:'application/json;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function EdgeResolution({edge,examples,onResolve}:{edge:EdgeCondition;examples:BehaviourExample[];onResolve:(exampleId:string,note:string)=>void}){
 const [exampleId,setExampleId]=useState('');
 const [note,setNote]=useState('');
 return <div className="business-resolution"><label>Evidence example for {edge.id}<select value={exampleId} onChange={e=>setExampleId(e.target.value)}><option value="">Choose a relevant example</option>{examples.map(e=><option key={e.id} value={e.id}>{e.id}: {e.given.slice(0,65)}</option>)}</select></label>
  <label>Why does this example address the flagged path?<textarea maxLength={600} rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Explain the connection to the timing or state edge case."/></label>
  <button className="business-outline" disabled={!exampleId||note.trim().length<12} onClick={()=>onResolve(exampleId,note)}>Resolve with linked evidence</button>
 </div>;
}
function RuleEditor({card,spec,onWording,onChange,doc}:{card:RuleCard;spec:Specification;onWording:(statement:string)=>void;onChange:(value:StakeholderReviewDocument)=>void;doc:StakeholderReviewDocument}){
 const [wording,setWording]=useState(card.statement);
 const [workflow,setWorkflow]=useState('');
 const [kind,setKind]=useState<WorkflowKind>('interactive');
 const [edge,setEdge]=useState('');
 const [workflowId,setWorkflowId]=useState('');
 const [given,setGiven]=useState('');const [when,setWhen]=useState('');const [then,setThen]=useState('');
 const [rationale,setRationale]=useState(card.rationale);
 const [notice,setNotice]=useState('');
 useEffect(()=>setWording(card.statement),[card.statement]);
 useEffect(()=>setRationale(card.rationale),[card.rationale]);
 useEffect(()=>{if(!card.workflows.some(w=>w.id===workflowId))setWorkflowId(card.workflows[0]?.id??'');},[card.workflows,workflowId]);
 function apply(action:()=>StakeholderReviewDocument,success:string){
  try{onChange(action());setNotice(success);}catch(error){setNotice(error instanceof Error?error.message:'Could not save the review change.');}
 }
 return <section className="business-detail" aria-labelledby="business-detail-title">
  <header><span className="eyebrow">REVIEW THE BEHAVIOUR</span><h3 id="business-detail-title">{card.title||'Untitled business rule'}</h3><p>Review what must happen, consider delayed work and explain your decision. Changes reopen the relevant approvals.</p>
   <details className="business-reference"><summary>Reference details</summary><p>Rule {card.id} · Source revision {spec.revision}</p><ul>{card.workflows.map(w=><li key={w.id}>{w.id}: {w.label}</li>)}{card.examples.map(e=><li key={e.id}>{e.id}: example for {e.workflowId}</li>)}{card.edges.map(e=><li key={e.id}>{e.id}: {e.description}</li>)}</ul></details>
  </header>
  <div className="business-section">
   <h4>1. Business rule</h4>
   <label htmlFor="business-rule-wording">What must happen?</label>
   <textarea id="business-rule-wording" maxLength={2000} rows={3} value={wording} onChange={e=>setWording(e.target.value)}/>
   <button className="business-outline" disabled={wording===card.statement||wording.trim().length<15} onClick={()=>{onWording(wording);setNotice('Source business rule changed; source Specification approval and this review need renewal.');}}>Save rule wording</button>
   <details><summary>Source acceptance conditions ({card.sourceCriteria.length}) — not automatically reviewed</summary><ul>{card.sourceCriteria.map(c=><li key={c.id}><strong>{c.id}</strong>: {c.text||'Not written'}</li>)}</ul></details>
  </div>
  <div className="business-section">
   <h4>2. Affected workflows</h4>
   <p>Include what people see AND background activity such as queued messages, scheduled reports, or delayed access changes. Nothing is automatically assumed to exist.</p>
   {card.workflows.length===0&&<p className="business-muted">No workflow linked yet. This rule cannot be signed off.</p>}
   <div className="business-linked">{card.workflows.map(w=><div key={w.id} className="business-linked-row"><div><strong>{w.label}</strong><small>{w.kind==='interactive'?'User interaction':'Background / Scheduled / Queued'}</small></div><button className="business-link-danger" onClick={()=>{if(window.confirm('Remove this workflow and any examples linked to it?'))apply(()=>removeBusinessWorkflow(doc,card.id,w.id),'Workflow removed; linked examples removed by your confirmation.');}}>Remove</button></div>)}</div>
   <div className="business-form-row"><label>Workflow name<input maxLength={180} value={workflow} onChange={e=>setWorkflow(e.target.value)} placeholder="e.g. Weekly access report"/></label><label>Workflow type<select value={kind} onChange={e=>setKind(e.target.value as WorkflowKind)}><option value="interactive">Interactive / UI</option><option value="background">Background / Scheduled / Queued</option></select></label></div>
   <button className="business-outline" disabled={workflow.trim().length<3} onClick={()=>apply(()=>addBusinessWorkflow(doc,card.id,workflow,kind),'Affected workflow linked.')}>+ Link workflow</button>
  </div>
  <div className="business-section">
   <h4>3. Edge &amp; timing conditions</h4>
   <p>Flag behaviours that may occur after a delay, across state changes, or outside the main user journey. An open flag blocks sign-off. To resolve it, attach a relevant behavioural example and explain your reasoning; this is still human review, not a test result.</p>
   {card.edges.map(e=><div key={e.id} className="business-edge"><span><strong>{e.status==='open'?'Uncovered / needs review':'Reviewed by stakeholder'}</strong> · {e.description}</span>{e.status==='open'?<EdgeResolution edge={e} examples={card.examples} onResolve={(exampleId,note)=>apply(()=>resolveEdgeCondition(doc,card.id,e.id,exampleId,note),'Flag resolved with a linked example and explicit rationale; no test execution is implied.')}/>:<p className="business-muted">Linked evidence: {e.evidenceExampleId} · {e.reviewNote}</p>}</div>)}
   <label>Uncovered path / unusual timing<textarea maxLength={600} rows={2} value={edge} onChange={e=>setEdge(e.target.value)} placeholder="e.g. A queued email is sent after access is withdrawn"/></label>
   <button className="business-outline" disabled={edge.trim().length<8} onClick={()=>{apply(()=>flagEdgeCondition(doc,card.id,edge),'Uncovered path flagged; review approval blocked.');setEdge('');}}>Flag uncovered path</button>
  </div>
  <div className="business-section">
   <h4>4. Behavioural examples</h4>
   <p>Use a specific Given–When–Then scenario. Each affected workflow needs at least one attached example, but attached examples alone never equal a review approval.</p>
   {card.examples.map(e=><div className="business-example" key={e.id}><small>{card.workflows.find(w=>w.id===e.workflowId)?.label||'Linked workflow'}</small><p><strong>Given</strong> {e.given}</p><p><strong>When</strong> {e.when}</p><p><strong>Then</strong> {e.then}</p><button className="business-link-danger" onClick={()=>apply(()=>removeBehaviourExample(doc,card.id,e.id),'Example removed; review approval reset.')}>Remove example</button></div>)}
   <div className="business-fields"><label>Linked workflow<select value={workflowId} onChange={e=>setWorkflowId(e.target.value)} disabled={!card.workflows.length}><option value="">Choose a workflow</option>{card.workflows.map(w=><option value={w.id} key={w.id}>{w.label}</option>)}</select></label><label>Given<input maxLength={500} value={given} onChange={e=>setGiven(e.target.value)} placeholder="The coach’s access was revoked"/></label><label>When<input maxLength={500} value={when} onChange={e=>setWhen(e.target.value)} placeholder="The scheduled report job executes"/></label><label>Then<input maxLength={500} value={then} onChange={e=>setThen(e.target.value)} placeholder="The report excludes private athlete data"/></label></div>
   <button className="business-outline" disabled={!workflowId||[given,when,then].some(s=>s.trim().length<3)} onClick={()=>{apply(()=>proposeBehaviourExample(doc,card.id,workflowId,given,when,then),'Example attached, not yet approved.');setGiven('');setWhen('');setThen('');}}>+ Propose behavioural example</button>
  </div>
  <div className="business-section">
   <h4>5. Human decision &amp; rationale</h4>
   <label>Why is this behaviour acceptable (or what still needs work)?<textarea rows={3} maxLength={2000} value={rationale} onChange={e=>setRationale(e.target.value)} placeholder="Explain the decision, assumptions, and what you checked."/></label>
   <button className="business-outline" disabled={rationale===card.rationale} onClick={()=>apply(()=>recordReviewRationale(doc,card.id,rationale),'Rationale recorded; prior sign-off invalidated.')}>Save review rationale</button>
   {card.issues.length>0?<div className="business-issues"><strong>Before stakeholder sign-off:</strong><ul>{card.issues.map((x,i)=><li key={i}>{x}</li>)}</ul></div>:<p className="business-pass">All structural review gates are ready. Review the behaviour manually before approving.</p>}
   {card.coverage==='Behaviour Reviewed & Approved'?<p className="business-pass">Behaviour reviewed &amp; approved for source revision {spec.revision}. This is not software verification.</p>:<button className="business-primary" disabled={card.issues.length>0} onClick={()=>{if(window.confirm('Confirm that you personally reviewed this rule and its scenarios for Specification revision '+spec.revision+'?'))apply(()=>approveBehaviourReview(spec,doc,card.id),'Behaviour approved for this exact rule and Specification revision.');}}>Approve reviewed behaviour</button>}
  </div>
  {notice&&<p role="status" className="business-notice">{notice}</p>}
 </section>;
}
export default function BusinessReviewCanvas({spec,idea,projectId,onSpecificationChange,onCreateSpecification,onOpenSpecification,onImportedSourceIdea,canImport}:Props){
 const [document,setDocument]=useState<StakeholderReviewDocument|null>(null);
 const [loadedKey,setLoadedKey]=useState('');
 const [rawRecovery,setRawRecovery]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const [selected,setSelected]=useState<string|null>(null);
 const key=useMemo(()=>spec?localStakeholderKey(spec,projectId):'',[spec?.id,spec?.sourceIdea,projectId]);
 useEffect(()=>{
  if(!key||!spec){setDocument(null);setLoadedKey('');setRawRecovery(null);return;}
  try{
   const raw=localStorage.getItem(key);
   if(!raw){setDocument(createStakeholderReview(spec));setRawRecovery(null);setMessage('Review notes are stored in this browser until exported.');}
   else{
    if(raw.length>2000000)throw Error('Oversized stakeholder review cache');
    const candidate=readStakeholderReview(JSON.parse(raw));
    if(!candidate||candidate.specId!==spec.id||candidate.sourceIdea!==spec.sourceIdea){setDocument(null);setRawRecovery(raw);setMessage('Unrecognized review cache preserved. Download a backup before clearing it.');}
    else{setDocument(rebaseStakeholderReview(candidate,spec));setRawRecovery(null);setMessage('Existing stakeholder review restored from this browser.');}
   }
  }catch{
   setDocument(null);setRawRecovery('unavailable');setMessage('Review cache could not be read safely. It has not been overwritten.');
  }
  setLoadedKey(key);
 // Reload only when the document identity changes, not every specification revision.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 useEffect(()=>{
  if(spec&&document&&loadedKey===key&&document.specRevision!==spec.revision){
   setDocument(rebaseStakeholderReview(document,spec));setMessage('Specification changed: stakeholder approvals have been invalidated, notes preserved.');
  }
 },[spec,document,key,loadedKey]);
 useEffect(()=>{
  if(!key||loadedKey!==key||!spec||!document||document.specRevision!==spec.revision||rawRecovery!==null)return;
  try{localStorage.setItem(key,JSON.stringify(document));}catch{setMessage('Could not save stakeholder notes. Export them before closing the browser.');}
 },[key,loadedKey,spec,document,rawRecovery]);

 function commitVibeImport(result:ImportResult,brief:string){
  if(!canImport)throw Error('Recover the unreadable source Specification before importing.');
  if(rawRecovery!==null|| (spec&&(!document||loadedKey!==key||document.specRevision!==spec.revision)))throw Error('Current review is not safely loaded.');
  const nextKey=localStakeholderKey(result.spec,projectId);
  const sourceKey='visual-sdd-specification-v1';
  const historyKey=localVibeHistoryKey(result.spec,projectId);
  const originalSpec=localStorage.getItem(sourceKey),originalReview=localStorage.getItem(nextKey),originalHistory=localStorage.getItem(historyKey);
  let oldHistory=null;
  if(originalHistory!==null){
   try{oldHistory=readVibeImportHistory(JSON.parse(originalHistory));}catch{oldHistory=null;}
   if(!oldHistory)throw Error('Existing import provenance is unreadable. Export its raw backup before importing again.');
  }
  const nextHistory=appendVibeImportHistory(oldHistory,result.receipt);
  // Store review and append-only provenance before the source; rollback all three keys on write failure.
  try{
   localStorage.setItem(nextKey,JSON.stringify(result.review));
   localStorage.setItem(historyKey,JSON.stringify(nextHistory));
   localStorage.setItem(sourceKey,JSON.stringify(result.spec));
  }catch(error){
   try{
    if(originalReview===null)localStorage.removeItem(nextKey);else localStorage.setItem(nextKey,originalReview);
    if(originalHistory===null)localStorage.removeItem(historyKey);else localStorage.setItem(historyKey,originalHistory);
    if(originalSpec===null)localStorage.removeItem(sourceKey);else localStorage.setItem(sourceKey,originalSpec);
   }catch{throw Error('Import stopped. Storage rollback failed; export and inspect existing local data before continuing.');}
   throw Error('Import stopped because browser storage was unavailable. Existing records restored.');
  }
  setDocument(result.review);setLoadedKey(nextKey);setRawRecovery(null);
  if(!spec)onImportedSourceIdea(result.spec.sourceIdea||brief.slice(0,600));
  onSpecificationChange(result.spec);
  setSelected(result.addedRequirements[0]??null);
  setMessage('New unapproved specification revision saved with '+result.addedRequirements.length+' imported candidate rule(s). Linked review notes are browser-local, not cloud-synced.');
 }
 const ready=loadedKey===key&&!!spec&&!!document&&document.specRevision===spec.revision&&rawRecovery===null;
 const cards=spec?projectStakeholderRules(spec,ready?document:null):[];
 const active=cards.find(c=>c.id===selected)??cards[0];
 const signed=cards.filter(c=>c.coverage==='Behaviour Reviewed & Approved').length;
 const examples=cards.filter(c=>c.coverage==='Example Attached').length;
 const openQuestions=cards.reduce((total,c)=>total+c.edges.filter(e=>e.status==='open').length,0);
 function clearInvalid(){
  if(!key||rawRecovery===null||!spec||!window.confirm('Delete only the invalid stakeholder-review cache? Export the original first.'))return;
  try{localStorage.removeItem(key);setRawRecovery(null);setDocument(createStakeholderReview(spec));setMessage('Invalid review cache cleared with your confirmation.');}catch{setMessage('Storage could not be cleared. Original review cache remains.');}
 }
 return <section className="business-view" aria-labelledby="business-view-title">
  <header className="business-hero"><div><span className="eyebrow">SPRINT 08 · BUSINESS REVIEW</span><h1 id="business-view-title">Understand the rules.<br/><em>See what could be missed.</em></h1><p>Review how your product should behave, including the work people never see. The same source requirements remain available to engineers. Nothing is approved automatically.</p></div><span className="business-local">REVIEW NOTES: BROWSER ONLY</span></header>
  <VibeImportPanel spec={spec} key={projectId??'guest'} review={ready?document:null} reviewReady={canImport&&(!spec||ready)} onCommit={commitVibeImport}/>
  {!spec?<section className="business-empty"><h2>Start with your product idea</h2><p>{idea.trim()||'No idea has been saved yet.'}</p><p>Write the first specification to make its business rules visible here.</p><button className="business-primary" onClick={onCreateSpecification}>Start a specification</button></section>:
   <>
    <HandoffModal key={key} spec={spec} review={ready?document:null} projectId={projectId} reviewReady={canImport&&ready}/>
    <div className="business-summary"><div><strong>{cards.length}</strong><span>Business rules</span></div><div><strong>{examples}</strong><span>Example attached, review pending</span></div><div><strong>{signed}</strong><span>Behaviour reviewed &amp; approved</span></div><div><strong>r{spec.revision}</strong><span>Source specification revision</span></div></div>
    <div className="business-source"><div><strong>{spec.title}</strong><p>{spec.approval.status==='approved'?'Source approved':'Source draft — separate source approval pending'} · Review notes and edge flags are not cloud-synced.</p></div><button className="business-outline" onClick={onOpenSpecification}>Open source specification</button>
    <details className="business-exports"><summary>Details &amp; exports</summary><p>Specification {spec.id} · Source revision {spec.revision}</p><ul>{cards.map(c=><li key={c.id}>{c.id}: {c.title||'Untitled rule'}</li>)}</ul><div className="business-source-actions">{document&&ready&&<button className="business-outline" onClick={()=>download('stakeholder-review-r'+document.revision+'.json',JSON.stringify(document,null,2))}>Export review JSON</button>}{ready&&<button className="business-outline" onClick={()=>{
 const raw=localStorage.getItem(localVibeHistoryKey(spec,projectId));
 if(!raw){setMessage('No import provenance has been recorded for this project.');return;}
 let history=null;try{history=readVibeImportHistory(JSON.parse(raw));}catch{history=null;}
 download(history?'vibe-import-provenance.json':'vibe-import-raw-recovery.txt',history?JSON.stringify(history,null,2):raw);
 setMessage(history?'Import provenance exported. Keep it private and back it up.':'Unreadable import provenance exported without modification; recover it before importing again.');
 }}>Export import provenance</button>}</div></details></div>
    {ready&&openQuestions>0&&<p className="business-attention"><strong>{openQuestions} open question{openQuestions===1?'':'s'} need review.</strong> Resolve unanswered paths before approving the affected rule.</p>}
    {rawRecovery!==null&&<div className="business-recovery" role="alert"><strong>Stakeholder review recovery required</strong><p>The existing review cache will not be replaced automatically. Export the exact stored value, then choose whether to clear that single cache.</p><button className="business-outline" disabled={rawRecovery==='unavailable'} onClick={()=>download('stakeholder-cache-recovery.json',rawRecovery)}>Download original</button><button className="business-link-danger" onClick={clearInvalid}>Clear invalid review cache…</button></div>}
    {ready&&document&&<div className="business-layout"><div className="business-rule-list" aria-label="Business rules"><h2>Business rules and coverage</h2>{cards.map(c=><button key={c.id} className={'business-rule-card'+(active?.id===c.id?' selected':'')} aria-pressed={active?.id===c.id} onClick={()=>setSelected(c.id)}><span className="business-rule-top"><span className={'business-coverage '+(c.coverage==='Behaviour Reviewed & Approved'?'reviewed':c.coverage==='Example Attached'?'attached':'missing')}>{c.coverage}</span></span><strong>{c.title||'Untitled rule'}</strong><span className="business-rule-statement">{c.statement||'The business behaviour has not been written yet.'}</span><span className="business-rule-foot">{c.workflows.length} workflow(s) · {c.edges.filter(e=>e.status==='open').length} uncovered path(s) · {c.examples.length} example(s)</span></button>)}</div>
     {active&&<RuleEditor key={active.id} card={active} spec={spec} doc={document} onChange={setDocument} onWording={statement=>onSpecificationChange(updateRequirement(spec,active.id,{statement}))}/>}
    </div>}
    {cards.length===0&&<div className="business-empty"><p>No rules exist in this specification yet. Add them in the source specification.</p><button className="business-primary" onClick={onOpenSpecification}>Add business rules</button></div>}
   </>}
  {message&&<p role="status" className="business-notice">{message}</p>}
  <p className="business-disclaimer">Coverage here means stakeholder documentation and explicit human review — not test execution, code verification, GitHub approval, deployment, or proof that every unknown edge case has been found.</p>
 </section>;
}
