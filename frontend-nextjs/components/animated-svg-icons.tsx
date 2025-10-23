export function AnimatedLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#fa709a" />
        </linearGradient>
      </defs>

      {/* Animated book */}
      <rect x="20" y="30" width="60" height="40" rx="4" fill="url(#logoGradient)" className="animate-pulse" />

      {/* Animated flame */}
      <path d="M50 25 C45 20, 45 15, 50 10 C55 15, 55 20, 50 25" fill="#F59E0B" className="animate-bounce" />

      {/* Animated sparkles */}
      <circle cx="25" cy="20" r="2" fill="#F59E0B" className="animate-sparkle" />
      <circle cx="75" cy="25" r="1.5" fill="#10B981" className="animate-sparkle" style={{ animationDelay: "0.5s" }} />
      <circle cx="30" cy="75" r="1" fill="#8B5CF6" className="animate-sparkle" style={{ animationDelay: "1s" }} />
    </svg>
  )
}

export function AnimatedArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 12h14m-7-7l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </svg>
  )
}

export function AnimatedHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill="currentColor"
        className="animate-pulse text-vibrant-pink"
      />
    </svg>
  )
}
