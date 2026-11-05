import {readSpecification,type Specification} from './spec-core.ts';
export type CachedSpecResult=
 |{status:'empty';spec:null;raw:null}
 |{status:'valid';spec:Specification;raw:string}
 |{status:'unreadable';spec:null;raw:string};

const MAX_CACHED_LENGTH=250000;
/**
 * Fail closed on an unreadable browser document. Calling code must not
 * overwrite or remove the original cache unless the user explicitly chooses
 * to recover it. Validation is structural, never an AI judgement.
 */
export function inspectCachedSpecification(raw:string|null):CachedSpecResult{
 if(raw===null)return {status:'empty',spec:null,raw:null};
 if(raw.length>MAX_CACHED_LENGTH)return {status:'unreadable',spec:null,raw};
 try{
  const doc=readSpecification(JSON.parse(raw));
  return doc?{status:'valid',spec:doc,raw}:{status:'unreadable',spec:null,raw};
 }catch{
  return {status:'unreadable',spec:null,raw};
 }
}
export function saveStatusLabel(hasCloudReference:boolean,hasSpecification:boolean):string{
 if(hasCloudReference)return 'Cloud project linked · save again to sync changes';
 return hasSpecification?'Specification is saved in this browser only':'Not synchronized to a cloud account';
}
export function projectReadiness(spec:Specification|null,ideaCaptured:boolean):{
 state:'idea'|'specification'|'approval'|'planning';heading:string;description:string;completed:number
}{
 if(!spec&&!ideaCaptured)return {state:'idea',heading:'Capture a clear product idea',description:'Describe the problem and who needs it. Your draft stays on this device.',completed:0};
 if(!spec)return {state:'specification',heading:'Define the expected outcome',description:'Create a reviewable Specification from your saved idea.',completed:1};
 if(spec.approval.status!=='approved'||spec.approval.approvedRevision!==spec.revision)
  return {state:'approval',heading:'Review the current specification',description:'Resolve validation issues, then explicitly approve the current revision.',completed:2};
 return {state:'planning',heading:'Open your visual planning canvas',description:'Build and review a Technical Plan and linked Tasks. Nothing executes automatically.',completed:3};
}
