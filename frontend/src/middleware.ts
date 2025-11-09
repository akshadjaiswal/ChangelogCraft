/**
 * Next.js Middleware
 *
 * Handles authentication and route protection.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/api/auth/github', '/api/auth/callback'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/changelog/');

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Check authentication for protected routes
    const sessionCookie = request.cookies.get('changelogcraft_session');

    if (!sessionCookie) {
      // No session cookie, redirect to home
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    // Verify session
    const session = await verifySession(sessionCookie.value);

    // If no valid session and trying to access protected route, redirect to home
    if (!session && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
