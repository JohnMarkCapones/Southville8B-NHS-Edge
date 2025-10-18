/**
 * Student Layout
 * 
 * Wraps all student routes with authentication and role-based protection.
 * Only users with the "Student" role can access these routes.
 */

import type React from "react"
import type { Metadata } from "next"
import { RequireAuth } from "@/components/auth"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function StudentRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth requiredRoles={['Student']}>
      {children}
    </RequireAuth>
  )
}

