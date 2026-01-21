import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google") {
        // We'll send token to Django backend later
        return true
      }
      return false
    },
    async jwt({ token, account }) {
      // Store Google ID token to send to Django
      if (account?.id_token) {
        token.googleIdToken = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      // Pass Google ID token to session
      session.googleIdToken = token.googleIdToken as string
      return session
    },
  },
})
