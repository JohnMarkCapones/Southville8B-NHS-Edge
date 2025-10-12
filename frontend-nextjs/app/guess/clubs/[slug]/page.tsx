"use client"

import type React from "react"

import { useState, useMemo, use } from "react"
import Image from "next/image"
import ServerSeo from "./server-page"
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
import { notFound } from "next/navigation"
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
  Microscope,
  Code,
  Globe,
} from "lucide-react"

const clubsData = {
  "math-club": {
    slug: "math-club",
    name: "Math Club",
    icon: <Calculator className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
    members: 42,
    meetingTime: "Tuesdays 3:30 PM",
    location: "Room 205",
    adviser: {
      name: "Dr. Maria Martinez",
      title: "Mathematics Department Head & Club Adviser",
      credentials: "Ph.D. in Mathematics, Stanford University • 15+ years experience",
      bio: "Dr. Martinez has guided our Math Club to excellence for over 8 years, mentoring hundreds of students in mathematical competitions and STEM careers. Her expertise in number theory and innovative teaching methods create an environment where students thrive.",
      achievements: [
        "🏆 State Teacher of the Year (2022)",
        "🎓 Mentored 50+ competition winners",
        "📚 Published 25+ research papers",
        "⭐ Excellence in Education Award",
      ],
      quote:
        "Mathematics is about discovering beauty and patterns in our universe. Every student has the potential to excel, and I'm here to help unlock that potential.",
      email: "m.martinez@southville8bnhs.edu",
      office: "Room 203",
      image: "/placeholder.svg?height=150&width=150&text=Dr.+Martinez",
    },
    description:
      "Explore advanced mathematical concepts, compete in regional and national competitions, and develop problem-solving skills through challenging mathematical puzzles and proofs.",
    mission:
      "The Southville 8B Math Club is dedicated to fostering a love for mathematics through collaborative learning, competitive excellence, and peer mentorship. We believe that mathematics is not just about numbers—it's about developing critical thinking, problem-solving skills, and logical reasoning that will serve our members throughout their lives.",
    goals: [
      "🧠 Develop advanced problem-solving skills",
      "🤝 Build a supportive community of learners",
      "🏆 Excel in mathematical competitions",
      "📚 Prepare for advanced mathematics courses",
      "💡 Inspire creativity through mathematical exploration",
    ],
    officers: [
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
    ],
    upcomingEvents: [
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
    ],
    benefits: [
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
    ],
    faqItems: [
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
    ],
    stats: [
      { number: "12+", label: "Championships Won", icon: "🏆" },
      { number: "95%", label: "College Acceptance", icon: "🎓" },
      { number: "25+", label: "Competitions Annually", icon: "📊" },
      { number: "4.2", label: "Average GPA", icon: "⭐" },
    ],
  },
  "science-club": {
    slug: "science-club",
    name: "Science Club",
    icon: <Microscope className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    members: 38,
    meetingTime: "Wednesdays 3:45 PM",
    location: "Science Lab A",
    adviser: {
      name: "Dr. Sarah Chen",
      title: "Science Department Head & Club Adviser",
      credentials: "Ph.D. in Biology, MIT • 12+ years experience",
      bio: "Dr. Chen brings cutting-edge scientific research into the classroom, inspiring students to explore the wonders of science through hands-on experiments and real-world applications.",
      achievements: [
        "🔬 Research Excellence Award",
        "🎓 Science Fair Mentor of the Year",
        "📚 Published 30+ scientific papers",
        "⭐ Innovation in Education Award",
      ],
      quote:
        "Science is not just about memorizing facts—it's about asking questions, testing hypotheses, and discovering the incredible world around us.",
      email: "s.chen@southville8bnhs.edu",
      office: "Science Lab A",
      image: "/placeholder.svg?height=150&width=150&text=Dr.+Chen",
    },
    description:
      "Hands-on experiments, science fair preparation, and exploration of biology, chemistry, physics, and environmental science through engaging activities and competitions.",
    mission:
      "The Science Club fosters scientific curiosity and critical thinking through hands-on experimentation, collaborative research, and participation in science fairs and competitions.",
    goals: [
      "🔬 Conduct innovative experiments",
      "🏆 Excel in science competitions",
      "🌍 Promote environmental awareness",
      "🤝 Collaborate on research projects",
      "💡 Inspire future scientists",
    ],
    officers: [
      {
        name: "Emma Wilson",
        position: "President",
        grade: "Grade 12",
        bio: "Emma leads our club with passion for environmental science and has won multiple science fair awards.",
        achievements: ["State Science Fair Winner", "Environmental Research Award", "STEM Leadership"],
        image: "/placeholder.svg?height=120&width=120&text=EW",
        icon: <Crown className="w-5 h-5" />,
      },
      {
        name: "David Kim",
        position: "Lab Coordinator",
        grade: "Grade 11",
        bio: "David manages our laboratory equipment and ensures safe, effective experimental procedures.",
        achievements: ["Lab Safety Certification", "Chemistry Olympiad Medalist", "Research Excellence"],
        image: "/placeholder.svg?height=120&width=120&text=DK",
        icon: <Microscope className="w-5 h-5" />,
      },
    ],
    upcomingEvents: [
      {
        title: "Chemistry Lab Session",
        date: "2024-03-26",
        time: "2:30 PM - 4:30 PM",
        location: "Chemistry Lab",
        description: "Hands-on chemistry experiments exploring chemical reactions",
        type: "Lab Work",
        icon: <Microscope className="w-5 h-5" />,
      },
      {
        title: "Science Fair Preparation",
        date: "2024-04-05",
        time: "3:00 PM - 5:00 PM",
        location: "Science Lab A",
        description: "Workshop on developing winning science fair projects",
        type: "Workshop",
        icon: <BookOpen className="w-5 h-5" />,
      },
    ],
    benefits: [
      {
        title: "Hands-On Learning",
        description: "Conduct real experiments and develop practical laboratory skills",
        icon: <Microscope className="w-6 h-6" />,
        color: "from-green-500 to-green-600",
      },
      {
        title: "Science Competitions",
        description: "Participate in science fairs and olympiads at various levels",
        icon: <Trophy className="w-6 h-6" />,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Research Skills",
        description: "Learn scientific method and research techniques",
        icon: <Brain className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "STEM Career Prep",
        description: "Build foundation for careers in science, technology, engineering, and medicine",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "from-purple-500 to-pink-500",
      },
    ],
    faqItems: [
      {
        question: "Do I need prior science experience?",
        answer:
          "No! We welcome students of all experience levels. Our club provides mentorship and training for beginners.",
      },
      {
        question: "What kind of experiments do we do?",
        answer:
          "We conduct experiments in biology, chemistry, physics, and environmental science, ranging from basic demonstrations to advanced research projects.",
      },
      {
        question: "Is there a science fair requirement?",
        answer:
          "Participation in science fairs is encouraged but not required. We provide support for those who want to compete.",
      },
    ],
    stats: [
      { number: "15+", label: "Science Fair Awards", icon: "🏆" },
      { number: "38", label: "Active Members", icon: "👥" },
      { number: "50+", label: "Experiments Conducted", icon: "🔬" },
      { number: "10+", label: "Research Projects", icon: "📊" },
    ],
  },
  "robotics-club": {
    slug: "robotics-club",
    name: "Robotics Club",
    icon: <Code className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    members: 35,
    meetingTime: "Thursdays 4:00 PM",
    location: "Engineering Lab",
    adviser: {
      name: "Mr. James Wilson",
      title: "Engineering & Technology Teacher",
      credentials: "M.S. in Robotics Engineering, Carnegie Mellon • 10+ years experience",
      bio: "Mr. Wilson combines industry experience with educational expertise to guide students in building award-winning robots and developing engineering skills.",
      achievements: [
        "🤖 FIRST Robotics Mentor Award",
        "🏆 Regional Competition Coach",
        "💻 Industry Robotics Engineer",
        "⭐ STEM Excellence Award",
      ],
      quote:
        "Robotics teaches students to think like engineers, work as a team, and never give up when facing challenges.",
      email: "j.wilson@southville8bnhs.edu",
      office: "Engineering Lab",
      image: "/placeholder.svg?height=150&width=150&text=Mr.+Wilson",
    },
    description:
      "Design, build, and program robots for competitions. Learn engineering principles, coding, and teamwork while creating innovative robotic solutions.",
    mission:
      "The Robotics Club empowers students to become innovative problem-solvers through hands-on engineering, programming, and collaborative robot design.",
    goals: [
      "🤖 Build competitive robots",
      "💻 Master programming skills",
      "🔧 Learn engineering principles",
      "🏆 Compete in FIRST Robotics",
      "🤝 Develop teamwork abilities",
    ],
    officers: [
      {
        name: "Alex Johnson",
        position: "Team Captain",
        grade: "Grade 12",
        bio: "Alex leads our robotics team with expertise in mechanical design and strategic planning.",
        achievements: ["FIRST Robotics Regional Winner", "Engineering Excellence Award", "Team Leadership"],
        image: "/placeholder.svg?height=120&width=120&text=AJ",
        icon: <Crown className="w-5 h-5" />,
      },
      {
        name: "Maya Patel",
        position: "Programming Lead",
        grade: "Grade 11",
        bio: "Maya specializes in robot programming and autonomous systems development.",
        achievements: ["Coding Competition Winner", "Autonomous Systems Expert", "Innovation Award"],
        image: "/placeholder.svg?height=120&width=120&text=MP",
        icon: <Code className="w-5 h-5" />,
      },
    ],
    upcomingEvents: [
      {
        title: "FIRST Robotics Competition",
        date: "2024-04-15",
        time: "8:00 AM - 6:00 PM",
        location: "Regional Arena",
        description: "Compete against teams from across the region",
        type: "Competition",
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        title: "Robot Build Session",
        date: "2024-03-28",
        time: "4:00 PM - 6:00 PM",
        location: "Engineering Lab",
        description: "Weekly robot construction and testing",
        type: "Workshop",
        icon: <Code className="w-5 h-5" />,
      },
    ],
    benefits: [
      {
        title: "Engineering Skills",
        description: "Learn mechanical design, electronics, and system integration",
        icon: <Code className="w-6 h-6" />,
        color: "from-purple-500 to-purple-600",
      },
      {
        title: "Programming Expertise",
        description: "Master robot programming and autonomous systems",
        icon: <Brain className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Competition Experience",
        description: "Compete in prestigious robotics competitions",
        icon: <Trophy className="w-6 h-6" />,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "Career Preparation",
        description: "Build skills for engineering and technology careers",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "from-green-500 to-teal-500",
      },
    ],
    faqItems: [
      {
        question: "Do I need robotics experience?",
        answer: "No experience required! We teach everything from basics to advanced techniques.",
      },
      {
        question: "What programming languages do we use?",
        answer: "We primarily use Java and Python for robot programming, but we teach from the ground up.",
      },
      {
        question: "How much time commitment is required?",
        answer: "Regular meetings are 2 hours weekly, with additional time during competition season (January-April).",
      },
    ],
    stats: [
      { number: "8+", label: "Robots Built", icon: "🤖" },
      { number: "35", label: "Team Members", icon: "👥" },
      { number: "5+", label: "Competition Wins", icon: "🏆" },
      { number: "100%", label: "STEM Career Interest", icon: "💻" },
    ],
  },
  "debate-team": {
    slug: "debate-team",
    name: "Debate Team",
    icon: <Users className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    members: 28,
    meetingTime: "Mondays 4:00 PM",
    location: "Room 301",
    adviser: {
      name: "Mr. Robert Thompson",
      title: "English & Debate Coach",
      credentials: "M.A. in Communication, Northwestern University • 14+ years experience",
      bio: "Mr. Thompson has coached championship debate teams and helped students develop critical thinking and public speaking skills that serve them throughout life.",
      achievements: [
        "🏆 State Debate Coach of the Year",
        "🎤 National Tournament Coach",
        "📚 Published Debate Curriculum",
        "⭐ Communication Excellence Award",
      ],
      quote:
        "Debate teaches students to think critically, speak confidently, and understand multiple perspectives—skills essential for success in any field.",
      email: "r.thompson@southville8bnhs.edu",
      office: "Room 301",
      image: "/placeholder.svg?height=150&width=150&text=Mr.+Thompson",
    },
    description:
      "Develop critical thinking, public speaking, and argumentation skills through competitive debate. Participate in local, state, and national tournaments.",
    mission:
      "The Debate Team cultivates articulate, informed citizens who can analyze complex issues, construct persuasive arguments, and communicate effectively.",
    goals: [
      "🎤 Master public speaking",
      "🧠 Develop critical thinking",
      "📚 Conduct thorough research",
      "🏆 Excel in competitions",
      "🤝 Build confidence and poise",
    ],
    officers: [
      {
        name: "Jordan Lee",
        position: "Team Captain",
        grade: "Grade 12",
        bio: "Jordan has competed in debate for 4 years and qualified for nationals twice.",
        achievements: ["National Qualifier", "State Champion", "Outstanding Speaker Award"],
        image: "/placeholder.svg?height=120&width=120&text=JL",
        icon: <Crown className="w-5 h-5" />,
      },
    ],
    upcomingEvents: [
      {
        title: "State Debate Tournament",
        date: "2024-04-10",
        time: "8:00 AM - 5:00 PM",
        location: "State University",
        description: "Compete for state championship",
        type: "Competition",
        icon: <Trophy className="w-5 h-5" />,
      },
    ],
    benefits: [
      {
        title: "Public Speaking",
        description: "Develop confidence and eloquence in public speaking",
        icon: <Users className="w-6 h-6" />,
        color: "from-red-500 to-red-600",
      },
      {
        title: "Critical Thinking",
        description: "Analyze complex issues from multiple perspectives",
        icon: <Brain className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
      },
    ],
    faqItems: [
      {
        question: "What debate formats do you practice?",
        answer: "We practice Lincoln-Douglas, Public Forum, and Policy debate formats.",
      },
    ],
    stats: [
      { number: "10+", label: "Tournament Wins", icon: "🏆" },
      { number: "28", label: "Debaters", icon: "👥" },
      { number: "15+", label: "Tournaments Yearly", icon: "📅" },
      { number: "90%", label: "College Acceptance", icon: "🎓" },
    ],
  },
  "model-un": {
    slug: "model-un",
    name: "Model United Nations",
    icon: <Globe className="w-6 h-6" />,
    color: "from-teal-500 to-teal-600",
    members: 32,
    meetingTime: "Wednesdays 3:30 PM",
    location: "Room 302",
    adviser: {
      name: "Ms. Jennifer Adams",
      title: "Social Studies Teacher & MUN Adviser",
      credentials: "M.A. in International Relations, Georgetown University • 11+ years experience",
      bio: "Ms. Adams brings real-world diplomatic experience to guide students in understanding global issues and developing negotiation skills.",
      achievements: [
        "🌍 International Relations Expert",
        "🏆 MUN Conference Director",
        "📚 Global Education Award",
        "⭐ Outstanding Adviser Recognition",
      ],
      quote:
        "Model UN teaches students that they have the power to make a difference in the world through diplomacy, collaboration, and understanding.",
      email: "j.adams@southville8bnhs.edu",
      office: "Room 302",
      image: "/placeholder.svg?height=150&width=150&text=Ms.+Adams",
    },
    description:
      "Simulate UN proceedings, debate global issues, and develop diplomatic skills. Represent different countries and work toward international solutions.",
    mission:
      "Model UN empowers students to become global citizens who understand international relations and can work collaboratively to solve world problems.",
    goals: [
      "🌍 Understand global issues",
      "🤝 Develop diplomatic skills",
      "🎤 Master public speaking",
      "📚 Research international topics",
      "🏆 Excel at MUN conferences",
    ],
    officers: [
      {
        name: "Sophia Martinez",
        position: "Secretary-General",
        grade: "Grade 12",
        bio: "Sophia has attended 8 MUN conferences and won multiple Best Delegate awards.",
        achievements: ["Best Delegate Awards", "Conference Leadership", "Diplomatic Excellence"],
        image: "/placeholder.svg?height=120&width=120&text=SM",
        icon: <Crown className="w-5 h-5" />,
      },
    ],
    upcomingEvents: [
      {
        title: "Regional MUN Conference",
        date: "2024-04-18",
        time: "9:00 AM - 5:00 PM",
        location: "Convention Center",
        description: "Represent countries in simulated UN committees",
        type: "Conference",
        icon: <Globe className="w-5 h-5" />,
      },
    ],
    benefits: [
      {
        title: "Global Awareness",
        description: "Understand international relations and world affairs",
        icon: <Globe className="w-6 h-6" />,
        color: "from-teal-500 to-teal-600",
      },
      {
        title: "Diplomacy Skills",
        description: "Learn negotiation and conflict resolution",
        icon: <Users className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
      },
    ],
    faqItems: [
      {
        question: "What is Model UN?",
        answer:
          "Model UN simulates United Nations proceedings where students represent countries and debate global issues.",
      },
    ],
    stats: [
      { number: "12+", label: "Conferences Attended", icon: "🌍" },
      { number: "32", label: "Delegates", icon: "👥" },
      { number: "20+", label: "Awards Won", icon: "🏆" },
      { number: "15+", label: "Countries Represented", icon: "🗺️" },
    ],
  },
  // Add more clubs here following the same structure
}

type ClubSlug = keyof typeof clubsData

export default function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const club = useMemo(() => clubsData[slug as ClubSlug], [slug])

  if (!club) {
    notFound()
  }

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
    console.log("Form submitted:", formData)
    alert("Thank you for your interest! We'll contact you soon with next steps.")
  }

  return (
    <div className="min-h-screen">
      {/* Server-rendered metadata and JSON-LD */}
      <ServerSeo params={{ slug }} />
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
                <div className="flex items-center">
                  {club.icon}
                  <span className="mx-3">{club.members} Active Members</span>
                </div>
                <Sparkles className="w-5 h-5 ml-3" />
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight">
              Southville 8B <span className="text-yellow-300">{club.name}</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto text-white/90">
              {club.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                Join Our Club
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                variant="outline"
                size="lg"
                className="group font-bold text-lg px-8 py-4 rounded-full w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Calendar className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                View Events
              </AnimatedButton>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {club.stats.map((stat, index) => (
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
                Empowering <span className="gradient-text">Excellence</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">🎯 What We Stand For</h3>
                <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{club.mission}</p>

                <div className="space-y-4">
                  {club.goals.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Image
                  src={`/placeholder.svg?height=400&width=500&text=${club.name}+Mission`}
                  alt={`${club.name} Mission`}
                  width={500}
                  height={400}
                  className="w-full rounded-2xl shadow-lg"
                  sizes="(min-width: 768px) 500px, 90vw"
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
            {club.officers.map((officer, index) => (
              <AnimatedCard
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-slideInUp text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  <div className="relative mb-6">
                    <Image
                      src={officer.image || "/placeholder.svg"}
                      alt={officer.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform"
                      sizes="96px"
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
                      <Image
                        src={club.adviser.image || "/placeholder.svg"}
                        alt={club.adviser.name}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-2xl mx-auto shadow-lg group-hover:scale-105 transition-transform"
                        sizes="128px"
                      />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {club.adviser.name}
                      </h3>
                      <p className="text-lg text-primary font-semibold mb-2">{club.adviser.title}</p>
                      <p className="text-sm text-muted-foreground">{club.adviser.credentials}</p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{club.adviser.bio}</p>

                    <div>
                      <h4 className="text-sm font-bold mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-primary" />
                        Key Achievements
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {club.adviser.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <blockquote className="text-sm text-muted-foreground italic">{club.adviser.quote}</blockquote>
                      <p className="text-right mt-2 text-xs font-semibold text-primary">— {club.adviser.name}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{club.adviser.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{club.adviser.office}</span>
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
            {club.upcomingEvents.map((event, index) => (
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
              Why Join <span className="gradient-text">{club.name}?</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
              Discover the amazing opportunities and benefits that come with being part of our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {club.benefits.map((benefit, index) => (
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
                Fill out the form below to join our amazing {club.name} community!
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">{club.name} Registration</CardTitle>
                <CardDescription className="text-center">
                  Complete this form to become a member of Southville 8B {club.name}
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
                      <Label htmlFor="mathLevel">Current Level</Label>
                      <Select
                        value={formData.mathLevel}
                        onValueChange={(value) => handleInputChange("mathLevel", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Previous Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Tell us about any related activities you've participated in..."
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interests">Your Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="What interests you most about this club?"
                      value={formData.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Goals & Expectations</Label>
                    <Textarea
                      id="goals"
                      placeholder="What do you hope to achieve by joining this club?"
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
              Find answers to common questions about joining and participating in {club.name}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {club.faqItems.map((item, index) => (
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join Our Journey?</h2>
            <p className="text-lg mb-8 text-white/90">
              Don't miss out on the opportunity to be part of our award-winning {club.name} community!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <AnimatedButton
                size="lg"
                className="group font-bold text-lg px-8 py-3 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                {club.icon}
                <span className="mx-3">Join {club.name}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" />
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
                Questions? Contact our club advisor at <strong>{club.adviser.email}</strong> or visit us in{" "}
                {club.location}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
