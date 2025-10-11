"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { LucideIcon } from "lucide-react"

interface TooltipButtonProps {
  icon: LucideIcon
  label: string
  shortcut?: string
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function TooltipButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  isActive = false,
  disabled = false,
  variant = "ghost",
  size = "sm",
  className = "",
}: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block z-[100]">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`transition-all duration-200 hover:scale-105 ${
          isActive
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
            : "dark:text-gray-300 dark:hover:bg-slate-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        <Icon className="h-4 w-4" />
      </Button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap z-[200] animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-none">
          <div className="flex items-center gap-2">
            <span>{label}</span>
            {shortcut && (
              <span className="px-1.5 py-0.5 bg-slate-800 dark:bg-slate-600 rounded text-[10px] font-mono">
                {shortcut}
              </span>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
          </div>
        </div>
      )}
    </div>
  )
}
