import type React from "react"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { BookOpen, GraduationCap, Sparkles } from "lucide-react"

type ChipItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export function HeroChips({
  items = [
    { label: "Programs", href: "/academics", icon: BookOpen },
    { label: "Admissions", href: "/contact", icon: GraduationCap },
    { label: "Scholarships", href: "/news-events", icon: Sparkles },
  ],
  className,
}: {
  items?: ChipItem[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3 sm:gap-4", className)}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              "border transition-all duration-200",
              // Light mode: black text; Dark mode: white text
              "text-slate-900 border-slate-900/20 hover:bg-slate-900 hover:text-white",
              "dark:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-slate-900",
              // Micro interaction
              "hover:-translate-y-0.5 active:translate-y-0",
              "shadow-sm hover:shadow",
            )}
          >
            {Icon ? <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" /> : null}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
