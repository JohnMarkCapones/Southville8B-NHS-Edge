import type { Metadata } from "next"
import GalleryClient from "./gallery-client"

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore our comprehensive gallery showcasing student life, academics, athletics, arts, and campus events at Southville 8B National High School.",
}

export default function GalleryPage() {
  return <GalleryClient />
}
