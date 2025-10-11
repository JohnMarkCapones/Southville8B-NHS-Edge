"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  Heart,
  Cake,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRightIcon,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  KeyRound,
  Save,
  Briefcase,
  Users,
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
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label" // Added import for Label

const roleHierarchy = {
  Student: {
    label: "Student",
    subRoles: [
      "Club President",
      "Club Vice President",
      "Secretary",
      "Treasurer",
      "Auditor",
      "PIO",
      "Muse",
      "Escort",
      "Class Representative",
      "Peace Officer",
      "Business Manager",
      "Sergeant at Arms",
      "Environmental Officer",
      "Sports Captain",
      "IT Officer",
      "Health Officer",
      "Regular Student",
    ],
  },
  Teacher: {
    label: "Teacher",
    subRoles: [
      "Department Head",
      "Club Adviser",
      "Sports Coordinator",
      "Academic Coordinator",
      "Guidance Counselor",
      "Library Coordinator",
      "Research Coordinator",
      "Regular Teacher",
    ],
  },
  Administrator: {
    label: "Administrator",
    subRoles: ["Super Admin", "Assistant Admin", "Academic Coordinator", "System Administrator", "Regular Admin"],
  },
}

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
    guardian: {
      name: "Maria Doe",
      relationship: "Mother",
      phone: "+63 917 123 4567",
      email: "maria.doe@example.com",
      address: "123 Mabuhay St., Las Piñas City, Metro Manila",
    },
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
    address: "789 Kalaw St., Las Piñas City, Metro Manila",
    birthday: "2009-11-08",
    age: 14,
    emergencyContact: "Sarah Johnson (+63 921 333 4444)",
    bloodType: "A+",
    guardian: {
      name: "Sarah Johnson",
      relationship: "Mother",
      phone: "+63 921 333 4444",
      address: "789 Kalaw St., Las Piñas City, Metro Manila",
    },
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
    address: "321 Taft Ave., Parañaque City, Metro Manila",
    birthday: "1980-12-03",
    age: 43,
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
    address: "654 EDSA, Pasay City, Metro Manila",
    birthday: "1978-05-14",
    age: 45,
    emergencyContact: "Lisa Brown (+63 925 111 2222)",
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
    address: "987 Aurora Blvd., Quezon City, Metro Manila",
    birthday: "2008-01-20",
    age: 16,
    emergencyContact: "Carlos Garcia (+63 927 555 6666)",
    bloodType: "B+",
    guardian: {
      name: "Carlos Garcia",
      relationship: "Father",
      phone: "+63 927 555 6666",
      address: "987 Aurora Blvd., Quezon City, Metro Manila",
    },
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
    address: "111 Quezon Ave., Quezon City, Metro Manila",
    birthday: "2007-06-10",
    age: 16,
    emergencyContact: "Susan Lee (+63 929 999 0000)",
    bloodType: "AB+",
    guardian: {
      name: "Susan Lee",
      relationship: "Mother",
      phone: "+63 929 999 0000",
      address: "111 Quezon Ave., Quezon City, Metro Manila",
    },
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
    address: "222 Recto Ave., Manila, Metro Manila",
    birthday: "2008-09-05",
    age: 15,
    emergencyContact: "Michael Chen (+63 931 333 4444)",
    bloodType: "O-",
    guardian: {
      name: "Michael Chen",
      relationship: "Father",
      phone: "+63 931 333 4444",
      address: "222 Recto Ave., Manila, Metro Manila",
    },
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
    address: "333 España Blvd., Manila, Metro Manila",
    birthday: "2007-02-28",
    age: 17,
    emergencyContact: "Maria Rodriguez (+63 933 777 8888)",
    bloodType: "A-",
    guardian: {
      name: "Maria Rodriguez",
      relationship: "Mother",
      phone: "+63 933 777 8888",
      address: "333 España Blvd., Manila, Metro Manila",
    },
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
    address: "444 Legarda St., Manila, Metro Manila",
    birthday: "1990-11-11",
    age: 33,
    emergencyContact: "Jose Martinez (+63 935 111 2222)",
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
    address: "555 Magsaysay Blvd., Manila, Metro Manila",
    birthday: "2010-04-01",
    age: 13,
    emergencyContact: "Elizabeth Wilson (+63 937 555 6666)",
    bloodType: "B-",
    guardian: {
      name: "Elizabeth Wilson",
      relationship: "Mother",
      phone: "+63 937 555 6666",
      address: "555 Magsaysay Blvd., Manila, Metro Manila",
    },
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
    address: "666 Roxas Blvd., Pasay City, Metro Manila",
    birthday: "2010-08-25",
    age: 13,
    emergencyContact: "William Davis (+63 939 999 0000)",
    bloodType: "AB-",
    guardian: {
      name: "William Davis",
      relationship: "Father",
      phone: "+63 939 999 0000",
      address: "666 Roxas Blvd., Pasay City, Metro Manila",
    },
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
    address: "777 Ayala Ave., Makati City, Metro Manila",
    birthday: "1988-03-18",
    age: 35,
    emergencyContact: "Sophia Thompson (+63 941 333 4444)",
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
    address: "888 McKinley Hill, Taguig City, Metro Manila",
    birthday: "2009-07-07",
    age: 14,
    emergencyContact: "James Brown (+63 943 777 8888)",
    bloodType: "O+",
    guardian: {
      name: "James Brown",
      relationship: "Father",
      phone: "+63 943 777 8888",
      address: "888 McKinley Hill, Taguig City, Metro Manila",
    },
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
    address: "999 Bonifacio Global City, Taguig City, Metro Manila",
    birthday: "2008-12-12",
    age: 15,
    emergencyContact: "Eunice Kim (+63 945 111 2222)",
    bloodType: "A+",
    guardian: {
      name: "Eunice Kim",
      relationship: "Mother",
      phone: "+63 945 111 2222",
      address: "999 Bonifacio Global City, Taguig City, Metro Manila",
    },
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
    address: "101 Timog Ave., Quezon City, Metro Manila",
    birthday: "1992-09-30",
    age: 31,
    emergencyContact: "Peter Green (+63 947 555 6666)",
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
    address: "202 GMA Network Complex, Quezon City, Metro Manila",
    birthday: "2007-05-19",
    age: 16,
    emergencyContact: "Laura White (+63 949 999 0000)",
    bloodType: "B+",
    guardian: {
      name: "Laura White",
      relationship: "Mother",
      phone: "+63 949 999 0000",
      address: "202 GMA Network Complex, Quezon City, Metro Manila",
    },
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
    address: "303 Eastwood City, Quezon City, Metro Manila",
    birthday: "2009-02-14",
    age: 14,
    emergencyContact: "Mark Taylor (+63 951 333 4444)",
    bloodType: "AB+",
    guardian: {
      name: "Mark Taylor",
      relationship: "Father",
      phone: "+63 951 333 4444",
      address: "303 Eastwood City, Quezon City, Metro Manila",
    },
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
    address: "404 UP Diliman, Quezon City, Metro Manila",
    birthday: "1982-08-08",
    age: 41,
    emergencyContact: "Olivia Lee (+63 953 777 8888)",
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
    address: "505 Ateneo de Manila University, Quezon City, Metro Manila",
    birthday: "2008-10-31",
    age: 15,
    emergencyContact: "Paul Clark (+63 955 111 2222)",
    bloodType: "O-",
    guardian: {
      name: "Paul Clark",
      relationship: "Father",
      phone: "+63 955 111 2222",
      address: "505 Ateneo de Manila University, Quezon City, Metro Manila",
    },
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
    address: "606 La Salle University, Manila, Metro Manila",
    birthday: "2007-01-01",
    age: 17,
    emergencyContact: "Linda Miller (+63 957 555 6666)",
    bloodType: "A-",
    guardian: {
      name: "Linda Miller",
      relationship: "Mother",
      phone: "+63 957 555 6666",
      address: "606 La Salle University, Manila, Metro Manila",
    },
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
    address: "707 San Beda University, Manila, Metro Manila",
    birthday: "1995-06-15",
    age: 28,
    emergencyContact: "George Anderson (+63 959 999 0000)",
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
    address: "808 Far Eastern University, Manila, Metro Manila",
    birthday: "2010-09-09",
    age: 13,
    emergencyContact: "Brenda Moore (+63 961 333 4444)",
    bloodType: "B-",
    guardian: {
      name: "Brenda Moore",
      relationship: "Mother",
      phone: "+63 961 333 4444",
      address: "808 Far Eastern University, Manila, Metro Manila",
    },
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
    address: "909 University of Santo Tomas, Manila, Metro Manila",
    birthday: "2010-03-03",
    age: 13,
    emergencyContact: "Steven Harris (+63 963 777 8888)",
    bloodType: "AB-",
    guardian: {
      name: "Steven Harris",
      relationship: "Father",
      phone: "+63 963 777 8888",
      address: "909 University of Santo Tomas, Manila, Metro Manila",
    },
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
    address: "1001 Philippine Normal University, Manila, Metro Manila",
    birthday: "1989-07-17",
    age: 34,
    emergencyContact: "Patricia Wright (+63 965 111 2222)",
  },
]

const archivedUsers = [
  {
    id: "arch-1",
    name: "Thomas Anderson",
    email: "thomas.anderson@southville8b.edu.ph",
    role: "Student",
    subRole: "Club President",
    status: "Archived",
    lastLogin: "2023-12-20 03:15 PM",
    joinDate: "2023-08-15",
    archivedDate: "2024-01-10",
    archivedBy: "Sarah Wilson",
    archivedReason: "Transferred to another school",
    grade: "Grade 8-A",
    phone: "+63 912 345 6789",
    address: "123 Mabuhay St., Las Piñas City, Metro Manila",
    birthday: "2009-03-15",
    age: 15,
  },
  {
    id: "arch-2",
    name: "Patricia Johnson",
    email: "patricia.johnson@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Department Head",
    status: "Archived",
    lastLogin: "2023-11-30 10:20 AM",
    joinDate: "2021-06-01",
    archivedDate: "2023-12-15",
    archivedBy: "Sarah Wilson",
    archivedReason: "Resigned - Career change",
    department: "History",
    phone: "+63 918 765 4321",
    address: "456 Rizal Ave., Muntinlupa City, Metro Manila",
    birthday: "1985-07-22",
    age: 38,
  },
  {
    id: "arch-3",
    name: "Marcus Williams",
    email: "marcus.williams@southville8b.edu.ph",
    role: "Student",
    subRole: "Secretary",
    status: "Archived",
    lastLogin: "2023-10-15 02:45 PM",
    joinDate: "2023-08-15",
    archivedDate: "2023-11-01",
    archivedBy: "David Brown",
    archivedReason: "Disciplinary action - Pending review",
    grade: "Grade 9-B",
    phone: "+63 920 111 2222",
    address: "789 Kalaw St., Las Piñas City, Metro Manila",
    birthday: "2008-11-08",
    age: 15,
  },
  {
    id: "arch-4",
    name: "Jennifer Lopez",
    email: "jennifer.lopez@southville8b.edu.ph",
    role: "Teacher",
    subRole: "Club Adviser",
    status: "Archived",
    lastLogin: "2023-09-20 04:30 PM",
    joinDate: "2022-03-10",
    archivedDate: "2023-10-01",
    archivedBy: "Sarah Wilson",
    archivedReason: "Contract ended - Not renewed",
    department: "Arts",
    phone: "+63 922 555 6666",
    address: "321 Taft Ave., Parañaque City, Metro Manila",
    birthday: "1990-12-03",
    age: 33,
  },
  {
    id: "arch-5",
    name: "Kevin Santos",
    email: "kevin.santos@southville8b.edu.ph",
    role: "Student",
    subRole: "Treasurer",
    status: "Archived",
    lastLogin: "2023-12-05 11:15 AM",
    joinDate: "2023-08-15",
    archivedDate: "2024-01-05",
    archivedBy: "David Brown",
    archivedReason: "Family relocation abroad",
    grade: "Grade 10-C",
    phone: "+63 926 333 4444",
    address: "987 Aurora Blvd., Quezon City, Metro Manila",
    birthday: "2007-01-20",
    age: 17,
  },
]

const stats = [
  { label: "Total Users", value: "1,247", change: "+12%" },
  { label: "Active Users", value: "1,156", change: "+8%" },
  { label: "New This Month", value: "23", change: "+15%" },
  { label: "Inactive Users", value: "91", change: "-5%" },
]

export function AllUsersManagementSection() {
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subRoleFilter, setSubRoleFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  // Replaced contextMenuUser with a more comprehensive contextMenu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    user: any
    visible: boolean
  }>({ x: 0, y: 0, user: null, visible: false })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    user: any
  }>({ isOpen: false, user: null })

  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false)
  const [archivedSearchTerm, setArchivedSearchTerm] = useState("")
  const [archivedRoleFilter, setArchivedRoleFilter] = useState("all")
  const [selectedArchivedUsers, setSelectedArchivedUsers] = useState<string[]>([])
  const [archivedCurrentPage, setArchivedCurrentPage] = useState(1)
  const [archivedItemsPerPage, setArchivedItemsPerPage] = useState(10)
  const [restoreConfirmation, setRestoreConfirmation] = useState<{
    isOpen: boolean
    user: any
  }>({ isOpen: false, user: null })
  const [permanentDeleteConfirmation, setPermanentDeleteConfirmation] = useState<{
    isOpen: boolean
    user: any
  }>({ isOpen: false, user: null })
  const [bulkRestoreConfirmation, setBulkRestoreConfirmation] = useState(false)
  const [bulkPermanentDeleteConfirmation, setBulkPermanentDeleteConfirmation] = useState(false)

  const [resetPasswordConfirmation, setResetPasswordConfirmation] = useState<{
    isOpen: boolean
    user: any
  }>({ isOpen: false, user: null })

  const [editUserDialog, setEditUserDialog] = useState<{
    isOpen: boolean
    user: any
  }>({ isOpen: false, user: null })

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    subRole: "",
    phone: "",
    address: "",
    birthday: "",
    emergencyContact: "",
    // Student-specific
    grade: "",
    bloodType: "",
    guardian: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
    },
    // Teacher/Admin-specific
    department: "",
  })

  const [primaryRoleMenu, setPrimaryRoleMenu] = useState<{
    x: number
    y: number
    user: any
    visible: boolean
  }>({ x: 0, y: 0, user: null, visible: false })

  const [subRoleMenu, setSubRoleMenu] = useState<{
    x: number
    y: number
    user: any
    visible: boolean
  }>({ x: 0, y: 0, user: null, visible: false })

  const handleContextMenu = (e: React.MouseEvent, user: any) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user,
      visible: true,
    })
  }

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  const handlePrimaryRoleClick = (e: React.MouseEvent, user: any) => {
    e.preventDefault()
    e.stopPropagation()
    setPrimaryRoleMenu({
      x: e.clientX,
      y: e.clientY,
      user,
      visible: true,
    })
  }

  const handleSubRoleClick = (e: React.MouseEvent, user: any) => {
    e.preventDefault()
    e.stopPropagation()
    setSubRoleMenu({
      x: e.clientX,
      y: e.clientY,
      user,
      visible: true,
    })
  }

  const closePrimaryRoleMenu = () => {
    setPrimaryRoleMenu((prev) => ({ ...prev, visible: false }))
  }

  const closeSubRoleMenu = () => {
    setSubRoleMenu((prev) => ({ ...prev, visible: false }))
  }

  const handlePrimaryRoleChange = (user: any, newRole: string) => {
    console.log("[v0] Changing primary role for", user.name, "to", newRole)

    toast({
      title: "✅ Primary Role Updated",
      description: (
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            {user.name}'s role has been changed to {newRole}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
              {getUserInitials(user.name)}
            </div>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md w-fit">
            <CheckCircle className="w-3 h-3" />
            <span>Sub-role cleared - click to assign new sub-role</span>
          </div>
        </div>
      ),
      variant: "default",
      duration: 5000,
      className: "border-blue-500/20 bg-blue-500/5 backdrop-blur-md",
    })

    closePrimaryRoleMenu()
  }

  const handleSubRoleChange = (user: any, newSubRole: string) => {
    console.log("[v0] Changing sub-role for", user.name, "to", newSubRole)

    toast({
      title: "✅ Sub-Role Updated",
      description: (
        <div className="space-y-2">
          <p className="font-medium text-foreground">
            {user.name}'s sub-role has been set to {newSubRole}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
              {getUserInitials(user.name)}
            </div>
            <span>
              {user.role} • {newSubRole}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
            <CheckCircle className="w-3 h-3" />
            <span>Permissions updated automatically</span>
          </div>
        </div>
      ),
      variant: "default",
      duration: 5000,
      className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
    })

    closeSubRoleMenu()
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  const handleEditUser = (user: any) => {
    let guardianData = {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
    }

    if (typeof user.guardian === "string") {
      guardianData.name = user.guardian
    } else if (user.guardian && typeof user.guardian === "object") {
      guardianData = { ...guardianData, ...user.guardian }
    }

    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      subRole: user.subRole || "",
      phone: user.phone || "",
      address: user.address || "",
      birthday: user.birthday || "",
      emergencyContact: user.emergencyContact || "",
      grade: user.grade || "",
      bloodType: user.bloodType || "",
      guardian: guardianData,
      department: user.department || "",
    })
    setEditUserDialog({ isOpen: true, user })
  }

  const handleSaveEditUser = () => {
    if (!editUserDialog.user) return

    // TODO: Implement actual API call to update user
    console.log("[v0] Saving user changes:", editFormData)

    toast({
      title: "User Updated",
      description: `${editFormData.name}'s information has been successfully updated.`,
    })

    setTimeout(() => {
      setEditUserDialog({ isOpen: false, user: null })
    }, 1500)
  }

  const handleDeleteUser = (user: any) => {
    setDeleteConfirmation({ isOpen: true, user })
  }

  const handleChangeStatus = (user: any, newStatus: string) => {
    console.log("[v0] Change status for", user.name, "to", newStatus)
    // TODO: Implement status change functionality
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

  const calculateAge = (birthday: string) => {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleResetPassword = (user: any) => {
    console.log("[v0] Resetting password for user:", user.name)
    toast({
      title: "Password Reset",
      description: `Password has been reset for ${user.name}. The user has been logged out.`,
      variant: "default",
    })
    setResetPasswordConfirmation({ isOpen: false, user: null })
  }

  const confirmDeleteUser = () => {
    if (deleteConfirmation.user) {
      console.log("[v0] Deleting user:", deleteConfirmation.user.name)

      // Enhanced toast with better styling and more details
      toast({
        title: "✅ User Deleted Successfully",
        description: (
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {deleteConfirmation.user.name} has been permanently removed from the system.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                {getUserInitials(deleteConfirmation.user.name)}
              </div>
              <span>{deleteConfirmation.user.email}</span>
              <span>•</span>
              <span>{deleteConfirmation.user.role}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
              <CheckCircle className="w-3 h-3" />
              <span>All user data permanently removed</span>
            </div>
          </div>
        ),
        variant: "default",
        duration: 6000,
        className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
      })

      // TODO: Implement actual delete functionality
      setDeleteConfirmation({ isOpen: false, user: null })
    }
  }

  const cancelDeleteUser = () => {
    setDeleteConfirmation({ isOpen: false, user: null })
  }

  const handleRestoreUser = (user: any) => {
    console.log("[v0] Restoring user:", user.name)
    toast({
      title: "User Restored",
      description: `${user.name} has been restored to active status.`,
      variant: "default",
    })
    setRestoreConfirmation({ isOpen: false, user: null })
  }

  const handlePermanentDelete = (user: any) => {
    console.log("[v0] Permanently deleting user:", user.name)
    toast({
      title: "User Permanently Deleted",
      description: `${user.name} has been permanently removed from the system.`,
      variant: "destructive",
    })
    setPermanentDeleteConfirmation({ isOpen: false, user: null })
  }

  const handleBulkRestore = () => {
    console.log("[v0] Bulk restoring users:", selectedArchivedUsers)
    toast({
      title: "Users Restored",
      description: `${selectedArchivedUsers.length} user(s) have been restored to active status.`,
      variant: "default",
    })
    setSelectedArchivedUsers([])
    setBulkRestoreConfirmation(false)
  }

  const handleBulkPermanentDelete = () => {
    console.log("[v0] Bulk permanently deleting users:", selectedArchivedUsers)
    toast({
      title: "Users Permanently Deleted",
      description: `${selectedArchivedUsers.length} user(s) have been permanently removed from the system.`,
      variant: "destructive",
    })
    setSelectedArchivedUsers([])
    setBulkPermanentDeleteConfirmation(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      closeContextMenu()
      closePrimaryRoleMenu()
      closeSubRoleMenu()
    }
    const handleClick = () => {
      closeContextMenu()
      closePrimaryRoleMenu()
      closeSubRoleMenu()
    }
    const handleResize = () => {
      closeContextMenu()
      closePrimaryRoleMenu()
      closeSubRoleMenu()
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContextMenu()
        closePrimaryRoleMenu()
        closeSubRoleMenu()
      }
    }

    if (contextMenu.visible || primaryRoleMenu.visible || subRoleMenu.visible) {
      document.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("click", handleClick)
      document.addEventListener("contextmenu", handleClick)
      window.addEventListener("resize", handleResize)
      document.addEventListener("keydown", handleEscape)

      const tableContainer = document.querySelector("[data-table-container]")
      if (tableContainer) {
        tableContainer.addEventListener("scroll", handleScroll, { passive: true })
      }

      return () => {
        document.removeEventListener("scroll", handleScroll)
        document.removeEventListener("click", handleClick)
        document.removeEventListener("contextmenu", handleClick)
        window.removeEventListener("resize", handleResize)
        document.removeEventListener("keydown", handleEscape)
        if (tableContainer) {
          tableContainer.removeEventListener("scroll", handleScroll)
        }
      }
    }
  }, [contextMenu.visible, primaryRoleMenu.visible, subRoleMenu.visible])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    const matchesSubRole = subRoleFilter === "all" || user.subRole.toLowerCase().includes(subRoleFilter.toLowerCase())

    return matchesSearch && matchesRole && matchesStatus && matchesSubRole
  })

  const filteredArchivedUsers = archivedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(archivedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(archivedSearchTerm.toLowerCase())
    const matchesRole = archivedRoleFilter === "all" || user.role.toLowerCase() === archivedRoleFilter

    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

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

  const handleArchivedFilterChange = (filterType: string, value: string) => {
    setArchivedCurrentPage(1)
    if (filterType === "role") {
      setArchivedRoleFilter(value)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectAllArchived = (checked: boolean) => {
    if (checked) {
      setSelectedArchivedUsers(paginatedArchivedUsers.map((user) => user.id))
    } else {
      setSelectedArchivedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleSelectArchivedUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedArchivedUsers([...selectedArchivedUsers, userId])
    } else {
      setSelectedArchivedUsers(selectedArchivedUsers.filter((id) => id !== userId))
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
    ) : (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
    )
  }

  const getPrimaryRoleBadge = (role: string, user: any) => {
    const colors = {
      Student: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
      Teacher: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
      Administrator: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
    }

    return (
      <Badge
        className={`${colors[role as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"} cursor-pointer transition-all duration-200 hover:scale-105`}
        onClick={(e) => handlePrimaryRoleClick(e, user)}
      >
        {role}
      </Badge>
    )
  }

  const getSubRoleBadge = (subRole: string, user: any) => {
    if (subRole === "-" || !subRole) {
      return (
        <Badge
          className="bg-muted/50 text-muted-foreground border-dashed border-border hover:bg-muted/80 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={(e) => handleSubRoleClick(e, user)}
        >
          None
        </Badge>
      )
    }

    const colors = {
      // Teacher sub roles
      "Club Adviser": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
      "Department Head": "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20",
      "Sports Coordinator": "bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20",
      "Academic Coordinator": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20",
      "Guidance Counselor": "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
      "Library Coordinator": "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20",
      "Research Coordinator": "bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20",
      "Regular Teacher": "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",

      // Student sub roles
      "Club President": "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
      "Club Vice President": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
      Secretary: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20",
      PIO: "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500/20",
      Escort: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20",
      Muse: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20",
      Treasurer: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
      Auditor: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
      "Class Representative": "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
      "Peace Officer": "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      "Business Manager": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
      "Sergeant at Arms": "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20",
      "Environmental Officer": "bg-lime-500/10 text-lime-600 border-lime-500/20 hover:bg-lime-500/20",
      "Sports Captain": "bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/20",
      "IT Officer": "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
      "Health Officer": "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500/20",
      "Regular Student": "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    }

    return (
      <Badge
        className={`${colors[subRole as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20"} cursor-pointer transition-all duration-200 hover:scale-105`}
        onClick={(e) => handleSubRoleClick(e, user)}
      >
        {subRole}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">All Users Management</h3>
          <p className="text-muted-foreground">
            Comprehensive user management system for all user types including students, teachers, and administrators.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-foreground text-foreground bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="text-sm text-green-500">{stat.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">User Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Search, filter, and manage users across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="administrator">Administrators</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subRoleFilter} onValueChange={(value) => handleFilterChange("subRole", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by sub-role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Sub-Roles</SelectItem>
                <SelectItem value="club">Club Positions</SelectItem>
                <SelectItem value="officer">Officers</SelectItem>
                <SelectItem value="coordinator">Coordinators</SelectItem>
                <SelectItem value="adviser">Advisers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="text-sm text-foreground">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-border bg-transparent">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" className="border-border bg-transparent">
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

          {/* Users Table */}
          <div className="border border-border rounded-lg" data-table-container>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground">Sub Role</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-border cursor-pointer hover:bg-muted/50"
                    onContextMenu={(e) => handleContextMenu(e, user)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPrimaryRoleBadge(user.role, user)}</TableCell>
                    <TableCell>{getSubRoleBadge(user.subRole, user)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
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
                          <DropdownMenuItem className="text-foreground" onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() => setResetPasswordConfirmation({ isOpen: true, user })}
                          >
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteUser(user)}>
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
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredUsers.length} total users)
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

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-foreground">Archived Users</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage deleted users and restore or permanently remove them
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsArchivedSectionOpen(!isArchivedSectionOpen)}
              className="border-border"
            >
              {isArchivedSectionOpen ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show ({archivedUsers.length})
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {isArchivedSectionOpen && (
          <CardContent className="space-y-4">
            {/* Warning Notice */}
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm text-muted-foreground">
                Archived users are kept for 90 days before automatic permanent deletion. Restored users will regain
                their previous access and permissions.
              </AlertDescription>
            </Alert>

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
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <Select value={archivedRoleFilter} onValueChange={(value) => handleArchivedFilterChange("role", value)}>
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="administrator">Administrators</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={archivedItemsPerPage.toString()}
                onValueChange={(value) => {
                  setArchivedItemsPerPage(Number(value))
                  setArchivedCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[120px] bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions for Archived Users */}
            {selectedArchivedUsers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedArchivedUsers.length} archived user{selectedArchivedUsers.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/20 bg-green-500/5 text-green-600 hover:bg-green-500/10"
                    onClick={() => setBulkRestoreConfirmation(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setBulkPermanentDeleteConfirmation(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Archived Users Table */}
            <div className="border border-border rounded-lg opacity-70">
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
                    <TableHead className="text-foreground">Archived Date</TableHead>
                    <TableHead className="text-foreground">Archived By</TableHead>
                    <TableHead className="text-foreground">Reason</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedArchivedUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedArchivedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectArchivedUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="opacity-70">
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "Student"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : user.role === "Teacher"
                                ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.archivedDate}</TableCell>
                      <TableCell className="text-muted-foreground">{user.archivedBy}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {user.archivedReason}
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
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => setRestoreConfirmation({ isOpen: true, user })}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restore User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => setPermanentDeleteConfirmation({ isOpen: true, user })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Permanently Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Archived Users Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {archivedCurrentPage} of {archivedTotalPages} ({filteredArchivedUsers.length} archived users)
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
          </CardContent>
        )}
      </Card>

      {/* User Details Sheet Panel */}
      <Sheet open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <SheetContent side="right" className="w-[40vw] min-w-[600px] max-w-[1600px] overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="pb-6">
                <SheetTitle className="text-2xl font-bold text-foreground">User Profile</SheetTitle>
              </SheetHeader>

              {/* Profile Header */}
              <div className="flex flex-col items-center text-center mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-border">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                  {getUserInitials(selectedUser.name)}
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-3">{selectedUser.name}</h2>
                <div className="flex items-center gap-3 mb-4">
                  {getPrimaryRoleBadge(selectedUser.role, selectedUser)}
                  {selectedUser.subRole !== "-" && getSubRoleBadge(selectedUser.subRole, selectedUser)}
                </div>
                {getStatusBadge(selectedUser.status)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Personal & Contact & Emergency */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <User className="w-6 h-6 mr-3 text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                      <div className="flex items-start">
                        <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Full Name</span>
                          <span className="text-base text-foreground font-medium">{selectedUser.name}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Cake className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Birthday</span>
                          <span className="text-base text-foreground font-medium">
                            {formatBirthday(selectedUser.birthday)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Age</span>
                          <span className="text-base text-foreground font-medium">{selectedUser.age} years old</span>
                        </div>
                      </div>
                      {selectedUser.bloodType && (
                        <div className="flex items-start">
                          <Heart className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground block mb-1">Blood Type</span>
                            <span className="text-base text-foreground font-medium">{selectedUser.bloodType}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <Mail className="w-6 h-6 mr-3 text-green-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Email Address</span>
                          <span className="text-base text-foreground font-medium break-all">{selectedUser.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Phone Number</span>
                          <span className="text-base text-foreground font-medium">{selectedUser.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Address</span>
                          <span className="text-base text-foreground font-medium leading-relaxed">
                            {selectedUser.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <Phone className="w-6 h-6 mr-3 text-red-500" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Emergency Contact</span>
                          <span className="text-base text-foreground font-medium">{selectedUser.emergencyContact}</span>
                        </div>
                      </div>
                      {selectedUser.guardian && (
                        <div className="flex items-start">
                          <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground block mb-1">Guardian</span>
                            <span className="text-base text-foreground font-medium">
                              {typeof selectedUser.guardian === "string"
                                ? selectedUser.guardian
                                : selectedUser.guardian.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Academic/Professional & System & Actions */}
                <div className="space-y-6">
                  {/* Academic/Professional Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      {selectedUser.role === "Student" ? (
                        <GraduationCap className="w-6 h-6 mr-3 text-purple-500" />
                      ) : (
                        <Briefcase className="w-6 h-6 mr-3 text-orange-500" />
                      )}
                      {selectedUser.role === "Student" ? "Academic Information" : "Professional Information"}
                    </h3>
                    <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                      {selectedUser.role === "Student" && selectedUser.grade && (
                        <>
                          <div className="flex items-start">
                            <GraduationCap className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Grade Level</span>
                              <span className="text-base text-foreground font-medium">{selectedUser.grade}</span>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Building className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Section</span>
                              <span className="text-base text-foreground font-medium">
                                {selectedUser.grade?.split("-")[1] || "A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Student ID</span>
                              <span className="text-base text-foreground font-mono font-medium">
                                STU-{selectedUser.id.padStart(6, "0")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <GraduationCap className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Academic Year</span>
                              <span className="text-base text-foreground font-medium">2024-2025</span>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Enrollment Status</span>
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Enrolled</Badge>
                            </div>
                          </div>
                        </>
                      )}
                      {(selectedUser.role === "Teacher" || selectedUser.role === "Administrator") && (
                        <>
                          {selectedUser.department && (
                            <div className="flex items-start">
                              <Building className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                              <div className="flex-1">
                                <span className="text-sm text-muted-foreground block mb-1">Department</span>
                                <span className="text-base text-foreground font-medium">{selectedUser.department}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start">
                            <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Employee ID</span>
                              <span className="text-base text-foreground font-mono font-medium">
                                {selectedUser.role === "Teacher" ? "TCH" : "ADM"}-{selectedUser.id.padStart(6, "0")}
                              </span>
                            </div>
                          </div>
                          {selectedUser.role === "Teacher" && (
                            <>
                              <div className="flex items-start">
                                <GraduationCap className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                                <div className="flex-1">
                                  <span className="text-sm text-muted-foreground block mb-1">Teaching Load</span>
                                  <span className="text-base text-foreground font-medium">24 hours/week</span>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Building className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                                <div className="flex-1">
                                  <span className="text-sm text-muted-foreground block mb-1">Office Location</span>
                                  <span className="text-base text-foreground font-medium">Faculty Room 2</span>
                                </div>
                              </div>
                            </>
                          )}
                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground block mb-1">Employment Status</span>
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Full-time</Badge>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedUser.subRole !== "-" && (
                        <div className="flex items-start">
                          <Shield className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground block mb-1">Sub Role</span>
                            <div className="mt-2">{getSubRoleBadge(selectedUser.subRole, selectedUser)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Activity & System Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-indigo-500" />
                      Account & System Information
                    </h3>
                    <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Last Login</span>
                          <span className="text-base text-foreground font-medium">{selectedUser.lastLogin}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Member Since</span>
                          <span className="text-base text-foreground font-medium">
                            {formatJoinDate(selectedUser.joinDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Account Status</span>
                          <div className="mt-2">{getStatusBadge(selectedUser.status)}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Account Type</span>
                          <div className="mt-2">{getPrimaryRoleBadge(selectedUser.role, selectedUser)}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Permissions</span>
                          <span className="text-base text-foreground font-medium">
                            {selectedUser.role === "Student"
                              ? "Student Access"
                              : selectedUser.role === "Teacher"
                                ? "Teacher Access"
                                : "Admin Access"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="w-5 h-5 mr-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Profile Completion</span>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-secondary rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                            </div>
                            <span className="text-sm text-foreground font-medium">85%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance & Quick Actions */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <GraduationCap className="w-6 h-6 mr-3 text-teal-500" />
                      Performance & Actions
                    </h3>
                    <div className="bg-card p-6 rounded-lg border border-border">
                      <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Performance Metrics</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-base text-muted-foreground">Login Frequency</span>
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">High</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-base text-muted-foreground">Engagement Level</span>
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Active</Badge>
                            </div>
                            {selectedUser.role === "Student" && (
                              <div className="flex items-center justify-between">
                                <span className="text-base text-muted-foreground">Academic Standing</span>
                                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Good</Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Button className="justify-start bg-blue-600 hover:bg-blue-700 text-white">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" className="justify-start border-border bg-transparent">
                              <Mail className="w-4 h-4 mr-2" />
                              Send
                            </Button>
                            <Button variant="outline" className="justify-start border-border bg-transparent">
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                            {selectedUser.role === "Student" && (
                              <Button variant="outline" className="justify-start border-border bg-transparent">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {contextMenu.visible && contextMenu.user && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={closeContextMenu} />

          <div
            className="fixed z-50 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl py-1 min-w-[220px] animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 320)}px`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 text-sm text-foreground hover:bg-muted/80 cursor-pointer flex items-center transition-all duration-150 hover:translate-x-1 group rounded-lg mx-1"
              onClick={() => {
                handleViewUser(contextMenu.user)
                closeContextMenu()
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">View Profile</span>
            </div>

            <div
              className="px-4 py-3 text-sm text-foreground hover:bg-muted/80 cursor-pointer flex items-center transition-all duration-150 hover:translate-x-1 group rounded-lg mx-1"
              onClick={() => {
                handleEditUser(contextMenu.user)
                closeContextMenu()
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3 group-hover:bg-green-500/20 transition-colors">
                <Edit className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium">Edit User</span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2 mx-3"></div>

            <div className="px-4 py-3 text-sm text-foreground hover:bg-muted/80 cursor-pointer flex items-center justify-between group relative rounded-lg mx-1 transition-all duration-150 hover:translate-x-1">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3 group-hover:bg-purple-500/20 transition-colors">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">Change Status</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted-foreground/20 transition-colors">
                <ChevronRightIcon className="w-3 h-3 text-muted-foreground" />
              </div>

              <div
                className="absolute left-full top-0 ml-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl py-2 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-in fade-in-0 slide-in-from-left-2"
                style={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                }}
              >
                <div
                  className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                    contextMenu.user.status === "Active"
                      ? "text-muted-foreground cursor-not-allowed bg-muted/30"
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    if (contextMenu.user.status !== "Active") {
                      handleChangeStatus(contextMenu.user, "Active")
                      closeContextMenu()
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="font-medium">Active</span>
                  </div>
                  {contextMenu.user.status === "Active" && (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>

                <div
                  className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                    contextMenu.user.status === "Inactive"
                      ? "text-muted-foreground cursor-not-allowed bg-muted/30"
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    if (contextMenu.user.status !== "Inactive") {
                      handleChangeStatus(contextMenu.user, "Inactive")
                      closeContextMenu()
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg bg-gray-500/10 flex items-center justify-center mr-3">
                      <XCircle className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <span className="font-medium">Inactive</span>
                  </div>
                  {contextMenu.user.status === "Inactive" && (
                    <div className="w-5 h-5 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    </div>
                  )}
                </div>

                <div
                  className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                    contextMenu.user.status === "Suspended"
                      ? "text-muted-foreground cursor-not-allowed bg-muted/30"
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    if (contextMenu.user.status !== "Suspended") {
                      handleChangeStatus(contextMenu.user, "Suspended")
                      closeContextMenu()
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center mr-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="font-medium">Suspended</span>
                  </div>
                  {contextMenu.user.status === "Suspended" && (
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2 mx-3"></div>

            <div
              className="px-4 py-3 text-sm text-red-600 hover:bg-red-500/10 cursor-pointer flex items-center transition-all duration-150 hover:translate-x-1 group rounded-lg mx-1"
              onClick={() => {
                handleDeleteUser(contextMenu.user)
                closeContextMenu()
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-3 group-hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">Delete User</span>
            </div>
          </div>
        </>
      )}

      {/* Primary Role Menu */}
      {primaryRoleMenu.visible && primaryRoleMenu.user && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={closePrimaryRoleMenu} />

          <div
            className="fixed z-50 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl py-2 min-w-[240px] animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              left: `${Math.min(primaryRoleMenu.x, window.innerWidth - 260)}px`,
              top: `${Math.min(primaryRoleMenu.y, window.innerHeight - 300)}px`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {getUserInitials(primaryRoleMenu.user.name)}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{primaryRoleMenu.user.name}</p>
                  <p className="text-xs text-muted-foreground">Change Primary Role</p>
                </div>
              </div>
            </div>

            {/* Primary Role Options */}
            <div className="py-2">
              {Object.entries(roleHierarchy).map(([roleKey, roleData]) => (
                <div
                  key={roleKey}
                  className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                    primaryRoleMenu.user.role === roleKey ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handlePrimaryRoleChange(primaryRoleMenu.user, roleKey)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        roleKey === "Student"
                          ? "bg-blue-500/10"
                          : roleKey === "Teacher"
                            ? "bg-purple-500/10"
                            : "bg-orange-500/10"
                      }`}
                    >
                      {roleKey === "Student" ? (
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      ) : roleKey === "Teacher" ? (
                        <User className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Shield className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">{roleData.label}</span>
                  </div>
                  {primaryRoleMenu.user.role === roleKey && (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                Sub-role will be cleared when changing primary role
              </p>
            </div>
          </div>
        </>
      )}

      {/* Sub-Role Menu */}
      {subRoleMenu.visible && subRoleMenu.user && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={closeSubRoleMenu} />

          <div
            className="fixed z-50 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl py-2 min-w-[260px] max-h-[400px] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              left: `${Math.min(subRoleMenu.x, window.innerWidth - 280)}px`,
              top: `${Math.min(subRoleMenu.y, window.innerHeight - 420)}px`,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/30 sticky top-0 bg-card/95 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {getUserInitials(subRoleMenu.user.name)}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{subRoleMenu.user.name}</p>
                  <p className="text-xs text-muted-foreground">{subRoleMenu.user.role} Sub-Roles</p>
                </div>
              </div>
            </div>

            {/* Sub-Role Options */}
            <div className="py-2">
              {/* None/Clear Option */}
              <div
                className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                  !subRoleMenu.user.subRole || subRoleMenu.user.subRole === "-" ? "bg-muted/50" : ""
                }`}
                onClick={() => handleSubRoleChange(subRoleMenu.user, "-")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center mr-3">
                    <XCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-foreground">None</span>
                </div>
                {(!subRoleMenu.user.subRole || subRoleMenu.user.subRole === "-") && (
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                )}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2 mx-3"></div>

              {/* Available Sub-Roles for Current Primary Role */}
              {roleHierarchy[subRoleMenu.user.role as keyof typeof roleHierarchy]?.subRoles.map((subRole) => (
                <div
                  key={subRole}
                  className={`px-4 py-3 text-sm hover:bg-muted/80 cursor-pointer flex items-center justify-between transition-all duration-150 hover:translate-x-1 rounded-lg mx-1 ${
                    subRoleMenu.user.subRole === subRole ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleSubRoleChange(subRoleMenu.user, subRole)}
                >
                  <span className="font-medium text-foreground">{subRole}</span>
                  {subRoleMenu.user.subRole === subRole && (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/30 sticky bottom-0 bg-card/95 backdrop-blur-md">
              <p className="text-xs text-muted-foreground text-center">
                Sub-roles available for {subRoleMenu.user.role}s only
              </p>
            </div>
          </div>
        </>
      )}

      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={resetPasswordConfirmation.isOpen}
        onOpenChange={(open) => setResetPasswordConfirmation({ isOpen: open, user: null })}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-orange-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to reset this account&apos;s password? This will log the user out immediately.
            </DialogDescription>
          </DialogHeader>
          {resetPasswordConfirmation.user && (
            <div className="space-y-2 py-4">
              <Alert className="border-orange-500/20 bg-orange-500/5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm text-orange-600">
                  The user will be logged out of all devices and will need to use the new password to log back in.
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2 mt-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{resetPasswordConfirmation.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{resetPasswordConfirmation.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{resetPasswordConfirmation.user.role}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordConfirmation({ isOpen: false, user: null })}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => handleResetPassword(resetPasswordConfirmation.user)}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={restoreConfirmation.isOpen}
        onOpenChange={(open) => setRestoreConfirmation({ isOpen: open, user: null })}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-green-500" />
              Restore User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to restore this user? They will regain their previous access and permissions.
            </DialogDescription>
          </DialogHeader>
          {restoreConfirmation.user && (
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{restoreConfirmation.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{restoreConfirmation.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{restoreConfirmation.user.role}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreConfirmation({ isOpen: false, user: null })}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleRestoreUser(restoreConfirmation.user)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={permanentDeleteConfirmation.isOpen}
        onOpenChange={(open) => setPermanentDeleteConfirmation({ isOpen: open, user: null })}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Permanently Delete User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the user and remove all their data from the
              system.
            </DialogDescription>
          </DialogHeader>
          {permanentDeleteConfirmation.user && (
            <div className="space-y-2 py-4">
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-sm text-red-600">
                  Warning: This will permanently delete all records, files, and data associated with this user.
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2 mt-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{permanentDeleteConfirmation.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{permanentDeleteConfirmation.user.email}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteConfirmation({ isOpen: false, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handlePermanentDelete(permanentDeleteConfirmation.user)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkRestoreConfirmation} onOpenChange={setBulkRestoreConfirmation}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-green-500" />
              Restore Multiple Users
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to restore {selectedArchivedUsers.length} user(s)? They will regain their previous
              access and permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRestoreConfirmation(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleBulkRestore}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore {selectedArchivedUsers.length} User(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkPermanentDeleteConfirmation} onOpenChange={setBulkPermanentDeleteConfirmation}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Permanently Delete Multiple Users
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete {selectedArchivedUsers.length} user(s) and
              remove all their data from the system.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm text-red-600">
              Warning: This will permanently delete all records, files, and data associated with these users.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPermanentDeleteConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkPermanentDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Permanently Delete {selectedArchivedUsers.length} User(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation({ isOpen: open, user: null })}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the user and remove all their data from the
              system.
            </DialogDescription>
          </DialogHeader>
          {deleteConfirmation.user && (
            <div className="space-y-2 py-4">
              <Alert className="border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-sm text-red-600">
                  Warning: This will permanently delete all records, files, and data associated with this user.
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2 mt-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{deleteConfirmation.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{deleteConfirmation.user.email}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editUserDialog.isOpen}
        onOpenChange={(open) => !open && setEditUserDialog({ isOpen: false, user: null })}
      >
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-500" />
              Edit User Information
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update user details and account settings. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          {editUserDialog.user && (
            <div className="space-y-6 py-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <User className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-foreground">Basic Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-foreground">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-birthday" className="text-foreground">
                      Birthday
                    </Label>
                    <Input
                      id="edit-birthday"
                      type="date"
                      value={editFormData.birthday}
                      onChange={(e) => setEditFormData({ ...editFormData, birthday: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address" className="text-foreground">
                    Address
                  </Label>
                  <Input
                    id="edit-address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="bg-background border-border text-foreground"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-emergency" className="text-foreground">
                    Emergency Contact
                  </Label>
                  <Input
                    id="edit-emergency"
                    value={editFormData.emergencyContact}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                    className="bg-background border-border text-foreground"
                    placeholder="Name and phone number"
                  />
                </div>
              </div>

              {/* Role & Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <h3 className="font-semibold text-foreground">Role & Status</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-foreground">
                      Primary Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={editFormData.role}
                      onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                    >
                      <SelectTrigger id="edit-role" className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-foreground">
                      Account Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                    >
                      <SelectTrigger id="edit-status" className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subrole" className="text-foreground">
                    Sub-Role / Position
                  </Label>
                  <Input
                    id="edit-subrole"
                    value={editFormData.subRole}
                    onChange={(e) => setEditFormData({ ...editFormData, subRole: e.target.value })}
                    className="bg-background border-border text-foreground"
                    placeholder="e.g., Club President, Department Head, etc."
                  />
                </div>
              </div>

              {/* Student-Specific Section */}
              {editFormData.role === "Student" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Student Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-grade" className="text-foreground">
                        Grade/Section <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={editFormData.grade}
                        onValueChange={(value) => setEditFormData({ ...editFormData, grade: value })}
                      >
                        <SelectTrigger id="edit-grade" className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 7-A">Grade 7-A</SelectItem>
                          <SelectItem value="Grade 7-B">Grade 7-B</SelectItem>
                          <SelectItem value="Grade 7-C">Grade 7-C</SelectItem>
                          <SelectItem value="Grade 7-D">Grade 7-D</SelectItem>
                          <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
                          <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                          <SelectItem value="Grade 8-C">Grade 8-C</SelectItem>
                          <SelectItem value="Grade 8-D">Grade 8-D</SelectItem>
                          <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                          <SelectItem value="Grade 9-B">Grade 9-B</SelectItem>
                          <SelectItem value="Grade 9-C">Grade 9-C</SelectItem>
                          <SelectItem value="Grade 9-D">Grade 9-D</SelectItem>
                          <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                          <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                          <SelectItem value="Grade 10-C">Grade 10-C</SelectItem>
                          <SelectItem value="Grade 10-D">Grade 10-D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-blood-type" className="text-foreground">
                        Blood Type
                      </Label>
                      <Select
                        value={editFormData.bloodType}
                        onValueChange={(value) => setEditFormData({ ...editFormData, bloodType: value })}
                      >
                        <SelectTrigger id="edit-blood-type" className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {editFormData.role === "Student" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Parent/Guardian Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-name" className="text-foreground">
                        Guardian Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-guardian-name"
                        value={editFormData.guardian.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            guardian: { ...editFormData.guardian, name: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="Enter guardian's full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-relationship" className="text-foreground">
                        Relationship <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={editFormData.guardian.relationship}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            guardian: { ...editFormData.guardian, relationship: value },
                          })
                        }
                      >
                        <SelectTrigger
                          id="edit-guardian-relationship"
                          className="bg-background border-border text-foreground"
                        >
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                          <SelectItem value="Grandmother">Grandmother</SelectItem>
                          <SelectItem value="Grandfather">Grandfather</SelectItem>
                          <SelectItem value="Aunt">Aunt</SelectItem>
                          <SelectItem value="Uncle">Uncle</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-phone" className="text-foreground">
                        Guardian Phone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-guardian-phone"
                        value={editFormData.guardian.phone}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            guardian: { ...editFormData.guardian, phone: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="+63 XXX XXX XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-email" className="text-foreground">
                        Guardian Email
                      </Label>
                      <Input
                        id="edit-guardian-email"
                        type="email"
                        value={editFormData.guardian.email}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            guardian: { ...editFormData.guardian, email: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="guardian@email.com"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="edit-guardian-address" className="text-foreground">
                        Guardian Address
                      </Label>
                      <Input
                        id="edit-guardian-address"
                        value={editFormData.guardian.address}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            guardian: { ...editFormData.guardian, address: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="Enter guardian's address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Teaching/Administrative Information Section */}
              {(editFormData.role === "Teacher" || editFormData.role === "Administrator") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Briefcase className="w-4 h-4 text-orange-500" />
                    <h3 className="font-semibold text-foreground">
                      {editFormData.role === "Teacher" ? "Teaching" : "Administrative"} Information
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-department" className="text-foreground">
                      Department
                    </Label>
                    <Select
                      value={editFormData.department}
                      onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
                    >
                      <SelectTrigger id="edit-department" className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Filipino">Filipino</SelectItem>
                        <SelectItem value="Physical Education">Physical Education</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Guidance">Guidance</SelectItem>
                        <SelectItem value="Library">Library</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Info Alert */}
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm text-blue-600">
                  Changes to user information will take effect immediately. The user may need to refresh their session
                  to see all updates.
                </AlertDescription>
              </Alert>

              {/* Current User Metadata */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="text-sm font-medium text-foreground">Account Metadata</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">User ID:</div>
                  <div className="text-foreground font-mono">{editUserDialog.user.id}</div>
                  <div className="text-muted-foreground">Join Date:</div>
                  <div className="text-foreground">{editUserDialog.user.joinDate}</div>
                  <div className="text-muted-foreground">Last Login:</div>
                  <div className="text-foreground">{editUserDialog.user.lastLogin}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUserDialog({ isOpen: false, user: null })}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveEditUser}
              disabled={!editFormData.name || !editFormData.email || !editFormData.role || !editFormData.status}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
