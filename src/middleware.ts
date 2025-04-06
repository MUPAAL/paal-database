import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/farms',
  '/admin/users',
  '/admin/system',
  '/overview',
  '/details',
  '/system-overview',
  '/settings',
  '/profile',
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth-test', // Test page for authentication
  '/api/auth/login',
  '/api/auth/token',
  '/api/auth/validate',
  '/api/auth/check',
  '/api/auth/set-cookie',
  '/api/stats',
  '/api/pigs/analytics/time-series',
  '/api/systemmanagement',
  '/_next',
  '/favicon.ico',
];

// Define routes that should redirect to overview if authenticated
const redirectIfAuthenticatedRoutes = [
  '/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, etc.
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for socket.io routes
  if (pathname.includes('/socket.io/') || pathname.includes('/_next/webpack-hmr')) {
    return NextResponse.next();
  }

  // Get token from cookies or authorization header
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.split(' ')[1];

  console.log('Middleware - Token from cookies:', request.cookies.get('token')?.value ? 'Found' : 'Not found');
  console.log('Middleware - Token from headers:', request.headers.get('authorization') ? 'Found' : 'Not found');
  console.log('Middleware - Final token:', token ? 'Found' : 'Not found');

  // Check if user is trying to access a protected route without authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    console.log('Middleware - Redirecting to login from protected route:', pathname);
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  } else if (isProtectedRoute && token) {
    console.log('Middleware - Allowing access to protected route:', pathname);
  }

  // If accessing a route that should redirect when authenticated (like login)
  // and user has a token, redirect to overview
  const shouldRedirectIfAuthenticated = redirectIfAuthenticatedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldRedirectIfAuthenticated && token) {
    // Get user from localStorage or cookies to determine role
    // Since we can't access localStorage in middleware, we'll use a default redirect
    console.log('Middleware - Redirecting from login to overview because user is authenticated');
    return NextResponse.redirect(new URL('/overview', request.url));
  } else if (shouldRedirectIfAuthenticated && !token) {
    console.log('Middleware - Allowing access to login page because user is not authenticated');
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
