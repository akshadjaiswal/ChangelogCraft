/**
 * Logout Route
 *
 * Logs out the current user and clears session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
