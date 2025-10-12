"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  disabled?: boolean
  disabledTimes?: string[]
  placeholder?: string
}

export function TimePicker({
  value,
  onChange,
  disabled,
  disabledTimes = [],
  placeholder = "Select time",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Generate time slots (every 30 minutes)
  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, "0")
        const m = minute.toString().padStart(2, "0")
        slots.push(`${h}:${m}`)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid gap-1">
            {timeSlots.map((time) => {
              const isDisabled = disabledTimes.includes(time)
              return (
                <button
                  key={time}
                  onClick={() => !isDisabled && handleTimeSelect(time)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    value === time && "bg-primary text-primary-foreground font-semibold",
                    !isDisabled && value !== time && "hover:bg-accent",
                    isDisabled && "opacity-40 cursor-not-allowed line-through",
                  )}
                >
                  {formatTime(time)}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
