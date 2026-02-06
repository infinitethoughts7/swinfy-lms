import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth

  // Auth routes (login, register) - redirect to dashboard if already authenticated via NextAuth (OAuth)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/login") ||
                      nextUrl.pathname.startsWith("/auth/register")

  // Only redirect authenticated OAuth users from auth routes to dashboard
  // Let dashboard routes pass through - client-side auth will handle email/password login
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/auth/login",
    "/auth/register",
  ],
}
