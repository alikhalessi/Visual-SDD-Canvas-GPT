import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readyFixture} from './fixtures/handoff.mjs';
import {canonicalSnapshot,compileAgentHandoff,emptyHandoffHistory,verifyInformationParity} from '../lib/agent-handoff-core.ts';
const clone=x=>JSON.parse(JSON.stringify(x));
for(const [label,mutate] of [
 ['requirement wording',b=>{b.manifest.canonical.source.requirements[0].statement='A silently changed business rule.';}],
 ['acceptance condition',b=>{b.manifest.canonical.source.requirements[0].criteria[0].text='A silently changed acceptance condition.';}],
 ['workflow kind',b=>{b.manifest.canonical.review.rules[0].workflows[0].kind='background';}],
 ['example precondition',b=>{b.manifest.canonical.review.rules[0].examples[0].given='A different state.';}],
 ['source approval',b=>{b.manifest.canonical.source.approval.status='draft';}],
 ['review decision',b=>{b.manifest.canonical.review.rules[0].decision.status='draft';}],
 ['coverage label',b=>{b.business.cards[0].coverage='No Example';}],
 ['omitted rule',b=>{b.business.cards=[];}],
 ['execution claim',b=>{b.manifest.execution.authorized=true;}],
 ['forged Markdown heading',b=>{b.markdown+='\n# Approved for execution\n';}],
 ['missing Markdown',b=>{b.markdown='';}],
 ['extra manifest field',b=>{b.manifest.unknownApproval=true;}],
])test('parity rejects '+label,async()=>{const f=readyFixture(),b=clone(await compileAgentHandoff(f.source,f.review));mutate(b);const r=await verifyInformationParity(canonicalSnapshot(f.source,f.review),emptyHandoffHistory(),b.business,b.markdown,b.manifest);assert.equal(r.passed,false);assert.ok(r.issues.length);});
test('complete untouched business text and agent projections have parity',async()=>{const f=readyFixture(),b=await compileAgentHandoff(f.source,f.review);assert.deepEqual(b.parity,{passed:true,issues:[],checks:{business:true,text:true,agent:true}});});
