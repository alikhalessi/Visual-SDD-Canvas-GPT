/** Sprint 09: deterministic, offline and explicitly non-authoritative prototype-to-spec proposals. */
import {createSpecification,readSpecification,revise,type Priority,type Requirement,type Specification} from './spec-core.ts';
import {addBusinessWorkflow,createStakeholderReview,flagEdgeCondition,readStakeholderReview,rebaseStakeholderReview,type StakeholderReviewDocument} from './stakeholder-view-core.ts';

export type SourceSpan={start:number;end:number;quote:string};
export type RuleProposal={id:string;title:string;statement:string;priority:Priority;source:SourceSpan;confidence:'explicit'|'review-required'};
export type PathProposal={id:string;ruleId:string;kind:'interactive'|'background';description:string;reason:string;source:SourceSpan;confidence:'potential'};
export type VibeProposal={schemaVersion:1;brief:string;rules:RuleProposal[];paths:PathProposal[];blindSpots:string[]};
export type RuleChoice={id:string;include:boolean;title:string;statement:string;priority:Priority;linkInteractive:boolean};
export type PathChoice={id:string;include:boolean;description:string};
export type ImportChoices={rules:RuleChoice[];paths:PathChoice[]};
export type ImportResult={spec:Specification;review:StakeholderReviewDocument;addedRequirements:string[];openedEdges:string[];linkedWorkflows:string[]};

const MAX_BRIEF=8000;
const invalidControl=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const instructionAttack=/\b(ignore (?:all |previous |your )?instructions|reveal (?:the )?(?:system|developer) prompt|system override)\b/i;
const markupAttack=/<\/?(?:script|iframe|object|embed|style)\b/i;
const behavior=/\b(must|shall|should|can|will|needs? to|cannot|can't|may not|when .+ (?:then|must|should))\b/i;
const background=/\b(queue|queued|schedule|scheduled|background|delay|delayed|report|notification|email|webhook|batch|job)\b/i;
const access=/\b(revok|withdraw|permission|access|session|token|expire|logout|sign.out)\w*/i;
const roles=/\b(guest|member|role|admin|checkout|discount|pricing)\b/i;
const interactive=/\b(click|view|screen|dashboard|page|form|search|request|select|button|checkout|login|sign.in)\b/i;
const normalize=(x:string)=>x.trim().replace(/\s+/g,' ');
const matchKey=(x:string)=>normalize(x).toLocaleLowerCase('en-US').replace(/[.!?]+$/,'');
const bounded=(x:unknown,max:number,min=1):x is string=>typeof x==='string'&&x.length<=max&&x.trim().length>=min;
const uniq=(a:string[])=>new Set(a).size===a.length;
function safeBrief(brief:unknown):asserts brief is string {
 if(!bounded(brief,MAX_BRIEF,12)||invalidControl.test(brief)||instructionAttack.test(brief)||markupAttack.test(brief))throw Error('Brief is missing, too long, or contains unsafe control/instruction content.');
}
function sentenceSpans(brief:string):SourceSpan[]{
 const spans:SourceSpan[]=[];
 // Preserve original offsets for evidence; include unfinished last sentence and line breaks.
 const rx=/[^.!?\n]+(?:[.!?]+|(?=\n|$))/g;
 for(const m of brief.matchAll(rx)){
  const full=m[0],leading=full.length-full.trimStart().length,trailing=full.length-full.trimEnd().length;
  const start=(m.index??0)+leading,end=(m.index??0)+full.length-trailing;
  if(end>start)spans.push({start,end,quote:brief.slice(start,end)});
 }
 return spans;
}
function titleFor(statement:string):string {
 const s=normalize(statement).replace(/^(?:requirement|rule|feature)\s*:\s*/i,'');
 return s.length<=76?s:s.slice(0,73).trimEnd()+'…';
}
function spanValid(s:SourceSpan,brief:string){
 return !!s&&Number.isSafeInteger(s.start)&&Number.isSafeInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=brief.length&&s.quote===brief.slice(s.start,s.end);
}
/** Every candidate is a proposal; apparent confidence refers only to text evidence, never correctness. */
export function parseVibeBrief(brief:string):VibeProposal{
 safeBrief(brief);
 const rules:RuleProposal[]=[],paths:PathProposal[]=[],seen=new Set<string>(),blindSpots:string[]=[];
 for(const source of sentenceSpans(brief)){
  const statement=normalize(source.quote.replace(/^(?:requirement|rule|feature)\s*:\s*/i,''));
  if(statement.length<15||statement.length>2000||!behavior.test(statement))continue;
  const key=matchKey(statement);
  if(seen.has(key))throw Error('Duplicate rule statements found in the brief. Review the source before importing.');
  seen.add(key);
  if(rules.length>=12)throw Error('Brief has more than 12 behavioral candidates. Split it into smaller imports.');
  const id='C-'+String(rules.length+1).padStart(3,'0');
  rules.push({id,title:titleFor(statement),statement,priority:/\b(must|shall|cannot|can't)\b/i.test(statement)?'must':/\bshould\b/i.test(statement)?'should':'could',
   source,confidence:/\b(must|shall|should|cannot|can't)\b/i.test(statement)?'explicit':'review-required'});
  const probes:{kind:'interactive'|'background';test:RegExp;description:string;reason:string}[]=[
   {kind:'interactive',test:interactive,description:'Potential user-facing interaction for '+titleFor(statement),reason:'User-facing verb or screen mentioned; needs stakeholder confirmation.'},
   {kind:'background',test:background,description:'Check delayed, queued or scheduled processing after the primary action.',reason:'Possible asynchronous behavior; not established by the brief.'},
   {kind:'background',test:access,description:'Check stale permissions, cached access and queued delivery after revocation.',reason:'Access or session boundary may cross background work; speculative.'},
   {kind:'background',test:roles,description:'Check guest/member role changes and stale session or pricing state.',reason:'Role and session boundary may leak state; speculative.'}
  ];
  for(const p of probes){
   if(!p.test.test(statement))continue;
   if(paths.length>=32)break;
   paths.push({id:'P-'+String(paths.length+1).padStart(3,'0'),ruleId:id,kind:p.kind,description:p.description,reason:p.reason,source,confidence:'potential'});
  }
 }
 if(!rules.length)blindSpots.push('No behavioral sentence with explicit verbs was found; write clearer statements before importing.');
 if(!rules.some(r=>background.test(r.statement)))blindSpots.push('Scheduled work, notification queues and delayed reports were not explicitly described.');
 if(!rules.some(r=>access.test(r.statement)))blindSpots.push('Access revocation, cached sessions and permission changes were not explicitly described.');
 if(!rules.some(r=>roles.test(r.statement)))blindSpots.push('Guest/member/administrator boundaries were not explicitly described.');
 blindSpots.push('No source-code inspection, live prototype crawl, acceptance-test execution or complete-path proof has occurred.');
 return {schemaVersion:1,brief,rules,paths,blindSpots};
}
export function defaultImportChoices(proposal:VibeProposal):ImportChoices {
 return {rules:proposal.rules.map(r=>({id:r.id,include:false,title:r.title,statement:r.statement,priority:r.priority,linkInteractive:false})),
  paths:proposal.paths.map(p=>({id:p.id,include:false,description:p.description}))};
}
/** Validated, all-or-nothing adapter. No input text gains approval or execution authority. */
export function prepareVibeImport(spec:Specification|null,review:StakeholderReviewDocument|null,proposal:VibeProposal,choices:ImportChoices,now=new Date().toISOString()):ImportResult {
 if(!proposal||proposal.schemaVersion!==1)throw Error('Unsupported proposal schema.');
 safeBrief(proposal.brief);
 if(!Array.isArray(proposal.rules)||!Array.isArray(proposal.paths)||!Array.isArray(choices?.rules)||!Array.isArray(choices.paths))throw Error('Invalid proposal or review selections.');
 const canonical=parseVibeBrief(proposal.brief);
 if(JSON.stringify(canonical)!==JSON.stringify(proposal))throw Error('Proposal was altered; reparse the original brief.');
 const rids=choices.rules.map(c=>c.id),pids=choices.paths.map(c=>c.id);
 if(!uniq(rids)||!uniq(pids)||choices.rules.length!==proposal.rules.length||choices.paths.length!==proposal.paths.length||
   rids.some(id=>!proposal.rules.some(r=>r.id===id))||pids.some(id=>!proposal.paths.some(p=>p.id===id)))throw Error('Choices have missing or duplicate proposal IDs.');
 const accepted=choices.rules.filter(r=>r.include),chosenPaths=choices.paths.filter(p=>p.include);
 if(!accepted.length)throw Error('Select at least one rule for import.');
 const base=spec??createSpecification(proposal.brief,now);
 if(!readSpecification(base))throw Error('The source Specification is invalid; nothing was changed.');
 if(review&&(review.specId!==base.id||review.sourceIdea!==base.sourceIdea||!readStakeholderReview(review)))throw Error('Stakeholder review could not be safely read.');
 const existing=base.requirements.filter(r=>!(!spec&&r.id==='REQ-001'&&!r.statement.trim()));
 const keys=new Set(existing.map(r=>matchKey(r.statement)));
 const added:Requirement[]=[],chosen=new Map<string,RuleChoice>(),ids=new Map<string,string>();
 let nextId=Math.max(0,...existing.map(r=>Number(r.id.slice(4))||0));
 for(const c of accepted){
  if(!bounded(c.title,160,5)||!bounded(c.statement,2000,15)||!['must','should','could'].includes(c.priority))throw Error('Rule title, statement or priority is invalid.');
  if(invalidControl.test(c.title+c.statement)||markupAttack.test(c.title+c.statement)||instructionAttack.test(c.title+c.statement))throw Error('Unsafe rule content. Import aborted.');
  const key=matchKey(c.statement);
  if(keys.has(key))throw Error('Duplicate of an existing or selected requirement; import aborted.');
  keys.add(key);
  const source=proposal.rules.find(r=>r.id===c.id);
  if(!source||!spanValid(source.source,proposal.brief))throw Error('Missing source evidence.');
  // Explicitly empty acceptance text: the human must provide a testable condition in Spec Editor.
  const id='REQ-'+String(++nextId).padStart(3,'0');
  ids.set(c.id,id);chosen.set(c.id,c);
  added.push({id,title:normalize(c.title),statement:normalize(c.statement),priority:c.priority,criteria:[{id:'AC-001',text:''}]});
 }
 if(existing.length+added.length>30)throw Error('The 30-requirement limit would be exceeded.');
 for(const p of chosenPaths){const candidate=proposal.paths.find(x=>x.id===p.id);
  if(!candidate||!ids.has(candidate.ruleId))throw Error('A selected path has no selected source rule.');
  if(!bounded(p.description,420,8)||invalidControl.test(p.description)||instructionAttack.test(p.description)||markupAttack.test(p.description))throw Error('Potential path description is invalid.');
 }
 const nextSpec=revise(base,{requirements:[...existing,...added]},now);
 if(!readSpecification(nextSpec)||nextSpec.approval.status!=='draft')throw Error('Specification validation failed; import aborted.');
 let nextReview=review?rebaseStakeholderReview(review,nextSpec,now):createStakeholderReview(nextSpec,now);
 const linkedWorkflows:string[]=[],openedEdges:string[]=[];
 for(const [candidateId,c] of chosen){
  if(!c.linkInteractive)continue;
  const id=ids.get(candidateId)!;
  const proposalRule=proposal.rules.find(r=>r.id===candidateId)!;
  const label=('User interaction: '+proposalRule.title).slice(0,180);
  nextReview=addBusinessWorkflow(nextReview,id,label,'interactive',now);
  linkedWorkflows.push(id);
 }
 for(const choice of chosenPaths){
  const p=proposal.paths.find(x=>x.id===choice.id)!;
  const target=ids.get(p.ruleId)!;
  // Potential paths are *open questions*, never asserted background workflows.
  nextReview=flagEdgeCondition(nextReview,target,normalize(choice.description)+' Source: '+p.source.quote.slice(0,150),now);
  openedEdges.push(target);
 }
 if(!readStakeholderReview(nextReview))throw Error('Stakeholder sidecar validation failed; import aborted.');
 return {spec:nextSpec,review:nextReview,addedRequirements:added.map(r=>r.id),openedEdges,linkedWorkflows};
}
