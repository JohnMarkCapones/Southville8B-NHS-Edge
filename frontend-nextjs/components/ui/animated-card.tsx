"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "glow" | "lift"
  animation?: "none" | "float" | "pulse" | "glow" | "scale"
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = "default", animation = "none", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-card text-card-foreground border shadow-sm",
      glass: "glass border-white/20",
      gradient: "bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900 border-0 shadow-lg",
      glow: "bg-card text-card-foreground border shadow-lg hover-glow",
      lift: "bg-card text-card-foreground border shadow-sm hover-lift",
    }

    const animationClasses = {
      none: "",
      float: "floating",
      pulse: "animate-pulse",
      glow: "pulse-glow",
      scale: "hover-scale",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 transition-all duration-300",
          variantClasses[variant],
          animationClasses[animation],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
