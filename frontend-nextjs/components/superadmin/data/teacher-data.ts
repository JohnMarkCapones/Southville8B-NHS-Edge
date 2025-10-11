export interface Teacher {
  id: number
  employeeId: string
  name: string
  email: string
  department: string
  position: string
  yearsOfExperience: number
  specialization: string
  hireDate: string
  status: "Active" | "On Leave" | "Inactive"
  avatar: string
  subjects: string[]
  gradeLevel: string
  classLoad: number
  performance: number
  lastLogin: string
}

export const teacherData: Teacher[] = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Maria Santos",
    email: "maria.santos@southville8b.edu.ph",
    department: "Mathematics",
    position: "Senior High School Teacher",
    yearsOfExperience: 8,
    specialization: "Algebra & Calculus",
    hireDate: "2016-06-15",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["Mathematics", "Statistics"],
    gradeLevel: "Grade 11-12",
    classLoad: 6,
    performance: 95,
    lastLogin: "2024-01-15 08:30 AM",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "John Rodriguez",
    email: "john.rodriguez@southville8b.edu.ph",
    department: "Science",
    position: "Department Head",
    yearsOfExperience: 12,
    specialization: "Physics & Chemistry",
    hireDate: "2012-08-20",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["Physics", "Chemistry", "Earth Science"],
    gradeLevel: "Grade 9-12",
    classLoad: 5,
    performance: 98,
    lastLogin: "2024-01-15 07:45 AM",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Ana Dela Cruz",
    email: "ana.delacruz@southville8b.edu.ph",
    department: "English",
    position: "English Teacher",
    yearsOfExperience: 6,
    specialization: "Literature & Writing",
    hireDate: "2018-06-01",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["English", "Creative Writing"],
    gradeLevel: "Grade 7-10",
    classLoad: 7,
    performance: 92,
    lastLogin: "2024-01-14 04:20 PM",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@southville8b.edu.ph",
    department: "Social Studies",
    position: "History Teacher",
    yearsOfExperience: 10,
    specialization: "Philippine History",
    hireDate: "2014-07-15",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["History", "Araling Panlipunan"],
    gradeLevel: "Grade 7-12",
    classLoad: 6,
    performance: 94,
    lastLogin: "2024-01-15 09:15 AM",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Lisa Fernandez",
    email: "lisa.fernandez@southville8b.edu.ph",
    department: "Filipino",
    position: "Filipino Teacher",
    yearsOfExperience: 7,
    specialization: "Filipino Literature",
    hireDate: "2017-06-10",
    status: "On Leave",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["Filipino", "Panitikan"],
    gradeLevel: "Grade 7-12",
    classLoad: 0,
    performance: 90,
    lastLogin: "2024-01-10 02:30 PM",
  },
  {
    id: 6,
    employeeId: "EMP006",
    name: "Robert Kim",
    email: "robert.kim@southville8b.edu.ph",
    department: "Physical Education",
    position: "PE Teacher & Coach",
    yearsOfExperience: 5,
    specialization: "Sports & Fitness",
    hireDate: "2019-08-01",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    subjects: ["Physical Education", "Health"],
    gradeLevel: "Grade 7-12",
    classLoad: 8,
    performance: 96,
    lastLogin: "2024-01-15 06:00 AM",
  },
]
