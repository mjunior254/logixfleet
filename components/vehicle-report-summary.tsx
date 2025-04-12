"use client"

type Vehicle = {
  license_plate: string
  make: string
  model: string
  year: string | number | null
  vehicle_type: string
  driver?: string
  fuel_type: string
  color: string
  doors: number
  wheels: number
  status?: string
}

type VehicleReportSummaryProps = {
  vehicles: Vehicle[]
}

export function VehicleReportSummary({ vehicles }: VehicleReportSummaryProps) {
  // Get unique makes
  const makes = Array.from(new Set(vehicles.map((v) => v.make))).filter(Boolean)

  // Count vehicles by make
  const vehiclesByMake = vehicles.reduce(
    (acc, vehicle) => {
      const make = vehicle.make || "Unknown"
      acc[make] = (acc[make] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Count vehicles by status
  const vehiclesByStatus = vehicles.reduce(
    (acc, vehicle) => {
      const status = vehicle.status || "Active"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate average age
  const currentYear = new Date().getFullYear()
  const vehiclesWithYear = vehicles.filter((v) => v.year && !isNaN(Number(v.year)))
  const totalAge = vehiclesWithYear.reduce((sum, v) => sum + (currentYear - Number(v.year)), 0)
  const averageAge = vehiclesWithYear.length ? (totalAge / vehiclesWithYear.length).toFixed(1) : "N/A"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Fleet Composition</h3>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Vehicles:</span>
            <span className="font-medium">{vehicles.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Makes:</span>
            <span className="font-medium">{makes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Average Age:</span>
            <span className="font-medium">{averageAge} years</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Top Makes</h3>
        <div className="mt-2 space-y-2">
          {Object.entries(vehiclesByMake)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([make, count]) => (
              <div key={make} className="flex justify-between">
                <span className="text-gray-500">{make}:</span>
                <span className="font-medium">{count} vehicles</span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Status Overview</h3>
        <div className="mt-2 space-y-2">
          {Object.entries(vehiclesByStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span className="text-gray-500">{status}:</span>
              <span className="font-medium">{count} vehicles</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
