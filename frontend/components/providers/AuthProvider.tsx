"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { saveTokens, saveUser, getTokens } from "@/lib/auth"

// Component to sync NextAuth session to localStorage for lib/auth.ts compatibility
function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    console.log("[SessionSync] Status:", status)
    console.log("[SessionSync] Session:", session ? "exists" : "null")
    
    // If we already have tokens in localStorage, we're synced
    if (getTokens()) {
      console.log("[SessionSync] Tokens already in localStorage")
      setSynced(true)
      return
    }

    // If session is loading, wait
    if (status === "loading") {
      console.log("[SessionSync] Waiting for session to load...")
      return
    }

    // If no session (not authenticated), allow rendering
    if (status === "unauthenticated") {
      console.log("[SessionSync] Not authenticated, allowing render")
      setSynced(true)
      return
    }

    // If session has tokens, sync them
    if (session?.accessToken && session?.refreshToken && session?.user) {
      console.log("[SessionSync] Syncing tokens to localStorage...")
      saveTokens({
        access: session.accessToken as string,
        refresh: session.refreshToken as string,
      })

      const user = session.user as {
        id?: string
        email?: string
        full_name?: string
        role?: string
      }

      console.log("[SessionSync] User data:", JSON.stringify(user))

      if (user.id && user.email && user.role) {
        saveUser({
          id: user.id,
          email: user.email,
          full_name: user.full_name || "",
          role: user.role as 'learner' | 'tutor' | 'admin' | 'knowledge_partner_instructor' | 'knowledge_partner' | 'super_admin',
        })
        console.log("[SessionSync] User saved to localStorage")
      }
      setSynced(true)
    } else {
      console.log("[SessionSync] Session exists but no tokens:", {
        hasAccessToken: !!session?.accessToken,
        hasRefreshToken: !!session?.refreshToken,
        hasUser: !!session?.user
      })
      // Session exists but no tokens - allow rendering anyway
      setSynced(true)
    }
  }, [session, status])

  // Show loading while syncing OAuth tokens
  if (!synced && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  )
}
