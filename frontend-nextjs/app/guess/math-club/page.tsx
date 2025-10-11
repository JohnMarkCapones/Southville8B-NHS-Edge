"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Calculator,
  Trophy,
  Users,
  Calendar,
  Star,
  Target,
  BookOpen,
  Brain,
  Lightbulb,
  Crown,
  Medal,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  MapPin,
  Mail,
  ChevronRight,
  Sparkles,
  Heart,
} from "lucide-react"

export default function MathClubPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    mathLevel: "",
    experience: "",
    interests: "",
    goals: "",
  })

  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [missionRef, missionInView] = useIntersectionObserver({ threshold: 0.1 })
  const [leadershipRef, leadershipInView] = useIntersectionObserver({ threshold: 0.1 })
  const [eventsRef, eventsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [benefitsRef, benefitsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [registrationRef, registrationInView] = useIntersectionObserver({ threshold: 0.1 })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    alert("Thank you for your interest! We'll contact you soon with next steps.")
  }

  const officers = [
    {
      name: "Sarah Chen",
      position: "President",
      grade: "Grade 12",
      bio: "Sarah has been passionate about mathematics since elementary school and has led our club to three consecutive state championships.",
      achievements: ["AMC 12 Top 5%", "AIME Qualifier", "State Math Champion"],
      image: "/placeholder.svg?height=120&width=120&text=SC",
      icon: <Crown className="w-5 h-5" />,
    },
    {
      name: "Marcus Rodriguez",
      position: "Vice President",
      grade: "Grade 11",
      bio: "Marcus specializes in competitive mathematics and has mentored over 20 students in advanced problem-solving techniques.",
      achievements: ["Regional Mathcounts Winner", "Calculus BC Perfect Score", "Tutor of the Year"],
      image: "/placeholder.svg?height=120&width=120&text=MR",
      icon: <Medal className="w-5 h-5" />,
    },
    {
      name: "Emily Zhang",
      position: "Secretary",
      grade: "Grade 10",
      bio: "Emily manages our club's activities and coordinates with other academic organizations across the district.",
      achievements: ["Math League All-Star", "Pi Day Competition Winner", "Academic Excellence Award"],
      image: "/placeholder.svg?height=120&width=120&text=EZ",
      icon: <Star className="w-5 h-5" />,
    },
    {
      name: "David Kim",
      position: "Treasurer",
      grade: "Grade 11",
      bio: "David handles our club finances and organizes fundraising events for competition travel and equipment.",
      achievements: ["Statistics Olympiad Medalist", "Business Math Champion", "Leadership Award"],
      image: "/placeholder.svg?height=120&width=120&text=DK",
      icon: <Trophy className="w-5 h-5" />,
    },
  ]

  const upcomingEvents = [
    {
      title: "AMC 8/10/12 Preparation Workshop",
      date: "2024-03-15",
      time: "3:30 PM - 5:00 PM",
      location: "Room 205",
      description: "Intensive preparation session for the American Mathematics Competitions",
      type: "Workshop",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      title: "Pi Day Celebration & Competition",
      date: "2024-03-14",
      time: "12:00 PM - 2:00 PM",
      location: "Main Auditorium",
      description: "Annual Pi Day festivities with competitions, games, and pizza!",
      type: "Event",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      title: "State Mathematics Championship",
      date: "2024-04-20",
      time: "9:00 AM - 4:00 PM",
      location: "State University",
      description: "Representing our school at the state-level mathematics competition",
      type: "Competition",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      title: "Math Tutoring Session",
      date: "2024-03-22",
      time: "3:30 PM - 4:30 PM",
      location: "Library Study Room",
      description: "Weekly peer tutoring for all math levels - everyone welcome!",
      type: "Tutoring",
      icon: <Users className="w-5 h-5" />,
    },
  ]

  const benefits = [
    {
      title: "Academic Excellence",
      description: "Improve your mathematical skills through challenging problems and peer collaboration",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Competition Opportunities",
      description: "Participate in local, state, and national mathematics competitions",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Leadership Development",
      description: "Develop leadership skills by mentoring younger students and organizing events",
      icon: <Crown className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "College Preparation",
      description: "Build a strong foundation for advanced mathematics courses and college applications",
      icon: <Target className="w-6 h-6" />,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Peer Network",
      description: "Connect with like-minded students who share your passion for mathematics",
      icon: <Users className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Problem-Solving Skills",
      description: "Enhance critical thinking and analytical skills applicable beyond mathematics",
      icon: <Brain className="w-6 h-6" />,
      color: "from-red-500 to-pink-500",
    },
  ]

  const faqItems = [
    {
      question: "Who can join the Math Club?",
      answer:
        "Any student from grades 9-12 with an interest in mathematics is welcome! You don't need to be a math genius - just have enthusiasm for learning and problem-solving.",
    },
    {
      question: "When and where do you meet?",
      answer:
        "We meet every Tuesday and Thursday from 3:30 PM to 4:30 PM in Room 205. We also have special weekend sessions before major competitions.",
    },
    {
      question: "Are there any fees to join?",
      answer:
        "Basic membership is free! There may be small fees for competition registration and travel expenses, but we have fundraising activities and scholarships available.",
    },
    {
      question: "What if I'm not good at math competitions?",
      answer:
        "That's perfectly fine! We welcome students of all skill levels. Our experienced members provide tutoring and mentorship to help everyone improve.",
    },
    {
      question: "Do you provide tutoring for regular math classes?",
      answer:
        "Yes! We offer peer tutoring sessions every Friday from 3:30-4:30 PM. Members help each other with homework, test preparation, and understanding difficult concepts.",
    },
    {
      question: "What competitions do you participate in?",
      answer:
        "We participate in AMC 8/10/12, AIME, Mathcounts, state mathematics competitions, and local math leagues. We'll help you find competitions that match your skill level.",
    },
    {
      question: "How can joining Math Club help with college applications?",
      answer:
        "Math Club demonstrates academic commitment, leadership potential, and problem-solving skills. Many of our alumni have received scholarships and been accepted to top universities.",
    },
    {
      question: "Can I join if I'm already in other clubs?",
      answer:
        "Many of our members are involved in multiple activities. We're flexible with scheduling and understand students have diverse interests.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={cn("max-w-4xl mx-auto text-center text-white", heroInView && "animate-fadeIn")}>
            <div className="flex justify-center mb-6">
              <Badge className="text-lg px-6 py-3 rounded-full bg-white/20 text-white border-white/30">
                <Calculator className="w-5 h-5 mr-3" />
                42 Active Members
                <Sparkles className="w-5 h-5 ml-3" />
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight">
              Southville 8B <span className="text-yellow-300">Math Club</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto text-white/90">
              🧮 Where numbers come alive and mathematical minds thrive! Join our award-winning community of problem
              solvers, competitors, and future mathematicians. ✨
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <AnimatedButton
                size="xl"
                className="group font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                Join Our Club
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="xl"
                className="group font-bold text-lg px-8 py-4 rounded-full w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                View Events
              </AnimatedButton>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { number: "12+", label: "Championships Won", icon: "🏆" },
                { number: "95%", label: "College Acceptance", icon: "🎓" },
                { number: "25+", label: "Competitions Annually", icon: "📊" },
                { number: "4.2", label: "Average GPA", icon: "⭐" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm font-medium text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("max-w-4xl mx-auto", missionInView && "animate-fadeIn")}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Empowering Mathematical <span className="gradient-text">Excellence</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">🎯 What We Stand For</h3>
                <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                  The Southville 8B Math Club is dedicated to fostering a love for mathematics through collaborative
                  learning, competitive excellence, and peer mentorship. We believe that mathematics is not just about
                  numbers—it's about developing critical thinking, problem-solving skills, and logical reasoning that
                  will serve our members throughout their lives.
                </p>

                <div className="space-y-4">
                  {[
                    "🧠 Develop advanced problem-solving skills",
                    "🤝 Build a supportive community of learners",
                    "🏆 Excel in mathematical competitions",
                    "📚 Prepare for advanced mathematics courses",
                    "💡 Inspire creativity through mathematical exploration",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <img
                  src="/placeholder.svg?height=400&width=500&text=Math+Club+Mission"
                  alt="Math Club Mission"
                  className="w-full rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section ref={leadershipRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", leadershipInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Crown className="w-4 h-4 mr-2" />
              Club Leadership
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Meet Our <span className="gradient-text">Officers</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Our dedicated student leaders bring passion, experience, and vision to guide our club toward continued
              excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {officers.map((officer, index) => (
              <AnimatedCard
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="relative mb-6">
                    <img
                      src={officer.image || "/placeholder.svg"}
                      alt={officer.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full shadow-lg">
                      {officer.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{officer.name}</h3>
                  <p className="text-primary font-semibold mb-1">{officer.position}</p>
                  <p className="text-sm text-muted-foreground mb-4">{officer.grade}</p>

                  <p className="text-sm leading-relaxed mb-4 text-muted-foreground">{officer.bio}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🏆 Achievements:</h4>
                    {officer.achievements.map((achievement, i) => (
                      <div key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Club Adviser Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="w-4 h-4 mr-2" />
              Faculty Guidance
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Club <span className="gradient-text">Adviser</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <AnimatedCard className="group hover:scale-105 transition-all duration-300">
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=150&width=150&text=Dr.+Martinez"
                        alt="Dr. Maria Martinez"
                        className="w-32 h-32 rounded-2xl mx-auto shadow-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        Dr. Maria Martinez
                      </h3>
                      <p className="text-lg text-primary font-semibold mb-2">
                        Mathematics Department Head & Club Adviser
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ph.D. in Mathematics, Stanford University • 15+ years experience
                      </p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      Dr. Martinez has guided our Math Club to excellence for over 8 years, mentoring hundreds of
                      students in mathematical competitions and STEM careers. Her expertise in number theory and
                      innovative teaching methods create an environment where students thrive.
                    </p>

                    <div>
                      <h4 className="text-sm font-bold mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-primary" />
                        Key Achievements
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {[
                          "🏆 State Teacher of the Year (2022)",
                          "🎓 Mentored 50+ competition winners",
                          "📚 Published 25+ research papers",
                          "⭐ Excellence in Education Award",
                        ].map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <blockquote className="text-sm text-muted-foreground italic">
                        "Mathematics is about discovering beauty and patterns in our universe. Every student has the
                        potential to excel, and I'm here to help unlock that potential."
                      </blockquote>
                      <p className="text-right mt-2 text-xs font-semibold text-primary">— Dr. Martinez</p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>m.martinez@southville8bnhs.edu</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Room 203</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section ref={eventsRef} id="events" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", eventsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              What's <span className="gradient-text">Coming Up</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Join us for exciting competitions, workshops, and community events throughout the year.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <AnimatedCard
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg">
                        {event.icon}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="font-semibold">{new Date(event.date).toLocaleDateString()}</div>
                      <div>{event.time}</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>

                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <AnimatedButton variant="outline" className="group" asChild>
              <Link href="/news-events">
                View Full Calendar
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", benefitsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Membership Benefits
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Why Join <span className="gradient-text">Math Club?</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Discover the amazing opportunities and benefits that come with being part of our mathematical community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedCard
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div
                    className={cn(
                      "w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg",
                      `bg-gradient-to-r ${benefit.color}`,
                    )}
                  >
                    {benefit.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{benefit.title}</h3>

                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section ref={registrationRef} id="registration" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("max-w-4xl mx-auto", registrationInView && "animate-fadeIn")}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Users className="w-4 h-4 mr-2" />
                Join Our Community
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to <span className="gradient-text">Get Started?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to join our amazing Math Club community!
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Math Club Registration</CardTitle>
                <CardDescription className="text-center">
                  Complete this form to become a member of Southville 8B Math Club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Current Grade *</Label>
                      <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">Grade 9</SelectItem>
                          <SelectItem value="10">Grade 10</SelectItem>
                          <SelectItem value="11">Grade 11</SelectItem>
                          <SelectItem value="12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mathLevel">Current Math Level *</Label>
                      <Select
                        value={formData.mathLevel}
                        onValueChange={(value) => handleInputChange("mathLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your math level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="algebra1">Algebra I</SelectItem>
                          <SelectItem value="geometry">Geometry</SelectItem>
                          <SelectItem value="algebra2">Algebra II</SelectItem>
                          <SelectItem value="precalculus">Pre-Calculus</SelectItem>
                          <SelectItem value="calculus">Calculus</SelectItem>
                          <SelectItem value="statistics">Statistics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Previous Math Competition Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Tell us about any math competitions, contests, or related activities you've participated in..."
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Mathematical Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="What areas of mathematics interest you most? (e.g., algebra, geometry, number theory, statistics, etc.)"
                      value={formData.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals & Expectations</Label>
                    <Textarea
                      id="goals"
                      placeholder="What do you hope to achieve by joining Math Club? What are your academic and competition goals?"
                      value={formData.goals}
                      onChange={(e) => handleInputChange("goals", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="text-center pt-6">
                    <AnimatedButton
                      type="submit"
                      size="lg"
                      className="group font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:scale-105 transition-all duration-300"
                    >
                      <Heart className="w-5 h-5 mr-3 group-hover:scale-110 transition-all duration-300" />
                      Submit Application
                      <Sparkles className="w-5 h-5 ml-3" />
                    </AnimatedButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Lightbulb className="w-4 h-4 mr-2" />
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Got <span className="gradient-text">Questions?</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Find answers to common questions about joining and participating in Math Club.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join Our Mathematical Journey?</h2>
            <p className="text-lg mb-8 text-white/90">
              Don't miss out on the opportunity to be part of our award-winning Math Club community!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-3 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Calculator className="w-6 h-6 mr-3 group-hover:rotate-12 transition-all duration-300" />
                Join Math Club
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                className="group font-bold text-lg px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/contact">
                  <Mail className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                  Contact Us
                </Link>
              </AnimatedButton>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80">
                Questions? Contact our club advisor at <strong>mathclub@southville8bnhs.edu</strong> or visit us in Room
                205
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
