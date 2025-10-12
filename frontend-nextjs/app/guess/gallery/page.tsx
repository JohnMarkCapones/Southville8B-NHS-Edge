import type { Metadata } from "next"
import GalleryClient from "./gallery-client"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore our comprehensive gallery showcasing student life, academics, athletics, arts, and campus events at Southville 8B National High School.",
  alternates: { canonical: "/guess/gallery" },
  openGraph: {
    title: "Gallery",
    description:
      "Explore our comprehensive gallery showcasing student life, academics, athletics, arts, and campus events at Southville 8B National High School.",
    url: "/guess/gallery",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery",
    description:
      "Explore our comprehensive gallery showcasing student life, academics, athletics, arts, and campus events at Southville 8B National High School.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}
