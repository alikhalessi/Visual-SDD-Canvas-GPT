import { auth } from './lib/auth/server';

// Next.js 16 OAuth callback finalizer. The public homepage is not globally
// protected: only OAuth callback requests are routed through this proxy.
// All cloud API operations independently verify the user session and owner ID.
export default auth.middleware({ loginUrl: '/' });

export const config = {
  matcher: [
    { source: '/', has: [{ type: 'query', key: 'code' }] },
    { source: '/', has: [{ type: 'query', key: 'neon_auth_session_verifier' }] },
  ],
};
