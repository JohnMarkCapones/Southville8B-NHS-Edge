"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DateRangePicker } from "@/components/ui/validated-date-picker"
import { useBannerMutations } from "@/hooks/useBanners"
import { validateDateRange } from "@/lib/utils/date-validation"
import { Plus, AlertCircle, Loader2 } from "lucide-react"

// Validation schema
const bannerSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  shortMessage: z.string().min(5, "Short message must be at least 5 characters"),
  type: z.enum(["info", "success", "warning", "destructive"]),
  isActive: z.boolean().default(false),
  isDismissible: z.boolean().default(true),
  hasAction: z.boolean().default(false),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  template: z.string().optional(),
}).refine(
  (data) => {
    const error = validateDateRange(data.startDate, data.endDate)
    return !error
  },
  {
    message: "Invalid date range",
    path: ["endDate"],
  }
)

type BannerFormData = z.infer<typeof bannerSchema>

interface CreateBannerDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CreateBannerDialog({ trigger, onSuccess }: CreateBannerDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [hasAction, setHasAction] = React.useState(false)

  const { createMutation } = useBannerMutations()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      type: "info",
      isActive: false,
      isDismissible: true,
      hasAction: false,
    },
  })

  // Watch form values
  const watchType = watch("type")
  const watchIsActive = watch("isActive")
  const watchIsDismissible = watch("isDismissible")

  // Sync state with form
  React.useEffect(() => {
    setValue("startDate", startDate)
  }, [startDate, setValue])

  React.useEffect(() => {
    setValue("endDate", endDate)
  }, [endDate, setValue])

  React.useEffect(() => {
    setValue("hasAction", hasAction)
  }, [hasAction, setValue])

  const onSubmit = async (data: BannerFormData) => {
    try {
      await createMutation.mutateAsync(data)
      setOpen(false)
      reset()
      setStartDate("")
      setEndDate("")
      setHasAction(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error creating banner:", error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setStartDate("")
      setEndDate("")
      setHasAction(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Banner
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Banner Notification</DialogTitle>
          <DialogDescription>
            Create a banner notification that will appear at the top of the page.
            Make sure to select valid dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Full Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Enter the full banner message..."
              className="min-h-[100px]"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Short Message */}
          <div className="space-y-2">
            <Label htmlFor="shortMessage">
              Short Message <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shortMessage"
              placeholder="Brief summary for compact display"
              {...register("shortMessage")}
            />
            {errors.shortMessage && (
              <p className="text-sm text-red-500">{errors.shortMessage.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Banner Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchType}
              onValueChange={(value) => setValue("type", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info (Blue)</SelectItem>
                <SelectItem value="success">Success (Green)</SelectItem>
                <SelectItem value="warning">Warning (Orange)</SelectItem>
                <SelectItem value="destructive">Urgent (Red)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker with Validation */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Schedule (Important!)
              </h3>
            </div>
            <DateRangePicker
              startLabel="Start Date & Time"
              endLabel="End Date & Time"
              startValue={startDate}
              endValue={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              mode="create"
              required
            />
          </div>

          {/* Settings */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Settings</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Banner will be visible immediately
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watchIsActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isDismissible">Dismissible</Label>
                <p className="text-sm text-muted-foreground">
                  Users can close the banner
                </p>
              </div>
              <Switch
                id="isDismissible"
                checked={watchIsDismissible}
                onCheckedChange={(checked) => setValue("isDismissible", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasAction">Add Action Button</Label>
                <p className="text-sm text-muted-foreground">
                  Include a button with link
                </p>
              </div>
              <Switch
                id="hasAction"
                checked={hasAction}
                onCheckedChange={setHasAction}
              />
            </div>
          </div>

          {/* Action Fields (conditional) */}
          {hasAction && (
            <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
              <h3 className="font-semibold">Action Button</h3>

              <div className="space-y-2">
                <Label htmlFor="actionLabel">Button Label</Label>
                <Input
                  id="actionLabel"
                  placeholder="Read More"
                  {...register("actionLabel")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionUrl">Button URL</Label>
                <Input
                  id="actionUrl"
                  placeholder="/news/article"
                  {...register("actionUrl")}
                />
              </div>
            </div>
          )}

          {/* Template (optional) */}
          <div className="space-y-2">
            <Label htmlFor="template">Template (Optional)</Label>
            <Input
              id="template"
              placeholder="e.g., Weather Alert, Event Reminder"
              {...register("template")}
            />
            <p className="text-xs text-muted-foreground">
              Save as template for future use
            </p>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Banner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
