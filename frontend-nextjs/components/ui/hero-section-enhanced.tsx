"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Users,
  Trophy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  CalendarDays,
  Building2,
  GraduationCap,
  Library,
  Sparkles,
  Award,
  Star,
  CheckCircle,
  Zap,
  Heart,
  Shield,
  Globe,
  Video,
  Image as ImageIcon,
  Contrast,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function HeroSectionEnhanced() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videoBrightness, setVideoBrightness] = useState(100)
  const [videoBlur, setVideoBlur] = useState(2)
  const [showVideoControls, setShowVideoControls] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Typewriter effect
  const headlines = [
    "Aspire Higher, Lead with Excellence",
    "Where Dreams Meet Achievement",
    "Building Tomorrow's Leaders Today",
    "Excellence in Every Endeavor",
  ]
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)



  useEffect(() => {
    setMounted(true)
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!mounted) return

    const currentHeadline = headlines[currentHeadlineIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseAfterComplete = 2000
    const pauseAfterDelete = 500

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentHeadline.length) {
          setDisplayedText(currentHeadline.slice(0, displayedText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseAfterComplete)
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length)
          setTimeout(() => {}, pauseAfterDelete)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, currentHeadlineIndex, mounted, headlines])

  // Video controls
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    const el = sectionRef.current
    if (!v || !el) return

    let isVisible = true
    const onVisibility = () => {
      if (document.hidden) {
        v.pause()
        setIsPlaying(false)
      } else if (isVisible && v.paused) {
        v.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        isVisible = entry.isIntersecting
        if (!isVisible) {
          v.pause()
          setIsPlaying(false)
        } else if (document.visibilityState === "visible" && v.paused) {
          v.play().then(() => setIsPlaying(true)).catch(() => {})
        }
      },
      { threshold: 0.2 }
    )

    io.observe(el)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const onLoaded = async () => {
    try {
      await videoRef.current?.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const next = !isMuted
    v.muted = next
    setIsMuted(next)
    if (!next && v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }


  return (
    <section
      ref={sectionRef as any}
      aria-label="Southville 8B National High School hero"
      className={cn(
        "relative overflow-hidden",
        "min-h-[80vh] sm:min-h-[86vh] md:min-h-screen"
      )}
    >
      {/* Video background with enhanced controls */}
      <div
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{
          filter: `brightness(${videoBrightness}%) blur(${videoBlur}px)`,
        }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/placeholder.jpg"
          onLoadedMetadata={onLoaded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-hidden="true"
        >
          <source src="/videos/hero-blue-campus.mp4" type="video/mp4" />
          {"Your browser does not support the video tag."}
        </video>
      </div>

      {/* Theme-aware overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/20 backdrop-blur-[2px] dark:from-black/80 dark:via-black/60 dark:to-black/40" />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[radial-gradient(75%_60%_at_10%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(60%_55%_at_90%_20%,rgba(14,165,233,0.08),transparent)] dark:mix-blend-normal dark:bg-[radial-gradient(75%_60%_at_10%_10%,rgba(37,99,235,0.18),transparent),radial-gradient(60%_55%_at_90%_20%,rgba(14,165,233,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 hidden sm:block bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_60%,transparent_62%,rgba(0,0,0,0.06)_100%)] dark:bg-[radial-gradient(120%_90%_at_50%_60%,transparent_55%,rgba(0,0,0,0.30)_100%)]" />

      {/* Brand chip */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-16 sm:pt-20 md:pt-24">
          <div className="inline-flex items-center gap-3 rounded-full border bg-white text-slate-900 border-slate-200/70 shadow-lg px-2.5 pr-3 py-1.5 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700/60 backdrop-blur hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden ring-2 ring-blue-500 dark:ring-blue-400 bg-white animate-pulse-slow">
              <Image
                src="/logo-48.webp"
                alt="School logo"
                width={48}
                height={48}
                sizes="(max-width: 768px) 32px, 36px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <span className="inline-flex items-center gap-2 text-sm md:text-base font-semibold tracking-tight">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Southville 8B National High School
            </span>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-left duration-700 delay-200">
            {[
              { icon: Award, label: "A+ Rated", color: "from-yellow-500 to-orange-500" },
              { icon: CheckCircle, label: "DepEd Accredited", color: "from-green-500 to-emerald-500" },
              { icon: Trophy, label: "Award Winning", color: "from-blue-500 to-indigo-500" },
              { icon: Shield, label: "Safe Campus", color: "from-purple-500 to-pink-500" },
            ].map((badge, index) => (
              <div
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 lg:grid-cols-2">
            {/* Left: Headline, search, CTAs, stats */}
            <div className="space-y-6">
              {/* Animated Typewriter Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white min-h-[2.5em]">
                <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-300 dark:to-indigo-300 animate-gradient-x">
                  {displayedText}
                  <span className="animate-blink">|</span>
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-200 max-w-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                A future‑ready education in a caring community. Discover rigorous academics, vibrant student life, and a
                culture of excellence that empowers every learner.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
                <Link href="/guess/academics" className="inline-block w-full xs:w-auto group">
                  <Button className="w-full xs:w-auto h-12 sm:h-14 min-h-[44px] rounded-full px-6 sm:px-7 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Explore Academics
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/guess/virtual-tour" className="inline-block w-full xs:w-auto group">
                  <Button
                    variant="outline"
                    className="w-full xs:w-auto h-12 sm:h-14 min-h-[44px] rounded-full px-6 sm:px-7 font-semibold border-2 border-blue-300 text-blue-900 hover:bg-blue-50 dark:border-blue-200/80 dark:text-blue-200 dark:hover:bg-slate-800/70 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform" />
                    Virtual Tour
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Enhanced Quick Links */}
            <div className="lg:justify-self-end w-full animate-in fade-in slide-in-from-right duration-700 delay-500">
              <div className="rounded-2xl p-5 sm:p-6 md:p-7 w-full max-w-md ml-auto bg-white/90 border-2 border-white/60 shadow-xl backdrop-blur-lg dark:bg-slate-900/80 dark:border-slate-700/60 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-base sm:text-lg md:text-xl font-bold">
                      Quick Links
                    </h2>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] sm:text-xs shadow-lg animate-pulse-slow">
                    Start Here
                  </Badge>
                </div>

                {/* Enhanced grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Academics", href: "/guess/academics", icon: BookOpen, desc: "Courses", gradient: "from-blue-500 to-cyan-500" },
                    { title: "Student Life", href: "/guess/student-life", icon: Users, desc: "Clubs", gradient: "from-purple-500 to-pink-500" },
                    { title: "Athletics", href: "/guess/athletics", icon: Trophy, desc: "Sports", gradient: "from-yellow-500 to-orange-500" },
                    { title: "Admissions", href: "/guess/contact", icon: Building2, desc: "Apply", gradient: "from-green-500 to-emerald-500" },
                    { title: "Calendar", href: "/guess/news-events", icon: CalendarDays, desc: "Events", gradient: "from-indigo-500 to-purple-500" },
                    { title: "Library", href: "/guess/library", icon: Library, desc: "Resources", gradient: "from-pink-500 to-rose-500" },
                  ].map((item, index) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group relative rounded-xl p-4 border-2 overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className={`h-10 w-10 mb-3 rounded-xl grid place-items-center bg-gradient-to-br ${item.gradient} text-white shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-white transition-colors">{item.title}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-white/90 transition-colors">{item.desc}</div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-4 h-4 text-white animate-pulse" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Accents */}
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 flex justify-center items-center gap-6">
                  {[
                    { icon: GraduationCap, label: "Excellence" },
                    { icon: Trophy, label: "Awards" },
                    { icon: Heart, label: "Community" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 text-center">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Video controls */}
          <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 md:right-6 md:bottom-6 z-20">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-all duration-300 hover:scale-105 shadow-lg"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
                </button>
                <button
                  onClick={toggleMute}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-all duration-300 hover:scale-105 shadow-lg"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowVideoControls(!showVideoControls)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70 transition-all duration-300 hover:scale-105 shadow-lg"
                  aria-label="Video settings"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>

              {/* Advanced Video Controls */}
              {showVideoControls && (
                <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl min-w-[200px] animate-in slide-in-from-bottom duration-300">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Sun className="w-3 h-3" />
                          <span>Brightness</span>
                        </div>
                        <span className="text-white text-xs">{videoBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={videoBrightness}
                        onChange={(e) => setVideoBrightness(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <ImageIcon className="w-3 h-3" />
                          <span>Blur</span>
                        </div>
                        <span className="text-white text-xs">{videoBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={videoBlur}
                        onChange={(e) => setVideoBlur(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  )
}
