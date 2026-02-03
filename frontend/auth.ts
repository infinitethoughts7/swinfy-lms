import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import type { JWT } from "next-auth/jwt"

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  if (url.endsWith('/api')) {
    return url
  }
  return `${url}/api`
}

const API_BASE_URL = getApiUrl()

// Token expiration time (25 minutes - refresh before 30 min expiry)
const ACCESS_TOKEN_EXPIRES_IN = 25 * 60 * 1000

// Refresh Django access token using refresh token
async function refreshDjangoToken(token: JWT): Promise<JWT> {
  try {
    console.log("[NextAuth] Refreshing Django access token...")
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    })

    if (!response.ok) {
      console.error("[NextAuth] Token refresh failed:", response.status)
      // Return token with error flag - will force re-login
      return { ...token, error: "RefreshTokenError" }
    }

    const data = await response.json()
    console.log("[NextAuth] Token refreshed successfully")

    return {
      ...token,
      accessToken: data.access,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
      error: undefined,
    }
  } catch (error) {
    console.error("[NextAuth] Error refreshing token:", error)
    return { ...token, error: "RefreshTokenError" }
  }
}

// Authenticate with Django backend for OAuth providers
async function authenticateWithDjango(
  provider: string,
  idToken: string,
  userData?: { email?: string; name?: { firstName?: string; lastName?: string } }
): Promise<{ success: boolean; tokens?: { access: string; refresh: string }; user?: unknown; error?: string }> {
  try {
    const endpoint = provider === "google"
      ? `${API_BASE_URL}/auth/oauth/google/`
      : `${API_BASE_URL}/auth/oauth/apple/`

    const body = provider === "google"
      ? { token: idToken }
      : { id_token: idToken, user: userData }

    console.log(`[NextAuth] Sending ${provider} token to Django: ${endpoint}`)
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[NextAuth] Django ${provider} auth failed:`, response.status, errorData)
      return { success: false, error: errorData.message || "Authentication failed" }
    }

    const data = await response.json()
    return { success: true, tokens: data.tokens, user: data.user }
  } catch (error) {
    console.error(`[NextAuth] Error connecting to Django for ${provider}:`, error)
    return { success: false, error: "Connection failed" }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      // Handle Google OAuth
      if (account?.provider === "google" && account.id_token) {
        const result = await authenticateWithDjango("google", account.id_token)

        if (!result.success) {
          console.error("[NextAuth] Google authentication failed:", result.error)
          return false
        }

        // Store Django tokens in account object for jwt callback
        account.djangoAccessToken = result.tokens!.access
        account.djangoRefreshToken = result.tokens!.refresh
        account.djangoUser = result.user as typeof account.djangoUser
        return true
      }

      // Handle Apple OAuth
      if (account?.provider === "apple" && account.id_token) {
        const userData = user ? {
          email: user.email || undefined,
          name: user.name ? {
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' ')
          } : undefined
        } : undefined

        const result = await authenticateWithDjango("apple", account.id_token, userData)

        if (!result.success) {
          console.error("[NextAuth] Apple authentication failed:", result.error)
          return false
        }

        // Store Django tokens in account object for jwt callback
        account.djangoAccessToken = result.tokens!.access
        account.djangoRefreshToken = result.tokens!.refresh
        account.djangoUser = result.user as typeof account.djangoUser
        return true
      }

      return false
    },

    async jwt({ token, account }) {
      // On initial sign in, save Django tokens with expiration
      if (account?.djangoAccessToken) {
        console.log("[NextAuth JWT] Storing Django tokens in JWT")
        return {
          ...token,
          accessToken: account.djangoAccessToken,
          refreshToken: account.djangoRefreshToken,
          user: account.djangoUser,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
        }
      }

      // Return previous token if not expired
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Token expired, refresh it
      if (token.refreshToken) {
        console.log("[NextAuth JWT] Access token expired, refreshing...")
        return await refreshDjangoToken(token)
      }

      return token
    },

    async session({ session, token }) {
      // Pass Django tokens to client session
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      // Cast to extended session type that includes error
      ;(session as { error?: string }).error = token.error as string | undefined

      if (token.user) {
        session.user = token.user as typeof session.user
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
})
