"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Newspaper,
  CalendarIcon,
  Clock,
  User,
  Tag,
  Share2,
  BookOpen,
  Trophy,
  Users,
  Music,
  Palette,
  Microscope,
  Globe,
  Heart,
} from "lucide-react"

export default function NewsEventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedCategory, setSelectedCategory] = useState("All")

  const featuredNews = {
    id: 1,
    title: "Southville 8B NHS Wins State Science Fair Championship",
    excerpt:
      "Our students dominated the state science fair with groundbreaking projects in environmental science, robotics, and biotechnology, bringing home the championship trophy.",
    content:
      "In an unprecedented achievement, Southville 8B National High School has claimed the state science fair championship for the first time in school history. The victory came after months of preparation by our dedicated students and faculty mentors.",
    author: "Dr. Sarah Chen",
    date: "2024-02-10",
    category: "Academic Achievement",
    image: "/placeholder.svg?height=400&width=800",
    tags: ["Science", "Achievement", "State Championship"],
    readTime: "5 min read",
    featured: true,
  }

  const newsArticles = [
    {
      id: 2,
      title: "New STEM Laboratory Opens with Cutting-Edge Equipment",
      excerpt:
        "State-of-the-art laboratory facilities now available for advanced chemistry, physics, and biology research.",
      author: "Principal Martinez",
      date: "2024-02-08",
      category: "Facilities",
      image: "/placeholder.svg?height=250&width=400",
      tags: ["STEM", "Facilities", "Technology"],
      readTime: "3 min read",
    },
    {
      id: 3,
      title: "Eagles Basketball Team Advances to State Finals",
      excerpt: "Undefeated season continues as our basketball team secures their spot in the state championship game.",
      author: "Coach Johnson",
      date: "2024-02-05",
      category: "Athletics",
      image: "/placeholder.svg?height=250&width=400",
      tags: ["Basketball", "Championship", "Athletics"],
      readTime: "4 min read",
    },
    {
      id: 4,
      title: "Student Art Exhibition Showcases Creative Talent",
      excerpt: "Annual art exhibition features stunning works from our talented visual arts students.",
      author: "Ms. Rodriguez",
      date: "2024-02-03",
      category: "Arts",
      image: "/placeholder.svg?height=250&width=400",
      tags: ["Arts", "Exhibition", "Students"],
      readTime: "3 min read",
    },
    {
      id: 5,
      title: "College Fair Connects Students with Universities",
      excerpt: "Over 50 colleges and universities participated in our annual college fair event.",
      author: "Counseling Department",
      date: "2024-02-01",
      category: "College Prep",
      image: "/placeholder.svg?height=250&width=400",
      tags: ["College", "Career", "Future"],
      readTime: "2 min read",
    },
    {
      id: 6,
      title: "Environmental Club Launches Campus Sustainability Initiative",
      excerpt: "Student-led initiative aims to make our campus carbon neutral by 2025.",
      author: "Environmental Club",
      date: "2024-01-28",
      category: "Environment",
      image: "/placeholder.svg?height=250&width=400",
      tags: ["Environment", "Sustainability", "Student Initiative"],
      readTime: "4 min read",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Spring Musical Auditions",
      date: "2024-02-20",
      time: "3:30 PM",
      location: "Auditorium",
      category: "Arts",
      description: "Auditions for our spring production of 'High School Musical'",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "Science Olympiad Regional Competition",
      date: "2024-02-25",
      time: "8:00 AM",
      location: "University Campus",
      category: "Academic",
      description: "Regional competition for Science Olympiad team",
      icon: <Microscope className="w-5 h-5" />,
    },
    {
      id: 3,
      title: "Parent-Teacher Conferences",
      date: "2024-03-01",
      time: "4:00 PM",
      location: "School Campus",
      category: "Academic",
      description: "Quarterly parent-teacher conference sessions",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 4,
      title: "Art Show Opening Night",
      date: "2024-03-05",
      time: "6:00 PM",
      location: "Arts Center",
      category: "Arts",
      description: "Opening reception for student art exhibition",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: 5,
      title: "State Basketball Championship",
      date: "2024-03-08",
      time: "7:00 PM",
      location: "State Arena",
      category: "Athletics",
      description: "Eagles vs. Central High for state title",
      icon: <Trophy className="w-5 h-5" />,
    },
  ]

  const categories = ["All", "Academic Achievement", "Athletics", "Arts", "Facilities", "College Prep", "Environment"]

  const filteredNews =
    selectedCategory === "All" ? newsArticles : newsArticles.filter((article) => article.category === selectedCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-white/10 rounded-full blur-lg animate-pulse delay-700"></div>
        </div>

        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Newspaper className="w-4 h-4 mr-2" />
            Stay Informed
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            News & <span className="text-yellow-300">Events</span>
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-white/90 mb-6" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Stay connected with the latest happenings, achievements, and upcoming events in our vibrant school
            community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-black dark:text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Latest Stories
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-black dark:text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              View Calendar
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section id="latest" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Featured <span className="gradient-text">Story</span>
            </h2>
          </div>

          <AnimatedCard variant="lift" className="overflow-hidden max-w-6xl mx-auto animate-fadeIn">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative">
                <img
                  src={featuredNews.image || "/placeholder.svg"}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover min-h-[300px]"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-vibrant-orange to-vibrant-red text-white">
                    Featured Story
                  </Badge>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredNews.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredNews.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(featuredNews.date).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold mb-4 gradient-text">{featuredNews.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">{featuredNews.excerpt}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredNews.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4">
                  <AnimatedButton variant="gradient" animation="glow">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Full Story
                  </AnimatedButton>
                  <AnimatedButton variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* News Articles */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Latest <span className="gradient-text">News</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the most recent news and announcements from our school community.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <AnimatedButton
                key={category}
                variant={selectedCategory === category ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                animation="lift"
              >
                {category}
              </AnimatedButton>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((article, index) => (
              <AnimatedCard
                key={article.id}
                variant="lift"
                className="overflow-hidden animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  </div>

                  <h3 className="font-bold text-lg mb-3 line-clamp-2 hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>By {article.author}</span>
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <AnimatedButton variant="outline" size="sm" className="w-full">
                    Read More
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Events Calendar */}
      <section id="calendar" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-slideInLeft">
              <Badge variant="secondary" className="mb-4">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Upcoming Events
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Event <span className="gradient-text">Calendar</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Don't miss out on the exciting events happening throughout the school year. Mark your calendars and join
                us for these special occasions.
              </p>

              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <AnimatedCard
                    key={event.id}
                    variant="lift"
                    className="animate-slideInLeft"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-lg flex items-center justify-center text-white">
                        {event.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              <div className="mt-8">
                <AnimatedButton variant="gradient" size="lg" animation="glow">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  View Full Calendar
                </AnimatedButton>
              </div>
            </div>

            <div className="animate-slideInRight">
              <AnimatedCard variant="gradient" className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Interactive Calendar</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mx-auto"
                />
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold">This Month's Highlights</h4>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{event.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(event.date).getDate()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="highlights" className="relative py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Stay Connected</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-blue-600 mb-6" />
          <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
            Subscribe to our newsletter and never miss important school updates, news, and event announcements.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <AnimatedButton variant="default" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Subscribe
              </AnimatedButton>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Join 2,000+ parents and students who stay informed weekly.
            </p>
          </div>
        </div>
      </section>

      {/* Social Media & Connect */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Follow Us</h2>
          <div className="mx-auto h-1 w-16 rounded-full bg-blue-600 mb-6" />
          <p className="text-lg mb-8 max-w-xl mx-auto text-muted-foreground">
            Stay connected with our school community on social media.
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            {[
              { icon: Globe, label: "Website", href: "#" },
              { icon: Heart, label: "Community", href: "#" },
            ].map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md"
                  aria-label={social.label}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
