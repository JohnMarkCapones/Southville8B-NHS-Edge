import { AllUsersManagementSection } from "@/components/superadmin/all-users-management-section"
import { PageTransition } from "@/components/superadmin/page-transition"

export default function AllUsersPage() {
  return (
    <PageTransition>
      <AllUsersManagementSection />
    </PageTransition>
  )
}
