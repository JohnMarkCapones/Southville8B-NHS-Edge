import type { Metadata } from "next"
import ExtracurricularClient from "./client"

export const dynamic = "force-static"
export const revalidate = 604800 // 7 days

export const metadata: Metadata = {
  title: "Extracurriculars",
  description:
    "Explore academic clubs, honor societies, and special interest groups at Southville 8B NHS — with schedules, highlights, and how to join.",
  alternates: { canonical: "/guess/extracurricular" },
}

export default function ExtracurricularPage() {
  return <ExtracurricularClient />
}
