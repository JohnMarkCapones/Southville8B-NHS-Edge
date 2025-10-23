"use client"

import React from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Newspaper, ArrowRight, Loader2, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { fetchFeaturedNewsFromAPI, NewsArticle } from "@/app/guess/news/data-mapping"
import { useQuery } from "@tanstack/react-query"

// Use dynamic routes for news articles
function getNewsArticleUrl(slug: string): string {
  return `/guess/news/${slug}`
}

export function NewsSection() {
  const { data: apiNews, isLoading, isError } = useQuery<NewsArticle[]>({
    queryKey: ['homepageFeaturedNews'],
    queryFn: () => fetchFeaturedNewsFromAPI(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once for faster fallback
  })

  const newsToDisplay = apiNews || []

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
            <Newspaper className="w-4 h-4 mr-2" />
            Featured News
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Stay Updated with <span className="gradient-text">Latest News</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the latest achievements, events, and stories from our vibrant school community. From academic excellence to sports victories, stay informed about what's happening at Southville 8B NHS.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading news...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsToDisplay.map((article, index) => (
              <AnimatedCard
                key={article.id}
                variant="lift"
                className="animate-slideInUp group cursor-pointer hover:scale-105 transition-all duration-300 overflow-visible relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={getNewsArticleUrl(article.slug)}>
                  <div className="aspect-video relative overflow-hidden mb-4">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                    />
                    <div className="absolute top-2 xs:top-4 right-2 xs:right-4">
                      <Badge
                        variant="secondary"
                        className="bg-blue-500 text-white backdrop-blur-sm text-xs xs:text-sm"
                      >
                        {article.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Box format for md screens and up */}
                  <div className="hidden md:block absolute left-4 xs:left-6 sm:left-8 top-4 xs:top-6 sm:top-8 z-10">
                    <div className="bg-blue-500 backdrop-blur-sm rounded-lg p-2 xs:p-3 shadow-lg">
                      <div className="text-xs xs:text-sm font-bold text-white">
                        {new Date(article.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-blue-100">
                        {new Date(article.date).toLocaleDateString('en-US', { 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 xs:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs xs:text-sm text-muted-foreground">
                        {article.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs xs:text-sm text-muted-foreground">
                        {article.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-lg xs:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm xs:text-base text-muted-foreground line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {article.featured && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {article.trending && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-primary group-hover:underline">
                        <span className="font-medium text-sm">Read More</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <AnimatedButton asChild>
            <Link href="/guess/news">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </AnimatedButton>
        </div>
      </div>
    </section>
  )
}
