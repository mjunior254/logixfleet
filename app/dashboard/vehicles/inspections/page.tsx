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
  ClipboardCheck,
  X,
  Eye,
  Pencil,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RestrictedButton } from "@/components/restricted-button"
import { PermissionGate } from "@/components/permission-gate"
import { fetchVehicleInspections } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function VehicleInspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch inspections from API
  const loadInspections = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetchVehicleInspections()
      console.log("Vehicle inspections API response:", response)

      if (response && response.data) {
        setInspections(response.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vehicle inspections. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error loading vehicle inspections:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle inspections. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadInspections()
  }, [])

  const handleRefresh = () => {
    loadInspections(true)
  }

  // Get unique inspection types for filter
  const inspectionTypes = Array.from(new Set(inspections.map((i) => i.inspection_type))).filter(Boolean)

  // Filter inspections based on search, type, status, and active tab
  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspection_type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" ? true : inspection.inspection_type === typeFilter
    const matchesStatus = statusFilter === "all" ? true : inspection.status === statusFilter
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "open"
          ? inspection.status === "Open"
          : activeTab === "closed"
            ? inspection.status === "Closed"
            : true

    return matchesSearch && matchesType && matchesStatus && matchesTab
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["ID", "Vehicle", "Inspection Type", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredInspections.map((inspection) =>
        [inspection.name, inspection.vehicle, inspection.inspection_type, inspection.status || "Pending"].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "vehicle_inspections.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get counts for tabs
  const openCount = inspections.filter((inspection) => inspection.status === "Open").length
  const closedCount = inspections.filter((inspection) => inspection.status === "Closed").length
  const pendingCount = inspections.filter((inspection) => !inspection.status).length

  // Function to get status badge variant
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Open
          </Badge>
        )
      case "Closed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            Closed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Pending
          </Badge>
        )
    }
  }

  // Function to format inspection type for display
  const formatInspectionType = (type: string) => {
    if (!type) return "Unknown"
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Inspections</h1>
          <p className="text-gray-500">Manage and track vehicle inspection records</p>
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
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            Vehicle Inspections
          </h1>
          <p className="text-gray-500">Manage and track vehicle inspection records</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <RestrictedButton
            docType="Vehicle Inspection"
            permission="create"
            onClick={() => router.push("/dashboard/vehicles/inspections/new")}
            className="bg-blue-600 hover:bg-blue-700"
            fallbackMessage="You don't have permission to create inspections"
            showAlert={true}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Inspection
          </RestrictedButton>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
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
                <label className="text-sm font-medium mb-1 block text-gray-500">Inspection Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {inspectionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatInspectionType(type)}
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
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="null">Pending</SelectItem>
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
                All Inspections
                <Badge variant="secondary" className="ml-2">
                  {inspections.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="open"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Open
                <Badge variant="secondary" className="ml-2">
                  {openCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Closed
                <Badge variant="secondary" className="ml-2">
                  {closedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Pending
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Inspection Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.length > 0 ? (
                  filteredInspections.map((inspection) => (
                    <TableRow key={inspection.name} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{inspection.name}</TableCell>
                      <TableCell>{inspection.vehicle}</TableCell>
                      <TableCell>{formatInspectionType(inspection.inspection_type)}</TableCell>
                      <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate docType="Vehicle Inspection" permission="read">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/vehicles/inspections/${inspection.name}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="Vehicle Inspection" permission="write">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/vehicles/inspections/edit/${inspection.name}`)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No inspections found.
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
              {filteredInspections.length > 0 ? (
                filteredInspections.map((inspection) => (
                  <div key={inspection.name} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{inspection.name}</div>
                          <div className="text-sm text-gray-500">{inspection.vehicle}</div>
                        </div>
                      </div>

                      {getStatusBadge(inspection.status)}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {formatInspectionType(inspection.inspection_type)}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <PermissionGate docType="Vehicle Inspection" permission="read">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/dashboard/vehicles/inspections/${inspection.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGate>

                        <PermissionGate docType="Vehicle Inspection" permission="write">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/dashboard/vehicles/inspections/edit/${inspection.name}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No inspections found.</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredInspections.length} of {inspections.length} inspections
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
