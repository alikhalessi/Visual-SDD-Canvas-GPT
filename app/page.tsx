'use client';
import {useEffect,useState} from 'react';
import {SDD_STAGES,getStage,buildIdeaDraft,type StageId} from '../lib/sdd-core';
type Mode='simple'|'professional';
type Draft={id:string;title:string;description:string;status:'draft'};
export default function Page(){
 const [mode,setMode]=useState<Mode>('simple');
 const [stage,setStage]=useState<StageId>('idea');
 const [idea,setIdea]=useState('A booking website for my neighborhood wellness studio');
 const [draft,setDraft]=useState<Draft|null>(null);
 const [notice,setNotice]=useState('');
 const [tab,setTab]=useState<'overview'|'canvas'>('overview');
 useEffect(()=>{try{const raw=window.localStorage.getItem('visual-sdd-idea');if(raw){const value=JSON.parse(raw);if(typeof value.description==='string'){setIdea(value.description);setDraft(value);}}}catch{}},[]);
 const selected=getStage(stage);
 function save(){try{const value=buildIdeaDraft(idea);setDraft(value);window.localStorage.setItem('visual-sdd-idea',JSON.stringify(value));setStage('idea');setNotice('Idea draft saved to this browser. Specification generation will be added in Sprint 01.');}catch(e){setNotice(e instanceof Error?e.message:'Invalid idea');}}
 return <div className="app-shell">
  <aside className="nav">
   <div className="brand"><div className="brand-mark">◇</div><div><strong>visual<span>SDD</span></strong><small>DEVELOP WITH CLARITY</small></div></div>
   <div className="nav-label">WORKSPACE</div>
   <button className={'nav-item '+(tab==='overview'?'active':'')} onClick={()=>setTab('overview')}><span>▦</span> Overview</button>
   <button className={'nav-item '+(tab==='canvas'?'active':'')} onClick={()=>setTab('canvas')}><span>⌘</span> SDD Canvas</button>
   <div className="nav-label push-down">ACTIVE PROJECT</div>
   <div className="project"><span className="orange-dot"></span>{draft?'Your idea draft':'Example workspace'}<small>LOCAL</small></div>
   <div className="profile"><div className="avatar">VS</div><div><strong>Sprint 00</strong><small>Foundation preview</small></div></div>
  </aside>
  <div className="main">
   <header className="topbar"><div>Workspace <span className="sep">/</span> {tab==='overview'?'Overview':'SDD Canvas'}</div><div className="top-right"><span className="green-dot"></span> Foundation preview <span className="tag">v0.0.1</span></div></header>
   <main className="content">
    <div className="overline"><span className="green-dot"></span> VISUAL SDD WORKSPACE <span className="overline-line"></span></div>
    <div className="hero"><div><h1>See every decision.<br/><em>Understand every change.</em></h1><p>Shape your idea through a visible, reviewable development process. Know what is planned, what is approved, and what has actually been verified.</p></div><span className="hero-badge">FOUNDATION · SPRINT 00</span></div>
    {tab==='overview'&&<div className="intro-grid">
     <section className="panel idea-panel"><div className="panel-top"><span className="eyebrow">01 / START WITH AN IDEA</span><span className="outlined">BROWSER-LOCAL</span></div><h2>What would you like to build?</h2><p>Describe it in your own words. Your draft is saved locally — no AI execution happens yet.</p><label className="sr-only" htmlFor="idea">Your product idea</label><textarea id="idea" maxLength={600} value={idea} onChange={e=>{setIdea(e.target.value);setNotice('');}} placeholder="Describe the product idea and the users it serves..."/><div className="idea-actions"><span>{idea.trim().length} / 600 characters</span><button className="action" onClick={save}>Save idea draft <span>→</span></button></div>{notice&&<div role="status" className="notice">{notice}</div>}</section>
     <section className="panel mission-panel"><span className="eyebrow">WHY VISUAL SDD?</span><h2>From hidden work<br/>to visible progress.</h2><div className="benefits"><div><span className="check">✓</span> Review specifications before implementation</div><div><span className="check">✓</span> Understand what changes and why</div><div><span className="check">✓</span> Keep humans in control of approvals</div></div><p className="mission-note">This is the foundation interface. Real SDD execution and independently verified changes are scheduled for later sprints.</p></section>
    </div>}
    <section className="panel workflow">
     <div className="workflow-head"><div><span className="eyebrow">{tab==='canvas'?'01':'02'} / DEVELOPMENT JOURNEY</span><h2>Visual SDD Canvas <span className="outlined">FOUNDATION MODEL</span></h2><p>Choose a step to inspect its purpose and future evidence. The diagram is interactive; agent execution is not enabled yet.</p></div><div className="mode" role="group" aria-label="Viewing mode"><button aria-pressed={mode==='simple'} className={mode==='simple'?'selected':''} onClick={()=>setMode('simple')}>Simple</button><button aria-pressed={mode==='professional'} className={mode==='professional'?'selected':''} onClick={()=>setMode('professional')}>Professional</button></div></div>
     <div className="work-body"><div className="grid-panel"><div className="grid-kicker"><span className="green-dot"></span> SPEC-DRIVEN DEVELOPMENT · SEVEN STAGES</div><div className="steps">{SDD_STAGES.map((s,i)=><button type="button" key={s.id} aria-pressed={s.id===stage} className={'step '+(s.id===stage?'chosen':'')} onClick={()=>setStage(s.id)}><span className="step-no">{String(i+1).padStart(2,'0')}</span><span className="step-icon">{i===0?'✧':i<4?'◇':i<6?'⌘':'✓'}</span><strong>{s.label}</strong><small>{mode==='simple'?s.plain:s.professional}</small><span className="step-corner">↗</span></button>)}</div><div className="key"><span><b className="key-box"></b> Select a stage</span><span>NO AGENTS RUNNING</span></div></div>
     <aside className="inspector"><span className="eyebrow">SELECTED STAGE</span><div className="stage-count">{String(SDD_STAGES.findIndex(x=>x.id===stage)+1).padStart(2,'0')} / 07</div><h3>{selected.label}</h3><span className="stage-chip">{mode==='simple'?selected.plain:selected.professional}</span><p>{selected.summary}</p><div className="rule"></div><div className="detail"><span>Expected artifact</span><strong>{selected.artifact}</strong></div><div className="detail"><span>Runtime status</span><strong>Not connected</strong></div><div className="detail"><span>Approval</span><strong>Human-controlled</strong></div><div className="warning">♧ &nbsp; This view is a foundation model, not a claim of AI execution, completed tests, or production code generation.</div></aside></div>
    </section>
    <div className="features"><div><b className="feature-icon">◇</b><div><strong>Traceability by design</strong><p>One chain from intent to evidence, once integrations are implemented.</p></div></div><div><b className="feature-icon">✓</b><div><strong>Approval before action</strong><p>Decisions remain reviewable and human-controlled.</p></div></div><div><b className="feature-icon">✧</b><div><strong>Two views, one model</strong><p>Simple for newcomers, detailed for Product Owners.</p></div></div></div>
    <footer>Visual SDD · Sprint 00 Foundation <span>A visual operating environment for SDD</span></footer>
   </main>
  </div>
 </div>;
}
