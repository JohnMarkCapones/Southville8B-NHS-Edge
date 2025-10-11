"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Bell,
  ArrowLeft,
  Star,
  Award,
  Camera,
  FileText,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Globe,
  Download,
} from "lucide-react"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasNotification, setHasNotification] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock event data - in real app, this would be fetched based on slug
  const eventData = {
    id: 1,
    title: "Science Fair 2024",
    slug: "science-fair-2024",
    date: "2025-03-15",
    time: "9:00 AM - 4:00 PM",
    location: "Main Auditorium",
    category: "academic",
    description:
      "Annual science fair showcasing student projects and innovations with university judges. This is a premier event where students demonstrate their scientific research, creativity, and problem-solving skills.",
    fullDescription:
      "Join us for the most anticipated academic event of the year! The Science Fair 2024 brings together brilliant minds from across our school to showcase innovative projects spanning multiple scientific disciplines. From environmental solutions to technological breakthroughs, witness the future of science unfold before your eyes.",
    image: "/placeholder.svg?height=400&width=800&text=Science+Fair+2024",
    featured: true,
    tags: ["STEM", "Competition", "Innovation", "Research", "Awards"],
    organizer: "Science Department",
    organizerContact: {
      email: "science@southville8b.edu.ph",
      phone: "+63 2 8123 4567",
      website: "https://southville8b.edu.ph/science",
    },
    price: "Free",
    status: "upcoming",
    highlights: [
      "University judges from top institutions",
      "Cash prizes up to ₱10,000",
      "Scholarship opportunities",
      "Media coverage and recognition",
      "Networking with industry professionals",
    ],
    schedule: [
      { time: "9:00 AM", activity: "Registration and Setup" },
      { time: "10:00 AM", activity: "Opening Ceremony" },
      { time: "10:30 AM", activity: "Project Presentations Begin" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "1:00 PM", activity: "Judging Continues" },
      { time: "3:00 PM", activity: "Awards Ceremony" },
      { time: "4:00 PM", activity: "Closing and Networking" },
    ],
    requirements: [
      "Valid student ID required",
      "Projects must be original work",
      "Safety protocols must be followed",
      "Registration deadline: March 10, 2025",
    ],
    gallery: [
      "/placeholder.svg?height=200&width=300&text=Project+1",
      "/placeholder.svg?height=200&width=300&text=Project+2",
      "/placeholder.svg?height=200&width=300&text=Project+3",
      "/placeholder.svg?height=200&width=300&text=Awards",
    ],
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: "from-blue-500 to-blue-600",
      sports: "from-green-500 to-green-600",
      cultural: "from-purple-500 to-purple-600",
      social: "from-orange-500 to-orange-600",
    }
    return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600"
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-700 border-blue-200",
      sports: "bg-green-100 text-green-700 border-green-200",
      cultural: "bg-purple-100 text-purple-700 border-purple-200",
      social: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(eventData.category)} opacity-90`}></div>
          <img
            src={eventData.image || "/placeholder.svg"}
            alt={eventData.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="absolute inset-0 flex items-end p-6 sm:p-8">
            <div className="text-white space-y-4 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={getCategoryBadgeColor(eventData.category)}>{eventData.category}</Badge>
                {eventData.featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {eventData.status}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold">{eventData.title}</h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(eventData.date).toLocaleDateString()} at {eventData.time}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>{eventData.price}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current text-red-400" : ""}`} />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHasNotification(!hasNotification)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Bell className={`w-4 h-4 mr-2 ${hasNotification ? "text-blue-400" : ""}`} />
                  {hasNotification ? "Notifications On" : "Notify Me"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
            <TabsTrigger value="overview" className="text-sm font-medium">
              <Info className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-sm font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-sm font-medium">
              <Camera className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-sm font-medium">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>About This Event</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{eventData.fullDescription}</p>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Event Highlights:</h4>
                      <ul className="space-y-2">
                        {eventData.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {eventData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Requirements & Guidelines</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {eventData.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{new Date(eventData.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">{eventData.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{eventData.location}</div>
                          <div className="text-sm text-muted-foreground">Main Campus</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{eventData.price}</div>
                          <div className="text-sm text-muted-foreground">Entry Fee</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{eventData.organizer}</div>
                          <div className="text-sm text-muted-foreground">Organizer</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Event Info
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventData.schedule.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-20 text-sm font-medium text-primary flex-shrink-0">{item.time}</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eventData.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-lg overflow-hidden bg-muted hover:scale-105 transition-transform cursor-pointer"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{eventData.organizerContact.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{eventData.organizerContact.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Website</div>
                      <div className="text-sm text-muted-foreground">{eventData.organizerContact.website}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Have Questions?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Feel free to reach out to our organizing team for any questions about the event.
                  </p>
                  <Button className="w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  )
}
