'use client';
import {useEffect,useState} from 'react';
import {SDD_STAGES,getStage,buildIdeaDraft,type StageId} from '../lib/sdd-core';
import SpecEditor from '../components/spec-editor';
import {createSpecification,readSpecification,type Specification} from '../lib/spec-core';
type Mode='simple'|'professional';
type Draft={id:string;title:string;description:string;status:'draft'};
export default function Page(){
 const [mode,setMode]=useState<Mode>('simple');
 const [stage,setStage]=useState<StageId>('idea');
 const [idea,setIdea]=useState('A booking website for my neighborhood wellness studio');
 const [draft,setDraft]=useState<Draft|null>(null);
 const [notice,setNotice]=useState('');
 const [tab,setTab]=useState<'overview'|'canvas'|'specification'>('overview');
 const [spec,setSpec]=useState<Specification|null>(null);
 const [hydrated,setHydrated]=useState(false);
 const [storageError,setStorageError]=useState('');
 useEffect(()=>{try{
 const raw=localStorage.getItem('visual-sdd-idea');if(raw){const value=JSON.parse(raw);if(typeof value.description==='string'){setIdea(value.description);setDraft(value);}}
 const doc=localStorage.getItem('visual-sdd-specification-v1');if(doc){const loaded=readSpecification(JSON.parse(doc));if(loaded)setSpec(loaded);}
 }catch{setStorageError('Could not restore local document.');}setHydrated(true);},[]);
 useEffect(()=>{if(!hydrated)return;try{if(spec)localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(spec));else localStorage.removeItem('visual-sdd-specification-v1');}catch{setStorageError('Local storage blocked; please export your document.');}},[spec,hydrated]);
 const selected=getStage(stage);
 function save(){try{const value=buildIdeaDraft(idea);setDraft(value);localStorage.setItem('visual-sdd-idea',JSON.stringify(value));setStage('idea');setNotice('Idea saved locally. Open the Specification Editor to continue.');}catch(e){setNotice(e instanceof Error?e.message:'Invalid idea');}}
 function openSpec(){try{
 const value=buildIdeaDraft(idea);const previous=spec;
 if(previous&&previous.sourceIdea!==value.description&&!window.confirm('This idea differs from your specification. Replace it with a new draft?')){setTab('specification');return;}
 setDraft(value);try{localStorage.setItem('visual-sdd-idea',JSON.stringify(value));}catch{setStorageError('Could not save the idea.');}
 if(!previous||previous.sourceIdea!==value.description)setSpec(createSpecification(value.description));
 setStage('specify');setTab('specification');setNotice('');
 }catch(e){setNotice(e instanceof Error?e.message:'Please enter a valid idea.');setTab('overview');}}
 function resetSpec(){if(window.confirm('Remove the local specification and start again? Export first if needed.')){setSpec(null);setTab('overview');setStage('idea');setNotice('Specification cleared. Your idea draft is preserved.');}}
 return <div className="app-shell">
  <aside className="nav">
   <div className="brand"><div className="brand-mark">◇</div><div><strong>visual<span>SDD</span></strong><small>DEVELOP WITH CLARITY</small></div></div>
   <div className="nav-label">WORKSPACE</div>
   <button className={'nav-item '+(tab==='overview'?'active':'')} onClick={()=>setTab('overview')}><span>▦</span> Overview</button>
   <button className={'nav-item '+(tab==='canvas'?'active':'')} onClick={()=>setTab('canvas')}><span>⌘</span> SDD Canvas</button>
   <button className={'nav-item '+(tab==='specification'?'active':'')} onClick={()=>spec?setTab('specification'):openSpec()}><span>▤</span> Specification</button>
   <div className="nav-label push-down">ACTIVE PROJECT</div>
   <div className="project"><span className="orange-dot"></span>{draft?'Your idea draft':'Example workspace'}<small>LOCAL</small></div>
   <div className="profile"><div className="avatar">VS</div><div><strong>Sprint 01</strong><small>Specification editor</small></div></div>
  </aside>
  <div className="main">
   <header className="topbar"><div>Workspace <span className="sep">/</span> {tab==='overview'?'Overview':tab==='canvas'?'SDD Canvas':'Specification'}</div><div className="top-right"><span className="green-dot"></span> Specification workspace <span className="tag">v0.1.0</span></div></header>
   <main className="content">
    <div className="overline"><span className="green-dot"></span> VISUAL SDD WORKSPACE <span className="overline-line"></span></div>
    {tab!=='specification'&&<div className="hero"><div><h1>See every decision.<br/><em>Understand every change.</em></h1><p>Shape your idea through a visible, reviewable development process. Know what is planned, what is approved, and what has actually been verified.</p></div><span className="hero-badge">SPECIFICATION EDITOR · SPRINT 01</span></div>}
    {tab==='overview'&&<div className="intro-grid">
     <section className="panel idea-panel"><div className="panel-top"><span className="eyebrow">01 / START WITH AN IDEA</span><span className="outlined">BROWSER-LOCAL</span></div><h2>What would you like to build?</h2><p>Describe it in your own words. Your draft and specification stay in this browser. AI execution is not enabled.</p><label className="sr-only" htmlFor="idea">Your product idea</label><textarea id="idea" maxLength={600} value={idea} onChange={e=>{setIdea(e.target.value);setNotice('');}} placeholder="Describe the product idea and the users it serves..."/><div className="idea-actions"><span>{idea.trim().length} / 600 characters</span><div className="idea-buttons"><button className="spec-outline" onClick={save}>Save draft</button><button className="action" onClick={openSpec}>{spec?'Open specification':'Start specification'} →</button></div></div>{notice&&<div role="status" className="notice">{notice}</div>}</section>
     <section className="panel mission-panel"><span className="eyebrow">WHY VISUAL SDD?</span><h2>From hidden work<br/>to visible progress.</h2><div className="benefits"><div><span className="check">✓</span> Review specifications before implementation</div><div><span className="check">✓</span> Understand what changes and why</div><div><span className="check">✓</span> Keep humans in control of approvals</div></div><p className="mission-note">Edit real structured specifications in Sprint 01. Agent execution and verified code changes remain future work.</p></section>
    </div>}
    {tab!=='specification'&&<section className="panel workflow">
     <div className="workflow-head"><div><span className="eyebrow">{tab==='canvas'?'01':'02'} / DEVELOPMENT JOURNEY</span><h2>Visual SDD Canvas <span className="outlined">FOUNDATION MODEL</span></h2><p>Choose a step to inspect its purpose and future evidence. The diagram is interactive; agent execution is not enabled yet.</p></div><div className="mode" role="group" aria-label="Viewing mode"><button aria-pressed={mode==='simple'} className={mode==='simple'?'selected':''} onClick={()=>setMode('simple')}>Simple</button><button aria-pressed={mode==='professional'} className={mode==='professional'?'selected':''} onClick={()=>setMode('professional')}>Professional</button></div></div>
     <div className="work-body"><div className="grid-panel"><div className="grid-kicker"><span className="green-dot"></span> SPEC-DRIVEN DEVELOPMENT · SEVEN STAGES</div><div className="steps">{SDD_STAGES.map((s,i)=><button type="button" key={s.id} aria-pressed={s.id===stage} className={'step '+(s.id===stage?'chosen':'')} onClick={()=>setStage(s.id)}><span className="step-no">{String(i+1).padStart(2,'0')}</span><span className="step-icon">{i===0?'✧':i<4?'◇':i<6?'⌘':'✓'}</span><strong>{s.label}</strong><small>{mode==='simple'?s.plain:s.professional}</small><span className="step-corner">↗</span></button>)}</div><div className="key"><span><b className="key-box"></b> Select a stage</span><span>NO AGENTS RUNNING</span></div></div>
     <aside className="inspector"><span className="eyebrow">SELECTED STAGE</span><div className="stage-count">{String(SDD_STAGES.findIndex(x=>x.id===stage)+1).padStart(2,'0')} / 07</div><h3>{selected.label}</h3><span className="stage-chip">{mode==='simple'?selected.plain:selected.professional}</span><p>{selected.summary}</p><div className="rule"></div><div className="detail"><span>Expected artifact</span><strong>{selected.artifact}</strong></div><div className="detail"><span>Runtime status</span><strong>Not connected</strong></div><div className="detail"><span>Approval</span><strong>Human-controlled</strong></div>{stage==='specify'&&<button className="action stage-edit" onClick={openSpec}>{spec?'Edit specification':'Create specification'} →</button>}<div className="warning">Only the Specification editor currently writes a local artifact; agent execution is not connected.</div></aside></div>
    </section>}
    {tab!=='specification'&&<div className="features"><div><b className="feature-icon">◇</b><div><strong>Traceability by design</strong><p>One chain from intent to evidence, once integrations are implemented.</p></div></div><div><b className="feature-icon">✓</b><div><strong>Approval before action</strong><p>Decisions remain reviewable and human-controlled.</p></div></div><div><b className="feature-icon">✧</b><div><strong>Two views, one model</strong><p>Simple for newcomers, detailed for Product Owners.</p></div></div></div>}
    {tab==='specification'&&spec&&<SpecEditor spec={spec} onChange={setSpec} onBack={()=>setTab('overview')} onReset={resetSpec}/>}
    {storageError&&<div className="notice" role="alert">{storageError}</div>}
    <footer>Visual SDD · Sprint 01 Visual Specification <span>A visual operating environment for SDD</span></footer>
   </main>
  </div>
 </div>;
}
