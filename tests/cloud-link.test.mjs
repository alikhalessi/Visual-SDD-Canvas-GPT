import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpecification} from '../lib/spec-core.ts';
import {localStakeholderKey} from '../lib/stakeholder-view-core.ts';
import {localVibeHistoryKey} from '../lib/vibe-ingestor-core.ts';
import {readCloudReference,storeCloudReference,preserveLocalReviewOnFirstSave} from '../lib/cloud-link-core.ts';
const spec=createSpecification('Athletes must control access to their coaching reports.');
const ref={id:'11111111-1111-4111-8111-111111111111',updatedAt:'2026-11-21T16:00:00.000Z'};
function storage(entries=[]){const map=new Map(entries);return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
test('cloud identity roundtrips only for its matching source document',()=>{
 const saved=storeCloudReference(ref,spec,spec.sourceIdea);
 assert.deepEqual(readCloudReference(JSON.parse(JSON.stringify(saved)),spec,spec.sourceIdea),ref);
 assert.equal(readCloudReference(saved,{...spec,sourceIdea:'A different source description.'},''),null);
 assert.equal(readCloudReference(saved,{...spec,id:'SPEC-002'},''),null);
 assert.deepEqual(readCloudReference(saved,{...spec,revision:spec.revision+1},''),ref,'local edits keep the original cloud conflict token');
});
test('idea-only project links restore independently of specifications',()=>{
 const saved=storeCloudReference(ref,null,spec.sourceIdea);
 assert.deepEqual(readCloudReference(saved,null,spec.sourceIdea),ref);
 assert.equal(readCloudReference(saved,null,'A different project idea.'),null);
});
test('corrupt cloud links never choose an arbitrary cloud target',()=>{
 for(const value of [null,{},[],{schemaVersion:1,kind:'cloud-project-link',reference:null},storeCloudReference(ref,spec,'')]){
  const bad=value&&value.reference?{...value,reference:{...ref,id:'../../other-project'}}:value;
  assert.equal(readCloudReference(bad,spec,spec.sourceIdea),null);
 }
 assert.throws(()=>storeCloudReference({...ref,updatedAt:'invalid'},spec,''),/Invalid cloud/);
});
test('first cloud save copies exact local review and history bytes while retaining the guest originals',()=>{
 const guestReview=localStakeholderKey(spec,null),guestHistory=localVibeHistoryKey(spec,null);
 const s=storage([[guestReview,'review bytes'],[guestHistory,'history bytes']]);
 preserveLocalReviewOnFirstSave(s,spec,ref.id);
 assert.equal(s.getItem(localStakeholderKey(spec,ref.id)),'review bytes');
 assert.equal(s.getItem(localVibeHistoryKey(spec,ref.id)),'history bytes');
 assert.equal(s.getItem(guestReview),'review bytes');assert.equal(s.getItem(guestHistory),'history bytes');
});
test('existing destination records are never replaced during linking',()=>{
 const target=localStakeholderKey(spec,ref.id),s=storage([[localStakeholderKey(spec,null),'guest'],[target,'existing cloud notes']]);
 preserveLocalReviewOnFirstSave(s,spec,ref.id);assert.equal(s.getItem(target),'existing cloud notes');
});
test('a failed local history copy restores new destination keys and preserves every original',()=>{
 const s=storage([[localStakeholderKey(spec,null),'guest review'],[localVibeHistoryKey(spec,null),'guest history']]);
 const before=[...s.map],write=s.setItem;s.setItem=(k,v)=>{if(k===localVibeHistoryKey(spec,ref.id))throw Error('quota');write(k,v);};
 assert.throws(()=>preserveLocalReviewOnFirstSave(s,spec,ref.id),/source was saved.*Original browser notes were preserved/);
 assert.deepEqual([...s.map],before);
});
