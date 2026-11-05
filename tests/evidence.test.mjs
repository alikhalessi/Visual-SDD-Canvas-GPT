import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseIssueNumber,extractBotRunId,verifyGitHubEvidence,EVIDENCE_WORKFLOW} from '../lib/run-evidence-core.ts';

test('issue numbers are validated as bounded positive integers',()=>{
 assert.equal(parseIssueNumber('3'),3);
 assert.equal(parseIssueNumber('  412  '),412);
 for(const v of ['0','-1','3a','3/../../secret','1000000000',''])assert.equal(parseIssueNumber(v),null);
});
test('only GitHub Actions bot evidence is trusted',()=>{
 const forged={user:{login:'attacker'},body:'Visual SDD artifact validation PASSED. https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42102571615'};
 assert.equal(extractBotRunId([forged]),null);
});
test('only official repository Actions URLs are parsed',()=>{
 assert.equal(extractBotRunId([{user:{login:'github-actions[bot]'},body:'Visual SDD artifact validation PASSED. https://github.com/other/repo/actions/runs/1234'}]),null);
});
test('real public smoke-test metadata can yield a verified handoff',()=>{
 const run={id:42102571615,name:EVIDENCE_WORKFLOW,status:'completed',conclusion:'success',event:'issues'};
 const artifacts=[{id:13450387405,name:'visual-sdd-evidence-3',expired:false,size_in_bytes:2857}];
 const evidence=verifyGitHubEvidence(3,42102571615,run,artifacts);
 assert.equal(evidence?.issue,3);
 assert.ok(evidence?.artifactUrl.includes('/artifacts/13450387405'));
});
test('build success alone never counts as a verified issue run',()=>{
 const a=[{id:4,name:'visual-sdd-evidence-3',expired:false}];
 assert.equal(verifyGitHubEvidence(3,1,{id:1,name:EVIDENCE_WORKFLOW,status:'completed',conclusion:'failure',event:'issues'},a),null);
 assert.equal(verifyGitHubEvidence(3,1,{id:1,name:EVIDENCE_WORKFLOW,status:'in_progress',conclusion:null,event:'issues'},a),null);
 assert.equal(verifyGitHubEvidence(3,1,{id:1,name:EVIDENCE_WORKFLOW,status:'completed',conclusion:'success',event:'push'},a),null);
});
test('missing or expired evidence artifacts fail closed',()=>{
 const run={id:3,name:EVIDENCE_WORKFLOW,status:'completed',conclusion:'success',event:'issues'};
 assert.equal(verifyGitHubEvidence(3,3,run,[]),null);
 assert.equal(verifyGitHubEvidence(3,3,run,[{id:4,name:'visual-sdd-evidence-3',expired:true}]),null);
});
test('bot comment yields the real Actions run id',()=>{
 const comments=[
  {user:{login:'github-actions[bot]'},body:'Visual SDD artifact validation PASSED. [Official GitHub Actions evidence](https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/42102571615).'}
 ];
 assert.equal(extractBotRunId(comments),42102571615);
});
