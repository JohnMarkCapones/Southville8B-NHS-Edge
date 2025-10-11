"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface ContextMenuContextType {
  isOpen: boolean
  position: { x: number; y: number }
  openMenu: (x: number, y: number) => void
  closeMenu: () => void
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined)

interface ContextMenuProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export function ContextMenu({ children, onOpenChange }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const openMenu = (x: number, y: number) => {
    // Adjust position if menu would go off screen
    const menuWidth = 200 // Approximate menu width
    const menuHeight = 300 // Approximate menu height
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight
    }

    setPosition({ x: adjustedX, y: adjustedY })
    setIsOpen(true)
    onOpenChange?.(true)
  }

  const closeMenu = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    }

    const handleScroll = () => {
      closeMenu()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    const handleResize = () => {
      closeMenu()
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("resize", handleResize)

      // Also listen for scroll on any scrollable parent
      const scrollableParents = []
      let parent = menuRef.current?.parentElement
      while (parent) {
        const style = window.getComputedStyle(parent)
        if (
          style.overflow === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll"
        ) {
          scrollableParents.push(parent)
        }
        parent = parent.parentElement
      }

      scrollableParents.forEach((parent) => {
        parent.addEventListener("scroll", handleScroll, { passive: true })
      })

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("resize", handleResize)
        scrollableParents.forEach((parent) => {
          parent.removeEventListener("scroll", handleScroll)
        })
      }
    }
  }, [isOpen])

  return (
    <ContextMenuContext.Provider value={{ isOpen, position, openMenu, closeMenu }}>
      {children}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            <div className="min-w-[200px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg backdrop-blur-sm">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === ContextMenuContent) {
                  return child
                }
                return null
              })}
            </div>
          </div>,
          document.body,
        )}
    </ContextMenuContext.Provider>
  )
}

interface ContextMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

export function ContextMenuTrigger({ children, className }: ContextMenuTriggerProps) {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error("ContextMenuTrigger must be used within a ContextMenu")
  }

  const { openMenu } = context

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    openMenu(event.clientX, event.clientY)
  }

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
    </div>
  )
}

interface ContextMenuContentProps {
  children: React.ReactNode
}

export function ContextMenuContent({ children }: ContextMenuContentProps) {
  return <>{children}</>
}

interface ContextMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  className?: string
}

export function ContextMenuItem({ children, onClick, disabled, destructive, className }: ContextMenuItemProps) {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error("ContextMenuItem must be used within a ContextMenu")
  }

  const { closeMenu } = context

  const handleClick = () => {
    if (!disabled) {
      onClick?.()
      closeMenu()
    }
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        destructive && !disabled && "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20",
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

interface ContextMenuSeparatorProps {
  className?: string
}

export function ContextMenuSeparator({ className }: ContextMenuSeparatorProps) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />
}

interface ContextMenuSubProps {
  children: React.ReactNode
}

export function ContextMenuSub({ children }: ContextMenuSubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const openSubmenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ x: rect.right, y: rect.top })
      setIsOpen(true)
    }
  }

  const closeSubmenu = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeSubmenu()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === ContextMenuSubTrigger) {
          return React.cloneElement(child, {
            ref: triggerRef,
            onMouseEnter: openSubmenu,
            onMouseLeave: closeSubmenu,
          })
        }
        if (React.isValidElement(child) && child.type === ContextMenuSubContent && isOpen) {
          return createPortal(
            <div
              ref={contentRef}
              className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              style={{
                left: position.x,
                top: position.y,
              }}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={closeSubmenu}
            >
              <div className="min-w-[180px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg backdrop-blur-sm">
                {child}
              </div>
            </div>,
            document.body,
          )
        }
        return null
      })}
    </>
  )
}

interface ContextMenuSubTriggerProps {
  children: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ children, onMouseEnter, onMouseLeave }, ref) => {
    return (
      <div
        ref={ref}
        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
        <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    )
  },
)

ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger"

interface ContextMenuSubContentProps {
  children: React.ReactNode
}

export function ContextMenuSubContent({ children }: ContextMenuSubContentProps) {
  return <>{children}</>
}
