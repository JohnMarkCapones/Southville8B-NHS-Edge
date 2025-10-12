"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import StudentLayout from "@/components/student/student-layout"
import Link from "next/link"
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Heart,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Target,
  Sparkles,
  GraduationCap,
} from "lucide-react"
import { useState } from "react"

interface JoinClubPageProps {
  params: {
    slug: string
  }
}

export default function JoinClubPage({ params }: JoinClubPageProps) {
  const [applicationStep, setApplicationStep] = useState(1)
  const [formData, setFormData] = useState({
    reason: "",
    experience: "",
    availability: "",
    goals: "",
  })

  // Mock club data based on slug
  const getClubData = (slug: string) => {
    const clubs = {
      "drama-club": {
        id: 3,
        name: "Drama Club",
        members: 25,
        nextMeeting: "Monday 4:00 PM",
        location: "Auditorium",
        description: "Theater performances and creative expression through dramatic arts",
        longDescription:
          "Join our vibrant drama community where creativity meets performance! We explore various theatrical forms, from classical plays to modern interpretations, helping students develop confidence, public speaking skills, and artistic expression.",
        color: "bg-purple-500",
        advisor: "Ms. Torres",
        category: "Arts",
        difficulty: "Beginner Friendly",
        timeCommitment: "3-4 hours/week",
        highlights: ["Annual School Play", "Drama Competitions", "Improv Workshops"],
        requirements: [
          "Enthusiasm for theater and performance",
          "Commitment to attend weekly rehearsals",
          "Willingness to participate in school productions",
          "Open mind for creative collaboration",
        ],
        benefits: [
          "Develop public speaking confidence",
          "Build teamwork and collaboration skills",
          "Express creativity through performance",
          "Participate in inter-school competitions",
          "Gain stage experience and portfolio",
        ],
        upcomingEvents: [
          { name: "Auditions for Spring Play", date: "March 15", type: "Audition" },
          { name: "Drama Workshop", date: "March 20", type: "Workshop" },
          { name: "Theater Trip", date: "April 5", type: "Field Trip" },
        ],
        socialLinks: { facebook: "#", instagram: "#" },
        applicationProcess: [
          "Fill out interest form",
          "Attend introduction meeting",
          "Participate in trial workshop",
          "Complete membership application",
        ],
      },
      "art-club": {
        id: 4,
        name: "Art Club",
        members: 30,
        nextMeeting: "Wednesday 3:30 PM",
        location: "Art Room",
        description: "Visual arts, painting, and creative projects",
        longDescription:
          "Unleash your artistic potential in our creative sanctuary! From traditional painting and drawing to digital art and sculpture, we provide a supportive environment for artists of all skill levels to grow and showcase their talents.",
        color: "bg-pink-500",
        advisor: "Mr. Dela Cruz",
        category: "Arts",
        difficulty: "All Levels",
        timeCommitment: "2-3 hours/week",
        highlights: ["Art Exhibitions", "Community Murals", "Art Contests"],
        requirements: [
          "Passion for visual arts",
          "Basic art supplies (provided if needed)",
          "Regular attendance at meetings",
          "Respect for shared workspace",
        ],
        benefits: [
          "Develop artistic techniques and skills",
          "Showcase work in school exhibitions",
          "Connect with fellow artists",
          "Access to professional art supplies",
          "Mentorship from experienced artists",
        ],
        upcomingEvents: [
          { name: "Spring Art Exhibition", date: "April 10", type: "Exhibition" },
          { name: "Mural Painting Project", date: "March 25", type: "Project" },
          { name: "Art Supply Workshop", date: "March 18", type: "Workshop" },
        ],
        socialLinks: { facebook: "#", instagram: "#" },
        applicationProcess: [
          "Submit portfolio (optional)",
          "Attend club meeting",
          "Complete interest survey",
          "Start creating!",
        ],
      },
    }
    return clubs[slug as keyof typeof clubs] || clubs["drama-club"]
  }

  const club = getClubData(params.slug)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitApplication = () => {
    // Handle application submission
    setApplicationStep(4)
  }

  return (
    <StudentLayout>
      <div className="p-6 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student/clubs">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className={`relative overflow-hidden ${club.color} rounded-3xl p-8 text-white`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Join {club.name}</h1>
                  <p className="text-white/90 text-lg mb-4">{club.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white border-white/30">{club.category}</Badge>
                    <Badge className="bg-white/20 text-white border-white/30">{club.difficulty}</Badge>
                    <Badge className="bg-white/20 text-white border-white/30">{club.timeCommitment}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{club.members}</div>
                  <div className="text-sm text-white/80">Members</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-sm text-white/80">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-500" />
                  About {club.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{club.longDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">Meeting Location</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{club.location}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 text-green-500 mr-2" />
                      <span className="font-medium text-green-700 dark:text-green-300">Next Meeting</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">{club.nextMeeting}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Sparkles className="w-6 h-6 mr-3 text-purple-500" />
                  What You'll Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {club.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="w-6 h-6 mr-3 text-orange-500" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {club.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-orange-700 dark:text-orange-300">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Process */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <GraduationCap className="w-6 h-6 mr-3 text-indigo-500" />
                  Application Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {club.applicationProcess.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"
                    >
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Advisor</span>
                  <span className="text-sm font-medium">{club.advisor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                  <span className="text-sm font-medium">{club.members} students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time Commitment</span>
                  <span className="text-sm font-medium">{club.timeCommitment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                  <Badge variant="outline" className="text-xs">
                    {club.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{event.name}</span>
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        {event.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{event.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Join Button */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-white/90" />
                <h3 className="text-lg font-bold mb-2">Ready to Join?</h3>
                <p className="text-sm text-white/90 mb-4">Start your journey with {club.name} today!</p>
                <Button
                  className="w-full bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => setApplicationStep(2)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Social</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Advisor
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask Questions
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Instagram className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Modal/Steps would go here */}
        {applicationStep > 1 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-6 h-6 mr-3 text-green-500" />
                  Join {club.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {applicationStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Why do you want to join {club.name}?</label>
                      <Textarea
                        placeholder="Share your motivation and interests..."
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Previous experience (if any)</label>
                      <Textarea
                        placeholder="Tell us about any relevant experience..."
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your availability</label>
                      <Input
                        placeholder="e.g., Weekdays after 3 PM, Weekends"
                        value={formData.availability}
                        onChange={(e) => handleInputChange("availability", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">What do you hope to achieve?</label>
                      <Textarea
                        placeholder="Your goals and expectations..."
                        value={formData.goals}
                        onChange={(e) => handleInputChange("goals", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setApplicationStep(1)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitApplication} className="bg-green-500 hover:bg-green-600">
                    Submit Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
