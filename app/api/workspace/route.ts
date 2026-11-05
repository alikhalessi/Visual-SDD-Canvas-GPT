import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {auth} from '../../../lib/auth/server';
import {inferCloudEvent,isSameOrigin,parseCloudPayload} from '../../../lib/cloud-core';

export const runtime='nodejs';
export const dynamic='force-dynamic';
function db(){if(!process.env.DATABASE_URL)throw Error('Database is not configured');return neon(process.env.DATABASE_URL);}
async function getUserId(){
 const session=await auth.getSession();
 const id=session.data?.user?.id;
 return typeof id==='string'&&id.length>0?id:null;
}
function error(message:string,status:number){return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});}
function verifyOrigin(request:NextRequest){return isSameOrigin(request.headers.get('origin'),request.url);}

export async function GET(){
 let userId:string|null;try{userId=await getUserId();}catch{return error('Authentication unavailable.',503);}
 if(!userId)return error('Sign in to access your private workspace.',401);
 try{
  const sql=db();
  const [projects,activity]=await Promise.all([
   sql.query('SELECT id::text AS id,title,idea,specification,revision,approval_status,created_at::text AS created_at,updated_at::text AS updated_at FROM public.visual_sdd_projects WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 100',[userId]),
   sql.query('SELECT id,project_id::text AS project_id,event_type,summary,revision,created_at::text AS created_at FROM public.visual_sdd_activity WHERE owner_id=$1 ORDER BY id DESC LIMIT 80',[userId])
  ]);
  return NextResponse.json({projects,activity},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return error('Could not load your workspace. Please try again.',503);}
}
export async function POST(request:NextRequest){
 if(!verifyOrigin(request))return error('Cross-origin request rejected.',403);
 let userId:string|null;try{userId=await getUserId();}catch{return error('Authentication unavailable.',503);}
 if(!userId)return error('Sign in to save your work.',401);
 if(Number(request.headers.get('content-length')||0)>180000)return error('Project payload too large.',413);
 let data:ReturnType<typeof parseCloudPayload>;
 try{data=parseCloudPayload(await request.json());}catch(e){return error(e instanceof Error?e.message:'Invalid project request.',400);}
 const specJson=data.specification?JSON.stringify(data.specification):null;
 if(specJson&&specJson.length>140000)return error('Specification payload too large.',413);
 const revision=data.specification?.revision||0;
 const approval=data.specification?.approval.status==='approved'?'approved':'draft';
 try{
  const sql=db();
  if(!data.id){
   const id=randomUUID();
   const created=await sql.query(
    'WITH created AS (INSERT INTO public.visual_sdd_projects (id,owner_id,title,idea,specification,revision,approval_status) VALUES ($1::uuid,$2,$3,$4,$5::jsonb,$6,$7) RETURNING id,updated_at), logged AS (INSERT INTO public.visual_sdd_activity (project_id,owner_id,event_type,summary,revision) SELECT id,$2,\'project_created\',$8,$6 FROM created RETURNING id) SELECT id::text AS id,updated_at::text AS updated_at FROM created',
    [id,userId,data.title,data.idea,specJson,revision,approval,'Project created: '+data.title]);
   return NextResponse.json({project:created[0],created:true},{status:201,headers:{'Cache-Control':'no-store'}});
  }
  const previous=await sql.query('SELECT specification IS NOT NULL AS has_spec,approval_status FROM public.visual_sdd_projects WHERE id=$1::uuid AND owner_id=$2 LIMIT 1',[data.id,userId]);
  if(!previous.length)return error('Project not found in your account.',404);
  const event=inferCloudEvent({hasSpec:!!previous[0].has_spec,approved:previous[0].approval_status==='approved'},
   {hasSpec:!!data.specification,approved:approval==='approved'});
  const updated=await sql.query(
   'WITH changed AS (UPDATE public.visual_sdd_projects SET title=$1,idea=$2,specification=$3::jsonb,revision=$4,approval_status=$5,updated_at=now() WHERE id=$6::uuid AND owner_id=$7 AND updated_at=$8::timestamptz RETURNING id,updated_at), logged AS (INSERT INTO public.visual_sdd_activity (project_id,owner_id,event_type,summary,revision) SELECT id,$7,$9,$10,$4 FROM changed RETURNING id) SELECT id::text AS id,updated_at::text AS updated_at FROM changed',
   [data.title,data.idea,specJson,revision,approval,data.id,userId,data.expectedUpdatedAt,event,data.title+' · revision '+revision]);
  if(!updated.length)return error('A newer cloud revision exists. Reload it before saving.',409);
  return NextResponse.json({project:updated[0],created:false},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('Could not save your project. Please try again.',503);}
}
export async function DELETE(request:NextRequest){
 if(!verifyOrigin(request))return error('Cross-origin request rejected.',403);
 let userId:string|null;try{userId=await getUserId();}catch{return error('Authentication unavailable.',503);}
 if(!userId)return error('Sign in to delete a project.',401);
 const id=request.nextUrl.searchParams.get('id');
 if(!id||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return error('Invalid project ID.',400);
 try{const removed=await db().query('DELETE FROM public.visual_sdd_projects WHERE id=$1::uuid AND owner_id=$2 RETURNING id::text AS id',[id,userId]);
 if(!removed.length)return error('Project not found.',404);
 return NextResponse.json({deleted:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('Could not delete the project.',503);}
}
