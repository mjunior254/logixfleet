import { redirect } from "next/navigation"

// Extend the Window interface to include __VEHICLE_DATA__
declare global {
  interface Window {
    __VEHICLE_DATA__?: any[];
  }
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { fetchVehicles } from "@/lib/actions"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { VehicleReportChart } from "@/components/vehicle-report-chart"
import { VehicleReportSummary } from "@/components/vehicle-report-summary"

export default async function VehicleReportPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  const result = await fetchVehicles()
  const vehicles = result.data || []

  // Function to export report data (this will be client-side)
  const exportReportData = `
    'use client'
    
    export function exportVehicleReport() {
      // Get vehicle data from the page
      const vehicles = window.__VEHICLE_DATA__ || []
      
      // Create CSV content
      const headers = ["License Plate", "Make", "Model", "Type", "Year", "Color", "Fuel Type", "Status"]
      const csvContent = [
        headers.join(","),
        ...vehicles.map(vehicle => [
          vehicle.license_plate,
          vehicle.make,
          vehicle.model,
          vehicle.vehicle_type,
          vehicle.year || "N/A",
          vehicle.color,
          vehicle.fuel_type,
          vehicle.status || "Active"
        ].join(","))
      ].join("\\n")
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "vehicle_report.csv")
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
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Reports</h1>
          <p className="text-gray-500">Comprehensive analysis of fleet vehicles</p>
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
            onClick={() => {
              window.__VEHICLE_DATA__ = vehicles;
              const exportScript = document.createElement("script");
              exportScript.textContent = `
                ${exportReportData}
                exportVehicleReport();
              `;
              document.body.appendChild(exportScript);
              document.body.removeChild(exportScript);
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
            <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {vehicles.filter((v: { status: string; }) => v.status === "Active" || !v.status).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Maintenance Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vehicles.filter((v: { status: string; }) => v.status === "Maintenance").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleReportChart vehicles={vehicles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleReportSummary vehicles={vehicles} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Age Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <VehicleReportChart vehicles={vehicles} type="age" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
