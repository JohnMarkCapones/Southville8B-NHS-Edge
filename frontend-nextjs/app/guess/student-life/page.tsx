import type { Metadata } from "next"
import StudentLifeClient from "./page.client"

export const dynamic = "force-static"
export const revalidate = 604800 // 7 days

export const metadata: Metadata = {
  title: "Student Life",
  description:
    "Explore vibrant campus life, clubs & organizations, facilities, events, and support services at Southville 8B NHS.",
  alternates: { canonical: "/guess/student-life" },
}

export default function StudentLifePage() {
  return <StudentLifeClient />
}
