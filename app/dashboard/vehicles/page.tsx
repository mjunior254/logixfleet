"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Download,
  RefreshCw,
  Filter,
  Car,
  X,
  Eye,
  Pencil,
  Wrench,
  ClipboardCheck,
  Fuel,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RestrictedButton } from "@/components/restricted-button"
import { PermissionGate } from "@/components/permission-gate"
import { fetchVehicles } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch vehicles from API
  const loadVehicles = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetchVehicles()
      console.log("Vehicles API response:", response)

      if (response && response.data) {
        // Add mock status if not provided by API
        const vehiclesWithStatus = response.data.map((vehicle: any) => ({
          ...vehicle,
          status: vehicle.status || ["Active", "Maintenance", "Inactive"][Math.floor(Math.random() * 3)],
        }))
        setVehicles(vehiclesWithStatus)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vehicles. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicles. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleRefresh = () => {
    loadVehicles(true)
  }

  // Get unique vehicle types for filter
  const vehicleTypes = Array.from(new Set(vehicles.map((v) => v.vehicle_type))).filter(Boolean)

  // Filter vehicles based on search, type, status, and active tab
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" ? true : vehicle.vehicle_type === typeFilter
    const matchesStatus = statusFilter === "all" ? true : vehicle.status === statusFilter
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "active"
          ? vehicle.status === "Active"
          : activeTab === "maintenance"
            ? vehicle.status === "Maintenance"
            : activeTab === "inactive"
              ? vehicle.status === "Inactive"
              : true

    return matchesSearch && matchesType && matchesStatus && matchesTab
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["License Plate", "Make", "Model", "Type", "Year", "Color", "Fuel Type", "Status", "Driver"]
    const csvContent = [
      headers.join(","),
      ...filteredVehicles.map((vehicle) =>
        [
          vehicle.license_plate,
          vehicle.make,
          vehicle.model,
          vehicle.vehicle_type,
          vehicle.year,
          vehicle.color,
          vehicle.fuel_type,
          vehicle.status || "Active",
          vehicle.driver || "Unassigned",
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "vehicles.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get counts for tabs
  const activeCount = vehicles.filter((vehicle) => vehicle.status === "Active").length
  const maintenanceCount = vehicles.filter((vehicle) => vehicle.status === "Maintenance").length
  const inactiveCount = vehicles.filter((vehicle) => vehicle.status === "Inactive").length

  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      case "Maintenance":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Maintenance
          </Badge>
        )
      case "Inactive":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-gray-500">Manage your fleet vehicles</p>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            Vehicles
          </h1>
          <p className="text-gray-500">Manage your fleet vehicles</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <RestrictedButton
            docType="Vehicle"
            permission="create"
            onClick={() => router.push("/dashboard/vehicles/new")}
            className="bg-blue-600 hover:bg-blue-700"
            fallbackMessage="You don't have permission to create vehicles"
            showAlert={true}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vehicle
          </RestrictedButton>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh"
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 shrink-0"
              >
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                <span className="hidden sm:inline">Filters</span>
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {typeFilter !== "all" && statusFilter !== "all" ? 2 : 1}
                  </Badge>
                )}
              </Button>

              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-500">Vehicle Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-500">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                All Vehicles
                <Badge variant="secondary" className="ml-2">
                  {vehicles.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Maintenance
                <Badge variant="secondary" className="ml-2">
                  {maintenanceCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Inactive
                <Badge variant="secondary" className="ml-2">
                  {inactiveCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.name || vehicle.license_plate} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>{vehicle.driver || "Unassigned"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate docType="Vehicle" permission="read">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/vehicles/${vehicle.name}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="Vehicle" permission="write">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/vehicles/${vehicle.name}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="Vehicle Service" permission="create">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/vehicles/service/new?vehicle=${vehicle.name}`)}
                              >
                                <Wrench className="mr-2 h-4 w-4" />
                                Schedule Service
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="Vehicle Inspection" permission="create">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/vehicles/inspections/new?vehicle=${vehicle.name}`)
                                }
                              >
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Record Inspection
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
            <div className="divide-y">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <div key={vehicle.name || vehicle.license_plate} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{vehicle.license_plate}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.make} {vehicle.model}
                          </div>
                        </div>
                      </div>

                      {getStatusBadge(vehicle.status)}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {vehicle.vehicle_type}
                        </Badge>
                        {vehicle.year && (
                          <Badge variant="outline" className="bg-gray-50">
                            {vehicle.year}
                          </Badge>
                        )}
                        {vehicle.fuel_type && (
                          <Badge variant="outline" className="bg-green-50 flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            {vehicle.fuel_type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <PermissionGate docType="Vehicle" permission="read">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/dashboard/vehicles/${vehicle.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGate>

                        <PermissionGate docType="Vehicle" permission="write">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/dashboard/vehicles/${vehicle.name}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate docType="Vehicle Service" permission="create">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/vehicles/service/new?vehicle=${vehicle.name}`)}
                              >
                                <Wrench className="mr-2 h-4 w-4" />
                                Schedule Service
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="Vehicle Inspection" permission="create">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/vehicles/inspections/new?vehicle=${vehicle.name}`)
                                }
                              >
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Record Inspection
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No vehicles found.</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
