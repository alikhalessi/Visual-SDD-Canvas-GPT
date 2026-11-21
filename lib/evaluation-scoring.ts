/** Research-side scoring only. Reference answers are supplied from a private file. */
import {getEvaluationScenario,projectEvaluationFacts,scenarioDigest,evaluationJSON,type EvaluationSession,type ScenarioId} from './evaluation-core.ts';
export type EvaluationReference={schemaVersion:1;kind:'private-evaluation-reference';version:string;scenarios:{scenarioId:ScenarioId;scenarioRevision:1;scenarioDigest:string;rules:{requirementId:string;mismatch:boolean;evidenceIds:string[]}[];predictions:{questionId:string;optionId:string}[]}[]};
export async function validateEvaluationReference(value:unknown):Promise<EvaluationReference>{
 const k=value as EvaluationReference;
 if(!k||k.schemaVersion!==1||k.kind!=='private-evaluation-reference'||typeof k.version!=='string'||k.version.length>80||!Array.isArray(k.scenarios)||k.scenarios.length!==2||new Set(k.scenarios.map(s=>s.scenarioId)).size!==2)throw Error('Invalid private reference.');
 for(const r of k.scenarios){
  const s=getEvaluationScenario(r.scenarioId),facts=projectEvaluationFacts(s);
  if(r.scenarioRevision!==1||r.scenarioDigest!==await scenarioDigest(s.id)||!Array.isArray(r.rules)||r.rules.length!==s.source.requirements.length||new Set(r.rules.map(x=>x.requirementId)).size!==r.rules.length||!r.rules.every(x=>s.source.requirements.some(q=>q.id===x.requirementId)&&typeof x.mismatch==='boolean'&&Array.isArray(x.evidenceIds)&&x.evidenceIds.length>0&&new Set(x.evidenceIds).size===x.evidenceIds.length&&x.evidenceIds.every(id=>facts.some(f=>f.id===id))))throw Error('Reference does not match frozen scenario.');
  if(!Array.isArray(r.predictions)||r.predictions.length!==s.questions.length||new Set(r.predictions.map(p=>p.questionId)).size!==r.predictions.length||!r.predictions.every(p=>s.questions.some(q=>q.id===p.questionId&&q.options.some(o=>o.id===p.optionId))))throw Error('Invalid prediction reference.');
 }
 return structuredClone(k);
}
export async function scoreEvaluation(session:EvaluationSession,reference:unknown){
 await evaluationJSON(session);const key=await validateEvaluationReference(reference);
 return {schemaVersion:1,kind:'evaluation-research-score',sessionId:session.sessionId,referenceVersion:key.version,rationaleAssessment:'Requires independent human coding; no automatic semantic grading.',trials:session.trials.filter(t=>t.status==='completed').map(t=>{
  const r=key.scenarios.find(v=>v.scenarioId===t.scenarioId)!;
  let truePositive=0,trueNegative=0,falsePositive=0,falseNegative=0,abstentions=0,correctEvidence=0,expectedEvidence=0,selectedEvidence=0;
  for(const f of t.findings){const expected=r.rules.find(v=>v.requirementId===f.requirementId)!;
   if(f.judgement==='unsure')abstentions++;else if(f.judgement==='mismatch'){if(expected.mismatch)truePositive++;else falsePositive++;}else if(expected.mismatch)falseNegative++;else trueNegative++;
   expectedEvidence+=expected.evidenceIds.length;selectedEvidence+=f.evidenceIds.length;correctEvidence+=f.evidenceIds.filter(id=>expected.evidenceIds.includes(id)).length;
  }
  const predictionCorrect=t.predictions.filter(p=>r.predictions.some(q=>q.questionId===p.questionId&&q.optionId===p.optionId)).length;
  return {scenarioId:t.scenarioId,condition:t.condition,order:t.assignmentIndex,truePositive,trueNegative,falsePositive,falseNegative,abstentions,detectionAccuracy:(truePositive+trueNegative)/r.rules.length,evidenceCompleteness:correctEvidence/expectedEvidence,evidencePrecision:selectedEvidence?correctEvidence/selectedEvidence:0,predictionCorrect,predictionTotal:r.predictions.length,predictionAccuracy:predictionCorrect/r.predictions.length,reviewElapsedMs:t.reviewElapsedMs,predictionElapsedMs:t.predictionElapsedMs,priorRestarts:session.trials.filter(v=>v.status==='abandoned'&&v.assignmentIndex===t.assignmentIndex).length};
 })};
}
