/**
 * Changelog by ID API Route
 *
 * Fetch specific changelog by its ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[Changelog by ID API] Looking for changelog:', id);

    // Create Supabase client (no auth required for public pages)
    const supabase = await createClient();

    // Get changelog with repository info
    const { data: changelog, error: changelogError } = await supabase
      .from('changelogs')
      .select(`
        *,
        repository:repositories (
          id,
          name,
          full_name,
          description,
          html_url,
          language,
          stars
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single() as { data: any; error: any };

    if (changelogError || !changelog) {
      console.log('[Changelog by ID API] Changelog not found:', id);
      return NextResponse.json(
        { error: 'Changelog not found' },
        { status: 404 }
      );
    }

    console.log('[Changelog by ID API] Changelog found:', changelog.id);

    // Increment view count
    const { error: updateError } = await (supabase as any)
      .from('changelogs')
      .update({ view_count: changelog.view_count + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('[Changelog by ID API] Failed to increment view count:', updateError);
    }

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
        id: changelog.repository.id,
        name: changelog.repository.name,
        fullName: changelog.repository.full_name,
        description: changelog.repository.description,
        htmlUrl: changelog.repository.html_url,
        language: changelog.repository.language,
        stars: changelog.repository.stars,
      },
    });
  } catch (error: any) {
    console.error('[Changelog by ID API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}
