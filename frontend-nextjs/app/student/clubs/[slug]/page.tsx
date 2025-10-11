"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import StudentLayout from "@/components/student/student-layout"
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Heart,
  MessageCircle,
  BookOpen,
  Award,
  Bell,
  Share2,
  ChevronLeft,
  Facebook,
  Instagram,
  Mail,
  Globe,
  Target,
  TrendingUp,
  LogOut,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Pin,
  PinOff,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const clubsData = {
  "math-club": {
    id: 1,
    name: "Math Club",
    slug: "math-club",
    role: "Member",
    members: 42,
    nextMeeting: "Tomorrow 3:00 PM",
    location: "Room 301",
    description:
      "Competitive mathematics and problem solving for students passionate about numbers and logical thinking",
    achievements: ["Municipal Champions 2024", "Regional Qualifiers", "Problem Solving Excellence"],
    color: "bg-blue-500",
    joined: "2024-01-15",
    engagement: 85,
    upcomingEvents: 3,
    category: "Academic",
    advisor: "Ms. Rodriguez",
    meetingFrequency: "Weekly",
    socialLinks: { facebook: "#", instagram: "#", email: "mathclub@school.edu" },
    coverImage: "/placeholder.svg?height=300&width=800&text=Math+Club+Cover",
    gallery: [
      "/placeholder.svg?height=200&width=300&text=Competition+Day",
      "/placeholder.svg?height=200&width=300&text=Problem+Solving",
      "/placeholder.svg?height=200&width=300&text=Team+Meeting",
    ],
    announcements: [
      {
        id: 1,
        title: "Regional Math Competition Registration Open",
        content: "Sign up for the upcoming regional competition by Friday!",
        date: "2024-01-20",
        priority: "high",
        category: "Event",
        isPinned: true,
        author: "Ms. Rodriguez",
        status: "published",
      },
      {
        id: 2,
        title: "Weekly Problem Set Available",
        content: "New challenging problems are now available for practice.",
        date: "2024-01-18",
        priority: "medium",
        category: "Update",
        isPinned: false,
        author: "Alex Johnson",
        status: "published",
      },
    ],
    members_list: [
      {
        id: 1,
        name: "Alex Johnson",
        role: "President",
        avatar: "/placeholder.svg?height=40&width=40&text=AJ",
        grade: "Grade 8-A",
        joinDate: "2024-01-10",
      },
      {
        id: 2,
        name: "Sarah Chen",
        role: "Vice President",
        avatar: "/placeholder.svg?height=40&width=40&text=SC",
        grade: "Grade 8-B",
        joinDate: "2024-01-12",
      },
      {
        id: 3,
        name: "Mike Rodriguez",
        role: "Secretary",
        avatar: "/placeholder.svg?height=40&width=40&text=MR",
        grade: "Grade 8-A",
        joinDate: "2024-01-15",
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
      },
      {
        id: 2,
        title: "Regional Competition",
        date: "2024-02-15",
        time: "9:00 AM - 4:00 PM",
        location: "City Convention Center",
        type: "Competition",
      },
    ],
    resources: [
      { name: "Problem Set #1", type: "PDF", size: "2.3 MB" },
      { name: "Competition Guidelines", type: "PDF", size: "1.8 MB" },
      { name: "Practice Solutions", type: "PDF", size: "3.1 MB" },
    ],
  },
  "science-club": {
    id: 2,
    name: "Science Club",
    slug: "science-club",
    role: "Vice President",
    members: 38,
    nextMeeting: "Friday 2:30 PM",
    location: "Science Lab",
    description: "Hands-on experiments and science fair preparation for curious minds exploring the wonders of science",
    achievements: ["Science Fair Winners", "Innovation Award", "Best Research Project"],
    color: "bg-green-500",
    joined: "2024-01-10",
    engagement: 92,
    upcomingEvents: 2,
    category: "Academic",
    advisor: "Mr. Santos",
    meetingFrequency: "Bi-weekly",
    socialLinks: { facebook: "#", instagram: "#", email: "scienceclub@school.edu" },
    coverImage: "/placeholder.svg?height=300&width=800&text=Science+Club+Cover",
    gallery: [
      "/placeholder.svg?height=200&width=300&text=Lab+Experiment",
      "/placeholder.svg?height=200&width=300&text=Science+Fair",
      "/placeholder.svg?height=200&width=300&text=Field+Trip",
    ],
    announcements: [
      {
        id: 1,
        title: "Science Fair Project Submissions Due",
        content: "Submit your project proposals by next Wednesday.",
        date: "2024-01-22",
        priority: "high",
        category: "Reminder",
        isPinned: true,
        author: "Mr. Santos",
        status: "published",
      },
    ],
    members_list: [
      {
        id: 1,
        name: "Emma Wilson",
        role: "President",
        avatar: "/placeholder.svg?height=40&width=40&text=EW",
        grade: "Grade 8-C",
        joinDate: "2024-01-08",
      },
      {
        id: 2,
        name: "David Kim",
        role: "Lab Coordinator",
        avatar: "/placeholder.svg?height=40&width=40&text=DK",
        grade: "Grade 8-B",
        joinDate: "2024-01-10",
      },
    ],
    events: [
      {
        id: 1,
        title: "Chemistry Lab Session",
        date: "2024-01-26",
        time: "2:30 PM - 4:30 PM",
        location: "Chemistry Lab",
        type: "Lab Work",
      },
    ],
    resources: [
      { name: "Lab Safety Guidelines", type: "PDF", size: "1.5 MB" },
      { name: "Experiment Procedures", type: "PDF", size: "2.8 MB" },
    ],
  },
}

const availableStudents = [
  { id: 101, name: "John Smith", grade: "Grade 8-A", avatar: "/placeholder.svg?height=40&width=40&text=JS" },
  { id: 102, name: "Maria Garcia", grade: "Grade 8-B", avatar: "/placeholder.svg?height=40&width=40&text=MG" },
  { id: 103, name: "James Lee", grade: "Grade 8-C", avatar: "/placeholder.svg?height=40&width=40&text=JL" },
  { id: 104, name: "Sofia Martinez", grade: "Grade 8-A", avatar: "/placeholder.svg?height=40&width=40&text=SM" },
  { id: 105, name: "Lucas Brown", grade: "Grade 8-B", avatar: "/placeholder.svg?height=40&width=40&text=LB" },
]

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isFollowing, setIsFollowing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const [members, setMembers] = useState<any[]>([])
  const [memberSearchTerm, setMemberSearchTerm] = useState("")
  const [memberFilterGrade, setMemberFilterGrade] = useState("all")
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false)
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<any>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)
  const [deleteAnnouncementDialogOpen, setDeleteAnnouncementDialogOpen] = useState(false)
  const [selectedAnnouncementToDelete, setSelectedAnnouncementToDelete] = useState<any>(null)
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: "",
    content: "",
    category: "Update",
    priority: "medium",
    status: "published",
    isPinned: false,
  })
  const [announcementSearchTerm, setAnnouncementSearchTerm] = useState("")

  const club = clubsData[params.slug as keyof typeof clubsData]

  useEffect(() => {
    if (!club) {
      router.push("/student/clubs")
    } else {
      setMembers(club.members_list || [])
      setAnnouncements(club.announcements || [])
    }
  }, [club, router])

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
      const matchesGrade = memberFilterGrade === "all" || member.grade === memberFilterGrade
      return matchesSearch && matchesGrade
    })
  }, [members, memberSearchTerm, memberFilterGrade])

  const filteredStudents = useMemo(() => {
    const memberIds = members.map((m) => m.id)
    return availableStudents.filter(
      (student) =>
        !memberIds.includes(student.id) && student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()),
    )
  }, [members, studentSearchTerm])

  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(announcementSearchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(announcementSearchTerm.toLowerCase()),
    )
    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [announcements, announcementSearchTerm])

  const handleAddMember = (student: any) => {
    const newMember = {
      ...student,
      role: "Member",
      joinDate: new Date().toISOString().split("T")[0],
    }
    setMembers([...members, newMember])
    toast({
      title: "Member Added",
      description: `${student.name} has been added to the club.`,
    })
    setAddMemberDialogOpen(false)
    setStudentSearchTerm("")
  }

  const handleRemoveMember = () => {
    if (selectedMemberToRemove) {
      setMembers(members.filter((m) => m.id !== selectedMemberToRemove.id))
      toast({
        title: "Member Removed",
        description: `${selectedMemberToRemove.name} has been removed from the club.`,
        variant: "destructive",
      })
      setRemoveMemberDialogOpen(false)
      setSelectedMemberToRemove(null)
    }
  }

  const handleOpenAnnouncementDialog = (announcement?: any) => {
    if (announcement) {
      setEditingAnnouncement(announcement)
      setAnnouncementFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        status: announcement.status,
        isPinned: announcement.isPinned,
      })
    } else {
      setEditingAnnouncement(null)
      setAnnouncementFormData({
        title: "",
        content: "",
        category: "Update",
        priority: "medium",
        status: "published",
        isPinned: false,
      })
    }
    setAnnouncementDialogOpen(true)
  }

  const handleSaveAnnouncement = () => {
    if (!announcementFormData.title || !announcementFormData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (editingAnnouncement) {
      // Edit existing announcement
      setAnnouncements(
        announcements.map((a) =>
          a.id === editingAnnouncement.id
            ? {
                ...a,
                ...announcementFormData,
                date: new Date().toISOString().split("T")[0],
              }
            : a,
        ),
      )
      toast({
        title: "Announcement Updated",
        description: "The announcement has been successfully updated.",
      })
    } else {
      // Add new announcement
      const newAnnouncement = {
        id: announcements.length + 1,
        ...announcementFormData,
        date: new Date().toISOString().split("T")[0],
        author: "You",
      }
      setAnnouncements([newAnnouncement, ...announcements])
      toast({
        title: "Announcement Created",
        description: "The announcement has been successfully created.",
      })
    }

    setAnnouncementDialogOpen(false)
    setEditingAnnouncement(null)
  }

  const handleDeleteAnnouncement = () => {
    if (selectedAnnouncementToDelete) {
      setAnnouncements(announcements.filter((a) => a.id !== selectedAnnouncementToDelete.id))
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been successfully deleted.",
        variant: "destructive",
      })
      setDeleteAnnouncementDialogOpen(false)
      setSelectedAnnouncementToDelete(null)
    }
  }

  const handleTogglePin = (announcement: any) => {
    setAnnouncements(announcements.map((a) => (a.id === announcement.id ? { ...a, isPinned: !a.isPinned } : a)))
    toast({
      title: announcement.isPinned ? "Announcement Unpinned" : "Announcement Pinned",
      description: announcement.isPinned
        ? "The announcement has been unpinned."
        : "The announcement has been pinned to the top.",
    })
  }

  const handleLeaveClub = () => {
    console.log("[v0] Leaving club:", club.name)
    // TODO: Connect to backend API
    setLeaveDialogOpen(false)
    router.push("/student/clubs")
  }

  if (!club) {
    return (
      <StudentLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Club Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The club you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/student/clubs")} className="mt-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="relative h-80 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            style={{
              backgroundImage: `url(${club.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/clubs")}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Clubs
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Bell className={`w-4 h-4 ${showNotifications ? "text-yellow-300" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-end gap-6">
                <div
                  className={`w-24 h-24 ${club.color} rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20 backdrop-blur-sm`}
                >
                  <Users className="w-12 h-12 text-white" />
                </div>

                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {club.category}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {club.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{members.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{club.meetingFrequency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`${
                    isFollowing ? "bg-white/20 text-white border-white/30" : "bg-white text-gray-900 hover:bg-gray-100"
                  } backdrop-blur-sm transition-all duration-300`}
                  variant={isFollowing ? "outline" : "default"}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLeaveDialogOpen(true)}
                  className="bg-white/10 text-white border-white/30 hover:bg-red-500/20 hover:border-red-400 backdrop-blur-sm transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Club
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 -mt-6 relative z-20">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                  <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
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
                      value="members-management"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Manage Members
                    </TabsTrigger>
                    <TabsTrigger
                      value="announcements-management"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-4"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Manage Announcements
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardHeader>
                          <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                            <Target className="w-5 h-5 mr-2" />
                            About {club.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{club.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>Advisor: {club.advisor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Meets {club.meetingFrequency}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                        <CardHeader>
                          <CardTitle className="flex items-center text-emerald-700 dark:text-emerald-300">
                            <Trophy className="w-5 h-5 mr-2" />
                            Achievements & Recognition
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {club.achievements.map((achievement, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <Award className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <CardHeader>
                          <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                            <Bell className="w-5 h-5 mr-2" />
                            Recent Announcements
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {filteredAnnouncements.slice(0, 3).map((announcement) => (
                            <div
                              key={announcement.id}
                              className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                    {announcement.title}
                                  </h4>
                                  {announcement.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                                </div>
                                <Badge
                                  variant={announcement.priority === "high" ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {announcement.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{announcement.content}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{announcement.date}</span>
                                <Badge variant="outline" className="text-xs">
                                  {announcement.category}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-700 dark:text-gray-300">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Club Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Level</span>
                              <span className="font-bold text-indigo-600">{club.engagement}%</span>
                            </div>
                            <Progress value={club.engagement} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                              <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                              <div className="text-xs text-gray-500">Members</div>
                            </div>
                            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                              <div className="text-2xl font-bold text-green-600">{club.upcomingEvents}</div>
                              <div className="text-xs text-gray-500">Events</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardHeader>
                          <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                            <Globe className="w-5 h-5 mr-2" />
                            Connect With Us
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" className="justify-start bg-transparent">
                              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                              Facebook Page
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start bg-transparent">
                              <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                              Instagram
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start bg-transparent">
                              <Mail className="w-4 h-4 mr-2 text-gray-600" />
                              Email Club
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member, index) => (
                      <Card
                        key={index}
                        className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
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
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="events" className="p-6">
                  <div className="space-y-4">
                    {club.events.map((event) => (
                      <Card
                        key={event.id}
                        className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{event.title}</h3>
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
                              </div>
                              <Badge variant="secondary">{event.type}</Badge>
                            </div>
                            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="members-management" className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Members Management</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Add or remove members from {club.name}</p>
                    </div>
                    <Button
                      onClick={() => setAddMemberDialogOpen(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>

                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          Total Members: {members.length}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search members by name..."
                            value={memberSearchTerm}
                            onChange={(e) => setMemberSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <Select value={memberFilterGrade} onValueChange={setMemberFilterGrade}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Grades</SelectItem>
                              <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
                              <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                              <SelectItem value="Grade 8-C">Grade 8-C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.map((member) => (
                          <Card
                            key={member.id}
                            className="border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
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
                                    <p className="text-xs text-gray-500">{member.grade}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Role:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {member.role}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Joined:</span>
                                  <span className="text-gray-700 dark:text-gray-300">{member.joinDate}</span>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full mt-4"
                                onClick={() => {
                                  setSelectedMemberToRemove(member)
                                  setRemoveMemberDialogOpen(true)
                                }}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Member
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredMembers.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No members found</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="announcements-management" className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements Management</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Create, edit, and manage club announcements
                      </p>
                    </div>
                    <Button
                      onClick={() => handleOpenAnnouncementDialog()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Announcement
                    </Button>
                  </div>

                  <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          Total Announcements: {announcements.length}
                        </Badge>
                      </div>

                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search announcements..."
                          value={announcementSearchTerm}
                          onChange={(e) => setAnnouncementSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-4">
                        {filteredAnnouncements.map((announcement) => (
                          <Card
                            key={announcement.id}
                            className={`border-0 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 ${
                              announcement.isPinned ? "ring-2 ring-amber-400" : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {announcement.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                      {announcement.title}
                                    </h3>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 mb-3">{announcement.content}</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant={announcement.priority === "high" ? "destructive" : "secondary"}
                                      className="text-xs"
                                    >
                                      {announcement.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {announcement.category}
                                    </Badge>
                                    <Badge
                                      variant={announcement.status === "published" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {announcement.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {announcement.date} • by {announcement.author}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Button variant="outline" size="sm" onClick={() => handleTogglePin(announcement)}>
                                  {announcement.isPinned ? (
                                    <>
                                      <PinOff className="w-4 h-4 mr-2" />
                                      Unpin
                                    </>
                                  ) : (
                                    <>
                                      <Pin className="w-4 h-4 mr-2" />
                                      Pin
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenAnnouncementDialog(announcement)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAnnouncementToDelete(announcement)
                                    setDeleteAnnouncementDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredAnnouncements.length === 0 && (
                        <div className="text-center py-12">
                          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No announcements found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Create your first announcement to get started.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Search and select a student to add to {club.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students by name..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => handleAddMember(student)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</h4>
                            <p className="text-xs text-gray-500">{student.grade}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No students found</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{selectedMemberToRemove?.name}</strong> from {club.name}? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Yes, Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
              <DialogDescription>
                {editingAnnouncement
                  ? "Update the announcement details below"
                  : "Fill in the details to create a new announcement"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={announcementFormData.content}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={announcementFormData.category}
                    onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                      <SelectItem value="Reminder">Reminder</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={announcementFormData.priority}
                    onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={announcementFormData.status}
                    onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={announcementFormData.isPinned}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPinned" className="cursor-pointer">
                    Pin this announcement
                  </Label>
                </div>
              </div>
              {editingAnnouncement && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Editing this announcement will update the date to today and mark you as the last editor.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAnnouncement}>
                {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteAnnouncementDialogOpen} onOpenChange={setDeleteAnnouncementDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the announcement "<strong>{selectedAnnouncementToDelete?.title}</strong>
                "? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAnnouncement}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Yes, Delete Announcement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave {club?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this club? You will lose access to club activities, events, and
                resources. You can rejoin by submitting a new application.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveClub} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                Yes, Leave Club
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentLayout>
  )
}
