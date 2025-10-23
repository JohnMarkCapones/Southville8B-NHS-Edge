import AcademicsClient from "./page.client"
import type { Metadata } from "next"

// ISR Configuration: Revalidate every 24 hours (academics info rarely changes)
export const dynamic = "force-static"
export const revalidate = 86400 // 24 hours

export const metadata: Metadata = {
  title: "Academics",
  description: "Comprehensive academic programs at Southville 8B NHS. Excellence in STEM, Languages, Arts, and more.",
  alternates: { canonical: "/guess/academics" },
}

export default function AcademicsPage() {
  return <AcademicsClient />
}
