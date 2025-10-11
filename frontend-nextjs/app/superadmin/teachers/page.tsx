import { TeacherManagementSection } from "@/components/superadmin/sections/teacher-management-section"
import { PageTransition } from "@/components/superadmin/page-transition"

export default function TeachersPage() {
  return (
    <PageTransition>
      <TeacherManagementSection />
    </PageTransition>
  )
}
