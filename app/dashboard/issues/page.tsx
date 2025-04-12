"use client"

import { useState, useEffect } from "react"
import { IssueTable } from "@/components/issue-table"
import { fetchIssues } from "@/lib/api"

interface Issue {
  name: string
  vehicle: string
  driver: string
  grand_total: number
  priority: string
  issue_type: string | null
  status: string
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIssues = async () => {
    try {
      setLoading(true)
      const data = await fetchIssues()
      setIssues(data)
      setError(null)
    } catch (err) {
      setError("Failed to load issues. Please try again.")
      console.error("Error loading issues:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Issue Tracking</h1>
      </div>

      <IssueTable issues={issues} loading={loading} error={error} onRefresh={loadIssues} />
    </div>
  )
}
