/** Frozen, synthetic study records. No workspace data, answer keys or model calls. */
import {createSpecification,revise,addRequirement,updateRequirement,updateCriterion,readSpecification,type Specification} from './spec-core.ts';
import {createStakeholderReview,addBusinessWorkflow,proposeBehaviourExample,flagEdgeCondition,projectStakeholderRules,readStakeholderReview,type StakeholderReviewDocument} from './stakeholder-view-core.ts';
import {canonicalJSON,sha256} from './agent-handoff-core.ts';

export const EVALUATION_KEY='visual-sdd-evaluation-v1';
export const STUDY_VERSION='visual-sdd-pilot-v1';
export const CONSENT_TEXT='This is a local rehearsal, not an approved participant study. I agree to store my rehearsal responses in this browser and export them manually. I will not enter names, contact details, credentials or confidential information. I may withdraw and clear this rehearsal.';
export type ScenarioId='A'|'B';
export type Condition='visual'|'text';
export type Judgement='mismatch'|'no-mismatch'|'unsure';
export type Question={id:string;prompt:string;options:{id:string;label:string}[]};
export type Scenario={schemaVersion:1;id:ScenarioId;revision:1;title:string;source:Specification;review:StakeholderReviewDocument;observations:{id:string;at:string;description:string;requirementId:string}[];questions:Question[]};
export type EvaluationFact={id:string;group:'Context'|'Business rules'|'Workflows and coverage'|'Observed sequence';heading:string;text:string;links:string[]};
const TIME='2026-11-21T00:00:00.000Z';
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.freeze(value);for(const v of Object.values(value))freeze(v);}return value;}
function scenario(id:ScenarioId):Scenario{
 const a=id==='A';
 let source=createSpecification(a?'An athlete must control coach access, including reports queued before access is withdrawn.':'Member prices must apply only to eligible members, including guest express checkout after logout.',TIME);
 source=revise(source,{title:a?'SetPilot Coaching Platform':'Member-Only Checkout',goal:a?'Withdrawal of coach access applies to dashboard reads and report delivery.':'Guest checkout must not inherit a previous member session price.',audience:a?'Athletes and coaches':'Members and guest shoppers'},TIME);
 source=updateRequirement(source,'REQ-001',{title:a?'Dashboard access':'Member product pricing',statement:a?'After an athlete withdraws coach access, the coach must not read the dashboard.':'An eligible signed-in member must see the member price on the standard product page.'},TIME);
 source=updateCriterion(source,'REQ-001','AC-001',a?'An attempted dashboard read after withdrawal is denied.':'A signed-in eligible member sees the member price.',TIME);
 source=addRequirement(source,TIME);
 source=updateRequirement(source,'REQ-002',{title:a?'Report delivery authorization':'Guest express checkout pricing',statement:a?'A queued report must check current coach access at delivery time.':'Guest express checkout must use the guest price after a member logs out.'},TIME);
 source=updateCriterion(source,'REQ-002','AC-001',a?'A report queued before access withdrawal is not delivered to the revoked coach.':'A guest checkout after member logout does not reuse the member discount.',TIME);
 let review=createStakeholderReview(source,TIME);
 review=addBusinessWorkflow(review,'REQ-001',a?'Coach opens the dashboard':'Member opens the standard product page','interactive',TIME);
 const flow=review.rules[0].workflows[0].id;
 review=proposeBehaviourExample(review,'REQ-001',flow,a?'Coach access was withdrawn':'An eligible member is signed in',a?'The coach opens the dashboard':'The member opens the standard product page',a?'Access is denied':'The member price is displayed',TIME);
 review=addBusinessWorkflow(review,'REQ-002',a?'Deliver a previously queued report':'Guest uses express checkout',a?'background':'interactive',TIME);
 review=flagEdgeCondition(review,'REQ-002',a?'The report-delivery path has no reviewed example for access withdrawn after queuing.':'The express-checkout path has no reviewed example for a cached member price after logout.',TIME);
 const observations=a?[
  {id:'OBS-001',at:'09:55',description:'A report for the coach is queued for delivery at 10:05.',requirementId:'REQ-002'},
  {id:'OBS-002',at:'10:00',description:'The athlete withdraws coach access; a dashboard request is denied.',requirementId:'REQ-001'},
  {id:'OBS-003',at:'10:05',description:'The queued report remains scheduled to deliver to the coach without a fresh access check.',requirementId:'REQ-002'},
 ]:[
  {id:'OBS-001',at:'Step 1',description:'A signed-in eligible member sees the correct member price on the standard product page.',requirementId:'REQ-001'},
  {id:'OBS-002',at:'Step 2',description:'The member logs out; the previous member price remains in a checkout cache.',requirementId:'REQ-002'},
  {id:'OBS-003',at:'Step 3',description:'Guest express checkout reuses the cached member price.',requirementId:'REQ-002'},
 ];
 const questions:Question[]=a?[
  {id:'Q-001',prompt:'At 10:05, what does the recorded report path do?',options:[{id:'1',label:'It rechecks access and cancels delivery.'},{id:'2',label:'It remains scheduled without a fresh access check.'},{id:'3',label:'The observations do not mention a report.'}]},
  {id:'Q-002',prompt:'Which behavior does the attached dashboard example establish?',options:[{id:'1',label:'Dashboard denial after withdrawal.'},{id:'2',label:'Cancellation of all queued reports.'},{id:'3',label:'Every access-related path is covered.'}]},
 ]:[
  {id:'Q-001',prompt:'What price does the recorded guest express path reuse?',options:[{id:'1',label:'A freshly calculated guest price.'},{id:'2',label:'No price is recorded.'},{id:'3',label:'The cached member price.'}]},
  {id:'Q-002',prompt:'What does the standard product-page example establish?',options:[{id:'1',label:'Guest express checkout is correct after logout.'},{id:'2',label:'The eligible signed-in member sees the member price.'},{id:'3',label:'All caches are cleared on logout.'}]},
 ];
 if(!readSpecification(source)||!readStakeholderReview(review))throw Error('Invalid frozen scenario.');
 return freeze({schemaVersion:1,id,revision:1,title:source.title,source,review,observations,questions});
}
const SCENARIOS=freeze({A:scenario('A'),B:scenario('B')});
export function getEvaluationScenario(id:ScenarioId):Scenario{if(id!=='A'&&id!=='B')throw Error('Unknown scenario.');return SCENARIOS[id];}
export function projectEvaluationFacts(s:Scenario):EvaluationFact[]{
 const facts:EvaluationFact[]=[{id:'CONTEXT',group:'Context',heading:s.title,text:s.source.goal+' Audience: '+s.source.audience,links:[]}];
 for(const card of projectStakeholderRules(s.source,s.review)){
  facts.push({id:card.id,group:'Business rules',heading:card.title,text:card.statement+' Priority: '+card.priority+'.',links:[]});
  for(const criterion of card.sourceCriteria)facts.push({id:card.id+'/'+criterion.id,group:'Business rules',heading:'Acceptance condition',text:criterion.text,links:[card.id]});
  facts.push({id:card.id+'/COVERAGE',group:'Workflows and coverage',heading:'Coverage',text:card.coverage+'. Review decision: '+s.review.rules.find(r=>r.requirementId===card.id)!.decision.status+'.',links:[card.id]});
  for(const w of card.workflows)facts.push({id:w.id,group:'Workflows and coverage',heading:w.kind==='background'?'Background / scheduled workflow':'Interactive workflow',text:w.label,links:[card.id]});
  for(const edge of card.edges)facts.push({id:edge.id,group:'Workflows and coverage',heading:'Edge / timing condition',text:edge.description+' Status: '+edge.status+'.',links:[card.id]});
  for(const example of card.examples)facts.push({id:example.id,group:'Workflows and coverage',heading:'Behavioral example',text:'Given '+example.given+'. When '+example.when+'. Then '+example.then+'.',links:[card.id,example.workflowId]});
 }
 for(const o of s.observations)facts.push({id:o.id,group:'Observed sequence',heading:o.at,text:o.description,links:[o.requirementId]});
 return facts;
}
export function evaluationParity(visual:EvaluationFact[],text:EvaluationFact[]):boolean{
 const normalized=(facts:EvaluationFact[])=>canonicalJSON([...facts].sort((a,b)=>a.id.localeCompare(b.id)));
 return visual.length>0&&new Set(visual.map(f=>f.id)).size===visual.length&&new Set(text.map(f=>f.id)).size===text.length&&normalized(visual)===normalized(text);
}
export async function scenarioDigest(id:ScenarioId){return sha256(canonicalJSON(getEvaluationScenario(id)));}
export type Assignment={scenarioId:ScenarioId;condition:Condition};
export function allocateEvaluation(index:number):Assignment[]{
 if(!Number.isSafeInteger(index)||index<0||index>999999)throw Error('Allocation slot must be between 0 and 999999.');
 const cells:Assignment[][]=[[{scenarioId:'A',condition:'visual'},{scenarioId:'B',condition:'text'}],[{scenarioId:'A',condition:'text'},{scenarioId:'B',condition:'visual'}],[{scenarioId:'B',condition:'visual'},{scenarioId:'A',condition:'text'}],[{scenarioId:'B',condition:'text'},{scenarioId:'A',condition:'visual'}]];
 return structuredClone(cells[index%4]);
}
export type Finding={requirementId:string;judgement:Judgement;evidenceIds:string[];rationale:string};
export type Trial={assignmentIndex:number;scenarioId:ScenarioId;condition:Condition;scenarioRevision:1;scenarioDigest:string;startedAt:string;reviewSubmittedAt:string|null;completedAt:string|null;reviewElapsedMs:number|null;predictionElapsedMs:number|null;findings:Finding[];predictions:{questionId:string;optionId:string}[];status:'review'|'prediction'|'completed'|'abandoned'};
export type EvaluationSession={schemaVersion:1;kind:'visual-sdd-evaluation';studyVersion:typeof STUDY_VERSION;sessionId:string;allocationIndex:number;unit:'individual'|'pair';consent:{version:'rehearsal-v1';acceptedAt:string;text:string};assignments:Assignment[];createdAt:string;trials:Trial[];status:'active'|'completed'};
const check=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const date=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&v.length<=35&&Number.isFinite(Date.parse(v));
const keys=(o:unknown,expected:string[])=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===[...expected].sort().join('|');
const duration=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=86400000;
const idPattern=/^EVAL-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function createEvaluationSession(sessionId:string,allocationIndex:number,unit:'individual'|'pair',consent:boolean,at=new Date().toISOString()):EvaluationSession{
 check(consent,'Explicit rehearsal consent is required.');check(idPattern.test(sessionId)&&date(at)&&['individual','pair'].includes(unit),'Invalid session identity or date.');
 return {schemaVersion:1,kind:'visual-sdd-evaluation',studyVersion:STUDY_VERSION,sessionId,allocationIndex,unit,consent:{version:'rehearsal-v1',acceptedAt:at,text:CONSENT_TEXT},assignments:allocateEvaluation(allocationIndex),createdAt:at,trials:[],status:'active'};
}
export function validateFindings(id:ScenarioId,findings:Finding[]):void{
 const s=getEvaluationScenario(id),facts=projectEvaluationFacts(s);
 check(Array.isArray(findings)&&findings.length===s.source.requirements.length,'Review every business rule.');
 check(new Set(findings.map(f=>f?.requirementId)).size===findings.length,'Duplicate finding.');
 for(const f of findings){
  check(keys(f,['requirementId','judgement','evidenceIds','rationale'])&&s.source.requirements.some(r=>r.id===f.requirementId)&&['mismatch','no-mismatch','unsure'].includes(f.judgement),'Invalid rule finding.');
  check(typeof f.rationale==='string'&&f.rationale.trim().length>=12&&f.rationale.length<=1200&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(f.rationale),'Explain each judgement using 12–1200 characters.');
  check(Array.isArray(f.evidenceIds)&&f.evidenceIds.length>=1&&f.evidenceIds.length<=facts.length&&new Set(f.evidenceIds).size===f.evidenceIds.length&&f.evidenceIds.every(x=>facts.some(v=>v.id===x)),'Select valid evidence for each rule.');
 }
}
export async function startEvaluationTrial(session:EvaluationSession,at=new Date().toISOString()):Promise<EvaluationSession>{
 check(await readEvaluationSession(session),'Session is invalid.');check(session.status==='active'&&date(at),'Cannot start trial.');
 const previous=session.trials.at(-1);check(Date.parse(at)>=Date.parse(previous?.completedAt??previous?.reviewSubmittedAt??previous?.startedAt??session.createdAt),'Trial predates the preceding record.');
 check(!session.trials.some(t=>t.status==='review'||t.status==='prediction'),'Complete or explicitly restart the open trial.');
 check(session.trials.length<8,'Rehearsal restart limit reached. Export the record.');
 const assignmentIndex=session.trials.filter(t=>t.status==='completed').length,a=session.assignments[assignmentIndex];check(a,'No remaining assignment.');
 const trial:Trial={assignmentIndex,...a,scenarioRevision:1,scenarioDigest:await scenarioDigest(a.scenarioId),startedAt:at,reviewSubmittedAt:null,completedAt:null,reviewElapsedMs:null,predictionElapsedMs:null,findings:[],predictions:[],status:'review'};
 return {...session,trials:[...session.trials,trial]};
}
export function submitEvaluationReview(session:EvaluationSession,findings:Finding[],elapsedMs:number,at=new Date().toISOString()):EvaluationSession{
 const t=session.trials.at(-1);check(t?.status==='review'&&date(at)&&duration(elapsedMs),'No current review or invalid timer.');validateFindings(t!.scenarioId,findings);
 check(Date.parse(at)>=Date.parse(t!.startedAt),'Submission predates the trial.');
 return {...session,trials:[...session.trials.slice(0,-1),{...t!,status:'prediction',reviewSubmittedAt:at,reviewElapsedMs:Math.round(elapsedMs),findings:structuredClone(findings)}]};
}
export function submitEvaluationPredictions(session:EvaluationSession,predictions:{questionId:string;optionId:string}[],elapsedMs:number,at=new Date().toISOString()):EvaluationSession{
 const t=session.trials.at(-1);check(t?.status==='prediction'&&date(at)&&duration(elapsedMs),'No current prediction check or invalid timer.');
 const questions=getEvaluationScenario(t!.scenarioId).questions;
 check(Array.isArray(predictions)&&predictions.length===questions.length&&new Set(predictions.map(p=>p.questionId)).size===questions.length&&predictions.every(p=>keys(p,['questionId','optionId'])&&questions.some(q=>q.id===p.questionId&&q.options.some(o=>o.id===p.optionId))),'Answer each prediction question.');
 check(Date.parse(at)>=Date.parse(t!.reviewSubmittedAt!),'Prediction predates review.');
 const trials=[...session.trials.slice(0,-1),{...t!,status:'completed' as const,completedAt:at,predictionElapsedMs:Math.round(elapsedMs),predictions:structuredClone(predictions)}];
 return {...session,trials,status:trials.filter(v=>v.status==='completed').length===2?'completed':'active'};
}
export function abandonEvaluationTrial(session:EvaluationSession):EvaluationSession{
 const t=session.trials.at(-1);check(t&&(t.status==='review'||t.status==='prediction'),'No open trial.');
 return {...session,trials:[...session.trials.slice(0,-1),{...t!,status:'abandoned'}]};
}
export async function readEvaluationSession(value:unknown):Promise<EvaluationSession|null>{
 try{
  check(keys(value,['schemaVersion','kind','studyVersion','sessionId','allocationIndex','unit','consent','assignments','createdAt','trials','status']),'Unsupported session fields.');
  const s=value as EvaluationSession;
  check(s.schemaVersion===1&&s.kind==='visual-sdd-evaluation'&&s.studyVersion===STUDY_VERSION&&idPattern.test(s.sessionId)&&['individual','pair'].includes(s.unit)&&['active','completed'].includes(s.status)&&date(s.createdAt),'Invalid session.');
  check(keys(s.consent,['version','acceptedAt','text'])&&s.consent.version==='rehearsal-v1'&&s.consent.text===CONSENT_TEXT&&s.consent.acceptedAt===s.createdAt,'Invalid consent.');
  check(canonicalJSON(s.assignments)===canonicalJSON(allocateEvaluation(s.allocationIndex))&&Array.isArray(s.trials)&&s.trials.length<=8,'Invalid allocation.');
  let completed=0,open=false,previous=s.createdAt;
  for(const [i,t] of s.trials.entries()){
   check(keys(t,['assignmentIndex','scenarioId','condition','scenarioRevision','scenarioDigest','startedAt','reviewSubmittedAt','completedAt','reviewElapsedMs','predictionElapsedMs','findings','predictions','status']),'Unsupported trial fields.');
   const a=s.assignments[completed];check(a&&t.assignmentIndex===completed&&t.scenarioId===a.scenarioId&&t.condition===a.condition&&t.scenarioRevision===1&&t.scenarioDigest===await scenarioDigest(t.scenarioId),'Stale or mismatched scenario.');
   check(date(t.startedAt)&&Date.parse(t.startedAt)>=Date.parse(previous)&&['review','prediction','completed','abandoned'].includes(t.status)&&Array.isArray(t.findings)&&Array.isArray(t.predictions),'Invalid trial state.');
   if(t.status==='review'||t.status==='prediction'){check(!open&&i===s.trials.length-1,'Open trial must be last.');open=true;}
   if(t.reviewSubmittedAt!==null){check(date(t.reviewSubmittedAt)&&Date.parse(t.reviewSubmittedAt)>=Date.parse(t.startedAt)&&duration(t.reviewElapsedMs),'Invalid review clock.');validateFindings(t.scenarioId,t.findings);}else check(t.reviewElapsedMs===null&&t.findings.length===0,'Incomplete review.');
   if(t.status==='prediction'||t.status==='completed')check(t.reviewSubmittedAt!==null,'Review missing.');
   if(t.status==='review')check(t.reviewSubmittedAt===null,'Review already submitted.');
   if(t.status==='completed'){
    check(date(t.completedAt)&&Date.parse(t.completedAt)>=Date.parse(t.reviewSubmittedAt!)&&duration(t.predictionElapsedMs),'Invalid prediction clock.');
    submitEvaluationPredictions({...s,trials:[{...t,status:'prediction',completedAt:null,predictionElapsedMs:null,predictions:[]}]},t.predictions,t.predictionElapsedMs!,t.completedAt!);completed++;
   }else check(t.completedAt===null&&t.predictionElapsedMs===null&&t.predictions.length===0,'Unexpected completion data.');
   previous=t.completedAt??t.reviewSubmittedAt??t.startedAt;
  }
  check((s.status==='completed')===(completed===2),'Session completion mismatch.');return structuredClone(s);
 }catch{return null;}
}
export async function evaluationJSON(session:EvaluationSession):Promise<string>{check(session.status==='completed'&&await readEvaluationSession(session),'Only a validated completed rehearsal can be exported.');return JSON.stringify(session,null,2);}
export function csvCell(value:unknown):string{let text=String(value??'');if(/^[=+\-@\t\r]/.test(text.trimStart())||/^[\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
export async function evaluationCSV(session:EvaluationSession):Promise<string>{
 await evaluationJSON(session);
 const rows:unknown[][]=[['study_version','session_id','unit','allocation_index','trial_index','scenario','scenario_revision','scenario_digest','condition','trial_status','started_at','review_submitted_at','completed_at','review_elapsed_ms','prediction_elapsed_ms','requirement_id','judgement','evidence_ids','rationale','predictions','prior_restarts']];
 for(const t of session.trials.filter(v=>v.status==='completed'))for(const f of t.findings)rows.push([session.studyVersion,session.sessionId,session.unit,session.allocationIndex,t.assignmentIndex,t.scenarioId,t.scenarioRevision,t.scenarioDigest,t.condition,t.status,t.startedAt,t.reviewSubmittedAt,t.completedAt,t.reviewElapsedMs,t.predictionElapsedMs,f.requirementId,f.judgement,f.evidenceIds.join(';'),f.rationale,JSON.stringify(t.predictions),session.trials.filter(v=>v.status==='abandoned'&&v.assignmentIndex===t.assignmentIndex).length]);
 return rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
