export type Priority='must'|'should'|'could';
export type Criterion={id:string;text:string};
export type Requirement={id:string;title:string;statement:string;priority:Priority;criteria:Criterion[]};
export type Approval={status:'draft'|'approved';approvedAt:string|null;approvedRevision:number|null};
export type Specification={schemaVersion:1;id:string;sourceIdea:string;title:string;goal:string;audience:string;exclusions:string;requirements:Requirement[];revision:number;updatedAt:string;approval:Approval};
export type Issue={field:string;message:string};
const DRAFT:Approval={status:'draft',approvedAt:null,approvedRevision:null};
const normalize=(s:string)=>s.trim().replace(/\s+/g,' ').slice(0,600);
const unresolved=(s:string)=>/\b(TBD|TODO|PLACEHOLDER)\b|\[[^\]]+\]/i.test(s);
export function createSpecification(idea:string,now=new Date().toISOString()):Specification{
 const sourceIdea=normalize(idea);
 if(sourceIdea.length<12)throw new Error('Please enter an idea with at least 12 characters.');
 return {schemaVersion:1,id:'SPEC-001',sourceIdea,title:sourceIdea.split(/[.!?\n]/)[0].slice(0,75),goal:'',audience:'',exclusions:'',requirements:[{id:'REQ-001',title:'Primary user journey',statement:'',priority:'must',criteria:[{id:'AC-001',text:''}]}],revision:1,updatedAt:now,approval:{...DRAFT}};
}
export function revise(s:Specification,patch:Partial<Pick<Specification,'title'|'goal'|'audience'|'exclusions'|'requirements'>>,now=new Date().toISOString()):Specification{
 return {...s,...patch,revision:s.revision+1,updatedAt:now,approval:{...DRAFT}};
}
export function addRequirement(s:Specification,now?:string){
 const max=s.requirements.reduce((n,r)=>Math.max(n,Number(r.id.slice(4))||0),0);
 const id='REQ-'+String(max+1).padStart(3,'0');
 return revise(s,{requirements:[...s.requirements,{id,title:'',statement:'',priority:'must',criteria:[{id:'AC-001',text:''}]}]},now);
}
export function removeRequirement(s:Specification,id:string,now?:string){return revise(s,{requirements:s.requirements.filter(r=>r.id!==id)},now);}
export function updateRequirement(s:Specification,id:string,patch:Partial<Pick<Requirement,'title'|'statement'|'priority'|'criteria'>>,now?:string){return revise(s,{requirements:s.requirements.map(r=>r.id===id?{...r,...patch}:r)},now);}
export function addCriterion(s:Specification,id:string,now?:string){const r=s.requirements.find(r=>r.id===id);if(!r)return s;const max=r.criteria.reduce((n,c)=>Math.max(n,Number(c.id.slice(3))||0),0);return updateRequirement(s,id,{criteria:[...r.criteria,{id:'AC-'+String(max+1).padStart(3,'0'),text:''}]},now);}
export function updateCriterion(s:Specification,id:string,criterionId:string,text:string,now?:string){const r=s.requirements.find(r=>r.id===id);return r?updateRequirement(s,id,{criteria:r.criteria.map(c=>c.id===criterionId?{...c,text}:c)},now):s;}
export function removeCriterion(s:Specification,id:string,criterionId:string,now?:string){const r=s.requirements.find(r=>r.id===id);return r?updateRequirement(s,id,{criteria:r.criteria.filter(c=>c.id!==criterionId)},now):s;}
export function validateSpecification(s:Specification):Issue[]{
 const issues:Issue[]=[];const check=(field:string,value:string,min:number,message:string)=>{if(value.trim().length<min||unresolved(value))issues.push({field,message});};
 check('title',s.title,5,'Provide a meaningful product title (5+ characters).');check('goal',s.goal,15,'Describe the expected user or business outcome (15+ characters).');check('audience',s.audience,4,'Identify who will use the application.');
 if(!s.requirements.length)issues.push({field:'requirements',message:'Add at least one requirement.'});
 if(s.requirements.length>30)issues.push({field:'requirements',message:'Maximum 30 requirements per specification.'});
 const ids=new Set<string>();
 for(const r of s.requirements){
  if(ids.has(r.id))issues.push({field:r.id,message:'Requirement identifiers must be unique.'});ids.add(r.id);
  check(r.id+'.title',r.title,5,r.id+': enter a descriptive title.');
  check(r.id+'.statement',r.statement,15,r.id+': describe observable behavior (15+ characters).');
  if(!r.criteria.length)issues.push({field:r.id+'.criteria',message:r.id+': add at least one acceptance criterion.'});
  if(r.criteria.length>12)issues.push({field:r.id+'.criteria',message:r.id+': maximum 12 criteria.'});
  const cids=new Set<string>();for(const c of r.criteria){if(cids.has(c.id))issues.push({field:r.id+'.'+c.id,message:'Criterion identifiers must be unique.'});cids.add(c.id);check(r.id+'.'+c.id,c.text,12,r.id+' / '+c.id+': write a testable condition (12+ characters).');}
 }
 return issues;
}
export function approveSpecification(s:Specification,now=new Date().toISOString()):Specification{
 const issues=validateSpecification(s);if(issues.length)throw new Error('Specification has '+issues.length+' unresolved validation item(s).');
 return {...s,updatedAt:now,approval:{status:'approved',approvedAt:now,approvedRevision:s.revision}};
}
export function readSpecification(value:unknown):Specification|null{
 if(!value||typeof value!=='object')return null;const s=value as Record<string,unknown>;
 if(s.schemaVersion!==1||typeof s.sourceIdea!=='string'||typeof s.title!=='string'||typeof s.goal!=='string'||typeof s.audience!=='string'||typeof s.exclusions!=='string'||!Array.isArray(s.requirements)||!Number.isSafeInteger(s.revision)||Number(s.revision)<1||typeof s.updatedAt!=='string')return null;
 if(s.sourceIdea.length>600||s.title.length>120||s.goal.length>2000||s.audience.length>500||s.exclusions.length>1000||s.requirements.length>30)return null;
 if(!s.requirements.every((r:unknown)=>{if(!r||typeof r!=='object')return false;const q=r as Record<string,unknown>;return typeof q.id==='string'&&/^REQ-\d{3,}$/.test(q.id)&&typeof q.title==='string'&&q.title.length<=160&&typeof q.statement==='string'&&q.statement.length<=2000&&(q.priority==='must'||q.priority==='should'||q.priority==='could')&&Array.isArray(q.criteria)&&q.criteria.length<=12&&q.criteria.every((c:unknown)=>{if(!c||typeof c!=='object')return false;const item=c as Record<string,unknown>;return typeof item.id==='string'&&/^AC-\d{3,}$/.test(item.id)&&typeof item.text==='string'&&item.text.length<=1000;});}))return null;
 const a=s.approval as Approval|undefined;if(!a||!(a.status==='draft'||a.status==='approved')||!(a.approvedAt===null||typeof a.approvedAt==='string')||!(a.approvedRevision===null||Number.isSafeInteger(a.approvedRevision)))return null;
 if(a.status==='approved'&&(a.approvedRevision!==s.revision||validateSpecification(s as Specification).length))return null;
 return s as Specification;
}
const safe=(s:string)=>s.replace(/[\r\n]+/g,' ').trim();
export function toMarkdown(s:Specification):string{
 const lines=['# '+safe(s.title),'','> Visual SDD structured specification (browser-local export)','> ID: '+s.id+' | Revision: '+s.revision+' | Approval: '+s.approval.status+(s.approval.approvedAt?' ('+s.approval.approvedAt+')':''),'','## Original idea','',s.sourceIdea,'','## Goal','',s.goal,'','## Target audience','',s.audience,'','## Out of scope','',s.exclusions||'Not defined','','## Requirements',''];
 for(const r of s.requirements){lines.push('### '+r.id+' — '+safe(r.title),'','Priority: '+r.priority,'',r.statement,'','**Acceptance criteria**','',...r.criteria.map(c=>'- **'+c.id+'** '+safe(c.text)),'');}
 lines.push('## Traceability','','Source idea → '+s.id+' → '+s.requirements.map(r=>r.id).join(', '),'','_Generated from a user-edited specification. No AI model execution or code verification has been performed._','');
 return lines.join('\n');
}
