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
  { params }: { params: Promise<{ username: string; repo: string }> }
) {
  try {
    const { username, repo } = await params;
    const fullName = `${username}/${repo}`;

    console.log('[Public Changelog API] Looking for changelog:', { username, repo, fullName });

    // Create Supabase client (no auth required for public pages)
    const supabase = await createClient();

    // Get repository
    const repository = await repositoryQueries.getByFullName(supabase, fullName);

    if (!repository) {
      console.log('[Public Changelog API] Repository not found:', fullName);
      console.log('[Public Changelog API] Trying case-insensitive search...');

      // Try case-insensitive search as fallback
      const { data: repositories } = await supabase
        .from('repositories')
        .select('*')
        .ilike('full_name', fullName) as { data: any[] | null; error: any };

      if (repositories && repositories.length > 0) {
        console.log('[Public Changelog API] Found repository with case mismatch:', repositories[0].full_name);
        const repo = repositories[0];
        const changelog = await changelogQueries.getLatestByRepositoryId(supabase, repo.id);

        if (!changelog) {
          console.log('[Public Changelog API] No changelog found for repository:', repo.id);
          return NextResponse.json(
            { error: 'No changelog found for this repository' },
            { status: 404 }
          );
        }

        // Return changelog data (rest of the response logic below)
        await changelogQueries.incrementViewCount(supabase, changelog.id);

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
            generatedAt: changelog.created_at,
          },
          repository: {
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            htmlUrl: repo.html_url,
            language: repo.language,
            stars: repo.stars,
          },
        });
      }

      return NextResponse.json(
        { error: `Repository "${fullName}" not found in database. Make sure you've generated a changelog for this repository first.` },
        { status: 404 }
      );
    }

    console.log('[Public Changelog API] Repository found:', repository.id);

    // Get latest published changelog
    const changelog = await changelogQueries.getLatestByRepositoryId(supabase, repository.id);

    if (!changelog) {
      console.log('[Public Changelog API] No published changelog found for repository:', repository.id);
      return NextResponse.json(
        { error: 'No changelog found for this repository. Generate one from the dashboard first.' },
        { status: 404 }
      );
    }

    console.log('[Public Changelog API] Changelog found:', changelog.id);

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
