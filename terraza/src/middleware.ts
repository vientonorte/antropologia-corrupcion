import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Permite acceso a /login y /api/auth sin validación
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return undefined;
  }

  // Permite acceso a rutas públicas
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return undefined;
  }

  // Protege rutas /admin/*
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('next-auth.session-token');
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return undefined;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
