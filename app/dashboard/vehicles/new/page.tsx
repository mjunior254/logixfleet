"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePermissions } from "@/hooks/use-permissions"
import { useAuth } from "@/contexts/auth-context"
import { fetchDrivers, fetchVehicleMakes, fetchVehicleModels, fetchYears, createVehicle } from "@/lib/api"

const formSchema = z.object({
  license_plate: z.string().min(2, "License plate must be at least 2 characters."),
  make: z.string().min(1, "Make is required."),
  model: z.string().min(1, "Model is required."),
  year: z.coerce
    .number()
    .min(1900, "Year must be at least 1900.")
    .max(new Date().getFullYear() + 1, `Year must be at most ${new Date().getFullYear() + 1}.`),
  vehicle_type: z.string().min(1, "Vehicle type is required."),
  status: z.enum(["Active", "Maintenance", "Inactive"]),
  driver: z.string().optional(),
  fuel_type: z.string().min(1, "Fuel type is required."),
  color: z.string().min(1, "Color is required."),
  doors: z.coerce.number().min(0, "Doors must be a positive number."),
  wheels: z.coerce.number().min(0, "Wheels must be a positive number."),
})

export default function NewVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicleMakes, setVehicleMakes] = useState<any[]>([])
  const [vehicleModels, setVehicleModels] = useState<any[]>([])
  const [filteredModels, setFilteredModels] = useState<any[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [years, setYears] = useState<any[]>([])
  const [isLoadingYears, setIsLoadingYears] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  // Check if user has permission to create vehicles
  useEffect(() => {
    if (!hasPermission("Vehicle", "create")) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create vehicles",
      })
      router.push("/dashboard/vehicles")
    }
  }, [hasPermission, router, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      license_plate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vehicle_type: "Car",
      status: "Active",
      driver: undefined,
      fuel_type: "Petrol",
      color: "",
      doors: 4,
      wheels: 4,
    },
  })

  const selectedMake = form.watch("make")

  // Filter models based on selected make
  useEffect(() => {
    if (selectedMake && vehicleModels.length > 0) {
      const filtered = vehicleModels.filter((model) => !model.make || model.make === selectedMake)
      setFilteredModels(filtered)
    } else {
      setFilteredModels(vehicleModels)
    }
  }, [selectedMake, vehicleModels])

  // Load data for dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load drivers
        setIsLoadingDrivers(true)
        const driversResponse = await fetchDrivers()
        if (driversResponse.data) {
          setDrivers(driversResponse.data)
        }
        setIsLoadingDrivers(false)

        // Load vehicle makes
        setIsLoadingMakes(true)
        const makesResponse = await fetchVehicleMakes()
        if (makesResponse.data) {
          setVehicleMakes(makesResponse.data)
        }
        setIsLoadingMakes(false)

        // Load vehicle models
        setIsLoadingModels(true)
        const modelsResponse = await fetchVehicleModels()
        if (modelsResponse.data) {
          setVehicleModels(modelsResponse.data)
          setFilteredModels(modelsResponse.data)
        }
        setIsLoadingModels(false)

        // Load years
        setIsLoadingYears(true)
        const yearsResponse = await fetchYears()
        if (yearsResponse.data) {
          setYears(yearsResponse.data)
        } else {
          // Fallback if years API fails
          const currentYear = new Date().getFullYear()
          setYears(Array.from({ length: 30 }, (_, i) => ({ name: String(currentYear - i) })))
        }
        setIsLoadingYears(false)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        })

        // Set loading states to false to prevent infinite loading
        setIsLoadingDrivers(false)
        setIsLoadingMakes(false)
        setIsLoadingModels(false)
        setIsLoadingYears(false)
      }
    }

    loadData()
  }, [toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Submitting vehicle data:", values)

      const response = await createVehicle(values)

      if (response.error) {
        setError(response.error || "Failed to create vehicle")
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to create vehicle",
        })
        return
      }

      toast({
        title: "Vehicle created successfully",
        description: "The vehicle has been added to the fleet.",
      })

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/vehicles")
      }, 1500)
    } catch (error) {
      console.error("Error creating vehicle:", error)
      setError("An error occurred while creating the vehicle.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the vehicle.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingDrivers || isLoadingMakes || isLoadingModels || isLoadingYears) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
        <p className="text-gray-500">Add a new vehicle to your fleet</p>
      </div>

      <Card className="border-blue-100">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Vehicle Details</h2>
            <Button variant="outline" asChild>
              <Link href="/dashboard/vehicles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Link>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Vehicle created successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleMakes.map((make) => (
                            <SelectItem key={make.name} value={make.name}>
                              {make.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedMake}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedMake ? "Select a model" : "Select a make first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredModels.map((model) => (
                            <SelectItem key={model.name} value={model.name}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.name} value={year.name}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="ATV">ATV</SelectItem>
                          <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doors</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wheels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wheels</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.name} value={driver.name}>
                              {driver.first_name} {driver.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optionally assign a driver to this vehicle.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/vehicles")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                      Creating...
                    </>
                  ) : (
                    "Add Vehicle"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
