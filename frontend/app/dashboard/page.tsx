import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  console.log("[Dashboard] Session:", JSON.stringify(session, null, 2))
  
  if (!session?.user) {
    console.log("[Dashboard] No session, redirecting to login")
    redirect("/auth/login")
  }

  const role = session.user.role
  console.log("[Dashboard] User role:", role)
  
  switch (role) {
    case "learner":
      redirect("/dashboard/learner")
    case "knowledge_partner_instructor":
      redirect("/dashboard/instructor")
    case "knowledge_partner":
      redirect("/dashboard/kp")
    case "super_admin":
      redirect("/dashboard/super-admin")
    default:
      console.log("[Dashboard] Unknown role, defaulting to learner")
      redirect("/dashboard/learner")
  }
}
