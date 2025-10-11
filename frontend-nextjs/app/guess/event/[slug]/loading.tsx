import { AnimatedCard } from "@/components/ui/animated-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Navigation Skeleton */}
      <div className="container mx-auto px-4 pt-8">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Hero Section Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />

            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <AnimatedCard key={i} className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>

          <AnimatedCard className="overflow-hidden">
            <Skeleton className="w-full h-64 lg:h-80" />
          </AnimatedCard>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedCard className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>

          <div className="space-y-6">
            <AnimatedCard className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <Skeleton className="h-6 w-20 mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  )
}
