'use client';
import {useMemo,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import type {PlanningDocument} from '../lib/workflow-core';
import {assessChangeImpact,impactMarkdown,type ImpactChange} from '../lib/impact-core';

type Props={spec:Specification|null;plan:PlanningDocument|null;onSpecification:()=>void;onPlan:()=>void;onTasks:()=>void};
function exportMarkdown(markdown:string){
 const url=URL.createObjectURL(new Blob([markdown],{type:'text/markdown;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='visual-sdd-change-impact.md';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export default function ImpactExplorer({spec,plan,onSpecification,onPlan,onTasks}:Props){
 const report=useMemo(()=>assessChangeImpact(spec,plan),[spec,plan]);
 const [focus,setFocus]=useState<string|null>(null);
 const selected=report.changes.find(c=>c.key===focus)??report.changes[0]??null;
 const allImpacted=[...new Set([...report.directTaskIds,...report.potentialTaskIds])].sort();
 return <section className="impact-explorer" aria-labelledby="impact-heading">
  <div className="impact-heading">
   <div><span className="eyebrow">SPRINT 05 · CHANGE IMPACT</span><h3 id="impact-heading">See the consequences before moving forward.</h3>
    <p>Compare the current specification against the snapshot saved when planning started. Linked tasks, stale approvals and uncertainty are shown separately.</p></div>
   <span className={'impact-state impact-'+report.state}>{report.state.replace('_',' ')}</span>
  </div>
  <div className="impact-metrics">
   <div><strong>{report.changes.length}</strong><span>Detected content changes</span></div>
   <div><strong>{report.directTaskIds.length}</strong><span>Directly linked tasks</span></div>
   <div><strong>{report.potentialTaskIds.length}</strong><span>Other tasks to review</span></div>
   <div><strong>{report.staleApprovalStages.length}</strong><span>Blocked / stale gates</span></div>
  </div>
  <p className="impact-summary" role="status">{report.summary}</p>
  {(report.state==='no_plan'||report.state==='missing_baseline')&&<div className="impact-warning">
   <strong>{report.state==='no_plan'?'No planning baseline yet.':'Legacy plan — baseline missing.'}</strong>
   <p>{report.state==='no_plan'
    ?'Approve the specification and create a technical plan. The app will capture an immutable specification snapshot for future comparisons.'
    :'This plan was created before impact snapshots existed. We cannot accurately reconstruct historic changes. Treat every existing task as potentially affected. Export the old plan before creating a replacement.'}</p>
   <button type="button" onClick={report.state==='no_plan'?onSpecification:onPlan} className="canvas-outline">{report.state==='no_plan'?'Open specification':'Review plan and backup'} →</button>
  </div>}
  {report.state!=='no_plan'&&<div className="impact-graph">
   <div className="impact-col impact-source"><span className="impact-col-label">BASELINE</span>
    <div className="impact-artifact"><small>Specification</small><strong>Revision {report.baselineRevision??'unknown'}</strong><span>{plan?.specBaseline?'Recorded when planning started':'Historical snapshot unavailable'}</span></div>
    <div className="impact-artifact impact-artifact-current"><small>CURRENT DOCUMENT</small><strong>Revision {report.currentRevision??'missing'}</strong><span>{spec?.approval.status==='approved'?'Approved':'Approval required or missing'}</span></div>
   </div>
   <div className="impact-connector" aria-hidden="true">→</div>
   <div className="impact-col impact-changes"><span className="impact-col-label">DETECTED CHANGES</span>
    {report.changes.length?report.changes.map(change=><button type="button" key={change.key} aria-pressed={selected?.key===change.key} className={'impact-change impact-kind-'+change.kind} onClick={()=>setFocus(change.key)}>
     <span>{change.kind.toUpperCase()} · {change.scope}</span><strong>{change.label}</strong><small>{change.affectedTaskIds.length} directly linked task(s)</small>
    </button>):<div className="impact-empty-changes">{report.state==='missing_baseline'?'Change-level history unavailable':'No content changes detected'}</div>}
   </div>
   <div className="impact-connector" aria-hidden="true">→</div>
   <div className="impact-col impact-target"><span className="impact-col-label">DEPENDENT ARTIFACTS</span>
    <div className={'impact-artifact '+(report.staleApprovalStages.includes('plan')?'impact-stale':'')}><small>TECHNICAL PLAN</small><strong>{report.staleApprovalStages.includes('plan')?'STALE — review required':'Revision-aligned'}</strong></div>
    <div className={'impact-artifact '+(report.staleApprovalStages.includes('tasks')?'impact-stale':'')}><small>TASK BREAKDOWN</small><strong>{report.staleApprovalStages.includes('tasks')?'Reapprove after review':'Approval revision-aligned'}</strong></div>
    <div className={'impact-artifact '+(report.staleApprovalStages.includes('implement')?'impact-stale':'')}><small>AGENT HANDOFF</small><strong>{report.staleApprovalStages.includes('implement')?'Blocked':'Original safety gates still apply'}</strong></div>
   </div>
  </div>}
  {selected&&<article className="impact-inspector" aria-labelledby="impact-selected-heading">
   <div className="impact-inspector-header"><span className="eyebrow">SELECTED CHANGE</span><span>{selected.scope} / {selected.kind}</span></div>
   <h4 id="impact-selected-heading">{selected.label}</h4>
   <div className="impact-before-after"><div><small>BEFORE</small><p>{selected.before??'Not present'}</p></div><div><small>AFTER</small><p>{selected.after??'Removed'}</p></div></div>
   <strong className="impact-relationship">Direct requirement/acceptance links</strong>
   {selected.affectedTaskIds.length?<div className="impact-task-chips">{selected.affectedTaskIds.map(id=><button key={id} onClick={onTasks} title={'Review '+id}>{id} →</button>)}</div>
   :<p className="impact-no-links">No direct task link was recorded for this change. This does not establish that the change is safe; review the other tasks and system-level effects.</p>}
  </article>}
  {allImpacted.length>0&&<div className="impact-review-list">
   <strong>Review required: {allImpacted.length} task(s)</strong>
   <p>Direct links are evidence of impact. Tasks without direct links remain candidates for indirect effects. The analysis does not silently mark work as completed.</p>
   <div>{allImpacted.map(id=><button key={id} type="button" onClick={onTasks} className={report.directTaskIds.includes(id)?'impact-direct':'impact-potential'}>{id} <small>{report.directTaskIds.includes(id)?'Direct':'Possible'}</small></button>)}</div>
  </div>}
  <div className="impact-controls">
   <button className="canvas-outline" onClick={onSpecification}>Review specification</button>
   <button className="canvas-outline" onClick={onPlan}>Review technical plan</button>
   <button className="canvas-outline" onClick={onTasks}>Review linked tasks</button>
   <button className="canvas-outline" onClick={()=>exportMarkdown(impactMarkdown(report))}>↓ Export impact report (.md)</button>
  </div>
  <p className="impact-disclaimer">This assessment compares documented content and explicit task references. It does not infer semantic dependencies, preserve superseded approvals, run agents, verify code, or synchronize local planning data to your cloud account.</p>
 </section>;
}
