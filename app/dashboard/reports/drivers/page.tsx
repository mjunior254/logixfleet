import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { fetchDrivers } from "@/lib/actions"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DriverReportChart } from "@/components/driver-report-chart"
import { DriverReportSummary } from "@/components/driver-report-summary"

export default async function DriverReportPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  const result = await fetchDrivers()
  const drivers = result.data || []

  // Function to export report data (this will be client-side)
  const exportReportData = `
    'use client'
    
    export function exportDriverReport() {
      // Get driver data from the page
      const drivers = window.__DRIVER_DATA__ || []
      
      // Create CSV content
      const headers = ["Name", "Email", "Phone", "License Number", "License Expiry", "Status", "Assigned Vehicle"]
      const csvContent = [
        headers.join(","),
        ...drivers.map(driver => [
          \`\${driver.first_name} \${driver.last_name}\`,
          driver.email,
          driver.phone,
          driver.license_number,
          driver.license_expiry,
          driver.status,
          driver.vehicle_name || "Unassigned"
        ].join(","))
      ].join("\\n")
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "driver_report.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  `

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Reports</h1>
          <p className="text-gray-500">Comprehensive analysis of fleet drivers</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={{
              __html: `(function() { 
                window.__DRIVER_DATA__ = ${JSON.stringify(drivers)};
                (${exportReportData})();
                exportDriverReport();
              })()`,
            }}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{drivers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{drivers.filter((d) => d.status === "Active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Assigned Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{drivers.filter((d) => d.vehicle).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Driver Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverReportChart drivers={drivers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverReportSummary drivers={drivers} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>License Expiry Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <DriverReportChart drivers={drivers} type="license" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
