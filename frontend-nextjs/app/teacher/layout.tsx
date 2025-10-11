import type React from "react"
import { TeacherLayout } from "@/components/teacher/teacher-layout"

export default function TeacherRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherLayout>{children}</TeacherLayout>
}
