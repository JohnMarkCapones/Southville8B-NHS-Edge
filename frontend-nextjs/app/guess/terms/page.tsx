export const dynamic = "force-static"
export const revalidate = 86400 // Revalidate once per day
import type { Metadata } from "next"
import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo"
import {
  Scale, FileText, Shield, AlertTriangle, Globe, Ban, Link2, 
  ChevronRight, BookOpen, Mail, Calendar, CheckCircle2, 
  Building2, Users, Bell, AlertCircle, Gavel, RefreshCw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Terms of Service | Southville 8B NHS",
  description: "Read the Terms of Service establishing the binding conditions governing access to and use of the Southville 8B National High School website, digital platforms, and online services.",
  alternates: { canonical: "/guess/terms" },
  openGraph: {
    title: "Terms of Service | Southville 8B NHS",
    description:
      "Read the Terms of Service establishing the binding conditions governing access to and use of the Southville 8B National High School website and digital platforms.",
    url: "/guess/terms",
    type: "article",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Southville 8B NHS",
    description:
      "Read the Terms of Service establishing the binding conditions governing access to and use of the Southville 8B National High School website and digital platforms.",
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
      content: (
        <>
          <p className="mb-4">
            By using the School's website and digital services, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, together with all applicable laws, regulations, policies, and guidelines issued by the School and relevant Philippine authorities.
          </p>
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 dark:text-orange-100">
              <strong>If you do not agree with any provision, you must immediately discontinue your use of the platform.</strong>
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "authorized-use",
      title: "Authorized Use of Content",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            All intellectual property—including text, graphics, logos, images, videos, documents, and other digital assets—is owned by or licensed to the School and is protected under:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>The Philippine Intellectual Property Code (RA 8293)</strong>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Copyright laws, including applicable international conventions</strong>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>School policies and administrative guidelines</strong>
              </div>
            </li>
          </ul>
          <p className="mb-4">You may access content solely for personal, informational, and educational purposes. The following activities are strictly prohibited without written authorization:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Reproduction or distribution of any content',
              'Creation of derivative works',
              'Commercial use of school-branded materials',
              'Copying, scraping, or automated extraction of website data',
              "Misrepresentation of the School's identity, programs, or communications"
            ].map((item) => (
              <div key={item} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Ban className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "user-conduct",
      title: "User Conduct and Acceptable Use",
      icon: <Scale className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            Users must adhere to responsible digital behavior consistent with school values and Philippine law. You agree not to engage in any of the following:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Uploading, transmitting, or distributing unlawful, defamatory, threatening, obscene, or harmful content',
              'Attempting to access restricted systems, accounts, or administrative tools without authorization',
              'Deploying malware, harmful scripts, automated bots, or denial-of-service attacks',
              'Manipulating website functionality, bypassing security controls, or exploiting vulnerabilities',
              'Misusing school resources for fraudulent, deceptive, or malicious purposes',
              'Posting false information, impersonating others, or attempting to disrupt normal operations'
            ].map((item) => (
              <div key={item} className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-red-900 dark:text-red-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Alert className="mt-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 dark:text-red-100">
              <strong>The School reserves the right to restrict or terminate access for violations of these provisions.</strong>
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Links and Integrated Services",
      icon: <Link2 className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            Our website may include links or integrations with third-party platforms (e.g., Google services, analytics providers, external educational resources). These links are provided for convenience and enhanced functionality.
          </p>
          <p className="mb-4">The School does not control nor assume responsibility for:</p>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {[
              'Content hosted on external websites',
              'Third-party privacy and data-handling practices',
              'Security, accuracy, or availability of external resources'
            ].map((item) => (
              <div key={item} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              Users are encouraged to review the respective policies of any third-party services they access.
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer of Warranties",
      icon: <AlertCircle className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            The School provides its digital platforms on an "as-is" and "as-available" basis. While we strive for accuracy, integrity, and continuity of service, we do not guarantee:
          </p>
          <div className="space-y-3 mb-6">
            {[
              'Uninterrupted website availability',
              'Error-free content or system functionality',
              'Real-time accuracy of posted information',
              'Compatibility with user devices, browsers, or networks'
            ].map((item) => (
              <div key={item} className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-yellow-900 dark:text-yellow-100">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>All use is undertaken at the user's own risk.</strong>
          </p>
        </>
      ),
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            To the maximum extent permitted under Philippine law, the School shall not be liable for:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {[
              'Losses arising from system downtime, service interruption, or technical failures',
              'Damages resulting from inaccurate content, omissions, typographical errors, or outdated information',
              'Indirect, incidental, punitive, or consequential damages',
              'Unauthorized access or misuse caused by user negligence',
              'Loss or corruption of data arising from use of the platform'
            ].map((item) => (
              <div key={item} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-slate-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Alert className="border-slate-200 bg-slate-50 dark:bg-slate-800">
            <Shield className="h-4 w-4 text-slate-600" />
            <AlertDescription className="text-slate-700 dark:text-slate-300">
              This limitation applies even if the School has been advised of potential damages.
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: <Gavel className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            By using our services, you agree to indemnify and hold harmless Southville 8B National High School from any claims, liabilities, damages, costs, or expenses arising from:
          </p>
          <div className="space-y-3">
            {[
              'Your misuse of the platform',
              'Violation of these Terms of Service',
              'Breach of applicable laws or third-party rights',
              'Unauthorized activities conducted through your device or account'
            ].map((item) => (
              <div key={item} className="flex items-start p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Gavel className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-orange-900 dark:text-orange-100">{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law and Jurisdiction",
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            These Terms shall be governed by and interpreted in accordance with the laws of the Republic of the Philippines, including:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {[
              { law: 'RA 10173', desc: 'Data Privacy Act of 2012' },
              { law: 'RA 8293', desc: 'Intellectual Property Code' },
              { law: 'DepEd Orders', desc: 'Relevant DepEd orders, guidelines, and policies' }
            ].map((item) => (
              <div key={item.law} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-emerald-600 mr-2" />
                  <h5 className="font-semibold text-emerald-900 dark:text-emerald-100">{item.law}</h5>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{item.desc}</p>
              </div>
            ))}
          </div>
          <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
            <Gavel className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900 dark:text-emerald-100">
              <strong>Any disputes shall be resolved exclusively in the appropriate courts located in the Philippines.</strong>
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      icon: <RefreshCw className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            The School reserves the right to update, revise, or amend these Terms of Service at any time to reflect:
          </p>
          <div className="space-y-3 mb-6">
            {[
              'Changes in legal or regulatory requirements',
              'Updates to school policies or administrative directives',
              'Improvements to system architecture or service offerings'
            ].map((item) => (
              <div key={item} className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <RefreshCw className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-blue-900 dark:text-blue-100">{item}</span>
              </div>
            ))}
          </div>
          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <Bell className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              <strong>Revised terms become effective immediately upon posting. Continued use constitutes acceptance of the updated terms.</strong>
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact for Inquiries",
      icon: <Mail className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-6">
            For questions or concerns related to these Terms of Service, you may reach out through official school communication channels:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center mb-3">
                <Mail className="w-6 h-6 text-emerald-600 mr-3" />
                <h5 className="font-semibold text-emerald-900 dark:text-emerald-100">Email</h5>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300">info@southville8bnhs.edu.ph</p>
            </div>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center mb-3">
                <Building2 className="w-6 h-6 text-emerald-600 mr-3" />
                <h5 className="font-semibold text-emerald-900 dark:text-emerald-100">Office</h5>
              </div>
              <p className="text-emerald-700 dark:text-emerald-300">School Administration Office</p>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <JsonLd id="breadcrumb-terms" data={breadcrumb} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed mb-6">
              These Terms of Service establish the binding conditions governing access to and use of the Southville 8B National High School website, digital platforms, online services, and related electronic systems.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Scale className="w-4 h-4 mr-2" />
                Legal Document
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <FileText className="w-4 h-4 mr-2" />
                Binding Agreement
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Introduction Alert */}
          <Alert className="mb-12 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Scale className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100 text-base">
              By accessing any of our digital channels, you agree to operate within the legal, ethical, and operational framework outlined herein.
            </AlertDescription>
          </Alert>

          {/* Table of Contents */}
          <Card className="mb-12 border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Table of Contents</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{index + 1}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors font-medium">
                      {section.title}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
                className="border-0 shadow-md bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 scroll-mt-24"
              >
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {section.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{index + 1}</span>
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                      </div>
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-16 border-0 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <CardContent className="p-10 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Questions About These Terms?</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions or concerns related to these Terms of Service, please contact our school administration team.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Mail className="w-8 h-8 text-blue-600 mb-3" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email Address</span>
                  <span className="font-semibold text-slate-900 dark:text-white">info@southville8bnhs.edu.ph</span>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Building2 className="w-8 h-8 text-blue-600 mb-3" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">Contact</span>
                  <span className="font-semibold text-slate-900 dark:text-white">School Administration Office</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Contact Administration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
