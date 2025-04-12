import { redirect } from "next/navigation"
import { DriverTable } from "@/components/driver-table"
import { getCurrentUser } from "@/lib/auth"

export default async function DriversPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
        <p className="text-gray-500">Manage drivers and their vehicle assignments</p>
      </div>

      <DriverTable />
    </div>
  )
}
