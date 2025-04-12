import { Suspense } from "react"
import { IssueDetails } from "@/components/issue-details"
import { fetchIssueById } from "@/lib/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

interface IssueDetailsPageProps {
  params: {
    id: string
  }
}

async function IssueDetailsContent({ id }: { id: string }) {
  const result = await fetchIssueById(id)

  if (result.error || !result.data) {
    notFound()
  }

  return <IssueDetails issue={result.data} />
}

export default function IssueDetailsPage({ params }: IssueDetailsPageProps) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="border rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <IssueDetailsContent id={params.id} />
      </Suspense>
    </div>
  )
}
