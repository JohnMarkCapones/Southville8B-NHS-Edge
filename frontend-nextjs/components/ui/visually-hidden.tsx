import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * VisuallyHidden component hides content visually but keeps it accessible to screen readers.
 * This is useful for providing context to screen reader users without cluttering the visual design.
 *
 * @example
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "clip-[rect(0,0,0,0)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Hook version for sr-only class management
 */
export function useSrOnly(isVisible: boolean = false) {
  return isVisible
    ? ""
    : "sr-only focus:not-sr-only"
}
