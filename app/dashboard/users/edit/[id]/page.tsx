import { redirect } from "next/navigation"
import { EditUserForm } from "@/components/edit-user-form"
import { getCurrentUser } from "@/lib/auth"
import { fetchUserById } from "@/lib/actions"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  // Only admins and fleet managers can edit users
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard")
  }

  const result = await fetchUserById(params.id)

  if (result.error || !result.data) {
    redirect("/dashboard/users")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-gray-500">Update user information</p>
      </div>

      <EditUserForm userId={params.id} userData={result.data} />
    </div>
  )
}
