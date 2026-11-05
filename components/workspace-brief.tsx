'use client';
import type {Specification} from '../lib/spec-core';
import {projectReadiness,saveStatusLabel} from '../lib/quality-core';
type Mode='simple'|'professional';
type Props={
 spec:Specification|null;ideaCaptured:boolean;cloudLinked:boolean;mode:Mode;onMode:(mode:Mode)=>void;
 onCapture:()=>void;onSpecification:()=>void;onCanvas:()=>void;onProjects:()=>void;
};
export default function WorkspaceBrief({spec,ideaCaptured,cloudLinked,mode,onMode,onCapture,onSpecification,onCanvas,onProjects}:Props){
 const state=projectReadiness(spec,ideaCaptured);
 const handle=state.state==='idea'?onCapture:state.state==='planning'?onCanvas:onSpecification;
 const label=state.state==='idea'?'Write an idea':state.state==='planning'?'Open planning canvas':state.state==='approval'?'Review specification':'Open specification';
 return <section className="workspace-brief" aria-labelledby="workspace-brief-title">
  <div className="brief-heading">
   <div>
    <span className="eyebrow">YOUR CURRENT PROJECT</span>
    <h2 id="workspace-brief-title">{spec?.title||(ideaCaptured?'Idea ready for specification':'Start with one clear outcome')}</h2>
   </div>
   <span className="brief-revision">{spec?'Specification r'+spec.revision:'No specification yet'}</span>
  </div>
  <div className="brief-status-line" role="status">
   <span className="brief-status-dot" aria-hidden="true"/>
   <span>{saveStatusLabel(cloudLinked,!!spec)}</span>
  </div>
  <div className="brief-progress" aria-label={state.completed+' of the first 3 review steps complete'}>
   <span className={state.completed>=1?'is-complete':''}>Idea</span>
   <span className={state.completed>=2?'is-complete':''}>Specification</span>
   <span className={state.completed>=3?'is-complete':''}>Human approval</span>
  </div>
  <div className="brief-next">
   <div><span className="eyebrow">NEXT MEANINGFUL ACTION</span><h3>{state.heading}</h3><p>{state.description}</p></div>
   <button className="action" type="button" onClick={handle}>{label} <span aria-hidden="true">→</span></button>
  </div>
  <div className="brief-bottom">
   <div className="brief-mode" role="group" aria-label="Content explanation detail">
    <button type="button" aria-pressed={mode==='simple'} onClick={()=>onMode('simple')}>Plain language</button>
    <button type="button" aria-pressed={mode==='professional'} onClick={()=>onMode('professional')}>Professional</button>
   </div>
   <button type="button" className="brief-cloud-link" onClick={onProjects}>{cloudLinked?'Save or load in My Projects':'Explore private cloud storage'} <span aria-hidden="true">→</span></button>
  </div>
  {mode==='professional'&&<p className="brief-professional">Governance scope: approval applies to the exact Specification revision only. Technical planning, GitHub check results, and model execution are separate, explicitly verified artifacts.</p>}
 </section>;
}
