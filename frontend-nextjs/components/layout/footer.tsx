"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  Calendar,
  Heart,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
  Smartphone,
  Apple,
  Play,
} from "lucide-react"

export function Footer() {
  // Use hardcoded year or calculate client-side to avoid hydration mismatch
  const currentYear = typeof window !== 'undefined' ? new Date().getFullYear() : 2025

  const [accordionState, setAccordionState] = useState({
    quickLinks: false,
    resources: false,
    achievements: false,
  })

  const toggleAccordion = (section: keyof typeof accordionState) => {
    setAccordionState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const quickLinks = [
    { title: "About Us", href: "/guess/about" },
    { title: "Academics", href: "/guess/academics" },
    { title: "Admissions", href: "/guess/admissions" },
    { title: "Student Life", href: "/guess/student-life" },
    { title: "Athletics", href: "/guess/athletics" },
    { title: "News & Events", href: "/guess/news-events" },
  ]

  const resources = [
    { title: "Student Portal", href: "/guess/login" },
    { title: "Parent Portal", href: "/guess/parent-portal" },
    { title: "Staff Directory", href: "/guess/staff" },
    { title: "School Calendar", href: "/guess/calendar" },
    { title: "Library", href: "/teacher/resources" }, // Updated Library link
    { title: "Career Services", href: "/guess/careers" },
  ]

  const achievements = [
    { icon: <Award className="w-4 h-4" />, text: "Municipal Champions 2024" },
    { icon: <Star className="w-4 h-4" />, text: "A+ School Rating" },
    { icon: <Trophy className="w-4 h-4" />, text: "Academic Excellence" },
    { icon: <Heart className="w-4 h-4" />, text: "98% Student Satisfaction" },
  ]

  return (
    <footer role="contentinfo" className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="container mx-auto px-4 xs:px-6 sm:px-8 py-6 xs:py-8 relative z-10 border-b border-white/10">
        <div className="bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-green-600/20 rounded-2xl p-4 xs:p-6 sm:p-8 backdrop-blur-sm border border-white/20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Get the{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Southville 8B NHS Edge
                  </span>{" "}
                  App
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Access grades, notifications, and school updates anywhere, anytime!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link 
                href="/guess/mobile-app" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold group transition-all duration-300 hover:scale-105"
                aria-label="Download from App Store"
              >
                <Apple className="w-5 h-5 mr-2" />
                App Store
              </Link>

              <Link 
                href="/guess/mobile-app" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold group transition-all duration-300 hover:scale-105"
                aria-label="Download from Google Play"
              >
                <Play className="w-5 h-5 mr-2" />
                Google Play
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 xs:px-6 sm:px-8 py-8 xs:py-10 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
          <div className="space-y-3 xs:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-school-gold to-vibrant-orange rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                <GraduationCap className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div>
                <h3 className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Southville 8B NHS
                </h3>
                <p className="text-xs xs:text-sm text-gray-300">Excellence in Education</p>
              </div>
            </div>

            <p className="text-sm xs:text-base sm:text-lg text-gray-300 leading-relaxed">
              Empowering students to achieve their dreams through quality education, innovative programs, and a
              supportive community that fosters growth and success.
            </p>

            <div className="space-y-2 xs:space-y-3">
              {[
                { icon: MapPin, text: "Rodriguez, Rizal, Philippines" },
                { icon: Phone, text: "(+63) 123-456-7890" },
                { icon: Mail, text: "info@southville8bnhs.edu.ph" },
              ].map((contact, index) => (
                <div
                  key={index}
                  className="flex items-start xs:items-center space-x-3 text-xs xs:text-sm sm:text-base group hover:text-school-gold transition-all duration-300"
                >
                  <contact.icon className="w-4 h-4 xs:w-5 xs:h-5 text-school-gold flex-shrink-0 mt-0.5 xs:mt-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="leading-relaxed break-all xs:break-normal">{contact.text}</span>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 xs:space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
                { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
                { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
                { icon: Youtube, href: "#", label: "YouTube", color: "hover:bg-red-600" },
              ].map((social, index) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center ${social.color} hover:scale-110 transition-all duration-300 touch-manipulation shadow-lg hover:shadow-xl`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 sm:mt-0">
            <button
              onClick={() => toggleAccordion("quickLinks")}
              className="w-full flex items-center justify-between text-left md:cursor-default md:pointer-events-none group"
              aria-expanded={accordionState.quickLinks}
              aria-controls="quicklinks-content"
              aria-label="Toggle Quick Links section"
            >
              <h4 className="text-base xs:text-lg sm:text-xl font-semibold flex items-center">
                <BookOpen className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 mr-2 text-school-gold transition-transform duration-300 group-hover:scale-110" />
                Quick Links
              </h4>
              <div className="md:hidden">
                {accordionState.quickLinks ? (
                  <ChevronUp className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                )}
              </div>
            </button>

            <div
              id="quicklinks-content"
              className={`overflow-hidden transition-all duration-500 ease-in-out md:!block md:!opacity-100 md:!max-h-none mt-3 xs:mt-4 ${
                accordionState.quickLinks ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:opacity-100"
              }`}
            >
              <ul className="space-y-1 xs:space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-sm xs:text-base sm:text-lg text-gray-300 hover:text-school-gold transition-all duration-300 flex items-center group py-1 touch-manipulation hover:translate-x-2"
                    >
                      <span className="w-2 h-2 bg-school-gold rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 sm:mt-0">
            <button
              onClick={() => toggleAccordion("resources")}
              className="w-full flex items-center justify-between text-left md:cursor-default md:pointer-events-none group"
              aria-expanded={accordionState.resources}
              aria-controls="resources-content"
              aria-label="Toggle Resources section"
            >
              <h4 className="text-base xs:text-lg sm:text-xl font-semibold flex items-center">
                <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 mr-2 text-school-gold transition-transform duration-300 group-hover:scale-110" />
                Resources
              </h4>
              <div className="md:hidden">
                {accordionState.resources ? (
                  <ChevronUp className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                )}
              </div>
            </button>

            <div
              id="resources-content"
              className={`overflow-hidden transition-all duration-500 ease-in-out md:!block md:!opacity-100 md:!max-h-none mt-3 xs:mt-4 ${
                accordionState.resources ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:opacity-100"
              }`}
            >
              <ul className="space-y-1 xs:space-y-2">
                {resources.map((resource) => (
                  <li key={resource.title}>
                    <Link
                      href={resource.href}
                      className="text-sm xs:text-base sm:text-lg text-gray-300 hover:text-school-gold transition-all duration-300 flex items-center group py-1 touch-manipulation hover:translate-x-2"
                    >
                      <span className="w-2 h-2 bg-school-gold rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      {resource.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4 xs:space-y-5 mt-6 sm:mt-0 sm:col-span-2 md:col-span-2 lg:col-span-1">
            <div>
              <button
                onClick={() => toggleAccordion("achievements")}
                className="w-full flex items-center justify-between text-left md:cursor-default md:pointer-events-none group"
                aria-expanded={accordionState.achievements}
                aria-controls="achievements-content"
                aria-label="Toggle Our Achievements section"
              >
                <h4 className="text-base xs:text-lg sm:text-xl font-semibold flex items-center">
                  <Trophy className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 mr-2 text-school-gold transition-transform duration-300 group-hover:scale-110" />
                  Our Achievements
                </h4>
                <div className="md:hidden">
                  {accordionState.achievements ? (
                    <ChevronUp className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-school-gold transition-transform duration-300 hover:scale-110" />
                  )}
                </div>
              </button>

              <div
                id="achievements-content"
                className={`overflow-hidden transition-all duration-500 ease-in-out md:!block md:!opacity-100 md:!max-h-none mt-3 xs:mt-4 ${
                  accordionState.achievements ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:opacity-100"
                }`}
              >
                <div className="space-y-2 xs:space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-xs xs:text-sm sm:text-base group hover:text-school-gold transition-colors duration-300"
                    >
                      <div className="text-school-gold flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                        {achievement.icon}
                      </div>
                      <span className="text-gray-300 group-hover:text-school-gold transition-colors duration-300">
                        {achievement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 xs:p-4 sm:p-5 backdrop-blur-sm border border-white/20 hover:border-school-gold/50 transition-all duration-300 hover:shadow-xl">
              <h5 className="text-sm xs:text-base sm:text-lg font-semibold mb-2 flex items-center">
                <Mail className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-2 text-school-gold" />
                Stay Updated
              </h5>
              <p className="text-xs xs:text-sm sm:text-base text-gray-300 mb-2 xs:mb-3 leading-relaxed">
                Get the latest news and updates from our school community.
              </p>
              <div className="space-y-2 xs:space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 xs:py-3 sm:py-3.5 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-school-gold focus:border-transparent text-sm xs:text-base transition-all duration-300 hover:bg-white/25"
                />
                <AnimatedButton
                  variant="gradient"
                  size="sm"
                  className="w-full text-xs xs:text-sm sm:text-base py-2.5 xs:py-3 sm:py-3.5 bg-gradient-to-r from-school-gold to-vibrant-orange hover:from-vibrant-orange hover:to-school-gold transition-all duration-300 hover:scale-105"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className="w-3 h-3 xs:w-4 xs:h-4 mr-2" />
                  Subscribe
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 xs:px-6 sm:px-8 py-3 xs:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 xs:space-y-4 sm:space-y-0 gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 lg:space-x-8 text-center sm:text-left">
              <p className="text-xs xs:text-sm sm:text-base text-gray-300">
                &copy; {currentYear} Southville 8B National High School. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start space-x-3 xs:space-x-4 sm:space-x-6 text-xs xs:text-sm">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/accessibility", label: "Accessibility" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-school-gold transition-all duration-300 touch-manipulation py-1 hover:scale-105"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 xs:gap-3 sm:gap-4">
              <Badge
                variant="secondary"
                className="bg-school-gold/20 text-school-gold border-school-gold/30 text-xs xs:text-sm px-2 xs:px-3 py-1 hover:bg-school-gold/30 transition-all duration-300 hover:scale-105"
              >
                <Calendar className="w-2 h-2 xs:w-3 xs:h-3 mr-1" />
                Est. 2009
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-400 border-green-500/30 text-xs xs:text-sm px-2 xs:px-3 py-1 hover:bg-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <Heart className="w-2 h-2 xs:w-3 xs:h-3 mr-1" />
                Serving Community
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
