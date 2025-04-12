"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { EditVehicleForm } from "@/components/edit-vehicle-form"
import { fetchVehicleById } from "@/lib/actions"
import { Loader2 } from "lucide-react"

export default function EditVehiclePage() {
  const params = useParams()
  const [vehicle, setVehicle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setIsLoading(true)
        const result = await fetchVehicleById(params.id as string)

        if (result.error) {
          setError(result.error)
          return
        }

        if (result.data) {
          setVehicle(result.data)
        }
      } catch (error) {
        console.error("Error loading vehicle:", error)
        setError("Failed to load vehicle details")
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicle()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">Vehicle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <EditVehicleForm vehicle={vehicle} />
    </div>
  )
} 