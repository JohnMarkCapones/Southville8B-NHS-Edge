"use client"

import Image from "next/image"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

type BrandChipProps = {
  className?: string
}

export function BrandChip({ className }: BrandChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border bg-white text-slate-900",
        "border-slate-200/70 shadow-sm px-2.5 pr-3 py-1.5 backdrop-blur",
        "dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700/60",
        className,
      )}
      aria-label="Southville 8B National High School"
    >
      <span className="relative h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-white">
        <Image
          src="/logo.png"
          alt="School logo"
          fill
          className="object-contain p-0.5"
          sizes="(max-width: 768px) 32px, 36px"
          priority
        />
      </span>
      <span className="inline-flex items-center gap-2 text-sm md:text-base font-semibold tracking-tight">
        <Building2 className="h-4 w-4 text-slate-700 dark:text-slate-200" />
        Southville 8B National High School
      </span>
    </div>
  )
}
