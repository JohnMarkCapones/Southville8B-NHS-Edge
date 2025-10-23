"use client"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import {
  Smartphone,
  Download,
  Bell,
  BookOpen,
  Calendar,
  Users,
  Star,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Apple,
  CheckCircle,
  Sparkles,
  Heart,
  Camera,
} from "lucide-react"

export default function MobileAppPage() {
  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 })
  const [featuresRef, featuresInView] = useIntersectionObserver({ threshold: 0.1 })
  const [screenshotsRef, screenshotsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [testimonialsRef, testimonialsInView] = useIntersectionObserver({ threshold: 0.1 })
  const [downloadRef, downloadInView] = useIntersectionObserver({ threshold: 0.1 })

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Access Grades Anywhere",
      description: "View your grades, assignments, and academic progress in real-time, anytime, anywhere.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-time Notifications",
      description: "Stay updated with instant notifications about events, announcements, and important deadlines.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Event Calendar",
      description: "Never miss school events, activities, or important dates with our integrated calendar system.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Connection",
      description: "Connect with classmates, teachers, and stay engaged with the school community.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-level security and privacy measures.",
      color: "from-gray-600 to-gray-700",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance ensures quick access to all your school information.",
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Grade 10 Student",
      content:
        "The app makes it so easy to check my grades and stay updated with school events. I love the notifications!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=MS",
    },
    {
      name: "John Rodriguez",
      role: "Parent",
      content:
        "As a parent, I appreciate being able to monitor my child's progress and stay informed about school activities.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=JR",
    },
    {
      name: "Sarah Kim",
      role: "Grade 12 Student",
      content: "The calendar feature is a lifesaver! I never miss important deadlines or events anymore.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=SK",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-500"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 bg-white animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className={cn("max-w-6xl mx-auto", heroInView && "animate-fadeIn")}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="text-center lg:text-left">
                <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Now Available on Mobile
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                  Southville 8B NHS
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                    Edge
                  </span>
                </h1>

                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  Your School Portal is now in your pocket. Education merges with technology at the Edge of innovation.
                </p>

                {/* Download buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <AnimatedButton
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-xl font-semibold group"
                  >
                    <Apple className="w-6 h-6 mr-3" />
                    Download for iOS
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </AnimatedButton>

                  <AnimatedButton
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold group"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Get on Android
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </AnimatedButton>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-white/80">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">4.9</div>
                    <div className="text-sm">App Store Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">10K+</div>
                    <div className="text-sm">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">99%</div>
                    <div className="text-sm">Uptime</div>
                  </div>
                </div>
              </div>

              {/* Right content - Phone mockups */}
              <div className="relative">
                <div className="flex justify-center space-x-4">
                  {/* Phone 1 */}
                  <div className="relative transform rotate-6 hover:rotate-3 transition-transform duration-300">
                    <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                        <img
                          src="/images/design-mode/image%281%29%281%29(1).png"
                          alt="Access the portal anywhere"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone 2 */}
                  <div className="relative transform -rotate-6 hover:-rotate-3 transition-transform duration-300 mt-8">
                    <div className="w-64 h-[500px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                        <img
                          src="/images/design-mode/image%281%29%281%29(1).png"
                          alt="Event Notification Real-time"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", featuresInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              App Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need in <span className="gradient-text">One App</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              Designed with students, parents, and educators in mind. Access all your school information seamlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                className={cn(
                  "group hover:scale-105 transition-all duration-300 animate-slideInUp",
                  featuresInView && "animate-slideInUp",
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-white bg-gradient-to-r",
                      feature.color,
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section ref={screenshotsRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", screenshotsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Camera className="w-4 h-4 mr-2" />
              App Preview
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See the App in <span className="gradient-text">Action</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              Take a closer look at the intuitive interface and powerful features that make school management
              effortless.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  <img
                    src="/images/design-mode/image%281%29%281%29(1).png"
                    alt="Southville 8B NHS Edge Welcome Screen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className={cn("text-center mb-16", testimonialsInView && "animate-fadeIn")}>
            <Badge variant="secondary" className="mb-4">
              <Heart className="w-4 h-4 mr-2" />
              User Reviews
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Our <span className="gradient-text">Community</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
              See what students, parents, and educators are saying about the Southville 8B NHS Edge app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard
                key={index}
                className={cn(
                  "group hover:scale-105 transition-all duration-300 animate-slideInUp",
                  testimonialsInView && "animate-slideInUp",
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section
        ref={downloadRef}
        className="py-20 relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 bg-white"
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
          <div className={cn("text-center max-w-4xl mx-auto", downloadInView && "animate-fadeIn")}>
            <Badge
              variant="secondary"
              className="mb-6 text-base px-6 py-3 rounded-full bg-white/20 text-white border-white/30"
            >
              <Download className="w-5 h-5 mr-3" />
              Ready to Get Started?
              <Sparkles className="w-5 h-5 ml-3" />
            </Badge>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight text-white">
              Download the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Southville 8B NHS Edge
              </span>{" "}
              App Today
            </h2>

            <p className="text-lg sm:text-xl lg:text-2xl mb-12 leading-relaxed max-w-3xl mx-auto text-white/90">
              Join thousands of students and parents who are already enjoying the convenience of having their school
              portal in their pocket.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <AnimatedButton
                size="xl"
                className="group font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl w-full sm:w-auto relative overflow-hidden transition-all duration-300 bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95"
              >
                <Apple className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                Download for iOS
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>

              <AnimatedButton
                size="xl"
                variant="outline"
                className="group font-bold text-lg px-8 py-4 rounded-xl w-full sm:w-auto transition-all duration-300 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-all duration-300" />
                Get on Android
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
              </AnimatedButton>
            </div>

            {/* Features checklist */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white/90">
              <div className="flex items-center justify-center sm:justify-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                <span>Free Download</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                <span>Regular Updates</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
