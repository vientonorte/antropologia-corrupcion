import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'auth-session';
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Signing secret — must be set via NEXTAUTH_SECRET in production.
// Falls back to a fixed dev string so tests and local dev work without config.
const SIGNING_SECRET =
  process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production';

export interface SessionData {
  userId: string;
  userName: string;
  createdAt: number;
}

// ─── HMAC helpers ────────────────────────────────────────────────────────────

/** Returns base64url-encoded HMAC-SHA256 of `payload`. */
function _hmacSign(payload: string): string {
  return crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('base64url');
}

/**
 * Encodes `data` as `base64url(json).hmac` so the cookie value cannot be
 * forged without knowing SIGNING_SECRET.
 */
function _encode(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = _hmacSign(payload);
  return `${payload}.${sig}`;
}

/**
 * Verifies the HMAC signature and returns the decoded `SessionData`, or
 * `null` if the token is malformed or the signature does not match.
 */
function _decode(token: string): SessionData | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = _hmacSign(payload);

  // Constant-time comparison to prevent timing attacks
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    // Buffer lengths differ — signature is invalid
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as SessionData;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, _encode(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return _decode(sessionCookie.value);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
