"use client"

import { useState, useMemo } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { GuessBreadcrumb } from "@/components/ui/guess-breadcrumb"
import { cn } from "@/lib/utils"
import {
  Camera,
  Search,
  Filter,
  Calendar,
  Tag,
  Share2,
  Download,
  Eye,
  Heart,
  Grid3X3,
  List,
  Play,
  X,
  Star,
  Trophy,
  GraduationCap,
  Palette,
  Users,
  MapPin,
} from "lucide-react"

interface GalleryItem {
  id: number
  title: string
  description: string
  category: string
  date: string
  image: string
  tags: string[]
  featured?: boolean
  views?: number
  likes?: number
  type: "image" | "video"
  location?: string
  photographer?: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Science Fair Champions 2024",
    description:
      "Our students celebrating their victory at the Regional Science Fair with innovative projects in environmental science and robotics.",
    category: "Academic Events",
    date: "2024-02-15",
    image: "/placeholder.svg?height=400&width=600&text=Science+Fair+Champions",
    tags: ["Science", "Achievement", "STEM", "Competition"],
    featured: true,
    views: 1247,
    likes: 89,
    type: "image",
    location: "Science Laboratory",
    photographer: "Ms. Rodriguez",
  },
  {
    id: 2,
    title: "Basketball Championship Game",
    description: "Eagles basketball team in action during the thrilling state championship final game.",
    category: "Sports",
    date: "2024-02-10",
    image: "/placeholder.svg?height=400&width=600&text=Basketball+Championship",
    tags: ["Basketball", "Sports", "Championship", "Eagles"],
    featured: true,
    views: 2156,
    likes: 134,
    type: "image",
    location: "Sports Complex",
    photographer: "Coach Martinez",
  },
  {
    id: 3,
    title: "Annual Art Exhibition Opening",
    description:
      "Students showcasing their creative masterpieces at the annual art exhibition featuring paintings, sculptures, and digital art.",
    category: "Arts & Culture",
    date: "2024-02-08",
    image: "/placeholder.svg?height=400&width=600&text=Art+Exhibition",
    tags: ["Art", "Exhibition", "Creativity", "Students"],
    views: 987,
    likes: 67,
    type: "image",
    location: "Art Gallery",
    photographer: "Ms. Chen",
  },
  {
    id: 4,
    title: "Graduation Ceremony 2024",
    description:
      "Proud graduates receiving their diplomas in a memorable ceremony celebrating their academic achievements.",
    category: "School Events",
    date: "2024-01-30",
    image: "/placeholder.svg?height=400&width=600&text=Graduation+Ceremony",
    tags: ["Graduation", "Achievement", "Ceremony", "Students"],
    featured: true,
    views: 3421,
    likes: 198,
    type: "image",
    location: "Main Auditorium",
    photographer: "Principal Santos",
  },
  {
    id: 5,
    title: "STEM Laboratory Tour",
    description:
      "Virtual tour of our state-of-the-art STEM laboratory featuring cutting-edge equipment and technology.",
    category: "Facilities",
    date: "2024-01-25",
    image: "/placeholder.svg?height=400&width=600&text=STEM+Laboratory",
    tags: ["STEM", "Laboratory", "Technology", "Facilities"],
    views: 1543,
    likes: 92,
    type: "video",
    location: "STEM Building",
    photographer: "Tech Team",
  },
  {
    id: 6,
    title: "Cultural Festival Performance",
    description: "Students performing traditional dances and music during the annual cultural diversity festival.",
    category: "Arts & Culture",
    date: "2024-01-20",
    image: "/placeholder.svg?height=400&width=600&text=Cultural+Festival",
    tags: ["Culture", "Performance", "Festival", "Diversity"],
    views: 1876,
    likes: 145,
    type: "image",
    location: "Main Courtyard",
    photographer: "Ms. Dela Cruz",
  },
  {
    id: 7,
    title: "Environmental Club Tree Planting",
    description:
      "Students and faculty working together to plant trees as part of the campus sustainability initiative.",
    category: "Community Service",
    date: "2024-01-15",
    image: "/placeholder.svg?height=400&width=600&text=Tree+Planting",
    tags: ["Environment", "Sustainability", "Community", "Service"],
    views: 1234,
    likes: 78,
    type: "image",
    location: "School Garden",
    photographer: "Environmental Club",
  },
  {
    id: 8,
    title: "Math Olympiad Training",
    description:
      "Dedicated students preparing for the regional mathematics olympiad with intensive problem-solving sessions.",
    category: "Academic Events",
    date: "2024-01-10",
    image: "/placeholder.svg?height=400&width=600&text=Math+Olympiad",
    tags: ["Mathematics", "Competition", "Training", "Academic"],
    views: 892,
    likes: 56,
    type: "image",
    location: "Mathematics Room",
    photographer: "Mr. Reyes",
  },
]

const categories = [
  { value: "all", label: "All Categories", icon: Camera },
  { value: "Academic Events", label: "Academic", icon: GraduationCap },
  { value: "Sports", label: "Sports", icon: Trophy },
  { value: "Arts & Culture", label: "Arts & Culture", icon: Palette },
  { value: "School Events", label: "School Events", icon: Users },
  { value: "Facilities", label: "Facilities", icon: MapPin },
  { value: "Community Service", label: "Community", icon: Heart },
]

export default function GalleryClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [sortBy, setSortBy] = useState("newest")

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [galleryRef, galleryInView] = useIntersectionObserver({ threshold: 0.1 })

  const filteredAndSortedItems = useMemo(() => {
    const filtered = galleryItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "featured":
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return (b.views || 0) - (a.views || 0)
        })
        break
    }

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const featuredItems = galleryItems.filter((item) => item.featured)

  return (
    <div className="min-h-screen bg-background">
      <GuessBreadcrumb items={[{ label: "Gallery" }]} />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={cn("animate-fadeIn", heroInView && "animate-slideInUp")}>
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 text-base px-6 py-3">
              <Camera className="w-5 h-5 mr-2" />
              Photo Gallery
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Capturing <span className="text-yellow-300">Memories</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 leading-relaxed text-white/90">
              Explore the vibrant moments, achievements, and daily life of our school community through our
              comprehensive photo gallery.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { number: "500+", label: "Photos", icon: Camera },
                { number: "50+", label: "Events", icon: Calendar },
                { number: "12", label: "Categories", icon: Tag },
                { number: "10K+", label: "Views", icon: Eye },
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <stat.icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stat.number}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30 sticky top-0 z-40 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            <div className="flex gap-3 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-3 rounded-l-lg transition-colors",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-3 rounded-r-lg transition-colors",
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      {featuredItems.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Featured Photos
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Spotlight <span className="gradient-text">Gallery</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our most memorable moments and achievements captured in stunning detail
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, index) => (
                <AnimatedCard
                  key={item.id}
                  className="group overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300"
                  onClick={() => setSelectedItem(item)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Featured</Badge>
                      {item.type === "video" && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-3 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.views?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed text-sm">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </div>
                      )}
                      {item.photographer && (
                        <div className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {item.photographer}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Gallery */}
      <section ref={galleryRef} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("flex items-center justify-between mb-12", galleryInView && "animate-fadeIn")}>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Gallery <span className="gradient-text">Collection</span>
              </h2>
              <p className="text-muted-foreground">
                {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {filteredAndSortedItems.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6",
              )}
            >
              {filteredAndSortedItems.map((item, index) => (
                <AnimatedCard
                  key={item.id}
                  className={cn(
                    "group overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300",
                    viewMode === "list" && "flex gap-6",
                  )}
                  onClick={() => setSelectedItem(item)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={cn("relative", viewMode === "list" ? "w-48 h-32 flex-shrink-0" : "w-full h-48")}>
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white/95 text-gray-900 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <div className={cn("p-4", viewMode === "list" && "flex-1")}>
                    <h3
                      className={cn(
                        "font-bold group-hover:text-primary transition-colors line-clamp-2",
                        viewMode === "list" ? "text-lg mb-2" : "text-base mb-3",
                      )}
                    >
                      {item.title}
                    </h3>

                    {viewMode === "list" && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views?.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, viewMode === "list" ? 4 : 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <AnimatedButton
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
              >
                Clear Filters
              </AnimatedButton>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-full">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={selectedItem.image || "/placeholder.svg"}
                  alt={selectedItem.title}
                  className="w-full h-96 object-cover"
                />
                {selectedItem.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{selectedItem.category}</Badge>
                  <div className="flex gap-2">
                    <AnimatedButton variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </AnimatedButton>
                    <AnimatedButton variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </AnimatedButton>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">{selectedItem.title}</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">{selectedItem.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
                  </div>
                  {selectedItem.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedItem.location}</span>
                    </div>
                  )}
                  {selectedItem.photographer && (
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>{selectedItem.photographer}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedItem.views?.toLocaleString()} views</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
