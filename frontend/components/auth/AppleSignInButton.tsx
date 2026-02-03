"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface AppleSignInButtonProps {
  onError?: (error: string) => void
}

export default function AppleSignInButton({ onError }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log("[AppleSignIn] Starting Apple OAuth...")

      // Use redirect: true for OAuth providers - this opens Apple's sign-in
      await signIn("apple", {
        callbackUrl: "/dashboard",
        redirect: true
      })
    } catch (error) {
      console.error("[AppleSignIn] Error:", error)
      onError?.("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-3"
      onClick={handleAppleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      )}
      {isLoading ? "Signing in..." : "Continue with Apple"}
    </Button>
  )
}
