export type NewsTeamPosition =
  | "Editor-in-Chief"
  | "Managing Editor"
  | "Section Editor"
  | "Staff Writer"
  | "Photographer"
  | "Layout Designer"
  | "Faculty Adviser"

export type NewsTeamPermission = "approve" | "publish" | "edit" | "write" | "review"

export type NewsTeamMember = {
  id: string
  name: string
  employeeId: string
  email: string
  avatar?: string
  position: NewsTeamPosition
  department: string
  permissions: NewsTeamPermission[]
  articlesWritten: number
  articlesEdited: number
  articlesPublished: number
  monthlyQuota: number
  joinedDate: string
  status: "Active" | "On Leave" | "Inactive"
  performance: number
  specialization: string[]
}

export const newsTeamData: NewsTeamMember[] = [
  {
    id: "nt-001",
    name: "Dr. Maria Santos",
    employeeId: "EMP-2018-001",
    email: "maria.santos@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Editor-in-Chief",
    department: "English",
    permissions: ["approve", "publish", "edit", "write", "review"],
    articlesWritten: 45,
    articlesEdited: 230,
    articlesPublished: 215,
    monthlyQuota: 4,
    joinedDate: "2020-01-15",
    status: "Active",
    performance: 98,
    specialization: ["Academic", "Editorial", "Policy"],
  },
  {
    id: "nt-002",
    name: "Prof. Roberto Cruz",
    employeeId: "EMP-2019-015",
    email: "roberto.cruz@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Managing Editor",
    department: "Social Studies",
    permissions: ["approve", "publish", "edit", "write"],
    articlesWritten: 38,
    articlesEdited: 180,
    articlesPublished: 165,
    monthlyQuota: 3,
    joinedDate: "2020-06-01",
    status: "Active",
    performance: 95,
    specialization: ["News", "Events", "Community"],
  },
  {
    id: "nt-003",
    name: "Ms. Jennifer Reyes",
    employeeId: "EMP-2020-032",
    email: "jennifer.reyes@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Section Editor",
    department: "Science",
    permissions: ["edit", "write", "review"],
    articlesWritten: 52,
    articlesEdited: 95,
    articlesPublished: 88,
    monthlyQuota: 5,
    joinedDate: "2021-03-10",
    status: "Active",
    performance: 92,
    specialization: ["Science", "Technology", "Innovation"],
  },
  {
    id: "nt-004",
    name: "Mr. Carlos Mendoza",
    employeeId: "EMP-2021-048",
    email: "carlos.mendoza@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Section Editor",
    department: "Physical Education",
    permissions: ["edit", "write", "review"],
    articlesWritten: 68,
    articlesEdited: 120,
    articlesPublished: 110,
    monthlyQuota: 6,
    joinedDate: "2021-08-15",
    status: "Active",
    performance: 94,
    specialization: ["Sports", "Athletics", "Health"],
  },
  {
    id: "nt-005",
    name: "Ms. Angela Torres",
    employeeId: "EMP-2021-055",
    email: "angela.torres@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Staff Writer",
    department: "Filipino",
    permissions: ["write"],
    articlesWritten: 42,
    articlesEdited: 0,
    articlesPublished: 38,
    monthlyQuota: 4,
    joinedDate: "2022-01-20",
    status: "Active",
    performance: 88,
    specialization: ["Culture", "Arts", "Student Life"],
  },
  {
    id: "nt-006",
    name: "Mr. David Lim",
    employeeId: "EMP-2022-072",
    email: "david.lim@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Photographer",
    department: "Arts",
    permissions: ["write"],
    articlesWritten: 15,
    articlesEdited: 0,
    articlesPublished: 12,
    monthlyQuota: 2,
    joinedDate: "2022-06-01",
    status: "Active",
    performance: 90,
    specialization: ["Photography", "Visual Media", "Events"],
  },
  {
    id: "nt-007",
    name: "Ms. Patricia Gomez",
    employeeId: "EMP-2022-089",
    email: "patricia.gomez@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Layout Designer",
    department: "Computer",
    permissions: ["edit"],
    articlesWritten: 8,
    articlesEdited: 145,
    articlesPublished: 140,
    monthlyQuota: 1,
    joinedDate: "2022-09-15",
    status: "Active",
    performance: 93,
    specialization: ["Design", "Layout", "Graphics"],
  },
  {
    id: "nt-008",
    name: "Prof. Ramon Villanueva",
    employeeId: "EMP-2017-005",
    email: "ramon.villanueva@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Faculty Adviser",
    department: "English",
    permissions: ["approve", "review"],
    articlesWritten: 12,
    articlesEdited: 0,
    articlesPublished: 10,
    monthlyQuota: 1,
    joinedDate: "2020-01-15",
    status: "Active",
    performance: 96,
    specialization: ["Advisory", "Mentorship", "Quality Control"],
  },
  {
    id: "nt-009",
    name: "Ms. Sofia Ramirez",
    employeeId: "EMP-2023-101",
    email: "sofia.ramirez@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Staff Writer",
    department: "Mathematics",
    permissions: ["write"],
    articlesWritten: 28,
    articlesEdited: 0,
    articlesPublished: 25,
    monthlyQuota: 3,
    joinedDate: "2023-02-01",
    status: "Active",
    performance: 85,
    specialization: ["Academic", "Student Achievement", "Competitions"],
  },
  {
    id: "nt-010",
    name: "Mr. Luis Fernandez",
    employeeId: "EMP-2023-115",
    email: "luis.fernandez@southville8b.edu.ph",
    avatar: "/placeholder.svg?height=100&width=100",
    position: "Staff Writer",
    department: "Social Studies",
    permissions: ["write"],
    articlesWritten: 35,
    articlesEdited: 0,
    articlesPublished: 32,
    monthlyQuota: 4,
    joinedDate: "2023-06-15",
    status: "On Leave",
    performance: 87,
    specialization: ["Current Events", "Community", "Announcements"],
  },
]
