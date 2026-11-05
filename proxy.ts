import { auth } from './lib/auth/server';

// The landing page stays available to guests, and /api/workspace performs
// its own session + ownership checks so unauthenticated calls return JSON 401.
// The auth proxy is still required to finalize OAuth return callbacks.
export default auth.middleware({
  loginUrl: '/',
  publicRoutes: ['/', '/api/workspace'],
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
