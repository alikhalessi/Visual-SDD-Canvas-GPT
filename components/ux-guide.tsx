'use client';
import type {JourneyInput} from '../lib/ux-core';
import {getJourneySteps,getNextAction} from '../lib/ux-core';

type Props={journey:JourneyInput;onCapture:()=>void;onSpecification:()=>void;onCanvas:()=>void;};
export default function UxGuide({journey,onCapture,onSpecification,onCanvas}:Props){
 const steps=getJourneySteps(journey);
 const next=getNextAction(journey);
 const progress=steps.filter(s=>s.state==='complete').length;
 const handler=next.id==='idea'?onCapture:next.id==='planning'?onCanvas:onSpecification;
 return <section className="ux-guide" aria-labelledby="ux-guide-heading">
  <div className="ux-guide-heading">
   <div><span className="eyebrow">YOUR GUIDED JOURNEY</span><h2 id="ux-guide-heading">Know where you are. Know what comes next.</h2>
   <p>Three starting steps for your Specification. Technical planning and GitHub evidence continue in the Canvas; no agent progress is simulated.</p></div>
   <span className="ux-counter" aria-label={progress+' of 3 stages complete'}>{progress} / 3 complete</span>
  </div>
  <div className="ux-step-list" role="list">
   {steps.map((s,i)=><div key={s.id} role="listitem" className={'ux-step '+s.state}>
    <span aria-hidden="true" className="ux-step-number">{s.state==='complete'?'✓':String(i+1).padStart(2,'0')}</span>
    <div><strong>{s.label}</strong><small>{s.description}</small></div>
    <span className="ux-step-state">{s.state==='complete'?'Done':s.state==='current'?'Current':'Later'}</span>
   </div>)}
  </div>
  <div className="ux-next">
   <div><span className="eyebrow">RECOMMENDED NEXT ACTION</span><h3>{next.title}</h3><p>{next.instruction}</p></div>
   <button onClick={handler} className="ux-next-action">
    {next.id==='idea'?'Write an idea':next.id==='planning'?'Continue to planning':'Open specification'} <span aria-hidden="true">→</span>
   </button>
  </div>
 </section>;
}
