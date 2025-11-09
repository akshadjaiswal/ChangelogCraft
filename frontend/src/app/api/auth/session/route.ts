/**
 * Session Check Route
 *
 * Returns current user session information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ user: null, session: null }, { status: 401 });
    }

    // Get user from database
    const githubId = session.user.user_metadata?.github_id;

    if (!githubId) {
      return NextResponse.json({ user: null, session: null }, { status: 401 });
    }

    const user = await userQueries.getByGithubId(supabase, githubId);

    if (!user) {
      return NextResponse.json({ user: null, session: null }, { status: 401 });
    }

    // Return sanitized user data (without access token)
    return NextResponse.json({
      user: {
        id: user.id,
        githubId: user.github_id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      session: {
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    console.error('[Session] Error checking session:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
