"use client"

import React from 'react'
import ComingSoon from "@/components/superadmin/coming-soon"
import { FileText } from "lucide-react"

const CourseContentPage = () => {
  const expectedFeatures = [
    "Create and organize course materials",
    "Upload documents, videos, and resources",
    "Content versioning and revision history",
    "Interactive content editor with rich media",
    "Content templates and standardization",
    "Bulk content import and export tools",
    "Content approval workflows",
    "Student progress tracking per content"
  ]

  return (
    <ComingSoon
      title="Course Content"
      description="Manage educational materials, resources, and course content across all subjects"
      icon={FileText}
      expectedFeatures={expectedFeatures}
      priority="high"
      estimatedDate="Q1 2024"
    />
  )
}

export default CourseContentPage
