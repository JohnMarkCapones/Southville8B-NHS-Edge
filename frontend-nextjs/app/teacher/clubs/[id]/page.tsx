"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, use, useEffect } from "react"
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
  Loader2,
  Upload,
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
import {
  useClub,
  useClubMemberships,
  useClubMembershipMutations,
  useClubPositions,
  useUpdateClub,
} from "@/hooks"
import { useClubForms, useClubForm } from "@/hooks/useClubForms"
import { useClubFormMutations } from "@/hooks/useClubFormMutations"
import { useFormResponses } from "@/hooks/useFormResponses"
import { useFormResponseMutations } from "@/hooks/useFormResponseMutations"
import { useEventsByClubId, useArchiveEvent } from "@/hooks/useEvents"
import { useClubBenefits, useCreateClubBenefit, useUpdateClubBenefit, useDeleteClubBenefit } from "@/hooks/useClubBenefits"
import { useClubFaqs, useCreateClubFaq, useUpdateClubFaq, useDeleteClubFaq } from "@/hooks/useClubFaqs"
import { AddMemberDialog } from "@/components/teacher/clubs/AddMemberDialog"
import {
  QuestionType,
  mapQuestionTypeToUI,
  mapUITypeToBackend,
  type FormQuestion,
} from "@/lib/api/endpoints/club-forms"
import {
  getClubAnnouncements,
  createClubAnnouncement,
  updateClubAnnouncement,
  deleteClubAnnouncement,
  getClubById,
  updateClub,
  approveClubApplication,
  rejectClubApplication,
  type ClubAnnouncement,
  type CreateClubAnnouncementDto,
  type Club,
  uploadClubImage,
} from "@/lib/api/endpoints/clubs"

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

export default function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = use(params)
  const { toast } = useToast()

  // Fetch club data from API
  const { data: club, isLoading: loadingClub } = useClub(clubId)

  // Fetch club members and positions from API
  const { data: memberships = [], isLoading: loadingMembers } = useClubMemberships(clubId)
  const { data: positions = [] } = useClubPositions()
  const { updateMember, removeMember } = useClubMembershipMutations(clubId)

  // Club forms hooks
  const { data: forms, isLoading: formsLoading } = useClubForms(clubId)
  const activeForm = forms?.find((f) => f.isActive) || forms?.[0]

  // Club Benefits & FAQs API hooks
  const { data: apiBenefits = [], isLoading: benefitsLoading } = useClubBenefits(clubId)
  const { data: apiFaqs = [], isLoading: faqsLoading } = useClubFaqs(clubId)
  const createBenefit = useCreateClubBenefit()
  const updateBenefit = useUpdateClubBenefit()
  const deleteBenefit = useDeleteClubBenefit()
  const createFaq = useCreateClubFaq()
  const updateFaq = useUpdateClubFaq()
  const deleteFaq = useDeleteClubFaq()

  // Club update mutation
  const updateClubMutation = useUpdateClub(clubId)

  const {
    data: formData,
    isLoading: formLoading,
    refetch: refetchForm,
  } = useClubForm(clubId, activeForm?.id || '', !!activeForm?.id)
  const formMutations = useClubFormMutations(clubId)
  const {
    data: formResponses = [],
    isLoading: responsesLoading,
    refetch: refetchFormResponses,
  } = useFormResponses(clubId, activeForm?.id || '', !!activeForm?.id)
  const responseMutations = useFormResponseMutations(clubId, activeForm?.id || '')

  // Fetch events for this club
  const { data: eventsData, isLoading: loadingEvents } = useEventsByClubId(clubId)

  // Event mutations
  const archiveEventMutation = useArchiveEvent()

  // UI State
  const [activeSection, setActiveSection] = useState("overview")
  const [viewMode, setViewMode] = useState<"management" | "preview">("management")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")
  const [memberFilter, setMemberFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [membersPerPage] = useState(10)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  // Form state for club settings
  const [clubSettings, setClubSettings] = useState({
    name: '',
    description: '',
    mission_title: '',
    mission_description: '',
    mission_statement: '',
    email: '',
    championshipWins: 0,
    benefits_title: '',
    benefits_description: '',
    club_image: '',
    club_logo: '',
  })

  // Local editable state for benefits and FAQs
  const [localBenefits, setLocalBenefits] = useState<any[]>([])
  const [localFaqs, setLocalFaqs] = useState<any[]>([])

  // Update form state when club data loads
  useEffect(() => {
    if (club) {
      setClubSettings({
        name: club.name || '',
        description: club.description || '',
        mission_title: club.mission_title || '',
        mission_description: club.mission_description || '',
        mission_statement: club.mission_statement || '',
        email: club.email || '',
        championshipWins: club.championship_wins || 0,
        benefits_title: club.benefits_title || '',
        benefits_description: club.benefits_description || '',
        club_image: club.club_image || '',
        club_logo: club.club_logo || '',
      })
      setHasUnsavedChanges(false)
    }
  }, [club])

  // Sync local benefits when API data loads
  useEffect(() => {
    if (apiBenefits && apiBenefits.length > 0) {
      setLocalBenefits(JSON.parse(JSON.stringify(apiBenefits))) // Deep copy
    }
  }, [apiBenefits])

  // Sync local FAQs when API data loads
  useEffect(() => {
    if (apiFaqs && apiFaqs.length > 0) {
      setLocalFaqs(JSON.parse(JSON.stringify(apiFaqs))) // Deep copy
    }
  }, [apiFaqs])

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Use real events data from API
  const events = eventsData?.data || []

  // Calculate event statistics
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const totalEventsCount = events.length
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= now
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcomingEventsCount = upcomingEvents.length
  const nextEventDate = upcomingEvents.length > 0
    ? new Date(upcomingEvents[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'No upcoming events'
  const thisMonthEventsCount = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  }).length

  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)

  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [announcementPriority, setAnnouncementPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)
  const [showDeleteAnnouncementConfirmation, setShowDeleteAnnouncementConfirmation] = useState(false)
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false)
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(false)

  // Get pending applications from form responses
  const pendingApplications = formResponses.filter((r) => r.status === 'pending')

  // Transform form responses to match UI structure
  const pendingMembers = pendingApplications.map((app) => ({
    id: app.id,
    responseId: app.id, // Keep response ID for API calls
    name: app.user?.full_name || 'Unknown',
    email: app.user?.email || '',
    appliedDate: new Date(app.created_at).toLocaleDateString(),
    // Extract reason from answers if exists
    reason: app.answers?.find((a) => a.question?.question_text.toLowerCase().includes('why'))?.answer_text || 'No reason provided',
    // Keep full app data for detailed view
    fullApplication: app,
  }))

  const [selectedPendingMembers, setSelectedPendingMembers] = useState<string[]>([])
  const [bulkActionType, setBulkActionType] = useState<"approve" | "reject" | null>(null)
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false)

  const [pendingMemberToAction, setPendingMemberToAction] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [processingApplication, setProcessingApplication] = useState(false)

  // --- FIX START ---
  // Use API data for members instead of mock data
  const members = memberships.map((m) => ({
    id: m.id,
    name: `${m.student?.first_name || ''} ${m.student?.last_name || ''}`.trim(),
    grade: m.student?.grade_level || 'N/A',
    email: m.student?.user_id || '',
    role: m.position?.name || 'Member',
    attendance: 100, // TODO: Calculate actual attendance
    joinDate: m.joinedAt ? new Date(m.joinedAt).toISOString().split('T')[0] : 'N/A',
    student_id: m.studentId,
    position_id: m.positionId,
    membership_id: m.id,
  }))

  // Fetch club announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!clubId) return

      setLoadingAnnouncements(true)
      try {
        const data = await getClubAnnouncements(clubId)
        setAnnouncements(data)
      } catch (error) {
        console.error('Error fetching announcements:', error)
        toast({
          title: "Error",
          description: "Failed to load announcements. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingAnnouncements(false)
      }
    }

    fetchAnnouncements()
  }, [clubId, toast])

  const handleApproveMember = async (memberId: string) => {
    if (!activeForm?.id) {
      toast({
        title: "Error",
        description: "No active form found for this club",
        variant: "destructive",
      })
      return
    }

    const member = pendingMembers.find((m) => m.id === memberId)
    if (!member) return

    setProcessingApplication(true)
    try {
      await approveClubApplication(clubId, activeForm.id, memberId)

      toast({
        title: "Member Approved",
        description: `${member.name} has been approved to join the club.`,
      })

      // Refresh form responses to update the list
      // The useFormResponses hook will automatically update
      // No need to manually update state
    } catch (error) {
      console.error('Error approving member:', error)
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingApplication(false)
      setPendingMemberToAction(null)
      setActionType(null)
    }
  }
  // --- FIX END ---

  const handleRejectMember = async (memberId: string) => {
    if (!activeForm?.id) {
      toast({
        title: "Error",
        description: "No active form found for this club",
        variant: "destructive",
      })
      return
    }

    const member = pendingMembers.find((m) => m.id === memberId)
    if (!member) return

    setProcessingApplication(true)
    try {
      await rejectClubApplication(clubId, activeForm.id, memberId)

      toast({
        title: "Application Rejected",
        description: `${member.name}'s application has been rejected.`,
      })

      // Refresh form responses to update the list
      // The useFormResponses hook will automatically update
    } catch (error) {
      console.error('Error rejecting member:', error)
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingApplication(false)
      setPendingMemberToAction(null)
      setActionType(null)
    }
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

  const handleBulkApprove = async () => {
    if (!activeForm?.id) {
      toast({
        title: "Error",
        description: "No active form found for approving applications",
        variant: "destructive",
      })
      return
    }

    setProcessingApplication(true)

    try {
      // Call API for each selected application in parallel
      const approvePromises = selectedPendingMembers.map((memberId) =>
        approveClubApplication(clubId, activeForm.id, memberId)
          .catch((error) => ({ error: true, memberId }))
      )

      const results = await Promise.all(approvePromises)

      // Count successes and failures
      const failures = results.filter((r: any) => r.error)
      const successes = results.length - failures.length

      // Refetch to update UI
      await refetchFormResponses()

      if (failures.length === 0) {
        toast({
          title: "Members Approved",
          description: `${successes} member(s) have been added to the club.`,
        })
      } else {
        toast({
          title: "Partial Success",
          description: `${successes} approved, ${failures.length} failed.`,
          variant: "destructive",
        })
      }

      setSelectedPendingMembers([])
      setShowBulkConfirmation(false)
      setBulkActionType(null)
    } catch (error) {
      console.error('Bulk approve error:', error)
      toast({
        title: "Error",
        description: "Failed to approve applications",
        variant: "destructive",
      })
    } finally {
      setProcessingApplication(false)
    }
  }

  const handleBulkReject = async () => {
    if (!activeForm?.id) {
      toast({
        title: "Error",
        description: "No active form found for rejecting applications",
        variant: "destructive",
      })
      return
    }

    setProcessingApplication(true)

    try {
      const rejectedCount = selectedPendingMembers.length

      // Call API for each selected application in parallel
      const rejectPromises = selectedPendingMembers.map((memberId) =>
        rejectClubApplication(clubId, activeForm.id, memberId)
          .catch((error) => ({ error: true, memberId }))
      )

      const results = await Promise.all(rejectPromises)

      // Count successes and failures
      const failures = results.filter((r: any) => r.error)
      const successes = results.length - failures.length

      // Refetch to update UI
      await refetchFormResponses()

      if (failures.length === 0) {
        toast({
          title: "Applications Rejected",
          description: `${rejectedCount} application(s) have been rejected.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Partial Success",
          description: `${successes} rejected, ${failures.length} failed.`,
          variant: "destructive",
        })
      }

      setSelectedPendingMembers([])
      setShowBulkConfirmation(false)
      setBulkActionType(null)
    } catch (error) {
      console.error('Bulk reject error:', error)
      toast({
        title: "Error",
        description: "Failed to reject applications",
        variant: "destructive",
      })
    } finally {
      setProcessingApplication(false)
    }
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
    upcomingEvents: upcomingEventsCount, // Use real upcoming events count
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

  // Local state for form questions (synced with API data)
  const [customQuestions, setCustomQuestions] = useState<any[]>([])
  const [hasFormChanges, setHasFormChanges] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [showFormBuilder, setShowFormBuilder] = useState(false)

  // Sync form data from API to local state
  useEffect(() => {
    if (formData?.questions) {
      const mappedQuestions = formData.questions
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((q) => ({
          id: q.id,
          question: q.questionText,
          type: mapQuestionTypeToUI(q.questionType),
          required: q.required,
          order: q.orderIndex,
        }))
      setCustomQuestions(mappedQuestions)
      setHasFormChanges(false)
    }
  }, [formData])

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`, // Temporary ID until saved
      question: "",
      type: "short-text" as 'short-text' | 'long-text',
      required: false,
      order: customQuestions.length,
    }
    setCustomQuestions([...customQuestions, newQuestion])
    setEditingQuestion(newQuestion.id)
    setHasFormChanges(true)
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setCustomQuestions(customQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
    setHasFormChanges(true)
  }

  const deleteQuestion = async (id: string) => {
    // If it's a saved question (not temporary), delete from backend
    if (activeForm?.id && !id.startsWith('temp-')) {
      try {
        await formMutations.deleteQuestion.mutateAsync({
          formId: activeForm.id,
          questionId: id,
        })
      } catch (error) {
        console.error('Error deleting question:', error)
        return // Don't remove from local state if API call failed
      }
    }

    // Remove from local state
    setCustomQuestions(customQuestions.filter((q) => q.id !== id))
    setHasFormChanges(true)
  }

  const moveQuestionUp = (index: number) => {
    if (index === 0) return
    const newQuestions = [...customQuestions]
    ;[newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]]
    setCustomQuestions(newQuestions.map((q, i) => ({ ...q, order: i })))
    setHasFormChanges(true)
  }

  const moveQuestionDown = (index: number) => {
    if (index === customQuestions.length - 1) return
    const newQuestions = [...customQuestions]
    ;[newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]]
    setCustomQuestions(newQuestions.map((q, i) => ({ ...q, order: i })))
    setHasFormChanges(true)
  }

  const saveForm = async () => {
    try {
      let formId = activeForm?.id

      // If no form exists, create one first
      if (!formId) {
        const newForm = await formMutations.createForm.mutateAsync({
          name: 'Member Application Form',
          description: 'Application form for club membership',
          is_active: true,
          auto_approve: false,
        })
        formId = newForm.id
      }

      // Save all questions
      for (const [index, question] of customQuestions.entries()) {
        const questionData = {
          question_text: question.question,
          question_type: mapUITypeToBackend(question.type),
          required: question.required,
          order_index: index,
        }

        if (question.id.startsWith('temp-')) {
          // Add new question
          await formMutations.addQuestion.mutateAsync({
            formId,
            data: questionData,
          })
        } else {
          // Update existing question
          await formMutations.updateQuestion.mutateAsync({
            formId,
            questionId: question.id,
            data: questionData,
          })
        }
      }

      // Refetch form data to sync
      await refetchForm()
      setHasFormChanges(false)
      setShowFormBuilder(false)

      toast({
        title: 'Success',
        description: 'Form saved successfully',
      })
    } catch (error: any) {
      console.error('Error saving form:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save form',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    let hasError = false
    let savedCount = 0

    // Save club data
    try {
      await updateClubMutation.mutateAsync({
        name: clubSettings.name || null,
        description: clubSettings.description || null,
        mission_statement: clubSettings.mission_statement || null,
        email: clubSettings.email || null,
        championship_wins: clubSettings.championshipWins || 0,
        benefits_title: clubSettings.benefits_title || null,
        benefits_description: clubSettings.benefits_description || null,
        club_image: clubSettings.club_image || null,
        club_logo: clubSettings.club_logo || null,
      })
      savedCount++
    } catch (error: any) {
      hasError = true
      toast({
        title: "Error saving club data",
        description: error.message,
        variant: "destructive",
      })
    }

    // Save all benefits from LOCAL state
    for (const benefit of localBenefits) {
      try {
        await updateBenefit.mutateAsync({
          clubId,
          benefitId: benefit.id,
          data: {
            title: benefit.title,
            description: benefit.description,
          },
        })
        savedCount++
      } catch (error: any) {
        hasError = true
        toast({
          title: "Error saving benefit",
          description: `Failed to save "${benefit.title}": ${error.message}`,
          variant: "destructive",
        })
      }
    }

    // Save all FAQs from LOCAL state
    for (const faq of localFaqs) {
      try {
        await updateFaq.mutateAsync({
          clubId,
          faqId: faq.id,
          data: {
            question: faq.question,
            answer: faq.answer,
          },
        })
        savedCount++
      } catch (error: any) {
        hasError = true
        toast({
          title: "Error saving FAQ",
          description: `Failed to save FAQ: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    // Show final result
    if (!hasError) {
      toast({
        title: "Success!",
        description: `All settings saved successfully (${savedCount} items)`,
      })
      setHasUnsavedChanges(false)
    } else {
      toast({
        title: "Partially saved",
        description: `${savedCount} items saved, but some failed. Check errors above.`,
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    if (club) {
      setClubSettings({
        name: club.name || '',
        description: club.description || '',
        mission_title: club.mission_title || '',
        mission_description: club.mission_description || '',
        mission_statement: club.mission_statement || '',
        email: club.email || '',
        championshipWins: club.championship_wins || 0,
        benefits_title: club.benefits_title || '',
        benefits_description: club.benefits_description || '',
      })
      setHasUnsavedChanges(false)
      toast({
        title: "Reset",
        description: "All changes have been reset",
      })
    }
  }

  const confirmSave = async () => {
    if (!club) return
    
    try {
      await updateClub(clubId, {
        name: clubSettings.name,
        description: clubSettings.description,
        mission_title: clubSettings.mission_title,
        mission_description: clubSettings.mission_description,
        mission_statement: clubSettings.mission_statement,
      })

      toast({
        title: "Settings Saved",
        description: "Club settings have been updated successfully.",
      })
      
      setShowSaveConfirmation(false)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving club settings:', error)
      toast({
        title: "Error",
        description: "Failed to save club settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId)
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteEvent = async () => {
    if (eventToDelete === null) return

    try {
      await archiveEventMutation.mutateAsync(eventToDelete)
      // Success toast is already shown by the mutation hook
      setShowDeleteConfirmation(false)
      setEventToDelete(null)
    } catch (error: any) {
      // Error toast is already shown by the mutation hook
      // Just close the dialog
      setShowDeleteConfirmation(false)
      setEventToDelete(null)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      })
      return
    }

    setCreatingAnnouncement(true)
    try {
      const newAnnouncementData: CreateClubAnnouncementDto = {
        club_id: clubId,
        title: announcementTitle,
        content: announcementContent,
        priority: announcementPriority,
      }

      const createdAnnouncement = await createClubAnnouncement(newAnnouncementData)
      setAnnouncements([createdAnnouncement, ...announcements])

      toast({
        title: "Announcement Created",
        description: "Your announcement has been posted successfully.",
      })

      // Reset form
      setAnnouncementTitle("")
      setAnnouncementContent("")
      setAnnouncementPriority("normal")
      setShowCreateAnnouncement(false)
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreatingAnnouncement(false)
    }
  }

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncementToDelete(id)
    setShowDeleteAnnouncementConfirmation(true)
  }

  const confirmDeleteAnnouncement = async () => {
    if (announcementToDelete === null) return

    setDeletingAnnouncement(true)
    try {
      await deleteClubAnnouncement(announcementToDelete)
      setAnnouncements(announcements.filter((announcement) => announcement.id !== announcementToDelete))

      toast({
        title: "Announcement Deleted",
        description: "The announcement has been successfully deleted.",
      })

      setShowDeleteAnnouncementConfirmation(false)
      setAnnouncementToDelete(null)
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingAnnouncement(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const handleDeleteMember = async () => {
    if (memberToDelete) {
      try {
        // Use the removeMember mutation from the hook
        await removeMember.mutateAsync(memberToDelete.membership_id)
      } catch (error) {
        // Error is already handled by the mutation hook with toast
        // Just log it silently
        console.error('Error removing member:', error)
      } finally {
        // Always close the dialog, even if there's an error
        setShowDeleteConfirm(false)
        setMemberToDelete(null)
      }
    }
  }

  // Handle position change for a member
  const handlePositionChange = async (membershipId: string, newPositionId: string) => {
    try {
      await updateMember.mutateAsync({
        membershipId,
        data: { positionId: newPositionId },
      })
    } catch (error) {
      console.error('Error updating member position:', error)
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {loadingClub ? 'Loading...' : club?.name || 'Club'}
                  </h1>
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
                            <p className="text-orange-200 text-xs mt-1">Next: {nextEventDate}</p>
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
                                disabled={processingApplication}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
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
                                disabled={processingApplication}
                                variant="outline"
                                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject Selected
                              </Button>
                              <Button
                                onClick={() => setSelectedPendingMembers([])}
                                disabled={processingApplication}
                                variant="ghost"
                                size="sm"
                              >
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
                                  disabled={processingApplication}
                                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
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
                                  disabled={processingApplication}
                                  variant="outline"
                                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
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
                            onClick={() => setShowAddMemberDialog(true)}
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
                          {loadingMembers ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
                                  <span className="text-gray-600 dark:text-gray-400">Loading members...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : currentMembers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No members found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentMembers.map((member) => (
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
                                  value={member.position_id}
                                  onValueChange={(value) => handlePositionChange(member.membership_id, value)}
                                  disabled={updateMember.isPending}
                                >
                                  <SelectTrigger className="w-40 h-9 dark:bg-slate-800 dark:border-slate-600">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                                    {positions.map((position) => (
                                      <SelectItem key={position.id} value={position.id}>
                                        {position.name}
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
                          ))
                          )}
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
                      <Link href={`/teacher/clubs/${clubId}/events/create`}>
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
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEventsCount}</p>
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
                            <p className="text-2xl font-bold text-green-600">{upcomingEventsCount}</p>
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
                            <p className="text-2xl font-bold text-orange-600">{thisMonthEventsCount}</p>
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
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-4 px-4">
                                    <Badge
                                      variant={event.status === "published" ? "default" : "secondary"}
                                      className={
                                        event.status === "published"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {event.status}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex gap-2">
                                      <Link href={`/teacher/clubs/${clubId}/events/edit/${event.id}`}>
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
                            href={`/teacher/clubs/${clubId}/events/create?template=${template.name.toLowerCase()}`}
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
                      {loadingAnnouncements ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 animate-spin" />
                          <p className="text-gray-600 dark:text-gray-400">Loading announcements...</p>
                        </div>
                      ) : announcements.length === 0 ? (
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
                                      {new Date(announcement.created_at).toLocaleDateString()}
                                    </span>
                                    {announcement.author && (
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        by {announcement.author.full_name}
                                      </span>
                                    )}
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
                      {/* Club Background Image Upload */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Club Header Background</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          This image will be displayed as the full background in the club header.
                        </p>
                        <ClubImageUpload
                          clubId={clubId}
                          inputId="club-background-input"
                          currentImage={clubSettings.club_image}
                          onImageUploaded={(url) => {
                            setClubSettings(prev => ({ ...prev, club_image: url }))
                            setHasUnsavedChanges(true)
                            toast({
                              title: "Background image uploaded!",
                              description: "Don't forget to click 'Save All Settings' to save changes.",
                            })
                          }}
                        />
                      </div>

                      {/* Club Logo Upload */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Club Logo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          This logo will be displayed next to the club name in the header.
                        </p>
                        <ClubImageUpload
                          clubId={clubId}
                          inputId="club-logo-input"
                          currentImage={clubSettings.club_logo}
                          onImageUploaded={(url) => {
                            setClubSettings(prev => ({ ...prev, club_logo: url }))
                            setHasUnsavedChanges(true)
                            toast({
                              title: "Logo uploaded!",
                              description: "Don't forget to click 'Save All Settings' to save changes.",
                            })
                          }}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="clubName" className="text-gray-700 dark:text-gray-300 font-medium">
                            Club Name
                          </Label>
                          <Input
                            id="clubName"
                            value={clubSettings.name}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, name: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
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
                            value={memberships?.length || 0}
                            disabled
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
                            value={clubSettings.email}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, email: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
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
                            value={clubSettings.championshipWins}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, championshipWins: parseInt(e.target.value) || 0 }))
                              setHasUnsavedChanges(true)
                            }}
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
                          value={clubSettings.description}
                          onChange={(e) => {
                            setClubSettings(prev => ({ ...prev, description: e.target.value }))
                            setHasUnsavedChanges(true)
                          }}
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
                          value={clubSettings.mission_description}
                          onChange={(e) => {
                            setClubSettings(prev => ({ ...prev, mission_description: e.target.value }))
                            setHasUnsavedChanges(true)
                          }}
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
                            value={clubSettings.mission_title}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, mission_title: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="missionDescription" className="text-gray-700 dark:text-gray-300 font-medium">
                            Mission Description
                          </Label>
                          <Input
                            id="missionDescription"
                            value={clubSettings.mission_statement}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, mission_statement: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
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

                      {/* Save Button */}
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={handleSave}
                          disabled={!hasUnsavedChanges}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
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
                            value={clubSettings.benefits_title}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, benefits_title: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                            placeholder="Why Join Our Club?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="benefitsDescription" className="text-gray-700 dark:text-gray-300 font-medium">
                            Benefits Description
                          </Label>
                          <Input
                            id="benefitsDescription"
                            value={clubSettings.benefits_description}
                            onChange={(e) => {
                              setClubSettings(prev => ({ ...prev, benefits_description: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="mt-2 dark:bg-slate-800 dark:border-slate-600"
                            placeholder="Discover the amazing benefits of being part of our community"
                          />
                        </div>
                      </div>

                      {/* Individual Benefits with Add/Edit/Delete */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            Membership Benefits
                          </Label>
                          <Button
                            onClick={() => {
                              createBenefit.mutate(
                                {
                                  clubId,
                                  data: {
                                    title: "New Benefit",
                                    description: "Describe this benefit here",
                                    order_index: apiBenefits.length,
                                  },
                                },
                                {
                                  onSuccess: () => {
                                    toast({
                                      title: "Success!",
                                      description: "Benefit added successfully",
                                    })
                                  },
                                  onError: (error: any) => {
                                    toast({
                                      title: "Error",
                                      description: `Failed to add benefit: ${error.message}`,
                                      variant: "destructive",
                                    })
                                  },
                                }
                              )
                            }}
                            disabled={createBenefit.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {createBenefit.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Benefit
                              </>
                            )}
                          </Button>
                        </div>

                        {benefitsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                            <span className="ml-2 text-gray-600">Loading benefits...</span>
                          </div>
                        ) : (
                          <>
                            {localBenefits.map((benefit, index) => (
                              <BenefitCardItem
                                key={benefit.id}
                                benefit={benefit}
                                index={index}
                                clubId={clubId}
                                localBenefits={localBenefits}
                                setLocalBenefits={setLocalBenefits}
                                deleteBenefit={deleteBenefit}
                                toast={toast}
                              />
                            ))}

                            {localBenefits.length === 0 && (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No benefits added yet. Click "Add Benefit" to get started.
                                </p>
                              </div>
                            )}
                          </>
                        )}
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
                            createFaq.mutate(
                              {
                                clubId,
                                data: {
                                  question: "New Question?",
                                  answer: "Answer here...",
                                  order_index: apiFaqs.length,
                                },
                              },
                              {
                                onSuccess: () => {
                                  toast({
                                    title: "Success!",
                                    description: "FAQ added successfully",
                                  })
                                },
                                onError: (error: any) => {
                                  toast({
                                    title: "Error",
                                    description: `Failed to add FAQ: ${error.message}`,
                                    variant: "destructive",
                                  })
                                },
                              }
                            )
                          }}
                          disabled={createFaq.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {createFaq.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add FAQ
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {faqsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                          <span className="ml-2 text-gray-600">Loading FAQs...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {localFaqs.map((faq, index) => (
                            <FaqCardItem
                              key={faq.id}
                              faq={faq}
                              index={index}
                              clubId={clubId}
                              localFaqs={localFaqs}
                              setLocalFaqs={setLocalFaqs}
                              deleteFaq={deleteFaq}
                              toast={toast}
                            />
                          ))}

                          {localFaqs.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                              <p className="text-gray-500 dark:text-gray-400">
                                No FAQs added yet. Click "Add FAQ" to get started.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Save Settings Button */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasUnsavedChanges}
                      className="border-gray-300 dark:border-slate-600 bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Changes
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasUnsavedChanges || updateClubMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {updateClubMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save All Settings
                        </>
                      )}
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
                              {formResponses.length}
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
                              {formResponses.filter((r) => r.status === "pending").length}
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
                              {formResponses.filter((r) => r.status === "approved").length}
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
                              {formResponses.filter((r) => r.status === "rejected").length}
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
                          {formResponses.filter((r) => r.status === "pending").length} Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {formResponses
                          .filter((r) => r.status === "pending")
                          .map((application) => (
                            <Card
                              key={application.id}
                              className="border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                      {(application.user?.full_name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {application.user?.full_name || 'Unknown Student'}
                                      </h3>
                                      <div className="flex items-center gap-3 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {application.user?.email || 'No email'}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Applied: {new Date(application.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                </div>

                                {/* Application Answers */}
                                <div className="space-y-3 mb-4">
                                  {application.answers?.map((answer) => (
                                    <div key={answer.id}>
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        {answer.question?.question_text || 'Question'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                        {answer.answer_text || answer.answer_value || 'No answer provided'}
                                      </p>
                                    </div>
                                  ))}
                                  {(!application.answers || application.answers.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                      No answers provided
                                    </p>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700">
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={async () => {
                                      if (!activeForm?.id) return
                                      setProcessingApplication(true)
                                      try {
                                        await responseMutations.reviewResponse.mutateAsync({
                                          responseId: application.id,
                                          data: {
                                            status: 'approved',
                                            review_notes: 'Approved by teacher',
                                          },
                                        })
                                      } catch (error) {
                                        console.error('Error approving:', error)
                                      } finally {
                                        setProcessingApplication(false)
                                      }
                                    }}
                                    disabled={processingApplication}
                                  >
                                    {processingApplication ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                                    onClick={async () => {
                                      if (!activeForm?.id) return
                                      setProcessingApplication(true)
                                      try {
                                        await responseMutations.reviewResponse.mutateAsync({
                                          responseId: application.id,
                                          data: {
                                            status: 'rejected',
                                            review_notes: 'Rejected by teacher',
                                          },
                                        })
                                      } catch (error) {
                                        console.error('Error rejecting:', error)
                                      } finally {
                                        setProcessingApplication(false)
                                      }
                                    }}
                                    disabled={processingApplication}
                                  >
                                    {processingApplication ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                        {formResponses.filter((r) => r.status === "pending").length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                              No Pending Applications
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center">All applications have been reviewed.</p>
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
                        {formResponses
                          .filter((r) => r.status !== "pending")
                          .map((application) => (
                            <div
                              key={application.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {(application.user?.full_name || 'U').charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {application.user?.full_name || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Applied {new Date(application.created_at).toLocaleDateString()}
                                    {application.reviewed_at && ` • Reviewed ${new Date(application.reviewed_at).toLocaleDateString()}`}
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateAnnouncement}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={creatingAnnouncement}
              >
                {creatingAnnouncement ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Announcement
                  </>
                )}
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
                disabled={creatingAnnouncement}
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
            <AlertDialogCancel
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              disabled={deletingAnnouncement}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAnnouncement}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deletingAnnouncement}
            >
              {deletingAnnouncement ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Announcement"
              )}
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

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
        clubId={clubId}
        currentMembers={memberships}
      />
    </div>
  )
}

// ========================================
// BENEFIT CARD ITEM COMPONENT
// ========================================
interface BenefitCardItemProps {
  benefit: any
  index: number
  clubId: string
  localBenefits: any[]
  setLocalBenefits: (benefits: any[]) => void
  deleteBenefit: any
  toast: any
}

function BenefitCardItem({ benefit, index, clubId, localBenefits, setLocalBenefits, deleteBenefit, toast }: BenefitCardItemProps) {
  // Update benefit data in local state
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedBenefits = [...localBenefits]
    updatedBenefits[index] = { ...updatedBenefits[index], title: e.target.value }
    setLocalBenefits(updatedBenefits)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedBenefits = [...localBenefits]
    updatedBenefits[index] = { ...updatedBenefits[index], description: e.target.value }
    setLocalBenefits(updatedBenefits)
  }

  const handleDelete = () => {
    if (confirm('Delete this benefit?')) {
      deleteBenefit.mutate(
        { clubId, benefitId: benefit.id },
        {
          onSuccess: () => {
            toast({
              title: "Deleted",
              description: "Benefit removed successfully",
            })
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to delete benefit: ${error.message}`,
              variant: "destructive",
            })
          },
        }
      )
    }
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Benefit {index + 1}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={deleteBenefit.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {deleteBenefit.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Title</Label>
          <Input
            value={benefit.title}
            onChange={handleTitleChange}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter benefit title"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Description</Label>
          <Textarea
            value={benefit.description}
            onChange={handleDescriptionChange}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter benefit description"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}

// ========================================
// FAQ CARD ITEM COMPONENT
// ========================================
interface FaqCardItemProps {
  faq: any
  index: number
  clubId: string
  localFaqs: any[]
  setLocalFaqs: (faqs: any[]) => void
  deleteFaq: any
  toast: any
}

function FaqCardItem({ faq, index, clubId, localFaqs, setLocalFaqs, deleteFaq, toast }: FaqCardItemProps) {
  // Update FAQ data in local state
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFaqs = [...localFaqs]
    updatedFaqs[index] = { ...updatedFaqs[index], question: e.target.value }
    setLocalFaqs(updatedFaqs)
  }

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedFaqs = [...localFaqs]
    updatedFaqs[index] = { ...updatedFaqs[index], answer: e.target.value }
    setLocalFaqs(updatedFaqs)
  }

  const handleDelete = () => {
    if (confirm('Delete this FAQ?')) {
      deleteFaq.mutate(
        { clubId, faqId: faq.id },
        {
          onSuccess: () => {
            toast({
              title: "Deleted",
              description: "FAQ removed successfully",
            })
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: `Failed to delete FAQ: ${error.message}`,
              variant: "destructive",
            })
          },
        }
      )
    }
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">FAQ {index + 1}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={deleteFaq.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {deleteFaq.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Question</Label>
          <Input
            value={faq.question}
            onChange={handleQuestionChange}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter question"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Answer</Label>
          <Textarea
            value={faq.answer}
            onChange={handleAnswerChange}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter answer"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

// ========================================
// CLUB IMAGE UPLOAD COMPONENT
// ========================================
interface ClubImageUploadProps {
  clubId: string
  currentImage?: string
  onImageUploaded: (url: string) => void
  inputId?: string // Unique ID for the file input to avoid conflicts
}

function ClubImageUpload({ clubId, currentImage, onImageUploaded, inputId = 'club-image-input' }: ClubImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage || null)
  }, [currentImage])

  const selectFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Save file and show preview
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      console.log("📤 Uploading club image to Cloudflare...")
      const result = await uploadClubImage(selectedFile)
      console.log("✅ Cloudflare upload response:", result)

      // Update with Cloudflare Images URL
      onImageUploaded(result.url || result.cf_image_url)
      setSelectedFile(null)

      toast({
        title: "Success!",
        description: "Club image uploaded to cloud storage",
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      selectFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      selectFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    toast({
      title: "Image removed",
      description: "Club image has been removed",
    })
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
            : 'border-gray-300 dark:border-slate-600 hover:border-blue-400'
        }`}
      >
        {preview ? (
          // Preview mode with image
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Club logo preview"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id={inputId}
                disabled={uploading}
              />
              <Button
                type="button"
                onClick={() => document.getElementById(inputId)?.click()}
                disabled={uploading}
                variant="secondary"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                variant="destructive"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          // Upload mode
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center p-12 cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={inputId}
              disabled={uploading}
            />
            <div
              className={`transition-all duration-300 ${
                isDragging ? 'scale-110 text-blue-500' : 'text-gray-400'
              }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4" />
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isDragging ? 'Drop image here' : 'Click to select image or drag and drop'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </label>
        )}
      </div>

      {/* Upload button - shows when file is selected but not uploaded yet */}
      {selectedFile && (
        <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              {preview && <img src={preview} alt="Selected" className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={uploadFile}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading to Cloud...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to Cloud Storage
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
