"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Eye, EyeOff, LogIn, User, Users, GraduationCap, Shield, Sparkles, Zap, Star } from "lucide-react"
import Link from "next/link"
import React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("student")
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  const loginTypes = [
    {
      id: "student",
      title: "Student Portal",
      description: "Access your grades, assignments, and school resources",
      icon: User,
      color: "from-blue-500 to-blue-600",
      gamingColor: "from-gaming-neon-blue to-gaming-neon-cyan",
    },
    {
      id: "parent",
      title: "Parent Portal",
      description: "Monitor your child's progress and school activities",
      icon: Users,
      color: "from-green-500 to-green-600",
      gamingColor: "from-gaming-neon-green to-gaming-neon-blue",
    },
    {
      id: "staff",
      title: "Staff Portal",
      description: "Access teaching tools and administrative resources",
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      gamingColor: "from-gaming-neon-purple to-gaming-neon-pink",
    },
  ]

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
        {/* Header Section */}
        <div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl",
              isGamingTheme
                ? "bg-gradient-to-br from-gaming-neon-green to-gaming-neon-blue animate-gamingPulse"
                : "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
            )}
          >
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1
            className={cn(
              "text-4xl md:text-5xl font-bold mb-4",
              isGamingTheme
                ? "text-gaming-neon-green animate-neonGlow"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
            )}
          >
            Welcome Back
          </h1>
          <p
            className={cn(
              "text-xl max-w-2xl mx-auto",
              isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground",
            )}
          >
            Access your personalized portal to stay connected with Southville 8B NHS
          </p>
        </div>

        {/* Login Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={cn(
              "grid w-full grid-cols-3 mb-8 h-14",
              isGamingTheme && "bg-gaming-accent border-gaming-neon-green/20",
            )}
          >
            {loginTypes.map((type) => (
              <TabsTrigger
                key={type.id}
                value={type.id}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-all duration-300",
                  isGamingTheme &&
                    "data-[state=active]:bg-gaming-neon-green/20 data-[state=active]:text-gaming-neon-green",
                )}
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.title}</span>
                <span className="sm:hidden">{type.id.charAt(0).toUpperCase() + type.id.slice(1)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {loginTypes.map((type) => (
            <TabsContent key={type.id} value={type.id}>
              <Card
                className={cn(
                  "shadow-2xl border-0 backdrop-blur-xl",
                  isGamingTheme ? "bg-gaming-dark/90 border border-gaming-neon-green/20" : "bg-background/95",
                )}
              >
                <CardHeader className="text-center pb-8">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto",
                      isGamingTheme
                        ? `bg-gradient-to-r ${type.gamingColor} animate-gamingPulse`
                        : `bg-gradient-to-r ${type.color}`,
                    )}
                  >
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className={cn("text-2xl font-bold", isGamingTheme && "text-gaming-neon-green")}>
                    {type.title}
                  </CardTitle>
                  <CardDescription className={cn("text-base", isGamingTheme && "text-gaming-neon-blue")}>
                    {type.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`${type.id}-username`}
                      className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}
                    >
                      {type.id === "student" ? "Student ID" : type.id === "parent" ? "Parent ID" : "Staff ID"}
                    </Label>
                    <Input
                      id={`${type.id}-username`}
                      placeholder={
                        type.id === "student"
                          ? "e.g., S123456"
                          : type.id === "parent"
                            ? "e.g., P123456"
                            : "e.g., staff_username"
                      }
                      className={cn(
                        "h-12 text-base",
                        isGamingTheme &&
                          "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green",
                      )}
                      required
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <Label
                      htmlFor={`${type.id}-password`}
                      className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${type.id}-password`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={cn(
                          "h-12 text-base pr-12",
                          isGamingTheme &&
                            "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green",
                        )}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className={cn("h-4 w-4", isGamingTheme && "text-gaming-neon-blue")} />
                        ) : (
                          <Eye className={cn("h-4 w-4", isGamingTheme && "text-gaming-neon-blue")} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${type.id}-remember`}
                        className={cn("rounded border-gray-300", isGamingTheme && "accent-gaming-neon-green")}
                      />
                      <Label
                        htmlFor={`${type.id}-remember`}
                        className={cn("cursor-pointer", isGamingTheme && "text-gaming-neon-blue")}
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/guess/forgot-password"
                      className={cn(
                        "font-medium hover:underline transition-colors duration-300",
                        isGamingTheme
                          ? "text-gaming-neon-pink hover:text-gaming-neon-purple"
                          : "text-primary hover:text-primary/80",
                      )}
                    >
                      Forgot password?
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-6">
                  <AnimatedButton
                    className={cn(
                      "w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                      isGamingTheme
                        ? `bg-gradient-to-r ${type.gamingColor} hover:scale-105 animate-gamingPulse`
                        : `bg-gradient-to-r ${type.color} hover:scale-105`,
                    )}
                    animation={isGamingTheme ? "neonGlow" : "glow"}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In to {type.title}
                    {isGamingTheme ? <Zap className="w-4 h-4 ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                  </AnimatedButton>

                  <div className="text-center">
                    <p className={cn("text-sm", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                      Need help accessing your account?{" "}
                      <Link
                        href="/guess/contact"
                        className={cn(
                          "font-medium hover:underline transition-colors duration-300",
                          isGamingTheme
                            ? "text-gaming-neon-green hover:text-gaming-neon-blue"
                            : "text-primary hover:text-primary/80",
                        )}
                      >
                        Contact Support
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

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
