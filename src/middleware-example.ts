import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { roleAccess } from 'config';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXT_APP_JWT_SECRET });

  // Redirect to login and clear session if no token is found
  if (!token) return redirectToLogin(req);

  const role = token.role as keyof typeof roleAccess;
  const allowedPaths = roleAccess[role];

  // Redirect to login if role is not found in roleAccess
  if (!allowedPaths) return redirectToLogin(req);

  // Allow access if the role has access to all pages (*) or the requested page
  if (allowedPaths.includes('*') || allowedPaths.includes(url)) {
    return NextResponse.next();
  }

  // Redirect to home if the user has a valid token but lacks permission
  return NextResponse.redirect(new URL('/', req.url));
}

// Utility function to redirect to login and clear session cookies
function redirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', req.url));
  ['next-auth.session-token', '__Secure-next-auth.session-token'].forEach((cookie) => response.cookies.set(cookie, '', { maxAge: 0 }));
  return response;
}

export const config = {
  matcher: ['/dashboard', '/scope', '/application', '/api', '/webs', '/dev', '/catalog']
};
