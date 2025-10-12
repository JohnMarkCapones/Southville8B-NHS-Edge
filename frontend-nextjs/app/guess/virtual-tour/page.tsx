import type { Metadata } from "next"
import VirtualTourClient from "./client"

export const dynamic = "force-static"
export const revalidate = 604800 // 7 days

export const metadata: Metadata = {
  title: "Virtual Tour",
  description: "Explore our beautiful campus with an interactive virtual tour.",
  alternates: { canonical: "/guess/virtual-tour" },
}

export default function VirtualTourPage() {
  return <VirtualTourClient />
}
