"use client"

import * as React from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronUp, Minus } from "lucide-react"

type AchievementItem = {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  color: string
}

type Density = "comfortable" | "compact"

export function AchievementsGrid({
  items = [],
  defaultDensity = "comfortable",
}: {
  items?: AchievementItem[]
  defaultDensity?: Density
}) {
  const [density, setDensity] = React.useState<Density>(defaultDensity)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-sm text-slate-700 dark:text-white/80">
            Explore key academic outcomes. Toggle density to view more at a glance or with comfortable spacing.
          </p>
        </div>

        <div className="inline-flex rounded-md shadow-sm border border-slate-200 dark:border-white/20 overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "rounded-none text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10",
              density === "comfortable" && "bg-black/5 dark:bg-white/10",
            )}
            onClick={() => setDensity("comfortable")}
            aria-pressed={density === "comfortable"}
          >
            Comfortable
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "rounded-none text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10",
              density === "compact" && "bg-black/5 dark:bg-white/10",
            )}
            onClick={() => setDensity("compact")}
            aria-pressed={density === "compact"}
          >
            Compact
          </Button>
        </div>
      </div>

      <div className={cn("grid", "md:grid-cols-2 lg:grid-cols-4", density === "compact" ? "gap-4" : "gap-6")}>
        {items.map((achievement, index) => (
          <AnimatedCard
            key={achievement.title}
            variant="glass"
            animation="float"
            className={cn(
              "text-center backdrop-blur-0 border border-transparent",
              density === "compact" ? "p-3" : "p-6",
              "bg-transparent dark:bg-white/10 dark:border-white/20",
            )}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div
              className={cn(
                "inline-flex rounded-full mb-3",
                density === "compact" ? "p-3" : "p-4",
                "bg-gradient-to-r",
                achievement.color,
                "text-white",
              )}
              aria-hidden="true"
            >
              {achievement.icon}
            </div>

            <AnimatedStat
              value={achievement.value}
              className={cn(
                "font-bold",
                density === "compact" ? "text-2xl mb-1" : "text-3xl mb-2",
                "text-slate-900 dark:text-white",
              )}
            />

            <h3
              className={cn(
                "font-semibold text-slate-900 dark:text-white",
                density === "compact" ? "text-base mb-1" : "text-lg mb-2",
              )}
            >
              {achievement.title}
            </h3>

            <p
              className={cn(
                "mx-auto",
                density === "compact" ? "text-xs" : "text-sm",
                "text-slate-700 dark:text-white/80 max-w-[16rem]",
              )}
            >
              {achievement.description}
            </p>

            <TrendHint title={achievement.title} />
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}

function TrendHint({ title }: { title: string }) {
  const trends: Record<string, { dir: "up" | "flat" | "down"; delta: string }> = {
    "AP Pass Rate": { dir: "up", delta: "+2%" },
    "College Acceptance Rate": { dir: "up", delta: "+1%" },
    "Average SAT Score": { dir: "up", delta: "+15" },
    "National Merit Scholars": { dir: "flat", delta: "0" },
  }

  const t = trends[title]
  if (!t) return null

  return (
    <div className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-slate-900/5 text-slate-800 dark:bg-white/15 dark:text-white/90">
      {t.dir === "up" ? (
        <ChevronUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
      ) : t.dir === "down" ? (
        <Minus className="h-3.5 w-3.5 text-rose-600 dark:text-rose-300" />
      ) : (
        <Minus className="h-3.5 w-3.5 text-slate-600 dark:text-white/80" />
      )}
      <span>{t.delta} vs last year</span>
    </div>
  )
}

function AnimatedStat({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [display, setDisplay] = React.useState<string>(value)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function animate() {
    const numericMatch = value.replaceAll(",", "").match(/(\d+(\.\d+)?)/)
    if (!numericMatch) {
      setDisplay(value)
      return
    }

    const numPart = numericMatch[0]
    const start = 0
    const end = Number(numPart)
    const duration = 900

    const startTime = performance.now()

    function step(now: number) {
      const p = Math.min(1, (now - startTime) / duration)
      const curr = Math.floor(start + (end - start) * easeOutCubic(p))
      const formatted = value.replace(numPart, formatNumber(curr))
      setDisplay(formatted)
      if (p < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  return (
    <div ref={ref} className={className} aria-live="polite" aria-atomic="true">
      {display}
    </div>
  )
}

function formatNumber(n: number) {
  return n.toLocaleString()
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
