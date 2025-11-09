/**
 * Next.js Middleware
 *
 * Handles authentication and route protection.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and trying to access protected route, redirect to home
    if (!session && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
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
