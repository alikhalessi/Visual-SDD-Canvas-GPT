import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification,revise,addRequirement,removeRequirement,updateRequirement,addCriterion,removeCriterion,updateCriterion,validateSpecification,approveSpecification,readSpecification,toMarkdown} from '../lib/spec-core.ts';
const NOW='2026-11-05T12:00:00.000Z';
const IDEA='Create a booking website for the local neighborhood wellness studio';
function complete(){
 let s=createSpecification(IDEA,NOW);
 s=revise(s,{title:'Neighborhood studio booking',goal:'Customers can reserve an appointment without calling the studio.',audience:'Customers and reception staff'},NOW);
 s=updateRequirement(s,'REQ-001',{title:'Reserve available time',statement:'Customers can select an available slot and confirm a reservation.'},NOW);
 s=updateCriterion(s,'REQ-001','AC-001','Given a free slot, when a customer books, then a confirmation appears.',NOW);
 return s;
}
test('new specification captures the original idea but invents no approved behavior',()=>{const s=createSpecification(IDEA,NOW);assert.equal(s.sourceIdea,IDEA);assert.equal(s.requirements[0].statement,'');assert.equal(s.approval.status,'draft');});
test('incomplete requirements never receive approval',()=>{assert.ok(validateSpecification(createSpecification(IDEA,NOW)).length>=4);assert.throws(()=>approveSpecification(createSpecification(IDEA,NOW),NOW));});
test('complete specification validates',()=>assert.deepEqual(validateSpecification(complete()),[]));
test('approval preserves the exact revision',()=>{const s=complete();const approved=approveSpecification(s,NOW);assert.equal(approved.approval.approvedRevision,s.revision);});
test('any edit invalidates approval automatically',()=>{const s=approveSpecification(complete(),NOW);const newer=revise(s,{goal:'Customers can reserve and confirm appointments online without telephone calls.'},NOW);assert.equal(newer.approval.status,'draft');assert.equal(newer.approval.approvedAt,null);});
test('requirements can be added and removed',()=>{let s=addRequirement(complete(),NOW);assert.equal(s.requirements.length,2);s=removeRequirement(s,s.requirements[1].id,NOW);assert.equal(s.requirements.length,1);});
test('each acceptance criterion belongs to its requirement',()=>{let s=addCriterion(complete(),'REQ-001',NOW);assert.equal(s.requirements[0].criteria.length,2);s=removeCriterion(s,'REQ-001',s.requirements[0].criteria[1].id,NOW);assert.equal(s.requirements[0].criteria.length,1);});
test('placeholder acceptance conditions cannot pass validation',()=>{const s=updateCriterion(complete(),'REQ-001','AC-001','Given [context], when [action], then [result]',NOW);assert.ok(validateSpecification(s).some(x=>x.field.includes('AC-001')));});
test('duplicate requirement identifiers do not validate',()=>{const s=complete();const bad=revise(s,{requirements:[...s.requirements,{...s.requirements[0]}]},NOW);assert.ok(validateSpecification(bad).some(x=>x.message.includes('unique')));});
test('approved JSON round-trips through a checked parser',()=>{const s=approveSpecification(complete(),NOW);assert.deepEqual(readSpecification(JSON.parse(JSON.stringify(s))),s);});
test('tampered approval revision is rejected',()=>{const s=approveSpecification(complete(),NOW);s.approval.approvedRevision=0;assert.equal(readSpecification(s),null);});
test('oversized local storage document is rejected',()=>{const s=complete();s.title='a'.repeat(250);assert.equal(readSpecification(s),null);});
test('Markdown export preserves testable checks and provenance',()=>{const md=toMarkdown(approveSpecification(complete(),NOW));assert.match(md,/REQ-001/);assert.match(md,/AC-001/);assert.match(md,/Approval: approved/);assert.match(md,/No AI model execution/);});
test('short or empty ideas are refused',()=>assert.throws(()=>createSpecification('small',NOW),/12 characters/));
