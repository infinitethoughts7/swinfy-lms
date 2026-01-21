import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    googleIdToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleIdToken?: string
  }
}
