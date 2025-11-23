"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { CalendarIcon, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import {
  isDateInPast,
  isEndDateAfterStartDate,
  getMinDateTime,
  formatDateForInput,
} from "@/lib/utils/date-validation"

interface ValidatedDatePickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  compareWith?: string // For comparing start/end dates
  mode?: "create" | "update" // Create blocks past dates, update allows them
  disabled?: boolean
  className?: string
  placeholder?: string
  required?: boolean
}

export function ValidatedDatePicker({
  label,
  value,
  onChange,
  error,
  compareWith,
  mode = "create",
  disabled = false,
  className,
  placeholder = "Select date and time",
  required = false,
}: ValidatedDatePickerProps) {
  const [showWarning, setShowWarning] = React.useState(false)
  const [warningMessage, setWarningMessage] = React.useState("")
  const [isValid, setIsValid] = React.useState(true)

  // Validate whenever value changes
  React.useEffect(() => {
    if (!value) {
      setShowWarning(false)
      setIsValid(true)
      return
    }

    let warning = ""
    let valid = true

    // Check if date is in the past (only for create mode)
    if (mode === "create" && isDateInPast(value)) {
      warning = "⚠️ This date is in the past. Please select today or a future date."
      valid = false
    }

    // Check if this is an end date that comes before start date
    if (compareWith && !isEndDateAfterStartDate(compareWith, value)) {
      warning = "⚠️ End date must be after start date. Please select a later date."
      valid = false
    }

    setWarningMessage(warning)
    setShowWarning(!!warning)
    setIsValid(valid)
  }, [value, compareWith, mode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  // Get minimum datetime - prevents selecting past dates
  const minDateTime = mode === "create" ? getMinDateTime() : undefined

  // Get maximum datetime for end date validation
  const maxDateTime = compareWith
    ? undefined // No max limit, just must be after start
    : undefined

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          type="datetime-local"
          value={value}
          onChange={handleChange}
          min={minDateTime} // BLOCKS past dates - can't select them!
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full cursor-pointer",
            !isValid && "border-red-500 focus-visible:ring-red-500",
            isValid && value && "border-green-500"
          )}
          step="60" // 1 minute steps
          required={required}
        />

        {/* Validation icon */}
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Warning Alert */}
      {showWarning && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {warningMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {isValid && value && !showWarning && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm text-green-700 dark:text-green-400">
            ✓ Valid date selected
          </AlertDescription>
        </Alert>
      )}

      {/* Error from parent */}
      {error && !showWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Helper text */}
      {mode === "create" && !value && (
        <p className="text-xs text-muted-foreground">
          Past dates are disabled. Select today or a future date.
        </p>
      )}
    </div>
  )
}

// Date Range Picker Component
interface DateRangePickerProps {
  startLabel?: string
  endLabel?: string
  startValue: string
  endValue: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  mode?: "create" | "update"
  disabled?: boolean
  className?: string
  required?: boolean
}

export function DateRangePicker({
  startLabel = "Start Date",
  endLabel = "End Date",
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  mode = "create",
  disabled = false,
  className,
  required = false,
}: DateRangePickerProps) {
  const [rangeError, setRangeError] = React.useState("")

  React.useEffect(() => {
    if (startValue && endValue) {
      if (!isEndDateAfterStartDate(startValue, endValue)) {
        setRangeError("End date must be after start date")
      } else {
        setRangeError("")
      }
    }
  }, [startValue, endValue])

  return (
    <div className={cn("space-y-4", className)}>
      <ValidatedDatePicker
        label={startLabel}
        value={startValue}
        onChange={onStartChange}
        mode={mode}
        disabled={disabled}
        required={required}
      />

      <ValidatedDatePicker
        label={endLabel}
        value={endValue}
        onChange={onEndChange}
        compareWith={startValue}
        mode={mode}
        disabled={disabled}
        required={required}
      />

      {/* Range validation summary */}
      {rangeError && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm font-medium">
            {rangeError}
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator */}
      {startValue && endValue && !rangeError && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm text-green-700 dark:text-green-400">
            ✓ Valid date range selected
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
