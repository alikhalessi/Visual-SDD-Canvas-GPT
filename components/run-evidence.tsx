'use client';
import {useState} from 'react';
import {extractBotRunId,parseIssueNumber,verifyGitHubEvidence,type GithubComment,type GithubRun,type GithubArtifact,type EvidenceResult} from '../lib/run-evidence-core';

const BASE='https://api.github.com/repos/alikhalessi/Visual-SDD-Canvas-GPT/';
async function getPublicGitHubJson(path:string):Promise<unknown>{
 const response=await fetch(BASE+path,{method:'GET',cache:'no-store',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});
 if(!response.ok){
  if(response.status===403||response.status===429)throw Error('GitHub public API rate limit or access restriction. Open the Actions page instead.');
  throw Error('GitHub did not return evidence (HTTP '+response.status+').');
 }
 return response.json();
}
function items(value:unknown,key:string):unknown[]{
 if(!value||typeof value!=='object'||Array.isArray(value))return [];
 const list=(value as Record<string,unknown>)[key];
 return Array.isArray(list)?list:[];
}

export default function RunEvidence(){
 const [issueText,setIssueText]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [result,setResult]=useState<EvidenceResult|null>(null);
 async function check(){
  const issue=parseIssueNumber(issueText);
  setError('');setResult(null);
  if(issue===null){setError('Enter a valid public GitHub issue number, such as 3.');return;}
  setBusy(true);
  try{
   const commentsRaw=await getPublicGitHubJson('issues/'+issue+'/comments?per_page=100');
   if(!Array.isArray(commentsRaw))throw Error('GitHub issue comments could not be validated.');
   const runId=extractBotRunId(commentsRaw as GithubComment[]);
   if(runId===null)throw Error('No successful Actions evidence comment was found. The run may be queued, failed, or unavailable; check GitHub Actions.');
   const [runRaw,artifactRaw]=await Promise.all([
    getPublicGitHubJson('actions/runs/'+runId),
    getPublicGitHubJson('actions/runs/'+runId+'/artifacts?per_page=100')
   ]);
   const evidence=verifyGitHubEvidence(issue,runId,runRaw as GithubRun,items(artifactRaw,'artifacts') as GithubArtifact[]);
   if(!evidence)throw Error('The official run or evidence artifact did not meet verification requirements. Do not treat the request as validated.');
   setResult(evidence);
  }catch(e){setError(e instanceof Error?e.message:'Unable to check GitHub evidence.');}
  finally{setBusy(false);}
 }
 return <section className="run-evidence" aria-labelledby="run-evidence-title">
  <div className="run-evidence-header"><div><span className="eyebrow">SPRINT 04 · INDEPENDENT EVIDENCE</span><h4 id="run-evidence-title">Verify a real GitHub run</h4><p>Check a public issue against the official GitHub Actions run and artifact API. This is a read-only verification, not an execution button.</p></div><span>Public GitHub API</span></div>
  <div className="run-evidence-form"><label htmlFor="run-evidence-issue">GitHub issue number</label><div><input id="run-evidence-issue" inputMode="numeric" type="text" maxLength={9} placeholder="e.g. 3" value={issueText} onChange={e=>{setIssueText(e.target.value);setResult(null);setError('');}}/><button type="button" disabled={busy} onClick={()=>void check()}>{busy?'Checking GitHub…':'Verify evidence'}</button></div>
    <button type="button" className="run-evidence-example" onClick={()=>{setIssueText('3');setResult(null);setError('');}}>Use synthetic smoke-test Issue #3</button>
  </div>
  {result&&<div className="run-evidence-success" role="status"><div className="run-evidence-result"><strong><span aria-hidden="true">✓ </span>Verified artifact handoff</strong><span>GitHub Actions success</span></div>
   <p>GitHub confirms that the issue has a completed successful Actions run and an unexpired evidence artifact. This proves document-handoff verification only; no AI coding, source implementation, or customer acceptance is implied.</p>
   <div className="run-evidence-links"><a href={result.runUrl} target="_blank" rel="noreferrer">Official run #{result.runId} ↗</a><a href={result.artifactUrl} target="_blank" rel="noreferrer">Evidence artifact ↗</a></div></div>}
  {error&&<p className="run-evidence-error" role="alert">{error}</p>}
  <p className="run-evidence-fineprint">Only publicly accessible issue comments and GitHub metadata are read. No login, GitHub token, or private project data is transmitted by this check. GitHub API availability and rate limits apply.</p>
 </section>;
}
