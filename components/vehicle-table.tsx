"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table-with-fixed-header"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MoreHorizontal, Search, Loader2, Download, RefreshCw, Lock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchVehicles } from "@/lib/actions"
import { RestrictedButton } from "@/components/restricted-button"
import { usePermissions } from "@/hooks/use-permissions"
import { PermissionGate } from "@/components/permission-gate"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"

type Vehicle = {
  name?: string
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
}

export function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { canRead, canCreate, canWrite } = usePermissions()

  const openDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setSelectedVehicle(null)
    setIsDialogOpen(false)
  }

  const loadVehicles = useCallback(async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const result = await fetchVehicles()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Unable to Load Vehicles",
          description: "We couldn't retrieve the list of vehicles at this time. Please try refreshing the page.",
        })
        return
      }

      if (result.data) {
        console.log("Vehicles data:", result.data)
        setVehicles(result.data)
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast({
        variant: "destructive",
        title: "System Error",
        description: "We encountered an unexpected error while loading the vehicles. Please try again in a few minutes or contact support if the problem persists.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const handleRefresh = useCallback(() => {
    loadVehicles(true)
  }, [loadVehicles])

  // Get unique vehicle types for filter
  const vehicleTypes = useMemo(() => 
    Array.from(new Set(vehicles.map((v) => v.vehicle_type))).filter(Boolean),
    [vehicles]
  )

  const filteredVehicles = useMemo(() => {
    console.log("Filtering vehicles:", vehicles)
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" ? true : vehicle.vehicle_type === typeFilter

      return matchesSearch && matchesType
    })
  }, [vehicles, searchTerm, typeFilter])

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredVehicles.slice(startIndex, endIndex)
  }, [filteredVehicles, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["License Plate", "Make", "Model", "Type", "Year", "Color", "Fuel Type", "Doors", "Wheels"]
    const csvContent = [
      headers.join(","),
      ...filteredVehicles.map((vehicle) =>
        [
          vehicle.license_plate,
          vehicle.make,
          vehicle.model,
          vehicle.vehicle_type,
          vehicle.year || "N/A",
          vehicle.color,
          vehicle.fuel_type,
          vehicle.doors,
          vehicle.wheels,
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate docType="Vehicle" permission="read" showAlert={true}>
      <div className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[180px]">
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
              docType="Vehicle"
              permission="create"
              onClick={() => router.push("/dashboard/vehicles/new")}
              className="bg-blue-600 hover:bg-blue-700"
              fallbackMessage="You don't have permission to create vehicles"
              showAlert={true}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </RestrictedButton>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="table-scroll-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.length > 0 ? (
                  paginatedVehicles.map((vehicle, index) => (
                    <TableRow key={vehicle.license_plate + index}>
                      <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                      <TableCell>{vehicle.year || "N/A"}</TableCell>
                      <TableCell>{vehicle.color}</TableCell>
                      <TableCell>{vehicle.fuel_type}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate
                              docType="Vehicle"
                              permission="read"
                              fallback={
                                <DropdownMenuItem
                                  className="text-orange-500"
                                  onClick={() =>
                                    toast({
                                      variant: "destructive",
                                      title: "Permission Required",
                                      description: "You don't have permission to view vehicle details. Please contact your administrator if you need access.",
                                    })
                                  }
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              }
                            >
                              <DropdownMenuItem
                                onClick={() => openDialog(vehicle)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate
                              docType="Vehicle"
                              permission="write"
                              fallback={
                                <DropdownMenuItem
                                  className="text-orange-500"
                                  onClick={() =>
                                    toast({
                                      variant: "destructive",
                                      title: "Permission Required",
                                      description: "You don't have permission to edit vehicle information. Please contact your administrator if you need access.",
                                    })
                                  }
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              }
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  const vehicleId = vehicle.name || vehicle.license_plate;
                                  router.push(`/dashboard/vehicles/edit/${vehicleId}`)
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate
                              docType="Vehicle Service"
                              permission="write"
                              fallback={
                                <DropdownMenuItem
                                  className="text-orange-500"
                                  onClick={() =>
                                    toast({
                                      variant: "destructive",
                                      title: "Permission Required",
                                      description: "You don't have permission to schedule vehicle services. Please contact your administrator if you need access.",
                                    })
                                  }
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Schedule Service
                                </DropdownMenuItem>
                              }
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  const vehicleId = vehicle.name || vehicle.license_plate;
                                  router.push(`/dashboard/vehicles/service/new?vehicle=${vehicleId}`)
                                }}
                              >
                                Schedule Service
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
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
            </DialogHeader>
            {selectedVehicle && (
              <div className="space-y-4">
                <p><strong>License Plate:</strong> {selectedVehicle.license_plate}</p>
                <p><strong>Make:</strong> {selectedVehicle.make}</p>
                <p><strong>Model:</strong> {selectedVehicle.model}</p>
                <p><strong>Type:</strong> {selectedVehicle.vehicle_type}</p>
                <p><strong>Year:</strong> {selectedVehicle.year}</p>
                <p><strong>Color:</strong> {selectedVehicle.color}</p>
                <p><strong>Fuel Type:</strong> {selectedVehicle.fuel_type}</p>
                <p><strong>Doors:</strong> {selectedVehicle.doors}</p>
                <p><strong>Wheels:</strong> {selectedVehicle.wheels}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Close</Button>
              <Button onClick={() => router.push(`/dashboard/vehicles/edit/${selectedVehicle?.name}`)}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
