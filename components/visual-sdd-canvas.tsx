'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Specification,Requirement} from '../lib/spec-core';
import {SDD_STAGES,type StageId} from '../lib/sdd-core';
import AgentRunPanel from './agent-run-panel';
import ImpactExplorer from './impact-explorer';
import {assessChangeImpact} from '../lib/impact-core';
import {
 type PlanningDocument,type StageState,createPlanningDocument,reviseTechnical,approveTechnical,
 addLinkedTask,reviseLinkedTask,removeLinkedTask,validateTechnical,validateTaskBreakdown,approveTaskBreakdown,
 workflowGraph,traceabilityGraph,requirementCoverage,planIsCurrent,technicalApproved,tasksApproved,
 localPlanningKey,readPlanningDocument,planningMarkdown,backfillCurrentBaseline
} from '../lib/workflow-core';

type Mode='simple'|'professional';
type Props={
 idea:string;spec:Specification|null;projectId:string|null;mode:Mode;onMode:(v:Mode)=>void;
 onIdea:()=>void;onSpecification:()=>void;
};
function saveText(filename:string,data:string,type:string){
 const url=URL.createObjectURL(new Blob([data],{type}));
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
const actionLabel:Record<StageState,string>={complete:'Approved',available:'Needs action',blocked:'Blocked',future:'Not connected'};
const stageShort:Record<StageId,string>={idea:'Capture idea',specify:'Define needs',plan:'Technical plan',tasks:'Linked tasks',implement:'Agent handoff',verify:'Evidence',release:'Publish'};
function readable(s:StageState){return actionLabel[s]}
export default function VisualSDDCanvas({idea,spec,projectId,mode,onMode,onIdea,onSpecification}:Props){
 const [selected,setSelected]=useState<StageId>('specify');
 const [graph,setGraph]=useState<'workflow'|'traceability'|'impact'>('workflow');
 const [plan,setPlan]=useState<PlanningDocument|null>(null);
 const [loadedKey,setLoadedKey]=useState('');
 const [message,setMessage]=useState('');
 const [storageWarning,setStorageWarning]=useState('');
 const key=useMemo(()=>spec?localPlanningKey(spec,projectId):'', [spec?.sourceIdea,projectId]);
 useEffect(()=>{
  if(!key){setPlan(null);setLoadedKey('');return;}
  try{const saved=localStorage.getItem(key);setPlan(saved?readPlanningDocument(JSON.parse(saved)):null);setStorageWarning('');}
  catch{setPlan(null);setStorageWarning('Unable to restore this browser-local plan. Previous data was not modified.');}
  setLoadedKey(key);
 },[key]);
 useEffect(()=>{
  if(!key||loadedKey!==key||!plan)return;
  try{localStorage.setItem(key,JSON.stringify(plan));}
  catch{setStorageWarning('Browser storage is unavailable. Export the plan before leaving.');}
 },[key,loadedKey,plan]);
 useEffect(()=>{if(plan&&spec&&!plan.specBaseline&&planIsCurrent(spec,plan))setPlan(backfillCurrentBaseline(spec,plan));},[spec,plan]);
 const changeImpact=useMemo(()=>assessChangeImpact(spec,plan),[spec,plan]);
 const nodes=useMemo(()=>workflowGraph(spec,plan,idea),[spec,plan,idea]);
 const links=useMemo(()=>traceabilityGraph(spec,plan),[spec,plan]);
 const coverage=spec?requirementCoverage(spec,plan):{covered:0,total:0};
 const current=planIsCurrent(spec,plan);
 const architectureApproved=current&&technicalApproved(plan);
 const taskDefinitionsApproved=architectureApproved&&tasksApproved(plan);
 const techIssues=spec&&plan?validateTechnical(spec,plan):[];
 const taskIssues=spec&&plan?validateTaskBreakdown(spec,plan):[];
 const node=nodes.find(n=>n.id===selected)||nodes[0];
 const canStartPlan=!!spec&&spec.approval.status==='approved'&&spec.approval.approvedRevision===spec.revision;
 const canEditPlan=canStartPlan&&current&&!!plan;
 const canEditTasks=canEditPlan&&architectureApproved;
 function update(value:PlanningDocument){setPlan(value);setMessage('Changes saved in this browser. Cloud sync for planning is not connected yet.');}
 function createPlan(){
  if(!spec)return;
  if(plan){
   if(!window.confirm('A new Plan will replace the existing local Plan and Tasks. Click OK to download a backup of the old Plan before creating the new draft.'))return;
   saveText('visual-sdd-previous-plan-r'+plan.specRevision+'.json',JSON.stringify(plan,null,2),'application/json');
  }
  try{update(createPlanningDocument(spec));setSelected('plan');setMessage('Technical plan created and linked to the approved specification revision.');}
  catch(e){setMessage(e instanceof Error?e.message:'Could not create plan.');}
 }
 function approvePlan(){
  if(!spec||!plan||!window.confirm('Approve this technical plan for specification revision '+spec.revision+'?'))return;
  try{update(approveTechnical(spec,plan));setMessage('Technical plan approved. You can now define linked tasks.');}
  catch(e){setMessage(e instanceof Error?e.message:'Approval blocked.');}
 }
 function addTask(){
  if(!spec||!plan)return;
  try{update(addLinkedTask(spec,plan));setSelected('tasks');}catch(e){setMessage(e instanceof Error?e.message:'Could not add task.');}
 }
 function approveTasks(){
  if(!spec||!plan||!window.confirm('Approve this task breakdown? This does not run agents or mark tasks as implemented.'))return;
  try{update(approveTaskBreakdown(spec,plan));setMessage('Task definitions approved. The Implement handoff is available after approval; actual Codex execution remains separately gated.');}
  catch(e){setMessage(e instanceof Error?e.message:'Task approval blocked.');}
 }
 function exportPlan(format:'json'|'md'){
  if(!spec||!plan)return;
  const slug=(spec.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)||'visual-sdd');
  saveText(slug+'.planning.'+format,format==='json'?JSON.stringify(plan,null,2):planningMarkdown(spec,plan),format==='json'?'application/json':'text/markdown');
 }
 const status=nodes.reduce((n,x)=>n+(x.state==='complete'?1:0),0);
 return <section className="live-canvas" aria-labelledby="live-canvas-title">
  <div className="live-canvas-intro">
   <div><span className="eyebrow">SPRINT 05 · CHANGE IMPACT GOVERNANCE</span><h2 id="live-canvas-title">An interactive development journey.</h2>
    <p>Explore your real approval chain, explicit requirement-to-task links, and change impact against the planning baseline. Agent execution is never implicit.</p></div>
   <div className="live-canvas-metrics"><strong>{status}<span> / 7</span></strong><small>Stages completed — planning only, no code execution</small></div>
  </div>
  <div className="live-canvas-toolbar">
   <div className="canvas-segments" role="group" aria-label="Graph view">
    <button aria-pressed={graph==='workflow'} onClick={()=>setGraph('workflow')}>Workflow graph</button>
    <button aria-pressed={graph==='traceability'} onClick={()=>setGraph('traceability')}>Traceability graph</button>
    <button aria-pressed={graph==='impact'} onClick={()=>setGraph('impact')}>Change impact {changeImpact.state==='changed'?'●':''}</button>
   </div>
   <div className="canvas-segments" role="group" aria-label="Viewing mode">
    <button aria-pressed={mode==='simple'} onClick={()=>onMode('simple')}>Simple</button>
    <button aria-pressed={mode==='professional'} onClick={()=>onMode('professional')}>Professional</button>
   </div>
  </div>
  {changeImpact.state==='changed'&&graph!=='impact'&&<div className="canvas-callout" role="status">A Specification revision or content change affects the saved Plan and dependent Tasks. <button className="canvas-text-button" onClick={()=>setGraph('impact')}>Inspect affected artifacts →</button></div>}
  {changeImpact.state==='missing_baseline'&&graph!=='impact'&&<div className="canvas-callout" role="status">This legacy Plan lacks an approved baseline; exact differences cannot be reconstructed. <button className="canvas-text-button" onClick={()=>setGraph('impact')}>Review uncertainty →</button></div>}
  {graph==='workflow'?<div className="live-canvas-viewport" role="region" tabIndex={0} aria-label="Interactive SDD workflow graph, scroll horizontally for more steps">
    <div className="live-canvas-graph">{nodes.map((n,i)=><div key={n.id} className="canvas-node-pair">
      <button type="button" aria-pressed={selected===n.id} className={'canvas-node state-'+n.state+(selected===n.id?' is-selected':'')} onClick={()=>setSelected(n.id)}>
       <span className="canvas-node-top"><span>{String(i+1).padStart(2,'0')} / 07</span><span className="canvas-node-status">{readable(n.state)}</span></span>
       <span className="canvas-node-symbol" aria-hidden="true">{n.state==='complete'?'✓':n.state==='future'?'○':n.state==='blocked'?'↳':'◇'}</span>
       <strong>{mode==='simple'?stageShort[n.id]:n.label}</strong>
       <small>{mode==='simple'?SDD_STAGES[i].plain:SDD_STAGES[i].professional}</small>
       <span className="canvas-node-footer">{n.state==='complete'?'Verified artifact':n.state==='future'?'Future capability':n.state==='blocked'?'Waiting for approval':'Click to edit / review'}</span>
      </button>
      {i<nodes.length-1&&<svg aria-hidden="true" className="canvas-edge" viewBox="0 0 32 28"><path d="M1 14 H26 M20 8 L26 14 L20 20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>)}</div>
    <div className="canvas-legend"><span><i className="legend-complete"/> Approved</span><span><i className="legend-available"/> Actionable</span><span><i className="legend-blocked"/> Awaiting input</span><span><i className="legend-future"/> Not connected</span></div>
   </div>:graph==='impact'?<ImpactExplorer spec={spec} plan={plan} onSpecification={onSpecification} onPlan={()=>{setGraph('workflow');setSelected('plan');}} onTasks={()=>{setGraph('workflow');setSelected('tasks');}}/>:<div className="traceability-panel">
     <div className="traceability-heading"><div><h3>Requirement → Acceptance → Task</h3><p>These edges are generated from your actual requirement IDs and explicit task links. No relation is invented.</p></div><span>{coverage.covered} / {coverage.total} requirements linked</span></div>
     {!spec?<div className="canvas-empty"><h3>Start by writing a specification</h3><p>Traceability requires identifiable requirements and acceptance conditions.</p><button className="action" onClick={onSpecification}>Create specification →</button></div>:
      <div className="traceability-rows">{spec.requirements.map((req:Requirement)=><div key={req.id} className="traceability-row">
       <div className="trace-requirement"><span>{req.id}</span><strong>{req.title||'Untitled requirement'}</strong><small>{req.criteria.length} acceptance condition(s)</small></div>
       <svg className="trace-edge" aria-hidden="true" viewBox="0 0 72 24"><path d="M1 12 H65 L57 5 M65 12 L57 19" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
       <div className="trace-tasks">{plan?.breakdown.tasks.filter(t=>t.requirementId===req.id).length?plan.breakdown.tasks.filter(t=>t.requirementId===req.id).map(t=><button key={t.id} className="trace-task" onClick={()=>{setGraph('workflow');setSelected('tasks');}}><span>{t.id}</span><strong>{t.title||'Task needs a title'}</strong><small>{t.criterionIds.length?t.criterionIds.map(cid=>req.id+'/'+cid).join(' · '):'No acceptance criterion linked yet'}</small></button>):<div className="trace-unlinked">No linked task · {architectureApproved?'Select Tasks to add one':'Approve a technical plan first'}</div>}</div>
      </div>)}</div>}
     <p className="traceability-footnote">This is a planning traceability graph. Code files, commits and test evidence will be added in later sprints.</p>
    </div>}
  <div className="canvas-detail-layout">
   <div className="canvas-inspector">
    <div className="canvas-inspector-header"><span className="eyebrow">SELECTED WORKFLOW STAGE</span><span className={'canvas-inspector-state state-'+node.state}>{readable(node.state)}</span></div>
    <h3>{node.label}</h3><p>{node.detail}</p>
    <div className="canvas-inspector-divider"/>
    {selected==='idea'&&<div className="canvas-action-panel"><h4>Idea brief</h4><p>{idea.trim()||'No idea captured yet.'}</p><button className="action" onClick={onIdea}>Edit idea →</button></div>}
    {selected==='specify'&&<div className="canvas-action-panel"><h4>Source specification</h4>
      <p>{spec?'Revision '+spec.revision+' · '+spec.requirements.length+' requirement(s) · '+spec.approval.status:'No specification created yet.'}</p>
      <button className="action" onClick={onSpecification}>{spec?'Review specification':'Create specification'} →</button>
      {spec?.approval.status!=='approved'&&<p className="canvas-callout">Technical planning is gated until the current specification is explicitly approved.</p>}
     </div>}
    {selected==='plan'&&<div className="canvas-action-panel"><h4>Technical plan editor</h4>
     {!canStartPlan?<div className="canvas-callout">Approve your specification first. Planning will not start against an unapproved revision. <button className="canvas-text-button" onClick={onSpecification}>Open specification</button></div>:
      !plan||!current?<div className="canvas-callout">
       {plan?'Your existing plan is tied to an older specification revision. Export it before replacing.':'An approved specification is ready. Create a technical plan linked to that revision.'}
       <button className="action" onClick={createPlan}>{plan?'Create plan for new revision':'Create technical plan'} →</button>
      </div>:<div className="canvas-editor">
       <label><strong>Technical approach</strong><textarea rows={5} maxLength={5000} disabled={!canEditPlan} value={plan.technical.architecture} onChange={e=>update(reviseTechnical(plan,{architecture:e.target.value}))} placeholder="Describe the architecture, components and their responsibilities (25+ characters)."/></label>
       <label><strong>Risks and uncertainties</strong><textarea rows={3} maxLength={2500} disabled={!canEditPlan} value={plan.technical.risks} onChange={e=>update(reviseTechnical(plan,{risks:e.target.value}))} placeholder="Identify technical, privacy or operational risks (12+ characters)."/></label>
       <label><strong>Assumptions (optional)</strong><textarea rows={3} maxLength={2500} disabled={!canEditPlan} value={plan.technical.assumptions} onChange={e=>update(reviseTechnical(plan,{assumptions:e.target.value}))}/></label>
       <p className="canvas-inline">Revision {plan.technical.revision} · Spec revision {plan.specRevision}</p>
       {techIssues.length?<ul className="canvas-issues">{techIssues.map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="canvas-pass">✓ Structural plan validation passed. Confirm the contents are correct.</p>}
       {architectureApproved?<p className="canvas-pass">✓ Technical plan approved. You may now define linked tasks.</p>:<button className="action" disabled={techIssues.length>0} onClick={approvePlan}>Approve technical plan</button>}
      </div>}
    </div>}
    {selected==='tasks'&&<div className="canvas-action-panel"><h4>Traceable task definitions</h4>
     {!canEditTasks?<div className="canvas-callout">Tasks cannot be approved before their current technical plan. <button className="canvas-text-button" onClick={()=>setSelected('plan')}>Go to Plan</button></div>:
      <div className="canvas-editor"><p>Each task must link to a real requirement and at least one of its acceptance criteria.</p>
       <button className="canvas-outline" onClick={addTask} disabled={plan!.breakdown.tasks.length>=60}>+ Add linked task</button>
       {plan!.breakdown.tasks.map(t=>{
        const req=spec!.requirements.find(r=>r.id===t.requirementId);
        return <div key={t.id} className="canvas-task">
         <div className="canvas-task-header"><span>{t.id}</span><button className="canvas-remove" onClick={()=>update(removeLinkedTask(plan!,t.id))}>Remove</button></div>
         <label><strong>Task definition</strong><input maxLength={800} value={t.title} placeholder="A specific action to deliver the requirement..." onChange={e=>update(reviseLinkedTask(plan!,t.id,{title:e.target.value}))}/></label>
         <label><strong>Linked requirement</strong><select value={t.requirementId} onChange={e=>update(reviseLinkedTask(plan!,t.id,{requirementId:e.target.value,criterionIds:[]}))}>{spec!.requirements.map(r=><option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}</select></label>
         <fieldset className="canvas-criteria"><legend>Linked acceptance criteria</legend>{req?.criteria.map(c=><label key={c.id}><input type="checkbox" checked={t.criterionIds.includes(c.id)} onChange={e=>update(reviseLinkedTask(plan!,t.id,{criterionIds:e.target.checked?[...t.criterionIds,c.id]:t.criterionIds.filter(x=>x!==c.id)}))}/><span>{c.id} — {c.text}</span></label>)}</fieldset>
        </div>;
       })}
       <div className="canvas-task-health"><strong>{coverage.covered} / {coverage.total} requirements covered</strong><small>Coverage is based on explicit acceptance-criterion links.</small></div>
       {taskIssues.length?<ul className="canvas-issues">{taskIssues.map((x,i)=><li key={i}>{x}</li>)}</ul>:<p className="canvas-pass">✓ Task definitions structurally validated.</p>}
       {taskDefinitionsApproved?<p className="canvas-pass">✓ Task breakdown approved. No code has been run.</p>:<button className="action" disabled={taskIssues.length>0} onClick={approveTasks}>Approve task breakdown</button>}
      </div>}
    </div>}
    {selected==='implement'&&<AgentRunPanel spec={spec} plan={plan} onReviewPlan={()=>setSelected('tasks')}/>}
     {['verify','release'].includes(selected)&&<div className="canvas-action-panel"><h4>Future gated execution</h4><p>This stage is intentionally disabled. Verified code changes, test evidence and deployment controls will be delivered and validated in subsequent sprints.</p>
     <div className="canvas-callout">No agent has executed a task. A green node never indicates generated code or released software.</div>
    </div>}
    {message&&<p role="status" className="canvas-message">{message}</p>}
   </div>
   <aside className="canvas-evidence">
    <div className="canvas-evidence-header"><span className="eyebrow">AUDITABLE ARTIFACTS</span><strong>Live project state</strong></div>
    <dl><div><dt>Specification</dt><dd>{spec?spec.approval.status+' · r'+spec.revision:'Missing'}</dd></div>
     <div><dt>Technical plan</dt><dd>{!plan?'Not created':current?(architectureApproved?'Approved':'Draft'):'Stale / blocked'}</dd></div>
     <div><dt>Task definitions</dt><dd>{!plan?'Not created':taskDefinitionsApproved?'Approved':plan.breakdown.tasks.length+' drafted'}</dd></div>
     <div><dt>Acceptance links</dt><dd>{links.length} explicit</dd></div>
     <div><dt>Agent execution</dt><dd>Not connected</dd></div>
    </dl>
    {plan&&<div className="canvas-export"><button className="canvas-outline" onClick={()=>exportPlan('md')}>↓ Export plan & tasks (.md)</button><button className="canvas-outline" onClick={()=>exportPlan('json')}>↓ Backup planning JSON</button></div>}
    <div className="canvas-persistence"><strong>Storage boundary</strong><p>Plan and task drafts currently persist in this browser and can be exported. They are <strong>not yet synchronized to My Projects</strong>. Your existing cloud Specification functionality remains unchanged.</p></div>
    {storageWarning&&<p className="canvas-issues" role="alert">{storageWarning}</p>}
   </aside>
  </div>
 </section>;
}
