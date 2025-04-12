import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { fetchVehicleById } from "@/lib/actions"
import { ArrowLeft, PenToolIcon as Tool, FileText, Car } from "lucide-react"

export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/?error=Please+log+in+to+view+vehicle+details")
  }

  const result = await fetchVehicleById(params.id)

  if (result.error || !result.data) {
    redirect("/dashboard/vehicles?error=Vehicle+not+found+or+unable+to+load+vehicle+details")
  }

  const vehicle = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Details</h1>
          <p className="text-gray-500">
            {vehicle.make} {vehicle.model} - {vehicle.license_plate}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">License Plate</dt>
                <dd>{vehicle.license_plate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Make</dt>
                <dd>{vehicle.make}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Model</dt>
                <dd>{vehicle.model}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Year</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Type</dt>
                <dd>{vehicle.vehicle_type || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      vehicle.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "Maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Fuel Type</dt>
                <dd>{vehicle.fuel_type || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Color</dt>
                <dd>{vehicle.color || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Doors</dt>
                <dd>{vehicle.doors || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Wheels</dt>
                <dd>{vehicle.wheels || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Assigned Driver</dt>
                <dd>{vehicle.driver_name || "Unassigned"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
          <Link href={`/dashboard/vehicles/service/new?vehicle=${vehicle.name || vehicle.license_plate}`}>
            <Tool className="h-6 w-6 mb-1" />
            <span>Schedule Service</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
          <Link href={`/dashboard/vehicles/inspections/new?vehicle=${vehicle.name || vehicle.license_plate}`}>
            <Car className="h-6 w-6 mb-1" />
            <span>Record Inspection</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
          <Link href={`/dashboard/vehicles/history/${vehicle.name || vehicle.license_plate}`}>
            <FileText className="h-6 w-6 mb-1" />
            <span>View History</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
