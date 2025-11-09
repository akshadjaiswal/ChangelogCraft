/**
 * Repository Commits API Route
 *
 * Fetch commits for a specific repository.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries } from '@/lib/supabase/queries';
import { GitHubAPI, parseFullName, getDateRangePreset } from '@/lib/github/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Get date range from query params
    const dateRangeParam = searchParams.get('dateRange') as '7days' | '30days' | '90days' || '30days';
    const { since, until } = getDateRangePreset(dateRangeParam);

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const githubId = session.user.user_metadata?.github_id;
    if (!githubId) {
      return NextResponse.json(
        { error: 'GitHub ID not found' },
        { status: 400 }
      );
    }

    const user = await userQueries.getByGithubId(supabase, githubId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch repository from GitHub
    const githubClient = new GitHubAPI(user.access_token);
    const repositories = await githubClient.getUserRepositories();
    const repository = repositories.find(r => r.id.toString() === params.id);

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Parse owner and repo name
    const { owner, repo } = parseFullName(repository.full_name);

    // Fetch commits
    const commits = await githubClient.getAllCommits(owner, repo, since, until, 100);

    return NextResponse.json({
      commits,
      count: commits.length,
      dateRange: {
        since: since.toISOString(),
        until: until.toISOString(),
      },
      repository: {
        id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
      },
    });
  } catch (error: any) {
    console.error('[Commits API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}
