import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The target element ID to skip to
   */
  targetId: string
  /**
   * The text to display in the skip link
   */
  children: React.ReactNode
}

/**
 * SkipLink component provides keyboard navigation shortcuts.
 * These links are hidden until focused, allowing keyboard users to skip repetitive content.
 *
 * @example
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 * <SkipLink targetId="navigation">Skip to navigation</SkipLink>
 */
export function SkipLink({ targetId, children, className, ...props }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only",
        "focus:absolute",
        "focus:top-4",
        "focus:left-4",
        "focus:z-50",
        // Styling
        "bg-blue-600 text-white",
        "px-6 py-3",
        "rounded-lg",
        "font-semibold",
        "shadow-xl",
        // Focus ring
        "focus:ring-4 focus:ring-blue-300",
        "focus:outline-none",
        // Dark mode
        "dark:bg-blue-500 dark:focus:ring-blue-400",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}
