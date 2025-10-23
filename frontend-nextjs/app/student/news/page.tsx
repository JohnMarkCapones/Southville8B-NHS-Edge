"use client"

import { useState, useMemo, useEffect } from "react"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Calendar,
  User,
  Search,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Filter,
  Share2,
  Bookmark,
  Clock,
  Tag,
  Bell,
  Star,
  ArrowRight,
  Grid3X3,
  List,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useNews, useNewsCategories, useFeaturedNews, useTrendingNews } from "@/hooks/useNews"
import { NewsListSkeleton, FeaturedNewsSkeleton, TrendingNewsSkeleton } from "@/components/ui/news-skeleton"
import { getCategoryName, getAuthorName, formatDate } from "@/lib/api/endpoints/news"
import { NewsArticle, NewsCategory } from "@/types/news"

export default function StudentNewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([])
  const [likedArticles, setLikedArticles] = useState<string[]>([])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  // API data fetching
  const { data: newsResponse, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useNews({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    search: debouncedSearchTerm || undefined,
    sortBy: sortBy as any,
    limit: 50,
  })

  const { data: categories = [], isLoading: categoriesLoading } = useNewsCategories()
  const { data: featuredNews = [], isLoading: featuredLoading } = useFeaturedNews(5)
  const { data: trendingNews = [], isLoading: trendingLoading } = useTrendingNews(3)

  // Transform API categories to match UI format
  const categoriesWithAll = useMemo(() => {
    const apiCategories = categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon || "📰"
    }))
    
    return [
      { value: "all", label: "All News", icon: "📰" },
      ...apiCategories
    ]
  }, [categories])

  const newsArticles = newsResponse?.data || []

  // Since filtering and sorting is now handled by the API, we just use the data directly
  const filteredNews = newsArticles

  // When searching, show all news (max 6). When not searching, filter out featured articles
  const regularNews = debouncedSearchTerm
    ? filteredNews.slice(0, 6)  // Max 6 articles when searching
    : filteredNews.filter((article) => !article.featured)  // Exclude featured when not searching

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  const toggleLike = (articleId: string) => {
    setLikedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  // Error state component
  if (newsError) {
    return (
      <StudentLayout>
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load news</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              We encountered an error while loading the news articles. This might be because the backend API is not running. Please check if the backend server is started and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => refetchNews()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/student/dashboard">Back to Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Sparkles className="w-4 h-4 mr-1" />
                    School News Hub
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Stay Informed</h1>
                <p className="text-white/90 text-lg">
                  Discover the latest updates, achievements, and announcements from our school community
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{newsArticles.length}</div>
                  <div className="text-sm opacity-90">Articles</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{categories.length - 1}</div>
                  <div className="text-sm opacity-90">Categories</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{trendingNews.length}</div>
                  <div className="text-sm opacity-90">Trending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles, tags, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesWithAll.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 h-11">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
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

          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {categoriesWithAll.find((c) => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {!debouncedSearchTerm && (trendingLoading || trendingNews.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                {trendingLoading ? "..." : `${trendingNews.length} articles`}
              </Badge>
            </div>
            {trendingLoading ? (
              <TrendingNewsSkeleton />
            ) : (
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                {trendingNews.map((article) => (
                  <Card
                    key={article.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-red-100"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className="bg-red-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => toggleBookmark(article.id)}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? "fill-current text-yellow-500" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        <span>{article.date}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                          <button
                            onClick={() => toggleLike(article.id)}
                            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${likedArticles.includes(article.id) ? "text-red-500" : ""}`}
                          >
                            <Heart className={`w-3 h-3 ${likedArticles.includes(article.id) ? "fill-current" : ""}`} />
                            {article.likes + (likedArticles.includes(article.id) ? 1 : 0)}
                          </button>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-transparent">
                          <Link
                            href={`/student/news/${article.slug}`}
                            className="flex items-center gap-1"
                          >
                            Read More
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured News */}
        {!debouncedSearchTerm && (featuredLoading || featuredNews.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Stories</h2>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {featuredLoading ? "..." : `${featuredNews.length} featured`}
              </Badge>
            </div>
            {featuredLoading ? (
              <FeaturedNewsSkeleton />
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                {featuredNews.map((article) => (
                  <Card
                    key={article.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-yellow-100"
                  >
                    <div className={`${viewMode === "list" ? "flex" : ""}`}>
                      <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"}`}>
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                          <Badge className="bg-blue-500 text-white capitalize">{getCategoryName(article.category)}</Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={() => toggleBookmark(article.id)}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? "fill-current text-yellow-500" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardHeader>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {getAuthorName(article.author)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {article.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readTime}
                              </span>
                            </div>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{article.excerpt}</p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {(article.tags || []).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views}
                              </span>
                              <button
                                onClick={() => toggleLike(article.id)}
                                className={`flex items-center gap-1 hover:text-red-500 transition-colors ${likedArticles.includes(article.id) ? "text-red-500" : ""}`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${likedArticles.includes(article.id) ? "fill-current" : ""}`}
                                />
                                {article.likes + (likedArticles.includes(article.id) ? 1 : 0)}
                              </button>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {article.comments}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-transparent">
                                <Link
                                  href={`/student/news/${article.slug}`}
                                  className="flex items-center gap-1"
                                >
                                  Read More
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {debouncedSearchTerm ? "Search Results" : "Latest News"}
              </h2>
              <Badge variant="outline">
                {regularNews.length} article{regularNews.length !== 1 ? "s" : ""}
                {debouncedSearchTerm && " (showing max 6)"}
              </Badge>
            </div>

            {!debouncedSearchTerm && (
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            )}
          </div>

          {newsLoading ? (
            <NewsListSkeleton count={6} viewMode={viewMode} />
          ) : regularNews.length > 0 ? (
            <div
              className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {regularNews.map((article) => (
                <Card
                  key={article.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className={`${viewMode === "list" ? "flex" : ""}`}>
                    <div className={`relative ${viewMode === "list" ? "w-32 sm:w-48 flex-shrink-0" : "aspect-video"}`}>
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500 text-white capitalize">{getCategoryName(article.category)}</Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => toggleBookmark(article.id)}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? "fill-current text-yellow-500" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardHeader className={viewMode === "list" ? "pb-2" : ""}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {getAuthorName(article.author)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readTime}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {article.date}
                          </span>
                        </div>
                        <CardTitle
                          className={`group-hover:text-primary transition-colors line-clamp-2 ${viewMode === "list" ? "text-lg" : "text-lg"}`}
                        >
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={viewMode === "list" ? "pt-0" : ""}>
                        <p
                          className={`text-muted-foreground mb-3 line-clamp-2 ${viewMode === "list" ? "text-sm" : "text-sm"}`}
                        >
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(article.tags || []).slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views}
                            </span>
                            <button
                              onClick={() => toggleLike(article.id)}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${likedArticles.includes(article.id) ? "text-red-500" : ""}`}
                            >
                              <Heart
                                className={`w-4 h-4 ${likedArticles.includes(article.id) ? "fill-current" : ""}`}
                              />
                              {article.likes + (likedArticles.includes(article.id) ? 1 : 0)}
                            </button>
                          </div>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-transparent">
                            <Link
                              href={`/student/news/${article.slug}`}
                              className="flex items-center gap-1"
                            >
                              Read More
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {debouncedSearchTerm
                  ? `No articles matching "${debouncedSearchTerm}" in titles, content, tags, or authors.`
                  : "We couldn't find any articles matching your search criteria. Try adjusting your filters or search terms."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Clear Filters
                </Button>
                <Button variant="ghost">
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notified of New Articles
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 text-center">
          <Bell className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Get the latest school news and announcements delivered directly to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button className="sm:w-auto">Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Join 500+ students and parents who stay informed</p>
        </div>
      </div>
    </StudentLayout>
  )
}
