"use client"

import { useMemo, useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GuessBreadcrumb } from "@/components/ui/guess-breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Newspaper,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Share2,
  BookOpen,
  TrendingUp,
  Users,
  Eye,
  Heart,
  ArrowRight,
  Star,
  Trophy,
  GraduationCap,
  Palette,
  Microscope,
  Globe,
  Sparkles,
  Bell,
  Download,
} from "lucide-react"

interface NewsArticle {
  id: number
  title: string
  excerpt: string
  content?: string
  author: string
  date: string
  category: string
  image: string
  tags: string[]
  readTime: string
  featured?: boolean
  views?: number
  likes?: number
  comments?: number
  trending?: boolean
}

const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Southville 8B NHS Wins State Science Fair Championship",
    excerpt:
      "Our students dominated the state science fair with groundbreaking projects in environmental science, robotics, and biotechnology, bringing home the championship trophy for the first time in school history.",
    author: "Dr. Sarah Chen",
    date: "2024-02-15",
    category: "Academic Achievement",
    image: "/placeholder.svg?height=400&width=600&text=Science+Fair+Champions",
    tags: ["Science", "Achievement", "State Championship", "STEM"],
    readTime: "5 min read",
    featured: true,
    trending: true,
    views: 2847,
    likes: 156,
    comments: 23,
  },
  {
    id: 2,
    title: "New STEM Laboratory Opens with Cutting-Edge Equipment",
    excerpt:
      "State-of-the-art laboratory facilities now available for advanced chemistry, physics, and biology research, featuring the latest technology and equipment.",
    author: "Principal Martinez",
    date: "2024-02-12",
    category: "Facilities",
    image: "/placeholder.svg?height=300&width=500&text=STEM+Laboratory",
    tags: ["STEM", "Facilities", "Technology", "Innovation"],
    readTime: "3 min read",
    views: 1923,
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    title: "Eagles Basketball Team Advances to State Finals",
    excerpt:
      "Undefeated season continues as our basketball team secures their spot in the state championship game with a thrilling victory over Central High.",
    author: "Coach Johnson",
    date: "2024-02-10",
    category: "Athletics",
    image: "/placeholder.svg?height=300&width=500&text=Basketball+Championship",
    tags: ["Basketball", "Championship", "Athletics", "Eagles"],
    readTime: "4 min read",
    trending: true,
    views: 3156,
    likes: 234,
    comments: 45,
  },
  {
    id: 4,
    title: "Student Art Exhibition Showcases Creative Talent",
    excerpt:
      "Annual art exhibition features stunning works from our talented visual arts students, displaying creativity across multiple mediums and styles.",
    author: "Ms. Rodriguez",
    date: "2024-02-08",
    category: "Arts & Culture",
    image: "/placeholder.svg?height=300&width=500&text=Art+Exhibition",
    tags: ["Arts", "Exhibition", "Students", "Creativity"],
    readTime: "3 min read",
    views: 1456,
    likes: 78,
    comments: 18,
  },
  {
    id: 5,
    title: "College Fair Connects Students with Universities",
    excerpt:
      "Over 50 colleges and universities participated in our annual college fair event, providing students with valuable information about higher education opportunities.",
    author: "Counseling Department",
    date: "2024-02-05",
    category: "College Prep",
    image: "/placeholder.svg?height=300&width=500&text=College+Fair",
    tags: ["College", "Career", "Future", "Universities"],
    readTime: "2 min read",
    views: 987,
    likes: 45,
    comments: 8,
  },
  {
    id: 6,
    title: "Environmental Club Launches Campus Sustainability Initiative",
    excerpt:
      "Student-led initiative aims to make our campus carbon neutral by 2025 through innovative green practices and community engagement.",
    author: "Environmental Club",
    date: "2024-02-03",
    category: "Environment",
    image: "/placeholder.svg?height=300&width=500&text=Sustainability+Initiative",
    tags: ["Environment", "Sustainability", "Student Initiative", "Green"],
    readTime: "4 min read",
    views: 1234,
    likes: 67,
    comments: 15,
  },
  {
    id: 7,
    title: "Drama Club Prepares for Spring Musical Production",
    excerpt:
      "Students rehearse for the upcoming spring musical 'Hamilton', showcasing exceptional talent and dedication in preparation for the March performances.",
    author: "Ms. Thompson",
    date: "2024-02-01",
    category: "Arts & Culture",
    image: "/placeholder.svg?height=300&width=500&text=Spring+Musical",
    tags: ["Drama", "Musical", "Hamilton", "Performance"],
    readTime: "3 min read",
    views: 1678,
    likes: 92,
    comments: 21,
  },
  {
    id: 8,
    title: "National Honor Society Inducts New Members",
    excerpt:
      "Ceremony recognizes outstanding students for their academic excellence, leadership, service, and character in a prestigious induction ceremony.",
    author: "NHS Advisor",
    date: "2024-01-30",
    category: "Academic Achievement",
    image: "/placeholder.svg?height=300&width=500&text=NHS+Induction",
    tags: ["NHS", "Honor Society", "Academic Excellence", "Leadership"],
    readTime: "2 min read",
    views: 1345,
    likes: 76,
    comments: 11,
  },
]

const categories = [
  { value: "all", label: "All Categories", icon: Newspaper },
  { value: "Academic Achievement", label: "Academic", icon: GraduationCap },
  { value: "Athletics", label: "Athletics", icon: Trophy },
  { value: "Arts & Culture", label: "Arts & Culture", icon: Palette },
  { value: "Facilities", label: "Facilities", icon: Microscope },
  { value: "College Prep", label: "College Prep", icon: BookOpen },
  { value: "Environment", label: "Environment", icon: Globe },
]

export default function NewsClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [featuredRef, featuredInView] = useIntersectionObserver({ threshold: 0.1 })
  const [newsRef, newsInView] = useIntersectionObserver({ threshold: 0.1 })

  const filteredAndSortedNews = useMemo(() => {
    const filtered = newsArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort articles
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
      case "trending":
        filtered.sort((a, b) => {
          if (a.trending && !b.trending) return -1
          if (!a.trending && b.trending) return 1
          return (b.views || 0) - (a.views || 0)
        })
        break
    }

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const featuredNews = newsArticles.filter((article) => article.featured)
  const trendingNews = newsArticles.filter((article) => article.trending).slice(0, 3)
  const regularNews = filteredAndSortedNews.filter((article) => !article.featured)

  return (
    <div className="min-h-screen bg-background">
      <GuessBreadcrumb items={[{ label: "News" }]} />
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={cn("animate-fadeIn", heroInView && "animate-slideInUp")}>
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 text-base px-6 py-3">
              <Newspaper className="w-5 h-5 mr-2" />
              Latest School News
              <Sparkles className="w-5 h-5 ml-2" />
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              News & <span className="text-yellow-300">Updates</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 leading-relaxed text-white/90">
              Stay informed with the latest happenings, achievements, and important announcements from our vibrant
              school community.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { number: "150+", label: "Articles", icon: Newspaper },
                { number: "12", label: "Categories", icon: Tag },
                { number: "5K+", label: "Readers", icon: Users },
                { number: "95%", label: "Engagement", icon: TrendingUp },
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
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Filters */}
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
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 mt-4">
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
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section ref={featuredRef} className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className={cn("text-center mb-12", featuredInView && "animate-fadeIn")}>
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Featured Stories
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Spotlight <span className="gradient-text">News</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't miss these important stories from our school community
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredNews.map((article, index) => (
                <AnimatedCard
                  key={article.id}
                  className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 animate-slideInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Featured</Badge>
                      {article.trending && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    {/* Article stats */}
                    <div className="absolute bottom-4 right-4 flex gap-3 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {article.likes}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-sm text-muted-foreground">{article.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {article.id === 1 ? (
                        <AnimatedButton variant="gradient" className="flex-1" asChild>
                          <Link href={`/guess/news/science-fair-champions`}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Article
                          </Link>
                        </AnimatedButton>
                      ) : (
                        <AnimatedButton variant="gradient" className="flex-1" asChild>
                          <Link href={`/guess/news/${article.id}`}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Article
                          </Link>
                        </AnimatedButton>
                      )}
                      <AnimatedButton variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main News Grid */}
      <section ref={newsRef} className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("flex items-center justify-between mb-12", newsInView && "animate-fadeIn")}>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Latest <span className="gradient-text">Articles</span>
              </h2>
              <p className="text-muted-foreground">
                {filteredAndSortedNews.length} article{filteredAndSortedNews.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Trending sidebar toggle for mobile */}
            <div className="lg:hidden">
              <AnimatedButton variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </AnimatedButton>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="lg:col-span-3">
              {filteredAndSortedNews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {regularNews.map((article, index) => (
                    <AnimatedCard
                      key={article.id}
                      className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 animate-slideInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="outline" className="bg-white/95 text-gray-900">
                            {article.category}
                          </Badge>
                        </div>
                        {article.trending && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Hot
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                          <span>{article.readTime}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views?.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {article.likes}
                            </div>
                          </div>
                        </div>

                        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <AnimatedButton variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/guess/news/${article.id}`}>
                              Read More
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </AnimatedButton>
                          <AnimatedButton variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </AnimatedButton>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Articles */}
              <AnimatedCard className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  Trending Now
                </h3>
                <div className="space-y-4">
                  {trendingNews.map((article, index) => (
                    <div key={article.id} className="flex gap-3 group cursor-pointer">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {article.views?.toLocaleString()}
                          <span>•</span>
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>

              {/* Categories */}
              <AnimatedCard className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => {
                    const count = newsArticles.filter((article) => article.category === category.value).length
                    return (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors hover:bg-muted",
                          selectedCategory === category.value && "bg-primary/10 text-primary",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </AnimatedCard>

              {/* Newsletter Signup */}
              <AnimatedCard className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="text-center">
                  <Bell className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-bold mb-2">Stay Updated</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get the latest news delivered to your inbox</p>
                  <div className="space-y-3">
                    <Input placeholder="Enter your email" className="text-sm" />
                    <AnimatedButton variant="gradient" size="sm" className="w-full">
                      Subscribe
                    </AnimatedButton>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Join 2,000+ subscribers</p>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to contribute?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Have a story to share? Join our student journalism team and help keep our community informed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              asChild
            >
              <Link href="/guess/contact">
                <Users className="w-5 h-5 mr-2" />
                Join Our Team
              </Link>
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Download className="w-5 h-5 mr-2" />
              Download App
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
