import StudentLayout from "@/components/student/student-layout"
import TermsContent from "./terms-content"

export const metadata = {
  title: "Terms of Service | Student Portal | Southville 8B NHS",
  description: "Read the Terms of Service establishing the binding conditions governing access to and use of the Southville 8B National High School website, digital platforms, and online services.",
}

export default function StudentTermsPage() {
  return (
    <StudentLayout>
      <TermsContent />
    </StudentLayout>
  )
}


