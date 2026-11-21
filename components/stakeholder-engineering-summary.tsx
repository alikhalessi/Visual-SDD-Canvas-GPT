'use client';
import {useEffect,useState} from 'react';
import type {Specification} from '../lib/spec-core';
import {localStakeholderKey,projectStakeholderRules,readStakeholderReview,rebaseStakeholderReview,type StakeholderReviewDocument} from '../lib/stakeholder-view-core';

type Props={spec:Specification|null;projectId:string|null;onReview:()=>void};
/** Read-only engineering projection of the SAME source Specification + stakeholder sidecar.
 * It never silently repairs or overwrites a malformed local review cache.
 */
export default function StakeholderEngineeringSummary({spec,projectId,onReview}:Props){
 const [doc,setDoc]=useState<StakeholderReviewDocument|null>(null);
 const [warning,setWarning]=useState('');
 const key=spec?localStakeholderKey(spec,projectId):'';
 useEffect(()=>{
  if(!spec||!key){setDoc(null);setWarning('');return;}
  try{
   const raw=localStorage.getItem(key);
   if(!raw){setDoc(null);setWarning('No stakeholder review saved in this browser.');return;}
   if(raw.length>2000000)throw Error('Oversized stakeholder review cache');
   const parsed=readStakeholderReview(JSON.parse(raw));
   if(!parsed||parsed.specId!==spec.id||parsed.sourceIdea!==spec.sourceIdea){setDoc(null);setWarning('Stakeholder review cache needs recovery in Business Review Mode.');return;}
   setDoc(rebaseStakeholderReview(parsed,spec));setWarning('');
  }catch{setDoc(null);setWarning('Stakeholder review cache could not be read; it was not changed.');}
 },[key,spec]);
 if(!spec)return null;
 const cards=projectStakeholderRules(spec,doc);
 const approved=cards.filter(x=>x.coverage==='Behaviour Reviewed & Approved').length;
 const flagged=cards.reduce((count,r)=>count+r.edges.filter(e=>e.status==='open').length,0);
 return <section className="engineering-review-summary" aria-label="Stakeholder governance summary">
  <div><span className="eyebrow">STAKEHOLDER GOVERNANCE · SAME SOURCE SPECIFICATION</span>
   <h2>Business review: {approved} / {cards.length} rules approved</h2>
   <p>{flagged} unresolved edge/timing flag(s). {warning||'Stakeholder review is browser-local, bound to the current source revision, and separate from source Specification approval.'}</p></div>
  <button className="business-outline" onClick={onReview}>Open Business Review</button>
 </section>;
}
