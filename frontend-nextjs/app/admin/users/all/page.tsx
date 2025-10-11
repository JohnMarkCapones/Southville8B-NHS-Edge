"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Clock,
  GraduationCap,
  Building,
  User,
  Shield,
  MapPin,
  Phone,
  Cake,
  Heart,
  Archive,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@southville8b.edu.ph",
    role: "Student",
    subRole: "Club President",
    status: "Active",
    lastLogin: "2024-01-15 10:30 AM",
    joinDate: "2023-08-15",
    grade: "Grade 8-A",
    phone: "+63 912 345 6789",
    address: "123 Mabuhay St., Las Piñas City, Metro Manila",
    birthday: "2009-03-15",
    age: 15,
    emergencyContact: "Maria Doe (+63 917 123 4567)",
    bloodType: "O+",
    guardian: "Maria Doe",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Club Adviser",
    status: "Active",
    lastLogin: "2024-01-15 09:15 AM",
    joinDate: "2022-06-01",
    department: "Mathematics",
    phone: "+63 918 765 4321",
    address: "456 Rizal Ave., Muntinlupa City, Metro Manila",
    birthday: "1985-07-22",
    age: 38,
    emergencyContact: "Robert Smith (+63 919 876 5432)",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@southville8b.edu.ph",
    role: "Student",
    subRole: "Secretary",
    status: "Inactive",
    lastLogin: "2024-01-10 02:45 PM",
    joinDate: "2023-08-15",
    grade: "Grade 8-B",
    phone: "+63 920 111 2222",
    address: "789 Bonifacio St., Taguig City, Metro Manila",
    birthday: "2009-05-20",
    age: 15,
    emergencyContact: "Susan Johnson (+63 921 333 4444)",
    bloodType: "A-",
    guardian: "Susan Johnson",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@southville8b.edu.ph",
    role: "Administrator",
    subRole: "-",
    status: "Active",
    lastLogin: "2024-01-15 11:00 AM",
    joinDate: "2021-03-15",
    department: "Administration",
    phone: "+63 922 555 6666",
    address: "101 Aurora Blvd., Quezon City, Metro Manila",
    birthday: "1978-11-01",
    age: 45,
    emergencyContact: "David Wilson (+63 923 777 8888)",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Department Head",
    status: "Active",
    lastLogin: "2024-01-14 04:20 PM",
    joinDate: "2022-08-20",
    department: "Science",
    phone: "+63 924 999 0000",
    address: "202 Luna St., Pasig City, Metro Manila",
    birthday: "1980-02-10",
    age: 43,
    emergencyContact: "Emily Brown (+63 925 111 2222)",
  },
  {
    id: "6",
    name: "Maria Garcia",
    email: "maria.garcia@southville8b.edu.ph",
    role: "Student",
    subRole: "Club Vice President",
    status: "Active",
    lastLogin: "2024-01-15 08:45 AM",
    joinDate: "2023-08-15",
    grade: "Grade 9-A",
    phone: "+63 926 333 4444",
    address: "303 Quezon Ave., Quezon City, Metro Manila",
    birthday: "2008-07-05",
    age: 16,
    emergencyContact: "Jose Garcia (+63 927 555 6666)",
    bloodType: "B+",
    guardian: "Jose Garcia",
  },
  {
    id: "7",
    name: "Robert Lee",
    email: "robert.lee@southville8b.edu.ph",
    role: "Student",
    subRole: "PIO",
    status: "Active",
    lastLogin: "2024-01-14 03:20 PM",
    joinDate: "2023-08-15",
    grade: "Grade 10-B",
    phone: "+63 928 777 8888",
    address: "404 Sampaguita St., Manila, Metro Manila",
    birthday: "2007-09-12",
    age: 17,
    emergencyContact: "Anna Lee (+63 929 999 0000)",
    bloodType: "AB+",
    guardian: "Anna Lee",
  },
  {
    id: "8",
    name: "Lisa Chen",
    email: "lisa.chen@southville8b.edu.ph",
    role: "Student",
    subRole: "Muse",
    status: "Active",
    lastLogin: "2024-01-15 01:15 PM",
    joinDate: "2023-08-15",
    grade: "Grade 9-C",
    phone: "+63 930 111 2222",
    address: "505 Rizal Ave., Caloocan City, Metro Manila",
    birthday: "2008-01-30",
    age: 16,
    emergencyContact: "Peter Chen (+63 931 333 4444)",
    bloodType: "O-",
    guardian: "Peter Chen",
  },
  {
    id: "9",
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@southville8b.edu.ph",
    role: "Student",
    subRole: "Escort",
    status: "Active",
    lastLogin: "2024-01-15 11:30 AM",
    joinDate: "2023-08-15",
    grade: "Grade 10-A",
    phone: "+63 932 555 6666",
    address: "606 Mabini St., Malabon City, Metro Manila",
    birthday: "2007-04-18",
    age: 17,
    emergencyContact: "Sofia Rodriguez (+63 933 777 8888)",
    bloodType: "B-",
    guardian: "Sofia Rodriguez",
  },
  {
    id: "10",
    name: "Anna Martinez",
    email: "anna.martinez@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Club Adviser",
    status: "Active",
    lastLogin: "2024-01-15 08:20 AM",
    joinDate: "2022-09-10",
    department: "English",
    phone: "+63 934 999 0000",
    address: "707 Del Pilar St., Navotas City, Metro Manila",
    birthday: "1988-06-25",
    age: 35,
    emergencyContact: "Luis Martinez (+63 935 111 2222)",
  },
  {
    id: "11",
    name: "James Wilson",
    email: "james.wilson@southville8b.edu.ph",
    role: "Student",
    subRole: "Treasurer",
    status: "Active",
    lastLogin: "2024-01-14 02:15 PM",
    joinDate: "2023-08-15",
    grade: "Grade 7-A",
    phone: "+63 936 333 4444",
    address: "808 Burgos St., Valenzuela City, Metro Manila",
    birthday: "2010-10-01",
    age: 14,
    emergencyContact: "Patricia Wilson (+63 937 555 6666)",
    bloodType: "A+",
    guardian: "Patricia Wilson",
  },
  {
    id: "12",
    name: "Emily Davis",
    email: "emily.davis@southville8b.edu.ph",
    role: "Student",
    subRole: "Auditor",
    status: "Active",
    lastLogin: "2024-01-15 09:45 AM",
    joinDate: "2023-08-15",
    grade: "Grade 7-B",
    phone: "+63 938 777 8888",
    address: "909 Aguinaldo St., Marikina City, Metro Manila",
    birthday: "2010-12-15",
    age: 14,
    emergencyContact: "Michael Davis (+63 939 999 0000)",
    bloodType: "O+",
    guardian: "Michael Davis",
  },
  {
    id: "13",
    name: "Michael Thompson",
    email: "michael.thompson@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Sports Coordinator",
    status: "Active",
    lastLogin: "2024-01-15 07:30 AM",
    joinDate: "2021-11-05",
    department: "Physical Education",
    phone: "+63 940 111 2222",
    address: "1010 Shaw Blvd., Mandaluyong City, Metro Manila",
    birthday: "1975-09-01",
    age: 48,
    emergencyContact: "Sarah Thompson (+63 941 333 4444)",
  },
  {
    id: "14",
    name: "Jessica Brown",
    email: "jessica.brown@southville8b.edu.ph",
    role: "Student",
    subRole: "Class Representative",
    status: "Active",
    lastLogin: "2024-01-14 04:10 PM",
    joinDate: "2023-08-15",
    grade: "Grade 8-C",
    phone: "+63 942 555 6666",
    address: "1111 Ortigas Ave., Pasig City, Metro Manila",
    birthday: "2009-08-22",
    age: 15,
    emergencyContact: "John Brown (+63 943 777 8888)",
    bloodType: "A-",
    guardian: "John Brown",
  },
  {
    id: "15",
    name: "Daniel Kim",
    email: "daniel.kim@southville8b.edu.ph",
    role: "Student",
    subRole: "Peace Officer",
    status: "Active",
    lastLogin: "2024-01-15 10:05 AM",
    joinDate: "2023-08-15",
    grade: "Grade 9-B",
    phone: "+63 944 999 0000",
    address: "1212 McKinley St., Taguig City, Metro Manila",
    birthday: "2008-03-10",
    age: 16,
    emergencyContact: "Minji Kim (+63 945 111 2222)",
    bloodType: "AB-",
    guardian: "Minji Kim",
  },
  {
    id: "16",
    name: "Rachel Green",
    email: "rachel.green@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Academic Coordinator",
    status: "Active",
    lastLogin: "2024-01-15 08:50 AM",
    joinDate: "2022-01-20",
    department: "Filipino",
    phone: "+63 946 333 4444",
    address: "1313 Ayala Ave., Makati City, Metro Manila",
    birthday: "1982-05-05",
    age: 41,
    emergencyContact: "Samuel Green (+63 947 555 6666)",
  },
  {
    id: "17",
    name: "Kevin White",
    email: "kevin.white@southville8b.edu.ph",
    role: "Student",
    subRole: "Business Manager",
    status: "Inactive",
    lastLogin: "2024-01-08 01:20 PM",
    joinDate: "2023-08-15",
    grade: "Grade 10-C",
    phone: "+63 948 777 8888",
    address: "1414 Greenhills St., San Juan City, Metro Manila",
    birthday: "2007-07-19",
    age: 17,
    emergencyContact: "Laura White (+63 949 999 0000)",
    bloodType: "O+",
    guardian: "Laura White",
  },
  {
    id: "18",
    name: "Amanda Taylor",
    email: "amanda.taylor@southville8b.edu.ph",
    role: "Student",
    subRole: "Sergeant at Arms",
    status: "Active",
    lastLogin: "2024-01-15 11:15 AM",
    joinDate: "2023-08-15",
    grade: "Grade 8-D",
    phone: "+63 950 111 2222",
    address: "1515 EDSA, Quezon City, Metro Manila",
    birthday: "2009-02-28",
    age: 15,
    emergencyContact: "Mark Taylor (+63 951 333 4444)",
    bloodType: "B+",
    guardian: "Mark Taylor",
  },
  {
    id: "19",
    name: "Christopher Lee",
    email: "christopher.lee@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Guidance Counselor",
    status: "Active",
    lastLogin: "2024-01-15 09:30 AM",
    joinDate: "2021-07-12",
    department: "Guidance",
    phone: "+63 952 555 6666",
    address: "1616 Taft Ave., Manila, Metro Manila",
    birthday: "1970-04-01",
    age: 53,
    emergencyContact: "Elizabeth Lee (+63 953 777 8888)",
  },
  {
    id: "20",
    name: "Stephanie Clark",
    email: "stephanie.clark@southville8b.edu.ph",
    role: "Student",
    subRole: "Environmental Officer",
    status: "Active",
    lastLogin: "2024-01-14 03:45 PM",
    joinDate: "2023-08-15",
    grade: "Grade 9-D",
    phone: "+63 954 999 0000",
    address: "1717 Roxas Blvd., Pasay City, Metro Manila",
    birthday: "2008-11-11",
    age: 16,
    emergencyContact: "George Clark (+63 955 111 2222)",
    bloodType: "A+",
    guardian: "George Clark",
  },
  {
    id: "21",
    name: "Ryan Miller",
    email: "ryan.miller@southville8b.edu.ph",
    role: "Student",
    subRole: "Sports Captain",
    status: "Active",
    lastLogin: "2024-01-15 07:20 AM",
    joinDate: "2023-08-15",
    grade: "Grade 10-D",
    phone: "+63 956 333 4444",
    address: "1818 Kalayaan Ave., Makati City, Metro Manila",
    birthday: "2007-01-01",
    age: 17,
    emergencyContact: "Linda Miller (+63 957 555 6666)",
    bloodType: "O-",
    guardian: "Linda Miller",
  },
  {
    id: "22",
    name: "Nicole Anderson",
    email: "nicole.anderson@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Library Coordinator",
    status: "Active",
    lastLogin: "2024-01-15 08:10 AM",
    joinDate: "2022-03-08",
    department: "Library",
    phone: "+63 958 777 8888",
    address: "1919 Meralco Ave., Pasig City, Metro Manila",
    birthday: "1990-08-08",
    age: 33,
    emergencyContact: "Brian Anderson (+63 959 999 0000)",
  },
  {
    id: "23",
    name: "Brandon Moore",
    email: "brandon.moore@southville8b.edu.ph",
    role: "Student",
    subRole: "IT Officer",
    status: "Active",
    lastLogin: "2024-01-15 10:40 AM",
    joinDate: "2023-08-15",
    grade: "Grade 7-C",
    phone: "+63 960 111 2222",
    address: "2020 Ayala Center, Makati City, Metro Manila",
    birthday: "2010-06-06",
    age: 14,
    emergencyContact: "Karen Moore (+63 961 333 4444)",
    bloodType: "B+",
    guardian: "Karen Moore",
  },
  {
    id: "24",
    name: "Samantha Harris",
    email: "samantha.harris@southville8b.edu.ph",
    role: "Student",
    subRole: "Health Officer",
    status: "Active",
    lastLogin: "2024-01-14 02:30 PM",
    joinDate: "2023-08-15",
    grade: "Grade 7-D",
    phone: "+63 962 555 6666",
    address: "2121 McKinley Hill, Taguig City, Metro Manila",
    birthday: "2010-09-09",
    age: 14,
    emergencyContact: "Robert Harris (+63 963 777 8888)",
    bloodType: "A-",
    guardian: "Robert Harris",
  },
  {
    id: "25",
    name: "Jonathan Wright",
    email: "jonathan.wright@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Research Coordinator",
    status: "Active",
    lastLogin: "2024-01-15 09:05 AM",
    joinDate: "2021-10-15",
    department: "Research",
    phone: "+63 964 999 0000",
    address: "2222 Katipunan Ave., Quezon City, Metro Manila",
    birthday: "1973-12-12",
    age: 50,
    emergencyContact: "Susan Wright (+63 965 111 2222)",
  },
]

const archivedUsers = [
  {
    id: "26",
    name: "Thomas Anderson",
    email: "thomas.anderson@southville8b.edu.ph",
    role: "Student",
    subRole: "Class Representative",
    status: "Archived",
    lastLogin: "2024-01-05 03:15 PM",
    joinDate: "2023-08-15",
    grade: "Grade 8-A",
    phone: "+63 966 111 2222",
    address: "2323 Matrix St., Quezon City, Metro Manila",
    birthday: "2009-04-20",
    age: 15,
    emergencyContact: "Trinity Anderson (+63 967 333 4444)",
    bloodType: "O+",
    guardian: "Trinity Anderson",
    deletedAt: "2024-01-12 10:30 AM",
    deletedBy: "Admin User",
    deleteReason: "Transferred to another school",
  },
  {
    id: "27",
    name: "Patricia Moore",
    email: "patricia.moore@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Club Adviser",
    status: "Archived",
    lastLogin: "2023-12-20 11:45 AM",
    joinDate: "2022-06-01",
    department: "Arts",
    phone: "+63 968 555 6666",
    address: "2424 Creative Ave., Makati City, Metro Manila",
    birthday: "1987-03-15",
    age: 36,
    emergencyContact: "John Moore (+63 969 777 8888)",
    deletedAt: "2024-01-10 02:15 PM",
    deletedBy: "Super Admin",
    deleteReason: "Resigned from position",
  },
  {
    id: "28",
    name: "Kevin Santos",
    email: "kevin.santos@southville8b.edu.ph",
    role: "Student",
    subRole: "Treasurer",
    status: "Archived",
    lastLogin: "2023-12-28 09:20 AM",
    joinDate: "2023-08-15",
    grade: "Grade 9-B",
    phone: "+63 970 999 0000",
    address: "2525 Finance St., Pasig City, Metro Manila",
    birthday: "2008-06-10",
    age: 16,
    emergencyContact: "Maria Santos (+63 971 111 2222)",
    bloodType: "A+",
    guardian: "Maria Santos",
    deletedAt: "2024-01-08 04:45 PM",
    deletedBy: "Admin User",
    deleteReason: "Account deactivation requested by parent",
  },
]

const stats = [
  { label: "Total Users", value: "1,247", change: "+12%" },
  { label: "Active Users", value: "1,156", change: "+8%" },
  { label: "New This Month", value: "23", change: "+15%" },
  { label: "Inactive Users", value: "91", change: "-5%" },
]

export default function AllUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subRoleFilter, setSubRoleFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  const [showArchivedUsers, setShowArchivedUsers] = useState(false)
  const [archivedSearchTerm, setArchivedSearchTerm] = useState("")
  const [archivedRoleFilter, setArchivedRoleFilter] = useState("all")
  const [selectedArchivedUsers, setSelectedArchivedUsers] = useState<string[]>([])
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(10)
  const [userToRestore, setUserToRestore] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<any>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    const matchesSubRole = subRoleFilter === "all" || user.subRole.toLowerCase().includes(subRoleFilter.toLowerCase())

    return matchesSearch && matchesRole && matchesStatus && matchesSubRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const filteredArchivedUsers = archivedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    const matchesRole = archivedRoleFilter === "all" || user.role.toLowerCase() === archivedRoleFilter

    return matchesSearch && matchesRole
  })

  const archivedTotalPages = Math.ceil(filteredArchivedUsers.length / archivedItemsPerPage)
  const archivedStartIndex = (archivedCurrentPage - 1) * archivedItemsPerPage
  const archivedEndIndex = archivedStartIndex + archivedItemsPerPage
  const paginatedArchivedUsers = filteredArchivedUsers.slice(archivedStartIndex, archivedEndIndex)

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "role":
        setRoleFilter(value)
        break
      case "status":
        setStatusFilter(value)
        break
      case "subRole":
        setSubRoleFilter(value)
        break
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  const handleRestoreUser = (user: any) => {
    setUserToRestore(user)
  }

  const confirmRestoreUser = () => {
    console.log("[v0] Restoring user:", userToRestore)
    // TODO: Implement actual restore logic
    setUserToRestore(null)
  }

  const handlePermanentDelete = (user: any) => {
    setUserToDelete(user)
  }

  const confirmPermanentDelete = () => {
    console.log("[v0] Permanently deleting user:", userToDelete)
    // TODO: Implement actual permanent delete logic
    setUserToDelete(null)
  }

  const handleSelectAllArchived = (checked: boolean) => {
    if (checked) {
      setSelectedArchivedUsers(paginatedArchivedUsers.map((user) => user.id))
    } else {
      setSelectedArchivedUsers([])
    }
  }

  const handleSelectArchivedUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedArchivedUsers((prev) => [...prev, userId])
    } else {
      setSelectedArchivedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  const formatDeleteDate = (dateString: string) => {
    return dateString
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      Student: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Teacher: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Administrator: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    }

    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
        {role}
      </Badge>
    )
  }

  const getSubRoleBadge = (subRole: string) => {
    if (subRole === "-" || !subRole) {
      return <span className="text-[hsl(var(--superadmin-muted-foreground))] text-sm">-</span>
    }

    const colors = {
      // Teacher sub roles
      "Club Adviser": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "Department Head": "bg-violet-500/10 text-violet-600 border-violet-500/20",
      "Sports Coordinator": "bg-teal-500/10 text-teal-600 border-teal-500/20",
      "Academic Coordinator": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "Guidance Counselor": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Library Coordinator": "bg-slate-500/10 text-slate-600 border-slate-500/20",
      "Research Coordinator": "bg-gray-500/10 text-gray-600 border-gray-500/20",

      // Student sub roles
      "Club President": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "Club Vice President": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      Secretary: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      PIO: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      Escort: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      Muse: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      Treasurer: "bg-green-500/10 text-green-600 border-green-500/20",
      Auditor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Class Representative": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "Peace Officer": "bg-red-500/10 text-red-600 border-red-500/20",
      "Business Manager": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "Sergeant at Arms": "bg-violet-500/10 text-violet-600 border-violet-500/20",
      "Environmental Officer": "bg-lime-500/10 text-lime-600 border-lime-500/20",
      "Sports Captain": "bg-sky-500/10 text-sky-600 border-sky-500/20",
      "IT Officer": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Health Officer": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    }

    return (
      <Badge className={colors[subRole as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
        {subRole}
      </Badge>
    )
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--superadmin-foreground))]">All Users</h1>
          <p className="text-[hsl(var(--superadmin-muted-foreground))] mt-2">
            Manage all users across the platform including students, teachers, and administrators.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))] bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[hsl(var(--superadmin-primary))] hover:bg-[hsl(var(--superadmin-primary))]/90">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--superadmin-foreground))]">{stat.value}</p>
                </div>
                <div className="text-sm text-green-500">{stat.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--superadmin-foreground))]">User Management</CardTitle>
          <CardDescription className="text-[hsl(var(--superadmin-muted-foreground))]">
            Search, filter, and manage users across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--superadmin-muted-foreground))] w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-[hsl(var(--superadmin-input))] border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))]"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger className="w-[180px] bg-[hsl(var(--superadmin-input))] border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="administrator">Administrators</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subRoleFilter} onValueChange={(value) => handleFilterChange("subRole", value)}>
              <SelectTrigger className="w-[180px] bg-[hsl(var(--superadmin-input))] border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))]">
                <SelectValue placeholder="Filter by sub-role" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
                <SelectItem value="all">All Sub-Roles</SelectItem>
                <SelectItem value="club">Club Positions</SelectItem>
                <SelectItem value="officer">Officers</SelectItem>
                <SelectItem value="coordinator">Coordinators</SelectItem>
                <SelectItem value="adviser">Advisers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-[hsl(var(--superadmin-input))] border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">Show:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[100px] bg-[hsl(var(--superadmin-input))] border-[hsl(var(--superadmin-border))] text-[hsl(var(--superadmin-foreground))]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]">
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">entries</span>
            </div>
            <div className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-[hsl(var(--superadmin-secondary))] rounded-lg">
              <span className="text-sm text-[hsl(var(--superadmin-foreground))]">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-[hsl(var(--superadmin-border))] bg-transparent">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" className="border-[hsl(var(--superadmin-border))] bg-transparent">
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className="border border-[hsl(var(--superadmin-border))] rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-[hsl(var(--superadmin-border))]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-[hsl(var(--superadmin-foreground))]">User</TableHead>
                  <TableHead className="text-[hsl(var(--superadmin-foreground))]">Role</TableHead>
                  <TableHead className="text-[hsl(var(--superadmin-foreground))]">Sub Role</TableHead>
                  <TableHead className="text-[hsl(var(--superadmin-foreground))]">Status</TableHead>
                  <TableHead className="text-[hsl(var(--superadmin-foreground))]">Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="border-[hsl(var(--superadmin-border))]">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-[hsl(var(--superadmin-foreground))]">{user.name}</div>
                        <div className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getSubRoleBadge(user.subRole)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-[hsl(var(--superadmin-muted-foreground))]">{user.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[hsl(var(--superadmin-card))] border-[hsl(var(--superadmin-border))]"
                        >
                          <DropdownMenuItem
                            className="text-[hsl(var(--superadmin-foreground))]"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[hsl(var(--superadmin-foreground))]">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">
              Page {currentPage} of {totalPages} ({filteredUsers.length} total users)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-[hsl(var(--superadmin-border))] bg-transparent"
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
                      className={currentPage === pageNum ? "" : "border-[hsl(var(--superadmin-border))] bg-transparent"}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-[hsl(var(--superadmin-muted-foreground))]">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={
                        currentPage === totalPages ? "" : "border-[hsl(var(--superadmin-border))] bg-transparent"
                      }
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
                className="border-[hsl(var(--superadmin-border))] bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Users Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Archive className="w-6 h-6 text-muted-foreground" />
              <div>
                <CardTitle className="text-foreground">Archived Users</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and manage soft-deleted users. Restore or permanently delete archived accounts.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchivedUsers(!showArchivedUsers)}
              className="border-border bg-transparent"
            >
              {showArchivedUsers ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Archived ({archivedUsers.length})
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showArchivedUsers && (
          <CardContent className="space-y-4">
            {/* Archived Users Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search archived users..."
                    value={archivedSearchTerm}
                    onChange={(e) => {
                      setArchivedSearchTerm(e.target.value)
                      setArchivedCurrentPage(1)
                    }}
                    className="pl-10 bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <Select
                value={archivedRoleFilter}
                onValueChange={(value) => {
                  setArchivedRoleFilter(value)
                  setArchivedCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px] bg-input border-border text-foreground">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="administrator">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  <SelectTrigger className="w-[100px] bg-input border-border text-foreground">
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
                Showing {archivedStartIndex + 1} to {Math.min(archivedEndIndex, filteredArchivedUsers.length)} of{" "}
                {filteredArchivedUsers.length} archived users
              </div>
            </div>

            {selectedArchivedUsers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedArchivedUsers.length} user{selectedArchivedUsers.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-border bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </Button>
                </div>
              </div>
            )}

            {/* Archived Users Table */}
            <div className="border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedArchivedUsers.length === paginatedArchivedUsers.length &&
                          paginatedArchivedUsers.length > 0
                        }
                        onCheckedChange={handleSelectAllArchived}
                      />
                    </TableHead>
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Role</TableHead>
                    <TableHead className="text-foreground">Deleted Date</TableHead>
                    <TableHead className="text-foreground">Deleted By</TableHead>
                    <TableHead className="text-foreground">Reason</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArchivedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Archive className="w-12 h-12 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No archived users found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedArchivedUsers.map((user) => (
                      <TableRow key={user.id} className="border-border opacity-70 hover:opacity-100 transition-opacity">
                        <TableCell>
                          <Checkbox
                            checked={selectedArchivedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectArchivedUser(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDeleteDate(user.deletedAt)}</TableCell>
                        <TableCell className="text-muted-foreground">{user.deletedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {user.deleteReason}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem className="text-foreground" onClick={() => handleViewUser(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-green-600" onClick={() => handleRestoreUser(user)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500" onClick={() => handlePermanentDelete(user)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
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

            {/* Archived Users Pagination */}
            {filteredArchivedUsers.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {archivedCurrentPage} of {archivedTotalPages} ({filteredArchivedUsers.length} total archived
                  users)
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
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, archivedTotalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={archivedCurrentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setArchivedCurrentPage(pageNum)}
                          className={archivedCurrentPage === pageNum ? "" : "border-border bg-transparent"}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    {archivedTotalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={archivedCurrentPage === archivedTotalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setArchivedCurrentPage(archivedTotalPages)}
                          className={archivedCurrentPage === archivedTotalPages ? "" : "border-border bg-transparent"}
                        >
                          {archivedTotalPages}
                        </Button>
                      </>
                    )}
                  </div>
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

            {/* Warning Notice */}
            <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Important: Archived User Management
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 mt-2 space-y-1 list-disc list-inside">
                  <li>Archived users are soft-deleted and can be restored at any time</li>
                  <li>Permanently deleted users cannot be recovered</li>
                  <li>Review user data carefully before permanent deletion</li>
                  <li>Maintain compliance with data retention policies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Restore User Confirmation Dialog */}
      <AlertDialog open={!!userToRestore} onOpenChange={() => setUserToRestore(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Restore User Account</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to restore <strong>{userToRestore?.name}</strong>? This will reactivate their
              account and restore all access permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestoreUser} className="bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Permanently Delete User</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2">
              <p>
                Are you sure you want to <strong className="text-red-600">permanently delete</strong>{" "}
                <strong>{userToDelete?.name}</strong>?
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone. All user data will be permanently removed from the system.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPermanentDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Sheet Panel */}
      <Sheet open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <SheetContent side="right" className="w-[700px] sm:w-[800px] lg:w-[900px] overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="pb-6">
                <SheetTitle className="text-2xl font-bold text-[hsl(var(--superadmin-foreground))]">
                  User Profile
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col items-center text-center mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-[hsl(var(--superadmin-border))]">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {getUserInitials(selectedUser.name)}
                </div>
                <h2 className="text-3xl font-bold text-[hsl(var(--superadmin-foreground))] mb-2">
                  {selectedUser.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  {getRoleBadge(selectedUser.role)}
                  {selectedUser.subRole !== "-" && getSubRoleBadge(selectedUser.subRole)}
                </div>
                {getStatusBadge(selectedUser.status)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                      <div className="flex items-start">
                        <User className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                            Full Name
                          </span>
                          <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                            {selectedUser.name}
                          </span>
                        </div>
                      </div>
                      {selectedUser.birthday && (
                        <div className="flex items-start">
                          <Cake className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Birthday
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {formatBirthday(selectedUser.birthday)}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedUser.age && (
                        <div className="flex items-start">
                          <Calendar className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">Age</span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.age} years old
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedUser.bloodType && (
                        <div className="flex items-start">
                          <Heart className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Blood Type
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.bloodType}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-green-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                      <div className="flex items-start">
                        <Mail className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                            Email Address
                          </span>
                          <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                            {selectedUser.email}
                          </span>
                        </div>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-start">
                          <Phone className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Phone Number
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.phone}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Address
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.address}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  {selectedUser.emergencyContact && (
                    <div>
                      <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-red-500" />
                        Emergency Contact
                      </h3>
                      <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                        <div className="flex items-start">
                          <Phone className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Emergency Contact
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.emergencyContact}
                            </span>
                          </div>
                        </div>
                        {selectedUser.guardian && (
                          <div className="flex items-start">
                            <User className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                            <div className="flex-1">
                              <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                                Guardian
                              </span>
                              <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                                {selectedUser.guardian}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Academic/Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                      {selectedUser.role === "Student" ? (
                        <GraduationCap className="w-5 h-5 mr-2 text-purple-500" />
                      ) : (
                        <Building className="w-5 h-5 mr-2 text-orange-500" />
                      )}
                      {selectedUser.role === "Student" ? "Academic Information" : "Professional Information"}
                    </h3>
                    <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                      {selectedUser.role === "Student" && selectedUser.grade && (
                        <div className="flex items-start">
                          <GraduationCap className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Grade Level
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.grade}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedUser.role === "Teacher" && selectedUser.department && (
                        <div className="flex items-start">
                          <Building className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Department
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.department}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedUser.role === "Administrator" && selectedUser.department && (
                        <div className="flex items-start">
                          <Shield className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Department
                            </span>
                            <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                              {selectedUser.department}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <User className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">User ID</span>
                          <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-mono font-medium">
                            #{selectedUser.id.padStart(6, "0")}
                          </span>
                        </div>
                      </div>
                      {selectedUser.subRole !== "-" && (
                        <div className="flex items-start">
                          <Shield className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                          <div className="flex-1">
                            <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                              Sub Role
                            </span>
                            <div className="mt-1">{getSubRoleBadge(selectedUser.subRole)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                      Account Activity
                    </h3>
                    <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                            Last Login
                          </span>
                          <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                            {selectedUser.lastLogin}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                            Member Since
                          </span>
                          <span className="text-sm text-[hsl(var(--superadmin-foreground))] font-medium">
                            {formatJoinDate(selectedUser.joinDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="w-4 h-4 mr-3 mt-0.5 text-[hsl(var(--superadmin-muted-foreground))]" />
                        <div className="flex-1">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))] block">
                            Account Status
                          </span>
                          <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--superadmin-foreground))] mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-teal-500" />
                      Performance Overview
                    </h3>
                    <div className="space-y-3 bg-[hsl(var(--superadmin-card))] p-4 rounded-lg border border-[hsl(var(--superadmin-border))]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">Login Frequency</span>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">High</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">Engagement Level</span>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Active</Badge>
                      </div>
                      {selectedUser.role === "Student" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[hsl(var(--superadmin-muted-foreground))]">
                            Academic Standing
                          </span>
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Good</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-[hsl(var(--superadmin-border))]">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="flex-1 border-[hsl(var(--superadmin-border))] bg-transparent">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                {selectedUser.emergencyContact && (
                  <Button variant="outline" className="flex-1 border-[hsl(var(--superadmin-border))] bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Emergency
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
