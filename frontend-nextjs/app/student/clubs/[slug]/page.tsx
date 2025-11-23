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
  Loader2,
  Sparkles,
  CheckCircle2,
  Gift,
  Star,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
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
import { useQuery } from "@tanstack/react-query"
import { getClubBySlug, getClubAnnouncements, getAllClubMemberships } from "@/lib/api/endpoints/clubs"
import { useEventsByClubId } from "@/hooks/useEvents"
import { useClubBenefits } from "@/hooks/useClubBenefits"
import { useClubFaqs } from "@/hooks/useClubFaqs"

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

interface ClubDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isFollowing, setIsFollowing] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null)

  const [memberSearchTerm, setMemberSearchTerm] = useState("")
  const [memberFilterGrade, setMemberFilterGrade] = useState("all")
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false)
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<any>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")

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

  // Fetch club data
  const { data: rawClub, isLoading: clubLoading, error: clubError } = useQuery({
    queryKey: ['club', resolvedParams.slug],
    queryFn: () => getClubBySlug(resolvedParams.slug),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch club events (moved before club normalization)
  const { data: eventsData, isLoading: loadingEvents, error: eventsError } = useEventsByClubId(rawClub?.id || '', {
    status: 'published',
    limit: 50
  })

  // Normalize club data with defaults for UI fields
  const club = useMemo(() => {
    if (!rawClub) return null
    
    // Transform events data to match the expected format
    const transformedEvents = eventsData?.data?.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.tags?.[0]?.tag?.name || 'Event',
      status: event.status,
      visibility: event.visibility,
      is_featured: event.is_featured,
      event_image: event.event_image,
      created_at: event.created_at,
      updated_at: event.updated_at,
      organizer: event.organizer,
      club: event.club
    })) || []
    
    return {
      ...rawClub,
      color: "bg-indigo-500",
      coverImage: "/placeholder.svg?height=300&width=800",
      slug: resolvedParams.slug,
      role: "Member",
      joined: new Date().toISOString(),
      engagement: 0,
      upcomingEvents: transformedEvents.length,
      category: rawClub.domain?.name || "General",
      advisor: rawClub.advisor?.full_name || "No advisor assigned",
      meetingFrequency: "Weekly",
      socialLinks: {},
      gallery: [],
      members: 0,
      nextMeeting: "TBA",
      location: "TBA",
      achievements: [],
      members_list: [],
      events: transformedEvents,
      resources: [],
    }
  }, [rawClub, resolvedParams.slug, eventsData])

  // Fetch club members
  const { data: membershipsData = [] } = useQuery({
    queryKey: ['club-memberships', club?.id],
    queryFn: () => getAllClubMemberships(club!.id),
    enabled: !!club?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch club announcements
  const { data: announcementsData = [] } = useQuery({
    queryKey: ['club-announcements', club?.id],
    queryFn: () => getClubAnnouncements(club!.id),
    enabled: !!club?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch club benefits
  const { data: benefitsData = [], isLoading: loadingBenefits } = useClubBenefits(club?.id || '')

  // Fetch club FAQs
  const { data: faqsData = [], isLoading: loadingFaqs } = useClubFaqs(club?.id || '')

  // Redirect if club not found
  useEffect(() => {
    if (clubError || (!clubLoading && !club)) {
      toast({
        title: "Club not found",
        description: "The club you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/student/clubs")
    }
  }, [club, clubLoading, clubError, router, toast])

  // Transform membership data to members
  const members = useMemo(() => {
    return membershipsData.map((m: any) => ({
      id: m.id,
      name: m.student ? `${m.student.first_name} ${m.student.last_name}` : 'Unknown',
      role: m.position?.name || 'Member',
      avatar: "/placeholder.svg?height=40&width=40",
      grade: m.student?.grade_level ? `Grade ${m.student.grade_level}` : 'N/A',
      joinDate: new Date(m.joined_at).toLocaleDateString(),
    }))
  }, [membershipsData])

  // Transform announcement data
  const announcements = useMemo(() => {
    return announcementsData.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      date: new Date(a.created_at).toLocaleDateString(),
      priority: a.priority,
      category: 'Update',
      isPinned: false,
      author: a.author?.full_name || 'Unknown',
      status: 'published',
    }))
  }, [announcementsData])

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
      const matchesGrade = memberFilterGrade === "all" || member.grade.includes(memberFilterGrade)
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

  // Show loading state
  if (clubLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading club details...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Show error state
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
        <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
          <div
            className={`absolute inset-0 ${club.club_image ? '' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`}
            style={club.club_image ? {
              backgroundImage: `url(${club.club_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            } : {}}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 p-3 sm:p-4 lg:p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/clubs")}
                className="text-white hover:bg-white/20 backdrop-blur-sm h-9 px-2 sm:px-4 text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Clubs</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-9 p-0">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:bg-white/20 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Bell className={`w-3 h-3 sm:w-4 sm:h-4 ${showNotifications ? "text-yellow-300" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-end gap-3 sm:gap-4 lg:gap-6">
                {club.club_logo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/20 backdrop-blur-sm bg-white flex-shrink-0">
                    <img
                      src={club.club_logo}
                      alt={`${club.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${club.color} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl border-2 sm:border-4 border-white/20 backdrop-blur-sm flex-shrink-0`}
                  >
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                )}

                <div className="text-white flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-2 truncate">{club.name}</h1>
                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs h-5 sm:h-auto px-1.5 sm:px-2.5">
                      {club.category}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-[10px] sm:text-xs h-5 sm:h-auto px-1.5 sm:px-2.5">
                      {club.role}
                    </Badge>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-white/90">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs lg:text-sm">{members.length} members</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs lg:text-sm">{club.meetingFrequency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`${
                    isFollowing ? "bg-white/20 text-white border-white/30" : "bg-white text-gray-900 hover:bg-gray-100"
                  } backdrop-blur-sm transition-all duration-300 h-9 px-3 text-xs sm:text-sm flex-1 sm:flex-initial`}
                  variant={isFollowing ? "outline" : "default"}
                >
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 ${isFollowing ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{isFollowing ? "Following" : "Follow"}</span>
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-9 px-3 text-xs sm:text-sm flex-1 sm:flex-initial">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Join Chat</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLeaveDialogOpen(true)}
                  className="bg-white/10 text-white border-white/30 hover:bg-red-500/20 hover:border-red-400 backdrop-blur-sm transition-all duration-300 h-9 px-3 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden lg:inline">Leave Club</span>
                  <span className="lg:hidden">Leave</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 -mt-4 sm:-mt-6 relative z-20">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 lg:px-6 overflow-x-auto">
                  <TabsList className="inline-flex w-full lg:grid lg:grid-cols-5 bg-transparent h-auto p-0 min-w-max lg:min-w-0">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-3 px-3 sm:px-4 text-xs sm:text-sm lg:py-4"
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="members"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-3 px-3 sm:px-4 text-xs sm:text-sm lg:py-4"
                    >
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Members</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="events"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-3 px-3 sm:px-4 text-xs sm:text-sm lg:py-4"
                    >
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Events</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="members-management"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-3 px-3 sm:px-4 text-xs sm:text-sm lg:py-4 whitespace-nowrap"
                    >
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Manage Members</span>
                      <span className="sm:hidden">Manage</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="announcements-management"
                      className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none py-3 px-3 sm:px-4 text-xs sm:text-sm lg:py-4 whitespace-nowrap"
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Manage Announcements</span>
                      <span className="sm:hidden">Announce</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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

                      {/* Benefits Section */}
                      {loadingBenefits ? (
                        <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                          <CardContent className="p-12 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                              <span className="text-gray-600 dark:text-gray-400">Loading benefits...</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : benefitsData && benefitsData.length > 0 ? (
                        <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 overflow-hidden group">
                          <CardHeader className="relative">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <CardTitle className="flex items-center text-violet-700 dark:text-violet-300 relative z-10">
                              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                              {club.benefits_title || 'Membership Benefits'}
                            </CardTitle>
                            {club.benefits_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 relative z-10">
                                {club.benefits_description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {benefitsData.map((benefit, index) => {
                                const icons = [Gift, Star, CheckCircle2, Trophy, Sparkles, Heart]
                                const Icon = icons[index % icons.length]
                                const gradients = [
                                  'from-pink-400 to-rose-500',
                                  'from-amber-400 to-orange-500',
                                  'from-emerald-400 to-green-500',
                                  'from-blue-400 to-indigo-500',
                                  'from-purple-400 to-violet-500',
                                  'from-cyan-400 to-teal-500',
                                ]
                                const gradient = gradients[index % gradients.length]

                                return (
                                  <div
                                    key={benefit.id}
                                    className="group/item relative p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                      <div className="flex items-start gap-3 mb-2">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shrink-0 group-hover/item:rotate-12 transition-transform duration-300`}>
                                          <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover/item:text-violet-600 dark:group-hover/item:text-violet-400 transition-colors line-clamp-1">
                                            {benefit.title}
                                          </h4>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 pl-13">
                                        {benefit.description}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}

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

                      {/* FAQs Section */}
                      {loadingFaqs ? (
                        <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                          <CardContent className="p-12 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                              <span className="text-gray-600 dark:text-gray-400">Loading FAQs...</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : faqsData && faqsData.length > 0 ? (
                        <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 overflow-hidden">
                          <CardHeader>
                            <CardTitle className="flex items-center text-cyan-700 dark:text-cyan-300">
                              <HelpCircle className="w-5 h-5 mr-2" />
                              Frequently Asked Questions
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Got questions? We've got answers! Click on any question to expand.
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {faqsData.map((faq, index) => {
                              const isExpanded = expandedFaqId === faq.id
                              return (
                                <div
                                  key={faq.id}
                                  className="group/faq bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300"
                                >
                                  <button
                                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors"
                                  >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover/faq:scale-110 transition-transform duration-300">
                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover/faq:text-cyan-600 dark:group-hover/faq:text-cyan-400 transition-colors">
                                          {faq.question}
                                        </h4>
                                      </div>
                                    </div>
                                    <div className="shrink-0 mt-1">
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover/faq:scale-110 transition-transform" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover/faq:text-cyan-600 dark:group-hover/faq:text-cyan-400 group-hover/faq:scale-110 transition-all" />
                                      )}
                                    </div>
                                  </button>
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="px-4 pb-4 pl-15">
                                      <div className="p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border-l-4 border-cyan-500">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {faq.answer}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </CardContent>
                        </Card>
                      ) : null}
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

                <TabsContent value="members" className="p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

                <TabsContent value="events" className="p-3 sm:p-4 lg:p-6">
                  {loadingEvents ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading events...</span>
                      </div>
                    </div>
                  ) : eventsError ? (
                    <div className="text-center py-12">
                      <Alert className="max-w-md mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Failed to load events. Please try refreshing the page.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : club.events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">No Events Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        This club hasn't scheduled any events yet. Check back later for updates!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {club.events.map((event) => (
                        <Card
                          key={event.id}
                          className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-300"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-start justify-between">
                                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{event.title}</h3>
                                  {event.is_featured && (
                                    <Badge variant="default" className="bg-yellow-500 text-white">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
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
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{event.type}</Badge>
                                  <Badge 
                                    variant={event.status === 'published' ? 'default' : 'outline'}
                                    className={event.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                                  >
                                    {event.status}
                                  </Badge>
                                </div>
                                {event.organizer && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Organized by: {event.organizer.full_name}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </Button>
                                {event.event_image && (
                                  <div className="w-24 h-16 rounded-lg overflow-hidden">
                                    <img 
                                      src={event.event_image} 
                                      alt={event.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members-management" className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

                <TabsContent value="announcements-management" className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
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
