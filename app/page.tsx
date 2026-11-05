'use client';
import {useEffect,useRef,useState} from 'react';
import {SDD_STAGES,getStage,buildIdeaDraft,normalizeIdea,type StageId} from '../lib/sdd-core';
import SpecEditor from '../components/spec-editor';
import UxGuide from '../components/ux-guide';
import WorkspaceBrief from '../components/workspace-brief';
import {inspectCachedSpecification} from '../lib/quality-core';
import VisualSDDCanvas from '../components/visual-sdd-canvas';
import CloudPanel,{AccountStatus,type CloudReference,type CloudProject} from '../components/cloud-panel';
import {createSpecification,readSpecification,validateSpecification,type Specification} from '../lib/spec-core';
type Mode='simple'|'professional';
type Draft={id:string;title:string;description:string;status:'draft'};
export default function Page(){
 const [mode,setMode]=useState<Mode>('simple');
 const [stage,setStage]=useState<StageId>('idea');
 const [idea,setIdea]=useState('');
 const ideaInput=useRef<HTMLTextAreaElement>(null);
 const [draft,setDraft]=useState<Draft|null>(null);
 const [notice,setNotice]=useState('');
 const [tab,setTab]=useState<'overview'|'canvas'|'specification'|'cloud'>('overview');
 const [cloudRef,setCloudRef]=useState<CloudReference|null>(null);
 const [spec,setSpec]=useState<Specification|null>(null);
 const [hydrated,setHydrated]=useState(false);
 const [storageError,setStorageError]=useState('');
 const [unreadableSpec,setUnreadableSpec]=useState<string|null>(null);
 const ideaSynced=!!draft&&draft.description===normalizeIdea(idea);
 const journey={ideaSaved:ideaSynced,specificationExists:!!spec,approvalStatus:spec?.approval.status??null,validationIssueCount:spec?validateSpecification(spec).length:0};
 useEffect(()=>{
  // Read independent browser keys separately: one damaged entry must never erase another.
  try{
   const raw=localStorage.getItem('visual-sdd-idea');
   if(raw){const value=JSON.parse(raw);if(value&&typeof value.description==='string'&&value.description.length<=600){setIdea(value.description);setDraft(value);}else setStorageError('A saved idea could not be restored. Its original data was not overwritten.');}
  }catch{setStorageError('Your browser idea could not be restored. It was not overwritten.');}
  try{const rememberedMode=localStorage.getItem('visual-sdd-view-mode');if(rememberedMode==='simple'||rememberedMode==='professional')setMode(rememberedMode);}
  catch{setStorageError('Display preference could not be restored.');}
  try{
   const result=inspectCachedSpecification(localStorage.getItem('visual-sdd-specification-v1'));
   if(result.status==='valid')setSpec(result.spec);
   if(result.status==='unreadable'){
    setUnreadableSpec(result.raw);
    setStorageError('Your saved Specification could not be read. The original data is preserved. Export a recovery copy before clearing this cache.');
   }
  }catch{setStorageError('Browser storage access failed. No cached Specification was removed.');}
  setHydrated(true);
 },[]);
 useEffect(()=>{
  if(!hydrated||unreadableSpec!==null)return;
  try{if(spec)localStorage.setItem('visual-sdd-specification-v1',JSON.stringify(spec));else localStorage.removeItem('visual-sdd-specification-v1');}
  catch{setStorageError('Local storage blocked; export your document before leaving.');}
 },[spec,hydrated,unreadableSpec]);
 useEffect(()=>{if(!hydrated)return;try{localStorage.setItem('visual-sdd-view-mode',mode);}catch{setStorageError('Cannot save your view preference in this browser.');}},[mode,hydrated]);
 function exportRecoveryCopy(){
  if(unreadableSpec===null)return;
  const url=URL.createObjectURL(new Blob([unreadableSpec],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='visual-sdd-unreadable-specification-recovery.txt';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 function clearUnreadableCache(){
  if(unreadableSpec===null||!window.confirm('Delete only the unreadable browser Specification after exporting a recovery copy? This action cannot be undone.'))return;
  try{
   localStorage.removeItem('visual-sdd-specification-v1');
   setUnreadableSpec(null);setStorageError('Unreadable Specification cache cleared at your request. Your idea is unchanged.');
  }catch{setStorageError('Browser storage could not be cleared. Your original cached data remains unchanged.');}
 }
 const selected=getStage(stage);
 function save(){try{const value=buildIdeaDraft(idea);if(value.description!==draft?.description)setCloudRef(null);setDraft(value);localStorage.setItem('visual-sdd-idea',JSON.stringify(value));setStage('idea');setNotice('Idea saved locally. Open the Specification Editor to continue.');}catch(e){setNotice(e instanceof Error?e.message:'Invalid idea');}}
 function openSpec(){
 if(unreadableSpec!==null){setTab('overview');setNotice('Recover or explicitly clear the unreadable Specification cache before creating a new one.');return;}
 try{
 const value=buildIdeaDraft(idea);const previous=spec;
 if(previous&&previous.sourceIdea!==value.description&&!window.confirm('This idea differs from your specification. Replace it with a new draft?')){setTab('specification');return;}
 setDraft(value);try{localStorage.setItem('visual-sdd-idea',JSON.stringify(value));}catch{setStorageError('Could not save the idea.');}
 if(!previous||previous.sourceIdea!==value.description){setSpec(createSpecification(value.description));setCloudRef(null);}
 setStage('specify');setTab('specification');setNotice('');
 }catch(e){setNotice(e instanceof Error?e.message:'Please enter a valid idea.');setTab('overview');}}
 function captureIdea(){setTab('overview');requestAnimationFrame(()=>ideaInput.current?.focus());}
 function loadCloudProject(project:CloudProject):boolean{
  if(unreadableSpec!==null){setStorageError('Recover the unreadable browser Specification before opening another project.');return false;}
  const incoming=project.specification?readSpecification(project.specification):null;
  if(project.specification&&!incoming){setStorageError('Cloud project contained an invalid Specification. Your current work was not replaced.');return false;}
  if(cloudRef?.id!==project.id&&(draft||spec)&&!window.confirm('Open this cloud project? Your current browser-only changes may be replaced. Export them first if needed.'))return false;
  setIdea(project.idea);const restored=buildIdeaDraft(project.idea);setDraft(restored);
  const doc=incoming;setSpec(doc);
  setStage(doc?'specify':'idea');setTab(doc?'specification':'overview');setNotice('Project restored from your cloud workspace.');
  try{localStorage.setItem('visual-sdd-idea',JSON.stringify(restored));}catch{setStorageError('Could not cache the restored idea in this browser.');}
  return true;
 }
 function resetSpec(){if(window.confirm('Remove the local specification and start again? Export first if needed.')){setSpec(null);setCloudRef(null);setTab('overview');setStage('idea');setNotice('Specification cleared. Your idea draft is preserved.');}}
 return <div className="app-shell">
  <a className="skip-link" href="#workspace-main">Skip to main content</a>
  <aside className="nav" aria-label="Workspace navigation">
   <div className="brand"><div className="brand-mark">◇</div><div><strong>visual<span>SDD</span></strong><small>DEVELOP WITH CLARITY</small></div></div>
   <div className="nav-label">WORKSPACE</div>
   <button aria-current={tab==='overview'?'page':undefined} className={'nav-item '+(tab==='overview'?'active':'')} onClick={()=>setTab('overview')}><span>▦</span> Overview</button>
   <button aria-current={tab==='canvas'?'page':undefined} className={'nav-item '+(tab==='canvas'?'active':'')} onClick={()=>setTab('canvas')}><span>⌘</span> SDD Canvas</button>
   <button aria-current={tab==='specification'?'page':undefined} className={'nav-item '+(tab==='specification'?'active':'')} onClick={()=>spec?setTab('specification'):openSpec()}><span>▤</span> Specification</button>
   <button aria-current={tab==='cloud'?'page':undefined} className={'nav-item '+(tab==='cloud'?'active':'')} onClick={()=>setTab('cloud')}><span>☁</span> My Projects</button>
   <div className="nav-label push-down">ACTIVE PROJECT</div>
   <div className="project"><span className="orange-dot"></span>{spec?.title||(draft?'Saved idea draft':'New project')}<small>{cloudRef?'CLOUD LINKED':'BROWSER'}</small></div>
   <div className="profile"><div className="avatar">VS</div><div><strong>Visual SDD</strong><small>UX & Quality · Sprint 07</small></div></div>
  </aside>
  <div className="main">
   <header className="topbar"><div>Workspace <span className="sep">/</span> {tab==='overview'?'Overview':tab==='canvas'?'SDD Canvas':tab==='cloud'?'My Projects':'Specification'}</div><div className="top-right"><AccountStatus onProjects={()=>setTab('cloud')}/><span className="tag">v0.7.0</span></div></header>
   <nav className="mobile-workspace-nav" aria-label="Mobile workspace navigation">
    <button aria-current={tab==='overview'?'page':undefined} onClick={()=>setTab('overview')}>Overview</button>
    <button aria-current={tab==='canvas'?'page':undefined} onClick={()=>setTab('canvas')}>SDD Canvas</button>
    <button aria-current={tab==='specification'?'page':undefined} onClick={()=>spec?setTab('specification'):openSpec()}>Specification</button>
    <button aria-current={tab==='cloud'?'page':undefined} onClick={()=>setTab('cloud')}>My Projects</button>
   </nav>
   <main id="workspace-main" tabIndex={-1} className="content">
    <div className="overline"><span className="green-dot"></span> VISUAL SDD WORKSPACE <span className="overline-line"></span></div>
    {tab==='overview'&&<div className="hero"><div><h1>See every decision.<br/><em>Understand every change.</em></h1><p>Shape your idea through a visible, reviewable development process. Know what is planned, what is approved, and what has actually been verified.</p></div><span className="hero-badge">HUMAN-GOVERNED WORKSPACE · SPRINT 07</span></div>}
    {tab==='overview'&&<div className="intro-grid">
     <section className="panel idea-panel"><div className="panel-top"><span className="eyebrow">01 / START WITH AN IDEA</span><span className="outlined">BROWSER-LOCAL</span></div><h2>What would you like to build?</h2><p>Describe your idea in everyday language. Browser drafts stay on this device until you choose Save to my account.</p><label className="sr-only" htmlFor="idea">Your product idea</label><textarea ref={ideaInput} id="idea" aria-describedby="idea-save-state" maxLength={600} value={idea} onChange={e=>{setIdea(e.target.value);setNotice('');}} placeholder="For example: A booking website where customers choose a wellness appointment and receive confirmation."/><div className="idea-actions"><span id="idea-save-state" aria-live="polite">{idea.trim().length} / 600 characters · {ideaSynced?'Idea saved in this browser':'Unsaved changes'}</span><div className="idea-buttons"><button className="spec-outline" onClick={save}>Save idea draft</button><button className="action" onClick={openSpec}>{spec?'Open specification':'Start specification'} →</button></div></div>{notice&&<div role="status" className="notice">{notice}</div>}</section>
     <WorkspaceBrief spec={spec} ideaCaptured={ideaSynced} cloudLinked={!!cloudRef} mode={mode} onMode={setMode} onCapture={captureIdea} onSpecification={openSpec} onCanvas={()=>setTab('canvas')} onProjects={()=>setTab('cloud')}/>
    </div>}
    {tab==='overview'&&<UxGuide journey={journey} onCapture={captureIdea} onSpecification={openSpec} onCanvas={()=>setTab('canvas')}/>}
    {tab==='canvas'&&<VisualSDDCanvas idea={idea} spec={spec} projectId={cloudRef?.id||null} mode={mode} onMode={setMode} onIdea={captureIdea} onSpecification={openSpec}/>}
    {tab==='overview'&&mode==='professional'&&<section className="panel workflow">
     <div className="workflow-head"><div><span className="eyebrow">02 / DEVELOPMENT JOURNEY</span><h2>Visual SDD Canvas <span className="outlined">LIVE MODEL IN CANVAS</span></h2><p>Preview all seven stages here, or open the interactive SDD Canvas to edit a real technical plan and traceable task definitions.</p></div><div className="mode" role="group" aria-label="Viewing mode"><button aria-pressed={mode==='simple'} className={mode==='simple'?'selected':''} onClick={()=>setMode('simple')}>Simple</button><button aria-pressed={mode==='professional'} className={mode==='professional'?'selected':''} onClick={()=>setMode('professional')}>Professional</button></div></div>
     <div className="work-body"><div className="grid-panel"><div className="grid-kicker"><span className="green-dot"></span> SPEC-DRIVEN DEVELOPMENT · SEVEN STAGES</div><div className="steps">{SDD_STAGES.map((s,i)=><button type="button" key={s.id} aria-pressed={s.id===stage} className={'step '+(s.id===stage?'chosen':'')} onClick={()=>setStage(s.id)}><span className="step-no">{String(i+1).padStart(2,'0')}</span><span className="step-icon">{i===0?'✧':i<4?'◇':i<6?'⌘':'✓'}</span><strong>{s.label}</strong><small>{mode==='simple'?s.plain:s.professional}</small><span className="step-corner">↗</span></button>)}</div><div className="key"><span><b className="key-box"></b> Explore the stages</span><button className="canvas-outline" onClick={()=>setTab('canvas')}>Open interactive SDD Canvas →</button></div></div>
     <aside className="inspector"><span className="eyebrow">SELECTED STAGE</span><div className="stage-count">{String(SDD_STAGES.findIndex(x=>x.id===stage)+1).padStart(2,'0')} / 07</div><h3>{selected.label}</h3><span className="stage-chip">{mode==='simple'?selected.plain:selected.professional}</span><p>{selected.summary}</p><div className="rule"></div><div className="detail"><span>Expected artifact</span><strong>{selected.artifact}</strong></div><div className="detail"><span>Stage evidence</span><strong>{stage==='idea'?'Browser draft':stage==='specify'?(spec?.approval.status==='approved'?'Approved Specification':'Reviewable Specification'):stage==='plan'||stage==='tasks'?'See approved artifacts in Canvas':stage==='implement'?'Optional handoff, not a verified agent run':stage==='verify'?'GitHub checks are not acceptance proof':'Not connected'}</strong></div><div className="detail"><span>What you can do</span><strong>{stage==='idea'?'Edit idea':stage==='specify'?'Write or approve Specification':stage==='release'?'No release workflow yet':'Open interactive Canvas'}</strong></div>{stage==='specify'?<button className="action stage-edit" onClick={openSpec}>{spec?'Edit specification':'Create specification'} →</button>:stage==='idea'?<button className="action stage-edit" onClick={captureIdea}>Edit idea →</button>:<button className="action stage-edit" onClick={()=>setTab('canvas')}>Open this stage in Canvas →</button>}<div className="warning">The dedicated SDD Canvas supports approved plans and task-to-GitHub PR links. GitHub check results are not proof of product acceptance.</div></aside></div>
    </section>}
    {(tab==='overview'||tab==='canvas')&&<div className="features"><div><b className="feature-icon">◇</b><div><strong>Traceability by design</strong><p>Review actual PR and GitHub check metadata after explicitly linking approved tasks.</p></div></div><div><b className="feature-icon">✓</b><div><strong>Approval before action</strong><p>Decisions remain reviewable and human-controlled.</p></div></div><div><b className="feature-icon">✧</b><div><strong>Two views, one model</strong><p>Simple for newcomers, detailed for Product Owners.</p></div></div></div>}
    {tab==='specification'&&spec&&<SpecEditor spec={spec} mode={mode} onChange={setSpec} onBack={()=>setTab('overview')} onCanvas={()=>setTab('canvas')} onReset={resetSpec}/>}
    {tab==='cloud'&&<CloudPanel idea={idea} spec={spec} cloudRef={cloudRef} onRef={setCloudRef} onLoad={loadCloudProject}/>} 
    {storageError&&<div className="notice" role="alert">{storageError}</div>}
    {unreadableSpec!==null&&<section className="recovery-banner" aria-labelledby="recovery-title"><div><strong id="recovery-title">Recovery needed: unreadable browser Specification</strong><p>We will not overwrite or delete the original cached text automatically. First export it to inspect or recover later, then choose whether to clear this single cache.</p></div><div className="recovery-actions"><button className="spec-outline" onClick={exportRecoveryCopy}>Download recovery copy</button><button className="spec-danger" onClick={clearUnreadableCache}>Clear unreadable cache…</button></div></section>}
    <footer>Visual SDD · Sprint 07 UX & Quality <span>A visual operating environment for SDD</span></footer>
   </main>
  </div>
 </div>;
}
