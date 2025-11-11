/**
 * Changelogs API Route
 *
 * Fetch user's generated changelogs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userQueries, changelogQueries } from '@/lib/supabase/queries';
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

    // Fetch all changelogs for user's repositories
    const { data: changelogs, error } = await supabase
      .from('changelogs')
      .select(`
        *,
        repository:repositories!inner (
          id,
          name,
          full_name,
          html_url,
          language,
          user_id
        )
      `)
      .eq('repository.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Changelogs API] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch changelogs' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedChangelogs = (changelogs || []).map((changelog: any) => ({
      id: changelog.id,
      repositoryId: changelog.repository_id,
      version: changelog.version,
      title: changelog.title,
      content: changelog.content,
      markdown: changelog.markdown,
      commitCount: changelog.commit_count,
      dateFrom: changelog.date_from,
      dateTo: changelog.date_to,
      templateType: changelog.template_type,
      isPublished: changelog.is_published,
      viewCount: changelog.view_count,
      generatedAt: changelog.generated_at,
      createdAt: changelog.created_at,
      repository: {
        id: changelog.repository.id,
        name: changelog.repository.name,
        full_name: changelog.repository.full_name,
        html_url: changelog.repository.html_url,
        language: changelog.repository.language,
      },
    }));

    return NextResponse.json({
      changelogs: transformedChangelogs,
      count: transformedChangelogs.length,
    });
  } catch (error: any) {
    console.error('[Changelogs API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
}
