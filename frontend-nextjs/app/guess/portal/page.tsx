"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, LogIn, User, Users, GraduationCap, Shield, Sparkles, Zap, Star, Lock, Globe, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import React from "react"
import { useTheme } from "next-themes"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { loginAction } from "@/app/actions/auth"

export default function UnifiedPortalPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get("role") || "student"
  const isGamingTheme = theme === "gaming"

  const roleConfig = {
    student: {
      title: "Student Portal",
      description: "Access your grades, assignments, schedules, and school resources",
      icon: User,
      color: "from-blue-500 to-blue-600",
      gamingColor: "from-gaming-neon-blue to-gaming-neon-cyan",
      features: ["View Grades", "Submit Assignments", "Class Schedule", "Library Access", "Chat with Classmates"],
      placeholder: "Student ID (e.g., S123456)",
    },
    teacher: {
      title: "Teacher Portal",
      description: "Manage classes, grade assignments, and communicate with students",
      icon: GraduationCap,
      color: "from-green-500 to-green-600",
      gamingColor: "from-gaming-neon-green to-gaming-neon-blue",
      features: ["Grade Management", "Lesson Planning", "Student Progress", "Parent Communication", "Resource Library"],
      placeholder: "Teacher ID (e.g., T123456)",
    },
    admin: {
      title: "Administrator Portal",
      description: "Comprehensive school management and administrative tools",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      gamingColor: "from-gaming-neon-purple to-gaming-neon-pink",
      features: ["User Management", "System Analytics", "School Reports", "Security Settings", "Global Announcements"],
      placeholder: "Admin ID (e.g., A123456)",
    },
    parent: {
      title: "Parent Portal",
      description: "Monitor your child's academic progress and school activities",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      gamingColor: "from-gaming-neon-orange to-gaming-neon-pink",
      features: ["Child's Grades", "Attendance Tracking", "Teacher Communication", "Event Calendar", "Payment Portal"],
      placeholder: "Parent ID (e.g., P123456)",
    },
  }

  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.student

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Call login server action
      const result = await loginAction({ email, password })

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Redirect based on role
      const redirectPath = result.role === 'Admin' 
        ? '/superadmin' 
        : result.role === 'Teacher' 
        ? '/teacher' 
        : '/student'

      console.log('[Login] ✅ Login successful, redirecting to:', redirectPath);
      console.log('[Login] User role:', result.role);
      
      // Use hard navigation to ensure cookies are sent with next request
      // This prevents race conditions with client-side routing
      window.location.href = redirectPath;
    } catch (err: any) {
      console.error('[Login] ❌ Login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden",
        isGamingTheme
          ? "bg-gaming-dark bg-gaming-grid bg-gaming-grid-size"
          : "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
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

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div
            className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-2xl",
              isGamingTheme
                ? `bg-gradient-to-br ${currentRole.gamingColor} animate-gamingPulse`
                : `bg-gradient-to-br ${currentRole.color}`,
            )}
          >
            <currentRole.icon className="w-12 h-12 text-white" />
          </div>
          <h1
            className={cn(
              "text-5xl md:text-6xl font-bold mb-4",
              isGamingTheme
                ? "text-gaming-neon-green animate-neonGlow"
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
            )}
          >
            Unified Portal
          </h1>
          <p
            className={cn(
              "text-xl max-w-3xl mx-auto mb-4",
              isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground",
            )}
          >
            Secure access to all school resources and services
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "text-sm px-4 py-2",
              isGamingTheme && "bg-gaming-accent text-gaming-neon-green border-gaming-neon-green/30",
            )}
          >
            <Lock className="w-4 h-4 mr-2" />
            Accessing as: {currentRole.title.replace(" Portal", "")}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
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
                    ? `bg-gradient-to-r ${currentRole.gamingColor} animate-gamingPulse`
                    : `bg-gradient-to-r ${currentRole.color}`,
                )}
              >
                <currentRole.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className={cn("text-3xl font-bold", isGamingTheme && "text-gaming-neon-green")}>
                {currentRole.title}
              </CardTitle>
              <CardDescription className={cn("text-base", isGamingTheme && "text-gaming-neon-blue")}>
                {currentRole.description}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "h-12 text-base",
                      isGamingTheme &&
                        "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green",
                    )}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label
                    htmlFor="password"
                    className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "h-12 text-base pr-12",
                        isGamingTheme &&
                          "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green",
                      )}
                      required
                      disabled={isLoading}
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
                      id="remember"
                      className={cn("rounded border-gray-300", isGamingTheme && "accent-gaming-neon-green")}
                    />
                    <Label
                      htmlFor="remember"
                      className={cn("cursor-pointer", isGamingTheme && "text-gaming-neon-blue")}
                    >
                      Keep me signed in
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
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

                {/* Two-Factor Authentication */}
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    isGamingTheme ? "bg-gaming-accent/50 border-gaming-neon-green/20" : "bg-muted/50",
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className={cn("w-4 h-4", isGamingTheme ? "text-gaming-neon-green" : "text-green-500")} />
                    <span className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}>
                      Enhanced Security
                    </span>
                  </div>
                  <p className={cn("text-xs", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                    Two-factor authentication is enabled for your account security.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-6">
                <AnimatedButton
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                    isGamingTheme
                      ? `bg-gradient-to-r ${currentRole.gamingColor} hover:scale-105 animate-gamingPulse`
                      : `bg-gradient-to-r ${currentRole.color} hover:scale-105`,
                  )}
                  animation={isGamingTheme ? "neonGlow" : "glow"}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Access {currentRole.title}
                      {isGamingTheme ? <Zap className="w-4 h-4 ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                    </>
                  )}
                </AnimatedButton>

                <div className="text-center">
                  <p className={cn("text-sm", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                    Need a different access level?{" "}
                    <Link
                      href="/portal"
                      className={cn(
                        "font-medium hover:underline transition-colors duration-300",
                        isGamingTheme
                          ? "text-gaming-neon-green hover:text-gaming-neon-blue"
                          : "text-primary hover:text-primary/80",
                      )}
                    >
                      Switch Role
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Features & Information */}
          <div className="space-y-6">
            {/* Role Features */}
            <Card
              className={cn(
                "border-0 backdrop-blur-xl",
                isGamingTheme ? "bg-gaming-dark/90 border border-gaming-neon-green/20" : "bg-background/95",
              )}
            >
              <CardHeader>
                <CardTitle className={cn("text-xl", isGamingTheme && "text-gaming-neon-green")}>
                  Available Features
                </CardTitle>
                <CardDescription className={cn(isGamingTheme && "text-gaming-neon-blue")}>
                  What you can access with this portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {currentRole.features.map((feature, index) => (
                    <div
                      key={feature}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300",
                        isGamingTheme
                          ? "bg-gaming-accent/30 hover:bg-gaming-accent/50"
                          : "bg-muted/50 hover:bg-muted/80",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          isGamingTheme
                            ? "bg-gaming-neon-green text-gaming-dark"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className={cn("font-medium", isGamingTheme && "text-gaming-neon-green")}>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: "Mobile App",
                  description: "Download for mobile access",
                  icon: Star,
                  href: "/mobile-app",
                },
                {
                  title: "Help Center",
                  description: "Get support and tutorials",
                  icon: Shield,
                  href: "/help",
                },
                {
                  title: "System Status",
                  description: "Check service availability",
                  icon: Globe,
                  href: "/status",
                },
                {
                  title: "Contact IT",
                  description: "Technical support",
                  icon: Sparkles,
                  href: "/support",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "group p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    isGamingTheme
                      ? "bg-gaming-accent/50 border border-gaming-neon-green/20 hover:border-gaming-neon-green/50"
                      : "bg-background/50 backdrop-blur-sm border hover:bg-background/80",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-300",
                      isGamingTheme ? "text-gaming-neon-green" : "text-primary",
                    )}
                  />
                  <h3 className={cn("font-semibold text-sm mb-1", isGamingTheme && "text-gaming-neon-green")}>
                    {item.title}
                  </h3>
                  <p className={cn("text-xs", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Security Notice */}
            <Card
              className={cn(
                "border-0 backdrop-blur-xl",
                isGamingTheme ? "bg-gaming-dark/90 border border-gaming-neon-green/20" : "bg-background/95",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield
                    className={cn("w-5 h-5 mt-0.5", isGamingTheme ? "text-gaming-neon-green" : "text-green-500")}
                  />
                  <div>
                    <h4 className={cn("font-semibold text-sm mb-1", isGamingTheme && "text-gaming-neon-green")}>
                      Your Security Matters
                    </h4>
                    <p className={cn("text-xs", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")}>
                      This portal uses enterprise-grade security with encrypted connections, multi-factor
                      authentication, and regular security audits to protect your data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
