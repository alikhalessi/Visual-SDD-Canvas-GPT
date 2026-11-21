import {createEvaluationSession,startEvaluationTrial,submitEvaluationReview,submitEvaluationPredictions,getEvaluationScenario,projectEvaluationFacts} from '../../lib/evaluation-core.ts';
export const EVAL_TIME='2026-11-21T01:00:00.000Z';
export const EVAL_ID='EVAL-75c4ed99-209e-44d9-8ea7-01efc2e52ccd';
export function rehearsalFindings(id,rationale='The cited synthetic observation supports this judgement.'){
 const s=getEvaluationScenario(id);
 return s.source.requirements.map((r,i)=>({requirementId:r.id,judgement:i?'mismatch':'no-mismatch',evidenceIds:[i?'OBS-003':'OBS-001'],rationale}));
}
export function rehearsalPredictions(id){return getEvaluationScenario(id).questions.map(q=>({questionId:q.id,optionId:q.options[0].id}));}
export async function completedRehearsal(index=0,rationale){
 let s=createEvaluationSession(EVAL_ID,index,'individual',true,EVAL_TIME);
 for(let i=0;i<2;i++){s=await startEvaluationTrial(s,EVAL_TIME);const id=s.trials.at(-1).scenarioId;s=submitEvaluationReview(s,rehearsalFindings(id,rationale),1200,EVAL_TIME);s=submitEvaluationPredictions(s,rehearsalPredictions(id),600,EVAL_TIME);}
 return s;
}
// Deliberately artificial oracle for scoring mechanics, not the study reference answers.
export async function syntheticScoringReference(){
 const scenarios=[];
 for(const id of ['A','B']){const {scenarioDigest}=await import('../../lib/evaluation-core.ts');const s=getEvaluationScenario(id);
  scenarios.push({scenarioId:id,scenarioRevision:1,scenarioDigest:await scenarioDigest(id),rules:s.source.requirements.map(r=>({requirementId:r.id,mismatch:id==='A',evidenceIds:[projectEvaluationFacts(s)[0].id]})),predictions:rehearsalPredictions(id)});
 }
 return {schemaVersion:1,kind:'private-evaluation-reference',version:'artificial-unit-test-oracle',scenarios};
}
