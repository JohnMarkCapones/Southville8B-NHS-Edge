# Chapter 25: Public & Guest Features

**Southville 8B NHS Edge - Technical Documentation**
**Volume 4: Feature Documentation**

---

## Table of Contents

- [25.1 Overview](#251-overview)
- [25.2 Homepage Features](#252-homepage-features)
- [25.3 Public Pages](#253-public-pages)
- [25.4 News & Events System](#254-news--events-system)
- [25.5 School Information Pages](#255-school-information-pages)
- [25.6 Guest Access & Limitations](#256-guest-access--limitations)
- [25.7 Search & Navigation](#257-search--navigation)
- [25.8 Implementation Details](#258-implementation-details)

---

## 25.1 Overview

The public and guest features provide unauthenticated visitors with comprehensive information about Southville 8B National High School. These features are designed to showcase the school's excellence, engage prospective students and parents, and provide easy access to important information.

### Purpose and Goals

The public-facing features serve several key purposes:

1. **Marketing and Recruitment**: Showcase the school's programs, achievements, and facilities to attract prospective students
2. **Information Distribution**: Provide easy access to news, events, and announcements
3. **Transparency**: Demonstrate the school's commitment to openness and community engagement
4. **User Acquisition**: Encourage visitors to register and join the school community

### Key Characteristics

All public features share these characteristics:

- **No Authentication Required**: Accessible to all visitors without login
- **SEO Optimized**: Enhanced with metadata, Open Graph tags, and JSON-LD for search engines
- **Performance Focused**: Static generation and ISR for fast page loads
- **Mobile Responsive**: Fully responsive design for all device sizes
- **Accessible**: WCAG 2.1 compliant for inclusive access

### Route Structure

Public features are organized under the `/guess` route prefix:

```
/guess                      # Homepage
/guess/about               # About the school
/guess/academics           # Academic programs
/guess/news                # News listing
/guess/news/[slug]         # Individual news article
/guess/event               # Events listing
/guess/event/[slug]        # Individual event
/guess/announcements       # Announcements
/guess/clubs               # Clubs listing
/guess/clubs/[slug]        # Individual club
/guess/student-life        # Student life information
/guess/extracurricular     # Extracurricular activities
/guess/contact             # Contact information
/guess/virtual-tour        # Virtual campus tour
/guess/gallery             # Photo gallery
/guess/login               # Login page
```

---

## 25.2 Homepage Features

The homepage (`/guess`) serves as the primary entry point for visitors. It combines engaging visuals, key information, and clear calls-to-action to guide visitors through the school's offerings.

### 25.2.1 Hero Section

The hero section is the first thing visitors see and makes a strong first impression.

#### Visual Design

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\hero-section.tsx

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY
        const parallaxSpeed = 0.3
        heroRef.current.style.transform = `translateY(${scrollY * parallaxSpeed}px)`
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Background Image with Overlay */}
      <div ref={heroRef} className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?width=1920&height=1080&text=Modern+School+Campus"
          alt="Southville 8B NHS Campus"
          fill
          className="object-cover opacity-30 dark:opacity-20"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-sky-600/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* Floating Academic Icons */}
        <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
          <BookOpen className="w-16 h-16 text-blue-600 animate-float" />
        </div>
        <div className="absolute top-32 right-20 opacity-20 dark:opacity-10">
          <GraduationCap className="w-20 h-20 text-indigo-600 animate-float" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 py-20">
          {/* School Badge */}
          <div className="text-center mb-8 animate-fadeIn">
            <Badge className="inline-flex items-center gap-2 px-6 py-3 text-base">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              Excellence in Education Since 2009
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6">
            <span className="text-slate-800 dark:text-white">Welcome to</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
              Southville 8B
            </span>
            <br />
            <span className="text-slate-700 dark:text-slate-200">National High School</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 text-center max-w-4xl mx-auto">
            <span className="font-semibold text-blue-700">Empowering minds</span>,
            <span className="font-semibold text-indigo-700"> inspiring futures</span>, and
            <span className="font-semibold text-sky-700"> building tomorrow's leaders</span>
          </p>
        </div>
      </div>
    </section>
  )
}
```

#### Key Features

The hero section includes:

1. **Parallax Background**: Image moves at different speed than foreground for depth
2. **Animated Elements**: Floating icons and fade-in effects on load
3. **Gradient Text**: Eye-catching gradient on school name
4. **Responsive Typography**: Scales smoothly across device sizes
5. **Dark Mode Support**: Adapts colors and opacity for dark theme

#### Key Highlights Cards

Below the headline, three highlight cards showcase key statistics:

```typescript
{[
  {
    icon: BookOpen,
    title: "Academic Excellence",
    desc: "Comprehensive curriculum with 25+ AP courses",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Vibrant Community",
    desc: "1,200+ students, 85+ dedicated faculty",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Trophy,
    title: "Proven Success",
    desc: "98% college acceptance rate",
    color: "from-sky-500 to-sky-600",
  },
].map((item, index) => (
  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 hover:scale-105 transition-all">
    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl`}>
      <item.icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
    <p className="text-slate-600 text-sm">{item.desc}</p>
  </div>
))}
```

#### Call-to-Action Buttons

Two primary CTAs guide visitors to key pages:

```typescript
<Link href="/guess/academics">
  <AnimatedButton className="bg-gradient-to-r from-blue-600 to-indigo-600">
    <BookOpen className="w-5 h-5 mr-3" />
    Explore Academics
    <ArrowRight className="w-5 h-5 ml-3" />
  </AnimatedButton>
</Link>

<Link href="/guess/virtual-tour">
  <AnimatedButton variant="outline" className="border-2 border-blue-600">
    <Play className="w-5 h-5 mr-3" />
    Virtual Campus Tour
  </AnimatedButton>
</Link>
```

#### Statistics Display

A grid of key statistics builds credibility:

```typescript
{[
  { number: "1,200+", label: "Students", icon: Users },
  { number: "85+", label: "Faculty", icon: GraduationCap },
  { number: "25+", label: "AP Courses", icon: BookOpen },
  { number: "15+", label: "Years Excellence", icon: Trophy },
].map((stat, index) => (
  <div key={index} className="text-center group">
    <stat.icon className="w-8 h-8 mx-auto text-blue-600 group-hover:scale-110" />
    <div className="text-3xl md:text-4xl font-bold">{stat.number}</div>
    <div className="text-sm text-slate-600">{stat.label}</div>
  </div>
))}
```

### 25.2.2 News Section

The homepage features a preview of recent news articles.

#### Component Structure

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\news-section.tsx

export function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestNews()
  }, [])

  const fetchLatestNews = async () => {
    try {
      // Fetch latest 3 news articles
      const response = await fetch('/api/news?limit=3&sort=desc')
      const data = await response.json()
      setNews(data.articles)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Latest News</h2>
          <p className="text-xl text-slate-600">
            Stay updated with our school's achievements and activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/guess/news">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View All News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

#### News Card Component

Each news article is displayed as an engaging card:

```typescript
interface NewsCardProps {
  article: NewsArticle
}

function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/guess/news/${article.slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.image_url || '/placeholder.svg'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
            {article.category}
          </Badge>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600">
            {article.title}
          </h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(article.published_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### 25.2.3 Events Section

Similar to news, upcoming events are showcased on the homepage.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\events-section.tsx

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-xl text-slate-600">
            Join us at our exciting school events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 25.2.4 Clubs Section

A preview of student clubs and organizations:

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\clubs-section.tsx

export function ClubsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Student Clubs</h2>
          <p className="text-xl text-slate-600">
            Discover your passion through our diverse club offerings
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {clubs.map((club) => (
            <Link key={club.id} href={`/guess/clubs/${club.slug}`}>
              <Card className="text-center p-6 hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <club.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{club.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 25.2.5 Announcements Section

Important school announcements are highlighted:

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\announcements-section.tsx

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Important Announcements</h2>
          <p className="text-xl text-slate-300">
            Stay informed about important school updates
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {announcements.slice(0, 5).map((announcement) => (
            <Card key={announcement.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                  <p className="text-slate-300 text-sm">{announcement.excerpt}</p>
                  <div className="mt-2 text-xs text-slate-400">
                    {formatDate(announcement.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/guess/announcements">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              View All Announcements
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### 25.2.6 Image Gallery

A visual showcase of school life:

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\homepage\image-gallery.tsx

export function ImageGallery() {
  const galleryImages = [
    { src: '/gallery/campus-1.jpg', alt: 'School Campus', category: 'Campus' },
    { src: '/gallery/students-1.jpg', alt: 'Students', category: 'Student Life' },
    { src: '/gallery/events-1.jpg', alt: 'School Event', category: 'Events' },
    // ... more images
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Campus Life</h2>
          <p className="text-xl text-slate-600">
            Experience the vibrant life at Southville 8B NHS
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 text-white">
                  <Badge className="mb-2">{image.category}</Badge>
                  <p className="text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/guess/gallery">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Full Gallery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

---

## 25.3 Public Pages

Public pages provide detailed information about the school for prospective students and parents.

### 25.3.1 About Page

The about page tells the school's story and mission.

#### Page Structure

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\about\page.tsx

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Southville 8B National High School in Rodriguez, Rizal — our history, mission, achievements, and the teachers who lead our learners.",
  alternates: { canonical: "/guess/about" },
  openGraph: {
    title: "About Us",
    description: "Learn about Southville 8B National High School...",
    url: "/guess/about",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
}

export default function AboutPage() {
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL + "/" },
    { name: "About", url: SITE_URL + "/guess/about" },
  ])

  return (
    <>
      <JsonLd id="breadcrumb-about" data={breadcrumb} />
      <AboutPageClient />
    </>
  )
}
```

#### About Page Content Sections

The about page includes several key sections:

1. **School History**: Timeline of milestones and achievements
2. **Mission & Vision**: Core values and goals
3. **Leadership**: Principal and administrative team
4. **Accreditations**: Certifications and recognitions
5. **Facilities**: Campus infrastructure overview
6. **Contact Information**: Location and contact details

```typescript
// AboutPageClient.tsx

export default function AboutPageClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">About Southville 8B NHS</h1>
            <p className="text-xl">Excellence in Education Since 2009</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                To provide quality education that develops well-rounded individuals
                equipped with knowledge, skills, and values necessary to become
                responsible and productive members of society.
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-indigo-600">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed">
                To be a center of academic excellence that nurtures future leaders
                committed to nation-building and global competitiveness through
                innovative and inclusive education.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* School History Timeline */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our History</h2>

          <div className="max-w-4xl mx-auto space-y-8">
            {historyMilestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-32 text-right">
                  <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full" />
                  {index < historyMilestones.length - 1 && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-200" />
                  )}
                </div>
                <Card className="flex-1 p-6">
                  <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Leadership</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadershipTeam.map((leader) => (
              <Card key={leader.id} className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={leader.photo}
                    alt={leader.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{leader.position}</p>
                <p className="text-sm text-slate-600">{leader.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 25.3.2 Academics Page

Showcases the school's academic programs and curriculum.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\academics\page.tsx

export const metadata: Metadata = {
  title: "Academics",
  description: "Comprehensive academic programs at Southville 8B NHS. Excellence in STEM, Languages, Arts, and more.",
  alternates: { canonical: "/guess/academics" },
}

export default function AcademicsPage() {
  return <AcademicsClient />
}
```

#### Academic Programs Display

```typescript
// AcademicsClient Component

const academicPrograms = [
  {
    title: "Science, Technology, Engineering, and Mathematics (STEM)",
    icon: Microscope,
    color: "from-blue-500 to-cyan-500",
    description: "Advanced curriculum focusing on scientific inquiry and technological innovation",
    subjects: ["Physics", "Chemistry", "Biology", "Advanced Mathematics", "Computer Science"],
  },
  {
    title: "Humanities and Social Sciences (HUMSS)",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    description: "Comprehensive study of human society, culture, and behavior",
    subjects: ["Psychology", "Sociology", "Philippine History", "World Literature", "Political Science"],
  },
  {
    title: "Accountancy, Business and Management (ABM)",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    description: "Business fundamentals and financial management training",
    subjects: ["Business Math", "Accounting", "Economics", "Marketing", "Entrepreneurship"],
  },
  {
    title: "Technical-Vocational-Livelihood (TVL)",
    icon: Wrench,
    color: "from-orange-500 to-red-500",
    description: "Practical skills development for immediate employment",
    subjects: ["ICT", "Home Economics", "Agri-Fishery Arts", "Industrial Arts"],
  },
]

export default function AcademicsClient() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Academic Programs</h1>
            <p className="text-xl">Preparing Students for Success in Every Field</p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {academicPrograms.map((program, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${program.color}`} />
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${program.color} rounded-xl flex items-center justify-center mb-4`}>
                    <program.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                  <p className="text-slate-600 mb-4">{program.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-700">Key Subjects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Excellence Stats */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Academic Excellence</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "98%", label: "College Acceptance Rate", icon: GraduationCap },
              { number: "25+", label: "Advanced Placement Courses", icon: BookOpen },
              { number: "4.2", label: "Average Student GPA", icon: Award },
              { number: "15+", label: "Academic Awards", icon: Trophy },
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

### 25.3.3 Contact Page

Provides multiple ways for visitors to get in touch.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\contact\page.tsx

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
          <p className="text-xl text-center text-slate-600 mb-12">
            We'd love to hear from you. Get in touch with us today!
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input type="email" placeholder="your.email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input placeholder="What is this about?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea rows={5} placeholder="Your message here..." />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-slate-600">
                      Southville 8B, Brgy. San Jose<br />
                      Rodriguez, Rizal 1860<br />
                      Philippines
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-slate-600">
                      Main Office: (02) 1234-5678<br />
                      Registrar: (02) 1234-5679
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-slate-600">
                      info@southville8bnhs.edu.ph<br />
                      admissions@southville8bnhs.edu.ph
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-slate-600">
                      Monday - Friday: 7:00 AM - 5:00 PM<br />
                      Saturday: 8:00 AM - 12:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Map */}
          <Card className="mt-12 p-6">
            <h2 className="text-2xl font-bold mb-4">Find Us on the Map</h2>
            <div className="w-full h-96 bg-slate-200 rounded-lg">
              {/* Google Maps embed or custom map component */}
              <iframe
                src="https://www.google.com/maps/embed?..."
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

---

## 25.4 News & Events System

The news and events system keeps the community informed about school activities and achievements.

### 25.4.1 News Listing Page

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\news\page.tsx

export const metadata: Metadata = {
  title: "News",
  description: "Latest news, achievements, and updates from Southville 8B NHS.",
  alternates: { canonical: "/guess/news" },
}

export default function NewsPage() {
  return <NewsClient />
}
```

#### News Client Component

```typescript
// NewsClient displays paginated news articles with filters

export default function NewsClient() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const categories = ["all", "academics", "sports", "events", "achievements", "announcements"]

  useEffect(() => {
    fetchNews()
  }, [])

  useEffect(() => {
    filterNews()
  }, [news, selectedCategory, searchQuery])

  const filterNews = () => {
    let filtered = news

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredNews(filtered)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">School News</h1>

        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 25.4.2 Individual News Article

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\news\[slug]\page.tsx

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  return <NewsArticleClient slug={params.slug} />
}
```

#### News Article Display

```typescript
// NewsArticleClient Component

export default function NewsArticleClient({ slug }: { slug: string }) {
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])

  useEffect(() => {
    fetchArticle()
  }, [slug])

  return (
    <div className="min-h-screen bg-white">
      {article && (
        <>
          {/* Article Header */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="container mx-auto">
                <Badge className="mb-4">{article.category}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(article.published_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {article.author}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Social Share */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Share this article</h3>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="bg-slate-50 py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <NewsCard key={related.id} article={related} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
```

### 25.4.3 Events System

Events follow a similar pattern to news with listing and detail pages.

```typescript
// Event listing with calendar view

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">School Events</h1>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <EventsList events={events} />
        ) : (
          <EventsCalendar events={events} />
        )}
      </div>
    </div>
  )
}
```

---

## 25.5 School Information Pages

### 25.5.1 Clubs Page

Displays all student clubs and organizations.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\clubs\page.tsx

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "academic", "sports", "arts", "technology", "service"]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-4">Student Clubs</h1>
        <p className="text-xl text-center text-slate-600 mb-12">
          Join a club and discover your passion
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs
            .filter(club => selectedCategory === "all" || club.category === selectedCategory)
            .map((club) => (
              <Link key={club.id} href={`/guess/clubs/${club.slug}`}>
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={club.image_url}
                      alt={club.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {club.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="w-4 h-4" />
                        {club.members_count} members
                      </div>
                      <Badge variant="secondary">{club.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
```

### 25.5.2 Virtual Tour

Interactive campus tour for prospective students.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\app\guess\virtual-tour\page.tsx

export default function VirtualTourClient() {
  const [activeLocation, setActiveLocation] = useState(0)

  const locations = [
    {
      name: "Main Building",
      image: "/tour/main-building.jpg",
      description: "Our main academic building houses classrooms, laboratories, and administrative offices.",
    },
    {
      name: "Science Laboratory",
      image: "/tour/science-lab.jpg",
      description: "State-of-the-art science facilities for hands-on learning and experiments.",
    },
    {
      name: "Library",
      image: "/tour/library.jpg",
      description: "A quiet space for study and research with thousands of books and digital resources.",
    },
    {
      name: "Sports Complex",
      image: "/tour/sports-complex.jpg",
      description: "Modern sports facilities including basketball court, track and field, and more.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-4">Virtual Campus Tour</h1>
        <p className="text-xl text-center text-slate-600 mb-12">
          Explore our beautiful campus from anywhere
        </p>

        {/* Main Tour View */}
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden">
            <div className="relative h-[600px]">
              <Image
                src={locations[activeLocation].image}
                alt={locations[activeLocation].name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {locations[activeLocation].name}
                </h2>
                <p className="text-white/90">
                  {locations[activeLocation].description}
                </p>
              </div>
            </div>
          </Card>

          {/* Location Thumbnails */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {locations.map((location, index) => (
              <button
                key={index}
                onClick={() => setActiveLocation(index)}
                className={cn(
                  "relative h-24 rounded-lg overflow-hidden transition-all",
                  activeLocation === index ? "ring-4 ring-blue-600" : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{location.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setActiveLocation(prev => Math.max(0, prev - 1))}
              disabled={activeLocation === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button
              size="lg"
              onClick={() => setActiveLocation(prev => Math.min(locations.length - 1, prev + 1))}
              disabled={activeLocation === locations.length - 1}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 25.6 Guest Access & Limitations

Guest users (unauthenticated visitors) have limited access compared to authenticated users.

### 25.6.1 Access Control

#### Accessible Features

Guest users can access:
- Homepage and all public pages
- News articles (reading only)
- Event listings and details
- Club information
- Academic program information
- Contact information
- Virtual tour
- Gallery
- Login/registration pages

#### Restricted Features

Guest users cannot access:
- Student portal
- Teacher portal
- Admin portal
- Personal dashboards
- Assignment submission
- Grade viewing
- Quiz taking
- Chat/messaging
- File downloads (modules)
- Profile management

### 25.6.2 Navigation Restrictions

The navigation system adapts based on authentication status:

```typescript
// Navigation component with guest limitations

export function Navigation() {
  const { user } = useAuth()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl">
            Southville 8B NHS
          </Link>

          <div className="flex items-center gap-6">
            {/* Public Links */}
            <Link href="/guess/about">About</Link>
            <Link href="/guess/academics">Academics</Link>
            <Link href="/guess/news">News</Link>
            <Link href="/guess/event">Events</Link>
            <Link href="/guess/clubs">Clubs</Link>
            <Link href="/guess/contact">Contact</Link>

            {/* Auth-specific Links */}
            {user ? (
              <>
                <Link href={`/${user.role}/dashboard`}>Dashboard</Link>
                <UserMenu user={user} />
              </>
            ) : (
              <Link href="/guess/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### 25.6.3 Content Restrictions

Some content is preview-only for guests:

```typescript
// Example: News article with guest restrictions

function NewsArticleContent({ article, user }: Props) {
  const isGuest = !user
  const shouldTruncate = isGuest && article.premium

  return (
    <div className="prose max-w-none">
      {shouldTruncate ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: article.excerpt }} />
          <Card className="mt-8 p-8 text-center bg-blue-50">
            <Lock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-bold mb-2">Premium Content</h3>
            <p className="text-slate-600 mb-4">
              Login to read the full article
            </p>
            <Link href="/guess/login">
              <Button>Login to Continue</Button>
            </Link>
          </Card>
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      )}
    </div>
  )
}
```

---

## 25.7 Search & Navigation

### 25.7.1 Global Search

A global search feature helps visitors find content quickly:

```typescript
// Global search component

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([])
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 w-64"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <Link
              key={result.id}
              href={result.url}
              className="block p-4 hover:bg-slate-50 border-b last:border-b-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {result.type === 'news' && <Newspaper className="w-5 h-5 text-blue-600" />}
                  {result.type === 'event' && <Calendar className="w-5 h-5 text-green-600" />}
                  {result.type === 'club' && <Users className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-1">{result.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {result.excerpt}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {result.type}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
```

### 25.7.2 Breadcrumb Navigation

Breadcrumbs help users understand their location:

```typescript
// Breadcrumb component with JSON-LD

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbSchema = buildBreadcrumbListSchema(items)

  return (
    <>
      <JsonLd id="breadcrumb" data={breadcrumbSchema} />
      <nav className="py-4 border-b">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />}
                {index < items.length - 1 ? (
                  <Link href={item.url} className="text-blue-600 hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-slate-600">{item.name}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}
```

---

## 25.8 Implementation Details

### 25.8.1 Performance Optimization

Public pages use several optimization techniques:

#### Static Site Generation (SSG)

```typescript
// Force static generation for rarely changing pages

export const dynamic = "force-static"
export const revalidate = 86400 // 24 hours

export default function AboutPage() {
  return <AboutPageClient />
}
```

#### Incremental Static Regeneration (ISR)

```typescript
// ISR for frequently updated content

export const revalidate = 3600 // 1 hour

export default function NewsPage() {
  return <NewsClient />
}
```

#### Image Optimization

```typescript
// Next.js Image component for automatic optimization

<Image
  src={article.image_url}
  alt={article.title}
  fill
  className="object-cover"
  priority // for above-fold images
  quality={90}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 25.8.2 SEO Optimization

Every public page includes comprehensive SEO metadata:

```typescript
// Complete SEO metadata example

export const metadata: Metadata = {
  title: "About Us - Southville 8B NHS",
  description: "Learn about Southville 8B National High School in Rodriguez, Rizal — our history, mission, achievements, and the teachers who lead our learners.",
  keywords: ["Southville 8B NHS", "Rodriguez", "Rizal", "high school", "education"],
  authors: [{ name: "Southville 8B NHS" }],
  creator: "Southville 8B NHS",
  publisher: "Southville 8B NHS",

  alternates: {
    canonical: "/guess/about",
  },

  openGraph: {
    title: "About Us - Southville 8B NHS",
    description: "Learn about Southville 8B National High School...",
    url: "/guess/about",
    siteName: "Southville 8B NHS Edge",
    type: "website",
    images: [
      {
        url: "https://southville8bnhs.edu.ph/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Southville 8B NHS"
      }
    ],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "About Us - Southville 8B NHS",
    description: "Learn about Southville 8B National High School...",
    images: ["https://southville8bnhs.edu.ph/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

#### JSON-LD Structured Data

```typescript
// Structured data for better search engine understanding

import { JsonLd, buildBreadcrumbListSchema, buildArticleSchema } from "@/components/seo/jsonld"

export default function NewsArticlePage({ article }: Props) {
  const breadcrumb = buildBreadcrumbListSchema([
    { name: "Home", url: SITE_URL },
    { name: "News", url: `${SITE_URL}/guess/news` },
    { name: article.title, url: `${SITE_URL}/guess/news/${article.slug}` },
  ])

  const articleSchema = buildArticleSchema({
    headline: article.title,
    description: article.excerpt,
    image: article.image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author,
  })

  return (
    <>
      <JsonLd id="breadcrumb" data={breadcrumb} />
      <JsonLd id="article" data={articleSchema} />
      {/* Page content */}
    </>
  )
}
```

### 25.8.3 Analytics Tracking

Guest interactions are tracked for insights:

```typescript
// Analytics tracking for public pages

import { trackPageView, trackEvent } from "@/lib/analytics"

export default function NewsArticleClient({ slug }: Props) {
  useEffect(() => {
    trackPageView({
      page: `/guess/news/${slug}`,
      title: article?.title,
    })
  }, [slug, article])

  const handleShare = (platform: string) => {
    trackEvent({
      action: "share",
      category: "news",
      label: platform,
      value: article.id,
    })
  }

  return <div>{/* Article content */}</div>
}
```

---

## Summary

The public and guest features of Southville 8B NHS Edge provide a comprehensive, engaging experience for unauthenticated visitors. Key characteristics include:

- **Professional Design**: Modern, attractive interface that showcases the school's excellence
- **Comprehensive Information**: Detailed information about academics, facilities, and school life
- **SEO Optimized**: Complete metadata and structured data for excellent search engine visibility
- **Performance Focused**: Static generation and caching for fast load times
- **Mobile Responsive**: Fully functional across all device sizes
- **Clear CTAs**: Strategic calls-to-action guide visitors to login or learn more
- **Content Rich**: Regular updates through news, events, and announcements
- **Accessible Navigation**: Intuitive navigation and search functionality

These features serve as the school's digital front door, creating a positive first impression and encouraging prospective students and parents to engage with the school community.

---

**Navigation:**
- [← Previous: Admin Portal Features](./24-admin-portal.md)
- [Next: Chat & Messaging System →](./26-chat-messaging.md)
- [↑ Back to Volume 4 Index](./README.md)
