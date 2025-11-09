/**
 * Logout Route
 *
 * Logs out the current user and clears session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie
    await clearSession();

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
