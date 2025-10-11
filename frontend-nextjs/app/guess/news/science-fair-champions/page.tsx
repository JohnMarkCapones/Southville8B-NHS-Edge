"use client"

import { Badge } from "@/components/ui/badge"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Trophy,
  Award,
  Users,
  Star,
  Quote,
  Share2,
  BookOpen,
  ChevronRight,
  Eye,
  Heart,
  Tag,
  TrendingUp,
} from "lucide-react"

export default function ScienceFairChampionsPage() {
  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [contentRef, contentInView] = useIntersectionObserver({ threshold: 0.1 })
  const [championsRef, championsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [quotesRef, quotesInView] = useIntersectionObserver({ threshold: 0.1 })

  const articleMeta = {
    title: "Science Fair Champions Advance to Nationals",
    author: "Dr. Sarah Chen",
    date: "2024-02-15",
    readTime: "5 min read",
    category: "Academic Achievement",
    tags: ["Science", "Achievement", "State Championship", "STEM"],
    views: 2847,
    likes: 156,
    comments: 23,
  }

  const champions = [
    {
      name: "Emma Rodriguez",
      grade: "12th Grade",
      project: "Biodegradable Plastic from Algae",
      category: "Environmental Science",
      image: "/placeholder.svg?height=200&width=200&text=Emma+R",
      achievement: "1st Place State",
      description:
        "Revolutionary approach to creating environmentally friendly plastic alternatives using algae biomass.",
    },
    {
      name: "Marcus Chen",
      grade: "11th Grade",
      project: "AI-Powered Medical Diagnosis",
      category: "Computer Science",
      image: "/placeholder.svg?height=200&width=200&text=Marcus+C",
      achievement: "2nd Place State",
      description:
        "Innovative machine learning system for analyzing medical symptoms and providing diagnostic suggestions.",
    },
    {
      name: "Sophia Williams",
      grade: "10th Grade",
      project: "Solar-Powered Water Purification",
      category: "Engineering",
      image: "/placeholder.svg?height=200&width=200&text=Sophia+W",
      achievement: "3rd Place State",
      description: "Portable water purification system powered entirely by solar energy for remote areas.",
    },
  ]

  const quotes = [
    {
      text: "These students represent the future of scientific innovation. Their dedication and creativity have produced solutions to real-world problems that could impact millions of lives.",
      author: "Dr. Sarah Chen",
      role: "Science Department Head",
      image: "/placeholder.svg?height=60&width=60&text=Dr.+Chen",
    },
    {
      text: "I'm incredibly proud of our students' achievements. They've shown that age is no barrier to making meaningful contributions to science and technology.",
      author: "Principal Martinez",
      role: "School Principal",
      image: "/placeholder.svg?height=60&width=60&text=Principal",
    },
  ]

  const relatedNews = [
    {
      title: "New STEM Laboratory Opens",
      excerpt: "State-of-the-art facilities now available for advanced research and learning.",
      date: "2024-02-10",
      category: "Facilities",
      image: "/placeholder.svg?height=200&width=300&text=STEM+Lab",
      href: "/news/stem-laboratory",
    },
    {
      title: "Students Win Regional Math Competition",
      excerpt: "Our math team brings home first place trophy from regional championship.",
      date: "2024-01-28",
      category: "Academic",
      image: "/placeholder.svg?height=200&width=300&text=Math+Competition",
      href: "/news/math-competition",
    },
    {
      title: "Science Olympiad Team Prepares for State",
      excerpt: "Team practices intensively for upcoming state-level competition.",
      date: "2024-01-15",
      category: "Academic",
      image: "/placeholder.svg?height=200&width=300&text=Science+Olympiad",
      href: "/news/science-olympiad",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-8">
        <AnimatedButton variant="outline" className="group mb-8" asChild>
          <Link href="/news">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to News
          </Link>
        </AnimatedButton>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 max-w-4xl">
        <header ref={heroRef} className={cn("mb-12", heroInView && "animate-fadeIn")}>
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-primary border-primary">
              {articleMeta.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(articleMeta.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {articleMeta.readTime}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {articleMeta.author}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">{articleMeta.title}</h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl leading-relaxed mb-8 text-muted-foreground">
            Our brilliant students' innovative projects earn recognition at the state level competition, securing their
            spots at the national science fair championship.
          </p>

          {/* Article Stats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {articleMeta.views.toLocaleString()} views
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {articleMeta.likes} likes
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {articleMeta.comments} comments
              </div>
            </div>

            <div className="flex gap-2">
              <AnimatedButton variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Save
              </AnimatedButton>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {articleMeta.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative mb-12">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
            <img
              src="/placeholder.svg?height=600&width=1200&text=Science+Fair+Champions+Ceremony"
              alt="Science Fair Champions at Award Ceremony"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Trophy className="w-3 h-3 mr-1" />
              Featured Story
            </Badge>
          </div>
        </div>

        {/* Article Content */}
        <div ref={contentRef} className={cn("prose prose-lg max-w-none mb-16", contentInView && "animate-fadeIn")}>
          <p className="text-xl leading-relaxed mb-8 text-muted-foreground">
            In a remarkable display of scientific innovation and academic excellence, three students from Southville 8B
            National High School have secured their positions to compete at the National Science Fair Championship.
            Their groundbreaking projects not only impressed judges at the state level but also demonstrate the
            exceptional quality of STEM education at our institution.
          </p>

          <h2 className="text-3xl font-bold mb-6 text-foreground">A Historic Achievement</h2>
          <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
            This marks the first time in our school's history that three students have simultaneously qualified for the
            national competition. The achievement is particularly noteworthy given the intense competition from over 200
            schools across the state, with more than 1,500 projects submitted for evaluation.
          </p>

          <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
            The state science fair, held at the Convention Center downtown, brought together the brightest young minds
            from across the region. Our students not only competed but excelled, with their projects addressing some of
            today's most pressing global challenges including environmental sustainability, healthcare accessibility,
            and clean energy solutions.
          </p>

          <AnimatedCard className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 mb-8 border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Competition Highlights</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Over 1,500 projects submitted statewide</li>
                  <li>• 200+ schools participated in the competition</li>
                  <li>• Only top 50 projects advance to nationals</li>
                  <li>• Southville 8B NHS secured 3 of those 50 spots</li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Champions Section */}
        <section ref={championsRef} className={cn("mb-16", championsInView && "animate-fadeIn")}>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Our Champions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our <span className="gradient-text">National Qualifiers</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              These exceptional students have earned their place among the nation's top young scientists through
              dedication, innovation, and academic excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {champions.map((champion, index) => (
              <AnimatedCard
                key={champion.name}
                className="text-center group hover:scale-105 transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="relative mb-6">
                    <img
                      src={champion.image || "/placeholder.svg"}
                      alt={champion.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{champion.name}</h3>
                  <p className="text-muted-foreground mb-2">{champion.grade}</p>
                  <Badge variant="secondary" className="mb-4">
                    {champion.achievement}
                  </Badge>
                  <h4 className="text-lg font-semibold mb-2 text-primary">{champion.project}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{champion.category}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{champion.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Quotes Section */}
        <section ref={quotesRef} className={cn("mb-16", quotesInView && "animate-fadeIn")}>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Quote className="w-4 h-4 mr-2" />
              Community Voices
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Words of <span className="gradient-text">Pride</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Hear from faculty and administration about this historic achievement and what it means for our school
              community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {quotes.map((quote, index) => (
              <AnimatedCard
                key={quote.author}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-8">
                  <Quote className="w-8 h-8 text-primary mb-4 opacity-50" />
                  <p className="text-lg leading-relaxed mb-6 text-muted-foreground italic">"{quote.text}"</p>
                  <div className="flex items-center">
                    <img
                      src={quote.image || "/placeholder.svg"}
                      alt={quote.author}
                      className="w-12 h-12 rounded-full mr-4 group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">{quote.author}</h4>
                      <p className="text-sm text-muted-foreground">{quote.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Article Footer */}
        <footer className="border-t pt-8 mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold">{articleMeta.author}</h4>
                <p className="text-sm text-muted-foreground">Science Department Head</p>
              </div>
            </div>

            <div className="flex gap-2">
              <AnimatedButton variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like ({articleMeta.likes})
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </AnimatedButton>
            </div>
          </div>
        </footer>
      </article>

      {/* Related News */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              More Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Related <span className="gradient-text">News</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Stay up to date with more exciting developments and achievements from our school community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {relatedNews.map((article, index) => (
              <AnimatedCard
                key={article.title}
                className="group cursor-pointer hover:scale-105 transition-all duration-300 animate-slideInUp overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                asChild
              >
                <Link href={article.href}>
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
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-sm font-medium">Read more</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="group hover:scale-105 transition-all duration-300"
              asChild
            >
              <Link href="/news">
                View All News
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
