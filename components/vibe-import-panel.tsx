'use client';
import {useState} from 'react';
import type {Specification} from '../lib/spec-core';
import type {StakeholderReviewDocument} from '../lib/stakeholder-view-core';
import {
 parseVibeBrief,defaultImportChoices,prepareVibeImport,retainedVibeRequirements,
 type VibeProposal,type ImportChoices,type ImportResult,type RuleChoice,type PathChoice
} from '../lib/vibe-ingestor-core';

type Props={spec:Specification|null;review:StakeholderReviewDocument|null;reviewReady:boolean;onCommit:(result:ImportResult,brief:string)=>void};
export default function VibeImportPanel({spec,review,reviewReady,onCommit}:Props){
 const [brief,setBrief]=useState('');
 const [proposal,setProposal]=useState<VibeProposal|null>(null);
 const [choices,setChoices]=useState<ImportChoices|null>(null);
 const [baseSnapshot,setBaseSnapshot]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 function clearPreview(){setProposal(null);setChoices(null);setBaseSnapshot('');setMessage('Brief changed. Preview again before importing.');}
 function preview(){
  try{
   const next=parseVibeBrief(brief);
   setProposal(next);setChoices(defaultImportChoices(next));setBaseSnapshot(JSON.stringify({spec,review}));
   setMessage(next.rules.length?'Candidates ready. None is selected or approved automatically.':'No importable rules found. Use sentences describing what users or systems must, should or can do.');
  }catch(e){setProposal(null);setChoices(null);setMessage(e instanceof Error?e.message:'Could not safely inspect the brief.');}
 }
 function rule(id:string,patch:Partial<RuleChoice>){
  setChoices(prev=>prev?{...prev,rules:prev.rules.map(r=>r.id===id?{...r,...patch}:r)}:prev);
 }
 function path(id:string,patch:Partial<PathChoice>){
  setChoices(prev=>prev?{...prev,paths:prev.paths.map(p=>p.id===id?{...p,...patch}:p)}:prev);
 }
 function commit(){
  if(!proposal||!choices||!reviewReady||busy)return;
  if(JSON.stringify({spec,review})!==baseSnapshot){setMessage('The Specification or review changed since preview. Preview again before importing.');return;}
  try{
   setBusy(true);
   const result=prepareVibeImport(spec,review,proposal,choices);
   if(!window.confirm('Import '+result.addedRequirements.length+' candidate rule(s), '+result.linkedWorkflows.length+' explicit interactive link(s), and '+result.openedEdges.length+' OPEN edge flag(s)? All source and stakeholder approvals will be draft. No software behavior has been verified.'))return;
   onCommit(result,proposal.brief);
   setProposal(null);setChoices(null);setBrief('');setBaseSnapshot('');
   setMessage('Candidate rules imported as unapproved drafts. Complete acceptance criteria and review all potential background paths.');
  }catch(e){setMessage(e instanceof Error?e.message:'Import aborted; previous records preserved.');}
  finally{setBusy(false);}
 }
 const selected=choices?.rules.filter(c=>c.include).length??0;
 const retained=retainedVibeRequirements(spec);
 return <section className="vibe-import" aria-labelledby="vibe-title">
  <details>
   <summary id="vibe-title"><strong>Import a prototype or feature brief</strong><span>SPRINT 09 · Proposed behavior, never automatic approval</span></summary>
   <div className="vibe-content">
    <p>Paste a written description of a prototype. This offline tool proposes rules and possible unseen workflows. It does not crawl a URL, run AI, inspect source code or prove that a behavior exists. The original evidence remains visible.</p>
    {!reviewReady&&<p role="alert" className="vibe-warning">Resolve the saved review's recovery issue before importing. Existing data will not be overwritten.</p>}
    <label htmlFor="vibe-brief">Prototype behavior / feature brief</label>
    <textarea id="vibe-brief" value={brief} maxLength={8000} rows={6} onChange={e=>{setBrief(e.target.value);if(proposal)clearPreview();}} placeholder="The athlete must be able to revoke coach access. A weekly report may be queued for delivery after access is revoked."/>
    <div className="vibe-actions"><small>{brief.length} / 8000 characters · processed locally in this browser</small><button type="button" className="business-outline" disabled={brief.trim().length<12||!reviewReady} onClick={preview}>Preview candidates</button></div>
    {proposal&&choices&&<div className="vibe-preview">
     <h3>Proposed rules — human selection required</h3>
     {proposal.rules.length===0&&<p>No candidate rules found. Nothing can be committed.</p>}
     {proposal.rules.map(p=>{const choice=choices.rules.find(c=>c.id===p.id)!;return <div className="vibe-candidate" key={p.id}>
      <label className="vibe-choice"><input type="checkbox" checked={choice.include} onChange={e=>rule(p.id,{include:e.target.checked})}/><strong>{p.id} · Import this rule</strong></label>
      <div className="vibe-source"><strong>Source quote ({p.source.start}–{p.source.end})</strong><blockquote>{p.source.quote}</blockquote><small>Evidence: {p.confidence==='explicit'?'explicit wording':'review required'}; still only a candidate</small></div>
      <label>Rule title<input maxLength={160} value={choice.title} onChange={e=>rule(p.id,{title:e.target.value})}/></label>
      <label>Proposed rule statement<textarea maxLength={2000} rows={2} value={choice.statement} onChange={e=>rule(p.id,{statement:e.target.value})}/></label>
      <label>Priority<select value={choice.priority} onChange={e=>rule(p.id,{priority:e.target.value as RuleChoice['priority']})}><option value="must">Must</option><option value="should">Should</option><option value="could">Could</option></select></label>
      <label className="vibe-choice"><input type="checkbox" checked={choice.linkInteractive} onChange={e=>rule(p.id,{linkInteractive:e.target.checked})}/><span>Explicitly link a proposed user-facing workflow (not yet approved)</span></label>
     </div>;})}
     <h3>Potentially missed paths — these are questions, not facts</h3>
     {proposal.paths.length===0&&<p>No heuristically detected path. Absence of suggestions does not mean complete coverage.</p>}
     {proposal.paths.map(p=>{const c=choices.paths.find(x=>x.id===p.id)!;return <div className="vibe-path" key={p.id}>
      <label className="vibe-choice"><input type="checkbox" checked={c.include} onChange={e=>path(p.id,{include:e.target.checked})}/><span><strong>{p.id} · {p.kind==='background'?'Potential background/timing path':'Potential UI path'}</strong><small>{p.reason} Linked to {p.ruleId}. If selected, it becomes an OPEN review flag, not a confirmed workflow.</small></span></label>
      <label>Proposed path to investigate<input maxLength={420} value={c.description} onChange={e=>path(p.id,{description:e.target.value})}/></label>
     </div>;})}
     <h3>Blind spots and missing evidence</h3><ul>{proposal.blindSpots.map(s=><li key={s}>{s}</li>)}</ul>
     <div className="vibe-diff" role="note" aria-label="Import change summary"><strong>Changes if confirmed</strong><p>Current source: {spec?'revision '+spec.revision:'no Specification'} → draft revision {spec?spec.revision+1:2}.</p><p>Existing requirements retained: {retained.total}. With rule text: {retained.withStatements}. Empty placeholders retained: {retained.emptyIds.length}{retained.emptyIds.length?' ('+retained.emptyIds.join(', ')+')':''}.</p><p>New rules: {selected}. Total requirements after import: {retained.total+selected}. Potential paths becoming OPEN flags: {choices.paths.filter(x=>x.include).length}. Interactive links: {choices.rules.filter(x=>x.include&&x.linkInteractive).length}. No approval or cloud save is implied.</p></div>
     <p className="vibe-warning">Acceptance conditions are left blank for human specification editing. Import changes the source revision and clears earlier approvals. Nothing is committed until you confirm.</p>
     <div className="vibe-actions"><span>{selected} selected rule(s)</span><button type="button" className="business-primary" disabled={selected===0||!reviewReady||busy} onClick={commit}>Review changes &amp; commit draft</button></div>
    </div>}
    {message&&<p role="status" className="vibe-message">{message}</p>}
   </div>
  </details>
 </section>;
}
