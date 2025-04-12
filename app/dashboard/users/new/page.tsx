import { redirect } from "next/navigation"
import { NewUserForm } from "@/components/new-user-form"
import { getCurrentUser } from "@/lib/auth"

export default async function NewUserPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  // Only admins and fleet managers can create users
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-gray-500">Add a new user to the system</p>
      </div>

      <NewUserForm />
    </div>
  )
}
