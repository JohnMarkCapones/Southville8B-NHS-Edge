import StudentLayout from "@/components/student/student-layout"
import PrivacyContent from "./privacy-content"

export const metadata = {
  title: "Privacy Policy | Student Portal | Southville 8B NHS",
  description: "Learn how Southville 8B National High School collects, uses, and protects your personal information under the Philippine Data Privacy Act of 2012 (RA 10173).",
}

export default function StudentPrivacyPage() {
  return (
    <StudentLayout>
      <PrivacyContent />
    </StudentLayout>
  )
}


