// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get token from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  
  // Get the current path
  const path = request.nextUrl.pathname
  
  // Define auth paths and protected paths
  const isAuthPath = path === '/login' || path === '/register' || path === '/'
  const isProtectedPath = path.startsWith('/app')
  
  if (isProtectedPath && (!accessToken || !isAuthenticated)) {
    // Redirect to login if trying to access protected routes without authentication
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (isAuthPath && accessToken && isAuthenticated) {
    // Redirect to app if trying to access auth routes while authenticated
    return NextResponse.redirect(new URL('/app/property', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/app/:path*']
}