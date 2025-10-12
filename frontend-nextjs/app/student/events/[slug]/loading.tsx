import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventDetailsLoading() {
  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-32" />

        <div className="relative overflow-hidden rounded-2xl">
          <Skeleton className="w-full h-64 sm:h-80" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
