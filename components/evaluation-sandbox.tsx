'use client';
import {useEffect,useRef,useState} from 'react';
import EvaluationFacts from './evaluation-facts';
import {EVALUATION_KEY,CONSENT_TEXT,createEvaluationSession,startEvaluationTrial,submitEvaluationReview,submitEvaluationPredictions,abandonEvaluationTrial,readEvaluationSession,getEvaluationScenario,projectEvaluationFacts,evaluationParity,evaluationJSON,evaluationCSV,type EvaluationSession,type Finding,type Judgement} from '../lib/evaluation-core';

function download(name:string,data:string,type:string){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
const errorText=(e:unknown)=>e instanceof Error?e.message:'Rehearsal could not be saved. Original data was preserved.';
export default function EvaluationSandbox(){
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[session,setSession]=useState<EvaluationSession|null>(null),[recovered,setRecovered]=useState<EvaluationSession|null>(null),[rawRecovery,setRawRecovery]=useState<string|null>(null);
 const [slot,setSlot]=useState('0'),[unit,setUnit]=useState<'individual'|'pair'>('individual'),[consent,setConsent]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [findings,setFindings]=useState<Finding[]>([]),[answers,setAnswers]=useState<Record<string,string>>({});
 const inFlight=useRef(false),expectedRaw=useRef<string|null>(null),conflict=useRef(false),mounted=useRef(true),timer=useRef(0),heading=useRef<HTMLHeadingElement>(null);
 const trial=session?.trials.at(-1),phase=trial?.status;
 const scenario=trial?getEvaluationScenario(trial.scenarioId):null,facts=scenario?projectEvaluationFacts(scenario):[];
 useEffect(()=>{
  mounted.current=true;
  void (async()=>{try{
   const raw=localStorage.getItem(EVALUATION_KEY);expectedRaw.current=raw;
   if(raw!==null){
    if(raw.length>200000)throw Error('Saved rehearsal is too large. Export the original before clearing it.');
    let restored:EvaluationSession|null=null;try{restored=await readEvaluationSession(JSON.parse(raw));}catch{/* Original bytes remain available. */}
    if(!mounted.current)return;
    if(restored)setRecovered(restored);else{setRawRecovery(raw);setError('Saved rehearsal is unreadable or stale. The original was not overwritten.');}
   }
  }catch(e){if(mounted.current)setError(errorText(e));}finally{if(mounted.current)setReady(true);}})();
  function changed(e:StorageEvent){if(e.key===EVALUATION_KEY||e.key===null){conflict.current=true;setError('This rehearsal changed in another tab. Reload before saving or exporting.');}}
  window.addEventListener('storage',changed);
  return()=>{mounted.current=false;window.removeEventListener('storage',changed);};
 },[]);
 useEffect(()=>{if(session)heading.current?.focus();},[session]);
 function guard(){if(conflict.current||localStorage.getItem(EVALUATION_KEY)!==expectedRaw.current)throw Error('This rehearsal changed in another tab. Reload before saving or exporting.');}
 async function persist(next:EvaluationSession){
  guard();if(!await readEvaluationSession(next))throw Error('Rehearsal validation failed. Nothing was saved.');guard();
  const raw=JSON.stringify(next);if(raw.length>200000)throw Error('Rehearsal storage limit reached.');
  localStorage.setItem(EVALUATION_KEY,raw);expectedRaw.current=raw;setSession(next);setRecovered(null);setNotice('Saved in this browser only.');
 }
 async function act(fn:()=>Promise<void>){if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{await fn();}catch(e){setError(errorText(e));}finally{inFlight.current=false;setBusy(false);}}
 function resetForm(next:EvaluationSession){const t=next.trials.at(-1)!;setFindings(getEvaluationScenario(t.scenarioId).source.requirements.map(r=>({requirementId:r.id,judgement:'unsure',evidenceIds:[],rationale:''})));setAnswers({});timer.current=performance.now();}
 async function begin(){await act(async()=>{
  if(!ready||recovered||rawRecovery!==null)throw Error('Restore or clear the saved rehearsal first.');
  const s=createEvaluationSession('EVAL-'+crypto.randomUUID(),Number(slot),unit,consent);
  const next=await startEvaluationTrial(s);await persist(next);resetForm(next);
 });}
 async function restore(){await act(async()=>{
  if(!recovered)throw Error('No stored rehearsal.');guard();
  if(recovered.trials.some(t=>t.status==='review'||t.status==='prediction'))throw Error('An interrupted timed trial must be explicitly restarted.');
  setSession(recovered);setRecovered(null);
 });}
 async function restart(){await act(async()=>{
  if(!recovered)throw Error('No interrupted rehearsal.');
  const next=await startEvaluationTrial(abandonEvaluationTrial(recovered));await persist(next);resetForm(next);
 });}
 async function nextTrial(){await act(async()=>{if(!session)throw Error('No rehearsal.');const next=await startEvaluationTrial(session);await persist(next);resetForm(next);});}
 function updateFinding(id:string,patch:Partial<Finding>){setFindings(current=>current.map(f=>f.requirementId===id?{...f,...patch}:f));}
 async function review(){await act(async()=>{if(!session)throw Error('No rehearsal.');await persist(submitEvaluationReview(session,findings,performance.now()-timer.current));setAnswers({});timer.current=performance.now();});}
 async function predict(){await act(async()=>{if(!session||!scenario)throw Error('No prediction check.');await persist(submitEvaluationPredictions(session,scenario.questions.map(q=>({questionId:q.id,optionId:answers[q.id]||''})),performance.now()-timer.current));});}
 async function exportResult(format:'json'|'csv'){await act(async()=>{
  if(!session)throw Error('No completed rehearsal.');guard();
  const data=format==='json'?await evaluationJSON(session):await evaluationCSV(session);guard();
  download('evaluation-'+session.sessionId+'.'+format,data,format==='json'?'application/json':'text/csv;charset=utf-8');
 });}
 function exportRaw(){try{if(expectedRaw.current===null)throw Error('No saved bytes.');download('evaluation-recovery.json',expectedRaw.current,'application/json');}catch(e){setError(errorText(e));}}
 function withdraw(){try{
  guard();if(!window.confirm('Withdraw and delete only this browser rehearsal? Export it first if needed. Other projects will be kept.'))return;
  localStorage.removeItem(EVALUATION_KEY);expectedRaw.current=null;setSession(null);setRecovered(null);setRawRecovery(null);setConsent(false);setError('');setNotice('Rehearsal withdrawn and cleared from this browser. Previously downloaded copies remain with their holder.');
 }catch(e){setError(errorText(e));}}
 const interrupted=recovered?.trials.some(t=>t.status==='review'||t.status==='prediction');
 return <main className="evaluation-shell" id="evaluation-main">
  <header className="eval-header"><a href="/">← Back to Visual SDD</a><span>SPRINT 11 · LOCAL REHEARSAL</span></header>
  <h1>Inspect the same specification in two ways</h1>
  <p className="eval-intro">Review two synthetic scenarios, identify behavioral mismatches and explain your evidence. Visual cards and structured text contain the same facts. This rehearsal does not modify your projects or run a coding agent.</p>
  <p className="eval-boundary">For study preparation only. Participant recruitment and research conclusions require a validated pilot and the applicable research approvals. Responses stay in this browser until you choose to download them.</p>
  {error&&<p role="alert" className="eval-error">{error}</p>}{notice&&<p role="status" className="eval-notice">{notice}</p>}
  {!ready&&<p role="status">Checking this browser for a saved rehearsal…</p>}
  {ready&&(rawRecovery!==null||recovered)&&<section className="eval-panel"><h2>Saved rehearsal</h2><p>{rawRecovery!==null?'The original cannot be safely restored. Export its unchanged bytes before clearing it.':interrupted?'A timed trial was interrupted. Restarting retains it as abandoned; completed trials remain. It will be marked as a restart in the exported record.':'A validated rehearsal can be restored.'}</p>
   <div className="eval-actions"><button onClick={exportRaw} disabled={busy}>Export original stored rehearsal</button>{recovered&&(interrupted?<button onClick={()=>void restart()} disabled={busy}>Restart interrupted trial</button>:<button onClick={()=>void restore()} disabled={busy}>Restore rehearsal</button>)}<button onClick={withdraw} disabled={busy}>Withdraw and clear rehearsal</button></div>
  </section>}
  {ready&&!session&&!recovered&&rawRecovery===null&&<section className="eval-panel"><h2>Prepare a rehearsal</h2><p>Use an allocation slot assigned by the researcher. Consecutive slots 0–3 balance scenario order and display condition; choosing arbitrary slots does not guarantee a balanced sample.</p>
   <form onSubmit={e=>{e.preventDefault();void begin();}}>
    <label>Allocation slot<input type="number" min="0" max="999999" step="1" required value={slot} onChange={e=>setSlot(e.target.value)}/></label>
    <label>Review unit<select value={unit} onChange={e=>setUnit(e.target.value as 'individual'|'pair')}><option value="individual">Individual</option><option value="pair">Product owner and developer pair</option></select></label>
    <label className="eval-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{CONSENT_TEXT}</span></label>
    <button className="eval-primary" type="submit" disabled={!consent||busy}>Start rehearsal</button>
   </form>
  </section>}
  {session&&<>
   <section className="eval-progress" aria-label="Rehearsal progress"><span>{session.trials.filter(t=>t.status==='completed').length} of 2 reviews completed</span><span>{session.unit==='pair'?'PO–developer pair':'Individual'} · {session.sessionId}</span></section>
   <h2 ref={heading} tabIndex={-1}>{session.status==='completed'?'Rehearsal complete':phase==='review'?`Review ${trial!.assignmentIndex+1}: ${scenario!.title}`:phase==='prediction'?'Independent prediction check':'Review saved'}</h2>
   {phase==='review'&&scenario&&<>
    <p>{trial!.condition==='visual'?'Visual cards':'Structured text'} · Scenario {scenario.id} · Revision {scenario.revision}. For each rule, judge whether the observed behavior matches it. Cite record IDs and explain your judgement. “Unsure” is a valid response. The timer includes pauses while this review is open.</p>
    {!evaluationParity(facts,projectEvaluationFacts(scenario))?<p role="alert">Scenario information parity failed. This trial cannot continue.</p>:<>
     <EvaluationFacts facts={facts} condition={trial!.condition}/>
     <form className="eval-panel" onSubmit={e=>{e.preventDefault();void review();}}><h2>Your review</h2>
      {findings.map(f=><fieldset key={f.requirementId}><legend>{f.requirementId} · {scenario.source.requirements.find(r=>r.id===f.requirementId)!.title}</legend>
       <label htmlFor={'judgement-'+f.requirementId}>Judgement for {f.requirementId}</label><select id={'judgement-'+f.requirementId} value={f.judgement} onChange={e=>updateFinding(f.requirementId,{judgement:e.target.value as Judgement})}><option value="unsure">Unsure</option><option value="mismatch">Observed behavior mismatches this rule</option><option value="no-mismatch">No mismatch in the observed behavior</option></select>
       <details><summary>Select evidence for {f.requirementId} ({f.evidenceIds.length} selected)</summary><div className="eval-evidence">{facts.map(fact=><label key={fact.id} className="eval-check"><input type="checkbox" aria-label={f.requirementId+' evidence '+fact.id} checked={f.evidenceIds.includes(fact.id)} onChange={e=>updateFinding(f.requirementId,{evidenceIds:e.target.checked?[...f.evidenceIds,fact.id]:f.evidenceIds.filter(id=>id!==fact.id)})}/><span>{fact.id} · {fact.heading}</span></label>)}</div></details>
       <label>Rationale for {f.requirementId}<textarea required minLength={12} maxLength={1200} value={f.rationale} onChange={e=>updateFinding(f.requirementId,{rationale:e.target.value})}/></label>
      </fieldset>)}
      <p>Do not enter names, contact details or confidential information. Submitting freezes this review and hides the specification before the prediction check. No answer key or score is shown.</p>
      <button className="eval-primary" type="submit" disabled={busy}>Submit review and continue</button>
     </form>
    </>}
   </>}
   {phase==='prediction'&&scenario&&<form className="eval-panel" onSubmit={e=>{e.preventDefault();void predict();}}><p>Without reopening the specification, predict the behavior described in the records. These answers are collected separately from your mismatch judgements.</p>
    {scenario.questions.map(q=><fieldset key={q.id}><legend>{q.prompt}</legend>{q.options.map(o=><label key={o.id} className="eval-check"><input type="radio" name={q.id} value={o.id} required checked={answers[q.id]===o.id} onChange={()=>setAnswers(a=>({...a,[q.id]:o.id}))}/><span>{o.label}</span></label>)}</fieldset>)}
    <button type="submit" className="eval-primary" disabled={busy}>Submit prediction check</button>
   </form>}
   {phase==='completed'&&session.status!=='completed'&&<section className="eval-panel"><p>Your first review and prediction check are saved. The next review uses the other scenario and display condition.</p><button className="eval-primary" onClick={()=>void nextTrial()} disabled={busy}>Start second review</button></section>}
   {session.status==='completed'&&<section className="eval-panel"><p>Both reviews and independent prediction checks are saved. Downloads include scenario versions, allocation, record IDs, rationales and elapsed times. They contain no answer key or automatic score. Free-text rationales may contain anything you typed; inspect them before sharing.</p><div className="eval-actions"><button className="eval-primary" onClick={()=>void exportResult('json')} disabled={busy}>Download rehearsal JSON</button><button onClick={()=>void exportResult('csv')} disabled={busy}>Download rehearsal CSV</button></div></section>}
   <div className="eval-actions"><button onClick={exportRaw} disabled={busy}>Export original stored rehearsal</button><button onClick={withdraw} disabled={busy}>Withdraw and clear rehearsal</button></div>
  </>}
 </main>;
}
