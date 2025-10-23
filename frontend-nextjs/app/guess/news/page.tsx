import type { Metadata } from "next"
import NewsClient from "./page.client"

export const dynamic = "force-static"
export const revalidate = 3600 // 1 hour

export const metadata: Metadata = {
  title: "News",
  description: "Latest news, achievements, and updates from Southville 8B NHS.",
  alternates: { canonical: "/guess/news" },
}

export default function NewsPage() {
  return <NewsClient />
}
