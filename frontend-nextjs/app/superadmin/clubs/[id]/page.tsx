"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Mail,
  Facebook,
  Instagram,
  Globe,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Download,
  Award,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Bell,
  Share2,
  Archive,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Mock data - replace with actual API calls
const clubData = {
  id: "math-club-001",
  name: "Mathematics Club",
  slug: "math-club",
  description: "Competitive mathematics and problem solving for students passionate about numbers and logical thinking",
  category: "Academic",
  status: "active",
  logo: "/placeholder.svg?height=100&width=100&text=Math",
  coverImage: "/placeholder.svg?height=300&width=800&text=Math+Club+Cover",

  // Leadership
  president: "Alex Johnson",
  vicePresident: "Sarah Chen",
  adviser: "Ms. Rodriguez",
  department: "Mathematics Department",

  // Contact
  email: "mathclub@school.edu",
  facebook: "@mathclub",
  instagram: "@mathclub_nhs",

  // Stats
  membersCount: 42,
  activeMembers: 38,
  totalEvents: 24,
  upcomingEvents: 3,
  engagement: 85,

  // Dates
  establishedDate: "2023-09-01",
  lastActivity: "2024-01-20",

  // Additional
  requirements: "Must maintain at least 85% grade in Mathematics",
  isRecruiting: true,

  achievements: [
    {
      id: 1,
      title: "Municipal Champions 2024",
      date: "2024-01-15",
      description: "First place in municipal math competition",
    },
    { id: 2, title: "Regional Qualifiers", date: "2023-12-10", description: "Qualified for regional championship" },
    { id: 3, title: "Problem Solving Excellence", date: "2023-11-20", description: "Outstanding performance award" },
  ],

  members: [
    {
      id: 1,
      name: "Alex Johnson",
      role: "President",
      grade: "Grade 12",
      status: "active",
      joinDate: "2023-09-01",
      avatar: "/placeholder.svg?height=40&width=40&text=AJ",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Vice President",
      grade: "Grade 11",
      status: "active",
      joinDate: "2023-09-01",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      role: "Secretary",
      grade: "Grade 11",
      status: "active",
      joinDate: "2023-09-05",
      avatar: "/placeholder.svg?height=40&width=40&text=MR",
    },
    {
      id: 4,
      name: "Emma Wilson",
      role: "Member",
      grade: "Grade 10",
      status: "active",
      joinDate: "2023-09-10",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
    },
    {
      id: 5,
      name: "David Kim",
      role: "Member",
      grade: "Grade 10",
      status: "active",
      joinDate: "2023-09-15",
      avatar: "/placeholder.svg?height=40&width=40&text=DK",
    },
  ],

  events: [
    {
      id: 1,
      title: "Math Olympiad Preparation",
      date: "2024-01-25",
      time: "3:00 PM - 5:00 PM",
      location: "Room 301",
      type: "Workshop",
      status: "upcoming",
      attendees: 28,
    },
    {
      id: 2,
      title: "Regional Competition",
      date: "2024-02-15",
      time: "9:00 AM - 4:00 PM",
      location: "City Convention Center",
      type: "Competition",
      status: "upcoming",
      attendees: 35,
    },
    {
      id: 3,
      title: "Problem Solving Session",
      date: "2024-01-18",
      time: "3:30 PM - 5:00 PM",
      location: "Room 301",
      type: "Meeting",
      status: "completed",
      attendees: 32,
    },
  ],

  announcements: [
    {
      id: 1,
      title: "Regional Math Competition Registration Open",
      content: "Sign up for the upcoming regional competition by Friday!",
      date: "2024-01-20",
      priority: "high",
      author: "Ms. Rodriguez",
    },
    {
      id: 2,
      title: "Weekly Problem Set Available",
      content: "New challenging problems are now available for practice.",
      date: "2024-01-18",
      priority: "medium",
      author: "Alex Johnson",
    },
  ],

  resources: [
    { id: 1, name: "Problem Set #1", type: "PDF", size: "2.3 MB", uploadDate: "2024-01-15", downloads: 38 },
    { id: 2, name: "Competition Guidelines", type: "PDF", size: "1.8 MB", uploadDate: "2024-01-10", downloads: 42 },
    { id: 3, name: "Practice Solutions", type: "PDF", size: "3.1 MB", uploadDate: "2024-01-12", downloads: 35 },
  ],

  gallery: [
    {
      id: 1,
      url: "/placeholder.svg?height=200&width=300&text=Competition+Day",
      caption: "Competition Day 2024",
      date: "2024-01-15",
    },
    {
      id: 2,
      url: "/placeholder.svg?height=200&width=300&text=Problem+Solving",
      caption: "Problem Solving Session",
      date: "2024-01-10",
    },
    {
      id: 3,
      url: "/placeholder.svg?height=200&width=300&text=Team+Meeting",
      caption: "Team Meeting",
      date: "2024-01-05",
    },
  ],
}

// Analytics data
const memberGrowthData = [
  { month: "Sep", members: 25 },
  { month: "Oct", members: 30 },
  { month: "Nov", members: 35 },
  { month: "Dec", members: 38 },
  { month: "Jan", members: 42 },
]

const attendanceData = [
  { month: "Sep", attendance: 88 },
  { month: "Oct", attendance: 85 },
  { month: "Nov", attendance: 90 },
  { month: "Dec", attendance: 87 },
  { month: "Jan", attendance: 85 },
]

const eventTypeData = [
  { type: "Meetings", count: 12 },
  { type: "Workshops", count: 6 },
  { type: "Competitions", count: 4 },
  { type: "Social", count: 2 },
]

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchMember, setSearchMember] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleBack = () => {
    router.push("/superadmin/clubs")
  }

  const handleEdit = () => {
    router.push(`/superadmin/clubs/edit/${params.id}`)
  }

  const handleDelete = () => {
    toast({
      title: "Club Deleted",
      description: "The club has been successfully deleted.",
      duration: 3000,
    })
    router.push("/superadmin/clubs")
  }

  const handleArchive = () => {
    toast({
      title: "Club Archived",
      description: "The club has been archived successfully.",
      duration: 3000,
    })
  }

  const handleAddMember = () => {
    toast({
      title: "Member Added",
      description: "New member has been added to the club.",
      duration: 3000,
    })
  }

  const handleRemoveMember = (memberId: number) => {
    toast({
      title: "Member Removed",
      description: "Member has been removed from the club.",
      duration: 3000,
    })
  }

  const handleStatusChange = (newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Club status changed to ${newStatus}.`,
      duration: 3000,
    })
  }

  const filteredMembers = clubData.members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchMember.toLowerCase())
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "recruiting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header with Cover Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${clubData.coverImage})` }}>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack} className="text-white hover:bg-white/20 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm">
                <Bell className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Club
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Club
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Club
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20">
              <img src={clubData.logo || "/placeholder.svg"} alt={clubData.name} className="w-20 h-20 rounded-2xl" />
            </div>

            <div className="text-white flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{clubData.name}</h1>
                <Badge className={getStatusColor(clubData.status)}>{clubData.status}</Badge>
                {clubData.isRecruiting && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Recruiting
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {clubData.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{clubData.membersCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{clubData.totalEvents} events</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">{clubData.engagement}% engagement</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select defaultValue={clubData.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleEdit} className="bg-white text-gray-900 hover:bg-gray-100">
                <Edit className="w-4 h-4 mr-2" />
                Edit Club
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 -mt-6 relative z-20">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                              <p className="text-2xl font-bold text-blue-600">{clubData.membersCount}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                              <p className="text-2xl font-bold text-green-600">{clubData.activeMembers}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                              <p className="text-2xl font-bold text-purple-600">{clubData.totalEvents}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                              <p className="text-2xl font-bold text-amber-600">{clubData.engagement}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Club Description */}
                    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-800 dark:text-gray-200">
                          <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                          About This Club
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{clubData.description}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{clubData.department}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Established</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {new Date(clubData.establishedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {new Date(clubData.lastActivity).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Announcements */}
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                            <Bell className="w-5 h-5 mr-2" />
                            Recent Announcements
                          </CardTitle>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            New
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {clubData.announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{announcement.title}</h4>
                              <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{announcement.content}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>By {announcement.author}</span>
                              <span>{announcement.date}</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
                          <Trophy className="w-5 h-5 mr-2" />
                          Achievements & Recognition
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {clubData.achievements.map((achievement) => (
                            <div
                              key={achievement.id}
                              className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{achievement.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                                <span className="text-xs text-gray-500">{achievement.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Sidebar Info */}
                  <div className="space-y-6">
                    {/* Leadership */}
                    <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
                          <Users className="w-5 h-5 mr-2" />
                          Leadership Team
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">President</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{clubData.president}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vice President</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{clubData.vicePresident}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Faculty Adviser</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{clubData.adviser}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                          <Mail className="w-5 h-5 mr-2" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Mail className="w-4 h-4 mr-2 text-gray-600" />
                          {clubData.email}
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                          {clubData.facebook}
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                          {clubData.instagram}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Membership Requirements */}
                    <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-300">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{clubData.requirements}</p>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <CardHeader>
                        <CardTitle className="text-gray-700 dark:text-gray-300">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Announcement
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Report
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search members..."
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>Add a student to this club</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Student Name</Label>
                          <Input placeholder="Search student..." />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="officer">Officer</SelectItem>
                              <SelectItem value="secretary">Secretary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddMember} className="w-full">
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredMembers.map((member) => (
                    <Card
                      key={member.id}
                      className="border-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {member.grade}
                                </Badge>
                                <Badge
                                  className={
                                    member.status === "active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {member.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {new Date(member.joinDate).toLocaleDateString()}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600"
                                >
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Club Events</h3>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>

                <div className="space-y-4">
                  {clubData.events.map((event) => (
                    <Card
                      key={event.id}
                      className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{event.title}</h3>
                              <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                                {event.status}
                              </Badge>
                              <Badge variant="outline">{event.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Member Growth Chart */}
                  <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-800 dark:text-gray-200">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                        Member Growth
                      </CardTitle>
                      <CardDescription>Monthly member count over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={memberGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Event Types Distribution */}
                  <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-800 dark:text-gray-200">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                        Event Types
                      </CardTitle>
                      <CardDescription>Distribution of event categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={eventTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#a855f7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-800 dark:text-gray-200">
                        <Activity className="w-5 h-5 mr-2 text-amber-500" />
                        Engagement Metrics
                      </CardTitle>
                      <CardDescription>Overall club engagement statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Engagement</span>
                          <span className="font-bold text-indigo-600">{clubData.engagement}%</span>
                        </div>
                        <Progress value={clubData.engagement} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Active Member Rate</span>
                          <span className="font-bold text-green-600">
                            {Math.round((clubData.activeMembers / clubData.membersCount) * 100)}%
                          </span>
                        </div>
                        <Progress value={(clubData.activeMembers / clubData.membersCount) * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600">{clubData.totalEvents}</div>
                          <div className="text-xs text-gray-500">Total Events</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">{clubData.upcomingEvents}</div>
                          <div className="text-xs text-gray-500">Upcoming</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-6 space-y-6">
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <CardHeader>
                    <CardTitle>Club Settings</CardTitle>
                    <CardDescription>Manage club information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Club Name</Label>
                        <Input defaultValue={clubData.name} />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea defaultValue={clubData.description} rows={4} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select defaultValue={clubData.category.toLowerCase()}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select defaultValue={clubData.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="recruiting">Recruiting</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Membership Requirements</Label>
                        <Textarea defaultValue={clubData.requirements} rows={3} />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Currently Recruiting</p>
                          <p className="text-sm text-gray-500">Allow new members to join</p>
                        </div>
                        <Button variant={clubData.isRecruiting ? "default" : "outline"}>
                          {clubData.isRecruiting ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-0 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                  <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for this club</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Archive Club</p>
                        <p className="text-sm text-gray-500">Hide this club from active listings</p>
                      </div>
                      <Button variant="outline" onClick={handleArchive}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Delete Club</p>
                        <p className="text-sm text-gray-500">Permanently delete this club and all its data</p>
                      </div>
                      <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
