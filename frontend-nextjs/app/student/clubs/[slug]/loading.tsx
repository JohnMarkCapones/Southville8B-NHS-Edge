import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClubDetailLoading() {
  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section Skeleton */}
        <div className="relative h-80 overflow-hidden">
          <Skeleton className="absolute inset-0" />
          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-end gap-6">
                <Skeleton className="w-24 h-24 rounded-3xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 -mt-6 relative z-20">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4 border-b pb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                  </div>
                  <div className="space-y-6">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-36 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  )
}
