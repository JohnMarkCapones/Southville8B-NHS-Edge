"use client"

import { useState } from "react"
import Link from "next/link"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Heart,
  Share2,
  Bell,
  Star,
  TrendingUp,
  Award,
  Zap,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  BookOpen,
  Trophy,
  Palette,
  Eye,
} from "lucide-react"

export default function StudentEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<number[]>([])
  const [notifications, setNotifications] = useState<number[]>([])

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const events = [
    {
      id: 1,
      title: "Science Fair 2024",
      date: "2025-03-15",
      time: "9:00 AM - 4:00 PM",
      location: "Main Auditorium",
      category: "academic",
      description: "Annual science fair showcasing student projects and innovations with university judges.",
      attendees: 150,
      maxAttendees: 200,
      status: "upcoming",
      image: "/placeholder.svg?height=200&width=300&text=Science+Fair",
      featured: true,
      tags: ["STEM", "Competition", "Innovation"],
      organizer: "Science Department",
      registrationDeadline: "2025-03-10",
      price: "Free",
    },
    {
      id: 2,
      title: "Basketball Championship Finals",
      date: "2025-03-20",
      time: "3:00 PM - 6:00 PM",
      location: "School Gymnasium",
      category: "sports",
      description: "Inter-section basketball championship finals with exciting prizes and awards.",
      attendees: 200,
      maxAttendees: 300,
      status: "upcoming",
      image: "/placeholder.svg?height=200&width=300&text=Basketball",
      featured: false,
      tags: ["Sports", "Championship", "Competition"],
      organizer: "Athletic Department",
      registrationDeadline: "2025-03-18",
      price: "Free",
    },
    {
      id: 3,
      title: "Cultural Night Celebration",
      date: "2025-03-25",
      time: "6:00 PM - 9:00 PM",
      location: "School Theater",
      category: "cultural",
      description: "Celebration of diverse cultures with performances, food, and traditional displays.",
      attendees: 300,
      maxAttendees: 400,
      status: "upcoming",
      image: "/placeholder.svg?height=200&width=300&text=Cultural+Night",
      featured: true,
      tags: ["Culture", "Performance", "Food"],
      organizer: "Cultural Club",
      registrationDeadline: "2025-03-22",
      price: "₱50",
    },
    {
      id: 4,
      title: "Math Olympiad Regional",
      date: "2025-02-28",
      time: "10:00 AM - 2:00 PM",
      location: "Computer Lab",
      category: "academic",
      description: "Regional mathematics competition for grade 8 students with cash prizes.",
      attendees: 80,
      maxAttendees: 100,
      status: "completed",
      image: "/placeholder.svg?height=200&width=300&text=Math+Olympiad",
      featured: false,
      tags: ["Math", "Competition", "Regional"],
      organizer: "Math Department",
      registrationDeadline: "2025-02-25",
      price: "Free",
    },
    {
      id: 5,
      title: "Spring Musical: Hamilton Jr.",
      date: "2025-04-10",
      time: "7:00 PM - 9:30 PM",
      location: "School Theater",
      category: "cultural",
      description: "Student production of Hamilton Jr. featuring talented performers from our drama club.",
      attendees: 45,
      maxAttendees: 350,
      status: "upcoming",
      image: "/placeholder.svg?height=200&width=300&text=Hamilton+Musical",
      featured: true,
      tags: ["Musical", "Drama", "Performance"],
      organizer: "Drama Club",
      registrationDeadline: "2025-04-08",
      price: "₱100",
    },
    {
      id: 6,
      title: "Environmental Awareness Week",
      date: "2025-04-22",
      time: "8:00 AM - 5:00 PM",
      location: "School Campus",
      category: "social",
      description: "Week-long activities promoting environmental awareness and sustainability practices.",
      attendees: 120,
      maxAttendees: 500,
      status: "upcoming",
      image: "/placeholder.svg?height=200&width=300&text=Environment+Week",
      featured: false,
      tags: ["Environment", "Sustainability", "Awareness"],
      organizer: "Environmental Club",
      registrationDeadline: "2025-04-20",
      price: "Free",
    },
  ]

  const categories = [
    { value: "all", label: "All Events", icon: <Grid3X3 className="w-4 h-4" />, count: events.length },
    {
      value: "academic",
      label: "Academic",
      icon: <BookOpen className="w-4 h-4" />,
      count: events.filter((e) => e.category === "academic").length,
    },
    {
      value: "sports",
      label: "Sports",
      icon: <Trophy className="w-4 h-4" />,
      count: events.filter((e) => e.category === "sports").length,
    },
    {
      value: "cultural",
      label: "Cultural",
      icon: <Palette className="w-4 h-4" />,
      count: events.filter((e) => e.category === "cultural").length,
    },
    {
      value: "social",
      label: "Social",
      icon: <Users className="w-4 h-4" />,
      count: events.filter((e) => e.category === "social").length,
    },
  ]

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const upcomingEvents = filteredEvents.filter((event) => event.status === "upcoming")
  const pastEvents = filteredEvents.filter((event) => event.status === "completed")
  const featuredEvents = upcomingEvents.filter((event) => event.featured)

  const toggleFavorite = (eventId: number) => {
    setFavorites((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const toggleNotification = (eventId: number) => {
    setNotifications((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
    if (!notifications.includes(eventId)) {
      // Simple notification feedback - could be enhanced with toast
      console.log(`Notifications enabled for event: ${events.find((e) => e.id === eventId)?.title}`)
    }
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
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    School Events
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Discover Amazing Events</h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  Join exciting activities, competitions, and celebrations happening at our school
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{upcomingEvents.length}</div>
                  <div className="text-white/80 text-sm">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{featuredEvents.length}</div>
                  <div className="text-white/80 text-sm">Featured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{favorites.length}</div>
                  <div className="text-white/80 text-sm">Favorites</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, tags, or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm h-11 min-w-[140px]"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {featuredEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Events</h2>
              <Badge variant="secondary">{featuredEvents.length}</Badge>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.slice(0, 3).map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="relative aspect-video bg-gradient-to-r from-yellow-400 to-orange-500">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white font-semibold">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        onClick={() => toggleFavorite(event.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(event.id) ? "text-red-500 fill-current" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <Badge variant="outline" className={getCategoryBadgeColor(event.category)}>
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-primary">{event.price}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/student/events/${createSlug(event.title)}`} className="flex-1">
                        <Button className="w-full group-hover:bg-primary/90 transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleNotification(event.id)}
                        className={notifications.includes(event.id) ? "bg-blue-50 border-blue-200" : ""}
                      >
                        <Bell className={`w-4 h-4 ${notifications.includes(event.id) ? "text-blue-600" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
            <TabsTrigger
              value="upcoming"
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Award className="w-4 h-4 mr-2" />
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className={viewMode === "grid" ? "grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {upcomingEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className={`group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn ${
                    viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`relative bg-gradient-to-r ${getCategoryColor(event.category)} ${
                      viewMode === "list" ? "sm:w-48 sm:flex-shrink-0" : "aspect-video"
                    }`}
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getCategoryBadgeColor(event.category)}>{event.category}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => toggleFavorite(event.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(event.id) ? "text-red-500 fill-current" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center space-x-1 text-sm font-semibold text-primary">
                          {event.price}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">by {event.organizer}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/student/events/${createSlug(event.title)}`} className="flex-1">
                          <Button className="w-full group-hover:bg-primary/90 transition-colors">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleNotification(event.id)}
                          className={notifications.includes(event.id) ? "bg-blue-50 border-blue-200" : ""}
                        >
                          <Bell className={`w-4 h-4 ${notifications.includes(event.id) ? "text-blue-600" : ""}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {upcomingEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div className={viewMode === "grid" ? "grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {pastEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className={`group overflow-hidden hover:shadow-lg transition-all duration-300 opacity-90 hover:opacity-100 animate-fadeIn ${
                    viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`relative bg-gradient-to-r from-gray-400 to-gray-600 ${
                      viewMode === "list" ? "sm:w-48 sm:flex-shrink-0" : "aspect-video"
                    }`}
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gray-500 text-white">Completed</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 text-gray-700">
                        {event.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {event.organizer}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4" />
                          <span>Event completed</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs opacity-75">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button variant="outline" className="w-full bg-transparent">
                        <Link
                          href={`/student/events/${createSlug(event.title)}`}
                          className="flex items-center justify-center w-full"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Event Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {pastEvents.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past events found</h3>
                <p className="text-muted-foreground">Check back later for completed events</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl p-6 border">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Want to organize an event?</h3>
            <p className="text-muted-foreground">Share your ideas and bring the school community together</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="bg-white dark:bg-gray-800">
                <Zap className="w-4 h-4 mr-2" />
                Propose Event
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
