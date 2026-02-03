import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    error?: string
    user: {
      id: string
      email: string
      full_name: string
      role: string
      avatar_url?: string
    } & DefaultSession["user"]
  }

  interface Account {
    djangoAccessToken?: string
    djangoRefreshToken?: string
    djangoUser?: {
      id: string
      email: string
      full_name: string
      role: string
      avatar_url?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
    user?: {
      id: string
      email: string
      full_name: string
      role: string
      avatar_url?: string
    }
  }
}
