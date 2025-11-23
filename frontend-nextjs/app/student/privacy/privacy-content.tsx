"use client"

import { JsonLd, buildBreadcrumbListSchema } from "@/components/seo/jsonld"
import { SITE_URL } from "@/lib/seo"
import {
  Shield, Eye, Cookie, Database, UserCheck, Mail, Calendar, Lock,
  ChevronRight, BookOpen, FileText, Scale, Globe, Bell, AlertTriangle,
  CheckCircle2, Users, Building2, Server, Key, FileCheck
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PrivacyContent() {
  const lastUpdated = "December 15, 2024"
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL + "/" },
    { name: "Student Portal", url: SITE_URL + "/student" },
    { name: "Privacy Policy", url: SITE_URL + "/student/privacy" },
  ])

  const sections = [
    {
      id: "scope",
      title: "Scope and Organizational Responsibility",
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            This policy applies to all digital touchpoints operated by the institution, including the school website,
            mobile interfaces, online forms, admissions portal, events registration modules, and any electronic systems
            used to disseminate information or interact with the school community.
          </p>
          <p>
            The institution functions as the <strong>Personal Information Controller (PIC)</strong> under the Philippine
            Data Privacy Act of 2012 (RA 10173) and is responsible for establishing comprehensive safeguards to ensure
            lawful, fair, transparent, and secure processing of personal data.
          </p>
        </>
      ),
    },
    {
      id: "legal-basis",
      title: "Legal Basis for Processing",
      icon: <Scale className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">We process personal information pursuant to the following lawful conditions under RA 10173:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Consent</strong> – when you voluntarily provide information such as during inquiries, registrations, admissions submissions, or online communication.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Contractual Necessity</strong> – when processing is required to fulfill academic, administrative, or service-related obligations.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Legal Obligations</strong> – when compliance with government regulations, record-keeping requirements, reporting mandates, or lawful orders is necessary.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Legitimate Interests</strong> – when processing supports institutional operations such as security, analytics, service optimization, and operational continuity, provided such interests do not override your rights.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Vital Interests</strong> – when processing is required to protect life, safety, or welfare, especially in emergency scenarios involving students or school personnel.
              </div>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "information-collect",
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content: (
        <>
          <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">3.1 Personal Information</h4>
          <p className="mb-4">We may collect information you voluntarily submit, including but not limited to:</p>
          <ul className="grid md:grid-cols-2 gap-2 mb-6">
            {['Full name', 'Email address', 'Phone number', 'Address', 'Student or applicant details',
              'Parent/guardian information', 'Uploaded documents', 'Event or program registration data'].map((item) => (
              <li key={item} className="flex items-center text-slate-700 dark:text-slate-300">
                <ChevronRight className="w-4 h-4 text-emerald-600 mr-2" />
                {item}
              </li>
            ))}
          </ul>

          <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">3.2 Automatically Collected Information</h4>
          <p className="mb-4">Our systems may automatically capture:</p>
          <ul className="grid md:grid-cols-2 gap-2 mb-6">
            {['Browser type and version', 'IP address', 'Device identifiers', 'Access timestamps',
              'Website usage analytics', 'User interaction patterns', 'Referrer information'].map((item) => (
              <li key={item} className="flex items-center text-slate-700 dark:text-slate-300">
                <ChevronRight className="w-4 h-4 text-emerald-600 mr-2" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-400">This data supports service optimization, security monitoring, and experience enhancement.</p>

          <h4 className="text-lg font-semibold mb-3 mt-6 text-slate-900 dark:text-white">3.3 Information Concerning Minors</h4>
          <p>
            As an educational institution, we collect student information primarily for academic, administrative, and operational functions.
            In accordance with RA 10173, data of minors is processed with heightened safeguards, parental or guardian authorization is secured
            where required, and only data strictly necessary for academic or administrative purposes is collected.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">Your data is processed to support the following operational requirements:</p>
          <ul className="space-y-2">
            {[
              'Responding to inquiries and communication requests',
              'Managing admissions and enrollment workflows',
              'Sending academic updates, newsletters, announcements, and advisories',
              'Supporting student services, school operations, and event administration',
              'Conducting analytics to enhance website performance and user experience',
              'Complying with regulatory, accreditation, and statutory obligations',
              'Maintaining information security and preventing unauthorized access',
              'Managing emergency notifications and operational contingencies'
            ].map((item) => (
              <li key={item} className="flex items-start text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Alert className="mt-6 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
            <Shield className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900 dark:text-emerald-100">
              <strong>We do not sell, rent, or commercially distribute personal information.</strong>
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Sharing & Authorized Data Processors",
      icon: <Users className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            We may engage accredited service providers to support system hosting, data storage, analytics, communication,
            content delivery, or infrastructure operations. These may include but are not limited to:
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {['Cloud hosting providers', 'Email and messaging platforms', 'Analytics tools',
              'Content delivery networks (CDNs)', 'Systems integrators', 'IT service contractors'].map((item) => (
              <div key={item} className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Server className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="mb-4">
            All third-party processors are contractually bound to comply with RA 10173, maintain confidentiality,
            implement robust security measures, and process data solely for authorized purposes.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Data may also be disclosed when mandated by law, court order, regulatory authority, or to protect life and safety.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: <Cookie className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">We utilize cookies and related technologies to optimize browsing performance. These may include:</p>
          <div className="space-y-3 mb-4">
            {[
              { name: 'Essential Cookies', desc: 'Required for site functionality' },
              { name: 'Analytics Cookies', desc: 'Performance measurement tools' },
              { name: 'Preference Cookies', desc: 'Store settings for a customized experience' },
              { name: 'Security Cookies', desc: 'Support risk mitigation and fraud detection' }
            ].map((cookie) => (
              <div key={cookie.name} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h5 className="font-semibold text-slate-900 dark:text-white mb-1">{cookie.name}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">{cookie.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Users may manage cookie preferences via browser settings, noting that disabling certain categories may affect system functionality.
          </p>
        </>
      ),
    },
    {
      id: "data-security",
      title: "Data Security Framework",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            We deploy a multilayer security architecture aligned with RA 10173, NPC Circulars, and global best practices
            (ISO/IEC 27001 & 27701). This includes:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Encrypted data transmission (TLS/HTTPS)',
              'Encryption-at-rest for sensitive records',
              'Access controls with role-based administration',
              'Secure infrastructure hosting',
              'Regular system vulnerability assessments',
              'Continuous monitoring for unauthorized activities',
              'Incident handling and escalation protocols',
              'Strictly limited access based on operational necessity'
            ].map((item) => (
              <div key={item} className="flex items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Key className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "data-retention",
      title: "Data Retention & Secure Disposal",
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            We retain personal information only for the duration necessary to fulfill the purposes outlined in this policy,
            comply with legal or regulatory requirements, manage institutional records, or resolve disputes.
          </p>
          <p className="mb-4">Upon expiration of the retention period, data is:</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <h5 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Securely Deleted</h5>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Complete removal from all systems</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <h5 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Irreversibly Anonymized</h5>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Stripped of personal identifiers</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            This is implemented in accordance with the institution's Data Retention and Disposal Schedule.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "Data Subject Rights Under RA 10173",
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">You retain the following rights regarding your personal information:</p>
          <div className="grid gap-4">
            {[
              { title: 'Right to Be Informed', desc: 'Know how your data is collected, used, and shared' },
              { title: 'Right to Access', desc: 'Request copies of your personal information we hold' },
              { title: 'Right to Object', desc: 'Object to processing of your data for certain purposes' },
              { title: 'Right to Erasure or Blocking', desc: 'Request deletion or blocking of your data' },
              { title: 'Right to Rectification', desc: 'Correct inaccurate or incomplete information' },
              { title: 'Right to Data Portability', desc: 'Receive your data in a portable format' },
              { title: 'Right to Damages', desc: 'Claim compensation for violations of your privacy rights' },
              { title: 'Right to File a Complaint', desc: 'Lodge complaints with the National Privacy Commission' }
            ].map((right) => (
              <div key={right.title} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start">
                  <FileCheck className="w-5 h-5 text-emerald-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white mb-1">{right.title}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{right.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Alert className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              To exercise these rights, you may submit a formal request through the school's designated privacy channels.
              Proper identity verification may be required to prevent unauthorized disclosures.
            </AlertDescription>
          </Alert>
        </>
      ),
    },
    {
      id: "data-breach",
      title: "Data Breach and Incident Response Protocol",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            In line with RA 10173 and NPC Circular 16-03, we maintain a documented breach response mechanism that includes:
          </p>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Immediate Internal Containment', desc: 'Quick response to isolate affected systems' },
              { step: '2', title: 'Risk Assessment and Severity Classification', desc: 'Evaluate impact and severity level' },
              { step: '3', title: 'Remediation and Recovery Procedures', desc: 'Restore systems and prevent recurrence' },
              { step: '4', title: 'Notification to Affected Individuals', desc: 'Inform those impacted when legally mandated' },
              { step: '5', title: 'Report to National Privacy Commission', desc: 'File reports for breaches meeting notifiability criteria' }
            ].map((item) => (
              <div key={item.step} className="flex items-start p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {item.step}
                </div>
                <div>
                  <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">{item.title}</h5>
                  <p className="text-sm text-orange-700 dark:text-orange-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <Globe className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            If data is processed or stored outside the Philippines (e.g., cloud infrastructure), such transfers are executed under:
          </p>
          <div className="space-y-3">
            {[
              'Valid contractual clauses',
              'Adequate safeguards ensuring equal or stronger protection',
              'Compliance with RA 10173 and NPC requirements'
            ].map((item) => (
              <div key={item} className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Globe className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-blue-900 dark:text-blue-100">{item}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "policy-amendments",
      title: "Policy Amendments and Version Control",
      icon: <Bell className="w-5 h-5" />,
      content: (
        <>
          <p className="mb-4">
            We may update this Privacy Policy to reflect changes in legal requirements, technological enhancements, or
            institutional processes. Updates will be posted with a revised "Last Updated" date, and significant changes
            may be communicated through official channels.
          </p>
          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <Bell className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900 dark:text-purple-100">
              We recommend reviewing this Privacy Policy periodically to stay informed about how we protect your information.
            </AlertDescription>
          </Alert>
        </>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <JsonLd id="breadcrumb-privacy" data={breadcrumb} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed mb-6">
              This Privacy Policy outlines the governance framework, operational protocols, and data protection commitments
              of our institution with respect to personal information.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last Updated: {lastUpdated}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Scale className="w-4 h-4 mr-2" />
                RA 10173 Compliant
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm">
                <Shield className="w-4 h-4 mr-2" />
                ISO 27001 Aligned
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Introduction Alert */}
          <Alert className="mb-12 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
            <Shield className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-900 dark:text-emerald-100 text-base">
              By accessing our services, you acknowledge that you understand and agree to the practices described herein.
              We function as the <strong>Personal Information Controller (PIC)</strong> under the Philippine Data Privacy Act
              of 2012 (RA 10173).
            </AlertDescription>
          </Alert>

          {/* Table of Contents */}
          <Card className="mb-12 border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-emerald-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Table of Contents</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{index + 1}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-emerald-900 dark:group-hover:text-emerald-100 transition-colors font-medium">
                      {section.title}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
                className="border-0 shadow-md bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 scroll-mt-24"
              >
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {section.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{index + 1}</span>
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
          <Card className="mt-16 border-0 shadow-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
            <CardContent className="p-10 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Privacy Questions or Concerns?</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions about this Privacy Policy or how we handle your personal information, please
                contact our Data Protection Officer.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Mail className="w-8 h-8 text-emerald-600 mb-3" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email Address</span>
                  <span className="font-semibold text-slate-900 dark:text-white">info@southville8bnhs.edu.ph</span>
                </div>
                <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <Shield className="w-8 h-8 text-emerald-600 mb-3" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 mb-1">Contact</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Data Protection Officer</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Contact Privacy Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


