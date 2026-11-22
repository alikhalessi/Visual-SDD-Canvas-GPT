import {NextRequest,NextResponse} from 'next/server';
import {DEMO_ENABLED} from '../../../../lib/demo-config';

export const runtime = 'nodejs';
export async function GET(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 if(DEMO_ENABLED)return NextResponse.json({error:'Cloud accounts are disabled in this sample demo.'},{status:403,headers:{'Cache-Control':'no-store'}});
 const {auth}=await import('../../../../lib/auth/server');return auth.handler().GET(request,context);
}
export async function POST(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 if(DEMO_ENABLED)return NextResponse.json({error:'Cloud accounts are disabled in this sample demo.'},{status:403,headers:{'Cache-Control':'no-store'}});
 const {auth}=await import('../../../../lib/auth/server');return auth.handler().POST(request,context);
}
