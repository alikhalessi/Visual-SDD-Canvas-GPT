import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readyFixture,TIME} from './fixtures/handoff.mjs';
import {revise,updateRequirement} from '../lib/spec-core.ts';
import {flagEdgeCondition,addBusinessWorkflow} from '../lib/stakeholder-view-core.ts';
import {describeBusinessImpact} from '../lib/business-impact-core.ts';
test('missing baselines explicitly retain uncertainty',()=>{const f=readyFixture(),r=describeBusinessImpact(f.source,f.review,null);assert.equal(r.findings[0].certainty,'unknown');assert.match(r.findings[0].message,/cannot identify all/);});
test('a changed rule names its actual linked workflow and task',()=>{const f=readyFixture(),s=updateRequirement(f.source,'REQ-001',{statement:'The athlete must revoke a grant and invalidate every pending dashboard read.'},TIME),r=describeBusinessImpact(s,f.review,f.plan);assert.ok(r.findings.some(x=>x.workflowIds.includes(f.review.rules[0].workflows[0].id)));assert.deepEqual(r.directTaskIds,['TASK-001']);});
test('an open timing flag is never described as a confirmed workflow',()=>{const f=readyFixture(),review=flagEdgeCondition(f.review,'REQ-001','Queued report delivery after revocation remains unreviewed.',TIME),r=describeBusinessImpact(f.source,review,f.plan);assert.match(r.findings.find(x=>x.edgeIds.length).message,/not a confirmed workflow/);});
test('background coverage without examples and unknown review stay visible',()=>{const f=readyFixture(),review=addBusinessWorkflow(f.review,'REQ-001','Scheduled private report delivery','background',TIME),r=describeBusinessImpact(f.source,review,f.plan);assert.ok(r.findings.some(x=>/No example/.test(x.message)));assert.ok(describeBusinessImpact(revise(f.source,{title:'A revised product name'},TIME),null,f.plan).findings.some(x=>x.certainty==='unknown'));});

test('foreign review identity cannot introduce another project business paths',()=>{const f=readyFixture(),r={...f.review,sourceIdea:'A completely different product source identity.'};const result=describeBusinessImpact(f.source,r,f.plan);assert.ok(result.findings.some(x=>x.certainty==='unknown'));assert.ok(result.findings.every(x=>x.workflowIds.length===0));});
