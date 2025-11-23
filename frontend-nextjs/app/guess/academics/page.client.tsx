"use client"

import { useState } from "react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { FeatureCard } from "@/components/ui/feature-card"
import { Badge } from "@/components/ui/badge"
import { GuessBreadcrumb } from "@/components/ui/guess-breadcrumb"
import {
  BookOpen,
  Microscope,
  Calculator,
  Globe,
  Palette,
  Dumbbell,
  Users,
  Award,
  TrendingUp,
  Star,
  Target,
  Wrench,
  Heart,
  Music,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function AcademicsClient() {
  const [showAllDepartments, setShowAllDepartments] = useState(false)

  const departments = [
    {
      title: "TLE (Technology and Livelihood Education)",
      description: "Practical skills development in technology, entrepreneurship, and livelihood preparation.",
      icon: <Wrench className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop&q=80",
      badge: "Practical Skills",
    },
    {
      title: "Science",
      description: "Hands-on laboratory experiences in Biology, Chemistry, Physics, and Environmental Science.",
      icon: <Microscope className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop&q=80",
      badge: "STEM Focus",
      variant: "featured" as const,
    },
    {
      title: "Mathematics",
      description:
        "From basic arithmetic to advanced mathematics, building strong analytical and problem-solving skills.",
      icon: <Calculator className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop&q=80",
      badge: "Core Subject",
    },
    {
      title: "Filipino",
      description: "Mastering the national language through literature, grammar, and cultural appreciation.",
      icon: <BookOpen className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&q=80",
      badge: "National Language",
    },
    {
      title: "English",
      description: "Developing communication skills, critical thinking, and literary analysis in the global language.",
      icon: <Globe className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80",
      badge: "Global Language",
    },
    {
      title: "Araling Panlipunan",
      description:
        "Understanding Philippine history, culture, government, and social studies for informed citizenship.",
      icon: <GraduationCap className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop&q=80",
      badge: "Social Studies",
    },
    {
      title: "ESP (Edukasyon sa Pagpapakatao)",
      description: "Character development and values education for moral and ethical growth.",
      icon: <Heart className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop&q=80",
      badge: "Values Education",
    },
    {
      title: "MAPEH",
      description: "Integrated Music, Arts, Physical Education, and Health for holistic development.",
      icon: <Palette className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&q=80",
      badge: "Integrated Program",
    },
    {
      title: "Music",
      description: "Musical appreciation, theory, and performance to develop artistic expression.",
      icon: <Music className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&q=80",
      badge: "Creative Arts",
    },
    {
      title: "Arts",
      description: "Visual arts, creative expression, and artistic skills development.",
      icon: <Palette className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop&q=80",
      badge: "Visual Arts",
    },
    {
      title: "Physical Education",
      description: "Promoting physical fitness, sports skills, and healthy lifestyle habits.",
      icon: <Dumbbell className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80",
      badge: "Fitness & Sports",
    },
    {
      title: "Health",
      description: "Health education focusing on wellness, nutrition, and personal care.",
      icon: <Heart className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop&q=80",
      badge: "Wellness Focus",
    },
  ]

  const displayedDepartments = showAllDepartments ? departments : departments.slice(0, 3)

  const achievements = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "National Merit Scholars",
      value: "15+",
      description: "Students recognized for academic excellence",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "College Acceptance Rate",
      value: "98%",
      description: "Students accepted to 4-year universities",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Academic Excellence",
      value: "91%",
      description: "Students with honors recognition",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Average Grade",
      value: "92.5",
      description: "Above regional and national averages",
      color: "from-blue-600 to-indigo-600",
    },
  ]

  return (
    <div className="min-h-screen">
      <GuessBreadcrumb items={[{ label: "Academics" }]} />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-800 dark:via-blue-700 dark:to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute top-32 right-20 w-24 h-24 bg-white/15 dark:bg-white/25 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 dark:bg-white/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-32 right-1/3 w-28 h-28 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/40 transition-all duration-300"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Academic Excellence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white drop-shadow-lg">
            Comprehensive <span className="text-yellow-300 dark:text-yellow-200 drop-shadow-md">Academic</span> Programs
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-white via-yellow-300 dark:via-yellow-200 to-white mb-6 shadow-lg" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/95 dark:text-white/90 drop-shadow-sm leading-relaxed">
            Preparing students for success in college and beyond through rigorous academics, innovative teaching, and
            personalized support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white/30 dark:border-white/40 text-black dark:text-white hover:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Programs
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-yellow-300/50 dark:border-yellow-200/50 text-black dark:text-white hover:bg-yellow-300/20 dark:hover:bg-yellow-200/20 backdrop-blur-sm transition-all duration-300"
            >
              <Award className="w-5 h-5 mr-2" />
              View Achievements
            </AnimatedButton>
          </div>
        </div>
      </section>

      <section
        id="departments"
        className="py-20 bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Academic{" "}
              <span className="gradient-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Departments
              </span>
            </h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 mb-6" />
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our comprehensive curriculum spans multiple disciplines, ensuring students receive a well-rounded
              education based on the K-12 curriculum.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedDepartments.map((department, index) => (
              <div
                key={department.title}
                className="animate-slideInUp hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...department} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <AnimatedButton
              variant="outline"
              size="lg"
              onClick={() => setShowAllDepartments(!showAllDepartments)}
              className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300"
            >
              {showAllDepartments ? (
                <>
                  <ChevronUp className="w-5 h-5 mr-2" />
                  View Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 mr-2" />
                  View More Departments
                </>
              )}
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Updated Academic Achievements section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
              <Award className="w-4 h-4" />
              Excellence in Education
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Academic{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
            <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 mb-8 shadow-lg" />
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our commitment to excellence is reflected in our students' outstanding academic performance and
              recognition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.title}
                className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
                ></div>

                {/* Icon with gradient background */}
                <div
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="text-white">{achievement.icon}</div>
                </div>

                {/* Content */}
                <div className="relative">
                  <div
                    className={`text-4xl font-bold mb-2 bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent`}
                  >
                    {achievement.value}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          {/* Additional stats row */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Years of Excellence", value: "25+", icon: <GraduationCap className="w-5 h-5" /> },
              { label: "Qualified Teachers", value: "45+", icon: <Users className="w-5 h-5" /> },
              { label: "Academic Programs", value: "12", icon: <BookOpen className="w-5 h-5" /> },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-800 dark:to-cyan-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel Academically?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join our academic community and unlock your potential with our comprehensive programs and dedicated faculty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="secondary"
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Schedule Campus Visit
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Request Information
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
