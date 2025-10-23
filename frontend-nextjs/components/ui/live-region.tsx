"use client"

import * as React from "react"
import { VisuallyHidden } from "./visually-hidden"

type LiveRegionProps = {
  /**
   * The message to announce to screen readers
   */
  message: string
  /**
   * Priority of the announcement
   * - 'polite': Wait for user to finish current action (default)
   * - 'assertive': Interrupt immediately
   */
  priority?: "polite" | "assertive"
  /**
   * Whether to clear previous messages before announcing new one
   */
  atomic?: boolean
  /**
   * Whether to show the message visually as well
   */
  visible?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * LiveRegion component announces dynamic content changes to screen readers.
 * Use this for loading states, success messages, errors, etc.
 *
 * @example
 * // Loading state
 * <LiveRegion message={isLoading ? "Loading content..." : "Content loaded"} />
 *
 * @example
 * // Error message (urgent)
 * <LiveRegion message={error} priority="assertive" visible />
 */
export function LiveRegion({
  message,
  priority = "polite",
  atomic = true,
  visible = false,
  className,
}: LiveRegionProps) {
  if (!message) return null

  const Wrapper = visible ? "div" : VisuallyHidden

  return (
    <Wrapper
      role={priority === "assertive" ? "alert" : "status"}
      aria-live={priority}
      aria-atomic={atomic}
      className={className}
    >
      {message}
    </Wrapper>
  )
}

/**
 * Hook for managing live region announcements
 */
export function useLiveAnnouncer() {
  const [message, setMessage] = React.useState("")
  const [priority, setPriority] = React.useState<"polite" | "assertive">("polite")

  const announce = React.useCallback((msg: string, urgent = false) => {
    setMessage(msg)
    setPriority(urgent ? "assertive" : "polite")

    // Clear message after announcement to allow re-announcing same message
    setTimeout(() => setMessage(""), 100)
  }, [])

  return {
    message,
    priority,
    announce,
    LiveRegion: () => <LiveRegion message={message} priority={priority} />,
  }
}
