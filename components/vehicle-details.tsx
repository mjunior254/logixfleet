"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { deleteVehicle } from "@/lib/api"
import { ArrowLeft, Car, Calendar, Fuel, Palette, Tag, User, Pencil, Trash2, AlertTriangle, Wrench, ClipboardCheck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VehicleDetailsProps {
  vehicle: {
    name: string
    license_plate: string
    make: string
    model: string
    year: number
    vehicle_type: string
    status: string
    driver?: string
    fuel_type: string
    color: string
    doors: number
    wheels: number
  }
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteVehicle(vehicle.name)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        setIsDeleting(false)
        return
      }

      toast({
        title: "Vehicle deleted",
        description: "The vehicle has been successfully deleted.",
      })
      router.push("/dashboard/vehicles")
      router.refresh()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      case "Inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-6 w-6 text-blue-600" />
            Vehicle Details
          </h1>
          <p className="text-gray-500">View and manage vehicle information</p>
        </div>
        <Button variant="outline" asChild size="sm" className="gap-1">
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Vehicle Information</span>
              {getStatusBadge(vehicle.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">License Plate</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    {vehicle.license_plate}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Make & Model</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Year</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {vehicle.year}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vehicle Type</h3>
                  <p className="text-lg font-semibold">{vehicle.vehicle_type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fuel Type</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-blue-600" />
                    {vehicle.fuel_type}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Color</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-blue-600" />
                    {vehicle.color}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doors / Wheels</h3>
                  <p className="text-lg font-semibold">
                    {vehicle.doors} doors / {vehicle.wheels} wheels
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned Driver</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    {vehicle.driver || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Link href={`/dashboard/vehicles/${vehicle.name}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit Vehicle
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 gap-2"
            >
              <Link href={`/dashboard/vehicles/service/new?vehicle=${vehicle.name}`}>
                <Wrench className="h-4 w-4" />
                Schedule Service
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 gap-2"
            >
              <Link href={`/dashboard/vehicles/inspections/new?vehicle=${vehicle.name}`}>
                <ClipboardCheck className="h-4 w-4" />
                Record Inspection
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Vehicle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Vehicle
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this vehicle? This action cannot be undone and all associated records
                    may be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
