interface SparklineProps {
  data: number[]
  color?: string
  strokeWidth?: number
}

interface BackgroundSparklineProps {
  data: number[]
  color?: string
  opacity?: number
}

export const Sparkline = ({ data, color = "#ec4899", strokeWidth = 2 }: SparklineProps) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-16 h-8">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline fill={`url(#gradient-${color.replace("#", "")})`} stroke="none" points={`0,100 ${points} 100,100`} />
        <polyline fill="none" stroke={color} strokeWidth={strokeWidth} points={points} />
      </svg>
    </div>
  )
}

export const BackgroundSparkline = ({ data, color = "#ffffff", opacity = 0.2 }: BackgroundSparklineProps) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 60 // Use 60% of height for more subtle effect
      return `${x},${y}`
    })
    .join(" ")

  const fillPath = `M0,100 ${points} L100,100 Z`

  return (
    <div className="absolute inset-0 w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <linearGradient id={`bg-gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={opacity * 0.8} />
            <stop offset="50%" stopColor={color} stopOpacity={opacity * 0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={opacity * 0.1} />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#bg-gradient-${color.replace("#", "")})`} className="drop-shadow-sm" />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity={opacity * 0.6}
          points={points}
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  )
}
