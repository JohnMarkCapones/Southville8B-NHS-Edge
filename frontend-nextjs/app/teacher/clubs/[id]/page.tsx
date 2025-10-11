"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Calendar,
  Trophy,
  Settings,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  UserPlus,
  Star,
  MapPin,
  Eye,
  Monitor,
  Smartphone,
  Save,
  RefreshCw,
  ArrowLeft,
  Activity,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  BookOpen,
  Megaphone,
  XCircle,
  FileText,
  MessageCircle,
  MoveUp,
  MoveDown,
  Edit2,
  X,
} from "lucide-react"
import Link from "next/link"
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
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

const clubData = {
  id: "math-club",
  name: "Mathematics Club",
  description:
    "Exploring the beauty and applications of mathematics through competitions, problem-solving, and collaborative learning.",
  memberCount: 24,
  email: "mathclub@southville8b.edu.ph",
  championshipWins: 3,
  mission: {
    title: "Fostering Mathematical Excellence",
    description:
      "To inspire students to appreciate mathematics and develop problem-solving skills through engaging activities and competitions.",
    benefits: [
      "Enhanced problem-solving abilities",
      "Preparation for math competitions",
      "Collaborative learning environment",
      "Academic achievement recognition",
      "Leadership development opportunities",
    ],
  },
  officers: [
    {
      id: 1,
      name: "Sarah Chen",
      position: "President",
      grade: "Grade 8",
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Leading the club with passion for mathematics and strong organizational skills.",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      position: "Vice President",
      grade: "Grade 8",
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Supporting club activities and managing member engagement.",
    },
    {
      id: 3,
      name: "Emma Thompson",
      position: "Secretary",
      grade: "Grade 7",
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Maintaining records and coordinating communications.",
    },
  ],
  members: [
    {
      id: 1,
      name: "John Doe",
      grade: "Grade 8",
      role: "Member",
      joinDate: "2024-01-15",
      attendance: 85,
      email: "john.doe@student.edu",
    },
    {
      id: 2,
      name: "Jane Smith",
      grade: "Grade 7",
      role: "Member",
      joinDate: "2024-01-20",
      attendance: 92,
      email: "jane.smith@student.edu",
    },
    {
      id: 3,
      name: "Alex Johnson",
      grade: "Grade 8",
      role: "Treasurer",
      joinDate: "2024-01-10",
      attendance: 88,
      email: "alex.johnson@student.edu",
    },
    {
      id: 4,
      name: "Maria Garcia",
      grade: "Grade 7",
      role: "Member",
      joinDate: "2024-02-01",
      attendance: 95,
      email: "maria.garcia@student.edu",
    },
    {
      id: 5,
      name: "David Lee",
      grade: "Grade 8",
      role: "Member",
      joinDate: "2024-01-25",
      attendance: 78,
      email: "david.lee@student.edu",
    },
  ],
  upcomingEvents: [
    {
      id: 1,
      tag: "Competition",
      date: "2024-03-15",
      title: "Regional Math Olympiad",
      description: "Annual mathematics competition featuring algebra, geometry, and problem-solving challenges.",
      place: "City Convention Center",
    },
    {
      id: 2,
      tag: "Workshop",
      date: "2024-03-08",
      title: "Advanced Calculus Workshop",
      description: "Interactive session on calculus concepts and applications.",
      place: "School Math Laboratory",
    },
  ],
  membershipBenefits: [
    {
      title: "Competition Preparation",
      description: "Intensive training for local and national mathematics competitions.",
    },
    {
      title: "Peer Tutoring",
      description: "Support system for academic improvement in mathematics.",
    },
    {
      title: "Leadership Opportunities",
      description: "Chances to lead projects and develop organizational skills.",
    },
    {
      title: "Academic Recognition",
      description: "Certificates and awards for outstanding participation.",
    },
    {
      title: "College Preparation",
      description: "Advanced problem-solving skills for higher education.",
    },
    {
      title: "Networking",
      description: "Connect with like-minded students and mathematics professionals.",
    },
  ],
  faqs: [
    {
      question: "What are the requirements to join?",
      answer: "Students should have a genuine interest in mathematics and maintain good academic standing.",
    },
    {
      question: "How often do we meet?",
      answer: "We meet twice a week - Tuesdays for regular sessions and Fridays for competition preparation.",
    },
    {
      question: "Are there any fees?",
      answer:
        "Basic membership is free. Competition participation may require minimal fees for materials and transportation.",
    },
  ],
}

const clubApplications = [
  {
    id: 1,
    studentId: "2024001",
    studentName: "Maria Santos",
    gradeLevel: "Grade 10",
    email: "maria.santos@student.com",
    appliedDate: "2024-03-10",
    status: "pending",
    reason:
      "I've always been passionate about drama and theater. I participated in our elementary school plays and would love to continue developing my acting skills.",
    experience: "Participated in 3 school plays, Drama workshop attendee",
    availability: "Weekdays after 3 PM, Weekends",
    goals: "Improve public speaking, participate in school productions, build confidence",
    gpa: 3.8,
    attendance: 95,
    currentClubs: ["Science Club"],
    teacherRecommendation: "Excellent student with great potential",
  },
  {
    id: 2,
    studentId: "2024002",
    studentName: "Juan Dela Cruz",
    gradeLevel: "Grade 9",
    email: "juan.delacruz@student.com",
    appliedDate: "2024-03-12",
    status: "pending",
    reason:
      "I want to explore creative expression through theater and meet like-minded students who share my passion for the arts.",
    experience: "First time joining a drama club, but very enthusiastic",
    availability: "Monday, Wednesday, Friday after school",
    goals: "Learn acting techniques, overcome stage fright, make new friends",
    gpa: 3.5,
    attendance: 92,
    currentClubs: [],
    teacherRecommendation: "Motivated and eager to learn",
  },
  {
    id: 3,
    studentId: "2024003",
    studentName: "Sofia Reyes",
    gradeLevel: "Grade 11",
    email: "sofia.reyes@student.com",
    appliedDate: "2024-03-08",
    status: "approved",
    reason:
      "Theater has been my passion since childhood. I want to contribute to the club and help organize productions.",
    experience: "5 years of theater experience, won best actress in inter-school competition",
    availability: "Fully available, very flexible",
    goals: "Take on leadership roles, mentor new members, participate in competitions",
    gpa: 3.9,
    attendance: 98,
    currentClubs: ["Art Club", "Student Council"],
    teacherRecommendation: "Outstanding student and natural leader",
    reviewedDate: "2024-03-09",
    reviewedBy: "Ms. Torres",
  },
]

export default function ClubPage({ params }: { params: { id: string } }) {
  const [activeSection, setActiveSection] = useState("overview")
  const [viewMode, setViewMode] = useState<"management" | "preview">("management")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")
  const [memberFilter, setMemberFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [membersPerPage] = useState(10)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<number | null>(null)

  const { toast } = useToast()

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Regional Math Olympiad",
      date: "2024-03-15",
      status: "Published",
      attendance: "24/30",
      type: "Competition",
    },
    {
      id: 2,
      title: "Advanced Calculus Workshop",
      date: "2024-03-08",
      status: "Draft",
      attendance: "0/25",
      type: "Workshop",
    },
    {
      id: 3,
      title: "Study Group Session",
      date: "2024-03-22",
      status: "Published",
      attendance: "18/20",
      type: "Meeting",
    },
  ])

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to Math Club!",
      content: "We're excited to have you join us this semester. Get ready for exciting competitions and workshops!",
      date: "2024-03-01",
      priority: "normal" as const,
    },
    {
      id: 2,
      title: "Competition Registration Open",
      content: "Registration for the Regional Math Olympiad is now open. Please sign up by March 10th.",
      date: "2024-03-05",
      priority: "high" as const,
    },
  ])

  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [announcementPriority, setAnnouncementPriority] = useState<"normal" | "high" | "urgent">("normal")
  const [announcementToDelete, setAnnouncementToDelete] = useState<number | null>(null)
  const [showDeleteAnnouncementConfirmation, setShowDeleteAnnouncementConfirmation] = useState(false)

  const [pendingMembers, setPendingMembers] = useState([
    {
      id: "p1",
      name: "Maria Santos",
      grade: "Grade 10",
      email: "maria.santos@student.edu",
      appliedDate: "2024-01-15",
      reason: "I'm passionate about robotics and want to learn more about programming and engineering.",
    },
    {
      id: "p2",
      name: "John Reyes",
      grade: "Grade 9",
      email: "john.reyes@student.edu",
      appliedDate: "2024-01-14",
      reason: "I've been interested in robotics since elementary and would love to join the team.",
    },
    {
      id: "p3",
      name: "Sarah Chen",
      grade: "Grade 11",
      email: "sarah.chen@student.edu",
      appliedDate: "2024-01-13",
      reason: "I have experience with Arduino and want to contribute to the club's projects.",
    },
  ])

  const [selectedPendingMembers, setSelectedPendingMembers] = useState<string[]>([])
  const [bulkActionType, setBulkActionType] = useState<"approve" | "reject" | null>(null)
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false)

  const [pendingMemberToAction, setPendingMemberToAction] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)

  // --- FIX START ---
  // Declare 'members' state and initialize it with clubData.members
  const [members, setMembers] = useState(clubData.members)

  const handleApproveMember = (memberId: string) => {
    const member = pendingMembers.find((m) => m.id === memberId)
    if (member) {
      // Add to active members
      const newMember = {
        id: `m${members.length + 1}`, // Use 'members.length' for new ID
        name: member.name,
        grade: member.grade,
        email: member.email,
        role: "Member",
        attendance: 100,
        joinDate: new Date().toISOString().split("T")[0],
      }
      setMembers([...members, newMember]) // Use 'setMembers'

      // Remove from pending
      setPendingMembers(pendingMembers.filter((m) => m.id !== memberId))

      toast({
        title: "Member Approved",
        description: `${member.name} has been added to the club.`,
      })
    }
    setPendingMemberToAction(null)
    setActionType(null)
  }
  // --- FIX END ---

  const handleRejectMember = (memberId: string) => {
    const member = pendingMembers.find((m) => m.id === memberId)
    if (member) {
      setPendingMembers(pendingMembers.filter((m) => m.id !== memberId))
      toast({
        title: "Application Rejected",
        description: `${member.name}'s application has been rejected.`,
        variant: "destructive",
      })
    }
    setPendingMemberToAction(null)
    setActionType(null)
  }

  const handleSelectAllPending = () => {
    if (selectedPendingMembers.length === pendingMembers.length) {
      setSelectedPendingMembers([])
    } else {
      setSelectedPendingMembers(pendingMembers.map((m) => m.id))
    }
  }

  const handleTogglePendingMember = (memberId: string) => {
    if (selectedPendingMembers.includes(memberId)) {
      setSelectedPendingMembers(selectedPendingMembers.filter((id) => id !== memberId))
    } else {
      setSelectedPendingMembers([...selectedPendingMembers, memberId])
    }
  }

  const handleBulkApprove = () => {
    const approvedMembers = pendingMembers.filter((m) => selectedPendingMembers.includes(m.id))

    // Add all approved members to active members
    const newMembers = approvedMembers.map((member, index) => ({
      id: `m${members.length + index + 1}`,
      name: member.name,
      grade: member.grade,
      email: member.email,
      role: "Member",
      attendance: 100,
      joinDate: new Date().toISOString().split("T")[0],
    }))

    setMembers([...members, ...newMembers])

    // Remove from pending
    setPendingMembers(pendingMembers.filter((m) => !selectedPendingMembers.includes(m.id)))

    toast({
      title: "Members Approved",
      description: `${approvedMembers.length} member(s) have been added to the club.`,
    })

    setSelectedPendingMembers([])
    setShowBulkConfirmation(false)
    setBulkActionType(null)
  }

  const handleBulkReject = () => {
    const rejectedCount = selectedPendingMembers.length

    // Remove from pending
    setPendingMembers(pendingMembers.filter((m) => !selectedPendingMembers.includes(m.id)))

    toast({
      title: "Applications Rejected",
      description: `${rejectedCount} application(s) have been rejected.`,
      variant: "destructive",
    })

    setSelectedPendingMembers([])
    setShowBulkConfirmation(false)
    setBulkActionType(null)
  }

  const confirmBulkAction = () => {
    if (bulkActionType === "approve") {
      handleBulkApprove()
    } else if (bulkActionType === "reject") {
      handleBulkReject()
    }
  }

  const analytics = {
    totalMembers: members.length, // Use the 'members' state here
    activeMembers: members.filter((m) => m.attendance > 80).length, // Use the 'members' state here
    engagementScore: Math.round(members.reduce((acc, m) => acc + m.attendance, 0) / members.length), // Use the 'members' state here
    upcomingEvents: clubData.upcomingEvents.length,
    monthlyGrowth: 12,
    engagementRate: 87,
  }

  const recentActivity = [
    {
      id: 1,
      type: "member_joined",
      message: "Maria Garcia joined the club",
      time: "2 hours ago",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "event_created",
      message: "Regional Math Olympiad scheduled",
      time: "5 hours ago",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "announcement",
      message: "New practice problems uploaded",
      time: "1 day ago",
      icon: Bell,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "achievement",
      message: "Club reached 25 members milestone",
      time: "2 days ago",
      icon: Trophy,
      color: "text-yellow-600",
    },
  ]

  // Renamed to navigationItems to match the update
  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home, color: "text-blue-600" },
    { id: "applications", label: "Applications", icon: FileText, color: "text-indigo-600" },
    { id: "members", label: "Members", icon: Users, color: "text-green-600" },
    { id: "events", label: "Events", icon: Calendar, color: "text-purple-600" },
    { id: "announcements", label: "Announcements", icon: Megaphone, color: "text-orange-600" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
  ]

  const filteredMembers = members.filter((member) => {
    // Use the 'members' state here
    const matchesSearch =
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearch.toLowerCase())

    if (memberFilter === "all") return matchesSearch
    if (memberFilter === "officers") return matchesSearch && member.role !== "Member"
    if (memberFilter === "members") return matchesSearch && member.role === "Member"
    if (memberFilter === "high-attendance") return matchesSearch && member.attendance >= 90
    if (memberFilter === "low-attendance") return matchesSearch && member.attendance < 70

    return matchesSearch
  })

  const indexOfLastMember = currentPage * membersPerPage
  const indexOfFirstMember = indexOfLastMember - membersPerPage
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember)
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // State for FAQ management
  const [clubFaqs, setClubFaqs] = useState(clubData.faqs.map((faq) => ({ ...faq, id: Date.now() + Math.random() })))

  const [customQuestions, setCustomQuestions] = useState([
    {
      id: 1,
      question: "Why do you want to join this club?",
      type: "long-text",
      required: true,
      order: 1,
    },
    {
      id: 2,
      question: "What relevant experience do you have?",
      type: "long-text",
      required: true,
      order: 2,
    },
    {
      id: 3,
      question: "What are your availability?",
      type: "short-text",
      required: true,
      order: 3,
    },
  ])
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [showFormBuilder, setShowFormBuilder] = useState(false)

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      type: "short-text",
      required: false,
      order: customQuestions.length + 1,
    }
    setCustomQuestions([...customQuestions, newQuestion])
    setEditingQuestion(newQuestion.id)
  }

  const updateQuestion = (id: number, field: string, value: any) => {
    setCustomQuestions(customQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const deleteQuestion = (id: number) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id))
  }

  const moveQuestionUp = (index: number) => {
    if (index === 0) return
    const newQuestions = [...customQuestions]
    ;[newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]]
    setCustomQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })))
  }

  const moveQuestionDown = (index: number) => {
    if (index === customQuestions.length - 1) return
    const newQuestions = [...customQuestions]
    ;[newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]]
    setCustomQuestions(newQuestions.map((q, i) => ({ ...q, order: i + 1 })))
  }

  const saveForm = () => {
    console.log("[v0] Saving custom questions:", customQuestions)
    // TODO: Connect to your backend API to save questions
    setShowFormBuilder(false)
  }

  const handleSave = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSave = () => {
    // Save logic here
    console.log("Saving all club settings...")
    setShowSaveConfirmation(false)
    // Add success toast or notification here
  }

  const handleDeleteEvent = (eventId: number) => {
    setEventToDelete(eventId)
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteEvent = () => {
    if (eventToDelete === null) return

    console.log("[v0] Deleting event:", eventToDelete)

    setEvents(events.filter((event) => event.id !== eventToDelete))

    toast({
      title: "Event Deleted",
      description: "The event has been successfully deleted.",
      variant: "default",
    })

    setShowDeleteConfirmation(false)
    setEventToDelete(null)
  }

  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      })
      return
    }

    const newAnnouncement = {
      id: Date.now(),
      title: announcementTitle,
      content: announcementContent,
      date: new Date().toISOString().split("T")[0],
      priority: announcementPriority,
    }

    setAnnouncements([newAnnouncement, ...announcements])

    toast({
      title: "Announcement Created",
      description: "Your announcement has been posted successfully.",
    })

    // Reset form
    setAnnouncementTitle("")
    setAnnouncementContent("")
    setAnnouncementPriority("normal")
    setShowCreateAnnouncement(false)
  }

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncementToDelete(id)
    setShowDeleteAnnouncementConfirmation(true)
  }

  const confirmDeleteAnnouncement = () => {
    if (announcementToDelete === null) return

    setAnnouncements(announcements.filter((announcement) => announcement.id !== announcementToDelete))

    toast({
      title: "Announcement Deleted",
      description: "The announcement has been successfully deleted.",
    })

    setShowDeleteAnnouncementConfirmation(false)
    setAnnouncementToDelete(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const PublicPreview = () => (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"}`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{clubData.name}</h1>
            <p className="text-blue-100 mt-1">{clubData.description}</p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {clubData.memberCount} Members
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {clubData.championshipWins} Championships
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Mission Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{clubData.mission.title}</h2>
          <p className="text-gray-600 mb-6">{clubData.mission.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubData.mission.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Star className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Officers Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Our Officers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubData.officers.map((officer) => (
              <div key={officer.id} className="text-center p-6 bg-gray-50 rounded-xl">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={officer.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {officer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{officer.name}</h3>
                <p className="text-blue-600 font-medium">{officer.position}</p>
                <p className="text-gray-500 text-sm">{officer.grade}</p>
                <p className="text-gray-600 text-sm mt-2">{officer.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {clubData.upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {event.tag}
                  </Badge>
                  <span className="text-sm text-gray-500">{event.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3">{event.description}</p>
                <div className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.place}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Benefits */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubData.membershipBenefits.map((benefit, index) => (
              <div key={index} className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2 text-blue-600">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {clubData.faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const [customRoles, setCustomRoles] = useState<string[]>(["Member", "Officer", "Treasurer", "Secretary"])
  const [newRoleName, setNewRoleName] = useState("")
  const [showAddRole, setShowAddRole] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAddCustomRole = () => {
    if (newRoleName.trim() && !customRoles.includes(newRoleName.trim())) {
      setCustomRoles([...customRoles, newRoleName.trim()])
      setNewRoleName("")
      setShowAddRole(false)
      toast({
        title: "Role Added",
        description: `"${newRoleName.trim()}" has been added to available roles.`,
      })
    }
  }

  const handleDeleteCustomRole = (roleToDelete: string) => {
    setCustomRoles(customRoles.filter((role) => role !== roleToDelete))
    toast({
      title: "Role Deleted",
      description: `"${roleToDelete}" has been removed from available roles.`,
    })
  }

  const handleDeleteMember = () => {
    if (memberToDelete) {
      // TODO: Connect to your backend API to delete member
      console.log("Deleting member:", memberToDelete.id)

      // Remove member from the members state
      setMembers(members.filter((m) => m.id !== memberToDelete.id))

      toast({
        title: "Member Removed",
        description: `${memberToDelete.name} has been removed from the club.`,
        variant: "default",
      })

      setShowDeleteConfirm(false)
      setMemberToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b shadow-sm sticky top-0 z-50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clubs
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{clubData.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Club Management Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-600/50 dark:bg-amber-900/20"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}

              <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant={viewMode === "management" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("management")}
                  className={
                    viewMode === "management"
                      ? "bg-white/90 dark:bg-gray-700/90 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  }
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Management
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className={
                    viewMode === "preview"
                      ? "bg-white/90 dark:bg-gray-700/90 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  }
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              {viewMode === "preview" && (
                <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                    className={
                      previewDevice === "desktop"
                        ? "bg-white/90 dark:bg-gray-700/90 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    }
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                    className={
                      previewDevice === "mobile"
                        ? "bg-white/90 dark:bg-gray-700/90 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    }
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div
          className={`${
            viewMode === "preview" ? "w-16" : "w-80"
          } bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r shadow-lg overflow-y-auto transition-all duration-300 dark:border-gray-700/50`}
        >
          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            {viewMode === "management" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/60 dark:via-blue-800/60 dark:to-blue-700/60 p-3 rounded-xl border border-blue-200/50 dark:border-blue-600/30 shadow-sm dark:shadow-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Members</p>
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{analytics.totalMembers}</p>
                      </div>
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/60 dark:via-green-800/60 dark:to-green-700/60 p-3 rounded-xl border border-green-200/50 dark:border-green-600/30 shadow-sm dark:shadow-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Active</p>
                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                          {analytics.activeMembers}
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900/60 dark:via-purple-800/60 dark:to-purple-700/60 p-3 rounded-xl border border-purple-200/50 dark:border-purple-600/30 shadow-sm dark:shadow-purple-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Events</p>
                        <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                          {analytics.upcomingEvents}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-900/60 dark:via-orange-800/60 dark:to-orange-700/60 p-3 rounded-xl border border-orange-200/50 dark:border-orange-600/30 shadow-sm dark:shadow-orange-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Score</p>
                        <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                          {analytics.engagementScore}%
                        </p>
                      </div>
                      <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="space-y-3">
              {viewMode === "management" && (
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Navigation
                </h3>
              )}
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`${viewMode === "preview" ? "w-12 h-12 p-0 justify-center" : "w-full justify-start h-10"} ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                      } transition-all duration-300`}
                      onClick={() => setActiveSection(item.id)}
                      title={viewMode === "preview" ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 ${viewMode === "management" ? "mr-3" : ""} ${activeSection === item.id ? "text-white" : item.color + " dark:" + item.color.replace("text-", "text-") + "/80"}`}
                      />
                      {viewMode === "management" && item.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Activity Feed - Only show in management mode */}
            {viewMode === "management" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Recent Activity
                  </h3>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600 dark:text-gray-400">
                    <Activity className="w-3 h-3 mr-1" />
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-gray-600/50`}
                        >
                          <Icon
                            className={`w-4 h-4 ${activity.color} dark:${activity.color.replace("text-", "text-")}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-y-auto">
          {viewMode === "preview" ? (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Live Preview
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                  >
                    {previewDevice === "desktop" ? "Desktop" : "Mobile"} View
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              <PublicPreview />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Club Overview</h2>
                  </div>

                  {/* Enhanced Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">Total Members</p>
                            <p className="text-3xl font-bold">{analytics.totalMembers}</p>
                            <p className="text-blue-200 text-xs mt-1">+{analytics.monthlyGrowth}% this month</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium">Active Members</p>
                            <p className="text-3xl font-bold">{analytics.activeMembers}</p>
                            <p className="text-green-200 text-xs mt-1">High engagement</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">Engagement</p>
                            <p className="text-3xl font-bold">{analytics.engagementScore}%</p>
                            <p className="text-purple-200 text-xs mt-1">Above average</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm font-medium">Upcoming Events</p>
                            <p className="text-3xl font-bold">{analytics.upcomingEvents}</p>
                            <p className="text-orange-200 text-xs mt-1">Next: March 15</p>
                          </div>
                          <Calendar className="w-8 h-8 text-orange-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Member Growth Chart */}
                    <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 border-b dark:border-gray-700/50 backdrop-blur-sm">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Member Growth</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Monthly member acquisition over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-64 flex items-end justify-between space-x-2">
                          {[15, 18, 22, 28, 35, 42].map((value, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-300 rounded-t-md transition-all duration-1000 ease-out shadow-sm"
                                style={{ height: `${(value / 42) * 200}px` }}
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][index]}
                              </span>
                              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attendance Trends */}
                    <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                      <CardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border-b dark:border-gray-700/50 backdrop-blur-sm">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Attendance Trends</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Weekly attendance patterns
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-64 relative">
                          <svg className="w-full h-full" viewBox="0 0 300 200">
                            <defs>
                              <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                              </linearGradient>
                            </defs>
                            <polyline
                              fill="url(#attendanceGradient)"
                              stroke="#10b981"
                              strokeWidth="3"
                              points="0,150 50,120 100,100 150,80 200,90 250,70 300,60"
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              points="0,150 50,120 100,100 150,80 200,90 250,70 300,60"
                            />
                          </svg>
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                            <span>Week 4</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Event Participation */}
                    <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                      <CardHeader className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 border-b dark:border-gray-700/50 backdrop-blur-sm">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Event Participation</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Member engagement in club events
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {[
                            { name: "Math Competition", participation: 85, color: "bg-purple-500" },
                            { name: "Study Session", participation: 92, color: "bg-blue-500" },
                            { name: "Club Meeting", participation: 78, color: "bg-green-500" },
                            { name: "Social Event", participation: 65, color: "bg-orange-500" },
                          ].map((event, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-900 dark:text-white">{event.name}</span>
                                <span className="text-gray-600 dark:text-gray-300">{event.participation}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700/80 rounded-full h-2 shadow-inner">
                                <div
                                  className={`${event.color} h-2 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                  style={{ width: `${event.participation}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="shadow-xl border-0 dark:border dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/30 dark:to-blue-900/30 border-b dark:border-gray-700/50 backdrop-blur-sm">
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Performance Metrics</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Key performance indicators
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50/80 via-blue-100/80 to-blue-200/80 dark:from-blue-900/40 dark:via-blue-800/40 dark:to-blue-700/40 rounded-xl border border-blue-200/50 dark:border-blue-600/30 shadow-sm">
                            <TrendingUp className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                              {analytics.monthlyGrowth}%
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Monthly Growth</p>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50/80 via-green-100/80 to-green-200/80 dark:from-green-900/40 dark:via-green-800/40 dark:to-green-700/40 rounded-xl border border-green-200/50 dark:border-green-600/30 shadow-sm">
                            <Users className="w-6 h-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                            <p className="text-xl font-bold text-green-700 dark:text-green-300">
                              {analytics.engagementRate}%
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">Engagement Rate</p>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50/80 via-purple-100/80 to-purple-200/80 dark:from-purple-900/40 dark:via-purple-800/40 dark:to-purple-700/40 rounded-xl border border-purple-200/50 dark:border-purple-600/30 shadow-sm">
                            <Trophy className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                              {clubData.championshipWins}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Championships</p>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50/80 via-orange-100/80 to-orange-200/80 dark:from-orange-900/40 dark:via-orange-800/40 dark:to-orange-700/40 rounded-xl border border-orange-200/50 dark:border-orange-600/30 shadow-sm">
                            <Calendar className="w-6 h-6 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
                            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                              {analytics.upcomingEvents}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400">Upcoming Events</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border dark:border-blue-800">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Members</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Add, edit, or remove club members
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setActiveSection("members")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Open
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 dark:border dark:border-purple-800">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Plan Events</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Schedule and organize club activities
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setActiveSection("events")}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Open
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Members Section */}
              {activeSection === "members" && (
                <div className="space-y-6">
                  {pendingMembers.length > 0 && (
                    <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                              Pending Applications
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Review and approve student applications to join the club
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                              {pendingMembers.length} Pending
                            </span>
                          </div>
                        </div>
                        {selectedPendingMembers.length > 0 && (
                          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {selectedPendingMembers.length} selected
                            </span>
                            <div className="flex gap-2 ml-auto">
                              <Button
                                onClick={() => {
                                  setBulkActionType("approve")
                                  setShowBulkConfirmation(true)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve Selected
                              </Button>
                              <Button
                                onClick={() => {
                                  setBulkActionType("reject")
                                  setShowBulkConfirmation(true)
                                }}
                                variant="outline"
                                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject Selected
                              </Button>
                              <Button onClick={() => setSelectedPendingMembers([])} variant="ghost" size="sm">
                                Clear
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b dark:border-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedPendingMembers.length === pendingMembers.length}
                            onChange={handleSelectAllPending}
                            className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                          />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</label>
                        </div>
                        <div className="space-y-4">
                          {pendingMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-start justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start space-x-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedPendingMembers.includes(member.id)}
                                  onChange={() => handleTogglePendingMember(member.id)}
                                  className="w-4 h-4 mt-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                />
                                <Avatar className="w-12 h-12 mt-1">
                                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                      {member.grade}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{member.email}</p>
                                  <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-md">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{member.reason}"</p>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Applied on {new Date(member.appliedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => {
                                    setPendingMemberToAction(member.id)
                                    setActionType("approve")
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => {
                                    setPendingMemberToAction(member.id)
                                    setActionType("reject")
                                  }}
                                  variant="outline"
                                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  size="sm"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Member Management Card */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-900 dark:text-white">Member Management</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowAddRole(true)}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Role
                          </Button>
                          <Button
                            onClick={() => setShowAddMember(true)}
                            className="bg-green-600 hover:bg-green-700 shadow-md"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Input
                          placeholder="Search members..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="flex-1 dark:bg-slate-800 dark:border-slate-600"
                        />
                        <Select value={memberFilter} onValueChange={setMemberFilter}>
                          <SelectTrigger className="w-full sm:w-48 dark:bg-slate-800 dark:border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                            <SelectItem value="all">All Members</SelectItem>
                            <SelectItem value="officers">Officers Only</SelectItem>
                            <SelectItem value="members">Regular Members</SelectItem>
                            <SelectItem value="high-attendance">High Attendance</SelectItem>
                            <SelectItem value="low-attendance">Needs Attention</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Student</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Role</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentMembers.map((member) => (
                            <TableRow
                              key={member.id}
                              className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b dark:border-slate-700"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {member.grade} • {member.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={member.role}
                                  onValueChange={(value) => {
                                    // TODO: Connect to your backend API to update member role
                                    console.log("Updating role for", member.id, "to", value)
                                    toast({
                                      title: "Role Updated",
                                      description: `${member.name}'s role has been updated to ${value}.`,
                                    })
                                  }}
                                >
                                  <SelectTrigger className="w-40 h-9 dark:bg-slate-800 dark:border-slate-600">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                                    {customRoles.map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent border-gray-300 dark:border-slate-600"
                                  >
                                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setMemberToDelete(member)
                                      setShowDeleteConfirm(true)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent border-gray-300 dark:border-slate-600"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="p-4 bg-gray-50 dark:bg-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Showing {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, filteredMembers.length)} of{" "}
                              {filteredMembers.length} members
                            </span>
                            <div className="flex items-center space-x-4">
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {clubData.members.filter((m) => m.attendance >= 90).length} high performers
                              </span>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {clubData.members.filter((m) => m.attendance < 70).length} need attention
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-8 w-8 p-0 border-gray-300 dark:border-slate-600"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber
                                if (totalPages <= 5) {
                                  pageNumber = i + 1
                                } else if (currentPage <= 3) {
                                  pageNumber = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i
                                } else {
                                  pageNumber = currentPage - 2 + i
                                }

                                return (
                                  <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`h-8 w-8 p-0 text-xs ${
                                      currentPage === pageNumber
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    }`}
                                  >
                                    {pageNumber}
                                  </Button>
                                )
                              })}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 p-0 border-gray-300 dark:border-slate-600"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Events Section */}
              {activeSection === "events" && (
                <div className="space-y-6">
                  {/* Event Management Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Create, manage, and track all club events</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="dark:border-slate-600 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Export Events
                      </Button>
                      <Link href={`/teacher/clubs/${params.id}/events/create`}>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Event Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                          </div>
                          <Calendar className="w-8 h-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                            <p className="text-2xl font-bold text-green-600">3</p>
                          </div>
                          <Clock className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                            <p className="text-2xl font-bold text-blue-600">85%</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                            <p className="text-2xl font-bold text-orange-600">5</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Event Management Tools */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white">Event Dashboard</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Manage all aspects of your club events
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="dark:border-slate-600 bg-transparent">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                          <Button variant="outline" size="sm" className="dark:border-slate-600 bg-transparent">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Event Management Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                  Event
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                  Date
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                  Status
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                  Attendance
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {events.map((event) => (
                                <tr
                                  key={event.id}
                                  className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                                >
                                  <td className="py-4 px-4">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {event.type}
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{event.date}</td>
                                  <td className="py-4 px-4">
                                    <Badge
                                      variant={event.status === "Published" ? "default" : "secondary"}
                                      className={
                                        event.status === "Published"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {event.status}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900 dark:text-white">{event.attendance}</span>
                                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                          className="bg-purple-500 h-2 rounded-full"
                                          style={{
                                            width: `${(Number.parseInt(event.attendance.split("/")[0]) / Number.parseInt(event.attendance.split("/")[1])) * 100}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex gap-2">
                                      <Link href={`/teacher/clubs/${params.id}/events/edit/${event.id}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="dark:border-slate-600 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        >
                                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </Button>
                                      </Link>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="dark:border-slate-600 bg-transparent"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700">
                          <div className="flex items-center gap-4">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Select all events</span>
                            <Button variant="outline" size="sm" className="dark:border-slate-600 bg-transparent">
                              Bulk Actions
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="dark:border-slate-600 bg-transparent">
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Page 1 of 2</span>
                            <Button variant="outline" size="sm" className="dark:border-slate-600 bg-transparent">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Event Creation */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b dark:border-slate-700">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">Quick Event Creation</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Create events quickly using templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { name: "Competition", icon: Trophy, color: "bg-yellow-500" },
                          { name: "Workshop", icon: BookOpen, color: "bg-blue-500" },
                          { name: "Meeting", icon: Users, color: "bg-green-500" },
                        ].map((template, index) => (
                          // Added Link wrapper for quick event creation templates
                          <Link
                            key={index}
                            href={`/teacher/clubs/${params.id}/events/create?template=${template.name.toLowerCase()}`}
                          >
                            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-center hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-colors">
                              <template.icon
                                className={`w-8 h-8 mx-auto ${template.color.replace("bg-", "text-")} mb-2`}
                              />
                              <p className="font-medium text-gray-900 dark:text-white">{template.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Create {template.name.toLowerCase()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Announcements Section */}
              {activeSection === "announcements" && (
                <div className="space-y-6">
                  {/* Announcements Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Club Announcements</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Create and manage announcements for your club members
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCreateAnnouncement(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>

                  {/* Announcements List */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b dark:border-slate-700">
                      <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
                        <Megaphone className="w-5 h-5 mr-2" />
                        All Announcements
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} posted
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {announcements.length === 0 ? (
                        <div className="text-center py-12">
                          <Megaphone className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No announcements yet
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create your first announcement to keep members informed
                          </p>
                          <Button
                            onClick={() => setShowCreateAnnouncement(true)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Announcement
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {announcements.map((announcement) => (
                            <div
                              key={announcement.id}
                              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getPriorityColor(announcement.priority)}>
                                      {announcement.priority}
                                    </Badge>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {announcement.date}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {announcement.title}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400">{announcement.content}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="dark:border-slate-600 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-slate-600 bg-transparent"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  {/* Club Data Section */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-slate-700">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">Club Data</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Basic information and statistics about your club
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="clubName" className="text-gray-700 dark:text-gray-300 font-medium">
                            Club Name
                          </Label>
                          <Input
                            id="clubName"
                            defaultValue={clubData.name}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="activeMembers" className="text-gray-700 dark:text-gray-300 font-medium">
                            Active Member Count
                          </Label>
                          <Input
                            id="activeMembers"
                            type="number"
                            defaultValue={clubData.memberCount}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clubEmail" className="text-gray-700 dark:text-gray-300 font-medium">
                            Club Email
                          </Label>
                          <Input
                            id="clubEmail"
                            type="email"
                            defaultValue={clubData.email}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="championshipWins" className="text-gray-700 dark:text-gray-300 font-medium">
                            Championship Wins
                          </Label>
                          <Input
                            id="championshipWins"
                            type="number"
                            defaultValue={clubData.championshipWins}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <Label htmlFor="clubDescription" className="text-gray-700 dark:text-gray-300 font-medium">
                          Club Description
                        </Label>
                        <Textarea
                          id="clubDescription"
                          defaultValue={clubData.description}
                          className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          rows={4}
                        />
                      </div>

                      <div className="mt-6">
                        <Label htmlFor="clubMission" className="text-gray-700 dark:text-gray-300 font-medium">
                          Club Mission
                        </Label>
                        <Textarea
                          id="clubMission"
                          defaultValue={clubData.mission.description}
                          className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          rows={3}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <Label htmlFor="missionTitle" className="text-gray-700 dark:text-gray-300 font-medium">
                            Mission Title
                          </Label>
                          <Input
                            id="missionTitle"
                            defaultValue={clubData.mission.title}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="missionDescription" className="text-gray-700 dark:text-gray-300 font-medium">
                            Mission Description
                          </Label>
                          <Input
                            id="missionDescription"
                            defaultValue="Brief mission statement"
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                      </div>

                      {/* 5 Benefits Section */}
                      <div className="mt-6">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Club Benefits (5 Benefits)
                        </Label>
                        <div className="space-y-3 mt-2">
                          {clubData.mission.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                                {index + 1}.
                              </span>
                              <Input
                                defaultValue={benefit}
                                className="flex-1 dark:bg-slate-800 dark:border-slate-600"
                                placeholder={`Benefit ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Club Membership Benefits Section */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b dark:border-slate-700">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">Club Membership Benefits</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Detailed benefits for club members with titles and descriptions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <Label htmlFor="benefitsTitle" className="text-gray-700 dark:text-gray-300 font-medium">
                            Benefits Section Title
                          </Label>
                          <Input
                            id="benefitsTitle"
                            defaultValue="Why Join Our Club?"
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="benefitsDescription" className="text-gray-700 dark:text-gray-300 font-medium">
                            Benefits Description
                          </Label>
                          <Input
                            id="benefitsDescription"
                            defaultValue="Discover the amazing benefits of being part of our community"
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                      </div>

                      {/* 6 Benefits with Title and Description */}
                      <div className="space-y-4">
                        <Label className="text-gray-700 dark:text-gray-300 font-medium">
                          Membership Benefits (6 Benefits)
                        </Label>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <div
                            key={num}
                            className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400">Benefit {num} Title</Label>
                                <Input
                                  defaultValue={`Benefit ${num} Title`}
                                  className="mt-1 dark:bg-slate-800 dark:border-slate-600"
                                  placeholder={`Enter benefit ${num} title`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                  Benefit {num} Description
                                </Label>
                                <Input
                                  defaultValue={`Description for benefit ${num}`}
                                  className="mt-1 dark:bg-slate-800 dark:border-slate-600"
                                  placeholder={`Enter benefit ${num} description`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Club FAQ Section */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-b dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white">Club FAQ</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Frequently asked questions about your club (Dynamic - Add/Remove)
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => {
                            const newFaq = { id: Date.now(), question: "", answer: "" }
                            setClubFaqs([...clubFaqs, newFaq])
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {clubFaqs.map((faq, index) => (
                          <div
                            key={faq.id}
                            className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">FAQ {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setClubFaqs(clubFaqs.filter((f) => f.id !== faq.id))
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400">Question</Label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) => {
                                    const updated = clubFaqs.map((f) =>
                                      f.id === faq.id ? { ...f, question: e.target.value } : f,
                                    )
                                    setClubFaqs(updated)
                                  }}
                                  className="mt-1 dark:bg-slate-800 dark:border-slate-600"
                                  placeholder="Enter your question here..."
                                />
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600 dark:text-gray-400">Answer</Label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const updated = clubFaqs.map((f) =>
                                      f.id === faq.id ? { ...f, answer: e.target.value } : f,
                                    )
                                    setClubFaqs(updated)
                                  }}
                                  className="mt-1 dark:bg-slate-800 dark:border-slate-600"
                                  placeholder="Enter your answer here..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {clubFaqs.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">
                              No FAQs added yet. Click "Add FAQ" to get started.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Settings Button */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" className="border-gray-300 dark:border-slate-600 bg-transparent">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Changes
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save All Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Applications Section */}
              {activeSection === "applications" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Club Applications</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Review and manage student applications to join your club
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowFormBuilder(!showFormBuilder)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Customize Form
                      </Button>
                      <Button variant="outline" className="dark:border-slate-600 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Export Applications
                      </Button>
                      <Button variant="outline" className="dark:border-slate-600 bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>

                  {showFormBuilder && (
                    <Card className="shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                              Application Form Builder
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Customize the questions students will answer when applying
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={saveForm} className="bg-green-600 hover:bg-green-700">
                              <Save className="w-4 h-4 mr-2" />
                              Save Form
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowFormBuilder(false)}
                              className="bg-transparent"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Default Questions Info */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                              Default Questions (Always Included)
                            </p>
                            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                              <li>• Full Name</li>
                              <li>• Student ID</li>
                              <li>• Grade Level</li>
                              <li>• Email Address</li>
                            </ul>
                          </div>

                          {/* Custom Questions */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Questions</h3>
                              <Button onClick={addQuestion} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question
                              </Button>
                            </div>

                            {customQuestions.map((question, index) => (
                              <Card key={question.id} className="border-2 border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                  <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          Question {index + 1}
                                        </Badge>
                                        {question.required && (
                                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                            Required
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => moveQuestionUp(index)}
                                          disabled={index === 0}
                                        >
                                          <MoveUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => moveQuestionDown(index)}
                                          disabled={index === customQuestions.length - 1}
                                        >
                                          <MoveDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setEditingQuestion(editingQuestion === question.id ? null : question.id)
                                          }
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteQuestion(question.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    {editingQuestion === question.id ? (
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Question Text</Label>
                                          <Textarea
                                            value={question.question}
                                            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                                            placeholder="Enter your question here..."
                                            className="mt-1"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Answer Type</Label>
                                            <Select
                                              value={question.type}
                                              onValueChange={(value) => updateQuestion(question.id, "type", value)}
                                            >
                                              <SelectTrigger className="mt-1">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="short-text">Short Text</SelectItem>
                                                <SelectItem value="long-text">Long Text (Essay)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex items-center justify-between pt-6">
                                            <Label>Required Question</Label>
                                            <Switch
                                              checked={question.required}
                                              onCheckedChange={(checked) =>
                                                updateQuestion(question.id, "required", checked)
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {question.question || "Untitled Question"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          Type: {question.type === "short-text" ? "Short Text" : "Long Text (Essay)"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {customQuestions.length === 0 && (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No custom questions yet. Click "Add Question" to create one.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Preview Section */}
                          <div className="mt-6 pt-6 border-t dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Preview</h3>
                            <Card className="bg-gray-50 dark:bg-gray-800/50">
                              <CardContent className="p-6 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  This is how students will see the application form:
                                </p>
                                {/* Default Questions Preview */}
                                <div>
                                  <Label className="text-gray-900 dark:text-white">
                                    1. Full Name <span className="text-red-500 ml-1">*</span>
                                  </Label>
                                  <Input disabled placeholder="Student's answer will appear here..." className="mt-2" />
                                </div>
                                <div>
                                  <Label className="text-gray-900 dark:text-white">
                                    2. Student ID <span className="text-red-500 ml-1">*</span>
                                  </Label>
                                  <Input disabled placeholder="Student's answer will appear here..." className="mt-2" />
                                </div>
                                <div>
                                  <Label className="text-gray-900 dark:text-white">
                                    3. Grade Level <span className="text-red-500 ml-1">*</span>
                                  </Label>
                                  <Input disabled placeholder="Student's answer will appear here..." className="mt-2" />
                                </div>
                                <div>
                                  <Label className="text-gray-900 dark:text-white">
                                    4. Email Address <span className="text-red-500 ml-1">*</span>
                                  </Label>
                                  <Input disabled placeholder="Student's answer will appear here..." className="mt-2" />
                                </div>
                                {/* Custom Questions Preview */}
                                {customQuestions.map((question, index) => (
                                  <div key={question.id}>
                                    <Label className="text-gray-900 dark:text-white">
                                      {index + 5}. {question.question || "Untitled Question"}
                                      {question.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    {question.type === "short-text" ? (
                                      <Input
                                        disabled
                                        placeholder="Student's answer will appear here..."
                                        className="mt-2"
                                      />
                                    ) : (
                                      <Textarea
                                        disabled
                                        placeholder="Student's answer will appear here..."
                                        className="mt-2"
                                        rows={4}
                                      />
                                    )}
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Application Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Applications</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {clubApplications.length}
                            </p>
                          </div>
                          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Pending Review</p>
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                              {clubApplications.filter((app) => app.status === "pending").length}
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Approved</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {clubApplications.filter((app) => app.status === "approved").length}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Rejected</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                              {clubApplications.filter((app) => app.status === "rejected").length}
                            </p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pending Applications */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white">Pending Applications</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Review student applications and make decisions
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-900/30"
                        >
                          {clubApplications.filter((app) => app.status === "pending").length} Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {clubApplications
                          .filter((app) => app.status === "pending")
                          .map((application) => (
                            <Card
                              key={application.id}
                              className="border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                      {application.studentName.charAt(0)}
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {application.studentName}
                                      </h3>
                                      <div className="flex items-center gap-3 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {application.gradeLevel}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          ID: {application.studentId}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                </div>

                                {/* Student Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {application.gpa}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {application.attendance}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Clubs</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {application.currentClubs.length || "None"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {application.email}
                                    </p>
                                  </div>
                                </div>

                                {/* Application Details */}
                                <div className="space-y-3 mb-4">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                      Why do you want to join?
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                      {application.reason}
                                    </p>
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Experience
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                        {application.experience}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Availability
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                        {application.availability}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Goals</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                      {application.goals}
                                    </p>
                                  </div>
                                  {application.teacherRecommendation && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center">
                                        <Star className="w-4 h-4 mr-1" />
                                        Teacher Recommendation
                                      </p>
                                      <p className="text-sm text-blue-600 dark:text-blue-400">
                                        {application.teacherRecommendation}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700">
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      console.log("[v0] Approving application:", application.id)
                                      // TODO: Connect to your backend API
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Application
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                                    onClick={() => {
                                      console.log("[v0] Rejecting application:", application.id)
                                      // TODO: Connect to your backend API
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="bg-transparent"
                                    onClick={() => {
                                      console.log("[v0] Requesting more info from:", application.studentId)
                                      // TODO: Connect to your messaging system
                                    }}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Request Info
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                        {clubApplications.filter((app) => app.status === "pending").length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              No Pending Applications
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">All applications have been reviewed.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application History */}
                  <Card className="shadow-lg border-0 dark:border dark:border-slate-700">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-b dark:border-slate-700">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">Application History</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View all processed applications</p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {clubApplications
                          .filter((app) => app.status !== "pending")
                          .map((application) => (
                            <div
                              key={application.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {application.studentName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {application.studentName}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {application.gradeLevel} • Applied{" "}
                                    {new Date(application.appliedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {application.status === "approved" ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Member</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a student to the club membership.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900 dark:text-white">Student Name</Label>
              <Input placeholder="Enter student name" className="dark:bg-slate-800 dark:border-slate-600" />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Email</Label>
              <Input placeholder="student@email.com" className="dark:bg-slate-800 dark:border-slate-600" />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Grade Level</Label>
              <Select>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectItem value="grade-7">Grade 7</SelectItem>
                  <SelectItem value="grade-8">Grade 8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Role</Label>
              <Select defaultValue="Member">
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">Add Member</Button>
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
                className="border-gray-300 dark:border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this event? This action cannot be undone and will permanently remove the
              event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateAnnouncement} onOpenChange={setShowCreateAnnouncement}>
        <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center">
              <Megaphone className="w-5 h-5 mr-2 text-orange-600" />
              Create Announcement
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Share important information with your club members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900 dark:text-white">Title</Label>
              <Input
                placeholder="Enter announcement title..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Content</Label>
              <Textarea
                placeholder="Write your announcement here..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
                rows={5}
              />
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">Priority</Label>
              <Select value={announcementPriority} onValueChange={(v: any) => setAnnouncementPriority(v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleCreateAnnouncement} className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateAnnouncement(false)
                  setAnnouncementTitle("")
                  setAnnouncementContent("")
                  setAnnouncementPriority("normal")
                }}
                className="border-gray-300 dark:border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Announcement Confirmation Dialog */}
      <AlertDialog open={showDeleteAnnouncementConfirmation} onOpenChange={setShowDeleteAnnouncementConfirmation}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Delete Announcement
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAnnouncement} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Announcement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={pendingMemberToAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingMemberToAction(null)
            setActionType(null)
          }
        }}
      >
        <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {actionType === "approve"
                ? "Are you sure you want to approve this student's application? They will be added as a club member."
                : "Are you sure you want to reject this application? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPendingMemberToAction(null)
                setActionType(null)
              }}
              className="dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingMemberToAction) {
                  if (actionType === "approve") {
                    handleApproveMember(pendingMemberToAction)
                  } else {
                    handleRejectMember(pendingMemberToAction)
                  }
                }
              }}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBulkConfirmation} onOpenChange={setShowBulkConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === "approve" ? "Approve Selected Members?" : "Reject Selected Applications?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionType === "approve"
                ? `You are about to approve ${selectedPendingMembers.length} member(s). They will be added to the active members list.`
                : `You are about to reject ${selectedPendingMembers.length} application(s). This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                bulkActionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {bulkActionType === "approve" ? "Approve All" : "Reject All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add Custom Role</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new role for club members. This role will be available in the member management dropdown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name
              </Label>
              <Input
                id="roleName"
                placeholder="e.g., Vice President, Event Coordinator"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCustomRole()
                  }
                }}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Roles</Label>
              <div className="flex flex-wrap gap-2">
                {customRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1 pr-1"
                  >
                    {role}
                    <button
                      onClick={() => handleDeleteCustomRole(role)}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      aria-label={`Delete ${role} role`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddRole(false)
                setNewRoleName("")
              }}
              className="dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomRole}
              disabled={!newRoleName.trim() || customRoles.includes(newRoleName.trim())}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Remove Member?
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. The member will be removed from the club.
            </DialogDescription>
          </DialogHeader>

          {memberToDelete && (
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white font-semibold">
                      {memberToDelete.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{memberToDelete.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {memberToDelete.grade} • {memberToDelete.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-500" />
                  <p>The student will lose access to all club resources and activities.</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-500" />
                  <p>Their attendance and participation history will be archived.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setMemberToDelete(null)
              }}
              className="dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
