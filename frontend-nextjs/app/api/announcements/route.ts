import { NextResponse } from "next/server"
import { announcementsData } from "@/lib/announcements-data"

export const runtime = "edge"

export async function GET() {
  // In production, replace with a fetch to the NestJS API.
  // This local response is cacheable by consumers using next: { revalidate, tags }.
  return NextResponse.json({ items: announcementsData })
}
