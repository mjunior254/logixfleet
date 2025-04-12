"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Loader2, ListFilter, ArrowLeft, ClipboardCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { fetchVehicles, createVehicleInspection } from "@/lib/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// Define the form schemas for both inspection types
const generalInspectionSchema = z.object({
  inspection_type: z.literal("general"),
  vehicle: z.string().min(1, "Vehicle is required."),
  report_date: z.date({
    required_error: "Report date is required.",
  }),
  next_date: z.date({
    required_error: "Next inspection date is required.",
  }),
  status: z.string().min(1, "Status is required."),
  odometer_reading: z.coerce.number().min(0, "Odometer reading must be a positive number."),
  primary_meter: z.coerce.number().min(0, "Primary meter must be a positive number."),
  meter_remark: z.string().optional(),
  overall_remarks: z.string().optional(),
  engine_status: z.string().min(1, "Engine status is required."),
  engine_remark: z.string().optional(),
  oil_life_left: z.string().optional(),
  oil_life_remark: z.string().optional(),
  fuel_level: z.coerce.number().min(0, "Fuel level must be a positive number."),
  fuel_level_remark: z.string().optional(),
  transmission_status: z.string().min(1, "Transmission status is required."),
  transmission_remark: z.string().optional(),
  clutch_status: z.string().min(1, "Clutch status is required."),
  clutch_remark: z.string().optional(),
  steering_status: z.string().min(1, "Steering status is required."),
  steering_remark: z.string().optional(),
  horn_status: z.string().min(1, "Horn status is required."),
  horn_remark: z.string().optional(),
  windshield_status: z.string().min(1, "Windshield status is required."),
  windshield_remark: z.string().optional(),
  mirrors_status: z.string().min(1, "Mirrors status is required."),
  mirrors_remark: z.string().optional(),
  lighting_status: z.string().min(1, "Lighting status is required."),
  lighting_remark: z.string().optional(),
  parking_status: z.string().min(1, "Parking status is required."),
  parking_remark: z.string().optional(),
  service_brakes_status: z.string().min(1, "Service brakes status is required."),
  service_brakes_remark: z.string().optional(),
  air_lines_status: z.string().min(1, "Air lines status is required."),
  air_lines_remark: z.string().optional(),
  coupling_status: z.string().min(1, "Coupling status is required."),
  coupling_remark: z.string().optional(),
  tires_status: z.string().min(1, "Tires status is required."),
  tires_remark: z.string().optional(),
  wheels_status: z.string().min(1, "Wheels status is required."),
  wheels_remark: z.string().optional(),
  emergency_status: z.string().min(1, "Emergency status is required."),
  emergency_remark: z.string().optional(),
  vehicle_condition_ok: z.coerce.number(),
  signoff_remark: z.string().optional(),
  driver_signature: z.string().min(1, "Driver signature is required."),
  signature_remark: z.string().optional(),
})

const ntsaInspectionSchema = z.object({
  inspection_type: z.literal("ntsa"),
  vehicle: z.string().min(1, "Vehicle is required."),
  inspection_date: z.date({
    required_error: "Inspection date is required.",
  }),
  expiry_date: z.date({
    required_error: "Expiry date is required.",
  }),
  status: z.string().min(1, "Status is required."),
})

// Combine both schemas with discriminated union
const formSchema = z.discriminatedUnion("inspection_type", [generalInspectionSchema, ntsaInspectionSchema])

export function NewVehicleInspectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [inspectionType, setInspectionType] = useState<"general" | "ntsa">("general")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get vehicle ID from URL if provided
  const vehicleId = searchParams.get("vehicle")

  // Create form with conditional schema based on inspection type
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inspection_type: "general",
      vehicle: vehicleId || "",
      status: "Open",
      // General inspection defaults
      report_date: new Date(),
      next_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      odometer_reading: 0,
      primary_meter: 0,
      meter_remark: "",
      overall_remarks: "",
      engine_status: "Pass",
      engine_remark: "",
      oil_life_left: "",
      oil_life_remark: "",
      fuel_level: 50,
      fuel_level_remark: "",
      transmission_status: "Pass",
      transmission_remark: "",
      clutch_status: "Pass",
      clutch_remark: "",
      steering_status: "Pass",
      steering_remark: "",
      horn_status: "Pass",
      horn_remark: "",
      windshield_status: "Pass",
      windshield_remark: "",
      mirrors_status: "Pass",
      mirrors_remark: "",
      lighting_status: "Pass",
      lighting_remark: "",
      parking_status: "Pass",
      parking_remark: "",
      service_brakes_status: "Pass",
      service_brakes_remark: "",
      air_lines_status: "Pass",
      air_lines_remark: "",
      coupling_status: "Pass",
      coupling_remark: "",
      tires_status: "Pass",
      tires_remark: "",
      wheels_status: "Pass",
      wheels_remark: "",
      emergency_status: "Pass",
      emergency_remark: "",
      vehicle_condition_ok: 1,
      signoff_remark: "",
      driver_signature: "",
      signature_remark: "",
      // NTSA inspection defaults
      ...(inspectionType === "ntsa" && {
        inspection_date: new Date(),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      }),
    },
  })

  // Update form values when inspection type changes
  useEffect(() => {
    form.setValue("inspection_type", inspectionType)
  }, [inspectionType, form])

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Submitting inspection data:", values)

      // Format dates for API
      const formattedValues: any = { ...values }

      if (values.inspection_type === "general") {
        formattedValues.report_date = format(values.report_date, "yyyy-MM-dd")
        formattedValues.next_date = format(values.next_date, "yyyy-MM-dd")
      } else {
        formattedValues.inspection_date = format(values.inspection_date, "yyyy-MM-dd")
        formattedValues.expiry_date = format(values.expiry_date, "yyyy-MM-dd")
      }

      const result = await createVehicleInspection(formattedValues)

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
        title: "Inspection record created successfully",
        description: "The inspection record has been added to the system.",
      })

      setIsSuccess(true)
      form.reset()

      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard/vehicles/inspections")
      }, 2000)
    } catch (error) {
      console.error("Error creating inspection record:", error)
      setError(error instanceof Error ? error.message : "An error occurred while creating the inspection record.")
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the inspection record.",
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            Add New Vehicle Inspection
          </h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/vehicles/inspections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inspections
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
            <AlertDescription>
              Inspection record created successfully! Redirecting to inspections list...
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={inspectionType} onValueChange={(value) => setInspectionType(value as "general" | "ntsa")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general">General Inspection</TabsTrigger>
            <TabsTrigger value="ntsa">NTSA Inspection</TabsTrigger>
          </TabsList>

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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <TabsContent value="general" className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="report_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Report Date</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="next_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Next Inspection Date</FormLabel>
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

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="odometer_reading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Odometer Reading</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primary_meter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Meter</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="meter_remark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meter Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter meter remarks" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Engine & Drivetrain</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="engine_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="engine_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="oil_life_left"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oil Life Left</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter oil life left" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oil_life_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oil Life Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fuel_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Level (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fuel_level_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Level Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="transmission_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transmission_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="clutch_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clutch Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clutch_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clutch Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Controls & Visibility</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="steering_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steering Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="steering_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steering Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="horn_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horn Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="horn_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horn Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="windshield_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Windshield Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="windshield_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Windshield Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="mirrors_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mirrors Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mirrors_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mirrors Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Lighting & Brakes</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="lighting_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lighting Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lighting_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lighting Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="parking_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking Brake Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parking_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking Brake Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="service_brakes_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Brakes Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service_brakes_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Brakes Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="air_lines_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Air Lines Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="air_lines_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Air Lines Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Wheels & Emergency Equipment</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="coupling_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupling Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coupling_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupling Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tires_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tires Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tires_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tires Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="wheels_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wheels Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wheels_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wheels Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="emergency_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Equipment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Equipment Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Overall Assessment</h3>

                  <FormField
                    control={form.control}
                    name="overall_remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Remarks</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter overall remarks" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle_condition_ok"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value === 1}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Vehicle Condition OK</FormLabel>
                          <FormDescription>
                            Check this box if the vehicle is in good condition and safe to operate.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="driver_signature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Signature</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter driver name" {...field} />
                          </FormControl>
                          <FormDescription>Enter the name of the driver signing off on this inspection</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="signoff_remark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sign-off Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter sign-off remarks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ntsa" className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="inspection_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Inspection Date</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="expiry_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiry Date</FormLabel>
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
                </TabsContent>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/vehicles/inspections")}
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
                    "Add Inspection Record"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      {isSuccess && (
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
          <div className="flex w-full justify-between items-center">
            <p className="text-sm text-green-600">Inspection record added successfully!</p>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/dashboard/vehicles/inspections">
                <ListFilter className="h-4 w-4" />
                Show Inspections List
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
