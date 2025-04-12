"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LogOut,
  Home,
  Car,
  User,
  FileText,
  Settings,
  PenToolIcon as Tool,
  Calendar,
  ChevronDown,
  ShoppingCart,
  CreditCard,
  Wrench,
  Menu,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth, type User as AuthUser } from "@/contexts/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePermissions } from "@/hooks/use-permissions"

export function DashboardSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { canRead, hasModule } = usePermissions()

  // Check permissions for different modules
  const canAccessUsers = canRead("User")
  const canAccessVehicles = canRead("Vehicle")
  const canAccessDrivers = canRead("Driver")
  const canAccessMechanics = canRead("Mechanic")
  const canAccessGarages = canRead("Garage")
  const canAccessVehicleServices = canRead("Vehicle Service")
  const canAccessVehicleInspections = canRead("Vehicle Inspection")
  const canAccessInsurance = canRead("Insurance")
  const canAccessPurchasing = hasModule("Buying")
  const canAccessAccounting = hasModule("Accounts")

  return (
    <>
      <Sidebar variant="floating" className="border-r border-gray-200">
        <SidebarHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src="/images/logixlogo.png" alt="LogixFleet Logo" className="h-10" />
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard">
                  <Home className="mr-2 h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {canAccessUsers && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/users")}>
                  <Link href="/dashboard/users">
                    <Users className="mr-2 h-5 w-5" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canAccessVehicles && (
              <Collapsible>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={pathname.startsWith("/dashboard/vehicles")}>
                      <Car className="mr-2 h-5 w-5" />
                      <span>Vehicles</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/dashboard/vehicles"}>
                        <Link href="/dashboard/vehicles">
                          <span>All Vehicles</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {canAccessVehicleInspections && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard/vehicles/inspections"}>
                          <Link href="/dashboard/vehicles/inspections">
                            <span>Inspections</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {canAccessInsurance && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/vehicles/insurance")}>
                          <Link href="/dashboard/vehicles/insurance">
                            <span>Insurance</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {canAccessVehicleServices && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard/vehicles/service"}>
                          <Link href="/dashboard/vehicles/service">
                            <span>Service</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            )}

            {canAccessDrivers && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/drivers")}>
                  <Link href="/dashboard/drivers">
                    <User className="mr-2 h-5 w-5" />
                    <span>Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canAccessMechanics && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/mechanics")}>
                  <Link href="/dashboard/mechanics">
                    <Wrench className="mr-2 h-5 w-5" />
                    <span>Mechanics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canAccessGarages && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/garages")}>
                  <Link href="/dashboard/garages">
                    <Tool className="mr-2 h-5 w-5" />
                    <span>Garages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <Collapsible>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={pathname.startsWith("/dashboard/reports")}>
                    <FileText className="mr-2 h-5 w-5" />
                    <span>Reports</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenu className="ml-6 mt-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/reports/vehicles"}>
                      <Link href="/dashboard/reports/vehicles">
                        <span>Vehicle Reports</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/reports/drivers"}>
                      <Link href="/dashboard/reports/drivers">
                        <span>Driver Reports</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>

            {canAccessVehicleServices && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/maintenance")}>
                  <Link href="/dashboard/maintenance">
                    <Tool className="mr-2 h-5 w-5" />
                    <span>Maintenance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/schedule")}>
                <Link href="/dashboard/schedule">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Schedule</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {canAccessPurchasing && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/purchasing")}>
                  <Link href="/dashboard/purchasing">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    <span>Purchasing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canAccessAccounting && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/accounting")}>
                  <Link href="/dashboard/accounting">
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>Accounting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/settings")}>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-2">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-500 truncate">{user.roles[0] || "User"}</p>
              </div>
            </div>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Mobile trigger */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button className="bg-white shadow-md rounded-md" variant="outline" size="icon">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
