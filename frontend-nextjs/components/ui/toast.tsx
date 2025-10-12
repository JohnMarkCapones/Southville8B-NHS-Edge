"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed z-[100] top-2 right-2 flex max-h-screen w-full max-w-[420px] flex-col gap-2 p-2",
      "sm:bottom-2 sm:right-2 sm:top-auto",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  cn(
    "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-xl border p-4 pr-10 shadow-xl transition-all",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
    "backdrop-blur supports-[backdrop-filter]:backdrop-blur",
  ),
  {
    variants: {
      variant: {
        default:
          "border-slate-200/60 bg-white/80 text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100",
        success:
          "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-600/15 text-emerald-900 dark:text-emerald-100",
        warning:
          "border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-600/15 text-amber-900 dark:text-amber-100",
        info: "border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-slate-900 dark:text-slate-100",
        destructive:
          "border-red-500/30 bg-gradient-to-br from-red-500/15 to-rose-500/15 text-red-900 dark:text-red-100",
      },
      elevated: {
        true: "ring-1 ring-white/40 dark:ring-slate-800/40",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      elevated: true,
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      icon?: React.ReactNode
      duration?: number
    }
>(({ className, variant, elevated, icon, ...props }, ref) => {
  return (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant, elevated }), className)} {...props}>
      {/* Decorative gradient strip */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          variant === "success" && "bg-gradient-to-b from-emerald-400 to-emerald-600",
          variant === "warning" && "bg-gradient-to-b from-amber-400 to-amber-600",
          variant === "info" && "bg-gradient-to-b from-blue-500 to-indigo-600",
          variant === "destructive" && "bg-gradient-to-b from-red-500 to-rose-600",
          variant === "default" && "bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600",
        )}
      />
      {/* Icon slot */}
      {icon && <div className="mt-0.5 ml-1">{icon}</div>}
      <div className="grid gap-1">{props.children}</div>
      <ToastPrimitives.Close
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-foreground/60 transition-opacity hover:text-foreground focus:outline-none focus:ring-2 group-hover:opacity-100",
        )}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium",
      "ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
}
