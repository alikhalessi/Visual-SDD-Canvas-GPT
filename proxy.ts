import {NextRequest,NextResponse} from 'next/server';
import {DEMO_ENABLED} from './lib/demo-config';

// Next.js 16 OAuth callback finalizer. The public homepage is not globally
// protected: only OAuth callback requests are routed through this proxy.
// All cloud API operations independently verify the user session and owner ID.
export default async function proxy(request:NextRequest){
 if(DEMO_ENABLED)return NextResponse.next();
 const {auth}=await import('./lib/auth/server');
 return auth.middleware({loginUrl:'/'})(request);
}

export const config = {
  matcher: [
    { source: '/', has: [{ type: 'query', key: 'code' }] },
    { source: '/', has: [{ type: 'query', key: 'neon_auth_session_verifier' }] },
  ],
};
