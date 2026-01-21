import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  if (url.endsWith('/api')) {
    return url
  }
  return `${url}/api`
}

const API_BASE_URL = getApiUrl()

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          // Send Google token to Django backend
          console.log(`Sending Google token to Django: ${API_BASE_URL}/auth/oauth/google/`)
          const response = await fetch(`${API_BASE_URL}/auth/oauth/google/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error("Django auth failed:", response.status, errorText)
            return false
          }

          const data = await response.json()
          
          // Store Django tokens in account object for jwt callback
          account.djangoAccessToken = data.tokens.access
          account.djangoRefreshToken = data.tokens.refresh
          account.djangoUser = data.user

          return true
        } catch (error) {
          console.error("Error connecting to Django:", error)
          return false
        }
      }
      return false
    },

    async jwt({ token, account }) {
      // On initial sign in, save Django tokens
      if (account?.djangoAccessToken) {
        token.accessToken = account.djangoAccessToken
        token.refreshToken = account.djangoRefreshToken
        token.user = account.djangoUser
      }
      return token
    },

    async session({ session, token }) {
      // Pass Django tokens to client session
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.user = token.user as any
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
