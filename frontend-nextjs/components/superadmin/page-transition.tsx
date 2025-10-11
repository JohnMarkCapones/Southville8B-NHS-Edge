"use client"

import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="h-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  )
}
