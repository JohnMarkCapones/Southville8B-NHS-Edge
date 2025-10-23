"use client"

import * as React from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowRight, ExternalLink } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  badge?: string
  stats?: { label: string; value: string }[]
  className?: string
  href?: string
  variant?: "default" | "featured" | "compact"
  style?: React.CSSProperties
}

export function FeatureCard({
  title,
  description,
  icon,
  image,
  badge,
  stats,
  className,
  href,
  variant = "default",
  style,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const cardContent = (
    <AnimatedCard
      variant="lift"
      animation="glow"
      style={style}
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-500",
        variant === "featured" && "lg:col-span-2 bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10",
        variant === "compact" && "p-4",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "p-3 rounded-lg transition-all duration-300",
              variant === "featured"
                ? "bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white"
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
            )}
          >
            {icon}
          </div>
          <div>
            <h3
              className={cn(
                "font-bold transition-colors duration-300",
                variant === "featured" ? "text-2xl gradient-text" : "text-xl group-hover:text-primary",
              )}
            >
              {title}
            </h3>
            {badge && (
              <Badge variant="secondary" className="mt-1">
                {badge}
              </Badge>
            )}
          </div>
        </div>

        <div className={cn("transition-transform duration-300", isHovered ? "translate-x-1 -translate-y-1" : "")}>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
      </div>

      {/* Image */}
      {image && (
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className={cn(
              "w-full transition-transform duration-500",
              variant === "featured" ? "h-48" : "h-32",
              "object-cover group-hover:scale-110",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Description */}
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
              <div
                className="text-2xl font-bold text-primary animate-bounce"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <AnimatedButton
        variant={variant === "featured" ? "gradient" : "outline"}
        className="w-full group-hover:scale-105 transition-transform duration-300"
        animation="glow"
      >
        Learn More
        <ExternalLink className="w-4 h-4 ml-2" />
      </AnimatedButton>
    </AnimatedCard>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    )
  }

  return cardContent
}
