"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Download, RefreshCw, Filter, UserPlus, Users, X, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RestrictedButton } from "@/components/restricted-button"
import { PermissionGate } from "@/components/permission-gate"
import { fetchUsers, deleteUser } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch users from API
  const loadUsers = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetchUsers()
      console.log("Users API response:", response)

      if (response && response.data) {
        setUsers(response.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        })
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
  }, [])

  const handleRefresh = () => {
    loadUsers(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser(userId)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete user.",
        })
        return
      }

      setUsers(users.filter((user) => user.name !== userId))
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user.",
      })
    }
  }

  // Get unique roles and departments for filters
  const roles = Array.from(new Set(users.map((u) => u.role_profile))).filter(Boolean)
  const departments = Array.from(new Set(users.map((u) => u.department))).filter(Boolean)

  // Filter users based on search, role, department, and active tab
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" ? true : user.role_profile === roleFilter
    const matchesDepartment = departmentFilter === "all" ? true : user.department === departmentFilter
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "active"
          ? user.enabled === 1
          : activeTab === "inactive"
            ? user.enabled === 0
            : true

    return matchesSearch && matchesRole && matchesDepartment && matchesTab
  })

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Role", "Department", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.full_name || `${user.first_name || ""} ${user.last_name || ""}`,
          user.email || "",
          user.role_profile || "N/A",
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

  // Get counts for tabs
  const activeCount = users.filter((user) => user.enabled === 1).length
  const inactiveCount = users.filter((user) => user.enabled === 0).length

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-500">Manage system users and their permissions</p>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Users
          </h1>
          <p className="text-gray-500">Manage system users and their permissions</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <RestrictedButton
            docType="User"
            permission="create"
            onClick={() => router.push("/dashboard/users/new")}
            className="bg-blue-600 hover:bg-blue-700"
            fallbackMessage="You don't have permission to create users"
            showAlert={true}
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </RestrictedButton>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh"
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 shrink-0"
              >
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                <span className="hidden sm:inline">Filters</span>
                {(roleFilter !== "all" || departmentFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {roleFilter !== "all" && departmentFilter !== "all" ? 2 : 1}
                  </Badge>
                )}
              </Button>

              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-500">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-500">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                All Users
                <Badge variant="secondary" className="ml-2">
                  {users.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Inactive
                <Badge variant="secondary" className="ml-2">
                  {inactiveCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.name} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-blue-100 text-blue-600">
                            <AvatarFallback>
                              {getInitials(user.full_name || `${user.first_name || ""} ${user.last_name || ""}`)}
                            </AvatarFallback>
                          </Avatar>
                          {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`}
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">{user.email}</TableCell>
                      <TableCell>{user.role_profile || "N/A"}</TableCell>
                      <TableCell>{user.department || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.enabled === 1 ? "secondary" : "destructive"}
                          className={`${
                            user.enabled === 1
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          {user.enabled === 1 ? "Active" : "Inactive"}
                        </Badge>
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
                            <PermissionGate docType="User" permission="write">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/users/edit/${user.name}`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>

                            <PermissionGate docType="User" permission="delete">
                              <DropdownMenuItem onClick={() => handleDeleteUser(user.name)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
          </ScrollArea>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
            <div className="divide-y">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.name} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-blue-100 text-blue-600">
                          <AvatarFallback>
                            {getInitials(user.full_name || `${user.first_name || ""} ${user.last_name || ""}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>

                      <Badge
                        variant={user.enabled === 1 ? "secondary" : "destructive"}
                        className={`${
                          user.enabled === 1
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {user.enabled === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="flex gap-2">
                        {user.role_profile && (
                          <Badge variant="outline" className="bg-blue-50">
                            {user.role_profile}
                          </Badge>
                        )}
                        {user.department && (
                          <Badge variant="outline" className="bg-gray-50">
                            {user.department}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <PermissionGate docType="User" permission="write">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/dashboard/users/edit/${user.name}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGate>

                        <PermissionGate docType="User" permission="delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleDeleteUser(user.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No users found.</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
