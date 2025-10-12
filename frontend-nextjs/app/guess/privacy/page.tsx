import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo"
import { Shield, Eye, Cookie, Database, UserCheck, Mail, Calendar, Lock, ChevronRight, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy | Southville 8B NHS",
  description: "Learn how Southville 8B National High School collects, uses, and protects your personal information.",
  alternates: { canonical: "/guess/privacy" },
  openGraph: {
    title: "Privacy Policy | Southville 8B NHS",
    description:
      "Learn how Southville 8B National High School collects, uses, and protects your personal information.",
    url: "/guess/privacy",
    type: "article",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Southville 8B NHS",
    description:
      "Learn how Southville 8B National High School collects, uses, and protects your personal information.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 15, 2024"
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL + "/" },
    { name: "Privacy Policy", url: SITE_URL + "/guess/privacy" },
  ])

  const sections = [
    {
      id: "information-collect",
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content:
        "We may collect personal information that you voluntarily provide to us, including your name, email address, phone number, and other contact details through contact forms, admissions inquiries, newsletter subscriptions, or event registrations. We also collect non-personal information such as browser type, IP address, and website usage patterns to improve our services.",
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      content:
        "Your information is used to respond to your inquiries, process admissions applications, send school updates and newsletters, improve our website and services, comply with legal obligations, and communicate important announcements to our school community. We never sell or rent your personal information to third parties.",
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: <Cookie className="w-5 h-5" />,
      content:
        "We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and remember your preferences. These technologies help us understand how visitors interact with our website and improve its functionality. You can control cookie settings through your browser preferences, though some features may not work properly if cookies are disabled.",
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      content:
        "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes secure data transmission, encrypted storage, regular security assessments, and restricted access to personal information on a need-to-know basis.",
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <Calendar className="w-5 h-5" />,
      content:
        "We retain personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it in accordance with our data retention policies.",
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: <UserCheck className="w-5 h-5" />,
      content:
        "You have the right to access, correct, update, or delete your personal information. You may also opt-out of receiving promotional communications from us at any time. To exercise these rights or if you have concerns about how your information is handled, please contact our school administration using the information provided below.",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <JsonLd id="breadcrumb-privacy" data={breadcrumb} />
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl mb-8 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal
              information when you visit our website or use our digital services.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2 text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Protected
              </Badge>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="mb-12 border-0 shadow-sm bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-emerald-600 mr-3" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Table of Contents</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center p-4 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{index + 1}</span>
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

          {/* Privacy Sections */}
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
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {section.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-4">
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{index + 1}</span>
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
          <Card className="mt-16 border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <CardContent className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl mb-6 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Privacy Questions or Concerns?</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions about this Privacy Policy or how we handle your personal information, please
                contact our data protection team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="font-medium">info@southville8bnhs.edu.ph</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Shield className="w-5 h-5 mr-3" />
                  <span className="font-medium">Data Protection Officer</span>
                </div>
              </div>
              <Button className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-3">
                <Mail className="w-4 h-4 mr-2" />
                Contact Privacy Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
