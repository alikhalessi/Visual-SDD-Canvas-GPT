/** Read-only validation of a public GitHub Actions evidence chain. */
export const EVIDENCE_REPO='alikhalessi/Visual-SDD-Canvas-GPT';
export const EVIDENCE_WORKFLOW='Visual SDD - Verified Agent Handoff';
export type GithubComment={body?:string|null;user?:{login?:string}|null};
export type GithubRun={id?:number;name?:string;status?:string;conclusion?:string|null;event?:string;html_url?:string};
export type GithubArtifact={id?:number;name?:string;expired?:boolean;size_in_bytes?:number};
export type EvidenceResult={issue:number;runId:number;runUrl:string;artifactUrl:string;artifactName:string};
export function parseIssueNumber(value:string):number|null{
 if(!/^[1-9]\d{0,8}$/.test(value.trim()))return null;
 const n=Number(value.trim());return Number.isSafeInteger(n)?n:null;
}
export function extractBotRunId(comments:GithubComment[]):number|null{
 if(!Array.isArray(comments))return null;
 for(const comment of [...comments].reverse()){
  if(comment.user?.login!=='github-actions[bot]')continue;
  if(typeof comment.body!=='string'||!comment.body.includes('Visual SDD artifact validation PASSED.'))continue;
  const m=comment.body.match(/https:\/\/github\.com\/alikhalessi\/Visual-SDD-Canvas-GPT\/actions\/runs\/([1-9]\d{0,15})(?!\d)/);
  if(!m)continue;
  const id=Number(m[1]);if(Number.isSafeInteger(id))return id;
 }
 return null;
}
export function verifyGitHubEvidence(issue:number,runId:number,run:GithubRun,artifacts:GithubArtifact[]):EvidenceResult|null{
 if(run.id!==runId||run.name!==EVIDENCE_WORKFLOW||run.event!=='issues'||run.status!=='completed'||run.conclusion!=='success')return null;
 const artifact=artifacts.find(a=>a.name==='visual-sdd-evidence-'+issue&&a.expired===false&&Number.isSafeInteger(a.id));
 if(!artifact)return null;
 return {
  issue,runId,
  runUrl:'https://github.com/'+EVIDENCE_REPO+'/actions/runs/'+runId,
  artifactUrl:'https://github.com/'+EVIDENCE_REPO+'/actions/runs/'+runId+'/artifacts/'+artifact.id,
  artifactName:artifact.name!
 };
}
