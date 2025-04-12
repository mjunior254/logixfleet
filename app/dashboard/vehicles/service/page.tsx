"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table-with-fixed-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Loader2, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, isBefore, addDays } from "date-fns"
import { RestrictedButton } from "@/components/restricted-button"
import { fetchVehicleServices } from "@/lib/actions"

export default function VehicleServicePage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const loadServices = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const result = await fetchVehicleServices()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        setServices(result.data)
      }
    } catch (error) {
      console.error("Error loading vehicle services:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle services. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleRefresh = () => {
    loadServices(true)
  }

  const filteredServices = services.filter((service) => {
    return (
      service.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.type_of_service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_provider?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Vehicle",
      "Service Type",
      "Service Provider",
      "Current Odometer",
      "Next Expected KM",
      "Next Service Date",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredServices.map((service) =>
        [
          service.vehicle,
          service.type_of_service,
          service.service_provider,
          service.current_odometer,
          service.next_expected_km,
          service.next_expected_service_date,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "vehicle_services.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to check service status based on next expected date
  const getServiceStatus = (nextDate: string) => {
    if (!nextDate) return "unknown"

    const today = new Date()
    const nextServiceDate = new Date(nextDate)

    if (isBefore(nextServiceDate, today)) {
      return "overdue"
    }

    // Check if due in the next 7 days
    const sevenDaysFromNow = addDays(today, 7)
    if (isBefore(nextServiceDate, sevenDaysFromNow)) {
      return "due-soon"
    }

    return "scheduled"
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading vehicle service data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Services</h1>
        <p className="text-gray-500">Manage service records for your fleet vehicles</p>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle, service type or provider..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <RestrictedButton
            docType="Vehicle Service"
            permission="create"
            onClick={() => router.push("/dashboard/vehicles/service/new")}
            className="bg-blue-600 hover:bg-blue-700"
            fallbackMessage="You don't have permission to create service records"
            showAlert={true}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Service
          </RestrictedButton>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="table-scroll-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Service Provider</TableHead>
                <TableHead>Current Odometer</TableHead>
                <TableHead>Next Expected KM</TableHead>
                <TableHead>Next Service Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => {
                  const status = getServiceStatus(service.next_expected_service_date)
                  return (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.vehicle}</TableCell>
                      <TableCell>{service.type_of_service}</TableCell>
                      <TableCell>{service.service_provider}</TableCell>
                      <TableCell>{service.current_odometer || "N/A"}</TableCell>
                      <TableCell>{service.next_expected_km || "N/A"}</TableCell>
                      <TableCell>
                        {service.next_expected_service_date
                          ? format(new Date(service.next_expected_service_date), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : status === "due-soon"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status === "scheduled" ? "Scheduled" : status === "due-soon" ? "Due Soon" : "Overdue"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No service records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Service Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {services.filter((s) => getServiceStatus(s.next_expected_service_date) === "scheduled").length}
            </div>
            <div className="text-sm text-gray-500">Scheduled Services</div>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter((s) => getServiceStatus(s.next_expected_service_date) === "due-soon").length}
            </div>
            <div className="text-sm text-gray-500">Due Soon (7 days)</div>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {services.filter((s) => getServiceStatus(s.next_expected_service_date) === "overdue").length}
            </div>
            <div className="text-sm text-gray-500">Overdue Services</div>
          </div>
        </div>
      </div>
    </div>
  )
}
