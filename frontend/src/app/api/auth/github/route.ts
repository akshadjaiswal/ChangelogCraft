/**
 * GitHub OAuth Initiation Route
 *
 * Redirects user to GitHub OAuth authorization page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAuthUrl } from '@/lib/github/oauth';

export async function GET(request: NextRequest) {
  try {
    const authUrl = getGitHubAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[GitHub OAuth] Failed to initiate:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GitHub authentication' },
      { status: 500 }
    );
  }
}
