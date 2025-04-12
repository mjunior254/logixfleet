"use client"

type Driver = {
  name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  license_number: string
  license_expiry: string
  status: string
  vehicle?: string
  vehicle_name?: string
}

type DriverReportSummaryProps = {
  drivers: Driver[]
}

export function DriverReportSummary({ drivers }: DriverReportSummaryProps) {
  // Count drivers by status
  const driversByStatus = drivers.reduce(
    (acc, driver) => {
      const status = driver.status || "Unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Count drivers with/without vehicles
  const driversWithVehicle = drivers.filter((d) => d.vehicle).length
  const driversWithoutVehicle = drivers.length - driversWithVehicle

  // Calculate license expiry stats
  const currentDate = new Date()
  const expiredLicenses = drivers.filter((d) => {
    if (!d.license_expiry) return false
    const expiryDate = new Date(d.license_expiry)
    return expiryDate < currentDate
  }).length

  const expiringLicenses = drivers.filter((d) => {
    if (!d.license_expiry) return false
    const expiryDate = new Date(d.license_expiry)
    const diffTime = expiryDate.getTime() - currentDate.getTime()
    const diffDays = diffTime / (1000 * 3600 * 24)
    return diffDays > 0 && diffDays < 30
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Driver Overview</h3>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Drivers:</span>
            <span className="font-medium">{drivers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">With Assigned Vehicle:</span>
            <span className="font-medium">{driversWithVehicle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Without Vehicle:</span>
            <span className="font-medium">{driversWithoutVehicle}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Status Breakdown</h3>
        <div className="mt-2 space-y-2">
          {Object.entries(driversByStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span className="text-gray-500">{status}:</span>
              <span className="font-medium">{count} drivers</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">License Status</h3>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Expired Licenses:</span>
            <span className={`font-medium ${expiredLicenses > 0 ? "text-red-600" : ""}`}>{expiredLicenses}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Expiring in 30 days:</span>
            <span className={`font-medium ${expiringLicenses > 0 ? "text-yellow-600" : ""}`}>{expiringLicenses}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
