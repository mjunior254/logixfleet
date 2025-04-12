"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, ArrowLeft, WrenchIcon, AlertTriangle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { fetchVehicles, fetchPriorities, fetchIssueTypes, fetchMechanics, createIssue } from "@/lib/api"
import { fetchDrivers } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface FormData {
  driver: string
  vehicle: string
  grand_total: string
  priority: string
  issue_type: string
  status: string
  estimated_date_of_repair: string
  mechanic: string
  description: string
}

export function NewIssueForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    driver: "",
    vehicle: "",
    grand_total: "0",
    priority: "",
    issue_type: "",
    status: "Open",
    estimated_date_of_repair: format(new Date(), "yyyy-MM-dd"),
    mechanic: "",
    description: "",
  })

  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [priorities, setPriorities] = useState<any[]>([])
  const [issueTypes, setIssueTypes] = useState<any[]>([])
  const [mechanics, setMechanics] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true)
      try {
        // Fetch all dropdown data in parallel
        const [vehiclesResponse, driversResponse, prioritiesData, issueTypesData, mechanicsData] = await Promise.all([
          fetchVehicles(),
          fetchDrivers(),
          fetchPriorities(),
          fetchIssueTypes(),
          fetchMechanics(),
        ])

        // Handle vehicles data (from api.ts)
        setVehicles(vehiclesResponse.data || [])

        // Handle drivers data (from actions.ts)
        setDrivers(driversResponse.data || [])

        setPriorities(prioritiesData)
        setIssueTypes(issueTypesData)
        setMechanics(mechanicsData)

        console.log("Loaded data:", {
          vehicles: vehiclesResponse.data || [],
          drivers: driversResponse.data || [],
          priorities: prioritiesData,
          issueTypes: issueTypesData,
          mechanics: mechanicsData,
        })
      } catch (err) {
        console.error("Error loading form data:", err)
        setError("Failed to load form data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData((prev) => ({
        ...prev,
        estimated_date_of_repair: format(date, "yyyy-MM-dd"),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      const requiredFields: (keyof FormData)[] = ["vehicle", "driver", "issue_type", "priority", "mechanic"]
      const missingFields = requiredFields.filter((field) => !formData[field])

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(", ")}`)
        setSubmitting(false)
        return
      }

      // Convert grand_total to number for API
      const issueData = {
        ...formData,
        grand_total: Number.parseFloat(formData.grand_total),
      }

      await createIssue(issueData)
      setSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        router.push("/dashboard/issues")
      }, 2000)
    } catch (err) {
      console.error("Error creating issue:", err)
      setError("Failed to create issue. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-end space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="border-green-100">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Issue Created Successfully</h2>
            <p className="text-gray-500 mb-6">Your issue has been created and is now being tracked.</p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  setFormData({
                    driver: "",
                    vehicle: "",
                    grand_total: "0",
                    priority: "",
                    issue_type: "",
                    status: "Open",
                    estimated_date_of_repair: format(new Date(), "yyyy-MM-dd"),
                    mechanic: "",
                    description: "",
                  })
                }}
              >
                Create Another Issue
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/issues")}>
                View All Issues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-100">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <WrenchIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Issue</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Report a vehicle issue for repair</p>
            </div>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard/issues">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Issues
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="font-medium">
                Vehicle <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.vehicle} onValueChange={(value) => handleChange("vehicle", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {vehicles.map((vehicle, index) => (
                      <SelectItem
                        key={`vehicle-${vehicle.name || vehicle.license_plate}-${index}`}
                        value={vehicle.name || vehicle.license_plate}
                      >
                        {vehicle.license_plate || vehicle.name}{" "}
                        {vehicle.make && vehicle.model ? `(${vehicle.make} ${vehicle.model})` : ""}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver" className="font-medium">
                Driver <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.driver} onValueChange={(value) => handleChange("driver", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {drivers.map((driver, index) => (
                      <SelectItem key={`driver-${driver.name}-${index}`} value={driver.name}>
                        {driver.first_name && driver.last_name
                          ? `${driver.first_name} ${driver.last_name} (${driver.name})`
                          : driver.full_name || driver.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_type" className="font-medium">
                Issue Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.issue_type} onValueChange={(value) => handleChange("issue_type", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type, index) => (
                    <SelectItem key={`issue-type-${type.name}-${index}`} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-medium">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority, index) => (
                    <SelectItem key={`priority-${priority.name}-${index}`} value={priority.name}>
                      <div className="flex items-center">
                        {priority.name === "High" && (
                          <Badge variant="outline" className="mr-2 bg-red-50 text-red-700 border-red-200">
                            High
                          </Badge>
                        )}
                        {priority.name === "Medium" && (
                          <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                            Medium
                          </Badge>
                        )}
                        {priority.name === "Low" && (
                          <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                            Low
                          </Badge>
                        )}
                        {!["High", "Medium", "Low"].includes(priority.name) && priority.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Open
                    </Badge>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      In Progress
                    </Badge>
                  </SelectItem>
                  <SelectItem value="Resolved">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Resolved
                    </Badge>
                  </SelectItem>
                  <SelectItem value="Closed">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Closed
                    </Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grand_total" className="font-medium">
                Estimated Cost
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="grand_total"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.grand_total}
                  onChange={(e) => handleChange("grand_total", e.target.value)}
                  className="pl-7"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_date_of_repair" className="font-medium">
                Estimated Repair Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mechanic" className="font-medium">
                Mechanic <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.mechanic} onValueChange={(value) => handleChange("mechanic", value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a mechanic" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map((mechanic, index) => (
                    <SelectItem key={`mechanic-${mechanic.name}-${index}`} value={mechanic.name}>
                      {mechanic.full_name || mechanic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="resize-y"
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t p-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/issues")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting} onClick={handleSubmit}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Issue"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
