export const dynamic = "force-static"
export const revalidate = 86400 // Revalidate once per day
import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo"
import { Shield, FileText, Scale, AlertTriangle, Mail, Calendar, ChevronRight, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service | Southville 8B NHS",
  description: "Read the Terms of Service for using Southville 8B National High School's website and services.",
  alternates: { canonical: "/guess/terms" },
  openGraph: {
    title: "Terms of Service | Southville 8B NHS",
    description:
      "Read the Terms of Service for using Southville 8B National High School's website and services.",
    url: "/guess/terms",
    type: "article",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Southville 8B NHS",
    description:
      "Read the Terms of Service for using Southville 8B National High School's website and services.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function TermsPage() {
  const lastUpdated = "December 15, 2024"
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL + "/" },
    { name: "Terms of Service", url: SITE_URL + "/guess/terms" },
  ])

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FileText className="w-5 h-5" />,
      content:
        "By accessing and using the Southville 8B National High School website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of our website immediately.",
    },
    {
      id: "use-content",
      title: "Use of Content",
      icon: <Shield className="w-5 h-5" />,
      content:
        "All content on this website, including text, images, graphics, logos, and multimedia materials, is the property of Southville 8B National High School and is protected by copyright laws. Content is provided for informational and educational purposes only. You may not copy, modify, distribute, or reproduce any content without prior written permission from the school administration.",
    },
    {
      id: "user-conduct",
      title: "User Conduct",
      icon: <Scale className="w-5 h-5" />,
      content:
        "Users must conduct themselves respectfully and appropriately when using our website. Prohibited activities include: posting offensive or inappropriate content, attempting to gain unauthorized access to systems, distributing malware or harmful code, and engaging in any activity that disrupts the website's functionality or violates applicable laws.",
    },
    {
      id: "third-party",
      title: "Third-Party Links",
      icon: <AlertTriangle className="w-5 h-5" />,
      content:
        "Our website may contain links to third-party websites for your convenience and information. Southville 8B National High School does not endorse, control, or assume responsibility for the content, privacy policies, or practices of these external sites. We encourage you to review the terms and privacy policies of any third-party websites you visit.",
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: <Shield className="w-5 h-5" />,
      content:
        "Southville 8B National High School provides this website on an 'as is' basis. We make no warranties, express or implied, regarding the accuracy, completeness, or reliability of the information provided. The school shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website.",
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <Calendar className="w-5 h-5" />,
      content:
        "We reserve the right to modify these Terms of Service at any time without prior notice. Changes will be effective immediately upon posting on this page. Your continued use of the website after any modifications constitutes acceptance of the updated terms. We recommend reviewing these terms periodically.",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <JsonLd id="breadcrumb-terms" data={breadcrumb} />
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-8 shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Please read these terms carefully before using our website and services. These terms govern your use of
              the Southville 8B National High School website and digital platforms.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 px-4 py-2 text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Legal Document
              </Badge>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="mb-12 border-0 shadow-sm bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Table of Contents</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center p-4 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{index + 1}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {section.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card
                key={section.id}
                id={section.id}
                className="border-0 shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-10">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {section.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{index + 1}</span>
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                      </div>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-16 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Questions About These Terms?</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions or concerns regarding these Terms of Service, please don't hesitate to contact
                our school administration team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="font-medium">info@southville8bnhs.edu.ph</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <FileText className="w-5 h-5 mr-3" />
                  <span className="font-medium">School Administration Office</span>
                </div>
              </div>
              <Button className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3">
                <Mail className="w-4 h-4 mr-2" />
                Contact Administration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
