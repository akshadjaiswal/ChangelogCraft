/**
 * Session Check Route
 *
 * Returns current user session information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries } from '@/lib/supabase/queries';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    // Get user from database
    const supabase = await createClient();
    const user = await userQueries.getById(supabase, session.userId);

    if (!user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
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
        expiresAt: session.expiresAt,
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
