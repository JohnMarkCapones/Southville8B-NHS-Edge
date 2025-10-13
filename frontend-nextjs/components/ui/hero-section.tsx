"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  // Respect prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Play/pause video only when hero is visible for better perf
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
        v.play()
          .then(() => setIsPlaying(true))
          .catch(() => {})
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
          v.play()
            .then(() => setIsPlaying(true))
            .catch(() => {})
        }
      },
      { threshold: 0.2 },
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
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
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
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  return (
    <section
      ref={sectionRef as any}
      aria-label="Southville 8B National High School hero"
      className={cn(
        "relative overflow-hidden",
        "min-h-[80vh] sm:min-h-[86vh] md:min-h-screen",
        // Removed background gradient for testing
      )}
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/placeholder.jpg"
          onLoadedMetadata={onLoaded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-hidden="true"
          loading="lazy"
        >
          {/* Add WebM format when available - better compression */}
          {/* <source src="/videos/hero-blue-campus.webm" type="video/webm" /> */}
          <source src="/videos/hero-blue-campus.mp4" type="video/mp4" />
          {"Your browser does not support the video tag."}
        </video>
      </div>

  {/* Theme-aware overlays – lighter for light mode */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/20 backdrop-blur-[2px] dark:from-black/80 dark:via-black/60 dark:to-black/40" />
  {/* Blue tint glaze (soft light blend in light mode) */}
  <div className="pointer-events-none absolute inset-0 mix-blend-soft-light bg-[radial-gradient(75%_60%_at_10%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(60%_55%_at_90%_20%,rgba(14,165,233,0.08),transparent)] dark:mix-blend-normal dark:bg-[radial-gradient(75%_60%_at_10%_10%,rgba(37,99,235,0.18),transparent),radial-gradient(60%_55%_at_90%_20%,rgba(14,165,233,0.12),transparent)]" />
  {/* Subtle grid (hidden on small) */}
  <div className="pointer-events-none absolute inset-0 hidden sm:block bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
  {/* Soft vignette to improve legibility */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_60%,transparent_62%,rgba(0,0,0,0.06)_100%)] dark:bg-[radial-gradient(120%_90%_at_50%_60%,transparent_55%,rgba(0,0,0,0.30)_100%)]" />

      {/* Brand chip (logo + name) */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-4 sm:pt-6 md:pt-8">
          <div className="inline-flex items-center gap-3 rounded-full border bg-white text-slate-900 border-slate-200/70 shadow-sm px-2.5 pr-3 py-1.5 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700/60 backdrop-blur">
            <div className="relative h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-white">
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
              <Building2 className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              Southville 8B National High School
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 lg:grid-cols-2">
            {/* Left: Headline, copy, CTAs, stats */}
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
                Aspire Higher,
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-300 dark:to-indigo-300">
                  Lead with Excellence
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-200 max-w-2xl">
                A future‑ready education in a caring community. Discover rigorous academics, vibrant student life, and a
                culture of excellence that empowers every learner.
              </p>

              {/* CTA Row */}
              <div className="mt-6 sm:mt-7 flex flex-col xs:flex-row gap-2.5 sm:gap-3">
                <Link href="/guess/academics" className="w-full xs:w-auto">
                  <Button
                    size="lg"
                    className="w-full xs:w-auto rounded-full px-6 sm:px-7 py-5 sm:py-6 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explore Academics
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/guess/virtual-tour" className="w-full xs:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full xs:w-auto rounded-full px-6 sm:px-7 py-5 sm:py-6 font-semibold border-2 border-blue-300 text-blue-900 hover:bg-blue-50 dark:border-blue-200/80 dark:text-blue-200 dark:hover:bg-slate-800/70 bg-transparent"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Virtual Tour
                  </Button>
                </Link>
              </div>

              {/* Stats – compact */}
              <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-md">
                {[
                  { label: "Students", value: "1,200+" },
                  { label: "Faculty", value: "85+" },
                  { label: "Programs", value: "25+" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-200">
                      {s.value}
                    </div>
                    <div className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Premium Quick Links grid (revamped) */}
            <div className="lg:justify-self-end w-full">
              <div className="rounded-2xl p-5 sm:p-6 md:p-7 w-full max-w-md ml-auto bg-white/80 border border-white/60 shadow-sm backdrop-blur dark:bg-slate-900/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-slate-900 dark:text-slate-100 text-base sm:text-lg md:text-xl font-semibold">
                      Quick Links
                    </h3>
                  </div>
                  <Badge className="bg-blue-600 text-white text-[11px] sm:text-xs">Start Here</Badge>
                </div>

                {/* New grid of actions (6 items) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {[
                    { title: "Academics", href: "/guess/academics", icon: BookOpen, desc: "Courses" },
                    { title: "Student Life", href: "/guess/student-life", icon: Users, desc: "Clubs" },
                    { title: "Athletics", href: "/guess/athletics", icon: Trophy, desc: "Schedules" },
                    { title: "Admissions", href: "/guess/contact", icon: Building2, desc: "Apply" },
                    { title: "Calendar", href: "/guess/news-events", icon: CalendarDays, desc: "Events" },
                    { title: "Library", href: "/guess/library", icon: Library, desc: "Resources" },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "group relative rounded-xl p-3 sm:p-3.5 border overflow-hidden",
                        "bg-white/80 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/60",
                        "hover:shadow-md transition-all",
                      )}
                    >
                      {/* gradient ring on hover */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-transparent group-hover:ring-2 group-hover:ring-blue-500/40 transition-all" />
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg grid place-items-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</div>
                          <div className="text-[12px] text-slate-600 dark:text-slate-300">{item.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Accents */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: GraduationCap, label: "Excellence" },
                    { icon: Trophy, label: "Awards" },
                    { icon: BookOpen, label: "Learning" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
                      <Icon className="w-4 h-4 text-blue-600" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Video controls – compact */}
          <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 md:right-6 md:bottom-6 z-20 flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm bg-black/40 text-white backdrop-blur border border-white/20 hover:bg-black/55 transition-colors"
              aria-label={isPlaying ? "Pause background video" : "Play background video"}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={toggleMute}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm bg-black/40 text-white backdrop-blur border border-white/20 hover:bg-black/55 transition-colors"
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
