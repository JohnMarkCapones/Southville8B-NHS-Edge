"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatedButton } from "@/components/ui/animated-button"
import Link from "next/link"
import { BookOpen, Users, Trophy, GraduationCap, ChevronDown, Play, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY
        const parallaxSpeed = 0.3
        heroRef.current.style.transform = `translateY(${scrollY * parallaxSpeed}px)`
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isDarkMode = theme === "dark" || theme === "gaming"

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Background Image with Overlay */}
      <div ref={heroRef} className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?width=1920&height=1080&text=Modern+School+Campus+with+Students"
          alt="Southville 8B NHS Campus"
          fill
          className="object-cover opacity-30 dark:opacity-20"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-sky-600/20 dark:from-slate-900/40 dark:via-blue-900/30 dark:to-indigo-900/40" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* Floating Academic Icons */}
        <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
          <BookOpen className="w-16 h-16 text-blue-600 animate-float" style={{ animationDelay: "0s" }} />
        </div>
        <div className="absolute top-32 right-20 opacity-20 dark:opacity-10">
          <GraduationCap className="w-20 h-20 text-indigo-600 animate-float" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute bottom-40 left-20 opacity-20 dark:opacity-10">
          <Trophy className="w-14 h-14 text-sky-600 animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute bottom-60 right-10 opacity-20 dark:opacity-10">
          <Users className="w-18 h-18 text-blue-700 animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Geometric Shapes */}
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-sky-400/10 to-blue-400/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* School Badge */}
            <div className={cn("text-center mb-8", isVisible && "animate-fadeIn")}>
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 backdrop-blur-sm"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                Excellence in Education Since 2009
              </Badge>
            </div>

            {/* Main Headline */}
            <div
              className={cn("text-center mb-12", isVisible && "animate-slideInUp")}
              style={{ animationDelay: "0.2s" }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-slate-800 dark:text-white">Welcome to</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Southville 8B
                </span>
                <br />
                <span className="text-slate-700 dark:text-slate-200">National High School</span>
              </h1>

              {/* Inspiring Tagline */}
              <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 font-light leading-relaxed max-w-4xl mx-auto">
                <span className="font-semibold text-blue-700 dark:text-blue-400">Empowering minds</span>,
                <span className="font-semibold text-indigo-700 dark:text-indigo-400"> inspiring futures</span>, and
                <span className="font-semibold text-sky-700 dark:text-sky-400"> building tomorrow's leaders</span>
                through excellence in education and character development.
              </p>
            </div>

            {/* Key Highlights */}
            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto",
                isVisible && "animate-slideInUp",
              )}
              style={{ animationDelay: "0.4s" }}
            >
              {[
                {
                  icon: BookOpen,
                  title: "Academic Excellence",
                  desc: "Comprehensive curriculum with 25+ AP courses",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Users,
                  title: "Vibrant Community",
                  desc: "1,200+ students, 85+ dedicated faculty",
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  icon: Trophy,
                  title: "Proven Success",
                  desc: "98% college acceptance rate",
                  color: "from-sky-500 to-sky-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div
              className={cn(
                "flex flex-col sm:flex-row gap-4 justify-center items-center mb-16",
                isVisible && "animate-slideInUp",
              )}
              style={{ animationDelay: "0.6s" }}
            >
              <Link href="/guess/academics" className="w-full sm:w-auto">
                <AnimatedButton
                  size="xl"
                  className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Explore Academics
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </Link>

              <Link href="/guess/virtual-tour" className="w-full sm:w-auto">
                <AnimatedButton
                  variant="outline"
                  size="xl"
                  className="group w-full sm:w-auto border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Virtual Campus Tour
                </AnimatedButton>
              </Link>
            </div>

            {/* Statistics */}
            <div
              className={cn(
                "grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto",
                isVisible && "animate-slideInUp",
              )}
              style={{ animationDelay: "0.8s" }}
            >
              {[
                { number: "1,200+", label: "Students", icon: Users },
                { number: "85+", label: "Faculty", icon: GraduationCap },
                { number: "25+", label: "AP Courses", icon: BookOpen },
                { number: "15+", label: "Years Excellence", icon: Trophy },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="mb-3">
                    <stat.icon className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
        <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
          <span className="text-sm font-medium mb-2">Discover More</span>
          <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-500 rounded-full flex justify-center">
            <ChevronDown className="w-4 h-4 mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
