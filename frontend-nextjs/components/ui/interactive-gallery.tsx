"use client"

import { useState, useEffect } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Play, Pause, Camera, Video, Calendar, MapPin } from "lucide-react"

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
    description: "Students showcase innovative projects in STEM fields",
    category: "Academic",
    date: "2024-02-15",
    location: "Main Gymnasium",
    tags: ["Science", "Innovation", "Students", "Competition"],
  },
  {
    id: 2,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Basketball+Championship",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Basketball+Championship",
    title: "State Basketball Championship",
    description: "Eagles dominate the court in championship game",
    category: "Athletics",
    date: "2024-02-20",
    location: "State Arena",
    tags: ["Basketball", "Championship", "Athletics", "Victory"],
  },
  {
    id: 3,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Art+Exhibition",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Art+Exhibition",
    title: "Student Art Exhibition",
    description: "Creative masterpieces from our talented artists",
    category: "Arts",
    date: "2024-02-25",
    location: "Arts Center",
    tags: ["Art", "Exhibition", "Creativity", "Students"],
  },
  {
    id: 4,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Graduation+2024",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Graduation+2024",
    title: "Graduation Ceremony 2024",
    description: "Celebrating our graduating class achievements",
    category: "Events",
    date: "2024-06-15",
    location: "Football Stadium",
    tags: ["Graduation", "Achievement", "Celebration", "Class of 2024"],
  },
  {
    id: 5,
    type: "video",
    src: "/placeholder.svg?height=600&width=800&text=Spring+Musical",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Spring+Musical",
    title: "Spring Musical: Hamilton",
    description: "Outstanding performance by our drama department",
    category: "Arts",
    date: "2024-04-20",
    location: "Main Auditorium",
    tags: ["Musical", "Drama", "Performance", "Hamilton"],
  },
  {
    id: 6,
    type: "image",
    src: "/placeholder.svg?height=600&width=800&text=Campus+Life",
    thumbnail: "/placeholder.svg?height=300&width=400&text=Campus+Life",
    title: "Daily Campus Life",
    description: "Students enjoying break time in the courtyard",
    category: "Campus Life",
    date: "2024-03-10",
    location: "Main Courtyard",
    tags: ["Campus", "Students", "Daily Life", "Community"],
  },
]

const categories = ["All", "Academic", "Athletics", "Arts", "Events", "Campus Life"]

export function InteractiveGallery() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const filteredItems =
    selectedCategory === "All" ? galleryItems : galleryItems.filter((item) => item.category === selectedCategory)

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(nextItem, 4000)
      return () => clearInterval(timer)
    }
  }, [isPlaying, filteredItems.length])

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <AnimatedButton
            key={category}
            variant={selectedCategory === category ? "gradient" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory(category)
              setCurrentIndex(0)
            }}
            animation="lift"
            className="transition-all duration-300"
          >
            {category}
          </AnimatedButton>
        ))}
      </div>

      {/* Featured Gallery Item */}
      <div className="relative">
        <AnimatedCard variant="lift" className="overflow-hidden">
          <div className="relative aspect-video">
            <img
              src={filteredItems[currentIndex]?.thumbnail || "/placeholder.svg"}
              alt={filteredItems[currentIndex]?.title || "Gallery item"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Play/Pause Button for Videos */}
            {filteredItems[currentIndex]?.type === "video" && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
              </button>
            )}

            {/* Navigation Arrows */}
            <button
              onClick={prevItem}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextItem}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Item Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {filteredItems[currentIndex]?.type === "video" ? (
                    <Video className="w-3 h-3 mr-1" />
                  ) : (
                    <Camera className="w-3 h-3 mr-1" />
                  )}
                  {filteredItems[currentIndex]?.category}
                </Badge>
                <span className="text-sm opacity-80">
                  {new Date(filteredItems[currentIndex]?.date || "").toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{filteredItems[currentIndex]?.title}</h3>
              <p className="text-white/90 mb-4">{filteredItems[currentIndex]?.description}</p>
              <div className="flex items-center gap-4 text-sm">
                {filteredItems[currentIndex]?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {filteredItems[currentIndex].location}
                  </div>
                )}
                <div className="flex gap-2">
                  {filteredItems[currentIndex]?.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center mt-4 gap-2">
          {filteredItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-primary scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.slice(1).map((item, index) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <AnimatedCard
                variant="lift"
                className="cursor-pointer overflow-hidden group animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-video">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                  {item.type === "video" && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/50 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </AnimatedCard>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="relative">
                <img
                  src={item.src || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
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

      {/* View All Button */}
      <div className="text-center">
        <AnimatedButton variant="gradient" size="lg" animation="glow" asChild>
          <a href="/guess/gallery">
            <Camera className="w-5 h-5 mr-2" />
            View All Gallery Items
          </a>
        </AnimatedButton>
      </div>
    </div>
  )
}
