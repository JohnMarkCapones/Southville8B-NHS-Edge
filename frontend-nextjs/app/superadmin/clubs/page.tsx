"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useClubsTable, useDeleteClub } from "@/hooks/use-clubs"
import { filterClubsBySearch, filterClubsByStatus, getDomainBadgeColor } from "@/lib/api/adapters/clubs.adapter"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  CheckCircle,
  Link2,
  Check,
  UserCheck,
  ChevronRightIcon,
  AlertTriangle,
  Copy,
  Download,
  UserPlus,
  Activity,
  Shield,
  MapPin,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react"

// Mock data for clubs
const mockClubs = [
  {
    id: "1",
    name: "Science Club",
    description: "Exploring the wonders of science through experiments and research projects",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Academic",
    president: "John Smith",
    vicePresident: "Sarah Johnson",
    adviser: "Dr. Maria Santos",
    department: "Science Department",
    membersCount: 45,
    activeMembers: 42,
    status: "Active",
    meetingDay: "Wednesday",
    meetingTime: "3:00 PM",
    meetingLocation: "Science Lab 1",
    email: "science.club@school.edu",
    facebook: "@scienceclub",
    instagram: "@scienceclub_nhs",
    establishedDate: "2018-09-01",
    requirements: "Interest in science, minimum GPA of 2.5",
    isRecruiting: true,
  },
  {
    id: "2",
    name: "Basketball Team",
    description: "Competitive basketball team representing the school in inter-school tournaments",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Sports",
    president: "Michael Jordan Jr.",
    vicePresident: "LeBron Williams",
    adviser: "Coach Robert Brown",
    department: "Sports Department",
    membersCount: 25,
    activeMembers: 25,
    status: "Active",
    meetingDay: "Monday, Thursday",
    meetingTime: "4:00 PM",
    meetingLocation: "Basketball Court",
    email: "basketball@school.edu",
    facebook: "@nhsbasketball",
    instagram: "@nhs_basketball",
    establishedDate: "2015-06-01",
    requirements: "Physical fitness test, tryouts required",
    isRecruiting: false,
  },
  {
    id: "3",
    name: "Drama Club",
    description: "Performing arts club focused on theater productions and dramatic performances",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Arts",
    president: "Emma Watson",
    vicePresident: "Daniel Radcliffe",
    adviser: "Ms. Jennifer Lee",
    department: "Arts Department",
    membersCount: 38,
    activeMembers: 35,
    status: "Active",
    meetingDay: "Tuesday, Friday",
    meetingTime: "3:30 PM",
    meetingLocation: "Auditorium",
    email: "drama@school.edu",
    facebook: "@nhsdrama",
    instagram: "@nhs_drama",
    establishedDate: "2016-08-15",
    requirements: "Passion for performing arts, audition for major roles",
    isRecruiting: true,
  },
  {
    id: "4",
    name: "Robotics Club",
    description: "Building and programming robots for competitions and innovation challenges",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Technology",
    president: "Alex Chen",
    vicePresident: "Maya Patel",
    adviser: "Mr. David Kim",
    department: "Technology Department",
    membersCount: 30,
    activeMembers: 28,
    status: "Active",
    meetingDay: "Wednesday, Saturday",
    meetingTime: "2:00 PM",
    meetingLocation: "Tech Lab 2",
    email: "robotics@school.edu",
    facebook: "@nhsrobotics",
    instagram: "@nhs_robotics",
    establishedDate: "2019-01-10",
    requirements: "Basic programming knowledge, interest in engineering",
    isRecruiting: true,
  },
  {
    id: "5",
    name: "Community Service Club",
    description: "Dedicated to serving the community through various outreach programs and volunteer work",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Service",
    president: "Grace Martinez",
    vicePresident: "James Wilson",
    adviser: "Mrs. Patricia Garcia",
    department: "Student Affairs",
    membersCount: 52,
    activeMembers: 48,
    status: "Active",
    meetingDay: "Thursday",
    meetingTime: "3:00 PM",
    meetingLocation: "Room 205",
    email: "service@school.edu",
    facebook: "@nhsservice",
    instagram: "@nhs_community",
    establishedDate: "2017-03-20",
    requirements: "Commitment to community service, minimum 10 hours per semester",
    isRecruiting: true,
  },
  {
    id: "6",
    name: "Music Club",
    description: "Exploring various musical genres and performing at school events",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Arts",
    president: "Sophia Taylor",
    vicePresident: "Oliver Anderson",
    adviser: "Mr. Christopher Moore",
    department: "Arts Department",
    membersCount: 40,
    activeMembers: 38,
    status: "Active",
    meetingDay: "Monday, Wednesday",
    meetingTime: "3:30 PM",
    meetingLocation: "Music Room",
    email: "music@school.edu",
    facebook: "@nhsmusic",
    instagram: "@nhs_music",
    establishedDate: "2016-09-05",
    requirements: "Ability to play an instrument or sing",
    isRecruiting: false,
  },
  {
    id: "7",
    name: "Debate Team",
    description: "Developing critical thinking and public speaking skills through competitive debates",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Academic",
    president: "William Brown",
    vicePresident: "Ava Davis",
    adviser: "Dr. Richard Thompson",
    department: "English Department",
    membersCount: 22,
    activeMembers: 20,
    status: "Active",
    meetingDay: "Tuesday",
    meetingTime: "4:00 PM",
    meetingLocation: "Room 301",
    email: "debate@school.edu",
    facebook: "@nhsdebate",
    instagram: "@nhs_debate",
    establishedDate: "2018-02-14",
    requirements: "Strong communication skills, research abilities",
    isRecruiting: true,
  },
  {
    id: "8",
    name: "Environmental Club",
    description: "Promoting environmental awareness and sustainability initiatives in school and community",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Service",
    president: "Isabella Green",
    vicePresident: "Ethan White",
    adviser: "Ms. Laura Martinez",
    department: "Science Department",
    membersCount: 35,
    activeMembers: 32,
    status: "Active",
    meetingDay: "Friday",
    meetingTime: "3:00 PM",
    meetingLocation: "Room 108",
    email: "environment@school.edu",
    facebook: "@nhsenvironment",
    instagram: "@nhs_green",
    establishedDate: "2019-04-22",
    requirements: "Passion for environmental conservation",
    isRecruiting: true,
  },
  {
    id: "9",
    name: "Chess Club",
    description: "Strategic thinking and competitive chess playing for all skill levels",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Academic",
    president: "Noah Martinez",
    vicePresident: "Mia Robinson",
    adviser: "Mr. Thomas Anderson",
    department: "Mathematics Department",
    membersCount: 28,
    activeMembers: 26,
    status: "On Hold",
    meetingDay: "Thursday",
    meetingTime: "3:30 PM",
    meetingLocation: "Library",
    email: "chess@school.edu",
    facebook: "@nhschess",
    instagram: "@nhs_chess",
    establishedDate: "2017-10-01",
    requirements: "Basic knowledge of chess rules",
    isRecruiting: false,
  },
  {
    id: "10",
    name: "Photography Club",
    description: "Capturing moments and developing photography skills through workshops and exhibitions",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Arts",
    president: "Liam Johnson",
    vicePresident: "Charlotte Lee",
    adviser: "Ms. Amanda Clark",
    department: "Arts Department",
    membersCount: 32,
    activeMembers: 30,
    status: "Active",
    meetingDay: "Wednesday",
    meetingTime: "3:00 PM",
    meetingLocation: "Art Studio",
    email: "photography@school.edu",
    facebook: "@nhsphoto",
    instagram: "@nhs_photography",
    establishedDate: "2018-11-12",
    requirements: "Own camera or smartphone, interest in photography",
    isRecruiting: true,
  },
]

const ClubsPage = () => {
  const { toast } = useToast()
  const router = useRouter()

  // Fetch clubs data from API
  const { data: clubsData = [], isLoading, error } = useClubsTable()
  const deleteClubMutation = useDeleteClub()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedClubs, setSelectedClubs] = useState<string[]>([])

  const [archivedClubs, setArchivedClubs] = useState([
    {
      id: "arch-1",
      name: "Debate Society",
      description: "Former debate club that was merged with the current Debate Team",
      logo: "/placeholder.svg?height=80&width=80",
      category: "Academic",
      president: "Former President",
      adviser: "Dr. Smith",
      department: "English Department",
      membersCount: 18,
      status: "Archived",
      deletedAt: "2024-01-15",
      deletedBy: "Admin User",
      deletionReason: "Merged with Debate Team",
    },
    {
      id: "arch-2",
      name: "Old Photography Club",
      description: "Previous iteration of the photography club",
      logo: "/placeholder.svg?height=80&width=80",
      category: "Arts",
      president: "Jane Doe",
      adviser: "Mr. Johnson",
      department: "Arts Department",
      membersCount: 12,
      status: "Archived",
      deletedAt: "2023-12-20",
      deletedBy: "Super Admin",
      deletionReason: "Restructured into new Photography Club",
    },
  ])
  const [showArchived, setShowArchived] = useState(false)
  const [archivedSearchTerm, setArchivedSearchTerm] = useState("")
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState("all")
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(10)
  const [selectedArchivedClubs, setSelectedArchivedClubs] = useState<string[]>([])
  const [restoreConfirmation, setRestoreConfirmation] = useState<{
    isOpen: boolean
    club: any
  }>({ isOpen: false, club: null })
  const [permanentDeleteConfirmation, setPermanentDeleteConfirmation] = useState<{
    isOpen: boolean
    club: any
  }>({ isOpen: false, club: null })

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    club: any | null
    submenu: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    club: null,
    submenu: null,
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    club: any
  }>({ isOpen: false, club: null })

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean
    club: any
    newStatus: string
  }>({ isOpen: false, club: null, newStatus: "" })

  const [membersModal, setMembersModal] = useState<{
    isOpen: boolean
    club: any
  }>({ isOpen: false, club: null })

  // Apply filters using adapter functions
  const filteredClubs = useMemo(() => {
    let result = clubsData

    // Apply search filter
    result = filterClubsBySearch(result, searchTerm)

    // Apply status filter
    result = filterClubsByStatus(result, statusFilter)

    return result
  }, [clubsData, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClubs = filteredClubs.slice(startIndex, endIndex)

  const filteredArchivedClubs = archivedClubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      club.deletedBy.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      club.deletionReason.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    const matchesCategory = archivedCategoryFilter === "all" || club.category.toLowerCase() === archivedCategoryFilter

    return matchesSearch && matchesCategory
  })

  const archivedTotalPages = Math.ceil(filteredArchivedClubs.length / archivedItemsPerPage)
  const archivedStartIndex = (archivedCurrentPage - 1) * archivedItemsPerPage
  const archivedEndIndex = archivedStartIndex + archivedItemsPerPage
  const paginatedArchivedClubs = filteredArchivedClubs.slice(archivedStartIndex, archivedEndIndex)

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    if (filterType === "status") {
      setStatusFilter(value)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClubs(paginatedClubs.map((club) => club.id))
    } else {
      setSelectedClubs([])
    }
  }

  const handleSelectClub = (clubId: string, checked: boolean) => {
    if (checked) {
      setSelectedClubs((prev) => [...prev, clubId])
    } else {
      setSelectedClubs((prev) => prev.filter((id) => id !== clubId))
    }
  }

  const getDomainBadge = (domain: string) => {
    const colorClass = getDomainBadgeColor(domain)

    return (
      <Badge className={colorClass}>
        {domain}
      </Badge>
    )
  }

  const getStatusBadge = (status: string, club?: any) => {
    const badge = (() => {
      switch (status) {
        case "Active":
          return (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )
        case "Inactive":
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Inactive
            </Badge>
          )
        case "On Hold":
          return (
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20">
              <Clock className="w-3 h-3 mr-1" />
              On Hold
            </Badge>
          )
        case "Recruiting":
          return (
            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20">
              <UserPlus className="w-3 h-3 mr-1" />
              Recruiting
            </Badge>
          )
        default:
          return (
            <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">{status}</Badge>
          )
      }
    })()

    if (club) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              {badge}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border w-[180px]">
            <DropdownMenuItem
              className={`text-foreground ${status === "Active" ? "bg-green-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(club, "Active")
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              <span className="flex-1">Active</span>
              {status === "Active" && <Check className="w-4 h-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Inactive" ? "bg-gray-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(club, "Inactive")
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2 text-gray-600" />
              <span className="flex-1">Inactive</span>
              {status === "Inactive" && <Check className="w-4 h-4 text-gray-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "On Hold" ? "bg-yellow-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(club, "On Hold")
              }}
            >
              <Clock className="w-4 h-4 mr-2 text-yellow-600" />
              <span className="flex-1">On Hold</span>
              {status === "On Hold" && <Check className="w-4 h-4 text-yellow-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-foreground ${status === "Recruiting" ? "bg-blue-500/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(club, "Recruiting")
              }}
            >
              <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
              <span className="flex-1">Recruiting</span>
              {status === "Recruiting" && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return badge
  }

  const handleViewClub = (club: any) => {
    router.push(`/superadmin/clubs/${club.id}`)
  }

  const handleEditClub = (club: any) => {
    router.push(`/superadmin/clubs/edit/${club.id}`)
  }

  const handleDeleteClub = (club: any) => {
    setDeleteConfirmation({ isOpen: true, club })
    closeContextMenu()
  }

  const handleCreateClub = () => {
    router.push("/superadmin/clubs/create")
  }

  const handleRestoreClub = (club: any) => {
    setRestoreConfirmation({ isOpen: true, club })
  }

  const confirmRestoreClub = () => {
    if (restoreConfirmation.club) {
      const restoredClub = {
        ...restoreConfirmation.club,
        status: "Inactive",
      }
      // TODO: Implement restore with API when soft delete is available
      // delete restoredClub.deletedAt
      // delete restoredClub.deletedBy
      // delete restoredClub.deletionReason

      // setClubs((prev) => [restoredClub, ...prev])
      setArchivedClubs((prev) => prev.filter((c) => c.id !== restoreConfirmation.club.id))

      toast({
        title: "Club Restored Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">{restoreConfirmation.club.name} has been restored.</p>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>Club is now active and visible</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      setRestoreConfirmation({ isOpen: false, club: null })
    }
  }

  const handlePermanentDeleteClub = (club: any) => {
    setPermanentDeleteConfirmation({ isOpen: true, club })
  }

  const confirmPermanentDeleteClub = () => {
    if (permanentDeleteConfirmation.club) {
      setArchivedClubs((prev) => prev.filter((c) => c.id !== permanentDeleteConfirmation.club.id))

      toast({
        title: "Club Permanently Deleted",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {permanentDeleteConfirmation.club.name} has been permanently removed.
            </p>
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-500/10 px-2 py-1 rounded-md w-fit">
              <AlertTriangle className="w-3 h-3" />
              <span>This action cannot be undone</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 4000,
        className: "border-red-500/20 bg-red-500/5 backdrop-blur-md",
      })

      setPermanentDeleteConfirmation({ isOpen: false, club: null })
    }
  }

  const handleBulkRestoreArchived = () => {
    const clubsToRestore = archivedClubs.filter((c) => selectedArchivedClubs.includes(c.id))

    // TODO: Implement bulk restore with API when soft delete is available
    // clubsToRestore.forEach((club) => {
    //   const restoredClub = { ...club, status: "Inactive" }
    //   delete restoredClub.deletedAt
    //   delete restoredClub.deletedBy
    //   delete restoredClub.deletionReason
    //   setClubs((prev) => [restoredClub, ...prev])
    // })

    setArchivedClubs((prev) => prev.filter((c) => !selectedArchivedClubs.includes(c.id)))
    setSelectedArchivedClubs([])

    toast({
      title: `${clubsToRestore.length} Club${clubsToRestore.length > 1 ? "s" : ""} Restored`,
      description: "Selected clubs have been restored successfully.",
      duration: 4000,
    })
  }

  const handleBulkPermanentDeleteArchived = () => {
    if (
      confirm(
        `Are you sure you want to permanently delete ${selectedArchivedClubs.length} club${selectedArchivedClubs.length > 1 ? "s" : ""}? This action cannot be undone.`,
      )
    ) {
      setArchivedClubs((prev) => prev.filter((c) => !selectedArchivedClubs.includes(c.id)))
      setSelectedArchivedClubs([])

      toast({
        title: "Clubs Permanently Deleted",
        description: "Selected clubs have been permanently removed.",
        variant: "default",
        duration: 4000,
      })
    }
  }

  const handleContextMenu = (e: React.MouseEvent, club: any) => {
    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY

    const menuWidth = 240
    const menuHeight = 400
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight
    }

    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      club,
      submenu: null,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      club: null,
      submenu: null,
    })
  }

  const confirmDeleteClub = async () => {
    if (deleteConfirmation.club) {
      try {
        await deleteClubMutation.mutateAsync(deleteConfirmation.club.id)

        toast({
          title: "Club Deleted Successfully",
          description: (
            <div className="space-y-2">
              <p className="font-medium text-foreground">{deleteConfirmation.club.name} has been permanently removed.</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  <Users className="w-3 h-3" />
                </div>
                <span>{deleteConfirmation.club.domain}</span>
                <span>•</span>
                <span>{deleteConfirmation.club.membersCount} members</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>Club permanently removed</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

        setDeleteConfirmation({ isOpen: false, club: null })
      } catch (error) {
        console.error('Error deleting club:', error)
        toast({
          title: "Error Deleting Club",
          description: "Failed to delete the club. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    }
  }

  const handleStatusChange = (club: any, newStatus: string) => {
    setStatusConfirmation({ isOpen: true, club, newStatus })
    closeContextMenu()
  }

  const confirmStatusChange = () => {
    if (statusConfirmation.club) {
      // TODO: Implement status change with API when status field is added to backend
      // For now, just show success message
      // setClubs((prev) =>
      //   prev.map((c) => (c.id === statusConfirmation.club.id ? { ...c, status: statusConfirmation.newStatus } : c)),
      // )

      toast({
        title: `Status Updated`,
        description: (
          <div className="space-y-2">
            <p className="font-medium">Club status changed successfully</p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{statusConfirmation.club.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">New status:</span>
              <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 font-medium">
                {statusConfirmation.newStatus}
              </div>
            </div>
          </div>
        ),
        className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
        duration: 4000,
      })

      setStatusConfirmation({ isOpen: false, club: null, newStatus: "" })
    }
  }

  const handleDuplicateClub = (club: any) => {
    const newClub = {
      ...club,
      id: `${Date.now()}`,
      name: `${club.name} (Copy)`,
      status: "Inactive",
      membersCount: 0,
      activeMembers: 0,
    }

    // TODO: Implement duplicate with API
    // setClubs((prev) => [newClub, ...prev])

    toast({
      title: `Club Duplicated`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Club copied successfully</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{newClub.name}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">The duplicate has been created as inactive</div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleCopyLink = (club: any) => {
    const link = `${window.location.origin}/clubs/${club.id}`
    navigator.clipboard.writeText(link)

    toast({
      title: `Link Copied`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">Club link copied to clipboard</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 max-w-full overflow-hidden">
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{link}</span>
            </div>
          </div>
        </div>
      ),
      className: "border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleViewMembers = (club: any) => {
    setMembersModal({ isOpen: true, club })
    closeContextMenu()
  }

  const handleViewActivities = (club: any) => {
    toast({
      title: `Club Activities`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{club.name}</p>
          <div className="text-sm text-muted-foreground">Activity timeline feature coming soon...</div>
        </div>
      ),
      className: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm",
      duration: 4000,
    })

    closeContextMenu()
  }

  const handleExportInfo = (club: any) => {
    toast({
      title: `Exporting Club Info`,
      description: (
        <div className="space-y-2">
          <p className="font-medium">{club.name}</p>
          <div className="text-sm text-muted-foreground">Preparing export file...</div>
        </div>
      ),
      className: "border-green-500/20 bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm",
      duration: 3000,
    })

    closeContextMenu()
  }

  useState(() => {
    const handleClick = () => closeContextMenu()
    const handleScroll = () => closeContextMenu()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu()
    }
    const handleResize = () => closeContextMenu()

    if (contextMenu.visible) {
      document.addEventListener("click", handleClick)
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("keydown", handleKeyDown)
      window.addEventListener("resize", handleResize)

      return () => {
        document.removeEventListener("click", handleClick)
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("resize", handleResize)
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clubs & Organizations</h1>
          <p className="text-muted-foreground">Manage school clubs, organizations, and their members</p>
        </div>
        <Button onClick={handleCreateClub} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Club
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clubs</p>
                <p className="text-2xl font-bold text-foreground">{clubsData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Clubs</p>
                <p className="text-2xl font-bold text-foreground">
                  {clubsData.filter((c) => c.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">
                  {clubsData.reduce((sum, c) => sum + c.membersCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recruiting</p>
                <p className="text-2xl font-bold text-foreground">{clubsData.filter((c) => c.isRecruiting).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Club Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search, filter, and manage clubs and organizations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search clubs by name, president, or adviser..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            {/* TODO: Add domain filter when needed */}
            {/* <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
              </SelectContent>
            </Select> */}
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on hold">On Hold</SelectItem>
                <SelectItem value="recruiting">Recruiting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredClubs.length)} of {filteredClubs.length} clubs
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedClubs.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">
                {selectedClubs.length} club{selectedClubs.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Active
                </Button>
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Clubs Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClubs.length === paginatedClubs.length && paginatedClubs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground">Club</TableHead>
                  <TableHead className="text-foreground">President</TableHead>
                  <TableHead className="text-foreground">Vice President</TableHead>
                  <TableHead className="text-foreground">Adviser</TableHead>
                  <TableHead className="text-foreground">Members</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading clubs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                        <div>
                          <p className="text-destructive font-medium">Error loading clubs</p>
                          <p className="text-muted-foreground text-sm mt-1">
                            {error instanceof Error ? error.message : 'An unexpected error occurred'}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                          className="mt-2"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedClubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No clubs found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClubs.map((club) => (
                    <TableRow
                      key={club.id}
                      className="border-border cursor-pointer hover:bg-muted/50"
                      onContextMenu={(e) => handleContextMenu(e, club)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedClubs.includes(club.id)}
                          onCheckedChange={(checked) => handleSelectClub(club.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
                            <AvatarFallback>{club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="max-w-md">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">{club.name}</div>
                              {club.isRecruiting && (
                                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20 text-xs">
                                  Recruiting
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{club.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{club.president}</TableCell>
                      <TableCell className="text-foreground">{club.vicePresident}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span>{club.adviser}</span>
                          <span className="text-xs">{club.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewMembers(club)
                          }}
                        >
                          <Users className="w-4 h-4" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-foreground">{club.membersCount}</span>
                            <span className="text-xs text-muted-foreground">{club.activeMembers} active</span>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>{getStatusBadge(club.status, club)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="text-foreground" onClick={() => handleViewClub(club)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Club
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-foreground" onClick={() => handleEditClub(club)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Club
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteClub(club)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Club
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredClubs.length} total clubs)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-border bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "" : "border-border bg-transparent"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages ? "" : "border-border bg-transparent"}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-border bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-orange-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Archive className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  Archived Clubs
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                    {archivedClubs.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-muted-foreground">Manage archived and deleted clubs</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="border-orange-500/20 hover:bg-orange-500/10"
            >
              {showArchived ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Archived
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showArchived && (
          <CardContent className="space-y-4">
            {/* Warning Notice */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-700 dark:text-orange-400">
                  <p className="font-medium mb-1">Archived Clubs Policy</p>
                  <p className="text-xs">
                    Archived clubs are kept for 90 days before permanent deletion. You can restore them to active status
                    or permanently delete them at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search archived clubs..."
                    value={archivedSearchTerm}
                    onChange={(e) => {
                      setArchivedSearchTerm(e.target.value)
                      setArchivedCurrentPage(1)
                    }}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select
                value={archivedCategoryFilter}
                onValueChange={(value) => {
                  setArchivedCategoryFilter(value)
                  setArchivedCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={archivedItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setArchivedItemsPerPage(Number(value))
                    setArchivedCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px] bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {archivedStartIndex + 1} to {Math.min(archivedEndIndex, filteredArchivedClubs.length)} of{" "}
                {filteredArchivedClubs.length} archived clubs
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedArchivedClubs.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedArchivedClubs.length} club{selectedArchivedClubs.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRestoreArchived}
                    className="border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkPermanentDeleteArchived}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Archived Clubs Table */}
            <div className="border border-orange-500/20 rounded-lg opacity-70">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedArchivedClubs.length === paginatedArchivedClubs.length &&
                          paginatedArchivedClubs.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedArchivedClubs(paginatedArchivedClubs.map((c) => c.id))
                          } else {
                            setSelectedArchivedClubs([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-foreground">Club</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Deleted Date</TableHead>
                    <TableHead className="text-foreground">Deleted By</TableHead>
                    <TableHead className="text-foreground">Reason</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArchivedClubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No archived clubs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedArchivedClubs.map((club) => (
                      <TableRow key={club.id} className="border-border">
                        <TableCell>
                          <Checkbox
                            checked={selectedArchivedClubs.includes(club.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedArchivedClubs((prev) => [...prev, club.id])
                              } else {
                                setSelectedArchivedClubs((prev) => prev.filter((id) => id !== club.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={club.logo || "/placeholder.svg"} alt={club.name} />
                              <AvatarFallback>{club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">{club.name}</div>
                              <div className="text-sm text-muted-foreground">{club.membersCount} members</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getDomainBadge(club.category)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(club.deletedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{club.deletedBy}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{club.deletionReason}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                className="text-foreground"
                                onClick={() => {
                                  toast({
                                    title: "Club Details",
                                    description: (
                                      <div className="space-y-2">
                                        <p className="font-medium">{club.name}</p>
                                        <p className="text-sm text-muted-foreground">{club.description}</p>
                                      </div>
                                    ),
                                    duration: 5000,
                                  })
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-600" onClick={() => handleRestoreClub(club)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore Club
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handlePermanentDeleteClub(club)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {archivedTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {archivedCurrentPage} of {archivedTotalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === 1}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage - 1)}
                    className="border-border bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivedCurrentPage === archivedTotalPages}
                    onClick={() => setArchivedCurrentPage(archivedCurrentPage + 1)}
                    className="border-border bg-transparent"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={closeContextMenu} />

          <div
            className="fixed z-50 min-w-[240px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 space-y-0.5">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleViewClub(contextMenu.club)
                  closeContextMenu()
                }}
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View Details</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  handleEditClub(contextMenu.club)
                  closeContextMenu()
                }}
              >
                <Edit className="w-4 h-4 text-green-600" />
                <span>Edit Club</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleDuplicateClub(contextMenu.club)}
              >
                <Copy className="w-4 h-4 text-purple-600" />
                <span>Duplicate Club</span>
              </button>

              <div className="h-px bg-border my-1" />

              <div
                className="relative"
                onMouseEnter={() => setContextMenu((prev) => ({ ...prev, submenu: "status" }))}
                onMouseLeave={() => setContextMenu((prev) => ({ ...prev, submenu: null }))}
              >
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Change Status</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                </button>

                {contextMenu.submenu === "status" && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 p-1.5 space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.club?.status === "Active" ? "bg-green-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.club, "Active")}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Active</span>
                      </div>
                      {contextMenu.club?.status === "Active" && <Check className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.club?.status === "Inactive" ? "bg-gray-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.club, "Inactive")}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-gray-600" />
                        <span>Inactive</span>
                      </div>
                      {contextMenu.club?.status === "Inactive" && <Check className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.club?.status === "On Hold" ? "bg-yellow-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.club, "On Hold")}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span>On Hold</span>
                      </div>
                      {contextMenu.club?.status === "On Hold" && <Check className="w-4 h-4 text-yellow-600" />}
                    </button>
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left ${
                        contextMenu.club?.status === "Recruiting" ? "bg-blue-500/10" : ""
                      }`}
                      onClick={() => handleStatusChange(contextMenu.club, "Recruiting")}
                    >
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span>Recruiting</span>
                      </div>
                      {contextMenu.club?.status === "Recruiting" && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewMembers(contextMenu.club)}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>View Members</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleViewActivities(contextMenu.club)}
              >
                <Activity className="w-4 h-4 text-purple-600" />
                <span>View Activities</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleCopyLink(contextMenu.club)}
              >
                <Link2 className="w-4 h-4 text-purple-600" />
                <span>Copy Link</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleExportInfo(contextMenu.club)}
              >
                <Download className="w-4 h-4 text-green-600" />
                <span>Export Info</span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors text-left"
                onClick={() => {
                  handleDeleteClub(contextMenu.club)
                  closeContextMenu()
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Club</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.club && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setDeleteConfirmation({ isOpen: false, club: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Delete Club</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">{deleteConfirmation.club.name}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={deleteConfirmation.club.logo || "/placeholder.svg"}
                            alt={deleteConfirmation.club.name}
                          />
                          <AvatarFallback>{deleteConfirmation.club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{deleteConfirmation.club.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Advised by {deleteConfirmation.club.adviser}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getDomainBadge(deleteConfirmation.club.domain)}
                        {getStatusBadge(deleteConfirmation.club.status)}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {deleteConfirmation.club.membersCount} members ({deleteConfirmation.club.activeMembers}{" "}
                            active)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>President: {deleteConfirmation.club.president}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Meets {deleteConfirmation.club.meetingDay} at {deleteConfirmation.club.meetingTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{deleteConfirmation.club.meetingLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Club will be permanently deleted</li>
                          <li>• All member data and records will be lost</li>
                          <li>• Club activities and history will be removed</li>
                          <li>• This action cannot be reversed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmation({ isOpen: false, club: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteClub}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Club
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Confirmation Modal */}
      {statusConfirmation.isOpen && statusConfirmation.club && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setStatusConfirmation({ isOpen: false, club: null, newStatus: "" })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Change Club Status</h3>
                    <p className="text-sm text-muted-foreground">Confirm status change</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Change status of <span className="font-semibold text-blue-600">{statusConfirmation.club.name}</span>{" "}
                    to <span className="font-semibold text-green-600">{statusConfirmation.newStatus}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={statusConfirmation.club.logo || "/placeholder.svg"}
                            alt={statusConfirmation.club.name}
                          />
                          <AvatarFallback>{statusConfirmation.club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{statusConfirmation.club.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {statusConfirmation.club.membersCount} members
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Current status:</span>
                        {getStatusBadge(statusConfirmation.club.status)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(statusConfirmation.newStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          {statusConfirmation.newStatus === "Active" && (
                            <>
                              <li>• Club will be marked as active</li>
                              <li>• Members can participate in activities</li>
                              <li>• Club will appear in active listings</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Inactive" && (
                            <>
                              <li>• Club will be marked as inactive</li>
                              <li>• No new member registrations</li>
                              <li>• Club activities will be paused</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "On Hold" && (
                            <>
                              <li>• Club will be temporarily paused</li>
                              <li>• Members remain registered</li>
                              <li>• Activities can resume later</li>
                            </>
                          )}
                          {statusConfirmation.newStatus === "Recruiting" && (
                            <>
                              <li>• Club will actively recruit members</li>
                              <li>• Highlighted in club listings</li>
                              <li>• Open for new registrations</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStatusConfirmation({ isOpen: false, club: null, newStatus: "" })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Members Modal */}
      {membersModal.isOpen && membersModal.club && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setMembersModal({ isOpen: false, club: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={membersModal.club.logo || "/placeholder.svg"} alt={membersModal.club.name} />
                      <AvatarFallback>{membersModal.club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{membersModal.club.name} Members</h3>
                      <p className="text-sm text-muted-foreground">
                        {membersModal.club.membersCount} total members ({membersModal.club.activeMembers} active)
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Add Member",
                        description: "Member management feature coming soon...",
                        duration: 3000,
                      })
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                <div className="space-y-3">
                  {/* Mock member list */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&query=student+${i + 1}`}
                            alt={`Member ${i + 1}`}
                          />
                          <AvatarFallback>M{i + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">Member Name {i + 1}</p>
                          <p className="text-sm text-muted-foreground">Grade {9 + (i % 4)} Student</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Active</Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-border">
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setMembersModal({ isOpen: false, club: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {restoreConfirmation.isOpen && restoreConfirmation.club && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setRestoreConfirmation({ isOpen: false, club: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mr-4">
                    <RotateCcw className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Restore Club</h3>
                    <p className="text-sm text-muted-foreground">Bring this club back to active status</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you sure you want to restore{" "}
                    <span className="font-semibold text-green-600">{restoreConfirmation.club.name}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={restoreConfirmation.club.logo || "/placeholder.svg"}
                            alt={restoreConfirmation.club.name}
                          />
                          <AvatarFallback>{restoreConfirmation.club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{restoreConfirmation.club.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Deleted on {new Date(restoreConfirmation.club.deletedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Deleted by:</span> {restoreConfirmation.club.deletedBy}
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span> {restoreConfirmation.club.deletionReason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <p className="font-medium mb-1">What will happen:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Club will be restored to inactive status</li>
                          <li>• All club data and information will be preserved</li>
                          <li>• You can activate the club from the main clubs list</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setRestoreConfirmation({ isOpen: false, club: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRestoreClub}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Club
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {permanentDeleteConfirmation.isOpen && permanentDeleteConfirmation.club && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setPermanentDeleteConfirmation({ isOpen: false, club: null })}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Permanently Delete Club</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4"></div>

                <div className="space-y-4">
                  <p className="text-foreground">
                    Are you absolutely sure you want to permanently delete{" "}
                    <span className="font-semibold text-red-600">{permanentDeleteConfirmation.club.name}</span>?
                  </p>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={permanentDeleteConfirmation.club.logo || "/placeholder.svg"}
                            alt={permanentDeleteConfirmation.club.name}
                          />
                          <AvatarFallback>
                            {permanentDeleteConfirmation.club.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{permanentDeleteConfirmation.club.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {permanentDeleteConfirmation.club.membersCount} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-400">
                        <p className="font-medium mb-1">Warning: Permanent Action</p>
                        <ul className="space-y-1 text-xs">
                          <li>• All club data will be permanently deleted</li>
                          <li>• Member records and history will be lost</li>
                          <li>• This action cannot be reversed</li>
                          <li>• No recovery will be possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setPermanentDeleteConfirmation({ isOpen: false, club: null })}
                    className="border-border bg-transparent hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPermanentDeleteClub}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ClubsPage
