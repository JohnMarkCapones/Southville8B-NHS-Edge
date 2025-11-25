"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Heart,
  Shield,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  Users,
  BookOpen,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Globe,
  FileText,
} from "lucide-react"

export default function StudentFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto border-t border-slate-700/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="relative px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Student Resources */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-emerald-400 flex items-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Resources
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-emerald-400 transition-colors flex items-center group touch-manipulation min-h-[36px] justify-start"
                >
                  Academic Calendar
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-emerald-400 transition-colors flex items-center group touch-manipulation min-h-[36px] justify-start"
                  asChild
                >
                  <Link href="/teacher/resources">
                    Digital Library
                    <Badge
                      variant="secondary"
                      className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    >
                      New
                    </Badge>
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-emerald-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Study Materials
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-emerald-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Tutoring Services
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-emerald-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Career Guidance
                </Button>
              </li>
            </ul>
          </div>

          {/* Support & Help */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-orange-400 flex items-center">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Support
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  IT Helpdesk
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Academic Advisor
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                  asChild
                >
                  <Link href="/student/privacy">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                  asChild
                >
                  <Link href="/student/terms">
                    <FileText className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                >
                  Student Handbook
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-orange-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                >
                  Technical Support
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-cyan-400 flex items-center">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Contact Info
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-300">Southville 8B NHS</p>
                  <p className="text-slate-400 text-xs">Brgy San Isidro Rodriguez Rizal</p>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-300 break-all">(02) 8000-0000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-300 break-all text-xs sm:text-sm">info@southville8b.edu.ph</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-300 break-all text-xs sm:text-sm">www.southville8b.edu.ph</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-pink-400 flex items-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Community
            </h3>
            <ul className="space-y-1 sm:space-y-2 text-sm mb-3 sm:mb-4">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-pink-400 transition-colors flex items-center touch-manipulation min-h-[36px] justify-start"
                >
                  Student Council
                  <Badge variant="outline" className="ml-2 text-xs border-pink-400/30 text-pink-300">
                    Active
                  </Badge>
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-pink-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Club Directory
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-pink-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Upcoming Events
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-slate-300 hover:text-pink-400 transition-colors touch-manipulation min-h-[36px] justify-start"
                >
                  Peer Mentoring
                </Button>
              </li>
            </ul>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Follow Us</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-blue-500/20 hover:text-blue-400 transition-colors touch-manipulation"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-sky-500/20 hover:text-sky-400 transition-colors touch-manipulation"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-pink-500/20 hover:text-pink-400 transition-colors touch-manipulation"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-red-500/20 hover:text-red-400 transition-colors touch-manipulation"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-4 sm:pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 sm:space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="text-sm text-slate-200 font-bold block">
                  © {currentYear} Southville 8B NHS Student Portal
                </span>
                <p className="text-xs text-slate-400 mt-1">Empowering students through innovative technology ✨</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-2 bg-slate-800/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-700/50">
                <Clock className="w-3 h-3 text-green-400" />
                <span>System Status: </span>
                <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
                  ● Online
                </Badge>
              </div>
              <div className="hidden lg:flex items-center space-x-3 text-slate-500">
                <span className="font-medium">Version 2.1.0</span>
                <span>•</span>
                <span>Updated Today</span>
                <span>•</span>
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
