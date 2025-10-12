export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[10000]">
      <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-xl font-semibold text-primary animate-pulse">Loading Portal...</p>
    </div>
  )
}
