import { SystemConfigSection } from "@/components/superadmin/settings/system-config-section"
import { PageTransition } from "@/components/superadmin/page-transition"

export default function SystemConfigPage() {
  return (
    <PageTransition>
      <SystemConfigSection />
    </PageTransition>
  )
}
