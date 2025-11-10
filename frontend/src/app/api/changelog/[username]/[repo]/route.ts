/**
 * Public Changelog API Route
 *
 * Fetch public changelog for a repository by username and repo name.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { changelogQueries, repositoryQueries } from '@/lib/supabase/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string; repo: string } }
) {
  try {
    const { username, repo } = params;
    const fullName = `${username}/${repo}`;

    // Create Supabase client (no auth required for public pages)
    const supabase = await createClient();

    // Get repository
    const repository = await repositoryQueries.getByFullName(supabase, fullName);

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Get latest published changelog
    const changelog = await changelogQueries.getLatestByRepositoryId(supabase, repository.id);

    if (!changelog) {
      return NextResponse.json(
        { error: 'No changelog found for this repository' },
        { status: 404 }
      );
    }

    // Increment view count
    await changelogQueries.incrementViewCount(supabase, changelog.id);

    // Return changelog data
    return NextResponse.json({
      changelog: {
        id: changelog.id,
        title: changelog.title,
        markdown: changelog.markdown,
        commitCount: changelog.commit_count,
        dateFrom: changelog.date_from,
        dateTo: changelog.date_to,
        templateType: changelog.template_type,
        viewCount: changelog.view_count + 1,
        generatedAt: changelog.generated_at,
      },
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        htmlUrl: repository.html_url,
        language: repository.language,
        stars: repository.stars,
      },
    });
  } catch (error: any) {
    console.error('[Public Changelog API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}
