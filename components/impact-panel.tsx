'use client';
import {useMemo,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import type {PlanningDocument} from '../lib/workflow-core';
import {assessChangeImpact,impactMarkdown,type ImpactChange} from '../lib/impact-core';

type Props={spec:Specification|null;plan:PlanningDocument|null;onOpenSpec:()=>void;onOpenPlan:()=>void};
type Filter='all'|'requirements'|'criteria'|'product';
function downloadReport(markdown:string){
 const blob=new Blob([markdown],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='visual-sdd-change-impact.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function ImpactPanel({spec,plan,onOpenSpec,onOpenPlan}:Props){
 const analysis=useMemo(()=>assessChangeImpact(spec,plan),[spec,plan]);
 const [filter,setFilter]=useState<Filter>('all');
 const [selected,setSelected]=useState<string|null>(null);
 const filtered=analysis.changes.filter(c=>filter==='all'||(filter==='product'?c.scope==='product':filter==='requirements'?c.scope==='requirement':c.scope==='criterion'));
 const current=filtered.find(c=>c.key===selected)||filtered[0]||null;
 const changed=analysis.state==='changed';
 const legacy=analysis.state==='missing_baseline';
 const isCurrent=analysis.state==='current';
 return <section className="impact-explorer" aria-labelledby="impact-title">
  <div className="impact-intro">
   <div><span className="eyebrow">SPRINT 05 · REVISION-BASED IMPACT ASSESSMENT</span><h3 id="impact-title">See what a change affects.</h3>
    <p>Compare the current Specification with the approved version that originally started this Technical Plan. Follow explicit Requirement → Criterion → Task links, then review downstream approval gates.</p></div>
   <span className={'impact-chip impact-'+analysis.state}>{legacy?'Unknown baseline':changed?'Review required':isCurrent?'No field differences':'Not available'}</span>
  </div>
  <div className="impact-metrics">
   <div><small>Baseline revision</small><strong>{analysis.baselineRevision??'—'}</strong></div>
   <div><small>Current revision</small><strong>{analysis.currentRevision??'—'}</strong></div>
   <div><small>Detected changes</small><strong>{legacy?'Unknown':analysis.changes.length}</strong></div>
   <div><small>Directly linked tasks</small><strong>{legacy?'Unknown':analysis.directTaskIds.length}</strong></div>
  </div>
  {analysis.state==='no_plan'||analysis.state==='missing_baseline'&&analysis.baselineRevision===null?
   <div className="impact-notice"><strong>No version baseline yet</strong><p>{analysis.summary}</p><button onClick={onOpenPlan} className="canvas-outline">Open Technical Plan →</button></div>:
   <div className={'impact-notice '+(legacy||changed?'impact-warning':'impact-clear')}>
    <strong>{legacy?'Exact differences cannot be reconstructed':changed?'A changed specification requires fresh review':'Current specification matches the saved planning snapshot'}</strong>
    <p>{analysis.summary}</p>
    {legacy&&<p>Legacy planning data is preserved, but without an approved source snapshot, claiming exactly which fields changed would be misleading. All existing tasks require review.</p>}
    {changed&&<p>Previous approvals remain historical evidence; they are <strong>not approvals for the new Specification revision</strong>. A new Plan and Task review is required before any agent handoff.</p>}
    <div className="impact-notice-actions"><button onClick={onOpenSpec} className="canvas-outline">Review Specification →</button><button onClick={onOpenPlan} className="canvas-outline">Review Technical Plan →</button></div>
   </div>}
  {analysis.changes.length>0&&<div className="impact-explorer-body">
   <div className="impact-explorer-head"><h4>Change map</h4><span>{analysis.changes.length} detected differences</span></div>
   <div className="impact-filters" role="group" aria-label="Filter impact changes">
    {(['all','requirements','criteria','product'] as Filter[]).map(item=><button type="button" key={item} aria-pressed={filter===item} onClick={()=>{setFilter(item);setSelected(null);}}>{item==='all'?'All changes':item==='requirements'?'Requirements':item==='criteria'?'Acceptance criteria':'Product context'}</button>)}
   </div>
   {filtered.length===0?<p className="impact-empty">No differences in this category.</p>:
   <div className="impact-columns">
    <div className="impact-change-list">{filtered.map((change:ImpactChange)=><button type="button" key={change.key} className={'impact-change '+(current?.key===change.key?'chosen':'')} aria-pressed={current?.key===change.key} onClick={()=>setSelected(change.key)}>
     <span className="impact-change-kind">{change.scope.toUpperCase()} · {change.kind.toUpperCase()}</span>
     <strong>{change.label}</strong>
     <small>{change.affectedTaskIds.length} direct task link(s)</small>
    </button>)}</div>
    {current&&<div className="impact-change-detail"><h5>{current.label}</h5>
     <div className="impact-diff-grid"><div><small>BEFORE · APPROVED BASELINE</small><p>{current.before??'Not present'}</p></div><div><small>AFTER · CURRENT DRAFT</small><p>{current.after??'Removed'}</p></div></div>
     <div className="impact-dependency"><strong>Observed dependency chain</strong><div><span>{current.requirementId??'PRODUCT'}</span><span>→</span><span>{current.criterionId??'SCOPE'}</span><span>→</span><span>{current.affectedTaskIds.length?current.affectedTaskIds.join(', '):'No direct link'}</span></div>
      <p>Direct links come from the frozen task breakdown. Other tasks may still be affected indirectly and require review.</p></div>
    </div>}
   </div>}
  </div>}
  {plan&&<div className="impact-review"><div className="impact-review-header"><h4>Downstream review scope</h4><span>Human decision required</span></div>
   <div className="impact-review-grid"><div><small>Directly linked tasks</small><strong>{analysis.directTaskIds.length?analysis.directTaskIds.join(' · '):legacy?'Not reconstructable':'None identified'}</strong></div><div><small>Additional tasks to review</small><strong>{analysis.potentialTaskIds.length?analysis.potentialTaskIds.join(' · '):'None identified'}</strong></div></div>
   <div className="impact-gates"><strong>Approval dependency</strong><div>{(['specify','plan','tasks','implement'] as const).map((stage,i)=><span key={stage} className={analysis.staleApprovalStages.includes(stage)?'gate-stale':'gate-current'}>{stage==='specify'?'Specification':stage==='plan'?'Plan':stage==='tasks'?'Tasks':'Agent Handoff'}{analysis.staleApprovalStages.includes(stage)?' · Review':' · Existing'}{i<3?'  →':''}</span>)}</div></div>
   <p>Even when no exact task link is found, revised Specifications must be reapproved and dependent Plans and Task approvals re-evaluated. This analysis does not approve or execute anything.</p>
  </div>}
  <div className="impact-actions"><button type="button" className="canvas-outline" onClick={()=>downloadReport(impactMarkdown(analysis))}>↓ Export impact assessment (.md)</button><span>Local artifact comparison only. No cloud synchronization or code-level dependency scan is implied.</span></div>
 </section>;
}
