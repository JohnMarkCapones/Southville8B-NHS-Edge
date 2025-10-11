"use client"

import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

// Base chart interfaces
interface BaseChartProps {
  data: any[]
  height?: number
  className?: string
  showTooltip?: boolean
  showGrid?: boolean
}

interface PieChartProps extends BaseChartProps {
  dataKey: string
  nameKey?: string
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
  showLegend?: boolean
}

interface BarChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  barColor?: string
  barRadius?: [number, number, number, number]
}

interface LineChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  lineColor?: string
  strokeWidth?: number
  showDots?: boolean
  dotSize?: number
}

interface AreaChartProps extends BaseChartProps {
  xDataKey: string
  yDataKey: string
  areaColor?: string
  gradient?: {
    start: string
    end: string
  }
}

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {formatter ? formatter(entry.value, entry.name) : `${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Reusable Pie Chart Component
export const PieChart = ({
  data,
  dataKey,
  nameKey = "name",
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
  showTooltip = true,
  showLegend = false,
  className = ""
}: PieChartProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Reusable Bar Chart Component
export const BarChart = ({
  data,
  xDataKey,
  yDataKey,
  height = 300,
  barColor = "#3b82f6",
  barRadius = [4, 4, 0, 0],
  showTooltip = true,
  showGrid = true,
  className = ""
}: BarChartProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey={xDataKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Bar 
            dataKey={yDataKey} 
            fill={barColor} 
            radius={barRadius}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Reusable Line Chart Component  
export const LineChart = ({
  data,
  xDataKey,
  yDataKey,
  height = 300,
  lineColor = "#3b82f6",
  strokeWidth = 3,
  showDots = true,
  dotSize = 5,
  showTooltip = true,
  showGrid = true,
  className = ""
}: LineChartProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey={xDataKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Line
            type="monotone"
            dataKey={yDataKey}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: lineColor, strokeWidth: 2, r: dotSize } : false}
            activeDot={{ r: dotSize + 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Reusable Area Chart Component
export const AreaChart = ({
  data,
  xDataKey,
  yDataKey,
  height = 300,
  areaColor = "#3b82f6",
  gradient = { start: "#3b82f6", end: "#3b82f620" },
  showTooltip = true,
  showGrid = true,
  className = ""
}: AreaChartProps) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradient.start} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={gradient.end} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey={xDataKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Area
            type="monotone"
            dataKey={yDataKey}
            stroke={areaColor}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart Container with consistent styling
interface ChartContainerProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export const ChartContainer = ({ 
  title, 
  subtitle, 
  children, 
  className = "",
  actions 
}: ChartContainerProps) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// Multi-line Chart Component for complex data
interface MultiLineChartProps extends BaseChartProps {
  xDataKey: string
  lines: Array<{
    dataKey: string
    color: string
    name?: string
    strokeWidth?: number
  }>
}

export const MultiLineChart = ({
  data,
  xDataKey,
  lines,
  height = 300,
  showTooltip = true,
  showGrid = true,
  className = ""
}: MultiLineChartProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey={xDataKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              name={line.name || line.dataKey}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
