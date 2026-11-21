import {localHandoffHistoryKey} from './agent-handoff-core.ts';
import type {Specification} from './spec-core.ts';
import {localStakeholderKey} from './stakeholder-view-core.ts';
import {localVibeHistoryKey} from './vibe-ingestor-core.ts';

export type CloudReference={id:string;updatedAt:string};
export const CLOUD_LINK_KEY='visual-sdd-cloud-link-v1';
type StoredLink={schemaVersion:1;kind:'cloud-project-link';reference:CloudReference;specId:string|null;sourceIdea:string};
type LocalStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
const validReference=(r:CloudReference)=>r&&typeof r.id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.id)&&typeof r.updatedAt==='string'&&r.updatedAt.length<=70&&Number.isFinite(Date.parse(r.updatedAt));

/** A local identity hint, not an authentication credential or proof of cloud sync. */
export function storeCloudReference(reference:CloudReference,spec:Specification|null,idea:string):StoredLink{
 if(!validReference(reference))throw Error('Invalid cloud project link.');
 return {schemaVersion:1,kind:'cloud-project-link',reference,specId:spec?.id??null,sourceIdea:spec?.sourceIdea??idea.trim().replace(/\s+/g,' ')};
}
export function readCloudReference(value:unknown,spec:Specification|null,idea:string):CloudReference|null{
 if(!value||typeof value!=='object')return null;
 const s=value as StoredLink;
 if(s.schemaVersion!==1||s.kind!=='cloud-project-link'||!validReference(s.reference)||s.specId!==(spec?.id??null)||s.sourceIdea!==(spec?.sourceIdea??idea.trim().replace(/\s+/g,' ')))return null;
 return {id:s.reference.id,updatedAt:s.reference.updatedAt};
}

/** Copy, never move, a guest draft's local notes when its first cloud ID is assigned.
 * Existing destination caches are preserved; unreadable bytes retain their recovery UI.
 */
export function preserveLocalReviewOnFirstSave(storage:LocalStorage,spec:Specification,projectId:string):void{
 const pairs=[
  [localStakeholderKey(spec,null),localStakeholderKey(spec,projectId)],
  [localVibeHistoryKey(spec,null),localVibeHistoryKey(spec,projectId)],
  [localHandoffHistoryKey(spec,null),localHandoffHistoryKey(spec,projectId)],
 ];
 const changes=pairs.map(([source,target])=>({target,raw:storage.getItem(source),previous:storage.getItem(target)})).filter(x=>x.raw!==null&&x.previous===null);
 const attempted:typeof changes=[];
 try{
  for(const change of changes){attempted.push(change);storage.setItem(change.target,change.raw!);}
 }catch{
  let restored=true;
  for(const change of attempted){try{storage.removeItem(change.target);}catch{restored=false;}}
  throw Error('The source was saved to your cloud account, but its local review link could not be saved. Original browser notes were preserved.'+(restored?'':' Export the local records before continuing.'));
 }
}
