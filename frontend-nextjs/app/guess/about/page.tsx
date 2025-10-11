import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Southville 8B National High School — our history, mission, achievements, and the teachers who lead our learners.",
}

export default function AboutPage() {
  return <AboutPageClient />
}
