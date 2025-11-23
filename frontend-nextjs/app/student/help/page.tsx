"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import StudentLayout from "@/components/student/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Users,
  FileText,
  Video,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Zap,
  Shield,
  Calendar,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Star,
  Brain,
  User,
  Home,
  Tag,
  Eye,
  Bookmark,
  Share2,
  Download,
  PlayCircle,
  BarChart3,
  ThumbsUp,
  MessageCircle,
  Info,
  AlertCircle,
  RefreshCw,
  Filter,
  X,
  Layers,
  GraduationCap,
  Settings,
  FileQuestion,
  NotebookPen,
  Trophy,
  Target,
  Wrench,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { helpArticles, getArticlesByCategory } from "@/lib/help-articles-data"

// Re-export for local use
const localHelpArticles = helpArticles

const faqItems = [
  {
    id: 'forgot-password',
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click on "Forgot Password" on the login page. Enter your registered email address and follow the instructions sent to your email to reset your password. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
    category: 'account',
    helpful: 45,
    views: 890,
  },
  {
    id: 'cannot-login',
    question: 'I cannot log in to my account. What should I do?',
    answer: 'First, verify that you\'re using the correct username and password. Make sure Caps Lock is off and there are no extra spaces. Clear your browser cache and cookies, then try again. If the problem persists, contact the IT support team at support@southville8bnhs.edu.ph or call the support hotline at +1 (234) 567-8900.',
    category: 'account',
    helpful: 67,
    views: 1234,
  },
  {
    id: 'view-assignments',
    question: 'Where can I find my assignments?',
    answer: 'You can find all your assignments in the Courses section. Click on any subject to see upcoming assignments with their due dates, requirements, and submission status. You can also filter by pending, submitted, or overdue assignments.',
    category: 'academics',
    helpful: 89,
    views: 2567,
  },
  {
    id: 'submit-late',
    question: 'Can I submit assignments after the deadline?',
    answer: 'Late submissions depend on your teacher\'s policy. Some assignments may accept late submissions with penalties (usually 10% deduction per day), while others may not accept late work at all. Always check the assignment details and communicate with your teacher if you need an extension.',
    category: 'academics',
    helpful: 56,
    views: 1789,
  },
  {
    id: 'grades-update',
    question: 'How often are grades updated?',
    answer: 'Grades are typically updated by teachers within 3-5 business days after assessments are completed. Major exams and projects may take up to a week. You can check your Grades section for the most recent updates. Enable grade notifications to be alerted when new grades are posted.',
    category: 'academics',
    helpful: 112,
    views: 3456,
  },
  {
    id: 'change-schedule',
    question: 'How do I request a schedule change?',
    answer: 'Schedule changes must be approved by the administration. Contact your guidance counselor or academic advisor during office hours to discuss schedule modifications. Submit a formal request form at least 2 weeks before the desired change date. Approval depends on class availability and academic requirements.',
    category: 'academics',
    helpful: 34,
    views: 987,
  },
  {
    id: 'notification-settings',
    question: 'How do I manage my notifications?',
    answer: 'Go to Settings > Notifications to customize which notifications you receive. You can enable or disable notifications for assignments, grades, announcements, events, and messages. Choose between email, push, or in-app notifications. You can also set quiet hours when notifications are muted.',
    category: 'account',
    helpful: 78,
    views: 2234,
  },
  {
    id: 'download-materials',
    question: 'Can I download course materials?',
    answer: 'Yes! Course materials in the Materials section can be downloaded. Click on any material and use the download button to save it to your device. Most file types are supported (PDF, DOCX, PPTX, images). You can download multiple files at once by selecting them.',
    category: 'academics',
    helpful: 123,
    views: 4123,
  },
  {
    id: 'quiz-technical-issues',
    question: 'What should I do if I experience technical issues during a quiz?',
    answer: 'If you encounter technical problems during a quiz, don\'t panic. Your answers are auto-saved every 30 seconds. Take a screenshot of any error messages, note the time, and immediately contact your teacher. Technical support can restore your quiz session if needed.',
    category: 'academics',
    helpful: 91,
    views: 2876,
  },
  {
    id: 'profile-update',
    question: 'How do I update my profile information?',
    answer: 'Navigate to Profile > Edit Profile. You can update your contact information, emergency contacts, and preferences. Some information like student ID and name may require administrative approval to change. Changes usually take effect immediately.',
    category: 'account',
    helpful: 45,
    views: 1456,
  },
  {
    id: 'mobile-app',
    question: 'Is there a mobile app available?',
    answer: 'Yes! The Southville 8B NHS mobile app is available for both iOS and Android. Download it from your device\'s app store. The app provides full access to all portal features with mobile-optimized interfaces. Enable push notifications to stay updated on the go.',
    category: 'account',
    helpful: 134,
    views: 3567,
  },
  {
    id: 'privacy-security',
    question: 'How is my data protected and private?',
    answer: 'We take data privacy seriously. All your information is encrypted and stored securely. Only authorized school personnel and yourself can access your data. Your academic records are protected under FERPA guidelines. Review our Privacy Policy in Settings for more details.',
    category: 'account',
    helpful: 67,
    views: 1890,
  },
]

const gettingStartedItems = [
  {
    title: 'First Login & Setup',
    description: 'Complete guide to logging in for the first time and setting up your account',
    steps: [
      'Log in with credentials provided by your school',
      'Complete your profile information',
      'Set up your notification preferences',
      'Explore the dashboard and navigation',
    ],
  },
  {
    title: 'Navigating the Portal',
    description: 'Learn how to efficiently navigate through all sections of the portal',
    steps: [
      'Familiarize yourself with the sidebar navigation',
      'Use the search bar to quickly find features',
      'Access your most-used sections from the dashboard',
      'Customize your dashboard layout',
    ],
  },
  {
    title: 'Viewing Your Grades',
    description: 'Understand how to view and interpret your academic grades',
    steps: [
      'Navigate to the Grades section',
      'Select the academic period you want to view',
      'Review grades by subject',
      'Check detailed breakdowns and comments',
    ],
  },
  {
    title: 'Managing Assignments',
    description: 'Learn how to view, track, and submit your assignments',
    steps: [
      'Go to Courses section to see all assignments',
      'View assignment details and due dates',
      'Submit assignments before deadlines',
      'Track your submission status',
    ],
  },
  {
    title: 'Taking Online Quizzes',
    description: 'Complete guide to accessing and taking quizzes',
    steps: [
      'Navigate to Quiz Central',
      'View available quizzes and their deadlines',
      'Read instructions carefully before starting',
      'Submit your answers within the time limit',
    ],
  },
]

const categories = [
  {
    id: 'guides',
    title: 'Guides',
    description: 'Step-by-step tutorials and walkthroughs',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-600',
    count: 12,
    articles: localHelpArticles.filter(a => a.type === 'guide').length,
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions and answers',
    icon: HelpCircle,
    color: 'from-emerald-500 to-teal-600',
    count: faqItems.length,
    articles: faqItems.length,
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with other students and get help',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    count: 5,
    articles: 5,
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: Video,
    color: 'from-red-500 to-pink-600',
    count: 8,
    articles: localHelpArticles.filter(a => a.videoAvailable).length,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fix common issues and problems',
    icon: AlertCircle,
    color: 'from-orange-500 to-amber-600',
    count: 6,
    articles: localHelpArticles.filter(a => a.type === 'troubleshooting').length,
  },
  {
    id: 'account',
    title: 'Account & Settings',
    description: 'Manage your account and preferences',
    icon: Settings,
    color: 'from-indigo-500 to-blue-600',
    count: 7,
    articles: localHelpArticles.filter(a => a.category === 'account').length,
  },
]

const articleCategories = [
  { id: 'all', label: 'All Articles', count: localHelpArticles.length },
  { id: 'getting-started', label: 'Getting Started', icon: Sparkles, count: localHelpArticles.filter(a => a.category === 'getting-started').length },
  { id: 'academics', label: 'Academics', icon: GraduationCap, count: localHelpArticles.filter(a => a.category === 'academics').length },
  { id: 'account', label: 'Account', icon: User, count: localHelpArticles.filter(a => a.category === 'account').length },
  { id: 'student-life', label: 'Student Life', icon: Users, count: localHelpArticles.filter(a => a.category === 'student-life').length },
  { id: 'tools', label: 'Tools', icon: Wrench, count: localHelpArticles.filter(a => a.category === 'tools').length },
  { id: 'support', label: 'Support', icon: HelpCircle, count: localHelpArticles.filter(a => a.category === 'support').length },
]

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function HelpCenterPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string>("all")
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set())

  // Filter articles and FAQs based on search and category
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      let articles = localHelpArticles
      if (selectedCategory) {
        articles = articles.filter(a => {
          if (selectedCategory === 'video-tutorials') return a.videoAvailable
          if (selectedCategory === 'troubleshooting') return a.type === 'troubleshooting'
          if (selectedCategory === 'guides') return a.type === 'guide'
          return a.category === selectedCategory || selectedCategory === 'faq'
        })
      }
      if (selectedArticleCategory !== 'all') {
        articles = articles.filter(a => a.category === selectedArticleCategory)
      }
      return {
        articles,
        faqs: selectedCategory === 'faq' ? faqItems : faqItems.filter(f => !selectedCategory || f.category === selectedCategory),
      }
    }

    const query = searchQuery.toLowerCase()
    return {
      articles: localHelpArticles.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
      ),
      faqs: faqItems.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      ),
    }
  }, [searchQuery, selectedCategory, selectedArticleCategory])

  const popularArticles = localHelpArticles.filter(a => a.featured).slice(0, 4)
  const featuredArticles = localHelpArticles.filter(a => a.featured)
  const recentArticles = localHelpArticles.slice(0, 6)
  const videoArticles = localHelpArticles.filter(a => a.videoAvailable)

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  // Statistics
  const stats = {
    totalArticles: localHelpArticles.length,
    totalFAQs: faqItems.length,
    totalViews: localHelpArticles.reduce((sum, a) => sum + a.views, 0),
    totalLikes: localHelpArticles.reduce((sum, a) => sum + a.likes, 0),
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Help Center</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                How can we <span className="text-emerald-200">help you?</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
                Find answers, guides, and tutorials to make the most of your student portal
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Start typing your search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-6 text-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-0 rounded-2xl shadow-xl focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Button
                    size="sm"
                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl px-4 h-10"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              <p className="text-sm text-emerald-100 mt-4">Or choose an option below...</p>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        {!searchQuery && (
          <div className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalArticles}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Help Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalFAQs}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">FAQs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalLikes}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Helpful Votes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          {!searchQuery && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <Link href="/student" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 dark:text-slate-100 font-medium">Help Center</span>
            </div>
          )}

          {/* Category Cards */}
          {!searchQuery && (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  return (
                    <Card
                      key={category.id}
                      className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${isSelected ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:border-transparent bg-white dark:bg-slate-800/50'} backdrop-blur-sm`}
                      onClick={() => {
                        setSelectedCategory(isSelected ? null : category.id)
                        // Scroll to filtered results
                        setTimeout(() => {
                          document.getElementById('category-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 100)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{category.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{category.count} articles</span>
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Category Filtered Results */}
              {selectedCategory && (
                <div id="category-results" className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const selectedCat = categories.find(c => c.id === selectedCategory)
                        const CatIcon = selectedCat?.icon || HelpCircle
                        return (
                          <>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedCat?.color || 'from-emerald-500 to-teal-600'} flex items-center justify-center shadow-lg`}>
                              <CatIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {selectedCat?.title || 'Category'}
                              </h2>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {filteredContent.articles.length + filteredContent.faqs.length} results
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="text-slate-600 dark:text-slate-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filter
                    </Button>
                  </div>

                  {/* Filtered Articles */}
                  {filteredContent.articles.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        Articles ({filteredContent.articles.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContent.articles.map((article) => {
                          const Icon = article.icon
                          const isBookmarked = bookmarkedArticles.has(article.id)
                          return (
                            <Card
                              key={article.id}
                              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-800/50 relative"
                              onClick={() => router.push(`/student/help/${article.id}`)}
                            >
                              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                {article.videoAvailable && (
                                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                    <PlayCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBookmark(article.id)
                                  }}
                                >
                                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                                </Button>
                              </div>

                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${article.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-12">
                                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                                      {article.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                      {article.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge className={`text-xs ${difficultyColors[article.difficulty as keyof typeof difficultyColors]}`}>
                                        {article.difficulty}
                                      </Badge>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Filtered FAQs */}
                  {filteredContent.faqs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                        FAQs ({filteredContent.faqs.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredContent.faqs.map((faq) => (
                          <Card
                            key={faq.id}
                            className="hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-800/50"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-3">
                                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">
                                    {faq.question}
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                    {faq.answer}
                                  </p>
                                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-3 h-3" />
                                      {faq.helpful} helpful
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {faq.views.toLocaleString()} views
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {filteredContent.articles.length === 0 && filteredContent.faqs.length === 0 && (
                    <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <CardContent className="p-12 text-center">
                        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          No results in this category
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Try selecting a different category or browse all articles
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCategory(null)}
                          className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          Clear Filter
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Search Results
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Found {filteredContent.articles.length + filteredContent.faqs.length} results for "{searchQuery}"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-600 dark:text-slate-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear search
                </Button>
              </div>

              {(filteredContent.articles.length > 0 || filteredContent.faqs.length > 0) ? (
                <div className="space-y-4">
                  {filteredContent.articles.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Articles ({filteredContent.articles.length})
                      </h3>
                      <div className="space-y-4">
                        {filteredContent.articles.map((article) => {
                          const Icon = article.icon
                          const isBookmarked = bookmarkedArticles.has(article.id)
                          return (
                            <Card
                              key={article.id}
                              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-800/50 relative"
                              onClick={() => router.push(`/student/help/${article.id}`)}
                            >
                              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                {article.videoAvailable && (
                                  <Badge className="bg-red-600 text-white">
                                    <Video className="w-3 h-3 mr-1" />
                                    Video
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBookmark(article.id)
                                  }}
                                >
                                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                                </Button>
                              </div>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${article.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg relative`}>
                                    <Icon className="w-7 h-7 text-white" />
                                  </div>
                                  <div className="flex-1 pr-16">
                                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                      {article.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <Badge className={`text-xs ${difficultyColors[article.difficulty as keyof typeof difficultyColors]}`}>
                                        {article.difficulty}
                                      </Badge>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {article.readingTime}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {article.views.toLocaleString()}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <ThumbsUp className="w-3 h-3" />
                                        {article.likes}
                                      </span>
                                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                                        {article.type}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {article.tags.slice(0, 4).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {filteredContent.faqs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        FAQs ({filteredContent.faqs.length})
                      </h3>
                      <Accordion type="single" collapsible className="space-y-3">
                        {filteredContent.faqs.map((faq) => (
                          <AccordionItem
                            key={faq.id}
                            value={faq.id}
                            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <div className="flex items-start gap-4 w-full">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                  <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                    {faq.question}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-3 h-3" />
                                      {faq.helpful} helpful
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {faq.views.toLocaleString()} views
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="ml-14">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <CardContent className="p-12 text-center">
                    <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No results found
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      We couldn't find anything matching "{searchQuery}"
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Search
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => window.location.href = 'mailto:support@southville8bnhs.edu.ph'}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Getting Started Section */}
          {!searchQuery && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Getting Started</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    New to the portal? Follow these guides to get up and running quickly
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {gettingStartedItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="ml-14 space-y-3">
                        {item.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Featured Articles */}
          {!searchQuery && featuredArticles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-500 fill-current" />
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Featured Articles</h2>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Most Popular
                  </Badge>
                </div>
                <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400">
                  View all
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.slice(0, 4).map((article) => {
                  const Icon = article.icon
                  const isBookmarked = bookmarkedArticles.has(article.id)
                  return (
                    <Card
                      key={article.id}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-800/50 relative overflow-hidden"
                      onClick={() => router.push(`/student/help/${article.id}`)}
                    >
                      {/* Featured Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBookmark(article.id)
                            }}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.share?.({ title: article.title, url: `/student/help/${article.id}` })
                            }}
                          >
                            <Share2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${article.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg relative`}>
                            <Icon className="w-8 h-8 text-white" />
                            {article.videoAvailable && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <PlayCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-16">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {article.title}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                              {article.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={`text-xs ${difficultyColors[article.difficulty as keyof typeof difficultyColors]}`}>
                                {article.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3" />
                                {article.readingTime}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Eye className="w-3 h-3" />
                                {article.views.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <ThumbsUp className="w-3 h-3" />
                                {article.likes}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                                {article.type}
                              </span>
                              {article.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Video Tutorials Section */}
          {!searchQuery && videoArticles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Video Tutorials</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Watch step-by-step video guides</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoArticles.slice(0, 6).map((article) => {
                  const Icon = article.icon
                  return (
                    <Card
                      key={article.id}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-200 dark:hover:border-red-800 bg-white dark:bg-slate-800/50 overflow-hidden"
                      onClick={() => router.push(`/student/help/${article.id}`)}
                    >
                      <div className={`h-32 bg-gradient-to-r ${article.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                            <PlayCircle className="w-8 h-8 text-red-600" />
                          </div>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-600 text-white">Video</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {article.readingTime}
                          <span className="mx-1">•</span>
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* All Articles with Category Filter */}
          {!searchQuery && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Articles</h2>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {articleCategories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedArticleCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedArticleCategory(cat.id)}
                      className={`${selectedArticleCategory === cat.id 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                        : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {cat.label}
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                        {cat.count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.articles.map((article) => {
                  const Icon = article.icon
                  const isBookmarked = bookmarkedArticles.has(article.id)
                  return (
                    <Card
                      key={article.id}
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-800/50 relative"
                      onClick={() => router.push(`/student/help/${article.id}`)}
                    >
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                        {article.videoAvailable && (
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <PlayCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(article.id)
                          }}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                        </Button>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${article.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 pr-12">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {article.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={`text-xs ${difficultyColors[article.difficulty as keyof typeof difficultyColors]}`}>
                                {article.difficulty}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readingTime}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                                {article.type}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{article.updated}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {!searchQuery && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {faqItems.length} common questions answered
                    </p>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-3 mb-6">
                {faqItems.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            {faq.question}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {faq.helpful} helpful
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {faq.views.toLocaleString()} views
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="ml-14">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <Button variant="ghost" size="sm" className="h-8 text-xs">
                            <ThumbsUp className="w-3 h-3 mr-2" />
                            Helpful
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs">
                            <MessageCircle className="w-3 h-3 mr-2" />
                            Need more help?
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-6 text-center">
                <Card className="inline-block border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <CardContent className="p-6">
                    <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Can't find what you're looking for?
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Search our knowledge base or contact our support team for personalized assistance
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => setSearchQuery("")}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search Articles
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => window.location.href = 'mailto:support@southville8bnhs.edu.ph'}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Contact Support */}
          {!searchQuery && (
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Still need help?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          Our support team is here to assist you
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <Button
                        variant="outline"
                        className="justify-start border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => window.location.href = 'mailto:support@southville8bnhs.edu.ph'}
                      >
                        <Mail className="w-4 h-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Email Support</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">support@southville8bnhs.edu.ph</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => window.location.href = 'tel:+1234567890'}
                      >
                        <Phone className="w-4 h-4 mr-3 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Phone Support</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">+1 (234) 567-8900</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-emerald-200 dark:border-emerald-800">
                      <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-center text-slate-900 dark:text-slate-100 mb-1">
                        Support Hours
                      </p>
                      <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                        Monday - Friday<br />
                        8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}

