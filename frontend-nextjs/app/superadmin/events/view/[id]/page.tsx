"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Star,
  HelpCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  Archive,
  StarOff,
  Globe,
  Lock,
  FileEdit,
  Clock,
  User,
  Loader2,
} from "lucide-react"
import { getEventById, updateEvent, archiveEvent } from "@/lib/api/endpoints/events"
import type { Event } from "@/lib/api/types/events"
import { EventStatus, EventVisibility } from "@/lib/api/types/events"
import {
  EventScheduleTimeline,
  EventFAQAccordion,
  EventHighlightsShowcase,
  EventAdditionalInfoComponent
} from "@/components/events"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function EventViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const eventId = params.id as string
        const eventData = await getEventById(eventId)
        if (eventData) {
          setEvent(eventData)
        } else {
          setError("Event not found")
        }
      } catch (err) {
        console.error("Failed to fetch event:", err)
        setError("Failed to load event details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  const handleToggleFeatured = async () => {
    if (!event) return

    setIsUpdating(true)
    try {
      const updated = await updateEvent(event.id, { is_featured: !event.is_featured })
      setEvent(updated)
      toast({
        title: "Success",
        description: `Event ${updated.is_featured ? "featured" : "unfeatured"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangeStatus = async (status: EventStatus) => {
    if (!event) return

    setIsUpdating(true)
    try {
      const updated = await updateEvent(event.id, { status })
      setEvent(updated)
      toast({
        title: "Success",
        description: `Event status changed to ${status}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangeVisibility = async (visibility: EventVisibility) => {
    if (!event) return

    setIsUpdating(true)
    try {
      const updated = await updateEvent(event.id, { visibility })
      setEvent(updated)
      toast({
        title: "Success",
        description: `Event visibility changed to ${visibility}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event visibility",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleArchive = async () => {
    if (!event || isUpdating) return // Prevent double-clicks

    if (!confirm("Are you sure you want to archive this event?")) return

    setIsUpdating(true)
    try {
      await archiveEvent(event.id)
      toast({
        title: "Success",
        description: "Event archived successfully",
      })
      // Redirect after a short delay to ensure toast is visible
      setTimeout(() => {
        router.push("/superadmin/events")
      }, 500)
    } catch (error) {
      console.error("Archive error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive event",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: EventStatus) => {
    const variants: Record<EventStatus, { color: string; label: string }> = {
      [EventStatus.DRAFT]: { color: "bg-gray-500", label: "Draft" },
      [EventStatus.PUBLISHED]: { color: "bg-green-500", label: "Published" },
      [EventStatus.CANCELLED]: { color: "bg-red-500", label: "Cancelled" },
      [EventStatus.COMPLETED]: { color: "bg-blue-500", label: "Completed" },
    }
    const variant = variants[status] || variants[EventStatus.DRAFT]
    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.label}
      </Badge>
    )
  }

  const getVisibilityBadge = (visibility: EventVisibility) => {
    return visibility === EventVisibility.PUBLIC ? (
      <Badge variant="outline" className="border-green-500 text-green-500">
        <Globe className="w-3 h-3 mr-1" />
        Public
      </Badge>
    ) : (
      <Badge variant="outline" className="border-orange-500 text-orange-500">
        <Lock className="w-3 h-3 mr-1" />
        Private
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Loading Event...</h1>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || "The event you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/superadmin/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/superadmin/events")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/superadmin/events/edit/${event.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Event
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isUpdating}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleToggleFeatured}>
                {event.is_featured ? (
                  <>
                    <StarOff className="w-4 h-4 mr-2" />
                    Unfeature Event
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Feature Event
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleChangeStatus(EventStatus.PUBLISHED)}>
                <FileEdit className="w-4 h-4 mr-2" />
                Set as Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeStatus(EventStatus.DRAFT)}>
                <FileEdit className="w-4 h-4 mr-2" />
                Set as Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeStatus(EventStatus.COMPLETED)}>
                <FileEdit className="w-4 h-4 mr-2" />
                Set as Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeStatus(EventStatus.CANCELLED)}>
                <FileEdit className="w-4 h-4 mr-2" />
                Set as Cancelled
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleChangeVisibility(EventVisibility.PUBLIC)}>
                <Globe className="w-4 h-4 mr-2" />
                Make Public
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeVisibility(EventVisibility.PRIVATE)}>
                <Lock className="w-4 h-4 mr-2" />
                Make Private
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleArchive}
                className="text-red-600"
                disabled={isUpdating}
              >
                <Archive className="w-4 h-4 mr-2" />
                {isUpdating ? "Archiving..." : "Archive Event"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Event Image */}
      {event.eventImage && (
        <div className="mb-8">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <Image
              src={event.eventImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            {event.is_featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {getStatusBadge(event.status)}
          {getVisibilityBadge(event.visibility)}
          {event.is_featured && !event.eventImage && (
            <Badge className="bg-yellow-500 text-black">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

        {event.description && (
          <p className="text-lg text-muted-foreground mb-6">
            {event.description}
          </p>
        )}

        {/* Event Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{format(new Date(event.date), "PPP")}</p>
              </div>
            </CardContent>
          </Card>

          {event.time && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {event.location && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {event.organizer && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                  <p className="font-semibold">{event.organizer.full_name}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-8">
        {/* Highlights */}
        {Array.isArray(event.highlights) && event.highlights.length > 0 && (
          <EventHighlightsShowcase highlights={event.highlights} />
        )}

        {/* Schedule */}
        {Array.isArray(event.schedule) && event.schedule.length > 0 && (
          <EventScheduleTimeline schedule={event.schedule} />
        )}

        {/* Additional Info */}
        {Array.isArray(event.additionalInfo) && event.additionalInfo.length > 0 && (
          <EventAdditionalInfoComponent additionalInfo={event.additionalInfo} />
        )}

        {/* FAQ */}
        {Array.isArray(event.faq) && event.faq.length > 0 && (
          <EventFAQAccordion faqs={event.faq} />
        )}
      </div>

      {/* Event Tags */}
      {event.tags && event.tags.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
