"use client"

import { useState } from "react"
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
} from "lucide-react"

export default function StudentNewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([])
  const [likedArticles, setLikedArticles] = useState<number[]>([])

  const newsArticles = [
    {
      id: 1,
      title: "Southville 8B NHS Wins Municipal Science Fair",
      excerpt:
        "Our students showcased exceptional scientific innovation and creativity, earning top honors at the municipal level competition.",
      content:
        "In a remarkable display of scientific excellence, Southville 8B NHS students dominated the municipal science fair...",
      author: "Principal Maria Santos",
      date: "2024-03-10",
      category: "achievement",
      image: "/placeholder.svg?height=200&width=400&text=Science+Fair+Victory",
      views: 245,
      likes: 32,
      comments: 8,
      featured: true,
      trending: true,
      readTime: "4 min read",
      tags: ["Science", "Achievement", "Competition"],
    },
    {
      id: 2,
      title: "New Computer Laboratory Opens",
      excerpt: "State-of-the-art computer laboratory with 30 new workstations now available for student use.",
      content:
        "The school is proud to announce the opening of our new computer laboratory equipped with the latest technology...",
      author: "IT Department",
      date: "2024-03-08",
      category: "facility",
      image: "/placeholder.svg?height=200&width=400&text=Computer+Lab",
      views: 189,
      likes: 28,
      comments: 5,
      featured: false,
      trending: false,
      readTime: "3 min read",
      tags: ["Technology", "Facilities", "Learning"],
    },
    {
      id: 3,
      title: "Basketball Team Advances to Regional Finals",
      excerpt:
        "Our varsity basketball team secured their spot in the regional championship after defeating three strong opponents.",
      content:
        "The Southville 8B NHS basketball team has shown exceptional teamwork and skill throughout the tournament...",
      author: "Coach Rodriguez",
      date: "2024-03-05",
      category: "sports",
      image: "/placeholder.svg?height=200&width=400&text=Basketball+Victory",
      views: 312,
      likes: 45,
      comments: 12,
      featured: true,
      trending: true,
      readTime: "5 min read",
      tags: ["Basketball", "Sports", "Championship"],
    },
    {
      id: 4,
      title: "Student Council Elections Announced",
      excerpt:
        "Nominations are now open for the 2024-2025 Student Council positions. Learn about the requirements and timeline.",
      content: "The Student Council elections for the upcoming academic year will be held next month...",
      author: "Student Affairs Office",
      date: "2024-03-03",
      category: "announcement",
      image: "/placeholder.svg?height=200&width=400&text=Student+Elections",
      views: 156,
      likes: 19,
      comments: 6,
      featured: false,
      trending: false,
      readTime: "2 min read",
      tags: ["Elections", "Student Council", "Leadership"],
    },
    {
      id: 5,
      title: "Environmental Club Plants 100 Trees",
      excerpt:
        "As part of Earth Month activities, the Environmental Club successfully planted 100 native trees around the campus.",
      content: "The Environmental Club's tree planting initiative has transformed our campus landscape...",
      author: "Environmental Club",
      date: "2024-02-28",
      category: "environment",
      image: "/placeholder.svg?height=200&width=400&text=Tree+Planting",
      views: 203,
      likes: 38,
      comments: 9,
      featured: false,
      trending: false,
      readTime: "3 min read",
      tags: ["Environment", "Sustainability", "Community"],
    },
    {
      id: 6,
      title: "Drama Club Presents Spring Musical",
      excerpt: "Get ready for an amazing performance of 'High School Musical' featuring our talented drama students.",
      content: "The Drama Club has been rehearsing for months to bring you this spectacular musical production...",
      author: "Ms. Thompson",
      date: "2024-02-25",
      category: "arts",
      image: "/placeholder.svg?height=200&width=400&text=Spring+Musical",
      views: 178,
      likes: 34,
      comments: 7,
      featured: false,
      trending: true,
      readTime: "3 min read",
      tags: ["Drama", "Musical", "Arts"],
    },
    {
      id: 7,
      title: "Math Olympiad Team Wins Regional Competition",
      excerpt: "Our mathematics team brought home first place in the regional Math Olympiad competition.",
      content:
        "The dedication and hard work of our Math Olympiad team has paid off with this outstanding achievement...",
      author: "Mr. Davis",
      date: "2024-02-20",
      category: "achievement",
      image: "/placeholder.svg?height=200&width=400&text=Math+Olympiad",
      views: 267,
      likes: 41,
      comments: 11,
      featured: false,
      trending: false,
      readTime: "4 min read",
      tags: ["Mathematics", "Competition", "Achievement"],
    },
    {
      id: 8,
      title: "New Library Digital Resources Available",
      excerpt:
        "Access thousands of e-books, research databases, and digital learning materials through our upgraded library system.",
      content:
        "The library has expanded its digital collection to provide students with comprehensive online resources...",
      author: "Library Staff",
      date: "2024-02-18",
      category: "facility",
      image: "/placeholder.svg?height=200&width=400&text=Digital+Library",
      views: 134,
      likes: 22,
      comments: 4,
      featured: false,
      trending: false,
      readTime: "2 min read",
      tags: ["Library", "Digital Resources", "Learning"],
    },
  ]

  const categories = [
    { value: "all", label: "All News", icon: "📰" },
    { value: "achievement", label: "Achievements", icon: "🏆" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "facility", label: "Facilities", icon: "🏫" },
    { value: "announcement", label: "Announcements", icon: "📢" },
    { value: "environment", label: "Environment", icon: "🌱" },
    { value: "arts", label: "Arts & Culture", icon: "🎭" },
  ]

  const filteredNews = newsArticles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "popular":
          return b.views - a.views
        case "trending":
          if (a.trending && !b.trending) return -1
          if (!a.trending && b.trending) return 1
          return b.views - a.views
        default:
          return 0
      }
    })

  const featuredNews = filteredNews.filter((article) => article.featured)
  const regularNews = filteredNews.filter((article) => !article.featured)
  const trendingNews = newsArticles.filter((article) => article.trending).slice(0, 3)

  const toggleBookmark = (articleId: number) => {
    setBookmarkedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  const toggleLike = (articleId: number) => {
    setLikedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
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
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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
                  {categories.find((c) => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {trendingNews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                {trendingNews.length} articles
              </Badge>
            </div>
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
                      <span>{new Date(article.date).toLocaleDateString()}</span>
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
                          href={`/student/news/${article.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")}`}
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
          </div>
        )}

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Stories</h2>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {featuredNews.length} featured
              </Badge>
            </div>
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
                        <Badge className="bg-blue-500 text-white capitalize">{article.category}</Badge>
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
                              {article.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.date).toLocaleDateString()}
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
                          {article.tags.map((tag) => (
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
                                href={`/student/news/${article.title
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)/g, "")}`}
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
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <Badge variant="outline">
                {regularNews.length} article{regularNews.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Bell className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>

          {regularNews.length > 0 ? (
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
                        <Badge className="bg-blue-500 text-white capitalize">{article.category}</Badge>
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
                              {article.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readTime}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.date).toLocaleDateString()}
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
                          {article.tags.slice(0, 2).map((tag) => (
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
                              href={`/student/news/${article.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "")}`}
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
                We couldn't find any articles matching your search criteria. Try adjusting your filters or search terms.
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
