"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the all users page as the default admin view
    router.push("/admin/users/all")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Admin Portal...</h1>
        <p className="text-muted-foreground">Redirecting to user management...</p>
      </div>
    </div>
  )
}
