# Chapter 28: Charts & Data Visualization

**Southville 8B NHS Edge - Technical Documentation**
**Volume 4: Feature Documentation**

---

## Table of Contents

- [28.1 Overview](#281-overview)
- [28.2 Recharts Integration](#282-recharts-integration)
- [28.3 Chart Types](#283-chart-types)
- [28.4 Dashboard Visualizations](#284-dashboard-visualizations)
- [28.5 Custom Components](#285-custom-components)
- [28.6 Responsive Design](#286-responsive-design)
- [28.7 Best Practices](#287-best-practices)
- [28.8 Real-World Examples](#288-real-world-examples)

---

## 28.1 Overview

The Southville 8B NHS Edge platform uses Recharts, a composable charting library built on React components, to provide powerful data visualization capabilities across dashboards, analytics pages, and reports.

### Purpose and Goals

Data visualization serves several key purposes:

1. **Insights**: Help users understand complex data at a glance
2. **Tracking**: Monitor student performance, attendance, and engagement
3. **Decision Making**: Provide administrators with actionable insights
4. **Progress Monitoring**: Show students their academic growth over time
5. **Communication**: Present data to parents and stakeholders effectively

### Key Features

- **Multiple Chart Types**: Line, bar, pie, area, composed, and radar charts
- **Interactive**: Hover tooltips, click events, and drill-down capabilities
- **Responsive**: Automatic resizing for all screen sizes
- **Customizable**: Flexible styling and theming options
- **Animated**: Smooth transitions and loading states
- **Accessible**: ARIA labels and keyboard navigation
- **Export Ready**: Charts can be exported as images or PDFs
- **Dark Mode**: Seamless theme integration

### Technology Stack

The visualization system leverages:

- **Recharts**: React-based charting library
- **TypeScript**: Type-safe chart components
- **Tailwind CSS**: Consistent styling
- **React Hooks**: State management for interactivity
- **Lucide Icons**: Chart legends and labels

---

## 28.2 Recharts Integration

Recharts is integrated through reusable chart components with consistent styling and behavior.

### 28.2.1 Installation and Setup

```json
// package.json dependencies
{
  "recharts": "^2.x.x"
}
```

### 28.2.2 Base Chart Components

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\superadmin\dashboard\charts.tsx

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
```

### 28.2.3 Custom Tooltip Component

```typescript
// Custom Tooltip for consistent styling across all charts
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
```

### 28.2.4 Chart Container Component

```typescript
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
```

---

## 28.3 Chart Types

The platform uses several chart types, each optimized for specific data visualization needs.

### 28.3.1 Pie Chart

Ideal for showing proportions and percentages.

```typescript
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

// Usage Example: Grade Distribution
function GradeDistributionChart() {
  const data = [
    { name: 'A', value: 45 },
    { name: 'B', value: 78 },
    { name: 'C', value: 34 },
    { name: 'D', value: 12 },
    { name: 'F', value: 5 },
  ]

  return (
    <ChartContainer title="Grade Distribution" subtitle="Current semester">
      <PieChart
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={60}
        outerRadius={100}
        showLegend={true}
      />
    </ChartContainer>
  )
}
```

### 28.3.2 Bar Chart

Perfect for comparing values across categories.

```typescript
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

// Usage Example: Monthly Attendance
function AttendanceChart() {
  const data = [
    { month: 'Jan', attendance: 95 },
    { month: 'Feb', attendance: 93 },
    { month: 'Mar', attendance: 97 },
    { month: 'Apr', attendance: 92 },
    { month: 'May', attendance: 96 },
  ]

  return (
    <ChartContainer title="Monthly Attendance" subtitle="Average attendance rate">
      <BarChart
        data={data}
        xDataKey="month"
        yDataKey="attendance"
        barColor="#10b981"
      />
    </ChartContainer>
  )
}
```

### 28.3.3 Line Chart

Excellent for showing trends over time.

```typescript
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

// Usage Example: Student Performance Trend
function PerformanceTrendChart() {
  const data = [
    { quarter: 'Q1', average: 85 },
    { quarter: 'Q2', average: 87 },
    { quarter: 'Q3', average: 89 },
    { quarter: 'Q4', average: 91 },
  ]

  return (
    <ChartContainer title="Performance Trend" subtitle="Quarterly average grades">
      <LineChart
        data={data}
        xDataKey="quarter"
        yDataKey="average"
        lineColor="#8b5cf6"
      />
    </ChartContainer>
  )
}
```

### 28.3.4 Area Chart

Similar to line charts but with filled area below the line.

```typescript
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

// Usage Example: Activity Over Time
function ActivityChart() {
  const data = [
    { week: 'W1', activities: 12 },
    { week: 'W2', activities: 15 },
    { week: 'W3', activities: 18 },
    { week: 'W4', activities: 14 },
  ]

  return (
    <ChartContainer title="Student Activities" subtitle="Weekly participation">
      <AreaChart
        data={data}
        xDataKey="week"
        yDataKey="activities"
        areaColor="#06b6d4"
      />
    </ChartContainer>
  )
}
```

### 28.3.5 Multi-Line Chart

Compare multiple data series on the same chart.

```typescript
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

// Usage Example: Subject Performance Comparison
function SubjectComparisonChart() {
  const data = [
    { month: 'Jan', math: 85, science: 82, english: 88 },
    { month: 'Feb', math: 87, science: 85, english: 90 },
    { month: 'Mar', math: 89, science: 87, english: 89 },
    { month: 'Apr', math: 91, science: 90, english: 92 },
  ]

  return (
    <ChartContainer
      title="Subject Performance"
      subtitle="Monthly comparison across subjects"
    >
      <MultiLineChart
        data={data}
        xDataKey="month"
        lines={[
          { dataKey: 'math', color: '#3b82f6', name: 'Mathematics' },
          { dataKey: 'science', color: '#10b981', name: 'Science' },
          { dataKey: 'english', color: '#f59e0b', name: 'English' },
        ]}
      />
    </ChartContainer>
  )
}
```

---

## 28.4 Dashboard Visualizations

Real-world dashboard implementations using the chart components.

### 28.4.1 Student Dashboard

```typescript
// Student Dashboard with multiple visualizations

export function StudentDashboard() {
  // Grade distribution data
  const gradeData = [
    { subject: 'Math', grade: 92 },
    { subject: 'Science', grade: 88 },
    { subject: 'English', grade: 95 },
    { subject: 'History', grade: 85 },
    { subject: 'PE', grade: 90 },
  ]

  // Performance trend data
  const trendData = [
    { quarter: 'Q1', gpa: 3.5 },
    { quarter: 'Q2', gpa: 3.7 },
    { quarter: 'Q3', gpa: 3.8 },
    { quarter: 'Q4', gpa: 3.9 },
  ]

  // Attendance data
  const attendanceData = [
    { status: 'Present', value: 95 },
    { status: 'Absent', value: 3 },
    { status: 'Late', value: 2 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Grades */}
        <ChartContainer
          title="Current Grades"
          subtitle="Grades by subject"
        >
          <BarChart
            data={gradeData}
            xDataKey="subject"
            yDataKey="grade"
            barColor="#3b82f6"
            height={300}
          />
        </ChartContainer>

        {/* GPA Trend */}
        <ChartContainer
          title="GPA Trend"
          subtitle="Quarterly progress"
        >
          <LineChart
            data={trendData}
            xDataKey="quarter"
            yDataKey="gpa"
            lineColor="#10b981"
            height={300}
          />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance */}
        <ChartContainer
          title="Attendance"
          subtitle="This semester"
        >
          <PieChart
            data={attendanceData}
            dataKey="value"
            nameKey="status"
            showLegend={true}
            height={250}
          />
        </ChartContainer>

        {/* Add more visualizations */}
      </div>
    </div>
  )
}
```

### 28.4.2 Teacher Dashboard

```typescript
// Teacher Dashboard with class analytics

export function TeacherDashboard() {
  // Class performance data
  const classPerformanceData = [
    { class: 'Math 101', average: 85 },
    { class: 'Math 102', average: 88 },
    { class: 'Math 201', average: 82 },
    { class: 'Math 202', average: 90 },
  ]

  // Grade distribution
  const gradeDistribution = [
    { grade: 'A', count: 35 },
    { grade: 'B', count: 45 },
    { grade: 'C', count: 28 },
    { grade: 'D', count: 12 },
    { grade: 'F', count: 5 },
  ]

  // Assignment completion
  const completionData = [
    { week: 'W1', completed: 92 },
    { week: 'W2', completed: 88 },
    { week: 'W3', completed: 95 },
    { week: 'W4', completed: 90 },
  ]

  return (
    <div className="space-y-6">
      {/* Class Performance */}
      <ChartContainer
        title="Class Performance"
        subtitle="Average grades by class"
      >
        <BarChart
          data={classPerformanceData}
          xDataKey="class"
          yDataKey="average"
          barColor="#8b5cf6"
          height={350}
        />
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <ChartContainer
          title="Grade Distribution"
          subtitle="All classes combined"
        >
          <PieChart
            data={gradeDistribution}
            dataKey="count"
            nameKey="grade"
            showLegend={true}
            height={300}
          />
        </ChartContainer>

        {/* Assignment Completion */}
        <ChartContainer
          title="Assignment Completion"
          subtitle="Weekly completion rates"
        >
          <AreaChart
            data={completionData}
            xDataKey="week"
            yDataKey="completed"
            areaColor="#10b981"
            height={300}
          />
        </ChartContainer>
      </div>
    </div>
  )
}
```

### 28.4.3 Admin Dashboard

```typescript
// Admin Dashboard with school-wide analytics

export function AdminDashboard() {
  // Enrollment trends
  const enrollmentData = [
    { year: '2020', students: 1050 },
    { year: '2021', students: 1120 },
    { year: '2022', students: 1200 },
    { year: '2023', students: 1280 },
    { year: '2024', students: 1350 },
  ]

  // Department performance
  const departmentData = [
    { department: 'STEM', average: 88 },
    { department: 'HUMSS', average: 85 },
    { department: 'ABM', average: 87 },
    { department: 'TVL', average: 84 },
  ]

  // Student distribution
  const distributionData = [
    { grade: 'Grade 7', count: 280 },
    { grade: 'Grade 8', count: 270 },
    { grade: 'Grade 9', count: 265 },
    { grade: 'Grade 10', count: 260 },
    { grade: 'Grade 11', count: 140 },
    { grade: 'Grade 12', count: 135 },
  ]

  return (
    <div className="space-y-6">
      {/* Enrollment Trend */}
      <ChartContainer
        title="Enrollment Trend"
        subtitle="Student population growth"
      >
        <AreaChart
          data={enrollmentData}
          xDataKey="year"
          yDataKey="students"
          areaColor="#3b82f6"
          height={350}
        />
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <ChartContainer
          title="Department Performance"
          subtitle="Average grades by department"
        >
          <BarChart
            data={departmentData}
            xDataKey="department"
            yDataKey="average"
            barColor="#f59e0b"
            height={300}
          />
        </ChartContainer>

        {/* Student Distribution */}
        <ChartContainer
          title="Student Distribution"
          subtitle="Students by grade level"
        >
          <PieChart
            data={distributionData}
            dataKey="count"
            nameKey="grade"
            showLegend={true}
            height={300}
          />
        </ChartContainer>
      </div>
    </div>
  )
}
```

---

## 28.5 Custom Components

Advanced chart components for specific use cases.

### 28.5.1 Stat Card with Mini Chart

```typescript
// Stat card combining metrics with mini visualization

interface StatCardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  chartData: any[]
  chartType: 'line' | 'bar' | 'area'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  chartData,
  chartType,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>

      {/* Mini chart */}
      <div className="h-16 mb-2">
        {chartType === 'line' && (
          <LineChart
            data={chartData}
            xDataKey="x"
            yDataKey="y"
            lineColor={color}
            showGrid={false}
            showDots={false}
            height={64}
          />
        )}
        {chartType === 'bar' && (
          <BarChart
            data={chartData}
            xDataKey="x"
            yDataKey="y"
            barColor={color}
            showGrid={false}
            height={64}
          />
        )}
        {chartType === 'area' && (
          <AreaChart
            data={chartData}
            xDataKey="x"
            yDataKey="y"
            areaColor={color}
            showGrid={false}
            height={64}
          />
        )}
      </div>

      {/* Change indicator */}
      <div className="flex items-center gap-2">
        <Badge
          variant={change >= 0 ? "success" : "destructive"}
          className="text-xs"
        >
          {change >= 0 ? '+' : ''}{change}%
        </Badge>
        <span className="text-xs text-muted-foreground">{changeLabel}</span>
      </div>
    </Card>
  )
}
```

### 28.5.2 Comparison Chart

```typescript
// Side-by-side comparison chart

interface ComparisonChartProps {
  data: any[]
  xDataKey: string
  leftDataKey: string
  rightDataKey: string
  leftLabel: string
  rightLabel: string
  leftColor?: string
  rightColor?: string
}

export function ComparisonChart({
  data,
  xDataKey,
  leftDataKey,
  rightDataKey,
  leftLabel,
  rightLabel,
  leftColor = "#3b82f6",
  rightColor = "#ef4444",
}: ComparisonChartProps) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <RechartsBarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" />
          <YAxis dataKey={xDataKey} type="category" width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={leftDataKey} fill={leftColor} name={leftLabel} />
          <Bar dataKey={rightDataKey} fill={rightColor} name={rightLabel} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### 28.5.3 Progress Ring Chart

```typescript
// Circular progress indicator

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "#3b82f6",
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{percentage}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}
```

---

## 28.6 Responsive Design

Ensure charts work perfectly on all screen sizes.

### 28.6.1 Responsive Container

```typescript
// All charts use ResponsiveContainer for automatic resizing
<ResponsiveContainer width="100%" height="100%">
  <RechartsLineChart data={data}>
    {/* Chart components */}
  </RechartsLineChart>
</ResponsiveContainer>
```

### 28.6.2 Breakpoint-Specific Layouts

```typescript
// Adjust chart layout based on screen size

function ResponsiveDashboard() {
  return (
    <div className="space-y-6">
      {/* Full width on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Chart 1">
          <LineChart {...props} />
        </ChartContainer>
        <ChartContainer title="Chart 2">
          <BarChart {...props} />
        </ChartContainer>
      </div>

      {/* 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard {...props} />
        <StatCard {...props} />
        <StatCard {...props} />
      </div>
    </div>
  )
}
```

### 28.6.3 Mobile Optimizations

```typescript
// Adjust chart settings for mobile
const isMobile = useMediaQuery('(max-width: 768px)')

<LineChart
  data={data}
  xDataKey="date"
  yDataKey="value"
  height={isMobile ? 250 : 400}
  showDots={!isMobile}  // Hide dots on mobile for cleaner look
  strokeWidth={isMobile ? 2 : 3}
/>
```

---

## 28.7 Best Practices

### 28.7.1 Performance Optimization

```typescript
// 1. Memoize chart data
const chartData = useMemo(() => {
  return processData(rawData)
}, [rawData])

// 2. Limit data points for large datasets
const limitedData = useMemo(() => {
  if (data.length > 100) {
    // Sample every nth point
    return data.filter((_, index) => index % Math.ceil(data.length / 100) === 0)
  }
  return data
}, [data])

// 3. Use animation sparingly
<Bar
  dataKey="value"
  animationDuration={300}  // Shorter duration
  isAnimationActive={true}
/>
```

### 28.7.2 Accessibility

```typescript
// Add ARIA labels and descriptions
<ChartContainer
  title="Student Performance"
  aria-label="Bar chart showing student performance by subject"
>
  <BarChart data={data} {...props} />
</ChartContainer>

// Provide text alternatives
<div>
  <BarChart data={data} {...props} />
  <div className="sr-only">
    {data.map(item => (
      <p key={item.subject}>
        {item.subject}: {item.grade}%
      </p>
    ))}
  </div>
</div>
```

### 28.7.3 Color Consistency

```typescript
// Define color palette
const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
}

// Use consistently across charts
<BarChart data={data} barColor={CHART_COLORS.primary} />
<LineChart data={data} lineColor={CHART_COLORS.success} />
```

### 28.7.4 Loading States

```typescript
// Show skeleton while loading
function ChartWithLoading({ isLoading, data }: Props) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Card>
    )
  }

  return (
    <ChartContainer title="Data">
      <LineChart data={data} {...props} />
    </ChartContainer>
  )
}
```

---

## 28.8 Real-World Examples

### 28.8.1 Student Progress Tracker

```typescript
// Complete implementation of student progress tracking

export function StudentProgressTracker({ studentId }: { studentId: string }) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchProgressData(studentId, timeRange)
      .then(setData)
      .finally(() => setLoading(false))
  }, [studentId, timeRange])

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <ChartContainer
      title="Academic Progress"
      subtitle="Track your performance over time"
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      }
    >
      <MultiLineChart
        data={data}
        xDataKey="period"
        lines={[
          { dataKey: 'math', color: '#3b82f6', name: 'Mathematics' },
          { dataKey: 'science', color: '#10b981', name: 'Science' },
          { dataKey: 'english', color: '#f59e0b', name: 'English' },
          { dataKey: 'history', color: '#8b5cf6', name: 'History' },
        ]}
        height={400}
      />
    </ChartContainer>
  )
}
```

### 28.8.2 Class Analytics Dashboard

```typescript
// Teacher's view of class performance

export function ClassAnalyticsDashboard({ classId }: { classId: string }) {
  const analytics = useClassAnalytics(classId)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Average Grade"
          value={`${analytics.averageGrade}%`}
          change={analytics.gradeChange}
          changeLabel="vs last period"
          chartData={analytics.gradeTrend}
          chartType="line"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Attendance Rate"
          value={`${analytics.attendanceRate}%`}
          change={analytics.attendanceChange}
          changeLabel="vs last period"
          chartData={analytics.attendanceTrend}
          chartType="area"
          icon={Users}
          color="green"
        />
        {/* More stat cards */}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Grade Distribution"
          subtitle="Current grading period"
        >
          <PieChart
            data={analytics.gradeDistribution}
            dataKey="count"
            nameKey="grade"
            showLegend={true}
            height={300}
          />
        </ChartContainer>

        <ChartContainer
          title="Assignment Completion"
          subtitle="Weekly completion rates"
        >
          <BarChart
            data={analytics.completionRates}
            xDataKey="week"
            yDataKey="rate"
            barColor="#10b981"
            height={300}
          />
        </ChartContainer>
      </div>
    </div>
  )
}
```

---

## Summary

The charts and data visualization system provides powerful analytics capabilities for the Southville 8B NHS Edge platform. Key features include:

- **Comprehensive Chart Library**: Multiple chart types for various data visualization needs
- **Reusable Components**: Modular, type-safe components that can be used throughout the application
- **Responsive Design**: Charts automatically adapt to all screen sizes
- **Customizable**: Flexible styling and configuration options
- **Performance Optimized**: Efficient rendering even with large datasets
- **Accessible**: ARIA labels and keyboard navigation support
- **Interactive**: Tooltips, legends, and drill-down capabilities
- **Theme-Aware**: Seamless dark mode integration

The visualization system empowers teachers, students, and administrators to make data-driven decisions and track progress effectively.

---

**Navigation:**
- [← Previous: Tiptap Rich Text Editor](./27-tiptap-editor.md)
- [↑ Back to Volume 4 Index](./README.md)
- [← Back to Manual Index](../README.md)
