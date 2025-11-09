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
        repository:repositories (
          id,
          name,
          full_name,
          html_url,
          language
        )
      `)
      .eq('repositories.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Changelogs API] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch changelogs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      changelogs: changelogs || [],
      count: changelogs?.length || 0,
    });
  } catch (error: any) {
    console.error('[Changelogs API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
}
