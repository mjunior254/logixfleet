"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table-with-fixed-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Loader2, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { RestrictedButton } from "@/components/restricted-button"
import { PermissionGate } from "@/components/permission-gate"

type Insurance = {
  name: string
  vehicle: string
  company_providers: string
  commencing_date: string
  expiry_date: string
}

export default function InsurancePage() {
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const loadInsurances = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch(
        'https://rjlogistics.logixfleetapp.com/api/resource/Insurance?fields=["name","vehicle","company_providers","commencing_date","expiry_date"]',
        {
          method: "GET",
          headers: {
            Authorization: `token 326ce9899dd14ad:40bdcef41b46097`,
          },
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch insurances: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Insurance data:", data)

      if (data && data.data) {
        setInsurances(data.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load insurance data. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error loading insurances:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insurance data. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadInsurances()
  }, [])

  const handleRefresh = () => {
    loadInsurances(true)
  }

  const filteredInsurances = insurances.filter((insurance) => {
    return (
      insurance.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.company_providers?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Vehicle", "Insurance Provider", "Start Date", "Expiry Date"]
    const csvContent = [
      headers.join(","),
      ...filteredInsurances.map((insurance) =>
        [insurance.vehicle, insurance.company_providers, insurance.commencing_date, insurance.expiry_date].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "insurance_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to check if insurance is expired or expiring soon
  const getInsuranceStatus = (expiryDate: string) => {
    if (!expiryDate) return "unknown"

    const today = new Date()
    const expiry = new Date(expiryDate)

    if (expiry < today) {
      return "expired"
    }

    // Check if expiring in the next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    if (expiry <= thirtyDaysFromNow) {
      return "expiring-soon"
    }

    return "active"
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading insurance data...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate docType="Insurance" permission="read" showAlert={true}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Insurance</h1>
          <p className="text-gray-500">Manage insurance policies for your fleet vehicles</p>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle or provider..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
              docType="Insurance"
              permission="create"
              onClick={() => router.push("/dashboard/vehicles/insurance/new")}
              className="bg-blue-600 hover:bg-blue-700"
              fallbackMessage="You don't have permission to create insurance records"
              showAlert={true}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Insurance
            </RestrictedButton>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="table-scroll-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Insurance Provider</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsurances.length > 0 ? (
                  filteredInsurances.map((insurance) => {
                    const status = getInsuranceStatus(insurance.expiry_date)
                    return (
                      <TableRow key={insurance.name}>
                        <TableCell className="font-medium">{insurance.vehicle}</TableCell>
                        <TableCell>{insurance.company_providers}</TableCell>
                        <TableCell>
                          {insurance.commencing_date
                            ? format(new Date(insurance.commencing_date), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {insurance.expiry_date ? format(new Date(insurance.expiry_date), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              status === "active"
                                ? "bg-green-100 text-green-800"
                                : status === "expiring-soon"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {status === "active" ? "Active" : status === "expiring-soon" ? "Expiring Soon" : "Expired"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No insurance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Insurance Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {insurances.filter((i) => getInsuranceStatus(i.expiry_date) === "active").length}
              </div>
              <div className="text-sm text-gray-500">Active Policies</div>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {insurances.filter((i) => getInsuranceStatus(i.expiry_date) === "expiring-soon").length}
              </div>
              <div className="text-sm text-gray-500">Expiring Soon (30 days)</div>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="text-2xl font-bold text-red-600">
                {insurances.filter((i) => getInsuranceStatus(i.expiry_date) === "expired").length}
              </div>
              <div className="text-sm text-gray-500">Expired Policies</div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  )
}
