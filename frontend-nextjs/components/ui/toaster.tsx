"use client"

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function VariantIcon({ variant }: { variant?: string }) {
  if (variant === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  if (variant === "warning") return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
  if (variant === "destructive") return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  if (variant === "info") return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  return null
}

// Animated progress bar using CSS transitions
function ProgressBar({ duration = 4500 }: { duration?: number }) {
  const [start, setStart] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStart(true), 30) // let it mount then animate
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/20 overflow-hidden">
      <div
        className={cn("h-full bg-white/60 dark:bg-white/70 transition-[width] ease-linear")}
        style={{
          width: start ? "0%" : "100%",
          transitionDuration: `${duration}ms`,
        }}
        aria-hidden="true"
      />
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, duration, variant, ...props }) => (
        <Toast
          key={id}
          variant={variant as any}
          duration={duration}
          icon={<VariantIcon variant={variant as any} />}
          {...props}
        >
          <div className="grid gap-1 pr-6">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ProgressBar duration={duration as number | undefined} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
