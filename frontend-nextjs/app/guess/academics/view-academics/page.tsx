import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  GraduationCap,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react"

export default function ViewAcademicsPage() {
  const departments = [
    {
      title: "Mathematics",
      description: "From Algebra to Calculus, building strong analytical skills",
      courses: 12,
      apCourses: 4,
      teachers: 8,
      successRate: 94,
      icon: <Calculator className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      image: "/placeholder.svg?height=300&width=400&text=Mathematics+Department",
    },
    {
      title: "Science",
      description: "Hands-on laboratory experiences in Biology, Chemistry, Physics",
      courses: 15,
      apCourses: 5,
      teachers: 10,
      successRate: 91,
      icon: <Microscope className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      image: "/placeholder.svg?height=300&width=400&text=Science+Labs",
    },
    {
      title: "English Language Arts",
      description: "Critical thinking and communication through literature",
      courses: 10,
      apCourses: 3,
      teachers: 7,
      successRate: 92,
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      image: "/placeholder.svg?height=300&width=400&text=English+Department",
    },
    {
      title: "Social Studies",
      description: "History, government, and global perspectives",
      courses: 11,
      apCourses: 4,
      teachers: 6,
      successRate: 88,
      icon: <Globe className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      image: "/placeholder.svg?height=300&width=400&text=Social+Studies",
    },
    {
      title: "Fine Arts",
      description: "Creative expression through visual and performing arts",
      courses: 8,
      apCourses: 2,
      teachers: 5,
      successRate: 95,
      icon: <Palette className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
      image: "/placeholder.svg?height=300&width=400&text=Fine+Arts",
    },
    {
      title: "Physical Education",
      description: "Health, fitness, and wellness programs",
      courses: 6,
      apCourses: 0,
      teachers: 4,
      successRate: 98,
      icon: <Dumbbell className="w-8 h-8" />,
      color: "from-teal-500 to-teal-600",
      image: "/placeholder.svg?height=300&width=400&text=Physical+Education",
    },
  ]

  const quickStats = [
    { label: "Total Courses", value: "150+", icon: <BookOpen className="w-6 h-6" /> },
    { label: "AP Courses", value: "25+", icon: <Award className="w-6 h-6" /> },
    { label: "Faculty Members", value: "85+", icon: <Users className="w-6 h-6" /> },
    { label: "Success Rate", value: "91%", icon: <TrendingUp className="w-6 h-6" /> },
  ]

  const specialPrograms = [
    {
      title: "Dual Enrollment",
      description: "Earn college credits while in high school through partnerships with local universities",
      participants: 120,
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "International Baccalaureate",
      description: "Globally recognized program preparing students for international universities",
      participants: 85,
      icon: <Globe className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "STEM Research Program",
      description: "Independent research projects with mentorship from industry professionals",
      participants: 45,
      icon: <Microscope className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Arts Conservatory",
      description: "Intensive training in visual and performing arts with professional instruction",
      participants: 60,
      icon: <Palette className="w-6 h-6" />,
      color: "from-pink-500 to-pink-600",
    },
  ]

  const upcomingEvents = [
    {
      title: "Academic Fair 2024",
      date: "March 15, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "Main Gymnasium",
      description: "Explore all academic departments and programs",
    },
    {
      title: "Science Symposium",
      date: "April 8, 2024",
      time: "9:00 AM - 4:00 PM",
      location: "Science Building",
      description: "Student research presentations and demonstrations",
    },
    {
      title: "AP Information Session",
      date: "February 20, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Auditorium",
      description: "Learn about Advanced Placement opportunities",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-school-blue via-vibrant-purple to-vibrant-pink text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <BookOpen className="w-4 h-4 mr-2" />
            Academic Overview
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
            View Our <span className="text-school-gold">Academic</span> Programs
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto animate-slideInUp mb-8">
            Explore comprehensive academic departments, specialized programs, and opportunities that prepare students
            for success in higher education and beyond.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4 hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Departments */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Academic <span className="gradient-text">Departments</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive departments offering diverse courses and specialized programs for every student interest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((department, index) => (
              <AnimatedCard
                key={department.title}
                variant="lift"
                className="overflow-hidden animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={department.image || "/placeholder.svg"}
                    alt={department.title}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-4 right-4 p-3 rounded-xl bg-gradient-to-r ${department.color} text-white shadow-lg`}
                  >
                    {department.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{department.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{department.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Courses:</span>
                      <span className="font-semibold">{department.courses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">AP Courses:</span>
                      <span className="font-semibold">{department.apCourses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Teachers:</span>
                      <span className="font-semibold">{department.teachers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Success:</span>
                      <span className="font-semibold">{department.successRate}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span>{department.successRate}%</span>
                    </div>
                    <Progress value={department.successRate} className="h-2" />
                  </div>

                  <AnimatedButton variant="outline" size="sm" className="w-full group">
                    View Department
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-2" />
              Special Programs
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Specialized <span className="gradient-text">Academic Programs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced programs designed for students seeking additional challenges and specialized learning
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specialPrograms.map((program, index) => (
              <AnimatedCard
                key={program.title}
                variant="lift"
                className="p-8 animate-slideInLeft"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${program.color} text-white flex-shrink-0`}>
                    {program.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {program.participants} Participants
                      </Badge>
                      <AnimatedButton variant="ghost" size="sm" className="group">
                        Learn More
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Academic Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Academic <span className="gradient-text">Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't miss these important academic events and opportunities to learn more about our programs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <AnimatedCard
                key={event.title}
                variant="lift"
                className="p-6 animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <AnimatedButton variant="outline" size="sm" className="w-full">
                  Add to Calendar
                </AnimatedButton>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-school-blue to-vibrant-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore Our Academic Programs?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Take the next step in your educational journey. Contact us to learn more about our comprehensive academic
            offerings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Users className="w-5 h-5 mr-2" />
              Schedule Campus Tour
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
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
