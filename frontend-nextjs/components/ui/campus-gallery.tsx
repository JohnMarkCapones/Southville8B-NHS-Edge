"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
import { getCampusGalleryItems } from "@/lib/api/endpoints/gallery"
import type { FrontendGalleryItem } from "@/lib/api/types/gallery"

interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  description: string
}

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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch gallery items from API
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setIsLoading(true)
        const items = await getCampusGalleryItems(8) // Fetch 8 items for the landing page

        console.log('[CampusGallery] Fetched items from API:', items)
        console.log('[CampusGallery] Number of items:', items.length)

        // Transform FrontendGalleryItem to GalleryItem
        const transformedItems: GalleryItem[] = items.map(item => {
          console.log('[CampusGallery] Transforming item:', {
            id: item.id,
            title: item.title,
            category: item.category,
            image: item.image,
            thumbnail: item.thumbnail,
          })

          return {
            id: item.id,
            title: item.title,
            category: item.category,
            image: item.thumbnail || item.image, // Use thumbnail if available, fallback to full image
            description: item.description,
          }
        })

        console.log('[CampusGallery] Transformed items:', transformedItems)
        setGalleryItems(transformedItems)
      } catch (error) {
        console.error('[CampusGallery] Error fetching campus gallery items:', error)
        // Keep empty array on error - component will handle gracefully
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryItems()
  }, [])

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state if no items
  if (galleryItems.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Gallery Items Yet</h3>
            <p className="text-muted-foreground">Check back soon for photos from school events!</p>
          </div>
        </div>
      </div>
    )
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
        <div className="aspect-[21/9] md:aspect-[2.5/1] relative">
          <Image
            src={featuredItem.image || "/placeholder.svg"}
            alt={featuredItem.title}
            fill
            className="object-cover cursor-pointer"
            sizes="100vw"
            quality={95}
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
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 33vw"
                quality={95}
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
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 shadow-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Container */}
            <div className="relative bg-gray-100 dark:bg-gray-800">
              {isLightboxLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <Image
                src={lightboxImage.image || "/placeholder.svg"}
                alt={lightboxImage.title}
                width={1200}
                height={800}
                className="w-full max-h-[70vh] object-contain"
                quality={95}
                onLoad={() => setIsLightboxLoading(false)}
              />
            </div>

            {/* Info Section */}
            <div className="p-6 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {lightboxImage.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {lightboxImage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {lightboxImage.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleLike}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm",
                      isLiked
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                <Link href="/guess/gallery">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
