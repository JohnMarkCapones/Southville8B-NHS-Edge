"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Video,
  Calendar,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  Download,
  Eye,
} from "lucide-react"

interface GalleryItem {
  id: number
  type: "image" | "video"
  src: string
  thumbnail: string
  title: string
  description: string
  category: string
  date: string
  location?: string
  tags: string[]
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Science+Fair+2024",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Science+Fair+2024",
    title: "Science Fair 2024 Winners",
    description:
      "Students showcase innovative projects in STEM fields, demonstrating creativity and scientific knowledge",
    category: "Academic",
    date: "2024-02-15",
    location: "Main Gymnasium",
    tags: ["Science", "Innovation", "Students", "Competition", "STEM"],
  },
  {
    id: 2,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Basketball+Championship",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Basketball+Championship",
    title: "State Basketball Championship",
    description: "Eagles dominate the court in the thrilling championship game against rival schools",
    category: "Athletics",
    date: "2024-02-20",
    location: "State Arena",
    tags: ["Basketball", "Championship", "Athletics", "Victory", "Eagles"],
  },
  {
    id: 3,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Art+Exhibition",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Art+Exhibition",
    title: "Student Art Exhibition",
    description: "Creative masterpieces from our talented artists displayed in the annual art showcase",
    category: "Arts",
    date: "2024-02-25",
    location: "Arts Center",
    tags: ["Art", "Exhibition", "Creativity", "Students", "Showcase"],
  },
  {
    id: 4,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Graduation+2024",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Graduation+2024",
    title: "Graduation Ceremony 2024",
    description: "Celebrating our graduating class achievements and their journey to success",
    category: "Events",
    date: "2024-06-15",
    location: "Football Stadium",
    tags: ["Graduation", "Achievement", "Celebration", "Class of 2024", "Success"],
  },
  {
    id: 5,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Spring+Musical",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Spring+Musical",
    title: "Spring Musical: Hamilton",
    description: "Outstanding performance by our drama department in this year's spring production",
    category: "Arts",
    date: "2024-04-20",
    location: "Main Auditorium",
    tags: ["Musical", "Drama", "Performance", "Hamilton", "Theater"],
  },
  {
    id: 6,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Campus+Life",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Campus+Life",
    title: "Daily Campus Life",
    description: "Students enjoying break time and socializing in the beautiful main courtyard",
    category: "Campus Life",
    date: "2024-03-10",
    location: "Main Courtyard",
    tags: ["Campus", "Students", "Daily Life", "Community", "Social"],
  },
  {
    id: 7,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Chemistry+Lab",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Chemistry+Lab",
    title: "Advanced Chemistry Lab",
    description: "Students conducting experiments in our state-of-the-art chemistry laboratory",
    category: "Academic",
    date: "2024-01-20",
    location: "Science Building",
    tags: ["Chemistry", "Laboratory", "Experiments", "Science", "Learning"],
  },
  {
    id: 8,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Soccer+Match",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Soccer+Match",
    title: "Regional Soccer Championship",
    description: "Intense match highlights from our soccer team's regional championship victory",
    category: "Athletics",
    date: "2024-03-15",
    location: "Soccer Field",
    tags: ["Soccer", "Championship", "Regional", "Victory", "Team"],
  },
  {
    id: 9,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Library+Study",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Library+Study",
    title: "Library Study Sessions",
    description: "Students collaborating and studying in our modern library facilities",
    category: "Campus Life",
    date: "2024-02-05",
    location: "Main Library",
    tags: ["Library", "Study", "Collaboration", "Learning", "Academic"],
  },
  {
    id: 10,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Band+Concert",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Band+Concert",
    title: "Winter Band Concert",
    description: "Our talented school band performing at the annual winter concert",
    category: "Arts",
    date: "2024-12-15",
    location: "Main Auditorium",
    tags: ["Band", "Concert", "Music", "Performance", "Winter"],
  },
  {
    id: 11,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Robotics+Competition",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Robotics+Competition",
    title: "Robotics Team Competition",
    description: "Our robotics team competing in the state-level robotics championship",
    category: "Academic",
    date: "2024-03-25",
    location: "Convention Center",
    tags: ["Robotics", "Competition", "Technology", "Engineering", "Innovation"],
  },
  {
    id: 12,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Prom+Night",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Prom+Night",
    title: "Senior Prom 2024",
    description: "Magical evening as seniors celebrate at their unforgettable prom night",
    category: "Events",
    date: "2024-05-18",
    location: "Grand Ballroom",
    tags: ["Prom", "Senior", "Celebration", "Formal", "Dance"],
  },
]

const categories = ["All", "Academic", "Athletics", "Arts", "Events", "Campus Life"]
const sortOptions = ["Newest First", "Oldest First", "A-Z", "Z-A"]

export function ComprehensiveGallery() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("Newest First")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({})

  const filteredItems = galleryItems
    .filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Newest First":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "Oldest First":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "A-Z":
          return a.title.localeCompare(b.title)
        case "Z-A":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

  const nextItem = () => {
    if (selectedItem) {
      const currentItemIndex = filteredItems.findIndex((item) => item.id === selectedItem.id)
      const nextIndex = (currentItemIndex + 1) % filteredItems.length
      setSelectedItem(filteredItems[nextIndex])
    }
  }

  const prevItem = () => {
    if (selectedItem) {
      const currentItemIndex = filteredItems.findIndex((item) => item.id === selectedItem.id)
      const prevIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length
      setSelectedItem(filteredItems[prevIndex])
    }
  }

  const toggleLike = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const incrementViewCount = (itemId: number) => {
    setViewCounts((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item)
    incrementViewCount(item.id)
  }

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [selectedCategory, searchTerm, sortBy])

  return (
    <div className="space-y-8">
      <div className="relative bg-gradient-to-r from-card via-card/95 to-card rounded-2xl p-8 shadow-lg border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Enhanced Search Section */}
          <div className="relative flex-1 max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
              <Input
                placeholder="Search gallery items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-base bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-lg transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:bg-background hover:border-primary/30 hover:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-110"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div className="relative group">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 h-12 bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-lg transition-all duration-300 hover:border-primary/30 hover:shadow-md focus:border-primary/50 focus:ring-4 focus:ring-primary/10">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="transition-all duration-200 hover:bg-primary/10 focus:bg-primary/10 rounded-md mx-1"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            category === "All"
                              ? "bg-gradient-to-r from-primary to-blue-500"
                              : category === "Academic"
                                ? "bg-blue-500"
                                : category === "Athletics"
                                  ? "bg-green-500"
                                  : category === "Arts"
                                    ? "bg-purple-500"
                                    : category === "Events"
                                      ? "bg-orange-500"
                                      : "bg-pink-500"
                          }`}
                        ></div>
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="relative group">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-12 bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-lg transition-all duration-300 hover:border-primary/30 hover:shadow-md focus:border-primary/50 focus:ring-4 focus:ring-primary/10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="transition-all duration-200 hover:bg-primary/10 focus:bg-primary/10 rounded-md mx-1"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced View Mode Toggle */}
            <div className="flex bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <div className="w-px bg-border/50"></div>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Results Counter */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground transition-all duration-300">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="animate-pulse">Searching through gallery...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 animate-fadeIn">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="font-medium">
                  Showing <span className="text-primary font-semibold">{filteredItems.length}</span> of{" "}
                  <span className="text-foreground font-semibold">{galleryItems.length}</span> items
                </span>
                {searchTerm && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">for "{searchTerm}"</span>
                )}
              </div>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="hidden md:flex items-center gap-2">
            {["Academic", "Athletics", "Arts"].map((quickFilter) => (
              <button
                key={quickFilter}
                onClick={() => setSelectedCategory(quickFilter)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 ${
                  selectedCategory === quickFilter
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {quickFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg aspect-video mb-3"></div>
              <div className="bg-muted rounded h-4 mb-2"></div>
              <div className="bg-muted rounded h-3 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <AnimatedCard
                  variant="lift"
                  className="cursor-pointer overflow-hidden group animate-slideInUp relative"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                    <div
                      className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${
                        hoveredItem === item.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                      }`}
                    >
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 ${
                          likedItems.has(item.id)
                            ? "bg-red-500 text-white"
                            : "bg-black/30 text-white hover:bg-red-500/80"
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-blue-500/80 transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="absolute top-2 left-2">
                      <Badge className={`${item.type === "video" ? "bg-red-500/90" : "bg-blue-500/90"} animate-pulse`}>
                        {item.type === "video" ? (
                          <Video className="w-3 h-3 mr-1" />
                        ) : (
                          <Camera className="w-3 h-3 mr-1" />
                        )}
                        {item.type === "video" ? "Video" : "Photo"}
                      </Badge>
                    </div>

                    {viewCounts[item.id] && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                        <Eye className="w-3 h-3" />
                        {viewCounts[item.id]}
                      </div>
                    )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white transition-all duration-300 ${
                        hoveredItem === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                    >
                      <h4 className="font-semibold mb-1 line-clamp-1 transition-all duration-200 delay-75">
                        {item.title}
                      </h4>
                      <p className="text-sm text-white/80 line-clamp-2 transition-all duration-200 delay-100">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 transition-all duration-200 delay-125">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="relative">
                  <div className="relative aspect-video mb-4 group">
                    <img
                      src={item.src || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    <button
                      onClick={prevItem}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 text-white hover:scale-110 active:scale-95 border border-white/20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextItem}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 text-white hover:scale-110 active:scale-95 border border-white/20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 ${
                          likedItems.has(item.id)
                            ? "bg-red-500 text-white"
                            : "bg-black/40 text-white hover:bg-red-500/80"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </button>
                      <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-blue-500/80 transition-all duration-200 hover:scale-110 active:scale-95">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold transition-colors duration-200">{item.title}</h3>
                      <Badge variant="outline" className="transition-all duration-200 hover:bg-primary/10">
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                        {item.type === "video" ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {item.type === "video" ? "Video" : "Photo"}
                      </div>
                      {viewCounts[item.id] && (
                        <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                          <Eye className="w-4 h-4" />
                          {viewCounts[item.id]} views
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs transition-all duration-200 hover:bg-primary/20 hover:scale-105 cursor-pointer animate-in fade-in-0 slide-in-from-bottom-2"
                          style={{ animationDelay: `${tagIndex * 50}ms` }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <AnimatedCard
                  variant="lift"
                  className="cursor-pointer overflow-hidden group animate-slideInUp p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex gap-4">
                    <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-1 right-1">
                        <Badge className={`text-xs ${item.type === "video" ? "bg-red-500/90" : "bg-blue-500/90"}`}>
                          {item.type === "video" ? (
                            <Video className="w-2 h-2 mr-1" />
                          ) : (
                            <Camera className="w-2 h-2 mr-1" />
                          )}
                        </Badge>
                      </div>

                      <div
                        className={`absolute top-1 left-1 transition-all duration-300 ${
                          hoveredItem === item.id ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className={`p-1 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                            likedItems.has(item.id)
                              ? "bg-red-500 text-white"
                              : "bg-black/30 text-white hover:bg-red-500/80"
                          }`}
                        >
                          <Heart className={`w-2.5 h-2.5 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg line-clamp-1 transition-colors duration-200 group-hover:text-primary">
                          {item.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="ml-2 flex-shrink-0 transition-all duration-200 hover:bg-primary/10"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2 transition-colors duration-200">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </div>
                        )}
                        {viewCounts[item.id] && (
                          <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                            <Eye className="w-3 h-3" />
                            {viewCounts[item.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="relative">
                  <div className="relative aspect-video mb-4 group">
                    <img
                      src={item.src || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    <button
                      onClick={prevItem}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 text-white hover:scale-110 active:scale-95 border border-white/20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextItem}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 text-white hover:scale-110 active:scale-95 border border-white/20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 ${
                          likedItems.has(item.id)
                            ? "bg-red-500 text-white"
                            : "bg-black/40 text-white hover:bg-red-500/80"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </button>
                      <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-blue-500/80 transition-all duration-200 hover:scale-110 active:scale-95">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold transition-colors duration-200">{item.title}</h3>
                      <Badge variant="outline" className="transition-all duration-200 hover:bg-primary/10">
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                        {item.type === "video" ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {item.type === "video" ? "Video" : "Photo"}
                      </div>
                      {viewCounts[item.id] && (
                        <div className="flex items-center gap-1 transition-colors duration-200 hover:text-foreground">
                          <Eye className="w-4 h-4" />
                          {viewCounts[item.id]} views
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs transition-all duration-200 hover:bg-primary/20 hover:scale-105 cursor-pointer animate-in fade-in-0 slide-in-from-bottom-2"
                          style={{ animationDelay: `${tagIndex * 50}ms` }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="text-muted-foreground mb-4">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
