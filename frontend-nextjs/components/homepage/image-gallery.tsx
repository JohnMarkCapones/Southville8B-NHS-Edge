"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MOCK_GALLERY_IMAGES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

export function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % MOCK_GALLERY_IMAGES.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + MOCK_GALLERY_IMAGES.length) % MOCK_GALLERY_IMAGES.length)
  }

  useEffect(() => {
    const timer = setTimeout(nextSlide, 5000) // Auto-rotate every 5 seconds
    return () => clearTimeout(timer)
  }, [currentIndex])

  if (!MOCK_GALLERY_IMAGES || MOCK_GALLERY_IMAGES.length === 0) {
    return <p>No images to display.</p>
  }

  const currentImage = MOCK_GALLERY_IMAGES[currentIndex]

  return (
    <section className="py-12 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">School Life in Pictures</h2>
        <div className="relative w-full max-w-3xl mx-auto aspect-video overflow-hidden rounded-lg shadow-xl">
          {MOCK_GALLERY_IMAGES.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground rounded-full p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground rounded-full p-2"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {MOCK_GALLERY_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
