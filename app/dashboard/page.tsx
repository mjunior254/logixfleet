"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Car,
  Calendar,
  FileText,
  User,
  ArrowRight,
  Activity,
  Clock,
  PenToolIcon as Tool,
  ShoppingBag,
  Clipboard,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { PermissionGate } from "@/components/permission-gate"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user } = useAuth()
  const { canRead, canCreate } = usePermissions()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}!</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <PermissionGate docType="Vehicle" permission="read">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex justify-between items-center">
                <span>Total Vehicles</span>
                <Car className="h-5 w-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">+2 since last month</p>
            </CardContent>
          </Card>
        </PermissionGate>

        <PermissionGate docType="Driver" permission="read">
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex justify-between items-center">
                <span>Active Drivers</span>
                <User className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-xs text-gray-500 mt-1">All drivers available</p>
            </CardContent>
          </Card>
        </PermissionGate>

        <PermissionGate docType="Vehicle Service" permission="read">
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex justify-between items-center">
                <span>Maintenance Due</span>
                <Tool className="h-5 w-5 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </PermissionGate>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vehicle #{i} completed maintenance</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />2 hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700">
              View all activities
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center">
              <Tool className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2">
              <PermissionGate
                docType="Vehicle"
                permission="create"
                fallback={
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center" disabled>
                    <Car className="h-6 w-6 mb-2 opacity-50" />
                    <span className="text-sm">Add Vehicle</span>
                  </Button>
                }
              >
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  asChild
                >
                  <Link href="/dashboard/vehicles/new">
                    <Car className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm">Add Vehicle</span>
                  </Link>
                </Button>
              </PermissionGate>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                asChild
              >
                <Link href="/dashboard/schedule">
                  <Calendar className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Schedule</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                asChild
              >
                <Link href="/dashboard/reports">
                  <FileText className="h-6 w-6 mb-2 text-amber-600" />
                  <span className="text-sm">Reports</span>
                </Link>
              </Button>

              <PermissionGate
                docType="Driver"
                permission="create"
                fallback={
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center" disabled>
                    <User className="h-6 w-6 mb-2 opacity-50" />
                    <span className="text-sm">Add Driver</span>
                  </Button>
                }
              >
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  asChild
                >
                  <Link href="/dashboard/drivers/new">
                    <User className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm">Add Driver</span>
                  </Link>
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <PermissionGate docType="Vehicle Service" permission="read">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-base">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Car className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Vehicle #{i}</p>
                        <p className="text-xs text-gray-500">Oil Change</p>
                      </div>
                    </div>
                    <Badge variant={i === 1 ? "destructive" : i === 2 ? "secondary" : "outline"}>
                      {i === 1 ? "Urgent" : `In ${i} days`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" size="sm" className="ml-auto text-blue-600 hover:text-blue-700">
                View schedule
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </PermissionGate>

        <PermissionGate docType="Purchase Order" permission="read">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-base">
                <ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <ShoppingBag className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">PO-{1000 + i}</p>
                        <p className="text-xs text-gray-500">Spare Parts</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">${(i * 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" size="sm" className="ml-auto text-green-600 hover:text-green-700">
                View purchases
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </PermissionGate>

        <PermissionGate docType="Vehicle Inspection" permission="read">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center text-base">
                <Clipboard className="h-5 w-5 mr-2 text-amber-600" />
                Recent Inspections
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Clipboard className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Vehicle #{i}</p>
                        <p className="text-xs text-gray-500">Routine Inspection</p>
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">{i} days ago</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" size="sm" className="ml-auto text-amber-600 hover:text-amber-700">
                View inspections
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </PermissionGate>
      </div>
    </div>
  )
}
