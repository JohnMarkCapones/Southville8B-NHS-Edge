"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AnimatedButton } from "@/components/ui/animated-button"
import {
  Heart,
  Shield,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Users,
  Award,
  TrendingUp,
  Zap,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Rss,
  Download,
  Upload,
  HelpCircle,
  MessageCircle,
  Star,
  Target,
  Lightbulb,
  Bookmark,
  GraduationCap,
  Calendar,
  FileText,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function TeacherFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50 mt-auto">
      <div className="px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Southville 8B NHS</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Teacher Portal</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Empowering educators with innovative digital tools for exceptional learning experiences and student
              success.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>123 Education Ave, Learning City</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>teachers@southville8b.edu</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Quick Access
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  href: "/teacher/dashboard",
                  label: "Dashboard",
                  icon: TrendingUp,
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  href: "/teacher/students",
                  label: "Student Management",
                  icon: Users,
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  href: "/teacher/quiz",
                  label: "Quiz Central",
                  icon: Target,
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  href: "/teacher/schedule",
                  label: "Schedule",
                  icon: Calendar,
                  color: "text-orange-600 dark:text-orange-400",
                },
                {
                  href: "/teacher/analytics",
                  label: "Analytics",
                  icon: Award,
                  color: "text-indigo-600 dark:text-indigo-400",
                },
                {
                  href: "/teacher/resources",
                  label: "Resources",
                  icon: Bookmark,
                  color: "text-pink-600 dark:text-pink-400",
                },
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:translate-x-1 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <link.icon
                    className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium">
                    {link.label}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              Support Hub
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  href: "/teacher/help",
                  label: "Help Center",
                  icon: HelpCircle,
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  href: "/teacher/tutorials",
                  label: "Video Tutorials",
                  icon: Youtube,
                  color: "text-red-600 dark:text-red-400",
                },
                {
                  href: "/teacher/documentation",
                  label: "Documentation",
                  icon: FileText,
                  color: "text-slate-600 dark:text-slate-400",
                },
                {
                  href: "/teacher/community",
                  label: "Teacher Community",
                  icon: MessageCircle,
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  href: "/teacher/feedback",
                  label: "Send Feedback",
                  icon: Star,
                  color: "text-yellow-600 dark:text-yellow-400",
                },
                {
                  href: "/teacher/updates",
                  label: "What's New",
                  icon: Rss,
                  color: "text-purple-600 dark:text-purple-400",
                },
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:translate-x-1 group border border-transparent hover:border-green-200 dark:hover:border-green-800"
                >
                  <link.icon
                    className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 font-medium">
                    {link.label}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              Tools & Actions
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-950/50 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-105 transition-all duration-300 text-blue-700 dark:text-blue-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-950/50 hover:border-green-300 dark:hover:border-green-700 hover:scale-105 transition-all duration-300 text-green-700 dark:text-green-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Resources
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-950/50 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-105 transition-all duration-300 text-purple-700 dark:text-purple-300"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Online Resources
                </AnimatedButton>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-500" />
                  Connect With Us
                </h4>
                <div className="flex space-x-2">
                  {[
                    {
                      icon: Facebook,
                      color: "hover:bg-blue-600 hover:text-white",
                      bg: "bg-blue-100 dark:bg-blue-900/50",
                    },
                    { icon: Twitter, color: "hover:bg-sky-500 hover:text-white", bg: "bg-sky-100 dark:bg-sky-900/50" },
                    {
                      icon: Instagram,
                      color: "hover:bg-pink-500 hover:text-white",
                      bg: "bg-pink-100 dark:bg-pink-900/50",
                    },
                    { icon: Youtube, color: "hover:bg-red-600 hover:text-white", bg: "bg-red-100 dark:bg-red-900/50" },
                  ].map((social, index) => (
                    <AnimatedButton
                      key={index}
                      variant="ghost"
                      size="icon"
                      className={`w-10 h-10 ${social.bg} ${social.color} hover:scale-110 transition-all duration-300 border border-transparent hover:border-current`}
                    >
                      <social.icon className="w-5 h-5" />
                    </AnimatedButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent" />

        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              &copy; {currentYear} Southville 8B NHS Teacher Portal. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/accessibility", label: "Accessibility" },
                { href: "/cookies", label: "Cookie Policy" },
              ].map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 hover:underline font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs px-4 py-2 hover:scale-105 transition-transform duration-300 font-semibold"
            >
              <Shield className="w-3 h-3 mr-2" />
              Secure Portal
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs px-4 py-2 hover:scale-105 transition-transform duration-300 font-semibold"
            >
              <Heart className="w-3 h-3 mr-2 animate-pulse" />
              For Educators
            </Badge>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 text-xs px-4 py-2 hover:scale-105 transition-transform duration-300 font-semibold"
            >
              <Star className="w-3 h-3 mr-2" />
              v2.1.0
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}
