/**
 * Session Management Utilities
 *
 * Cookie-based session management for authentication.
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'changelogcraft_session';
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'changelogcraft-secret-key-change-in-production'
);
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

interface SessionData {
  userId: string;
  githubId: number;
  username: string;
  expiresAt: number;
}

/**
 * Create a new session token
 */
export async function createSession(data: Omit<SessionData, 'expiresAt'>): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;

  const token = await new SignJWT({
    ...data,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SESSION_SECRET);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);

    const sessionData = payload as unknown as SessionData;

    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('[Session] Verification failed:', error);
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  return verifySession(token.value);
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Refresh session (extend expiration)
 */
export async function refreshSession(sessionData: SessionData): Promise<void> {
  const newToken = await createSession({
    userId: sessionData.userId,
    githubId: sessionData.githubId,
    username: sessionData.username,
  });

  await setSessionCookie(newToken);
}
