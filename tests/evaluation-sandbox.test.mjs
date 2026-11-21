import test from 'node:test';
import assert from 'node:assert/strict';
import {readSpecification} from '../lib/spec-core.ts';
import {readStakeholderReview} from '../lib/stakeholder-view-core.ts';
import {getEvaluationScenario,projectEvaluationFacts,evaluationParity,scenarioDigest,allocateEvaluation,createEvaluationSession,startEvaluationTrial,submitEvaluationReview,submitEvaluationPredictions,abandonEvaluationTrial,readEvaluationSession,evaluationJSON,evaluationCSV,csvCell,validateFindings} from '../lib/evaluation-core.ts';
import {scoreEvaluation,validateEvaluationReference} from '../lib/evaluation-scoring.ts';
import {EVAL_ID,EVAL_TIME,rehearsalFindings,rehearsalPredictions,completedRehearsal,syntheticScoringReference} from './fixtures/evaluation.mjs';
const fresh=(index=0)=>createEvaluationSession(EVAL_ID,index,'individual',true,EVAL_TIME);
test('evaluation freezes two valid legacy source/review scenarios without changing approval semantics',()=>{
 for(const id of ['A','B']){const s=getEvaluationScenario(id);assert.ok(readSpecification(s.source));assert.ok(readStakeholderReview(s.review));assert.equal(s.source.approval.status,'draft');assert.equal(s.review.rules[1].edges[0].status,'open');assert.equal(s.review.rules[1].examples.length,0);assert.throws(()=>{s.source.goal='tampered';});}
 assert.throws(()=>getEvaluationScenario('C'));
});
test('scenario identities and SHA-256 digests are fixed and distinct',async()=>{
 assert.equal(await scenarioDigest('A'),'ce5c5a4d14b07507e87c609347fa818657711aedbddfde3df24333839fb2fd4e');
 assert.equal(await scenarioDigest('B'),'7e967a9ac226ac32c1cb7ad3a50e723fa5f535024ce5d0bc9acf77c4ef79f0bf');
});
test('public scenarios provide prompts and choices without reference judgements or scoring keys',()=>{
 const data=JSON.stringify(['A','B'].map(getEvaluationScenario));
 for(const forbidden of ['correctOption','answerKey','correctAnswer','private-evaluation-reference','expectedJudgement'])assert.equal(data.includes(forbidden),false);
});
test('both projections retain identical record IDs, wording, links, open flags and coverage',()=>{
 for(const id of ['A','B']){const a=projectEvaluationFacts(getEvaluationScenario(id));assert.equal(evaluationParity(a,[...structuredClone(a)].reverse()),true);assert.ok(a.some(f=>f.text.includes('Status: open')));assert.ok(a.some(f=>f.text.includes('Example Attached')));}
});
for(const [name,change] of [
 ['missing record',a=>a.pop()],['extra record',a=>a.push({...a[0],id:'EXTRA'})],['duplicate record',a=>a.push(a[0])],['changed wording',a=>a[0].text+=' safe'],['changed link',a=>a[1].links=['wrong']],['hidden open flag',a=>a.find(f=>f.id==='EDGE-004').text='Resolved'],
])test('projection parity rejects '+name,()=>{const a=projectEvaluationFacts(getEvaluationScenario('A')),b=structuredClone(a);change(b);assert.equal(evaluationParity(a,b),false);});
test('four consecutive allocation slots balance scenario, condition and order with reproducible assignments',()=>{
 const cells=[0,1,2,3].map(allocateEvaluation);assert.equal(new Set(cells.map(JSON.stringify)).size,4);
 for(const cell of cells){assert.equal(new Set(cell.map(x=>x.scenarioId)).size,2);assert.equal(new Set(cell.map(x=>x.condition)).size,2);}
 for(const order of [0,1])assert.equal(new Set(cells.map(c=>c[order].scenarioId+'/'+c[order].condition)).size,4);
 assert.deepEqual(allocateEvaluation(8),allocateEvaluation(0));const changed=allocateEvaluation(0);changed[0].scenarioId='B';assert.equal(allocateEvaluation(0)[0].scenarioId,'A');
});
test('allocation rejects negative fractional unbounded and nonnumeric slots',()=>{for(const x of [-1,1.1,1000000,NaN,'0'])assert.throws(()=>allocateEvaluation(x));});
test('rehearsal requires consent a pseudonymous ID and a supported unit',()=>{
 assert.throws(()=>createEvaluationSession(EVAL_ID,0,'individual',false,EVAL_TIME));assert.throws(()=>createEvaluationSession('person@example.com',0,'individual',true,EVAL_TIME));assert.throws(()=>createEvaluationSession(EVAL_ID,0,'secret',true,EVAL_TIME));
});
test('review requires each distinct business rule with rationale and valid evidence',()=>{
 const good=rehearsalFindings('A');validateFindings('A',good);
 for(const edit of [a=>a.pop(),a=>a[1]=a[0],a=>a[0].evidenceIds=['UNKNOWN'],a=>a[0].evidenceIds=[],a=>a[0].evidenceIds=['OBS-001','OBS-001'],a=>a[0].rationale='short',a=>a[0].rationale='x'.repeat(1201),a=>a[0].judgement='approved',a=>a[0].answerKey=true]){const bad=structuredClone(good);edit(bad);assert.throws(()=>validateFindings('A',bad));}
});
test('prediction submission cannot precede review or omit valid question choices',async()=>{
 const s=await startEvaluationTrial(fresh(),EVAL_TIME);assert.throws(()=>submitEvaluationPredictions(s,rehearsalPredictions('A'),1,EVAL_TIME));
 const reviewed=submitEvaluationReview(s,rehearsalFindings('A'),100,EVAL_TIME);
 for(const p of [[],[{questionId:'Q-001',optionId:'invalid'},{questionId:'Q-002',optionId:'1'}],[{questionId:'Q-001',optionId:'1'},{questionId:'Q-001',optionId:'1'}]])assert.throws(()=>submitEvaluationPredictions(reviewed,p,10,EVAL_TIME));
});
test('timers reject invalid durations and reversed submission dates',async()=>{
 const s=await startEvaluationTrial(fresh(),EVAL_TIME);
 for(const d of [-1,NaN,Infinity,86400001])assert.throws(()=>submitEvaluationReview(s,rehearsalFindings('A'),d,EVAL_TIME));
 assert.throws(()=>submitEvaluationReview(s,rehearsalFindings('A'),1,'2026-11-20T01:00:00Z'));
});
test('two completed trials replay with exact assignments and export pseudonymous versioned data',async()=>{
 for(const index of [0,1,2,3]){const s=await completedRehearsal(index);assert.equal(s.status,'completed');assert.deepEqual(await readEvaluationSession(JSON.parse(await evaluationJSON(s))),s);assert.equal(s.trials.length,2);assert.ok((await evaluationCSV(s)).includes(s.sessionId));assert.equal(Object.hasOwn(s,'name'),false);assert.equal(Object.hasOwn(s,'email'),false);}
});
for(const [name,mutate] of [
 ['unknown field',s=>s.answerKey={}],['stale scenario digest',s=>s.trials[0].scenarioDigest='0'.repeat(64)],['changed condition',s=>s.trials[0].condition='text'],['stale study version',s=>s.studyVersion='old'],['missing consent',s=>s.consent.text=''],['duplicate rule',s=>s.trials[0].findings[1]=s.trials[0].findings[0]],['unknown evidence',s=>s.trials[0].findings[0].evidenceIds=['wrong']],['missing prediction',s=>s.trials[0].predictions.pop()],['false completion',s=>s.trials.pop()],['reversed order',s=>s.trials.reverse()],['extra trial data',s=>s.trials[0].email='private@example.com'],
])test('replay fails closed for '+name,async()=>{const s=await completedRehearsal();mutate(s);assert.equal(await readEvaluationSession(s),null);await assert.rejects(()=>evaluationJSON(s));});
test('interrupted trial is retained as abandoned and never exported as a completed trial',async()=>{
 let s=await startEvaluationTrial(fresh(),EVAL_TIME);await assert.rejects(()=>startEvaluationTrial(s,EVAL_TIME));await assert.rejects(()=>evaluationJSON(s));s=abandonEvaluationTrial(s);s=await startEvaluationTrial(s,EVAL_TIME);assert.equal(s.trials.length,2);assert.equal(s.trials[0].status,'abandoned');assert.equal(s.trials[1].assignmentIndex,0);assert.ok(await readEvaluationSession(s));
});
test('trials cannot start before the prior phase ended and replay rejects overlapping trial dates',async()=>{
 let s=await startEvaluationTrial(fresh(),EVAL_TIME);s=submitEvaluationReview(s,rehearsalFindings('A'),1000,'2026-11-21T01:00:10.000Z');s=submitEvaluationPredictions(s,rehearsalPredictions('A'),1000,'2026-11-21T01:00:20.000Z');
 await assert.rejects(()=>startEvaluationTrial(s,'2026-11-21T01:00:15.000Z'));
 s=await startEvaluationTrial(s,'2026-11-21T01:00:21.000Z');s=submitEvaluationReview(s,rehearsalFindings('B'),1000,'2026-11-21T01:00:30.000Z');s=submitEvaluationPredictions(s,rehearsalPredictions('B'),1000,'2026-11-21T01:00:40.000Z');
 s.trials[1].startedAt='2026-11-21T01:00:15.000Z';assert.equal(await readEvaluationSession(s),null);
});
test('repeated interruption is bounded without trimming history',async()=>{
 let s=fresh();for(let i=0;i<8;i++){s=await startEvaluationTrial(s,EVAL_TIME);s=abandonEvaluationTrial(s);}await assert.rejects(()=>startEvaluationTrial(s,EVAL_TIME));assert.equal(s.trials.length,8);
});
test('CSV quotes multiline text and neutralizes spreadsheet formulas without changing JSON',async()=>{
 for(const formula of ['=SUM(1,2)',' +CMD','-1+2','@attack','\tunsafe','\runsafe'])assert.ok(csvCell(formula).startsWith('"\''));
 assert.equal(csvCell('line\n"quoted"'),'"line\n""quoted"""');
 const s=await completedRehearsal(0,'=HYPERLINK("https://example.invalid")');assert.ok((await evaluationCSV(s)).includes("'="));assert.equal(JSON.parse(await evaluationJSON(s)).trials[0].findings[0].rationale,s.trials[0].findings[0].rationale);
});
test('research scoring accepts a separate synthetic oracle and records accuracy errors abstentions evidence and predictions',async()=>{
 const s=await completedRehearsal(),key=await syntheticScoringReference();s.trials[0].findings[0].judgement='unsure';const report=await scoreEvaluation(s,key);
 assert.equal(report.trials[0].abstentions,1);assert.equal(report.trials[0].truePositive,1);assert.equal(report.trials[1].falsePositive,1);assert.equal(report.trials[1].trueNegative,1);assert.equal(report.trials[0].predictionAccuracy,1);assert.equal(report.trials[0].evidenceCompleteness,0);assert.equal(Object.hasOwn(report,'scenarios'),false);
});
test('private scoring refuses stale digests missing rules and invalid options',async()=>{
 for(const edit of [k=>k.scenarios[0].scenarioDigest='0'.repeat(64),k=>k.scenarios[0].rules.pop(),k=>k.scenarios[1].predictions[0].optionId='wrong',k=>k.scenarios[1].scenarioId='A']){const key=await syntheticScoringReference();edit(key);await assert.rejects(()=>validateEvaluationReference(key));}
});
