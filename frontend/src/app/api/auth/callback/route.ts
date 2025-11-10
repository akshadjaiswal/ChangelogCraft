/**
 * GitHub OAuth Callback Route
 *
 * Handles the callback from GitHub OAuth, exchanges code for token,
 * fetches user info, and creates/updates user in database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/github/oauth';
import { GitHubAPI } from '@/lib/github/client';
import { createClient } from '@/lib/supabase/server';
import { userQueries } from '@/lib/supabase/queries';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('[GitHub OAuth] Authorization error:', error);
    return NextResponse.redirect(
      new URL(`/?error=auth_failed&message=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate code parameter
  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=auth_failed&message=No authorization code received', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    const accessToken = tokenResponse.access_token;

    // Fetch user information from GitHub
    const githubClient = new GitHubAPI(accessToken);
    const githubUser = await githubClient.getAuthenticatedUser();

    // Create Supabase client (for database only, not auth)
    const supabase = await createClient();

    // Upsert user in database
    const user = await userQueries.upsert(supabase, {
      github_id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
      access_token: accessToken,
    });

    // Create session token
    const sessionToken = await createSession({
      userId: user.id,
      githubId: user.github_id,
      username: user.username,
    });

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('[GitHub OAuth] Callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/?error=auth_failed&message=${encodeURIComponent(error.message || 'Authentication failed')}`,
        request.url
      )
    );
  }
}
