import type {Condition,EvaluationFact} from '../lib/evaluation-core';
export default function EvaluationFacts({facts,condition}:{facts:EvaluationFact[];condition:Condition}){
 const groups=[...new Set(facts.map(f=>f.group))];
 function content(f:EvaluationFact){return <><h3>{f.heading}</h3><p>{f.text}</p><p className="eval-reference">{f.id}{f.links.length?' · Linked to '+f.links.join(', '):''}</p></>;}
 return <section aria-label="Frozen scenario specification" className={'eval-facts eval-'+condition}>
  {condition==='visual'?<div className="eval-lanes">{groups.map(group=><section key={group} className="eval-lane" aria-label={group}><h2>{group}</h2>{facts.filter(f=>f.group===group).map(f=><article data-fact-id={f.id} key={f.id} className="eval-fact">{content(f)}</article>)}</section>)}</div>:
   <div className="eval-structured">{groups.map(group=><section key={group}><h2>{group}</h2><ol>{facts.filter(f=>f.group===group).map(f=><li data-fact-id={f.id} key={f.id}>{content(f)}</li>)}</ol></section>)}</div>}
 </section>;
}
