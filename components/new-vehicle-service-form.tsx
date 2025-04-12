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
import { Loader2, ListFilter, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { fetchVehicles, createVehicleService } from "@/lib/actions"
import { fetchServiceTypes, fetchServiceProviders } from "@/lib/api"

const formSchema = z.object({
  vehicle: z.string().min(1, "Vehicle is required."),
  type_of_service: z.string().min(1, "Service type is required."),
  service_provider: z.string().min(1, "Service provider is required."),
  current_odometer: z.coerce.number().min(0, "Odometer reading must be a positive number."),
  next_expected_km: z.coerce.number().min(0, "Next expected KM must be a positive number."),
  next_expected_service_date: z.date({
    required_error: "Next service date is required.",
  }),
  service_details: z.string().optional(),
  cost: z.coerce.number().min(0, "Cost must be a positive number.").optional(),
})

// Fallback service types in case API fails
const fallbackServiceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Engine Tune-up",
  "Transmission Service",
  "Battery Replacement",
  "Air Filter Replacement",
  "Fuel Filter Replacement",
  "Coolant Flush",
  "Wheel Alignment",
  "General Maintenance",
  "Major Repair",
  "Other",
]

export function NewVehicleServiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [serviceProviders, setServiceProviders] = useState<any[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(false)
  const [isLoadingServiceProviders, setIsLoadingServiceProviders] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle: "",
      type_of_service: "",
      service_provider: "",
      current_odometer: 0,
      next_expected_km: 0,
      next_expected_service_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      service_details: "",
      cost: 0,
    },
  })

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoadingVehicles(true)
        const result = await fetchVehicles()

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          })
          return
        }

        if (result.data) {
          setVehicles(result.data)
        }
      } catch (error) {
        console.error("Error loading vehicles:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vehicles. Please try again.",
        })
      } finally {
        setIsLoadingVehicles(false)
      }
    }

    loadVehicles()
  }, [toast])

  // Function to load service types when dropdown is clicked
  const handleServiceTypeDropdownClick = async () => {
    if (serviceTypes.length === 0 && !isLoadingServiceTypes) {
      try {
        setIsLoadingServiceTypes(true)
        const response = await fetchServiceTypes()

        if (response.data && response.data.length > 0) {
          setServiceTypes(response.data)
        } else {
          // Use fallback if API returns empty data
          setServiceTypes(fallbackServiceTypes.map((type) => ({ name: type })))
        }
      } catch (error) {
        console.error("Error loading service types:", error)
        // Use fallback if API fails
        setServiceTypes(fallbackServiceTypes.map((type) => ({ name: type })))
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load service types. Using default values.",
        })
      } finally {
        setIsLoadingServiceTypes(false)
      }
    }
  }

  // Function to load service providers when dropdown is clicked
  const handleServiceProviderDropdownClick = async () => {
    if (serviceProviders.length === 0 && !isLoadingServiceProviders) {
      try {
        setIsLoadingServiceProviders(true)
        const response = await fetchServiceProviders()

        if (response.data && response.data.length > 0) {
          setServiceProviders(response.data)
        } else {
          // Use empty array if API returns no data
          setServiceProviders([])
        }
      } catch (error) {
        console.error("Error loading service providers:", error)
        setServiceProviders([])
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load service providers.",
        })
      } finally {
        setIsLoadingServiceProviders(false)
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Submitting service data:", values)

      // Format dates for API
      const formattedValues = {
        ...values,
        next_expected_service_date: format(values.next_expected_service_date, "yyyy-MM-dd"),
      }

      const result = await createVehicleService(formattedValues)

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
        title: "Service record created successfully",
        description: "The service record has been added to the system.",
      })

      setIsSuccess(true)
      form.reset()

      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard/vehicles/service")
      }, 2000)
    } catch (error) {
      console.error("Error creating service record:", error)
      setError(error instanceof Error ? error.message : "An error occurred while creating the service record.")
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the service record.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingVehicles) {
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
          <h2 className="text-xl font-semibold">Add New Service Record</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/vehicles/service">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
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
            <AlertDescription>Service record created successfully! Redirecting to services list...</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.name} value={vehicle.name}>
                              {vehicle.license_plate} - {vehicle.make} {vehicle.model}
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
                  name="type_of_service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger onClick={handleServiceTypeDropdownClick}>
                            {isLoadingServiceTypes ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading service types...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a service type" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.name} value={type.name}>
                              {type.name}
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
                  name="service_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger onClick={handleServiceProviderDropdownClick}>
                            {isLoadingServiceProviders ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading providers...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a service provider" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceProviders.length > 0 ? (
                            serviceProviders.map((provider) => (
                              <SelectItem key={provider.name} value={provider.name}>
                                {provider.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No service providers available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="service_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter service details" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Odometer & Next Service</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="current_odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Odometer (km)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_expected_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Expected KM</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Odometer reading for next service</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_expected_service_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Service Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/vehicles/service")}
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
                  "Add Service Record"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      {isSuccess && (
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
          <div className="flex w-full justify-between items-center">
            <p className="text-sm text-green-600">Service record added successfully!</p>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/dashboard/vehicles/service">
                <ListFilter className="h-4 w-4" />
                Show Services List
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
