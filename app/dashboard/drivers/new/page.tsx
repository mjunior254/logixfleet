import { redirect } from "next/navigation"
import { NewDriverForm } from "@/components/new-driver-form"
import { getCurrentUser } from "@/lib/auth"

export default async function NewDriverPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  // Only admins and fleet managers can create drivers
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard/drivers")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Driver</h1>
        <p className="text-gray-500">Add a new driver to the system</p>
      </div>

      <NewDriverForm />
    </div>
  )
}
