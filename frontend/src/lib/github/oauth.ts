/**
 * GitHub OAuth Helper Functions
 *
 * Utilities for handling GitHub OAuth authentication flow.
 */

import type { GitHubOAuthResponse } from '@/types';

/**
 * Generate GitHub OAuth authorization URL
 */
export function getGitHubAuthUrl(redirectUri?: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirect = redirectUri || process.env.GITHUB_REDIRECT_URI!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    scope: 'repo read:user user:email',
    state: generateState(),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<GitHubOAuthResponse> {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub OAuth error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data as GitHubOAuthResponse;
  } catch (error) {
    console.error('[OAuth] Failed to exchange code for token:', error);
    throw new Error('Failed to complete GitHub authentication');
  }
}

/**
 * Revoke GitHub access token
 */
export async function revokeToken(accessToken: string): Promise<void> {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

  // Create basic auth string
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.github.com/applications/${clientId}/token`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to revoke token: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[OAuth] Failed to revoke token:', error);
    // Don't throw - revocation failure shouldn't block logout
  }
}

/**
 * Validate GitHub access token
 */
export async function validateToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[OAuth] Failed to validate token:', error);
    return false;
  }
}

/**
 * Generate random state parameter for OAuth security
 */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify OAuth state parameter
 */
export function verifyState(receivedState: string, storedState: string): boolean {
  return receivedState === storedState;
}

/**
 * Store OAuth state in cookie/session
 */
export function storeOAuthState(state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('github_oauth_state', state);
  }
}

/**
 * Retrieve and clear OAuth state from cookie/session
 */
export function retrieveOAuthState(): string | null {
  if (typeof window !== 'undefined') {
    const state = sessionStorage.getItem('github_oauth_state');
    sessionStorage.removeItem('github_oauth_state');
    return state;
  }
  return null;
}

/**
 * Check if token is expired (if expiration data is available)
 */
export function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt;
}

/**
 * Get token expiration timestamp (GitHub tokens don't expire, but useful for session management)
 */
export function getTokenExpiration(): number {
  // Set session to expire in 30 days
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}
