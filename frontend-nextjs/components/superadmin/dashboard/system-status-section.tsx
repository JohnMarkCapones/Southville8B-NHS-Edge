"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Database, HardDriveIcon, AlertCircle, TrendingUp, Users, Zap } from "lucide-react"
import { BackgroundSparkline } from "../sparkline-components"
import { AreaChart, LineChart, ChartContainer } from "./charts"

// Mock system data
const systemMetrics = {
  uptime: 99.9,
  performance: 92.1,
  security: 100,
  database: 98.2
}

const realtimeMetrics = {
  apiResponse: [120, 115, 108, 125, 118, 110, 105, 112, 108, 115, 102, 98, 105, 110, 95, 88],
  userSessions: [45, 52, 48, 61, 55, 67, 59, 72, 68, 75, 71, 78, 74, 82, 79, 85],
  networkTraffic: [2.1, 2.8, 3.2, 2.9, 3.5, 4.1, 3.8, 4.5, 4.2, 3.9, 4.8, 5.2, 4.9, 5.5, 5.1, 5.8],
  cpuUsage: [45, 52, 48, 61, 55, 67, 59, 72, 68, 75, 71, 78, 74, 82, 79, 85],
  memoryUsage: [65, 68, 72, 69, 75, 78, 74, 81, 77, 84, 80, 87, 83, 90, 86, 89],
  errorRate: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.4, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.1, 0.3, 0.2],
  throughput: [850, 920, 880, 950, 910, 980, 940, 1020, 990, 1050, 1010, 1080, 1040, 1110, 1070, 1140]
}

// Circular Gauge Component
const CircularGauge = ({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8, 
  color = "#06b6d4", 
  label, 
  unit = "%" 
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  unit?: string
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const arcLength = circumference * 0.75
  const strokeDasharray = arcLength
  const strokeDashoffset = arcLength - (value / max) * arcLength

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={arcLength}
          strokeDashoffset={0}
          strokeLinecap="round"
          className="text-gray-700 dark:text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}{unit}
        </span>
        {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
      </div>
    </div>
  )
}

export default function SystemStatusSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">System Status</h2>
          <p className="text-muted-foreground mt-1">Real-time system health and performance monitoring</p>
        </div>
      </div>

      {/* Top Row - Main System Metrics with Circular Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold">Database</h3>
                <p className="text-muted-foreground text-sm">Connection Health</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Optimal</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <CircularGauge value={systemMetrics.database} color="#06b6d4" label="Health" />
              <div className="text-right">
                <div className="text-muted-foreground text-xs mb-1">Response Time</div>
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <div className="text-foreground text-sm font-bold mt-1">12ms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold">Server Uptime</h3>
                <p className="text-muted-foreground text-sm">System Availability</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-muted-foreground text-xs">Uptime</div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full shadow-lg shadow-emerald-500/50"
                  style={{ width: `${systemMetrics.uptime}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-bold">{systemMetrics.uptime}%</span>
                <span className="text-muted-foreground">30 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold">Security</h3>
                <p className="text-muted-foreground text-sm">System Protection</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Secure</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-muted-foreground text-xs">Security Score</div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full shadow-lg shadow-orange-500/50"
                  style={{ width: `${systemMetrics.security}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-bold">{systemMetrics.security}%</span>
                <span className="text-muted-foreground">All checks passed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold">Performance</h3>
                <p className="text-muted-foreground text-sm">System Speed</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Excellent</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <CircularGauge value={systemMetrics.performance} color="#8b5cf6" label="Score" />
              <div className="text-right">
                <div className="text-muted-foreground text-xs mb-1">Load Time</div>
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
                <div className="text-foreground text-sm font-bold mt-1">1.2s</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartContainer title="API Response Time" subtitle="Average response time">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-foreground">105ms</div>
            <AreaChart
              data={realtimeMetrics.apiResponse.map((value, index) => ({ time: index, value }))}
              xDataKey="time"
              yDataKey="value"
              height={120}
              areaColor="#3b82f6"
            />
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">-8ms from last hour</span>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Active User Sessions" subtitle="Currently online users">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-foreground">85</div>
            <AreaChart
              data={realtimeMetrics.userSessions.map((value, index) => ({ time: index, value }))}
              xDataKey="time"
              yDataKey="value"
              height={120}
              areaColor="#10b981"
            />
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+12 from last hour</span>
            </div>
          </div>
        </ChartContainer>

        <ChartContainer title="Network Traffic" subtitle="Data transfer rate">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-foreground">5.8 MB/s</div>
            <AreaChart
              data={realtimeMetrics.networkTraffic.map((value, index) => ({ time: index, value }))}
              xDataKey="time"
              yDataKey="value"
              height={120}
              areaColor="#eab308"
            />
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+0.7 MB/s from last hour</span>
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "CPU Usage", value: 85, color: "#ef4444", icon: HardDriveIcon, data: realtimeMetrics.cpuUsage },
          { title: "Memory Usage", value: 89, color: "#f97316", icon: Database, data: realtimeMetrics.memoryUsage },
          { title: "Error Rate", value: 0.2, color: "#10b981", icon: AlertCircle, data: realtimeMetrics.errorRate },
          { title: "Throughput", value: 1140, color: "#3b82f6", icon: Zap, data: realtimeMetrics.throughput, unit: " req/min" }
        ].map((metric, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-foreground font-medium text-sm">{metric.title}</h4>
                  <p className="text-muted-foreground text-xs">Current load</p>
                </div>
                <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
              </div>
              <div className="space-y-3">
                <div className="text-xl font-bold text-foreground">
                  {metric.value}{metric.unit || "%"}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      backgroundColor: metric.color, 
                      width: `${Math.min(metric.value, 100)}%` 
                    }}
                  />
                </div>
                <div className="h-12 relative">
                  <BackgroundSparkline data={metric.data} color={metric.color} opacity={0.6} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Throughput Chart */}
      <ChartContainer title="System Throughput" subtitle="Requests processed per minute">
        <div className="space-y-4">
          <div className="text-3xl font-bold text-foreground">1,140 req/min</div>
          <LineChart
            data={realtimeMetrics.throughput.map((value, index) => ({ 
              time: `${index}:00`, 
              requests: value 
            }))}
            xDataKey="time"
            yDataKey="requests"
            height={200}
            lineColor="#3b82f6"
          />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">+290 req/min from last hour</span>
            </div>
            <span className="text-muted-foreground">Peak: 1,200 req/min</span>
          </div>
        </div>
      </ChartContainer>
    </div>
  )
}
