"use client"

import { AnimatedButton } from "@/components/ui/animated-button"
import { Calendar, FileText, Sparkles, ArrowRight, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedNavButtonsProps {
  className?: string
  showBoth?: boolean
}

export function EnhancedNavButtons({ className, showBoth = true }: EnhancedNavButtonsProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-center justify-center", className)}>
      {/* Apply Now Button */}
      <AnimatedButton
        variant="default"
        size="lg"
        className={cn(
          "group relative overflow-hidden",
          "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
          "dark:from-red-600 dark:to-red-700 dark:hover:from-red-500 dark:hover:to-red-600",
          "text-white dark:text-white",
          "border-0 shadow-lg hover:shadow-xl",
          "transform hover:scale-105 transition-all duration-300",
          "min-w-[120px] font-semibold",
        )}
        animation="glow"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <FileText className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
        Apply Now
        <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
      </AnimatedButton>

      {showBoth && (
        <>
          {/* Schedule Visit Button */}
          <AnimatedButton
            variant="outline"
            size="lg"
            className={cn(
              "group relative overflow-hidden",
              "border-2 border-red-600 dark:border-red-500",
              "text-red-600 dark:text-red-400",
              "hover:bg-red-600 hover:text-white",
              "dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600",
              "shadow-md hover:shadow-lg",
              "transform hover:scale-105 transition-all duration-300",
              "min-w-[120px] font-semibold",
              "bg-white dark:bg-gray-900",
            )}
            animation="scale"
          >
            <div className="absolute inset-0 bg-red-600 dark:bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="relative z-10">Schedule Visit</span>
            <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </AnimatedButton>

          {/* Contact Buttons */}
          <div className="flex gap-2">
            <AnimatedButton
              variant="ghost"
              size="sm"
              className={cn(
                "group",
                "text-gray-600 dark:text-gray-300",
                "hover:text-red-600 dark:hover:text-red-400",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "transition-all duration-300",
              )}
            >
              <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Call
            </AnimatedButton>

            <AnimatedButton
              variant="ghost"
              size="sm"
              className={cn(
                "group",
                "text-gray-600 dark:text-gray-300",
                "hover:text-red-600 dark:hover:text-red-400",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "transition-all duration-300",
              )}
            >
              <Mail className="w-4 h-4 mr-2 group-hover:animate-bounce" />
              Email
            </AnimatedButton>
          </div>
        </>
      )}
    </div>
  )
}

// Individual button components for flexible usage
export function ApplyNowButton({ className }: { className?: string }) {
  return (
    <AnimatedButton
      variant="default"
      size="lg"
      className={cn(
        "group relative overflow-hidden",
        "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        "dark:from-red-600 dark:to-red-700 dark:hover:from-red-500 dark:hover:to-red-600",
        "text-white dark:text-white",
        "border-0 shadow-lg hover:shadow-xl",
        "transform hover:scale-105 transition-all duration-300",
        "font-semibold",
        className,
      )}
      animation="glow"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <FileText className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
      Apply Now
      <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
    </AnimatedButton>
  )
}

export function ScheduleVisitButton({ className }: { className?: string }) {
  return (
    <AnimatedButton
      variant="outline"
      size="lg"
      className={cn(
        "group relative overflow-hidden",
        "border-2 border-red-600 dark:border-red-500",
        "text-red-600 dark:text-red-400",
        "hover:bg-red-600 hover:text-white",
        "dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600",
        "shadow-md hover:shadow-lg",
        "transform hover:scale-105 transition-all duration-300",
        "font-semibold",
        "bg-white dark:bg-gray-900",
        className,
      )}
      animation="scale"
    >
      <div className="absolute inset-0 bg-red-600 dark:bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
      <span className="relative z-10">Schedule Visit</span>
      <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
    </AnimatedButton>
  )
}
