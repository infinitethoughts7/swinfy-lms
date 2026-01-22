"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { saveTokens, saveUser, clearTokens } from "@/lib/auth"

// Component to sync NextAuth session to localStorage for lib/auth.ts compatibility
function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Only sync when authenticated and session has tokens
    if (status === "authenticated" && session?.accessToken && session?.refreshToken && session?.user) {
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

      if (user.id && user.email && user.role) {
        saveUser({
          id: user.id,
          email: user.email,
          full_name: user.full_name || "",
          role: user.role as 'learner' | 'tutor' | 'admin' | 'knowledge_partner_instructor' | 'knowledge_partner' | 'super_admin',
        })
        console.log("[SessionSync] User saved to localStorage")
      }
    }
  }, [session, status])

  // Listen for logout events to ensure NextAuth session is cleared
  useEffect(() => {
    const handleLogout = async () => {
      console.log("[SessionSync] Handling logout event - clearing NextAuth session")
      try {
        await signOut({ redirect: false })
      } catch (error) {
        console.error("[SessionSync] Error signing out from NextAuth:", error)
      }
      // Clear localStorage tokens as well
      clearTokens()
    }

    window.addEventListener('userLogout', handleLogout)

    return () => {
      window.removeEventListener('userLogout', handleLogout)
    }
  }, [])

  // Always render children - no conditional returns
  return <>{children}</>
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  )
}
