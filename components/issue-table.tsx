"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ClipboardList,
  Eye,
  Pencil,
  X,
  AlertTriangle,
} from "lucide-react"

interface Issue {
  name: string
  vehicle: string
  driver: string
  grand_total: number
  priority: string
  issue_type: string | null
  status: string
}

interface IssueTableProps {
  issues: Issue[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function IssueTable({ issues, loading, error, onRefresh }: IssueTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Get unique priorities and statuses for filters
  const priorities = Array.from(new Set(issues.map((issue) => issue.priority))).filter(Boolean)
  const statuses = Array.from(new Set(issues.map((issue) => issue.status))).filter(Boolean)

  // Filter issues based on search, priority, status, and active tab
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.issue_type && issue.issue_type.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPriority = priorityFilter === "all" ? true : issue.priority === priorityFilter
    const matchesStatus = statusFilter === "all" ? true : issue.status === statusFilter
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "open"
          ? issue.status === "Open"
          : activeTab === "in-progress"
            ? issue.status === "In Progress"
            : activeTab === "resolved"
              ? issue.status === "Resolved"
              : activeTab === "closed"
                ? issue.status === "Closed"
                : true

    return matchesSearch && matchesPriority && matchesStatus && matchesTab
  })

  // Get counts for tabs
  const openCount = issues.filter((issue) => issue.status === "Open").length
  const inProgressCount = issues.filter((issue) => issue.status === "In Progress").length
  const resolvedCount = issues.filter((issue) => issue.status === "Resolved").length
  const closedCount = issues.filter((issue) => issue.status === "Closed").length

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Issue ID", "Vehicle", "Driver", "Amount", "Priority", "Issue Type", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredIssues.map((issue) =>
        [
          issue.name,
          issue.vehicle,
          issue.driver,
          issue.grand_total,
          issue.priority,
          issue.issue_type || "N/A",
          issue.status,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "issues.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Issue Tracking</h2>
            <p className="text-sm text-gray-500">Manage vehicle maintenance issues</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={() => router.push("/dashboard/issues/new")}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Issue
          </Button>
        </div>
      </div>

      <Card className="border-blue-100">
        <CardHeader className="border-b p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={loading}
                title="Refresh"
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 shrink-0"
              >
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                <span className="hidden sm:inline">Filters</span>
                {(priorityFilter !== "all" || statusFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1">
                    {priorityFilter !== "all" && statusFilter !== "all" ? 2 : 1}
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
                <label className="text-sm font-medium mb-1 block text-gray-500">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-500">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>

        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                All Issues
                <Badge variant="secondary" className="ml-2">
                  {issues.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="open"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Open
                <Badge variant="secondary" className="ml-2">
                  {openCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                In Progress
                <Badge variant="secondary" className="ml-2">
                  {inProgressCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Resolved
                <Badge variant="secondary" className="ml-2">
                  {resolvedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 data-[state=active]:text-blue-600"
              >
                Closed
                <Badge variant="secondary" className="ml-2">
                  {closedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <div className="p-4">
            <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Error loading issues</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading issues...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden md:block">
              <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No issues found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIssues.map((issue) => (
                        <TableRow key={issue.name} className="hover:bg-gray-50 cursor-pointer">
                          <TableCell className="font-medium">{issue.name}</TableCell>
                          <TableCell>{issue.vehicle}</TableCell>
                          <TableCell>{issue.driver}</TableCell>
                          <TableCell>${issue.grand_total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.issue_type || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(issue.status)}>
                              {issue.status}
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
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/issues/${issue.name}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/issues/edit/${issue.name}`)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Issue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Mobile view */}
            <div className="md:hidden">
              <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
                <div className="divide-y">
                  {filteredIssues.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No issues found</div>
                  ) : (
                    filteredIssues.map((issue) => (
                      <div
                        key={issue.name}
                        className="p-4 hover:bg-gray-50"
                        onClick={() => router.push(`/dashboard/issues/${issue.name}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{issue.name}</div>
                              <div className="text-sm text-gray-500">{issue.vehicle}</div>
                            </div>
                          </div>

                          <Badge variant="outline" className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Driver:</span> {issue.driver}
                          </div>
                          <div>
                            <span className="text-gray-500">Amount:</span> ${issue.grand_total.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-gray-500">Issue Type:</span> {issue.issue_type || "N/A"}
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span>{" "}
                            <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/issues/edit/${issue.name}`)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredIssues.length} of {issues.length} issues
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
      </Card>
    </div>
  )
}
