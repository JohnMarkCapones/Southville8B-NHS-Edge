import { Metadata } from "next";
import { Cookie, Shield, Eye, Target, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Cookie Policy | Southville 8B NHS",
  description: "Learn about how we collect, use, and protect your personal information and cookies.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-school-blue/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-school-blue" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Privacy & Cookie Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 border-school-blue/20">
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a href="#privacy" className="text-school-blue hover:underline text-sm">→ Privacy Policy</a>
              <a href="#cookies" className="text-school-blue hover:underline text-sm">→ Cookie Policy</a>
              <a href="#data-collection" className="text-school-blue hover:underline text-sm">→ Data Collection</a>
              <a href="#your-rights" className="text-school-blue hover:underline text-sm">→ Your Rights</a>
              <a href="#contact" className="text-school-blue hover:underline text-sm">→ Contact Us</a>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Section */}
        <section id="privacy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="w-6 h-6 mr-3 text-school-blue" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                How we handle your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2 mb-6">
                <li><strong>Account Information:</strong> Name, email, student ID, class/section, role</li>
                <li><strong>Educational Data:</strong> Grades, quiz scores, assignments, attendance</li>
                <li><strong>Activity Data:</strong> Login times, page visits, resource downloads</li>
                <li><strong>Communication Data:</strong> Messages, announcements, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2 mb-6">
                <li>Provide and maintain the school portal services</li>
                <li>Process authentication and manage user accounts</li>
                <li>Track academic progress and generate reports</li>
                <li>Communicate important school announcements and updates</li>
                <li>Improve our services and user experience</li>
                <li>Ensure security and prevent unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3. Data Security</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2 mb-6">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure authentication with JWT tokens</li>
                <li>HttpOnly cookies to prevent XSS attacks</li>
                <li>Regular security audits and updates</li>
                <li>Access controls based on user roles</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4. Data Sharing</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                We do not sell or share your personal information with third parties for marketing purposes.
                Your educational data is only accessible to authorized school personnel (teachers, administrators)
                and is used solely for educational purposes.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Cookie Policy Section */}
        <section id="cookies" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Cookie className="w-6 h-6 mr-3 text-school-blue" />
                Cookie Policy
              </CardTitle>
              <CardDescription>
                What cookies we use and why
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-700 dark:text-slate-300">
                We use cookies and similar tracking technologies to improve your experience on our website.
                Here's a breakdown of the cookies we use:
              </p>

              {/* Necessary Cookies */}
              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-red-500" />
                  Necessary Cookies (Required)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Essential for the website to function. Cannot be disabled.
                </p>
                <div className="text-sm space-y-1">
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">sb-access-token</code> - Authentication token</div>
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">sb-refresh-token</code> - Token refresh</div>
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">csrf-token</code> - Security protection</div>
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">user-role</code> - Role-based routing</div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-blue-500" />
                  Analytics Cookies (Optional)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Help us understand how visitors use our website.
                </p>
                <div className="text-sm space-y-1">
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">_ga</code> - Google Analytics (if enabled)</div>
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">_gid</code> - Google Analytics session</div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-950/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-amber-500" />
                  Marketing Cookies (Optional)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Used to deliver personalized content and advertisements.
                </p>
                <div className="text-sm">
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">_fbp</code> - Facebook Pixel (if enabled)</div>
                </div>
              </div>

              {/* Preference Cookies */}
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-green-500" />
                  Preference Cookies (Optional)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Remember your settings and preferences.
                </p>
                <div className="text-sm space-y-1">
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">theme</code> - Dark/light mode preference</div>
                  <div><code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">language</code> - Language selection</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Your Rights Section */}
        <section id="your-rights" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Rights</CardTitle>
              <CardDescription>
                You have control over your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="font-semibold mb-1">Access Your Data</h4>
                  <p className="text-sm">Request a copy of your personal data stored in our system.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Correct Your Data</h4>
                  <p className="text-sm">Update or correct inaccurate information in your profile.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Delete Your Data</h4>
                  <p className="text-sm">Request deletion of your account and associated data (subject to legal requirements).</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Manage Cookie Preferences</h4>
                  <p className="text-sm">Change your cookie settings at any time by clearing your browser cookies and revisiting the homepage.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <Card className="border-school-blue/20 bg-gradient-to-br from-school-blue/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Us</CardTitle>
              <CardDescription>
                Questions about our privacy practices?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions about this Privacy Policy or Cookie Policy, please contact:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Southville 8B National High School</strong></p>
                <p>Email: <a href="mailto:privacy@southville8b.edu.ph" className="text-school-blue hover:underline">privacy@southville8b.edu.ph</a></p>
                <p>Phone: [School Contact Number]</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/guess"
            className="inline-flex items-center text-school-blue hover:underline"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
