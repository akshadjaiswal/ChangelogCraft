/**
 * Repositories API Route
 *
 * Fetch user's GitHub repositories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries } from '@/lib/supabase/queries';
import { GitHubAPI } from '@/lib/github/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const supabase = await createClient();
    const user = await userQueries.getById(supabase, session.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch repositories from GitHub
    const githubClient = new GitHubAPI(user.access_token);
    const repositories = await githubClient.getUserRepositories({
      sort: 'updated',
      direction: 'desc',
      perPage: 100,
    });

    return NextResponse.json({
      repositories,
      count: repositories.length,
    });
  } catch (error: any) {
    console.error('[Repositories API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
