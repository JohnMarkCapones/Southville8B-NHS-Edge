"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  GraduationCap,
  Trophy,
  Palette,
  Music,
  Users,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  ZoomIn,
  Heart,
  Share2,
} from "lucide-react"
import Link from "next/link"

interface GalleryItem {
  id: number
  title: string
  category: string
  image: string
  description: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Science Fair 2024 Winners",
    category: "Academic",
    image: "/placeholder.svg?height=400&width=600&text=Science+Fair+2024+Winners",
    description: "Students showcased innovative projects in STEM fields",
  },
  {
    id: 2,
    title: "Basketball Championship",
    category: "Sports",
    image: "/placeholder.svg?height=300&width=400&text=Basketball+Championship",
    description: "Eagles win state championship",
  },
  {
    id: 3,
    title: "Art Exhibition",
    category: "Arts",
    image: "/placeholder.svg?height=300&width=400&text=Art+Exhibition",
    description: "Student artwork displayed in gallery",
  },
  {
    id: 4,
    title: "Drama Performance",
    category: "Arts",
    image: "/placeholder.svg?height=300&width=400&text=Drama+Performance",
    description: "Annual spring musical production",
  },
  {
    id: 5,
    title: "Community Service",
    category: "Events",
    image: "/placeholder.svg?height=300&width=400&text=Community+Service",
    description: "Students volunteering in local community",
  },
  {
    id: 6,
    title: "Math Olympiad",
    category: "Academic",
    image: "/placeholder.svg?height=300&width=400&text=Math+Olympiad",
    description: "Students compete in mathematics competition",
  },
  {
    id: 7,
    title: "Soccer Tournament",
    category: "Sports",
    image: "/placeholder.svg?height=300&width=400&text=Soccer+Tournament",
    description: "Annual inter-school soccer championship",
  },
  {
    id: 8,
    title: "Campus Festival",
    category: "Campus Life",
    image: "/placeholder.svg?height=300&width=400&text=Campus+Festival",
    description: "Annual campus celebration with food and activities",
  },
]

const categories = [
  { name: "All", icon: <Users className="w-4 h-4" /> },
  { name: "Academic", icon: <GraduationCap className="w-4 h-4" /> },
  { name: "Sports", icon: <Trophy className="w-4 h-4" /> },
  { name: "Arts", icon: <Palette className="w-4 h-4" /> },
  { name: "Events", icon: <Music className="w-4 h-4" /> },
  { name: "Campus Life", icon: <Users className="w-4 h-4" /> },
]

export function CampusGallery() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null)
  const [isLightboxLoading, setIsLightboxLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const filteredItems =
    activeCategory === "All" ? galleryItems : galleryItems.filter((item) => item.category === activeCategory)

  const featuredItem = filteredItems[0] || galleryItems[0]
  const gridItems = filteredItems.slice(1)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  const openLightbox = (item: GalleryItem) => {
    setIsLightboxLoading(true)
    setLightboxImage(item)
    setTimeout(() => setIsLightboxLoading(false), 300)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setIsLiked(false)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <div className="space-y-8">
      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.name}
            variant={activeCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.name)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Featured Image */}
      <div className="relative rounded-lg overflow-hidden bg-muted">
        <div className="aspect-[16/9] relative">
          <img
            src={featuredItem.image || "/placeholder.svg"}
            alt={featuredItem.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openLightbox(featuredItem)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2" role="tablist" aria-label="Gallery slides">
            {filteredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                role="tab"
                aria-label={`Go to slide ${index + 1} of ${filteredItems.length}`}
                aria-selected={index === currentSlide}
                className={cn(
                  "w-11 h-11 rounded-full transition-all flex items-center justify-center hover:scale-110",
                  index === currentSlide ? "bg-white/20" : "bg-transparent hover:bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    index === currentSlide ? "bg-white scale-125" : "bg-white/60",
                  )}
                />
                <span className="sr-only">{index === currentSlide ? `Slide ${index + 1} (current)` : `Slide ${index + 1}`}</span>
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Content Overlay */}
          <div className="absolute bottom-6 left-6 text-white">
            <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
              <Trophy className="w-3 h-3 mr-1" />
              {featuredItem.category}
            </Badge>
            <h3 className="text-2xl font-bold mb-2">{featuredItem.title}</h3>
            <p className="text-white/90 max-w-md">{featuredItem.description}</p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {gridItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative rounded-lg overflow-hidden bg-muted group cursor-pointer hover:scale-105 transition-transform duration-300",
              index === 2 ? "lg:row-span-1" : "",
            )}
            onClick={() => openLightbox(item)}
          >
            <div className="aspect-square relative">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-black/50 text-white border-white/30 text-xs">
                  {item.category}
                </Badge>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-white/80 line-clamp-2">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link href="/guess/gallery">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            <Camera className="w-5 h-5 mr-2" />
            View All Gallery Items
          </Button>
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative max-w-5xl max-h-[95vh] w-full animate-in zoom-in-95 duration-500 ease-out">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-16 right-0 z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full p-3 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Action Buttons */}
            <div className="absolute -top-16 right-16 z-10 flex gap-2">
              <button
                onClick={toggleLike}
                className={cn(
                  "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 rounded-full p-3 hover:scale-110",
                  isLiked ? "text-red-400 bg-red-500/20" : "text-white",
                )}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full p-3 hover:scale-110">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full p-3 hover:scale-110">
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Container */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {isLightboxLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              <img
                src={lightboxImage.image || "/placeholder.svg"}
                alt={lightboxImage.title}
                className="w-full h-full max-h-[70vh] object-contain transition-all duration-700 hover:scale-105"
                onLoad={() => setIsLightboxLoading(false)}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 transform translate-y-0 transition-all duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-white/30 backdrop-blur-sm"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {lightboxImage.category}
                      </Badge>
                      <h3 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {lightboxImage.title}
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed max-w-2xl">{lightboxImage.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col items-end gap-2 text-white/70 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>124</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>32</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="text-white/60 text-sm">Photo by Southville 8B NHS</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                      >
                        View Full Gallery
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
