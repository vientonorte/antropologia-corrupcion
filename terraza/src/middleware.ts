import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'auth-session';
const PUBLIC_ROUTES = ['/login', '/api/auth'];
const PROTECTED_ROUTES = ['/corpus', '/codificacion', '/upload', '/grafo'];

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// Simple in-memory rate limiter for auth routes.
// Limits each IP to AUTH_MAX_REQUESTS per AUTH_WINDOW_MS (default: 20 req/min).
// Note: resets on cold-start; adequate for single-user local deployment.

const AUTH_MAX_REQUESTS = 20;
const AUTH_WINDOW_MS = 60_000; // 1 minute

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > AUTH_MAX_REQUESTS) {
    return true;
  }

  return false;
}

// ─── Cookie format check ─────────────────────────────────────────────────────
// Verifies that the session cookie has the signed `payload.signature` format
// produced by session.ts. Full HMAC verification happens in getSession() (Node.js).

function hasValidFormat(value: string): boolean {
  const dot = value.lastIndexOf('.');
  return dot > 0 && dot < value.length - 1;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Rate-limit auth API endpoints
  const isAuthRoute = pathname.startsWith('/api/auth');
  if (isAuthRoute) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera un momento antes de reintentar.' },
        { status: 429 },
      );
    }
  }

  // Allow public routes without session validation
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return undefined;
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return undefined;
  }

  // Verify session for protected routes
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value || !hasValidFormat(sessionCookie.value)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return undefined;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
