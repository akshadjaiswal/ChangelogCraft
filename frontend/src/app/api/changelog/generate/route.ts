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
import { getSession } from '@/lib/auth/session';
import type { TemplateType, DateRangePreset } from '@/types';

export async function POST(request: NextRequest) {
  try {
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

    // Generate changelog (non-streaming for saving to database)
    const groqClient = new GroqAPI();
    const markdown = await groqClient.generateChangelogSync(
      CHANGELOG_SYSTEM_PROMPT,
      userPrompt
    );

    // Save changelog to database
    const dbRepository = await repositoryQueries.getByFullName(supabase, repository.full_name);
    let repoId = dbRepository?.id;

    // If repository not in database, create it
    if (!dbRepository) {
      const newRepo = await repositoryQueries.create(supabase, {
        user_id: user.id,
        github_repo_id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        html_url: repository.html_url,
        language: repository.language,
        stars: repository.stargazers_count,
        is_private: repository.private,
        default_branch: repository.default_branch,
      });
      repoId = newRepo.id;
    }

    // Save changelog
    const changelog = await changelogQueries.create(supabase, {
      repository_id: repoId,
      title: `Changelog - ${repository.name}`,
      content: { raw: markdown },
      markdown: markdown,
      commit_count: commits.length,
      date_from: since.toISOString(),
      date_to: until.toISOString(),
      template_type: templateType,
      is_published: true,
    });

    // Return the generated changelog
    return NextResponse.json({
      success: true,
      changelogId: changelog.id,
      markdown,
      commitCount: commits.length,
      repository: {
        id: repository.id,
        name: repository.name,
        full_name: repository.full_name,
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
