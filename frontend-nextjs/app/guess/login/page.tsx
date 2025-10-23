"use client"

import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form"
import { Shield, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden",
        isGamingTheme
          ? "bg-gaming-dark bg-gaming-grid bg-gaming-grid-size"
          : "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
      )}
    >
      {/* Gaming Theme Background Effects */}
      {isGamingTheme && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-gaming-dark via-transparent to-gaming-dark opacity-50" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gaming-neon-green to-transparent animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gaming-neon-blue to-transparent animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Enhanced Login Form with Progressive Rate Limiting */}
        <EnhancedLoginForm />

        {/* Quick Access Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Mobile App",
              description: "Download our mobile app for on-the-go access",
              icon: Star,
              href: "/mobile-app",
            },
            {
              title: "Guest Access",
              description: "Explore public resources and information",
              icon: Shield,
              href: "/guest-access",
            },
            {
              title: "Technical Support",
              description: "Get help with login issues and technical problems",
              icon: Sparkles,
              href: "/support",
            },
          ].map((feature, index) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={cn(
                "group p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg",
                isGamingTheme
                  ? "bg-gaming-accent/50 border border-gaming-neon-green/20 hover:border-gaming-neon-green/50"
                  : "bg-background/50 backdrop-blur-sm border hover:bg-background/80",
              )}
            >
              <feature.icon
                className={cn(
                  "w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300",
                  isGamingTheme ? "text-gaming-neon-green" : "text-primary",
                )}
              />
              <h3 className={cn("font-semibold mb-2", isGamingTheme && "text-gaming-neon-green")}>{feature.title}</h3>
              <p className={cn("text-sm", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
