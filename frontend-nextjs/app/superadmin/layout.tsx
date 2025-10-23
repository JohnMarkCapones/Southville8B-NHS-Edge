"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DashboardLayout } from "@/components/superadmin/dashboard/layout"
import { RequireAuth } from "@/components/auth"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Extract the current section from pathname
  const getCurrentSection = () => {
    // Dashboard section
    if (pathname === "/superadmin" || pathname === "/superadmin/overview") {
      return { activeSection: "dashboard", activeSubSection: "Overview" }
    }
    if (pathname === "/superadmin/system-status") {
      return { activeSection: "dashboard", activeSubSection: "System Status" }
    }

    // User & Access Management section
    if (pathname === "/superadmin/all-users") {
      return { activeSection: "users", activeSubSection: "All Users" }
    }
    if (pathname === "/superadmin/students") {
      return { activeSection: "users", activeSubSection: "Students" }
    }
    if (pathname === "/superadmin/teachers") {
      return { activeSection: "users", activeSubSection: "Teachers" }
    }
    if (pathname === "/superadmin/admins") {
      return { activeSection: "users", activeSubSection: "Admins" }
    }
    if (pathname === "/superadmin/permissions") {
      return { activeSection: "users", activeSubSection: "Permissions" }
    }
    if (pathname === "/superadmin/authentication") {
      return { activeSection: "users", activeSubSection: "Authentication" }
    }
    if (pathname === "/superadmin/user-activity") {
      return { activeSection: "users", activeSubSection: "User Activity" }
    }
    if (pathname === "/superadmin/session-management") {
      return { activeSection: "users", activeSubSection: "Session Management" }
    }

    // Content Management section
    if (pathname === "/superadmin/news") {
      return { activeSection: "content", activeSubSection: "News" }
    }
    if (pathname === "/superadmin/announcements") {
      return { activeSection: "content", activeSubSection: "Announcements" }
    }
    if (pathname === "/superadmin/events") {
      return { activeSection: "content", activeSubSection: "Events" }
    }
    if (pathname === "/superadmin/clubs") {
      return { activeSection: "content", activeSubSection: "Clubs/Organizations" }
    }
    if (pathname === "/superadmin/gallery") {
      return { activeSection: "content", activeSubSection: "School Gallery" }
    }
    if (pathname === "/superadmin/faqs") {
      return { activeSection: "content", activeSubSection: "FAQs/Knowledge Base" }
    }
    if (pathname === "/superadmin/static-pages") {
      return { activeSection: "content", activeSubSection: "Static School Pages" }
    }
    if (pathname === "/superadmin/resources") {
      return { activeSection: "content", activeSubSection: "Resources" }
    }

    // Academic Management section
    if (pathname === "/superadmin/subjects") {
      return { activeSection: "academic", activeSubSection: "Subjects" }
    }
    if (pathname === "/superadmin/classes") {
      return { activeSection: "academic", activeSubSection: "Grade Levels" }
    }
    if (pathname === "/superadmin/learning-materials" || pathname.startsWith("/superadmin/learning-materials/")) {
      return { activeSection: "academic", activeSubSection: "Learning Materials/Modules" }
    }
    if (pathname === "/superadmin/grading") {
      return { activeSection: "academic", activeSubSection: "Honors & Awards" }
    }
    if (pathname === "/superadmin/reports") {
      return { activeSection: "academic", activeSubSection: "Progress Tracking" }
    }

    // Schedule Management section
    if (pathname === "/superadmin/timetable") {
      return { activeSection: "schedule", activeSubSection: "Class Schedules" }
    }
    if (pathname === "/superadmin/academic-calendar") {
      return { activeSection: "schedule", activeSubSection: "Academic Calendar" }
    }
    if (pathname === "/superadmin/events") {
      return { activeSection: "schedule", activeSubSection: "Events" }
    }
    if (pathname === "/superadmin/attendance") {
      return { activeSection: "schedule", activeSubSection: "Attendance" }
    }
    if (pathname === "/superadmin/rooms") {
      return { activeSection: "schedule", activeSubSection: "Rooms" }
    }

    // Classroom Management section
    if (pathname === "/superadmin/virtual-classroom") {
      return { activeSection: "classroom", activeSubSection: "Virtual Classrooms" }
    }
    if (pathname === "/superadmin/classroom-management/assignments") {
      return { activeSection: "classroom", activeSubSection: "Class Assignments" }
    }
    if (pathname === "/superadmin/discussion-forums") {
      return { activeSection: "classroom", activeSubSection: "Discussion Forums" }
    }
    if (pathname === "/superadmin/collaboration-tools") {
      return { activeSection: "classroom", activeSubSection: "Collaboration Tools" }
    }

    // Settings section
    if (pathname === "/superadmin/system-settings") {
      return { activeSection: "settings", activeSubSection: "System Config" }
    }
    if (pathname === "/superadmin/security") {
      return { activeSection: "settings", activeSubSection: "Security" }
    }
    if (pathname === "/superadmin/backups") {
      return { activeSection: "settings", activeSubSection: "Backup" }
    }
    if (pathname === "/superadmin/integrations") {
      return { activeSection: "settings", activeSubSection: "Integrations" }
    }
    if (pathname === "/superadmin/audit-logs") {
      return { activeSection: "settings", activeSubSection: "Audit Logs" }
    }

    // Default fallback
    return { activeSection: "dashboard", activeSubSection: "Overview" }
  }

  const { activeSection, activeSubSection } = getCurrentSection()

  return (
    <RequireAuth requiredRoles={['Admin']}>
      <DashboardLayout activeSection={activeSection} activeSubSection={activeSubSection}>
        {children}
      </DashboardLayout>
    </RequireAuth>
  )
}

// Robots noindex is enforced at robots.txt level; optional per-page noindex can be added if needed
