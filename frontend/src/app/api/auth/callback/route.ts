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

    // Create Supabase client
    const supabase = await createClient();

    // Upsert user in database
    const user = await userQueries.upsert(supabase, {
      github_id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
      access_token: accessToken,
    });

    // Sign in the user with Supabase auth (create session)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${githubUser.login}@github.changelogcraft.local`,
      password: accessToken, // Use token as password
    });

    // If user doesn't exist in Supabase Auth, create them
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: `${githubUser.login}@github.changelogcraft.local`,
        password: accessToken,
        options: {
          data: {
            github_id: githubUser.id,
            username: githubUser.login,
            avatar_url: githubUser.avatar_url,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }
    }

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
