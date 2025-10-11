"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Wrench, Zap, Star, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface ComingSoonProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  expectedFeatures?: string[]
  priority?: 'high' | 'medium' | 'low'
  estimatedDate?: string
}

export function ComingSoon({
  title,
  description,
  icon: Icon,
  expectedFeatures = [],
  priority = 'medium',
  estimatedDate = "Coming Soon"
}: ComingSoonProps) {
  const router = useRouter()

  const priorityConfig = {
    high: {
      color: 'bg-red-500/10 text-red-600 border-red-200',
      badge: 'High Priority',
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    medium: {
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      badge: 'Medium Priority',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    low: {
      color: 'bg-green-500/10 text-green-600 border-green-200',
      badge: 'Low Priority',
      gradient: 'from-green-500/20 to-teal-500/20'
    }
  }

  const config = priorityConfig[priority]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-accent/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} border border-border/50`}>
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground text-lg">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={config.color}>
              <Star className="h-3 w-3 mr-1" />
              {config.badge}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {estimatedDate}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coming Soon Card */}
          <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Under Development
              </CardTitle>
              <CardDescription>
                This feature is currently being developed and will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>We're working hard to bring you this feature</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/3 animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground">Development Progress: 33%</p>
              </div>
            </CardContent>
          </Card>

          {/* Expected Features */}
          {expectedFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Planned Features
                </CardTitle>
                <CardDescription>
                  Here's what you can expect when this section is ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expectedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Development Timeline</CardTitle>
            <CardDescription>
              Stay updated on our development progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent/30">
                <div className="text-2xl font-bold text-primary">Phase 1</div>
                <div className="text-sm text-muted-foreground mt-1">Planning & Design</div>
                <div className="w-full bg-green-200 rounded-full h-1 mt-2">
                  <div className="bg-green-500 h-1 rounded-full w-full" />
                </div>
                <div className="text-xs text-green-600 mt-1">Complete</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-accent/30">
                <div className="text-2xl font-bold text-primary">Phase 2</div>
                <div className="text-sm text-muted-foreground mt-1">Development</div>
                <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                  <div className="bg-blue-500 h-1 rounded-full w-1/3 animate-pulse" />
                </div>
                <div className="text-xs text-blue-600 mt-1">In Progress</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-accent/30">
                <div className="text-2xl font-bold text-muted-foreground">Phase 3</div>
                <div className="text-sm text-muted-foreground mt-1">Testing & Launch</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-gray-400 h-1 rounded-full w-0" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-6 text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Want to be notified when this is ready?</h3>
            <p className="text-muted-foreground mb-4">
              We'll let you know as soon as this feature becomes available.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              <Clock className="h-4 w-4 mr-2" />
              Notify Me When Ready
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ComingSoon
