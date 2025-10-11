"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VIRTUAL_TOUR_LOCATIONS } from "@/lib/constants"
import Image from "next/image"
import { MapPin, Camera, Navigation, Eye, Maximize2 } from "lucide-react"

export default function VirtualTourPage() {
  const [selectedLocation, setSelectedLocation] = useState(VIRTUAL_TOUR_LOCATIONS[0])
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-vibrant-cyan via-vibrant-emerald to-school-green text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="morphing-shape w-16 h-16 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">Virtual Campus Tour</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slideInLeft">
            Explore our beautiful campus from anywhere in the world with our interactive 360° tour
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Location Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-6">Tour Locations</h2>
            <div className="space-y-4">
              {VIRTUAL_TOUR_LOCATIONS.map((location, index) => (
                <AnimatedCard
                  key={location.id}
                  animation="lift"
                  className={`cursor-pointer transition-all duration-300 animate-fadeIn ${
                    selectedLocation.id === location.id
                      ? "ring-2 ring-vibrant-purple bg-gradient-to-r from-vibrant-purple/10 to-vibrant-pink/10"
                      : "hover:bg-muted/50"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedLocation(location)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin
                        className={`w-5 h-5 ${selectedLocation.id === location.id ? "text-vibrant-purple" : "text-muted-foreground"}`}
                      />
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Main Tour View */}
          <div className="lg:col-span-3">
            <AnimatedCard animation="scale" className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  {selectedLocation.name}
                </CardTitle>
                <p className="text-white/90">{selectedLocation.description}</p>
              </CardHeader>
              <CardContent className="p-0 relative">
                <div className="relative aspect-video bg-gradient-to-br from-muted to-background">
                  <Image
                    src={selectedLocation.image || "/placeholder.svg"}
                    alt={selectedLocation.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-all duration-500"
                  />

                  {/* Interactive Hotspots */}
                  {selectedLocation.hotspots.map((hotspot, index) => (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                      onMouseEnter={() => setActiveHotspot(index)}
                      onMouseLeave={() => setActiveHotspot(null)}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 bg-vibrant-purple rounded-full animate-pulse border-2 border-white shadow-lg hover:scale-125 transition-transform">
                          <div className="absolute inset-0 bg-vibrant-purple rounded-full animate-ping opacity-75"></div>
                        </div>
                        {activeHotspot === index && (
                          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap animate-fadeIn">
                            {hotspot.label}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Tour Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <AnimatedButton
                      variant="outline"
                      size="icon"
                      animation="glow"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <Navigation className="w-4 h-4" />
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="icon"
                      animation="glow"
                      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </AnimatedButton>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Tour Information */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <AnimatedCard animation="lift" gradient="true">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">Interactive Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-vibrant-purple"></Badge>
                      Click hotspots to explore details
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-vibrant-pink"></Badge>
                      360° panoramic views available
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-vibrant-emerald"></Badge>
                      Virtual reality mode supported
                    </li>
                  </ul>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard animation="float" gradient="true">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">Tour Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-vibrant-purple animate-bounce">12</div>
                      <div className="text-xs text-muted-foreground">Locations</div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold text-vibrant-pink animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        45+
                      </div>
                      <div className="text-xs text-muted-foreground">Hotspots</div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold text-vibrant-emerald animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      >
                        4K
                      </div>
                      <div className="text-xs text-muted-foreground">Resolution</div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold text-school-gold animate-bounce"
                        style={{ animationDelay: "0.6s" }}
                      >
                        VR
                      </div>
                      <div className="text-xs text-muted-foreground">Ready</div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
