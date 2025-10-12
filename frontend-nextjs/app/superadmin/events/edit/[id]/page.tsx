"use client"

import { useParams } from "next/navigation"
import CreateEventPage from "../../create/page"

export default function EditEventPage() {
  const params = useParams()
  const eventId = params.id

  // In a real application, you would fetch the event data here
  // For now, we'll reuse the create page component
  // The create page component would be modified to accept an optional eventId prop
  // and load existing data when editing

  return <CreateEventPage />
}
