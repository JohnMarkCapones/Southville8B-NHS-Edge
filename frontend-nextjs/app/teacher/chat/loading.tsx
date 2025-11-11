import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-8rem)]">
      <div className="flex gap-4 h-full">
        <div className="w-80 flex flex-col border-r">
          <Skeleton className="h-12 m-4" />
          <div className="flex-1 p-4 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col border rounded-lg">
          <div className="border-b p-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

