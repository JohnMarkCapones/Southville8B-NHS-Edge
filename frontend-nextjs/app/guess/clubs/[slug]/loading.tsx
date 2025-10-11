import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative py-20 sm:py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-8 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-12 bg-white/20" />
            <div className="flex gap-4 justify-center mb-12">
              <Skeleton className="h-14 w-48 bg-white/20" />
              <Skeleton className="h-14 w-48 bg-white/20" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-white/20" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="space-y-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-64" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
