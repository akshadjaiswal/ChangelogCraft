/**
 * Changelog Generation API Route
 *
 * Generate changelog using Groq AI with streaming support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries, repositoryQueries, changelogQueries } from '@/lib/supabase/queries';
import { GroqAPI } from '@/lib/groq/client';
import { CHANGELOG_SYSTEM_PROMPT, buildChangelogUserPrompt } from '@/lib/groq/prompts';
import { GitHubAPI, parseFullName, getDateRangePreset } from '@/lib/github/client';
import type { TemplateType, DateRangePreset } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      repositoryId,
      dateRange = '30days',
      templateType = 'detailed',
    } = body as {
      repositoryId: string;
      dateRange: DateRangePreset;
      templateType: TemplateType;
    };

    // Validate inputs
    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      );
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
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
    const repository = repositories.find(r => r.id.toString() === repositoryId);

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Get date range
    const { since, until } = getDateRangePreset(dateRange);

    // Parse repository name
    const { owner, repo } = parseFullName(repository.full_name);

    // Fetch commits
    const commits = await githubClient.getAllCommits(owner, repo, since, until, 100);

    if (commits.length === 0) {
      return NextResponse.json(
        { error: 'No commits found in the specified date range' },
        { status: 404 }
      );
    }

    // Build AI prompt
    const userPrompt = buildChangelogUserPrompt(
      repository.name,
      commits,
      since,
      until,
      templateType
    );

    // Generate changelog with streaming
    const groqClient = new GroqAPI();
    const stream = await groqClient.createStreamingResponse(
      CHANGELOG_SYSTEM_PROMPT,
      userPrompt
    );

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Changelog Generation] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate changelog' },
      { status: 500 }
    );
  }
}
