"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  MapPin,
  Car,
  RefreshCw,
  Search,
  Calendar,
  Clock,
  Fuel,
  Gauge,
  AlertTriangle,
  LocateFixed,
  Navigation,
  RotateCw,
  Zap,
  Info,
} from "lucide-react"
import { fetchVehicleGPSAction, fetchVehiclesWithGPSAction } from "@/lib/actions"
import { format, fromUnixTime } from "date-fns"

// Define types for GPS data
interface GPSRecord {
  id: number
  vehicle_no: string
  imei: string
  alias: string
  latitude: number
  longitude: number
  can_fuel: string | null
  can_odometer: string | null
  fuel: number | null
  mileage: number | null
  ignition: boolean
  speed: number
  direction: number
  vehicle_status: string
  total_gps_odometer: number
  total_gps_duration: number
  vendor: string
  timestamp: number
  created_at: string
  company: string
}

interface GPSData {
  count: number
  next: string | null
  previous: string | null
  results: GPSRecord[]
}

export default function VehicleGPSPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const [companyId, setCompanyId] = useState("b2fed2cb-2f22-4bb9-8219-5ed3a3c1667d")
  const [selectedVehicle, setSelectedVehicle] = useState<string>(searchParams.get("vehicle") || "KDA 381X")
  const [vehicles, setVehicles] = useState<{ license_plate: string; alias: string }[]>([])
  const [gpsData, setGpsData] = useState<GPSData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)

  // Load vehicles with GPS data
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const result = await fetchVehiclesWithGPSAction(companyId)
        if (result.success && result.data) {
          setVehicles(result.data.results)
        } else {
          setError("Failed to load vehicles with GPS tracking.")
        }
      } catch (err) {
        console.error("Error loading vehicles:", err)
        setError("Failed to load vehicles with GPS tracking.")
      }
    }

    loadVehicles()
  }, [companyId])

  // Load GPS data for selected vehicle
  useEffect(() => {
    const loadGPSData = async () => {
      if (!selectedVehicle) return

      setLoading(true)
      setError(null)

      try {
        const result = await fetchVehicleGPSAction(companyId, selectedVehicle)
        if (result.success && result.data) {
          setGpsData(result.data)
        } else {
          setError(result.error || "Failed to load GPS data.")
        }
      } catch (err) {
        console.error("Error loading GPS data:", err)
        setError("Failed to load GPS data. Please try again.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    loadGPSData()
  }, [companyId, selectedVehicle])

  // Initialize map when GPS data is available
  useEffect(() => {
    if (!gpsData || !mapRef.current || mapInitialized || activeTab !== "map") return

    // This would normally use a mapping library like Leaflet or Google Maps
    // For this example, we'll just create a placeholder
    const initMap = () => {
      try {
        const mapContainer = mapRef.current
        if (!mapContainer) return

        // Clear any existing content
        mapContainer.innerHTML = ""

        // Create a simple placeholder map
        const mapPlaceholder = document.createElement("div")
        mapPlaceholder.className = "relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"

        // Add a message
        const mapMessage = document.createElement("div")
        mapMessage.className = "absolute inset-0 flex items-center justify-center flex-col gap-2 text-gray-500"
        mapMessage.innerHTML = `
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-map"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          </div>
          <p class="font-medium">Map would render here</p>
          <p class="text-sm">Using coordinates: ${gpsData.results[0]?.latitude}, ${gpsData.results[0]?.longitude}</p>
        `

        mapPlaceholder.appendChild(mapMessage)
        mapContainer.appendChild(mapPlaceholder)

        setMapInitialized(true)
      } catch (err) {
        console.error("Error initializing map:", err)
      }
    }

    initMap()
  }, [gpsData, mapInitialized, activeTab])

  // Reset map initialization when tab or vehicle changes
  useEffect(() => {
    setMapInitialized(false)
  }, [activeTab, selectedVehicle])

  const handleRefresh = async () => {
    setRefreshing(true)
    setMapInitialized(false)

    try {
      const result = await fetchVehicleGPSAction(companyId, selectedVehicle)
      if (result.success && result.data) {
        setGpsData(result.data)
      } else {
        setError(result.error || "Failed to refresh GPS data.")
      }
    } catch (err) {
      console.error("Error refreshing GPS data:", err)
      setError("Failed to refresh GPS data. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200"
      case "idle":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "stopped":
        return "bg-red-100 text-red-800 border-red-200"
      case "unreachable":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getDirectionText = (direction: number) => {
    if (direction >= 337.5 || direction < 22.5) return "North"
    if (direction >= 22.5 && direction < 67.5) return "Northeast"
    if (direction >= 67.5 && direction < 112.5) return "East"
    if (direction >= 112.5 && direction < 157.5) return "Southeast"
    if (direction >= 157.5 && direction < 202.5) return "South"
    if (direction >= 202.5 && direction < 247.5) return "Southwest"
    if (direction >= 247.5 && direction < 292.5) return "West"
    if (direction >= 292.5 && direction < 337.5) return "Northwest"
    return "Unknown"
  }

  const formatTimestamp = (timestamp: number) => {
    try {
      // Convert milliseconds to Date
      return format(fromUnixTime(timestamp / 1000), "MMM d, yyyy h:mm a")
    } catch (err) {
      return "Unknown"
    }
  }

  const handleVehicleSelect = (vehicle: string) => {
    router.push(`/dashboard/gps?vehicle=${vehicle}`)
  }

  // Filter GPS records based on search term
  const filteredRecords =
    gpsData?.results.filter((record) => {
      if (!searchTerm) return true

      return (
        record.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vehicle_status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <LocateFixed className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Vehicle GPS Tracking</h2>
            <p className="text-sm text-gray-500">Monitor real-time location and status</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedVehicle} onValueChange={handleVehicleSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.license_plate} value={vehicle.license_plate}>
                  {vehicle.alias || vehicle.license_plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card className="border-blue-100">
        <CardHeader className="border-b p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="map"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                <Clock className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                <Info className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-[500px]">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Loading GPS data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              {activeTab === "map" && (
                <div className="h-[500px] p-4">
                  <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden border bg-gray-50"></div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="p-4">
                  <div className="mb-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search history..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {filteredRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No GPS records found</div>
                      ) : (
                        filteredRecords.map((record) => (
                          <Card key={record.id} className="overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{formatTimestamp(record.timestamp)}</span>
                              </div>
                              <Badge variant="outline" className={getStatusColor(record.vehicle_status)}>
                                {record.vehicle_status}
                              </Badge>
                            </div>
                            <div className="p-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Location</div>
                                    <div className="text-sm font-medium">
                                      {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Gauge className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Speed</div>
                                    <div className="text-sm font-medium">{record.speed} km/h</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                    <Navigation className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Direction</div>
                                    <div className="text-sm font-medium">
                                      {getDirectionText(record.direction)} ({record.direction}°)
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <RotateCw className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Odometer</div>
                                    <div className="text-sm font-medium">
                                      {record.mileage ? record.mileage.toLocaleString() : "N/A"} km
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                    <Fuel className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Fuel</div>
                                    <div className="text-sm font-medium">
                                      {record.fuel ? `${record.fuel} L` : "N/A"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Zap className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Ignition</div>
                                    <div className="text-sm font-medium">{record.ignition ? "On" : "Off"}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {activeTab === "details" && (
                <div className="p-6">
                  {gpsData && gpsData.results.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Car className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{gpsData.results[0].alias}</h3>
                          <p className="text-gray-500">IMEI: {gpsData.results[0].imei}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Current Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <Badge variant="outline" className={getStatusColor(gpsData.results[0].vehicle_status)}>
                                  {gpsData.results[0].vehicle_status}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated</span>
                                <span>{formatTimestamp(gpsData.results[0].timestamp)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Ignition</span>
                                <span>{gpsData.results[0].ignition ? "On" : "Off"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Speed</span>
                                <span>{gpsData.results[0].speed} km/h</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Vehicle Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Odometer</span>
                                <span>
                                  {gpsData.results[0].mileage ? gpsData.results[0].mileage.toLocaleString() : "N/A"} km
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Fuel Level</span>
                                <span>{gpsData.results[0].fuel ? `${gpsData.results[0].fuel} L` : "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">GPS Odometer</span>
                                <span>{gpsData.results[0].total_gps_odometer.toFixed(2)} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Vendor</span>
                                <span>{gpsData.results[0].vendor}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Location Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Coordinates</span>
                              <span>
                                {gpsData.results[0].latitude.toFixed(6)}, {gpsData.results[0].longitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Direction</span>
                              <span>
                                {getDirectionText(gpsData.results[0].direction)} ({gpsData.results[0].direction}°)
                              </span>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setActiveTab("map")}>
                              <MapPin className="mr-2 h-4 w-4" />
                              View on Map
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No vehicle details available</div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
