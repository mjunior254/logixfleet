import { redirect } from "next/navigation"
import { NewUserForm } from "@/components/new-user-form"
import { getCurrentUser } from "@/lib/auth"

export default async function NewUserPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login")
  }

  // Only admins and fleet managers can create users
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      <NewUserForm />
    </div>
  )
}
