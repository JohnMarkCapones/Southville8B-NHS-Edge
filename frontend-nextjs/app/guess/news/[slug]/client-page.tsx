"use client"

import React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { AnimatedButton } from "@/components/ui/animated-button"
import { NewsArticle } from "../data-mapping"
import { useQuery } from "@tanstack/react-query"

export default function NewsArticleClient({ article }: { article: NewsArticle }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <AnimatedButton variant="outline" asChild>
            <Link href="/guess/news" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Link>
          </AnimatedButton>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(article.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{article.readTime}</span>
            </div>
            {article.views && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{article.views} views</span>
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {article.excerpt}
          </p>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="mb-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div
              className={cn(
                "prose prose-slate dark:prose-invert max-w-none",
                "prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight",
                "prose-h1:text-3xl prose-h1:mt-16 prose-h1:mb-10 prose-h1:leading-tight",
                "prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight prose-h2:font-semibold",
                "prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:leading-tight prose-h3:font-semibold",
                "prose-h4:text-lg prose-h4:mt-10 prose-h4:mb-5 prose-h4:leading-tight prose-h4:font-semibold",
                "prose-ul:my-10 prose-ul:pl-6",
                "prose-ol:my-10 prose-ol:pl-6",
                "prose-li:my-4 prose-li:leading-relaxed prose-li:tracking-wide",
                "prose-strong:text-foreground prose-strong:font-semibold",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-10",
                "prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm",
                "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-10",
                // Custom styling for main body text - override prose
                "[&>p]:text-xl [&>p]:leading-[1.8] [&>p]:text-foreground/50 [&>p]:mb-8 [&>p]:tracking-wide",
                // Custom styling for headings in main body
                "[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:leading-tight",
                "[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-10 [&>h3]:mb-5 [&>h3]:leading-tight"
              )}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Article Footer */}
        <div className="border-t pt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Published on {new Date(article.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {article.category}
              </Badge>
              {article.featured && (
                <Badge variant="default" className="bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              {article.trending && (
                <Badge variant="default" className="bg-red-500 text-white">
                  Trending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Related News Section */}
        <RelatedNewsSection currentArticleId={article.id} />
      </div>
    </div>
  )
}

// Related News Section Component
function RelatedNewsSection({ currentArticleId }: { currentArticleId: string }) {
  const { data: relatedNews, isLoading } = useQuery({
    queryKey: ['relatedNews', currentArticleId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004'
      const res = await fetch(`${apiUrl}/api/v1/news/public?limit=3`, {
        next: { revalidate: 3600 },
      })
      
      if (!res.ok) return []
      
      const data = await res.json()
      // Filter out current article and return up to 3 related articles
      return data.filter((article: any) => article.id !== currentArticleId).slice(0, 3)
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="mt-16">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!relatedNews || relatedNews.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-12 border-t">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Link href="/guess/news" className="text-sm text-muted-foreground hover:text-primary flex items-center">
            More Stories
            <ArrowRight className="w-4 h-4 ml-1 rotate-45" />
          </Link>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Related <span className="text-primary">News</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay up to date with more exciting developments and achievements from our school community.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {relatedNews.map((relatedArticle: any) => (
          <Link 
            key={relatedArticle.id} 
            href={`/guess/news/${relatedArticle.slug}`}
            className="group block"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={relatedArticle.featured_image || '/placeholder.svg?height=200&width=300&text=News'}
                    alt={relatedArticle.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {relatedArticle.category?.name || 'General'}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(relatedArticle.published_date || relatedArticle.created_at).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {relatedArticle.description || relatedArticle.article_html?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <AnimatedButton asChild>
          <Link href="/guess/news">
            View All News
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </AnimatedButton>
      </div>
    </section>
  )
}
