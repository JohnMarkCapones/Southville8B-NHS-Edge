import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 lg:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 bg-white/20" />
            <Skeleton className="h-6 w-96 bg-white/10" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-32 bg-white/10" />
              <Skeleton className="h-8 w-24 bg-white/10" />
              <Skeleton className="h-8 w-28 bg-white/10" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 bg-white/20" />
            <Skeleton className="h-10 w-36 bg-white/20" />
            <Skeleton className="h-10 w-28 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <Card className="bg-white dark:bg-slate-900 shadow-lg">
        <div className="border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-6">
          {/* Filters Skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  )
}
