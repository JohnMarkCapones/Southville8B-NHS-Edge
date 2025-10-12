"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TrendingUp, TrendingDown, Users, GraduationCap, Activity, BookOpen, Group, School, Upload, CalendarDays, ImageIcon, Eye, MoreVertical, ExternalLink, BarChart3, Settings } from "lucide-react"
import { BackgroundSparkline, Sparkline } from "../sparkline-components"
import { useRouter } from "next/navigation"

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  change?: {
    value: string
    trend: 'up' | 'down'
    label: string
  }
  gradient: {
    from: string
    to: string
  }
  sparklineData?: number[]
  sparklineColor?: string
  navigationPath?: string
  onClick?: () => void
}

interface HeroKPICardProps extends KPICardProps {
  isLarge?: boolean
  statusIndicators?: {
    active: number
    inactive: number
  }
}

interface CompactKPICardProps extends Omit<KPICardProps, 'subtitle'> {
  subtitle?: string
  additionalInfo?: {
    icon: React.ComponentType<{ className?: string }>
    value: string
    label: string
  }
}

// Hero KPI Card (large cards for main metrics)
export const HeroKPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  change, 
  gradient, 
  sparklineData = [], 
  sparklineColor = "#ffffff",
  statusIndicators,
  navigationPath,
  onClick
}: HeroKPICardProps) => {
  const router = useRouter()

  const handleViewDetails = () => {
    if (onClick) {
      onClick()
    } else if (navigationPath) {
      router.push(navigationPath)
    }
  }

  return (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.to} border border-gray-200/20 dark:border-gray-700/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group h-40`}
    >
      {sparklineData.length > 0 && (
        <BackgroundSparkline data={sparklineData} color={sparklineColor} opacity={0.25} />
      )}
      
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-3 right-3 w-6 h-6 bg-white/10 rounded-full animate-ping"></div>
      <div className={`absolute bottom-0 left-0 w-full h-1.5 shadow-lg`}
           style={{
             background: `linear-gradient(to right, ${
               gradient.from.includes('blue') ? '#60a5fa, #3b82f6, #2563eb' : 
               gradient.from.includes('purple') || gradient.from.includes('violet') ? '#c084fc, #a855f7, #9333ea' :
               gradient.from.includes('green') || gradient.from.includes('emerald') ? '#34d399, #10b981, #059669' :
               gradient.from.includes('orange') || gradient.from.includes('amber') ? '#fb923c, #f97316, #ea580c' :
               gradient.from.includes('pink') || gradient.from.includes('rose') ? '#f472b6, #ec4899, #db2777' :
               gradient.from.includes('cyan') || gradient.from.includes('teal') ? '#22d3ee, #06b6d4, #0891b2' :
               gradient.from.includes('red') ? '#f87171, #ef4444, #dc2626' :
               gradient.from.includes('yellow') ? '#fbbf24, #f59e0b, #d97706' :
               gradient.from.includes('indigo') ? '#818cf8, #6366f1, #4f46e5' :
               '#60a5fa, #3b82f6, #2563eb'
             })`,
             boxShadow: `0 0 8px ${
               gradient.from.includes('blue') ? '#3b82f680' : 
               gradient.from.includes('purple') || gradient.from.includes('violet') ? '#a855f780' :
               gradient.from.includes('green') || gradient.from.includes('emerald') ? '#10b98180' :
               gradient.from.includes('orange') || gradient.from.includes('amber') ? '#f9731680' :
               gradient.from.includes('pink') || gradient.from.includes('rose') ? '#ec489980' :
               gradient.from.includes('cyan') || gradient.from.includes('teal') ? '#06b6d480' :
               gradient.from.includes('red') ? '#ef444480' :
               gradient.from.includes('yellow') ? '#f59e0b80' :
               gradient.from.includes('indigo') ? '#6366f180' :
               '#3b82f680'
             }`
           }}></div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl"></div>

      <CardContent className="relative p-4 text-white h-full">
        <div className="flex items-start justify-between h-full">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center shadow-xl shadow-blue-900/30 border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-4 w-4 text-blue-50 drop-shadow-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-50 uppercase tracking-wider drop-shadow-sm">
                    {title}
                  </p>
                  <p className="text-xs text-blue-100/90 font-medium">{subtitle}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 transition-opacity duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleViewDetails}
                  title="View Details"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-white hover:bg-white/20 hover:text-white"
                      title="More Actions"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleViewDetails}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-3">
              <p className="text-2xl font-black tracking-tight drop-shadow-lg">{value}</p>
              {change && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/40 rounded-full backdrop-blur-sm border border-green-400/30 shadow-lg">
                  {change.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-100" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-100" />
                  )}
                  <span className="text-xs font-bold text-green-100">{change.value}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-blue-100 font-semibold">{change?.label || "vs last month"}</p>
              {statusIndicators && (
                <div className="flex items-center gap-3 text-xs text-blue-100">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <span className="font-semibold">Active: {statusIndicators.active}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
                    <span className="font-semibold">Inactive: {statusIndicators.inactive}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact KPI Card (smaller cards for secondary metrics)
export const CompactKPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  gradient, 
  sparklineData = [], 
  sparklineColor = "#3b82f6",
  additionalInfo,
  navigationPath,
  onClick
}: CompactKPICardProps) => {
  const router = useRouter()

  const handleViewDetails = () => {
    if (onClick) {
      onClick()
    } else if (navigationPath) {
      router.push(navigationPath)
    }
  }

  return (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.to} border border-gray-300/60 dark:border-gray-600/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group h-24`}
    >
      {sparklineData.length > 0 && (
        <BackgroundSparkline 
          data={sparklineData} 
          color={sparklineColor} 
          opacity={0.15} 
        />
      )}
      
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-1 right-1 w-6 h-6 bg-white/10 rounded-full blur-sm"></div>
      <div className={`absolute bottom-0 left-0 w-full h-0.5`}
           style={{
             background: `linear-gradient(to right, ${
               gradient.from.includes('blue') ? '#60a5fa, #3b82f6' : 
               gradient.from.includes('purple') || gradient.from.includes('violet') ? '#c084fc, #a855f7' :
               gradient.from.includes('green') || gradient.from.includes('emerald') ? '#34d399, #10b981' :
               gradient.from.includes('orange') || gradient.from.includes('amber') ? '#fb923c, #f97316' :
               gradient.from.includes('pink') || gradient.from.includes('rose') ? '#f472b6, #ec4899' :
               gradient.from.includes('cyan') || gradient.from.includes('teal') ? '#22d3ee, #06b6d4' :
               gradient.from.includes('red') ? '#f87171, #ef4444' :
               gradient.from.includes('yellow') ? '#fbbf24, #f59e0b' :
               gradient.from.includes('indigo') ? '#818cf8, #6366f1' :
               '#60a5fa, #3b82f6'
             })`,
             boxShadow: `0 0 6px ${
               gradient.from.includes('blue') ? '#3b82f660' : 
               gradient.from.includes('purple') || gradient.from.includes('violet') ? '#a855f760' :
               gradient.from.includes('green') || gradient.from.includes('emerald') ? '#10b98160' :
               gradient.from.includes('orange') || gradient.from.includes('amber') ? '#f9731660' :
               gradient.from.includes('pink') || gradient.from.includes('rose') ? '#ec489960' :
               gradient.from.includes('cyan') || gradient.from.includes('teal') ? '#06b6d460' :
               gradient.from.includes('red') ? '#ef444460' :
               gradient.from.includes('yellow') ? '#f59e0b60' :
               gradient.from.includes('indigo') ? '#6366f160' :
               '#3b82f660'
             }`
           }}></div>
      
      <CardContent className="relative p-3 h-full flex items-center justify-between text-gray-900 dark:text-white group">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20 dark:border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{backgroundColor: sparklineColor}}>
            <Icon className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 dark:text-white drop-shadow-lg">{value}</p>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide drop-shadow-sm">{title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mr-1">
          <div className="text-right space-y-1">
            {sparklineData.length > 0 && (
              <div className="w-16 h-8">
                <Sparkline data={sparklineData} color={sparklineColor} strokeWidth={2} />
              </div>
            )}
            {change && (
              <div className="flex items-center gap-1 justify-end">
                {change.trend === 'up' ? (
                  <TrendingUp className={`h-3 w-3 ${
                    gradient.from.includes('blue') ? 'text-blue-600' : 
                    gradient.from.includes('purple') || gradient.from.includes('violet') ? 'text-purple-600' :
                    gradient.from.includes('green') || gradient.from.includes('emerald') ? 'text-emerald-600' :
                    gradient.from.includes('orange') || gradient.from.includes('amber') ? 'text-orange-600' :
                    gradient.from.includes('pink') || gradient.from.includes('rose') ? 'text-pink-600' :
                    gradient.from.includes('cyan') || gradient.from.includes('teal') ? 'text-cyan-600' :
                    gradient.from.includes('red') ? 'text-red-600' :
                    gradient.from.includes('yellow') ? 'text-yellow-600' :
                    gradient.from.includes('indigo') ? 'text-indigo-600' :
                    'text-blue-600'
                  }`} />
              ) : (
                <TrendingDown className={`h-3 w-3 ${
                    gradient.from.includes('blue') ? 'text-blue-600' : 
                    gradient.from.includes('purple') || gradient.from.includes('violet') ? 'text-purple-600' :
                    gradient.from.includes('green') || gradient.from.includes('emerald') ? 'text-emerald-600' :
                    gradient.from.includes('orange') || gradient.from.includes('amber') ? 'text-orange-600' :
                    gradient.from.includes('pink') || gradient.from.includes('rose') ? 'text-pink-600' :
                    gradient.from.includes('cyan') || gradient.from.includes('teal') ? 'text-cyan-600' :
                    gradient.from.includes('red') ? 'text-red-600' :
                    gradient.from.includes('yellow') ? 'text-yellow-600' :
                    gradient.from.includes('indigo') ? 'text-indigo-600' :
                    'text-blue-600'
                  }`} />
              )}
              <span className={`text-sm font-bold ${
                gradient.from.includes('blue') ? 'text-blue-600' : 
                gradient.from.includes('purple') || gradient.from.includes('violet') ? 'text-purple-600' :
                gradient.from.includes('green') || gradient.from.includes('emerald') ? 'text-emerald-600' :
                gradient.from.includes('orange') || gradient.from.includes('amber') ? 'text-orange-600' :
                gradient.from.includes('pink') || gradient.from.includes('rose') ? 'text-pink-600' :
                gradient.from.includes('cyan') || gradient.from.includes('teal') ? 'text-cyan-600' :
                gradient.from.includes('red') ? 'text-red-600' :
                gradient.from.includes('yellow') ? 'text-yellow-600' :
                gradient.from.includes('indigo') ? 'text-indigo-600' :
                'text-blue-600'
              }`}>{change.value}</span>
            </div>
          )}
          {additionalInfo && (
            <div className="flex items-center gap-1 justify-end">
              <additionalInfo.icon className={`h-3 w-3 ${
                gradient.from.includes('blue') ? 'text-blue-600' : 
                gradient.from.includes('purple') || gradient.from.includes('violet') ? 'text-purple-600' :
                gradient.from.includes('green') || gradient.from.includes('emerald') ? 'text-emerald-600' :
                gradient.from.includes('orange') || gradient.from.includes('amber') ? 'text-orange-600' :
                gradient.from.includes('pink') || gradient.from.includes('rose') ? 'text-pink-600' :
                gradient.from.includes('cyan') || gradient.from.includes('teal') ? 'text-cyan-600' :
                gradient.from.includes('red') ? 'text-red-600' :
                gradient.from.includes('yellow') ? 'text-yellow-600' :
                gradient.from.includes('indigo') ? 'text-indigo-600' :
                'text-blue-600'
              }`} />
              <span className={`text-sm font-bold ${
                gradient.from.includes('blue') ? 'text-blue-600' : 
                gradient.from.includes('purple') || gradient.from.includes('violet') ? 'text-purple-600' :
                gradient.from.includes('green') || gradient.from.includes('emerald') ? 'text-emerald-600' :
                gradient.from.includes('orange') || gradient.from.includes('amber') ? 'text-orange-600' :
                gradient.from.includes('pink') || gradient.from.includes('rose') ? 'text-pink-600' :
                gradient.from.includes('cyan') || gradient.from.includes('teal') ? 'text-cyan-600' :
                gradient.from.includes('red') ? 'text-red-600' :
                gradient.from.includes('yellow') ? 'text-yellow-600' :
                gradient.from.includes('indigo') ? 'text-indigo-600' :
                'text-blue-600'
              }`}>{additionalInfo.value}</span>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{change?.label || "Active"}</p>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}

// KPI Grid Container
interface KPIGridProps {
  children: React.ReactNode
  className?: string
}

export const KPIGrid = ({ children, className = "" }: KPIGridProps) => {
  return (
    <div className={`grid gap-3 ${className}`}>
      {children}
    </div>
  )
}

// Predefined KPI configurations for easy reuse
export const kpiConfigs = {
  students: {
    title: "Total Students",
    subtitle: "Academic Year 2024-2025",
    icon: Users,
    gradient: { from: "from-blue-600", to: "to-blue-600" },
    sparklineColor: "#ffffff",
    navigationPath: "/superadmin/students"
  },
  teachers: {
    title: "Active Teachers", 
    subtitle: "Currently Online",
    icon: GraduationCap,
    gradient: { from: "from-emerald-600", to: "to-emerald-600" },
    sparklineColor: "#ffffff",
    navigationPath: "/superadmin/teachers"
  },
  sessions: {
    title: "Live Sessions",
    subtitle: "Real-time Activity", 
    icon: Activity,
    gradient: { from: "from-purple-600", to: "to-purple-600" },
    sparklineColor: "#ffffff",
    navigationPath: "/superadmin/system-status"
  },
  subjects: {
    title: "Subjects",
    icon: BookOpen,
    gradient: { from: "from-blue-600/15", to: "to-blue-600/15" },
    sparklineColor: "#3b82f6",
    navigationPath: "/superadmin/overview" // Could be academic management later
  },
  clubs: {
    title: "Clubs", 
    icon: Group,
    gradient: { from: "from-purple-600/15", to: "to-purple-600/15" },
    sparklineColor: "#8b5cf6",
    navigationPath: "/superadmin/overview" // Could be clubs management later
  },
  sections: {
    title: "Sections",
    icon: School, 
    gradient: { from: "from-emerald-600/15", to: "to-emerald-600/15" },
    sparklineColor: "#10b981",
    navigationPath: "/superadmin/students" // Sections are part of student management
  },
  modules: {
    title: "Modules",
    icon: Upload,
    gradient: { from: "from-orange-600/15", to: "to-orange-600/15" },
    sparklineColor: "#ea580c",
    navigationPath: "/superadmin/overview" // Could be content management later
  },
  events: {
    title: "Events",
    icon: CalendarDays,
    gradient: { from: "from-pink-600/15", to: "to-pink-600/15" },
    sparklineColor: "#db2777",
    navigationPath: "/superadmin/overview" // Could be events management later
  },
  galleryViews: {
    title: "Gallery Views", 
    icon: Eye,
    gradient: { from: "from-cyan-600/15", to: "to-cyan-600/15" },
    sparklineColor: "#0891b2",
    navigationPath: "/superadmin/overview" // Could be gallery management later
  }
}
