"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table-with-fixed-header"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MoreHorizontal, Search, Loader2, Download, RefreshCw, Lock, Pencil, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchUsers } from "@/lib/actions"
import { RestrictedButton } from "@/components/restricted-button"
import { usePermissions } from "@/hooks/use-permissions"
import { PermissionGate } from "@/components/permission-gate"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type User = {
  name: string
  first_name: string
  last_name: string
  email: string
  full_name: string
  enabled: number
  role?: string
  department?: string
}

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { canRead, canCreate, canWrite, canDelete } = usePermissions()

  const loadUsers = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const result = await fetchUsers()

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
        return
      }

      if (result.data) {
        // Add mock role for now if not provided by API
        const usersWithRoles = result.data.map((user: User) => ({
          ...user,
          role:
            user.role || ["Admin", "FleetManager", "Driver", "Accountant", "Supervisor"][Math.floor(Math.random() * 5)],
        }))
        setUsers(usersWithRoles)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [toast])

  const handleRefresh = () => {
    loadUsers(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter
    const matchesDepartment = departmentFilter === "all" ? true : user.department === departmentFilter

    return matchesSearch && matchesRole && matchesDepartment
  })

  const handleDisableUser = async (userId: string) => {
    try {
      // This would be replaced with your actual API call
      toast({
        title: "User disabled",
        description: "The user has been successfully disabled.",
      })
      // Update local state to reflect the change
      setUsers(users.map((user) => (user.name === userId ? { ...user, enabled: 0 } : user)))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disable user.",
      })
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Role", "Department", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.full_name || `${user.first_name} ${user.last_name}`,
          user.email,
          user.role || "N/A",
          user.department || "N/A",
          user.enabled === 1 ? "Active" : "Inactive",
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "users.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const showUserDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate docType="User" permission="read" showAlert={true}>
      <div className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="FleetManager">Fleet Manager</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Accountant">Accountant</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>

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
              docType="User"
              permission="create"
              onClick={() => router.push("/dashboard/users/new")}
              className="bg-blue-600 hover:bg-blue-700"
              fallbackMessage="You don't have permission to create users"
              showAlert={true}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New User
            </RestrictedButton>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="table-scroll-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.name}>
                      <TableCell
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => showUserDetails(user)}
                      >
                        {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.department}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.enabled === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.enabled === 1 ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <PermissionGate
                              docType="User"
                              permission="write"
                              fallback={
                                <DropdownMenuItem
                                  className="text-orange-500"
                                  onClick={() =>
                                    toast({
                                      variant: "destructive",
                                      title: "Access Denied",
                                      description: "You don't have permission to edit users",
                                    })
                                  }
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              }
                            >
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.email}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate
                              docType="User"
                              permission="write"
                              fallback={
                                <DropdownMenuItem
                                  className="text-orange-500"
                                  onClick={() =>
                                    toast({
                                      variant: "destructive",
                                      title: "Access Denied",
                                      description: "You don't have permission to disable users",
                                    })
                                  }
                                >
                                  <Lock className="mr-2 h-4 w-4" />
                                  Disable
                                </DropdownMenuItem>
                              }
                            >
                              <DropdownMenuItem
                                onClick={() => handleDisableUser(user.name)}
                                className={user.enabled === 1 ? "text-red-600" : "text-green-600"}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {user.enabled === 1 ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p>{selectedUser.full_name || `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p>{selectedUser.role || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p>{selectedUser.department || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedUser.enabled === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.enabled === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
