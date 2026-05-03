import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'auth-session';
const PUBLIC_ROUTES = ['/login', '/api/auth'];
const PROTECTED_ROUTES = ['/corpus', '/codificacion', '/upload', '/grafo'];

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

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

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    JSON.parse(sessionCookie.value);
    return undefined;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
