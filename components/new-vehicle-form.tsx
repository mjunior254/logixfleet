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
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createVehicle, fetchDrivers, fetchVehicleMakes, fetchVehicleModels, fetchYears } from "@/lib/actions"
import { Loader2, ListFilter, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

type Driver = {
  name: string
  first_name?: string
  last_name?: string
}

type VehicleMake = {
  name: string
}

type VehicleModel = {
  name: string
  make?: string
}

export function NewVehicleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([])
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([])
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)
  const [isLoadingMakes, setIsLoadingMakes] = useState(true)
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false)
  const [isMakeDropdownOpen, setIsMakeDropdownOpen] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  // Add years state and loading state
  const [years, setYears] = useState<{ name: string }[]>([])
  const [isLoadingYears, setIsLoadingYears] = useState(true)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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

  const loadDrivers = async () => {
    try {
      setIsLoadingDrivers(true)
      const result = await fetchDrivers()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        setDrivers(result.data)
      }
    } catch (error) {
      console.error("Error loading drivers:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load drivers. Please try again.",
      })
    } finally {
      setIsLoadingDrivers(false)
    }
  }

  const loadVehicleMakes = async () => {
    try {
      setIsLoadingMakes(true)
      const result = await fetchVehicleMakes()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        setVehicleMakes(result.data)
      }
    } catch (error) {
      console.error("Error loading vehicle makes:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle makes. Please try again.",
      })
    } finally {
      setIsLoadingMakes(false)
    }
  }

  const loadVehicleModels = async () => {
    try {
      setIsLoadingModels(true)
      const result = await fetchVehicleModels()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        setVehicleModels(result.data)
        setFilteredModels(result.data)
      }
    } catch (error) {
      console.error("Error loading vehicle models:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vehicle models. Please try again.",
      })
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Add a function to load years
  const loadYears = async () => {
    try {
      setIsLoadingYears(true)
      const result = await fetchYears()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        setYears(result.data)
      }
    } catch (error) {
      console.error("Error loading years:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load years. Please try again.",
      })
    } finally {
      setIsLoadingYears(false)
    }
  }

  useEffect(() => {
    loadDrivers()
    loadVehicleMakes()
    loadVehicleModels()
    loadYears()
  }, [toast])

  // Refresh drivers when dropdown is opened
  const handleDriverDropdownOpen = () => {
    setIsDriverDropdownOpen(true)
    loadDrivers()
  }

  // Refresh makes when dropdown is opened
  const handleMakeDropdownOpen = () => {
    setIsMakeDropdownOpen(true)
    loadVehicleMakes()
  }

  // Refresh models when dropdown is opened
  const handleModelDropdownOpen = () => {
    setIsModelDropdownOpen(true)
    loadVehicleModels()
  }

  // Add a handler for year dropdown open
  const handleYearDropdownOpen = () => {
    setIsYearDropdownOpen(true)
    loadYears()
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)

      if (values.driver === "none") {
        values.driver = undefined
      }

      console.log("Submitting vehicle data:", values)
      const result = await createVehicle(values)

      if (result.error) {
        setError(result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      toast({
        title: "Vehicle created successfully",
        description: "The vehicle has been added to the fleet.",
      })

      setIsSuccess(true)
      form.reset()
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
    <Card className="border-blue-100">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Vehicle</h2>
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
                      onOpenChange={handleYearDropdownOpen}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingYears ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading years...</span>
                          </div>
                        ) : (
                          years.map((year) => (
                            <SelectItem key={year.name} value={year.name}>
                              {year.name}
                            </SelectItem>
                          ))
                        )}
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
                            {driver.name}
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
      {isSuccess && (
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
          <div className="flex w-full justify-between items-center">
            <p className="text-sm text-green-600">Vehicle added successfully!</p>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/dashboard/vehicles">
                <ListFilter className="h-4 w-4" />
                Show Vehicles List
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
