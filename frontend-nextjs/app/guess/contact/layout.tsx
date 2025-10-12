import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contact Us | Southville 8B NHS",
  description: "Get in touch with Southville 8B National High School in Rodriguez, Rizal — contact information, departments, and hours.",
  alternates: { canonical: "/guess/contact" },
  openGraph: {
    title: "Contact Us | Southville 8B NHS",
    description:
      "Get in touch with Southville 8B National High School in Rodriguez, Rizal — contact information, departments, and hours.",
    url: "/guess/contact",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Southville 8B NHS",
    description:
      "Get in touch with Southville 8B National High School in Rodriguez, Rizal — contact information, departments, and hours.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
