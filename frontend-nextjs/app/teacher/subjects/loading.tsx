import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubjectsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-2xl bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 bg-white/20" />
                <Skeleton className="h-4 w-96 bg-white/10" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 bg-white/20" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16 bg-white/10" />
                      <Skeleton className="h-5 w-8 bg-white/20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-32 bg-white/20 rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-12 w-full bg-white/80 dark:bg-slate-800/80 rounded-2xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-2xl"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
