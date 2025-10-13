import type React from "react"
import type { Metadata } from "next"
import { TeacherLayout } from "@/components/teacher/teacher-layout"
import { PrefetchRoutes } from "@/components/prefetch-routes"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function TeacherRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PrefetchRoutes userType="teacher" />
      <TeacherLayout>{children}</TeacherLayout>
    </>
  )
}
