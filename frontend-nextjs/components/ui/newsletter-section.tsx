"use client"

import type React from "react"

import { useState } from "react"
import { AnimatedButton } from "./animated-button"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"
import { Mail, Send, CheckCircle, Users, Bell } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail("")
  }

  if (isSubscribed) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Welcome to Our Community!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for subscribing! You'll receive our latest updates and school news.
          </p>
          <AnimatedButton
            variant="outline"
            onClick={() => setIsSubscribed(false)}
            className="hover:scale-105 transition-all duration-300"
          >
            Subscribe Another Email
          </AnimatedButton>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          <Bell className="w-4 h-4 mr-2" />
          Stay Connected
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Never Miss an <span className="gradient-text">Update</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Subscribe to our newsletter and stay informed about school events, academic achievements, and important
          announcements from Southville 8B NHS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground",
              )}
              required
            />
          </div>
          <AnimatedButton
            type="submit"
            disabled={isLoading || !email}
            className="group hover:scale-105 transition-all duration-300 px-6 py-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Subscribe
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </AnimatedButton>
        </div>
      </form>

      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>500+ subscribers</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <span>Weekly updates</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full" />
        <div className="text-xs">No spam, unsubscribe anytime</div>
      </div>
    </div>
  )
}
