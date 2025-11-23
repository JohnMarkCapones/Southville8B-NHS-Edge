"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import StudentLayout from "@/components/student/student-layout"
import Link from "next/link"
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Star,
  Trophy,
  Heart,
  UserPlus,
  ExternalLink,
  Search,
  Filter,
  Award,
  MessageCircle,
  BookOpen,
  Zap,
  Sparkles,
  FileText,
  Loader2,
  Eye,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useUser, useStudentClubs } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { getClubs } from "@/lib/api/endpoints/clubs"

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("my-clubs")
  const limit = 50
  const { data: user } = useUser()
  const studentId = user?.student?.id
  const { data: myClubsResp } = useStudentClubs(studentId)

  // Fetch all clubs using the newer API
  const { data: availableResp = [], isLoading: loadingClubs } = useQuery({
    queryKey: ['clubs', 'all'],
    queryFn: () => getClubs({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters first
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim()
  }

  const myClubs = useMemo(() => {
    const memberships = myClubsResp || []
    return memberships.map((m, idx) => ({
      id: m.club.id,
      name: m.club.name,
      role: m.position?.name || 'Member',
      members: m.club.member_count ?? 0,
      nextMeeting: "",
      location: "",
      description: m.club.description || "",
      achievements: [],
      color: "bg-blue-500",
      joined: m.joined_at || "",
      engagement: 0,
      upcomingEvents: 0,
      category: m.club.category || "",
      advisor: "",
      meetingFrequency: "",
      socialLinks: {},
    }))
  }, [myClubsResp])
  

  const availableClubs = useMemo(() => {
    const list = availableResp || []
    return list.map((c, idx) => ({
      id: c.id,
      name: c.name,
      members: 0, // Can be populated if membership count is available
      nextMeeting: "",
      location: "",
      description: c.description || "",
      color: "bg-purple-500",
      advisor: c.advisor?.full_name || "",
      category: c.domain?.name || "",
      difficulty: "All Levels",
      timeCommitment: "",
      highlights: [],
    }))
  }, [availableResp])

  const clubStats = useMemo(() => {
    // Calculate total achievements across all clubs
    const totalAchievements = myClubs.reduce((sum, club) => sum + (club.achievements?.length || 0), 0)

    // Calculate upcoming events
    const totalUpcomingEvents = myClubs.reduce((sum, club) => sum + (club.upcomingEvents || 0), 0)

    return {
      totalClubs: availableClubs.length,
      myClubs: myClubs.length,
      upcomingEvents: totalUpcomingEvents,
      achievements: totalAchievements,
    }
  }, [availableClubs.length, myClubs])

  const categories = ["all", "Academic", "Arts", "Service", "Sports", "Technology"]

  const filteredClubs = availableClubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || club.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const EmptyClubsState = () => (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 mb-8">
      <CardContent className="p-0">
        <div className="text-center py-12 px-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Club Memberships</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't joined any clubs yet. Explore the available clubs below and find communities that match your
            interests!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setActiveTab("discover")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Clubs
            </Button>
            <Button
              onClick={() => setActiveTab("discover")}
              variant="outline"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <StudentLayout>
      <div className="p-6 space-y-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Clubs & Organizations</h1>
                <p className="text-white/90 text-lg">Connect, learn, and grow through extracurricular activities</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{clubStats.totalClubs}</div>
                  <div className="text-sm text-white/80">Total Clubs</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{clubStats.myClubs}</div>
                  <div className="text-sm text-white/80">My Clubs</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{clubStats.upcomingEvents}</div>
                  <div className="text-sm text-white/80">Upcoming Events</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{clubStats.achievements}</div>
                  <div className="text-sm text-white/80">Achievements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="my-clubs" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              My Clubs
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Applications
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-clubs" className="space-y-6">
            {myClubs.length === 0 ? (
              <EmptyClubsState />
            ) : (
              <div>
                <h2 className="text-2xl font-semibold flex items-center mb-6">
                  <Heart className="w-6 h-6 mr-2 text-red-500" />
                  My Active Clubs ({myClubs.length})
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myClubs.map((club) => (
                    <Card
                      key={club.id}
                      className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 overflow-hidden"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-16 h-16 ${club.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                                {club.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {club.role}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {club.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {club.members}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{club.description}</p>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Engagement Level
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {club.engagement}%
                            </span>
                          </div>
                          <Progress value={club.engagement} className="h-2" />
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Next Meeting
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                              {club.meetingFrequency}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                            {club.nextMeeting}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{club.location}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold flex items-center text-amber-700 dark:text-amber-300">
                            <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                            Recent Achievements
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {club.achievements.map((achievement, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 hover:bg-amber-200 transition-colors"
                              >
                                <Award className="w-3 h-3 mr-1" />
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Link href={`/student/clubs/${generateSlug(club.name)}`}>
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Club
                            </Button>
                          </Link>
                          <Link href={`/student/clubs/${generateSlug(club.name)}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Members
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View and manage all your club applications in one place
              </p>
              <Link href="/student/clubs/applications">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <FileText className="w-4 h-4 mr-2" />
                  View My Applications
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clubs by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-1 outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingClubs ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                <p className="text-gray-600 dark:text-gray-400">Loading clubs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                <Card
                  key={club.id}
                  className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-900/30 overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 ${club.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                          {club.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {club.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {club.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{club.description}</p>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {club.members} members
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {club.timeCommitment}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {club.location} • {club.nextMeeting}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Advisor: {club.advisor}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                        Highlights
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {club.highlights.map((highlight, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Link href={`/student/clubs/${generateSlug(club.name)}/join`}>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Join Club
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {!loadingClubs && filteredClubs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clubs found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or category filter.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  )
}
