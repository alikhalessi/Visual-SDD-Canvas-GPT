import {readSpecification,type Specification} from './spec-core.ts';

export type CloudPayload={id:string|null;idea:string;title:string;specification:Specification|null;expectedUpdatedAt:string|null};
export type CloudEvent='project_created'|'idea_saved'|'specification_saved'|'specification_approved'|'specification_reopened';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseCloudPayload(body:unknown):CloudPayload{
 if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid project payload.');
 const raw=body as Record<string,unknown>;
 const id=raw.id===null||raw.id===undefined?null:raw.id;
 if(id!==null&&(typeof id!=='string'||!UUID.test(id)))throw new Error('Invalid project identifier.');
 const idea=raw.idea;
 if(typeof idea!=='string'||idea.trim().length<12||idea.length>600)throw new Error('Idea must be 12–600 characters.');
 const specification=raw.specification===null||raw.specification===undefined?null:readSpecification(raw.specification);
 if(raw.specification!==null&&raw.specification!==undefined&&!specification)throw new Error('Invalid specification document.');
 if(specification&&specification.sourceIdea!==idea.trim().replace(/\s+/g,' '))throw new Error('Specification must match the source idea.');
 const title=typeof raw.title==='string'?raw.title.trim():specification?.title||idea.trim().slice(0,100);
 if(title.length<5||title.length>150)throw new Error('Project title must be 5–150 characters.');
 const expectedUpdatedAt=raw.expectedUpdatedAt===undefined||raw.expectedUpdatedAt===null?null:raw.expectedUpdatedAt;
 if(expectedUpdatedAt!==null&&(typeof expectedUpdatedAt!=='string'||expectedUpdatedAt.length>70||!Number.isFinite(Date.parse(expectedUpdatedAt))))throw new Error('Invalid conflict token.');
 if(id!==null&&expectedUpdatedAt===null)throw new Error('A cloud revision token is required to prevent overwrites.');
 return {id,idea:idea.trim().replace(/\s+/g,' '),title,specification,expectedUpdatedAt};
}
export function inferCloudEvent(previous:{hasSpec:boolean;approved:boolean}|null,next:{hasSpec:boolean;approved:boolean}):CloudEvent{
 if(!previous)return 'project_created';
 if(previous.approved&&!next.approved)return 'specification_reopened';
 if(!previous.approved&&next.approved)return 'specification_approved';
 if(next.hasSpec)return 'specification_saved';
 return 'idea_saved';
}
export function isSameOrigin(origin:string|null,requestUrl:string):boolean{
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(requestUrl).origin;}catch{return false;}
}
