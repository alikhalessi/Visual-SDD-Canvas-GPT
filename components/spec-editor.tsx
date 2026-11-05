'use client';
import {useMemo,useState} from 'react';
import {type Specification,revise,addRequirement,removeRequirement,updateRequirement,addCriterion,removeCriterion,updateCriterion,validateSpecification,approveSpecification,toMarkdown} from '../lib/spec-core';

type Props={spec:Specification;onChange:(next:Specification)=>void;onBack:()=>void;onReset:()=>void};
function download(name:string,content:string,type:string){
 const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');
 link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function SpecEditor({spec,onChange,onBack,onReset}:Props){
 const [review,setReview]=useState(false);const [message,setMessage]=useState('');
 const issues=useMemo(()=>validateSpecification(spec),[spec]);const approved=spec.approval.status==='approved';
 const edit=(next:Specification)=>{onChange(next);setReview(false);setMessage('');};
 const approve=()=>{try{onChange(approveSpecification(spec));setReview(false);setMessage('Approved revision '+spec.revision+'. Any edit will reopen review.');}catch(e){setMessage(e instanceof Error?e.message:'Could not approve.');}};
 const exportFile=(format:'md'|'json')=>{
  const slug=spec.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,44)||'project';
  download(slug+'.spec.'+format,format==='md'?toMarkdown(spec):JSON.stringify(spec,null,2),format==='md'?'text/markdown;charset=utf-8':'application/json;charset=utf-8');
  setMessage('Exported '+(approved?'approved':'draft')+' revision '+spec.revision+'.');
 };
 return <section className="spec-workspace">
   <div className="spec-intro"><div><span className="eyebrow">SPRINT 01 · VISUAL SPECIFICATION</span><h2>Define the outcome.<br/><em>Approve the intent.</em></h2><p>A genuine, editable SDD specification connected to your original idea. This editor does not run AI agents or generate application code.</p></div><span className="spec-stage-badge">{approved?'✓ Approved specification':'● Human review required'}</span></div>
   <div className="spec-actions-bar"><button className="spec-quiet" onClick={onBack}>← Back to workspace</button><div className="spec-actions-right"><span className={'spec-status '+(approved?'spec-approved':'')}>{approved?'✓ Approved':'● Draft'} · r{spec.revision}</span><button className="spec-outline" onClick={()=>exportFile('md')}>↓ Export Markdown</button><button className="spec-outline" onClick={()=>exportFile('json')}>↓ JSON</button></div></div>
   <div className="spec-layout"><div className="spec-main">
    <article className="spec-box"><div className="spec-box-title"><span className="spec-index">01</span><div><span className="eyebrow">PRODUCT INTENT</span><h3>What success looks like</h3></div></div>
     <div className="spec-form-grid">
      <label className="spec-field spec-wide"><span>Product name · required</span><input value={spec.title} maxLength={120} placeholder="Product title" onChange={e=>edit(revise(spec,{title:e.target.value}))}/></label>
      <label className="spec-field spec-wide"><span>Measurable goal · required</span><textarea rows={3} value={spec.goal} maxLength={2000} placeholder="What meaningful outcome should users achieve?" onChange={e=>edit(revise(spec,{goal:e.target.value}))}/></label>
      <label className="spec-field"><span>Target audience · required</span><textarea rows={3} value={spec.audience} maxLength={500} placeholder="Who uses this product?" onChange={e=>edit(revise(spec,{audience:e.target.value}))}/></label>
      <label className="spec-field"><span>Out of scope · optional</span><textarea rows={3} value={spec.exclusions} maxLength={1000} placeholder="What is excluded from this version?" onChange={e=>edit(revise(spec,{exclusions:e.target.value}))}/></label>
     </div><div className="spec-source"><small>SOURCE IDEA · READ ONLY</small><p>{spec.sourceIdea}</p></div>
    </article>
    <article className="spec-box"><div className="spec-req-head"><div className="spec-box-title"><span className="spec-index">02</span><div><span className="eyebrow">REQUIREMENTS</span><h3>Expected behavior</h3></div></div><button className="spec-outline" disabled={spec.requirements.length>=30} onClick={()=>edit(addRequirement(spec))}>+ Add requirement</button></div>
     <p className="spec-help">Write what the product must do, then add observable acceptance conditions. This is a user-edited template, not AI-generated requirements.</p>
     <div className="req-stack">{spec.requirements.map((req,i)=><section key={req.id} className="req-card">
       <div className="req-head"><div><span className="req-number">{req.id}</span><span className="req-label">Requirement {i+1}</span></div><button className="spec-danger" onClick={()=>edit(removeRequirement(spec,req.id))}>Remove</button></div>
       <div className="spec-form-grid">
        <label className="spec-field spec-wide"><span>Requirement title</span><input maxLength={160} value={req.title} onChange={e=>edit(updateRequirement(spec,req.id,{title:e.target.value}))}/></label>
        <label className="spec-field spec-wide"><span>Behavior statement</span><textarea rows={3} maxLength={2000} value={req.statement} placeholder="The system must ... so that the user can ..." onChange={e=>edit(updateRequirement(spec,req.id,{statement:e.target.value}))}/></label>
        <label className="spec-field spec-priority"><span>Priority</span><select value={req.priority} onChange={e=>edit(updateRequirement(spec,req.id,{priority:e.target.value as 'must'|'should'|'could'}))}><option value="must">Must have</option><option value="should">Should have</option><option value="could">Could have</option></select></label>
       </div>
       <div className="criteria-head"><strong>Acceptance criteria</strong><button disabled={req.criteria.length>=12} className="spec-mini" onClick={()=>edit(addCriterion(spec,req.id))}>+ Add condition</button></div>
       <div className="criteria-stack">{req.criteria.map(c=><div key={c.id} className="criterion"><span>{c.id}</span><input aria-label={req.id+' '+c.id+' acceptance condition'} maxLength={1000} value={c.text} placeholder="Given ..., when ..., then ..." onChange={e=>edit(updateCriterion(spec,req.id,c.id,e.target.value))}/><button aria-label={'Remove '+c.id} className="spec-danger" onClick={()=>edit(removeCriterion(spec,req.id,c.id))}>×</button></div>)}</div>
      </section>)}</div>
    </article>
    <article className="spec-box"><div className="spec-box-title"><span className="spec-index">03</span><div><span className="eyebrow">HUMAN APPROVAL GATE</span><h3>Review & approve</h3></div></div><p className="spec-help">Approval records the exact revision. It never triggers AI execution. Editing an approved document automatically restores Draft status.</p>
     {issues.length?<div className="spec-checklist"><strong>{issues.length} validation issue{issues.length===1?'':'s'}</strong><ul>{issues.map((issue,i)=><li key={issue.field+i}>{issue.message}</li>)}</ul></div>:<div className="spec-pass">✓ Structural validation passed. Please verify the requirements are genuinely correct.</div>}
     {!approved&&issues.length===0&&review&&<div className="approval-confirm"><strong>Approve revision {spec.revision}?</strong><p>You approve this intent and these acceptance conditions. No agent runs and no code is published.</p><button className="action" onClick={approve}>Confirm approval ✓</button><button className="spec-quiet" onClick={()=>setReview(false)}>Cancel</button></div>}
     {approved?<div className="spec-approved-note">✓ Approved revision {spec.approval.approvedRevision}. Export the Markdown artifact to take it into an SDD workflow.</div>:<button className="action spec-approval-action" disabled={issues.length>0} onClick={()=>setReview(true)}>Review for approval →</button>}
     {message&&<p className="spec-message" role="status">{message}</p>}
    </article>
   </div><aside className="spec-sidebar"><div className="spec-side-card"><span className="eyebrow">DOCUMENT HEALTH</span><div className="spec-metric"><b>{spec.requirements.length}</b><span>Requirements</span></div><div className="spec-metric"><b>{spec.requirements.reduce((sum,r)=>sum+r.criteria.length,0)}</b><span>Acceptance checks</span></div><div className="spec-metric"><b>{issues.length}</b><span>Validation issues</span></div><div className="spec-side-divider"/><div className="spec-pair"><span>Artifact</span><b>{spec.id}</b></div><div className="spec-pair"><span>Revision</span><b>r{spec.revision}</b></div><div className="spec-pair"><span>Approval</span><b>{approved?'Approved':'Required'}</b></div><div className="spec-side-divider"/><p className="spec-side-note">Stored in this browser only. Export Markdown or JSON for backup. Cloud accounts and Git synchronization are not active.</p></div>
     <div className="spec-side-card"><span className="eyebrow">TRACEABILITY</span>{[['01','Original idea','Captured'],['02','Specification',approved?'Approved':'In review'],['03','Plan & tasks','Future sprint'],['04','Verified build','Not connected']].map((item,i)=><div key={item[0]} className={'spec-trace '+(i>1?'spec-muted':'')}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div></div>)}</div>
     <button className="spec-reset" onClick={onReset}>Start a new specification ↗</button>
   </aside></div>
  </section>;
}