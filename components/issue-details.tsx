"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { deleteIssue } from "@/lib/api"
import { ArrowLeft, ClipboardList, Calendar, Car, User, DollarSign, AlertTriangle, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
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
import { format } from "date-fns"

interface IssueDetailsProps {
  issue: {
    name: string
    vehicle: string
    driver: string
    grand_total: number
    priority: string
    issue_type: string
    status: string
    estimated_date_of_repair?: string
    mechanic?: string
    description?: string
    creation?: string
  }
}

export function IssueDetails({ issue }: IssueDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteIssue(issue.name)

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
        title: "Issue deleted",
        description: "The issue has been successfully deleted.",
      })
      router.push("/dashboard/issues")
      router.refresh()
    } catch (error) {
      console.error("Error deleting issue:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
      setIsDeleting(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>
      case "in progress":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Call API to update status
      // For now, just show a toast
      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Issue Details
          </h1>
          <p className="text-gray-500">View and manage issue information</p>
        </div>
        <Button variant="outline" asChild size="sm" className="gap-1">
          <Link href="/dashboard/issues">
            <ArrowLeft className="h-4 w-4" />
            Back to Issues
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Issue #{issue.name}</span>
              <div className="flex items-center gap-2">
                {getPriorityBadge(issue.priority)}
                {getStatusBadge(issue.status)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    {issue.vehicle}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Driver</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    {issue.driver}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Issue Type</h3>
                  <p className="text-lg font-semibold">{issue.issue_type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Grand Total</h3>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    {typeof issue.grand_total === 'number' 
                      ? issue.grand_total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                      : issue.grand_total}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {issue.estimated_date_of_repair && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estimated Repair Date</h3>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      {format(new Date(issue.estimated_date_of_repair), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}

                {issue.mechanic && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned Mechanic</h3>
                    <p className="text-lg font-semibold">{issue.mechanic}</p>
                  </div>
                )}

                {issue.creation && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                    <p className="text-lg font-semibold">
                      {format(new Date(issue.creation), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {issue.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <p className="whitespace-pre-wrap">{issue.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <Link href={`/dashboard/issues/edit/${issue.name}`}>
                <Pencil className="h-4 w-4" />
                Edit Issue
              </Link>
            </Button>

            {issue.status !== "Resolved" && (
              <Button
                variant="outline"
                className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 gap-2"
                onClick={() => handleStatusChange("Resolved")}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Resolved
              </Button>
            )}

            {issue.status !== "Closed" && (
              <Button
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800 gap-2"
                onClick={() => handleStatusChange("Closed")}
              >
                <XCircle className="h-4 w-4" />
                Close Issue
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Issue
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Issue
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this issue? This action cannot be undone.
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
