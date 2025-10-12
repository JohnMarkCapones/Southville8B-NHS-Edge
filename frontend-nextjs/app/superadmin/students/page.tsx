import { StudentManagementSection } from "@/components/superadmin/sections/student-management-section"
import { PageTransition } from "@/components/superadmin/page-transition"

export default function StudentsPage() {
  return (
    <PageTransition>
      <StudentManagementSection />
    </PageTransition>
  )
}
