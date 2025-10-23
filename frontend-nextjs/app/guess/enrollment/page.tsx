import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/jsonld"
import Link from "next/link"

export const dynamic = "force-static"
export const revalidate = 604800 // 7 days

export const metadata: Metadata = {
  title: "Enrollment Process | Southville 8B NHS",
  description: "How to enroll at Southville 8B National High School — step-by-step enrollment process and requirements.",
  alternates: { canonical: "/guess/enrollment" },
  openGraph: {
    title: "Enrollment Process | Southville 8B NHS",
    description: "Step-by-step enrollment process and requirements.",
    url: "/guess/enrollment",
  },
  twitter: { card: "summary_large_image", title: "Enrollment Process | Southville 8B NHS" },
}

export default function EnrollmentPage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Enroll at Southville 8B National High School",
    description: "Step-by-step instructions for the enrollment process.",
    step: [
      { "@type": "HowToStep", name: "Prepare documents", text: "Gather transcripts, birth certificate, and ID." },
      { "@type": "HowToStep", name: "Submit application", text: "Complete the online application or visit the registrar." },
      { "@type": "HowToStep", name: "Pay fees", text: "Follow instructions to pay the enrollment or reservation fee." },
      { "@type": "HowToStep", name: "Orientation", text: "Attend the scheduled orientation and finalize subjects." },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <JsonLd data={howTo} />
      <h1 className="text-3xl font-bold mb-4">Enrollment Process</h1>
      <p className="text-muted-foreground mb-6">
        Follow these steps to complete your enrollment at Southville 8B National High School. For assistance, visit our
        <Link href="/guess/contact" className="text-blue-600 hover:underline ml-1">Contact page</Link>.
      </p>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          <strong>Prepare documents:</strong> transcripts, birth certificate, ID, and any required forms.
        </li>
        <li>
          <strong>Submit application:</strong> complete the online application or submit documents at the registrar.
        </li>
        <li>
          <strong>Pay fees:</strong> follow payment instructions for enrollment or reservation.
        </li>
        <li>
          <strong>Orientation:</strong> attend orientation and finalize your subject load.
        </li>
      </ol>
      <div className="mt-8">
        <Link href="/guess/contact" className="text-blue-600 hover:underline">Admissions contact</Link>
      </div>
    </div>
  )
}
