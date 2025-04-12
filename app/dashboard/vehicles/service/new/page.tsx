import { redirect } from "next/navigation"
import { NewVehicleServiceForm } from "@/components/new-vehicle-service-form"
import { getCurrentUser } from "@/lib/auth"

export default async function NewVehicleServicePage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  // Only admins and fleet managers can create vehicle services
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard/vehicles/service")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Service Record</h1>
        <p className="text-gray-500">Add a new service record for a vehicle</p>
      </div>

      <NewVehicleServiceForm />
    </div>
  )
}
