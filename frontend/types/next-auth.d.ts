import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      email: string
      full_name: string
      role: string
    } & DefaultSession["user"]
  }

  interface Account {
    djangoAccessToken?: string
    djangoRefreshToken?: string
    djangoUser?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    user?: any
  }
}
