"use client"

import { NewIssueForm } from "@/components/new-issue-form"

export default function NewIssuePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Issue</h1>
      </div>

      <NewIssueForm />
    </div>
  )
}
