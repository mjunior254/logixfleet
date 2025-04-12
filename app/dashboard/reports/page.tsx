import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { Car, User, ArrowRight } from "lucide-react"

export default async function ReportsPage() {
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-gray-500">View and export fleet management reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-600" />
              <CardTitle>Vehicle Reports</CardTitle>
            </div>
            <CardDescription>
              Comprehensive analysis of your fleet vehicles including types, status, and maintenance needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              View detailed statistics about your vehicle fleet, including distribution by type, age analysis, and
              maintenance status. Export reports for further analysis.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/reports/vehicles" className="flex items-center justify-center">
                View Vehicle Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              <CardTitle>Driver Reports</CardTitle>
            </div>
            <CardDescription>
              Detailed analysis of driver information, license status, and vehicle assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Access comprehensive driver statistics including status distribution, license expiry tracking, and vehicle
              assignment analysis. Export data for record keeping.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/reports/drivers" className="flex items-center justify-center">
                View Driver Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
