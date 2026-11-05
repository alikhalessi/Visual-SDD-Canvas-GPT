import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,updateRequirement,updateCriterion,approveSpecification} from '../lib/spec-core.ts';
import {createPlanningDocument,reviseTechnical,approveTechnical,addLinkedTask,reviseLinkedTask,approveTaskBreakdown} from '../lib/workflow-core.ts';
import {
 parsePublicPullUrl,parsePullFact,parsePullFiles,parseCheckRuns,createPullLink,readPullLinks,
 isPullLinkCurrent,linksToTraceEdges,linkHasVerifiedHead,traceMarkdown
} from '../lib/github-trace-core.ts';
const NOW='2026-11-05T21:00:00.000Z';
const IDEA='Appointment booking service for a small regional wellness facility';
const SHA='0123456789abcdef0123456789abcdef01234567',SHA2='abcdefabcdefabcdefabcdefabcdefabcdefabcd';
function approved(){
 let s=createSpecification(IDEA,NOW);
 s=revise(s,{title:'Wellness booking system',goal:'Clients can reserve an appointment and get a confirmation message.',audience:'Clients and reception staff'},NOW);
 s=updateRequirement(s,'REQ-001',{title:'Reserve appointment',statement:'Users can reserve open appointments and obtain a booking confirmation.'},NOW);
 s=updateCriterion(s,'REQ-001','AC-001','When a free slot is selected, the system confirms the reservation.',NOW);
 s=approveSpecification(s,NOW);
 let p=createPlanningDocument(s,NOW);
 p=reviseTechnical(p,{architecture:'Next.js interface, server booking endpoint, and transactional database.',risks:'Concurrent booking requests may produce duplicate reservations.'},NOW);
 p=approveTechnical(s,p,NOW);
 p=addLinkedTask(s,p,NOW);
 p=reviseLinkedTask(p,'TASK-001',{title:'Build booking slot selection and confirmation UI',criterionIds:['AC-001']},NOW);
 p=approveTaskBreakdown(s,p,NOW);
 return {s,p};
}
const locator={repo:'alikhalessi/Visual-SDD-Canvas-GPT',number:7};
function pull(sha=SHA){return {number:7,html_url:'https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/7',title:'Add booking widget',head:{sha},base:{repo:{full_name:locator.repo}},state:'open',draft:false,merged_at:null,changed_files:2};}
function evidence(){const p=parsePullFact(pull(),locator);return {pull:p,files:[{path:'app/page.tsx',status:'modified'}],filesComplete:false,checks:parseCheckRuns({total_count:1,check_runs:[{head_sha:SHA,name:'test',status:'completed',conclusion:'success',html_url:'https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/actions/runs/1'}]},SHA),checkedAt:NOW};}

test('accepts only canonical HTTPS public GitHub pull URLs and compact references',()=>{
 assert.deepEqual(parsePublicPullUrl('https://github.com/alikhalessi/Visual-SDD-Canvas-GPT/pull/7'),locator);
 assert.deepEqual(parsePublicPullUrl('alikhalessi/Visual-SDD-Canvas-GPT#7'),locator);
});
test('rejects private hosts, injected query, issues, traversal and zero PRs',()=>{
 for(const url of ['http://github.com/alikhalessi/repo/pull/1','https://evil.github.com/a/b/pull/1',
  'https://github.com/a/b/pull/1?token=abc','https://github.com/a/b/issues/2',
  'https://github.com/a/../pull/1','https://github.com/a/b/pull/0',
  'https://github.com/a/b/pull/1/commits'])assert.equal(parsePublicPullUrl(url),null,url);
});
test('GitHub metadata must match the exact requested repository, PR number and canonical URL',()=>{
 assert.equal(parsePullFact(pull(),locator)?.headSha,SHA);
 assert.equal(parsePullFact(pull(),{repo:'other/repo',number:7}),null);
 assert.equal(parsePullFact({...pull(),number:8},locator),null);
 assert.equal(parsePullFact({...pull(),html_url:'https://example.org/fake'},locator),null);
});
test('only real 40 hex-digit SHA values qualify',()=>{
 assert.equal(parsePullFact(pull('abc'),locator),null);
 assert.equal(parsePullFact(pull('z'.repeat(40)),locator),null);
});
test('file results are limited and never silently treated as complete when truncated',()=>{
 const raw=[{filename:'app/page.tsx',status:'modified'},{filename:'tests/case.test.mjs',status:'added'}];
 assert.deepEqual(parsePullFiles(raw,2),{files:[{path:'app/page.tsx',status:'modified'},{path:'tests/case.test.mjs',status:'added'}],complete:true});
 assert.equal(parsePullFiles(raw,101).complete,false);
});
test('all check runs must match PR head and be successful for a green status',()=>{
 const c=parseCheckRuns({total_count:2,check_runs:[
  {head_sha:SHA,name:'test',status:'completed',conclusion:'success',html_url:'https://github.com/a/b/actions/runs/1'},
  {head_sha:SHA,name:'build',status:'completed',conclusion:'success',html_url:'https://github.com/a/b/actions/runs/2'}
 ]},SHA);
 assert.equal(c.state,'passed');assert.equal(c.passed,2);assert.equal(c.complete,true);
});
test('pending, failing, skipped-only and absent checks never turn green',()=>{
 const base={head_sha:SHA,name:'CI',html_url:'https://github.com/a/b/actions/runs/1'};
 assert.equal(parseCheckRuns({total_count:1,check_runs:[{...base,status:'in_progress',conclusion:null}]},SHA).state,'pending');
 assert.equal(parseCheckRuns({total_count:1,check_runs:[{...base,status:'completed',conclusion:'failure'}]},SHA).state,'failed');
 assert.equal(parseCheckRuns({total_count:1,check_runs:[{...base,status:'completed',conclusion:'skipped'}]},SHA).state,'unknown');
 assert.equal(parseCheckRuns({total_count:0,check_runs:[]},SHA).state,'unknown');
});
test('truncated check reports or mismatched commit cannot claim all tests passed',()=>{
 const x={total_count:2,check_runs:[{head_sha:SHA,name:'one',status:'completed',conclusion:'success'}]};
 assert.equal(parseCheckRuns(x,SHA).state,'unknown');
 assert.equal(parseCheckRuns({total_count:1,check_runs:x.check_runs},SHA2).state,'unknown');
});
test('link creation requires current human approvals',()=>{
 const {s,p}=approved();
 assert.equal(createPullLink(s,p,'TASK-001',evidence(),NOW).specRevision,s.revision);
 const changed=revise(s,{goal:'Clients can book and cancel appointments without calling reception.'},NOW);
 assert.throws(()=>createPullLink(changed,p,'TASK-001',evidence(),NOW),/approved/);
 assert.throws(()=>createPullLink(s,p,'TASK-999',evidence(),NOW),/task/);
});
test('approval-revision changes make existing source associations stale without deleting them',()=>{
 const {s,p}=approved(),link=createPullLink(s,p,'TASK-001',evidence(),NOW);
 assert.equal(isPullLinkCurrent(link,s,p),true);
 const changed=reviseLinkedTask(p,'TASK-001',{title:'A different appointment user interface'},NOW);
 assert.equal(isPullLinkCurrent(link,s,changed),false);
 assert.equal(linksToTraceEdges(s,changed,[link])[0].current,false);
});
test('pull head force-push is not silently accepted as the original linked commit',()=>{
 const {s,p}=approved(),link=createPullLink(s,p,'TASK-001',evidence(),NOW);
 const next={...evidence(),pull:{...evidence().pull,headSha:SHA2}};
 assert.equal(linkHasVerifiedHead(link,evidence()),true);
 assert.equal(linkHasVerifiedHead(link,next),false);
});
test('invalid local records are ignored and valid records retain revision context',()=>{
 const {s,p}=approved(),link=createPullLink(s,p,'TASK-001',evidence(),NOW);
 assert.deepEqual(readPullLinks([link,{...link,headSha:'not-a-sha'}]),[link]);
 assert.deepEqual(readPullLinks('invalid'),[]);
});
test('trace graph uses explicit task criterion links; no file is attributed to a requirement automatically',()=>{
 const {s,p}=approved(),link=createPullLink(s,p,'TASK-001',evidence(),NOW);
 const edges=linksToTraceEdges(s,p,[link]);
 assert.deepEqual(edges[0].criterionIds,['AC-001']);
 assert.equal(edges[0].taskId,'TASK-001');
 assert.equal(Object.hasOwn(edges[0],'files'),false);
});
test('export is explicit about user mapping, stale records and lack of acceptance proof',()=>{
 const {s,p}=approved(),link=createPullLink(s,p,'TASK-001',evidence(),NOW);
 const markdown=traceMarkdown([link],s,p);
 assert.match(markdown,/REQ-001/);assert.match(markdown,/TASK-001/);
 assert.match(markdown,/human asserted/);assert.match(markdown,/does not prove/);
});
