import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Microscope,
  Calculator,
  Globe,
  Palette,
  Users,
  Star,
  GraduationCap,
  Clock,
  MapPin,
  Calendar,
  Lightbulb,
  Rocket,
  Brain,
  Heart,
} from "lucide-react"

export default function LearnMorePage() {
  const academicPrograms = [
    {
      title: "Advanced Placement (AP) Program",
      description: "College-level courses that prepare students for higher education success.",
      features: ["25+ AP Courses", "91% Pass Rate", "College Credit Opportunities", "Expert Faculty"],
      icon: <GraduationCap className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "STEM Excellence Initiative",
      description: "Cutting-edge science, technology, engineering, and mathematics education.",
      features: ["State-of-the-art Labs", "Research Opportunities", "Industry Partnerships", "Innovation Projects"],
      icon: <Microscope className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Liberal Arts & Humanities",
      description: "Comprehensive programs in literature, history, and social sciences.",
      features: ["Critical Thinking", "Research Skills", "Cultural Awareness", "Communication Excellence"],
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Fine & Performing Arts",
      description: "Creative expression through visual arts, music, theater, and digital media.",
      features: ["Award-Winning Programs", "Performance Opportunities", "Creative Studios", "Professional Mentorship"],
      icon: <Palette className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
    },
  ]

  const learningApproaches = [
    {
      title: "Project-Based Learning",
      description: "Students engage in real-world projects that develop critical thinking and problem-solving skills.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      title: "Collaborative Learning",
      description: "Group work and peer learning foster communication skills and teamwork abilities.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Technology Integration",
      description: "Modern technology enhances learning experiences and prepares students for the digital age.",
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      title: "Personalized Education",
      description: "Individualized learning paths ensure every student reaches their full potential.",
      icon: <Brain className="w-6 h-6" />,
    },
  ]

  const supportServices = [
    {
      title: "Academic Counseling",
      description: "Personalized guidance for course selection and academic planning.",
      availability: "Daily 8:00 AM - 4:00 PM",
      contact: "counseling@southville8bnhs.edu",
    },
    {
      title: "Tutoring Center",
      description: "Free peer and professional tutoring in all subject areas.",
      availability: "Monday-Friday 3:00 PM - 6:00 PM",
      contact: "tutoring@southville8bnhs.edu",
    },
    {
      title: "College Preparation",
      description: "SAT/ACT prep, college applications, and scholarship guidance.",
      availability: "By Appointment",
      contact: "college@southville8bnhs.edu",
    },
    {
      title: "Special Education Services",
      description: "Individualized support for students with diverse learning needs.",
      availability: "As Scheduled",
      contact: "specialed@southville8bnhs.edu",
    },
  ]

  const achievements = [
    { metric: "98%", label: "College Acceptance Rate", description: "Students accepted to 4-year universities" },
    { metric: "91%", label: "AP Pass Rate", description: "Students scoring 3+ on AP exams" },
    { metric: "1,285", label: "Average SAT Score", description: "Above state and national averages" },
    { metric: "15+", label: "National Merit Scholars", description: "Students recognized for academic excellence" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-school-blue via-vibrant-purple to-vibrant-pink text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <BookOpen className="w-4 h-4 mr-2" />
            Academic Excellence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Discover Our <span className="text-school-gold">Academic</span> Excellence
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto animate-slideInUp mb-8">
            At Southville 8B NHS, we provide a comprehensive educational experience that prepares students for success
            in college, career, and life. Our innovative programs, dedicated faculty, and state-of-the-art facilities
            create an environment where every student can thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule a Visit
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Virtual Tour
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Academic Programs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive programs designed to challenge, inspire, and prepare students for their future endeavors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {academicPrograms.map((program, index) => (
              <AnimatedCard
                key={program.title}
                variant="lift"
                className="p-8 animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${program.color} text-white mb-6`}>
                  {program.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{program.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{program.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Approaches */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Teaching Excellence
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Innovative <span className="gradient-text">Learning Approaches</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our teaching methodologies are designed to engage students and foster deep understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningApproaches.map((approach, index) => (
              <AnimatedCard
                key={approach.title}
                variant="lift"
                className="text-center p-6 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">{approach.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{approach.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{approach.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Support Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Student Support
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive <span className="gradient-text">Support Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide extensive support to ensure every student succeeds academically and personally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {supportServices.map((service, index) => (
              <AnimatedCard
                key={service.title}
                variant="lift"
                className="p-6 animate-slideInLeft"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{service.availability}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{service.contact}</span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Achievements */}
      <section className="py-20 bg-gradient-to-r from-vibrant-purple via-vibrant-pink to-vibrant-orange text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Academic Achievements</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Our commitment to excellence is reflected in our students' outstanding academic performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <AnimatedCard
                key={achievement.label}
                variant="glass"
                animation="float"
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl font-bold mb-2 animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                  {achievement.metric}
                </div>
                <h3 className="text-lg font-semibold mb-2">{achievement.label}</h3>
                <p className="text-sm opacity-80">{achievement.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Program Information */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Our <span className="gradient-text">Departments</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dive deeper into our academic departments and discover the opportunities that await you.
            </p>
          </div>

          <Tabs defaultValue="mathematics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12">
              <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              <TabsTrigger value="science">Science</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="social-studies">Social Studies</TabsTrigger>
            </TabsList>

            <TabsContent value="mathematics">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slideInLeft">
                  <h3 className="text-3xl font-bold mb-6">Mathematics Department</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Our mathematics program builds strong analytical and problem-solving skills through comprehensive
                    courses ranging from Algebra to Advanced Calculus. Students develop logical thinking and
                    mathematical reasoning that serves them well in all areas of study.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      "AP Calculus AB & BC",
                      "AP Statistics",
                      "Honors Geometry & Algebra II",
                      "Pre-Calculus & Trigonometry",
                      "Mathematical Modeling",
                      "Computer Science Integration",
                    ].map((course, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Calculator className="w-5 h-5 text-primary" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                  <AnimatedButton variant="gradient" size="lg">
                    <BookOpen className="w-5 h-5 mr-2" />
                    View Course Catalog
                  </AnimatedButton>
                </div>
                <div className="animate-slideInRight">
                  <img
                    src="/placeholder.svg?height=400&width=600&text=Mathematics+Classroom"
                    alt="Mathematics Classroom"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="science">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slideInLeft">
                  <h3 className="text-3xl font-bold mb-6">Science Department</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Our science program emphasizes hands-on laboratory experiences and scientific inquiry. Students
                    engage in real research projects and develop critical thinking skills through experimentation and
                    analysis.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      "AP Biology & Chemistry",
                      "AP Physics 1 & 2",
                      "Environmental Science",
                      "Anatomy & Physiology",
                      "Research Methods",
                      "Science Fair Participation",
                    ].map((course, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Microscope className="w-5 h-5 text-primary" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                  <AnimatedButton variant="gradient" size="lg">
                    <Microscope className="w-5 h-5 mr-2" />
                    Explore Labs
                  </AnimatedButton>
                </div>
                <div className="animate-slideInRight">
                  <img
                    src="/placeholder.svg?height=400&width=600&text=Science+Laboratory"
                    alt="Science Laboratory"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="english">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slideInLeft">
                  <h3 className="text-3xl font-bold mb-6">English Language Arts</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Our English program develops critical thinking, communication, and literary analysis skills.
                    Students explore diverse texts and express their ideas through various forms of writing and creative
                    expression.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      "AP Literature & Composition",
                      "AP Language & Composition",
                      "Creative Writing",
                      "Public Speaking",
                      "Journalism",
                      "Drama & Theater Arts",
                    ].map((course, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                  <AnimatedButton variant="gradient" size="lg">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Reading Lists
                  </AnimatedButton>
                </div>
                <div className="animate-slideInRight">
                  <img
                    src="/placeholder.svg?height=400&width=600&text=English+Classroom"
                    alt="English Classroom"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social-studies">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slideInLeft">
                  <h3 className="text-3xl font-bold mb-6">Social Studies Department</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Our social studies program helps students understand history, government, economics, and global
                    perspectives. Students develop informed citizenship skills and cultural awareness through
                    comprehensive study and discussion.
                  </p>
                  <div className="space-y-4 mb-8">
                    {[
                      "AP US History",
                      "AP World History",
                      "AP Government & Politics",
                      "Economics",
                      "Psychology",
                      "Global Studies",
                    ].map((course, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                  <AnimatedButton variant="gradient" size="lg">
                    <Globe className="w-5 h-5 mr-2" />
                    Course Details
                  </AnimatedButton>
                </div>
                <div className="animate-slideInRight">
                  <img
                    src="/placeholder.svg?height=400&width=600&text=Social+Studies+Classroom"
                    alt="Social Studies Classroom"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-school-blue to-vibrant-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Academic Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join our academic community and discover the opportunities that await you at Southville 8B NHS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Users className="w-5 h-5 mr-2" />
              Apply Now
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Visit
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
