import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role
  
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
      redirect("/dashboard/learner") // Default fallback
  }
}
