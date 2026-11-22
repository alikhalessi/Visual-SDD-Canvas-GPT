'use client';
import {useEffect,useRef,useState} from 'react';
import BusinessReviewCanvas from './business-review-canvas';
import SpecEditor from './spec-editor';
import {readSpecification,type Specification} from '../lib/spec-core';
import {DEMO_PROJECT_ID,DEMO_SOURCE_KEY,DEMO_MARKER,installDemoSample} from '../lib/demo-core';

export default function DemoWorkspace(){
 const [source,setSource]=useState<Specification|null>(null),[editor,setEditor]=useState(false),[generation,setGeneration]=useState(0);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[stale,setStale]=useState(false);
 const saved=useRef<string|null>(null);
 function restore(){try{const s=installDemoSample(localStorage);saved.current=localStorage.getItem(DEMO_SOURCE_KEY);setSource(s);setError('');setStale(false);setGeneration(x=>x+1);}catch(e){setError(e instanceof Error?e.message:'Demo storage is unavailable.');}}
 useEffect(()=>{restore();function changed(e:StorageEvent){if(e.key===null||e.key===DEMO_SOURCE_KEY||e.key===DEMO_MARKER){setStale(true);setError('The demo changed in another tab. Reload the saved demo before editing.');}}window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[]);
 function update(next:Specification){
  try{if(!readSpecification(next))throw Error('The changed demo source is invalid.');const raw=JSON.stringify(next),current=localStorage.getItem(DEMO_SOURCE_KEY);if(stale||(current!==saved.current&&current!==raw))throw Error('The demo changed in another tab. Reload the saved demo before editing.');localStorage.setItem(DEMO_SOURCE_KEY,raw);saved.current=raw;setSource(next);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Demo changes could not be saved.');setStale(true);}
 }
 function reset(){
  if(!window.confirm('Reset this SetPilot demo sample? Local sample edits, review notes and handoff decisions will be replaced. Download anything you want to keep first.'))return;
  try{const s=installDemoSample(localStorage,true);saved.current=localStorage.getItem(DEMO_SOURCE_KEY);setSource(s);setEditor(false);setStale(false);setError('');setGeneration(x=>x+1);setNotice('SetPilot demo sample restored. All source and behaviour approvals remain draft.');}
  catch(e){setError(e instanceof Error?e.message:'The demo could not be reset.');}
 }
 return <div className="demo-shell"><a className="skip-link" href="#demo-main">Skip to main content</a>
  <header className="demo-banner"><div><strong>SetPilot sample demo</strong><p>Fictitious coach access and queued weekly reports. Edits stay in this browser; cloud accounts and agent execution are unavailable here.</p></div><button type="button" className="business-outline" onClick={reset}>Reset demo sample</button></header>
  <main id="demo-main">{error&&<div role="alert" className="demo-error">{error}{stale&&<button type="button" className="business-outline" onClick={restore}>Reload saved demo</button>}</div>}{notice&&<p role="status" className="demo-notice">{notice}</p>}
   {!source&&!error&&<p>Loading the SetPilot sample…</p>}
   {source&&(stale?<p>Editing is paused to preserve the saved demo.</p>:editor?<SpecEditor key={generation} spec={source} mode="simple" onChange={update} onBack={()=>setEditor(false)} onCanvas={()=>setEditor(false)} onReset={reset}/>:<BusinessReviewCanvas key={generation} spec={source} idea={source.sourceIdea} projectId={DEMO_PROJECT_ID} onSpecificationChange={update} onCreateSpecification={()=>setEditor(true)} onOpenSpecification={()=>setEditor(true)} onImportedSourceIdea={()=>{}} canImport={!error}/>) }
  </main>
 </div>;
}
