"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Play, Video, Calendar, Bell, Users, Wifi, Clock, ArrowLeft, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LiveStreamPage() {
  const [email, setEmail] = React.useState("")
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/guess/news-events"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News & Events
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            {/* Animated Live Stream Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl animate-float">
                <Video className="w-16 h-16 text-primary-foreground" />
                {/* Pulsing Ring Animation */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-accent/50 animate-pulse" />
              </div>
              {/* Live Indicator */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                SOON
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">Live Streaming</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Coming Soon!</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get ready for an exciting new way to connect and learn! Watch school events, assemblies, and special
              programs live from anywhere.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Calendar,
                title: "School Events",
                description: "Watch graduations, assemblies, and special ceremonies live",
              },
              {
                icon: Users,
                title: "Interactive Learning",
                description: "Participate in virtual classes and educational programs",
              },
              {
                icon: Wifi,
                title: "High Quality Stream",
                description: "Crystal clear video and audio for the best experience",
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Timeline */}
          <Card className="mb-12 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-primary">Development in Progress</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                {[
                  { phase: "Planning", status: "complete" },
                  { phase: "Development", status: "active" },
                  { phase: "Testing", status: "upcoming" },
                  { phase: "Launch", status: "upcoming" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300",
                        item.status === "complete" && "bg-green-500 text-white",
                        item.status === "active" && "bg-primary text-primary-foreground animate-pulse",
                        item.status === "upcoming" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.status === "complete" && <CheckCircle className="w-6 h-6" />}
                      {item.status === "active" && <Play className="w-6 h-6" />}
                      {item.status === "upcoming" && <Clock className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-medium">{item.phase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Signup */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              {!isSubscribed ? (
                <>
                  <div className="mb-6">
                    <Bell className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Get Notified</h3>
                    <p className="text-muted-foreground text-sm">Be the first to know when live streaming goes live!</p>
                  </div>
                  <form onSubmit={handleNotifyMe} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-center"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me When Ready
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-600 mb-2">You're All Set!</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll notify you as soon as live streaming is available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Have questions about the upcoming live streaming feature?{" "}
              <Link href="/guess/contact" className="text-primary hover:underline">
                Contact us
              </Link>{" "}
              for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
