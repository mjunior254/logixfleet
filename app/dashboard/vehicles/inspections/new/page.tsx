import { redirect } from "next/navigation"
import { NewVehicleInspectionForm } from "@/components/new-vehicle-inspection-form"
import { getCurrentUser } from "@/lib/auth"

export default async function NewVehicleInspectionPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  // Only admins and fleet managers can create vehicle inspections
  if (user.role !== "Admin" && user.role !== "FleetManager") {
    redirect("/dashboard/vehicles/inspections")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Inspection</h1>
        <p className="text-gray-500">Add a new inspection record for a vehicle</p>
      </div>

      <NewVehicleInspectionForm />
    </div>
  )
}
