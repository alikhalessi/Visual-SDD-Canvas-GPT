'use client';
import {useCallback,useEffect,useState} from 'react';
import {authClient} from '../lib/auth/client';
import type {Specification} from '../lib/spec-core';

export type CloudProject={
 id:string;title:string;idea:string;specification:Specification|null;
 revision:number;approval_status:'draft'|'approved';created_at:string;updated_at:string;
};
export type CloudReference={id:string;updatedAt:string};
type Activity={id:number;project_id:string;event_type:string;summary:string;revision:number;created_at:string};
type Props={idea:string;spec:Specification|null;cloudRef:CloudReference|null;onRef:(v:CloudReference|null)=>void;onLoad:(project:CloudProject)=>void;};

function friendlyDate(value:string){const time=new Date(value);return Number.isNaN(time.getTime())?value:time.toLocaleString();}
function providerMessage(error:unknown){return error instanceof Error?error.message:'Authentication failed. Please retry.';}
export async function googleSignIn(){
 const result=await authClient.signIn.social({provider:'google',callbackURL:window.location.origin+'/'});
 if(result.error)throw new Error(result.error.message||'Google sign-in failed.');
}

export function AccountStatus({onProjects}:{onProjects:()=>void}){
 const {data:session,isPending}=authClient.useSession();
 const [error,setError]=useState('');
 if(isPending)return <span className="cloud-account-pending">Checking account…</span>;
 if(!session?.user)return <div className="account-toolbar">
   <button className="google-button" type="button" onClick={async()=>{try{setError('');await googleSignIn();}catch(e){setError(providerMessage(e));}}}>
    <span aria-hidden="true" className="google-g">G</span> Continue with Google
   </button>{error&&<span role="alert" className="account-error">{error}</span>}</div>;
 return <div className="account-toolbar"><button className="account-projects" onClick={onProjects} type="button">◉ {session.user.name||session.user.email||'My account'}</button>
  <button type="button" className="account-signout" onClick={async()=>{try{await authClient.signOut();}catch{setError('Could not sign out.');}}}>Sign out</button>
  {error&&<span role="alert" className="account-error">{error}</span>}</div>;
}

export default function CloudPanel({idea,spec,cloudRef,onRef,onLoad}:Props){
 const {data:session,isPending}=authClient.useSession();
 const [projects,setProjects]=useState<CloudProject[]>([]);
 const [events,setEvents]=useState<Activity[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const refresh=useCallback(async()=>{
  const response=await fetch('/api/workspace',{method:'GET',credentials:'same-origin',cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Unable to load cloud workspace.');
  setProjects(Array.isArray(data.projects)?data.projects:[]);
  setEvents(Array.isArray(data.activity)?data.activity:[]);
 },[]);
 useEffect(()=>{if(!session?.user?.id){setProjects([]);setEvents([]);return;}
  let cancelled=false;
  void (async()=>{try{await refresh();if(!cancelled)setError('');}catch(e){if(!cancelled)setError(providerMessage(e));}})();
  return ()=>{cancelled=true;};
 },[session?.user?.id,refresh]);
 async function save(){
  if(!session?.user)return;
  setError('');setMessage('');setBusy(true);
  try{
   const data={id:cloudRef?.id||null,expectedUpdatedAt:cloudRef?.updatedAt||null,idea:idea.trim(),title:spec?.title||idea.trim().slice(0,100),specification:spec};
   const response=await fetch('/api/workspace',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Save failed.');
   onRef({id:result.project.id,updatedAt:result.project.updated_at});
   setMessage(result.created?'New project saved securely to your account.':'Project revision and activity saved.');
   await refresh();
  }catch(e){setError(providerMessage(e));}finally{setBusy(false);}
 }
 async function remove(project:CloudProject){
  if(!window.confirm('Permanently delete “'+project.title+'” and its activity history? This cannot be undone.'))return;
  setBusy(true);setError('');setMessage('');
  try{
   const response=await fetch('/api/workspace?id='+encodeURIComponent(project.id),{method:'DELETE',credentials:'same-origin'});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Delete failed.');
   if(cloudRef?.id===project.id)onRef(null);
   await refresh();setMessage('Cloud project and its activity history deleted.');
  }catch(e){setError(providerMessage(e));}finally{setBusy(false);}
 }
 return <section className="cloud-workspace" aria-labelledby="cloud-title">
  <div className="cloud-heading"><div><span className="eyebrow">SPRINT 01B · PERSISTENT WORKSPACE</span><h2 id="cloud-title">Your projects, under your control.</h2>
   <p>Sign in with Google to access your private project collection, backed by an independent cloud database.</p></div>
   <span className="cloud-secure-chip">Private workspace</span></div>
  {isPending?<p className="cloud-state">Checking your account session…</p>:!session?.user?<div className="cloud-signin-panel">
   <div><h3>Continue with Google</h3><p>Explore without an account, then sign in when you want to preserve your work across devices. Nothing from your browser is uploaded until you explicitly save it.</p></div>
   <button className="google-button cloud-google" onClick={async()=>{setError('');try{await googleSignIn();}catch(e){setError(providerMessage(e));}}}><span aria-hidden="true" className="google-g">G</span> Sign in with Google</button>
  </div>:<div className="cloud-signed-in">
   <div className="cloud-greeting"><span className="cloud-avatar">{(session.user.name||session.user.email||'U').slice(0,1).toUpperCase()}</span><div><strong>{session.user.name||session.user.email||'Your account'}</strong><small>Signed in · Projects belong to your Google account</small></div></div>
   <div className="cloud-save"><div><h3>{cloudRef?'Save your latest changes':'Save this idea to the cloud'}</h3><p>{spec?'Includes the current structured specification, revision '+spec.revision+'.':'Saves the current idea; you can add requirements later.'} Local files stay on your device until you choose Save.</p></div>
    <button disabled={busy||idea.trim().length<12} className="action" onClick={save}>{busy?'Saving…':cloudRef?'Save revision':'Save to my account'} →</button>
   </div>
   <div className="cloud-grid">
    <div className="cloud-box"><h3>My Projects <span>{projects.length}</span></h3>{!projects.length?<p className="cloud-empty">No cloud projects yet. Save your first idea above.</p>:
     <div className="cloud-project-list">{projects.map(p=><div className={'cloud-project '+(cloudRef?.id===p.id?'cloud-current':'')} key={p.id}>
      <div><strong>{p.title}</strong><small>{p.approval_status==='approved'?'Approved':'Draft'} · Revision {p.revision} · {friendlyDate(p.updated_at)}</small></div>
      <div className="cloud-project-actions"><button disabled={busy} onClick={()=>{onLoad(p);onRef({id:p.id,updatedAt:p.updated_at});setMessage('Opened project '+p.title);}}>Open</button><button disabled={busy} onClick={()=>void remove(p)} aria-label={'Delete '+p.title}>Delete</button></div>
     </div>)}</div>}</div>
    <div className="cloud-box"><h3>Recent Activity</h3>{!events.length?<p className="cloud-empty">Your cloud activity will appear here after the first save.</p>:<div className="cloud-event-list">{events.map(item=><div key={item.id} className="cloud-event"><span className="cloud-event-icon" aria-hidden="true">●</span><div><strong>{item.event_type.replaceAll('_',' ')}</strong><small>{item.summary} · {friendlyDate(item.created_at)}</small></div></div>)}</div>}</div>
   </div>
  </div>}
  {message&&<p className="cloud-feedback" role="status">{message}</p>}
  {error&&<p className="cloud-error" role="alert">{error}</p>}
  <p className="cloud-privacy">Access is based on a server-verified session. Saving is explicit. You can export a specification as Markdown/JSON in the editor or permanently delete cloud projects here. Shared-team access is not enabled.</p>
 </section>;
}
