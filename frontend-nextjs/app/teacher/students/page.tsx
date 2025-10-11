"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Mail,
  Phone,
  Award,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  ArrowUpDown,
  User,
} from "lucide-react"

// Define a type for Student to improve type safety
type Student = {
  id: string
  name: string
  email: string
  phone: string
  grade: string
  section: string
  gwa: number
  attendance: number
  avatar?: string // Optional avatar
  club: string | null // Added club property, can be null
  address: string
  guardian: string
  guardianPhone: string
  favoriteSubject: string
  hobbies: string[]
  achievements: string[]
  personality: string
  subjects: { name: string; grade: number; trend: "up" | "down" | "stable" }[]
  recentActivity: { action: string; date: string; type: string }[]
}

const studentsData: Student[] = [
  {
    id: "STU001",
    name: "Maria Santos",
    email: "maria.santos@student.edu",
    phone: "+63 912 345 6789",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 95.5,
    attendance: 98,
    club: "Science Club",
    address: "123 Main St, Rodriguez, Rizal",
    guardian: "Mrs. Elena Santos",
    guardianPhone: "+63 917 123 4567",
    favoriteSubject: "Mathematics",
    hobbies: ["Reading", "Chess", "Painting"],
    achievements: ["Honor Student", "Math Olympiad Winner", "Perfect Attendance"],
    personality: "Diligent and creative student with exceptional analytical skills",
    subjects: [
      { name: "Mathematics", grade: 96, trend: "up" },
      { name: "Science", grade: 94, trend: "stable" },
      { name: "English", grade: 97, trend: "up" },
      { name: "Filipino", grade: 95, trend: "stable" },
    ],
    recentActivity: [
      { action: "Submitted Math Assignment 5", date: "2024-01-15", type: "assignment" },
      { action: "Scored 98% on Science Quiz", date: "2024-01-14", type: "quiz" },
      { action: "Won Chess Tournament", date: "2024-01-13", type: "achievement" },
    ],
  },
  {
    id: "STU002",
    name: "John Dela Cruz",
    email: "john.delacruz@student.edu",
    phone: "+63 918 234 5678",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 88.2,
    attendance: 92,
    club: "Basketball Team",
    avatar: "/student-boy.png",
    address: "456 Oak Ave, Rodriguez, Rizal",
    guardian: "Mr. Roberto Dela Cruz",
    guardianPhone: "+63 919 876 5432",
    favoriteSubject: "Physical Education",
    hobbies: ["Basketball", "Gaming", "Music"],
    achievements: ["Team Captain", "Sports Excellence", "Leadership Award"],
    personality: "Athletic and social student with strong leadership qualities",
    subjects: [
      { name: "Mathematics", grade: 89, trend: "up" },
      { name: "Science", grade: 85, trend: "stable" },
      { name: "English", grade: 88, trend: "down" },
      { name: "Filipino", grade: 87, trend: "stable" },
    ],
    recentActivity: [
      { action: "Late submission for English Essay", date: "2024-01-15", type: "assignment" },
      { action: "Attended Math Tutorial", date: "2024-01-13", type: "tutorial" },
      { action: "Basketball Practice", date: "2024-01-12", type: "activity" },
    ],
  },
  {
    id: "STU003",
    name: "Sarah Johnson",
    email: "sarah.johnson@student.edu",
    phone: "+63 919 345 6789",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 92.8,
    attendance: 96,
    club: null, // some students don't have clubs
    avatar: "/placeholder-do05i.png",
    address: "789 Pine St, Rodriguez, Rizal",
    guardian: "Mrs. Carmen Rodriguez",
    guardianPhone: "+63 921 222 3333",
    favoriteSubject: "Science",
    hobbies: ["Experiments", "Reading", "Gardening"],
    achievements: ["Science Fair Winner", "Environmental Club President", "Research Excellence"],
    personality: "Curious and innovative student passionate about environmental science",
    subjects: [
      { name: "Mathematics", grade: 93, trend: "stable" },
      { name: "Science", grade: 91, trend: "up" },
      { name: "English", grade: 94, trend: "up" },
      { name: "Filipino", grade: 93, trend: "stable" },
    ],
    recentActivity: [
      { action: "Won Science Fair Competition", date: "2024-01-16", type: "achievement" },
      { action: "Perfect attendance this month", date: "2024-01-15", type: "attendance" },
      { action: "Environmental Project Presentation", date: "2024-01-14", type: "project" },
    ],
  },
  {
    id: "STU004",
    name: "Miguel Rodriguez",
    email: "miguel.rodriguez@student.edu",
    phone: "+63 920 456 7890",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 85.6,
    attendance: 89,
    club: "Drama Club",
    avatar: "/curly-haired-student-boy.png",
    address: "321 Elm St, Rodriguez, Rizal",
    guardian: "Mr. Jose Torres",
    guardianPhone: "+63 923 444 5555",
    favoriteSubject: "Art",
    hobbies: ["Drawing", "Music", "Video Games"],
    achievements: ["Art Competition Participant", "Creative Writing Contest"],
    personality: "Creative and artistic student with potential for improvement",
    subjects: [
      { name: "Mathematics", grade: 75, trend: "up" },
      { name: "Science", grade: 78, trend: "stable" },
      { name: "English", grade: 82, trend: "up" },
      { name: "Filipino", grade: 79, trend: "stable" },
    ],
    recentActivity: [
      { action: "Improved Math test score", date: "2024-01-15", type: "improvement" },
      { action: "Art project submitted", date: "2024-01-13", type: "assignment" },
      { action: "Attended study group", date: "2024-01-12", type: "study" },
    ],
  },
  {
    id: "STU005",
    name: "Anna Reyes",
    email: "anna.reyes@student.edu",
    phone: "+63 921 567 8901",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 94.3,
    attendance: 97,
    club: null,
    avatar: "/placeholder-56t84.png",
    address: "567 Maple St, Rodriguez, Rizal",
    guardian: "Mrs. Li Chen",
    guardianPhone: "+63 926 666 7777",
    favoriteSubject: "Computer Science",
    hobbies: ["Coding", "Robotics", "Photography"],
    achievements: ["Coding Competition Winner", "Tech Club Leader", "Innovation Award"],
    personality: "Tech-savvy and innovative student with exceptional problem-solving skills",
    subjects: [
      { name: "Mathematics", grade: 95, trend: "up" },
      { name: "Science", grade: 93, trend: "stable" },
      { name: "English", grade: 94, trend: "up" },
      { name: "Filipino", grade: 95, trend: "stable" },
    ],
    recentActivity: [
      { action: "Built AI Chatbot Project", date: "2024-01-16", type: "project" },
      { action: "Mentored junior students", date: "2024-01-15", type: "mentoring" },
      { action: "Perfect quiz scores", date: "2024-01-14", type: "quiz" },
    ],
  },
  {
    id: "STU006",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@student.edu",
    phone: "+63 927 777 8888",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 85.7,
    attendance: 92,
    club: "Debate Society",
    avatar: "/placeholder.svg",
    address: "890 Cedar Ave, Rodriguez, Rizal",
    guardian: "Mrs. Rosa Mendoza",
    guardianPhone: "+63 928 888 9999",
    favoriteSubject: "History",
    hobbies: ["Reading", "Debate", "Chess"],
    achievements: ["Debate Team Captain", "History Quiz Bee Winner"],
    personality: "Analytical thinker with strong communication skills",
    subjects: [
      { name: "Mathematics", grade: 84, trend: "stable" },
      { name: "Science", grade: 86, trend: "up" },
      { name: "English", grade: 88, trend: "up" },
      { name: "Filipino", grade: 85, trend: "stable" },
    ],
    recentActivity: [
      { action: "Won inter-school debate", date: "2024-01-16", type: "achievement" },
      { action: "History presentation", date: "2024-01-14", type: "presentation" },
      { action: "Study group leader", date: "2024-01-13", type: "leadership" },
    ],
  },
  {
    id: "STU007",
    name: "Isabella Garcia",
    email: "isabella.garcia@student.edu",
    phone: "+63 929 999 0000",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 91.3,
    attendance: 96,
    club: "Theater Arts Guild",
    avatar: "/placeholder.svg",
    address: "234 Birch St, Rodriguez, Rizal",
    guardian: "Mr. Luis Garcia",
    guardianPhone: "+63 930 000 1111",
    favoriteSubject: "Literature",
    hobbies: ["Writing", "Theater", "Music"],
    achievements: ["School Newspaper Editor", "Drama Club President"],
    personality: "Creative writer with excellent leadership and communication abilities",
    subjects: [
      { name: "Mathematics", grade: 89, trend: "stable" },
      { name: "Science", grade: 92, trend: "up" },
      { name: "English", grade: 95, trend: "up" },
      { name: "Filipino", grade: 90, trend: "stable" },
    ],
    recentActivity: [
      { action: "Published school article", date: "2024-01-16", type: "publication" },
      { action: "Drama performance", date: "2024-01-15", type: "performance" },
      { action: "Creative writing workshop", date: "2024-01-14", type: "workshop" },
    ],
  },
  {
    id: "STU008",
    name: "Ryan Pascual",
    email: "ryan.pascual@student.edu",
    phone: "+63 931 111 2222",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 88.9,
    attendance: 94,
    club: "Mathletes Club",
    avatar: "/placeholder.svg",
    address: "345 Willow Dr, Rodriguez, Rizal",
    guardian: "Mrs. Maria Pascual",
    guardianPhone: "+63 932 222 3333",
    favoriteSubject: "Mathematics",
    hobbies: ["Problem Solving", "Gaming", "Sports"],
    achievements: ["Math Competition Finalist", "Programming Contest Participant"],
    personality: "Logical thinker with strong analytical and problem-solving skills",
    subjects: [
      { name: "Mathematics", grade: 92, trend: "up" },
      { name: "Science", grade: 87, trend: "stable" },
      { name: "English", grade: 86, trend: "down" },
      { name: "Filipino", grade: 90, trend: "up" },
    ],
    recentActivity: [
      { action: "Solved advanced math problems", date: "2024-01-16", type: "achievement" },
      { action: "Tutored classmates", date: "2024-01-15", type: "tutoring" },
      { action: "Programming project", date: "2024-01-14", type: "project" },
    ],
  },
  {
    id: "STU009",
    name: "Jasmine Reyes",
    email: "jasmine.reyes@student.edu",
    phone: "+63 933 333 4444",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 93.6,
    attendance: 98,
    club: "Environmental Club",
    avatar: "/placeholder.svg",
    address: "456 Spruce Ln, Rodriguez, Rizal",
    guardian: "Mr. Antonio Reyes",
    guardianPhone: "+63 934 444 5555",
    favoriteSubject: "Biology",
    hobbies: ["Nature Photography", "Hiking", "Research"],
    achievements: ["Science Olympiad Medalist", "Environmental Award Winner"],
    personality: "Nature enthusiast with strong research and observation skills",
    subjects: [
      { name: "Mathematics", grade: 91, trend: "stable" },
      { name: "Science", grade: 96, trend: "up" },
      { name: "English", grade: 94, trend: "stable" },
      { name: "Filipino", grade: 93, trend: "up" },
    ],
    recentActivity: [
      { action: "Biology research project", date: "2024-01-16", type: "research" },
      { action: "Nature photography exhibit", date: "2024-01-15", type: "exhibit" },
      { action: "Environmental club meeting", date: "2024-01-14", type: "club" },
    ],
  },
  {
    id: "STU010",
    name: "Kevin Lim",
    email: "kevin.lim@student.edu",
    phone: "+63 935 555 6666",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 82.4,
    attendance: 91,
    club: "Sports Club",
    avatar: "/placeholder.svg",
    address: "567 Poplar St, Rodriguez, Rizal",
    guardian: "Mrs. Grace Lim",
    guardianPhone: "+63 936 666 7777",
    favoriteSubject: "Physical Education",
    hobbies: ["Basketball", "Swimming", "Cycling"],
    achievements: ["Varsity Basketball Player", "Swimming Champion"],
    personality: "Athletic and team-oriented student with leadership potential",
    subjects: [
      { name: "Mathematics", grade: 80, trend: "up" },
      { name: "Science", grade: 83, trend: "stable" },
      { name: "English", grade: 84, trend: "up" },
      { name: "Filipino", grade: 82, trend: "stable" },
    ],
    recentActivity: [
      { action: "Basketball tournament win", date: "2024-01-16", type: "sports" },
      { action: "Swimming practice", date: "2024-01-15", type: "training" },
      { action: "Team captain duties", date: "2024-01-14", type: "leadership" },
    ],
  },
  {
    id: "STU011",
    name: "Sophia Tan",
    email: "sophia.tan@student.edu",
    phone: "+63 937 777 8888",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 96.1,
    attendance: 99,
    club: "Chemistry Club",
    avatar: "/placeholder.svg",
    address: "678 Ash Ave, Rodriguez, Rizal",
    guardian: "Mr. David Tan",
    guardianPhone: "+63 938 888 9999",
    favoriteSubject: "Chemistry",
    hobbies: ["Laboratory Experiments", "Reading", "Violin"],
    achievements: ["Chemistry Olympiad Winner", "Academic Excellence Award"],
    personality: "Meticulous and dedicated student with exceptional academic performance",
    subjects: [
      { name: "Mathematics", grade: 97, trend: "up" },
      { name: "Science", grade: 98, trend: "stable" },
      { name: "English", grade: 95, trend: "up" },
      { name: "Filipino", grade: 94, trend: "stable" },
    ],
    recentActivity: [
      { action: "Chemistry lab experiment", date: "2024-01-16", type: "lab" },
      { action: "Violin recital performance", date: "2024-01-15", type: "performance" },
      { action: "Academic tutoring session", date: "2024-01-14", type: "tutoring" },
    ],
  },
  {
    id: "STU012",
    name: "Daniel Cruz",
    email: "daniel.cruz@student.edu",
    phone: "+63 939 999 0000",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 79.8,
    attendance: 87,
    club: "Music Club",
    avatar: "/placeholder.svg",
    address: "789 Hickory Rd, Rodriguez, Rizal",
    guardian: "Mrs. Linda Cruz",
    guardianPhone: "+63 940 000 1111",
    favoriteSubject: "Music",
    hobbies: ["Guitar", "Singing", "Songwriting"],
    achievements: ["School Band Member", "Talent Show Winner"],
    personality: "Musically talented student with creative expression abilities",
    subjects: [
      { name: "Mathematics", grade: 76, trend: "up" },
      { name: "Science", grade: 81, trend: "stable" },
      { name: "English", grade: 83, trend: "up" },
      { name: "Filipino", grade: 79, trend: "stable" },
    ],
    recentActivity: [
      { action: "School concert performance", date: "2024-01-16", type: "performance" },
      { action: "Music composition", date: "2024-01-15", type: "creative" },
      { action: "Band practice", date: "2024-01-14", type: "practice" },
    ],
  },
  {
    id: "STU013",
    name: "Emma Villanueva",
    email: "emma.villanueva@student.edu",
    phone: "+63 941 111 2222",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 90.7,
    attendance: 95,
    club: "Model UN",
    avatar: "/placeholder.svg",
    address: "890 Sycamore St, Rodriguez, Rizal",
    guardian: "Mr. Roberto Villanueva",
    guardianPhone: "+63 942 222 3333",
    favoriteSubject: "Social Studies",
    hobbies: ["Model UN", "Debate", "Community Service"],
    achievements: ["Model UN Delegate", "Community Service Award"],
    personality: "Socially conscious student with strong civic engagement",
    subjects: [
      { name: "Mathematics", grade: 88, trend: "stable" },
      { name: "Science", grade: 91, trend: "up" },
      { name: "English", grade: 93, trend: "up" },
      { name: "Filipino", grade: 91, trend: "stable" },
    ],
    recentActivity: [
      { action: "Model UN conference", date: "2024-01-16", type: "conference" },
      { action: "Community cleanup drive", date: "2024-01-15", type: "service" },
      { action: "Social studies presentation", date: "2024-01-14", type: "presentation" },
    ],
  },
  {
    id: "STU014",
    name: "Lucas Santos",
    email: "lucas.santos@student.edu",
    phone: "+63 943 333 4444",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 87.2,
    attendance: 93,
    club: "Robotics Club",
    avatar: "/placeholder.svg",
    address: "901 Magnolia Dr, Rodriguez, Rizal",
    guardian: "Mrs. Patricia Santos",
    guardianPhone: "+63 944 444 5555",
    favoriteSubject: "Physics",
    hobbies: ["Robotics", "3D Printing", "Electronics"],
    achievements: ["Robotics Competition Finalist", "STEM Fair Participant"],
    personality: "Technically inclined student with hands-on learning approach",
    subjects: [
      { name: "Mathematics", grade: 89, trend: "up" },
      { name: "Science", grade: 88, trend: "stable" },
      { name: "English", grade: 85, trend: "down" },
      { name: "Filipino", grade: 87, trend: "stable" },
    ],
    recentActivity: [
      { action: "Robotics project demo", date: "2024-01-16", type: "demo" },
      { action: "3D printing workshop", date: "2024-01-15", type: "workshop" },
      { action: "Electronics lab session", date: "2024-01-14", type: "lab" },
    ],
  },
  {
    id: "STU015",
    name: "Mia Rodriguez",
    email: "mia.rodriguez@student.edu",
    phone: "+63 945 555 6666",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 92.4,
    attendance: 97,
    club: "Art Club",
    avatar: "/placeholder.svg",
    address: "012 Dogwood Ln, Rodriguez, Rizal",
    guardian: "Mr. Carlos Rodriguez",
    guardianPhone: "+63 946 666 7777",
    favoriteSubject: "Art",
    hobbies: ["Painting", "Sculpture", "Digital Art"],
    achievements: ["Art Exhibition Winner", "Creative Arts Scholarship"],
    personality: "Artistically gifted student with exceptional creative vision",
    subjects: [
      { name: "Mathematics", grade: 90, trend: "stable" },
      { name: "Science", grade: 93, trend: "up" },
      { name: "English", grade: 94, trend: "up" },
      { name: "Filipino", grade: 92, trend: "stable" },
    ],
    recentActivity: [
      { action: "Art gallery exhibition", date: "2024-01-16", type: "exhibition" },
      { action: "Digital art workshop", date: "2024-01-15", type: "workshop" },
      { action: "Sculpture project", date: "2024-01-14", type: "project" },
    ],
  },
  {
    id: "STU016",
    name: "Nathan Wong",
    email: "nathan.wong@student.edu",
    phone: "+63 947 777 8888",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 84.6,
    attendance: 90,
    club: "Coding Club",
    avatar: "/placeholder.svg",
    address: "123 Redwood Ave, Rodriguez, Rizal",
    guardian: "Mrs. Helen Wong",
    guardianPhone: "+63 948 888 9999",
    favoriteSubject: "Computer Science",
    hobbies: ["Programming", "Web Design", "Gaming"],
    achievements: ["Coding Bootcamp Graduate", "Web Design Contest Winner"],
    personality: "Tech enthusiast with strong programming and design skills",
    subjects: [
      { name: "Mathematics", grade: 86, trend: "up" },
      { name: "Science", grade: 84, trend: "stable" },
      { name: "English", grade: 83, trend: "down" },
      { name: "Filipino", grade: 85, trend: "up" },
    ],
    recentActivity: [
      { action: "Website development project", date: "2024-01-16", type: "project" },
      { action: "Programming competition", date: "2024-01-15", type: "competition" },
      { action: "Tech club meeting", date: "2024-01-14", type: "club" },
    ],
  },
  {
    id: "STU017",
    name: "Olivia Fernandez",
    email: "olivia.fernandez@student.edu",
    phone: "+63 949 999 0000",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 89.3,
    attendance: 94,
    club: "Geography Club",
    avatar: "/placeholder.svg",
    address: "234 Sequoia St, Rodriguez, Rizal",
    guardian: "Mr. Miguel Fernandez",
    guardianPhone: "+63 950 000 1111",
    favoriteSubject: "Geography",
    hobbies: ["Travel", "Photography", "Cultural Studies"],
    achievements: ["Geography Bee Champion", "Cultural Exchange Participant"],
    personality: "Culturally aware student with global perspective and curiosity",
    subjects: [
      { name: "Mathematics", grade: 87, trend: "stable" },
      { name: "Science", grade: 90, trend: "up" },
      { name: "English", grade: 92, trend: "up" },
      { name: "Filipino", grade: 88, trend: "stable" },
    ],
    recentActivity: [
      { action: "Geography presentation", date: "2024-01-16", type: "presentation" },
      { action: "Cultural festival participation", date: "2024-01-15", type: "festival" },
      { action: "Photography exhibition", date: "2024-01-14", type: "exhibition" },
    ],
  },
  {
    id: "STU018",
    name: "Ethan Morales",
    email: "ethan.morales@student.edu",
    phone: "+63 951 111 2222",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 81.7,
    attendance: 88,
    club: "Sports Club",
    avatar: "/placeholder.svg",
    address: "345 Cypress Dr, Rodriguez, Rizal",
    guardian: "Mrs. Carmen Morales",
    guardianPhone: "+63 952 222 3333",
    favoriteSubject: "Physical Education",
    hobbies: ["Soccer", "Track and Field", "Martial Arts"],
    achievements: ["Soccer Team MVP", "Track and Field Medalist"],
    personality: "Athletic and competitive student with strong team spirit",
    subjects: [
      { name: "Mathematics", grade: 79, trend: "up" },
      { name: "Science", grade: 82, trend: "stable" },
      { name: "English", grade: 83, trend: "up" },
      { name: "Filipino", grade: 81, trend: "stable" },
    ],
    recentActivity: [
      { action: "Soccer championship game", date: "2024-01-16", type: "sports" },
      { action: "Track practice session", date: "2024-01-15", type: "training" },
      { action: "Martial arts tournament", date: "2024-01-14", type: "tournament" },
    ],
  },
  {
    id: "STU019",
    name: "Ava Gutierrez",
    email: "ava.gutierrez@student.edu",
    phone: "+63 953 333 4444",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 93.8,
    attendance: 98,
    club: "Mathletes Club",
    avatar: "/placeholder.svg",
    address: "456 Fir St, Rodriguez, Rizal",
    guardian: "Mr. Jose Gutierrez",
    guardianPhone: "+63 954 444 5555",
    favoriteSubject: "Mathematics",
    hobbies: ["Calculus", "Statistics", "Data Analysis"],
    achievements: ["Math Olympiad Gold Medalist", "Statistics Competition Winner"],
    personality: "Mathematically gifted student with analytical thinking abilities",
    subjects: [
      { name: "Mathematics", grade: 98, trend: "up" },
      { name: "Science", grade: 92, trend: "stable" },
      { name: "English", grade: 91, trend: "down" },
      { name: "Filipino", grade: 94, trend: "up" },
    ],
    recentActivity: [
      { action: "Advanced math competition", date: "2024-01-16", type: "competition" },
      { action: "Statistics project presentation", date: "2024-01-15", type: "presentation" },
      { action: "Math tutoring session", date: "2024-01-14", type: "tutoring" },
    ],
  },
  {
    id: "STU020",
    name: "Mason Rivera",
    email: "mason.rivera@student.edu",
    phone: "+63 955 555 6666",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 86.5,
    attendance: 92,
    club: "Creative Writing Club",
    avatar: "/placeholder.svg",
    address: "567 Pine Ridge Rd, Rodriguez, Rizal",
    guardian: "Mrs. Sofia Rivera",
    guardianPhone: "+63 956 666 7777",
    favoriteSubject: "English",
    hobbies: ["Creative Writing", "Poetry", "Journalism"],
    achievements: ["Young Writers Award", "School Newspaper Editor"],
    personality: "Eloquent writer with strong communication and storytelling skills",
    subjects: [
      { name: "Mathematics", grade: 84, trend: "stable" },
      { name: "Science", grade: 87, trend: "up" },
      { name: "English", grade: 91, trend: "up" },
      { name: "Filipino", grade: 88, trend: "stable" },
    ],
    recentActivity: [
      { action: "Poetry contest submission", date: "2024-01-16", type: "contest" },
      { action: "Newspaper article published", date: "2024-01-15", type: "publication" },
      { action: "Creative writing workshop", date: "2024-01-14", type: "workshop" },
    ],
  },
  {
    id: "STU021",
    name: "Zoe Castillo",
    email: "zoe.castillo@student.edu",
    phone: "+63 957 777 8888",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 88.9,
    attendance: 95,
    club: "Marine Biology Club",
    avatar: "/placeholder.svg",
    address: "678 Cedar Hill Dr, Rodriguez, Rizal",
    guardian: "Mr. Ricardo Castillo",
    guardianPhone: "+63 958 888 9999",
    favoriteSubject: "Biology",
    hobbies: ["Marine Biology", "Scuba Diving", "Conservation"],
    achievements: ["Marine Biology Research Award", "Environmental Conservation Medal"],
    personality: "Environmentally conscious student with passion for marine life",
    subjects: [
      { name: "Mathematics", grade: 86, trend: "stable" },
      { name: "Science", grade: 93, trend: "up" },
      { name: "English", grade: 89, trend: "up" },
      { name: "Filipino", grade: 87, trend: "stable" },
    ],
    recentActivity: [
      { action: "Marine biology field trip", date: "2024-01-16", type: "fieldtrip" },
      { action: "Conservation project", date: "2024-01-15", type: "project" },
      { action: "Scuba diving certification", date: "2024-01-14", type: "certification" },
    ],
  },
  {
    id: "STU022",
    name: "Caleb Ramos",
    email: "caleb.ramos@student.edu",
    phone: "+63 959 999 0000",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 83.2,
    attendance: 89,
    club: "History Club",
    avatar: "/placeholder.svg",
    address: "789 Oakwood Ln, Rodriguez, Rizal",
    guardian: "Mrs. Diana Ramos",
    guardianPhone: "+63 960 000 1111",
    favoriteSubject: "History",
    hobbies: ["Historical Research", "Museum Visits", "Archaeology"],
    achievements: ["History Fair Winner", "Archaeological Society Member"],
    personality: "History enthusiast with strong research and analytical skills",
    subjects: [
      { name: "Mathematics", grade: 81, trend: "up" },
      { name: "Science", grade: 84, trend: "stable" },
      { name: "English", grade: 85, trend: "up" },
      { name: "Filipino", grade: 83, trend: "stable" },
    ],
    recentActivity: [
      { action: "Historical research project", date: "2024-01-16", type: "research" },
      { action: "Museum field trip", date: "2024-01-15", type: "fieldtrip" },
      { action: "Archaeological dig simulation", date: "2024-01-14", type: "simulation" },
    ],
  },
  {
    id: "STU023",
    name: "Lily Aquino",
    email: "lily.aquino@student.edu",
    phone: "+63 961 111 2222",
    grade: "Grade 8-A",
    section: "Einstein",
    gwa: 91.6,
    attendance: 96,
    club: "Chemistry Club",
    avatar: "/placeholder.svg",
    address: "890 Maplewood Ave, Rodriguez, Rizal",
    guardian: "Mr. Benjamin Aquino",
    guardianPhone: "+63 962 222 3333",
    favoriteSubject: "Chemistry",
    hobbies: ["Laboratory Work", "Chemical Analysis", "Research"],
    achievements: ["Chemistry Lab Excellence", "Science Research Symposium Winner"],
    personality: "Detail-oriented student with passion for chemical sciences",
    subjects: [
      { name: "Mathematics", grade: 90, trend: "stable" },
      { name: "Science", grade: 95, trend: "up" },
      { name: "English", grade: 91, trend: "up" },
      { name: "Filipino", grade: 90, trend: "stable" },
    ],
    recentActivity: [
      { action: "Chemistry lab experiment", date: "2024-01-16", type: "lab" },
      { action: "Research symposium presentation", date: "2024-01-15", type: "symposium" },
      { action: "Chemical analysis project", date: "2024-01-14", type: "analysis" },
    ],
  },
  {
    id: "STU024",
    name: "Owen Dela Rosa",
    email: "owen.delarosa@student.edu",
    phone: "+63 963 333 4444",
    grade: "Grade 8-B",
    section: "Newton",
    gwa: 80.4,
    attendance: 86,
    club: "Music Club",
    avatar: "/placeholder.svg",
    address: "901 Elmwood St, Rodriguez, Rizal",
    guardian: "Mrs. Teresa Dela Rosa",
    guardianPhone: "+63 964 444 5555",
    favoriteSubject: "Music",
    hobbies: ["Piano", "Composition", "Orchestra"],
    achievements: ["Piano Recital Performer", "Music Composition Contest Winner"],
    personality: "Musically talented student with compositional abilities",
    subjects: [
      { name: "Mathematics", grade: 78, trend: "up" },
      { name: "Science", grade: 81, trend: "stable" },
      { name: "English", grade: 82, trend: "up" },
      { name: "Filipino", grade: 80, trend: "stable" },
    ],
    recentActivity: [
      { action: "Piano recital performance", date: "2024-01-16", type: "performance" },
      { action: "Music composition submission", date: "2024-01-15", type: "composition" },
      { action: "Orchestra practice", date: "2024-01-14", type: "practice" },
    ],
  },
  {
    id: "STU025",
    name: "Grace Villanueva",
    email: "grace.villanueva@student.edu",
    phone: "+63 965 555 6666",
    grade: "Grade 8-C",
    section: "Darwin",
    gwa: 94.7,
    attendance: 99,
    club: "Literary Club",
    avatar: "/placeholder.svg",
    address: "012 Willowbrook Dr, Rodriguez, Rizal",
    guardian: "Mr. Fernando Villanueva",
    guardianPhone: "+63 966 666 7777",
    favoriteSubject: "Literature",
    hobbies: ["Reading", "Book Reviews", "Literary Analysis"],
    achievements: ["Literary Excellence Award", "Book Club President"],
    personality: "Avid reader with exceptional literary analysis and critical thinking skills",
    subjects: [
      { name: "Mathematics", grade: 93, trend: "stable" },
      { name: "Science", grade: 95, trend: "up" },
      { name: "English", grade: 97, trend: "up" },
      { name: "Filipino", grade: 94, trend: "stable" },
    ],
    recentActivity: [
      { action: "Literary analysis presentation", date: "2024-01-16", type: "presentation" },
      { action: "Book club discussion leader", date: "2024-01-15", type: "leadership" },
      { action: "Reading comprehension workshop", date: "2024-01-14", type: "workshop" },
    ],
  },
]

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(10)
  const [sortField, setSortField] = useState<"name" | "gwa" | "attendance" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: "name" | "gwa" | "attendance") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredStudents = studentsData
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.club && student.club.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (!sortField) return 0

      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Students Directory
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and view student information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search students by name, ID, section, or club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-36 h-11 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-36 h-11 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="Einstein">Einstein</SelectItem>
                    <SelectItem value="Newton">Newton</SelectItem>
                    <SelectItem value="Darwin">Darwin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjusted grid from xl:grid-cols-7 to xl:grid-cols-6 */}
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
          <div className="xl:col-span-4">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Students Directory
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Click on any student to view their detailed profile
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden md:block">
                  <div className="max-h-[700px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <button
                              onClick={() => handleSort("name")}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              Student
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Grade & Section
                          </th>
                          <th className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <button
                              onClick={() => handleSort("gwa")}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 mx-auto"
                            >
                              GWA
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <button
                              onClick={() => handleSort("attendance")}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 mx-auto"
                            >
                              Attendance
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Club
                          </th>
                          <th className="text-center p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student) => (
                          <tr
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 ${
                              selectedStudent?.id === student.id
                                ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-700"
                                : ""
                            }`}
                          >
                            <td className="p-3">
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{student.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{student.id}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                {student.grade}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{student.section}</div>
                            </td>
                            <td className="p-3 text-center">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  student.gwa >= 90
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : student.gwa >= 80
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {student.gwa}%
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  student.attendance >= 95
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : student.attendance >= 85
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {student.attendance}%
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              {student.club ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  {student.club}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500">No club</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Mail className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Phone className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden space-y-3 p-4">
                  {paginatedStudents.map((student) => (
                    <Card
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedStudent?.id === student.id
                          ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {student.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{student.id}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {student.grade} - {student.section}
                            </div>
                            {student.club && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                                {student.club}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              GWA: {student.gwa}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Att: {student.attendance}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-0">
                    Showing {startIndex + 1} to {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of{" "}
                    {filteredStudents.length} students
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adjusted student profile column from xl:col-span-3 to xl:col-span-2 */}
          <div className="xl:col-span-2">
            {selectedStudent ? (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 sticky top-6 overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Student Profile
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(null)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {selectedStudent.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedStudent.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {selectedStudent.grade} - {selectedStudent.section}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 font-mono">{selectedStudent.id}</p>
                    {selectedStudent.club && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs px-3 py-1 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        {selectedStudent.club}
                      </Badge>
                    )}
                  </div>

                  <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Age:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.floor(Math.random() * 3) + 15} years old
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Address:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                            {Math.random() > 0.5
                              ? "Brgy. San Antonio, Quezon City"
                              : Math.random() > 0.5
                                ? "Brgy. Commonwealth, Quezon City"
                                : "Brgy. Batasan Hills, Quezon City"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-500" />
                        Emergency Contact
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Guardian:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.random() > 0.5
                              ? "Maria " + selectedStudent.name.split(" ")[1]
                              : "Juan " + selectedStudent.name.split(" ")[1]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Relationship:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.random() > 0.5 ? "Mother" : "Father"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            +63 9{Math.floor(Math.random() * 900000000) + 100000000}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedStudent.gwa}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          General Weighted Average
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedStudent.attendance}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Attendance Rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-0 bg-white/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Subject Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedStudent.subjects.slice(0, 4).map((subject: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm"
                        >
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{subject.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {subject.grade}%
                            </span>
                            {subject.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {subject.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {subject.trend === "stable" && <Activity className="w-4 h-4 text-blue-500" />}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Award className="w-4 h-4 text-yellow-600" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedStudent.achievements.slice(0, 3).map((achievement: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs mr-1 mb-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800"
                          >
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Activity className="w-4 h-4 text-blue-600" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedStudent.recentActivity.map((activity: any, index: number) => {
                          // Determine activity color based on type
                          const getActivityColor = (type: string) => {
                            switch (type) {
                              case "assignment":
                                return "bg-purple-500"
                              case "quiz":
                              case "achievement":
                                return "bg-green-500"
                              case "tutorial":
                              case "study":
                                return "bg-blue-500"
                              case "activity":
                              case "sports":
                                return "bg-cyan-500"
                              case "project":
                              case "research":
                                return "bg-orange-500"
                              case "performance":
                              case "presentation":
                                return "bg-pink-500"
                              default:
                                return "bg-gray-500"
                            }
                          }

                          // Calculate time ago from date
                          const getTimeAgo = (dateString: string) => {
                            const date = new Date(dateString)
                            const now = new Date()
                            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

                            if (diffInDays === 0) return "Today"
                            if (diffInDays === 1) return "1 day ago"
                            if (diffInDays < 7) return `${diffInDays} days ago`
                            if (diffInDays < 30)
                              return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`
                            return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""} ago`
                          }

                          return (
                            <div key={index} className="relative">
                              {/* Timeline line */}
                              {index < selectedStudent.recentActivity.length - 1 && (
                                <div className="absolute left-2 top-8 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                              )}

                              <div className="flex items-start space-x-3">
                                {/* Activity dot indicator */}
                                <div
                                  className={`w-4 h-4 rounded-full ${getActivityColor(activity.type)} flex-shrink-0 mt-1`}
                                ></div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      {activity.action}
                                    </h4>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                                      {getTimeAgo(activity.date)}
                                    </span>
                                  </div>

                                  {/* Activity description based on type */}
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {activity.type === "assignment" && "Assignment submission completed"}
                                    {activity.type === "quiz" && "Quiz performance recorded"}
                                    {activity.type === "achievement" && "New achievement unlocked"}
                                    {activity.type === "tutorial" && "Tutorial session attended"}
                                    {activity.type === "activity" && "Extracurricular activity participation"}
                                    {activity.type === "project" && "Project work completed"}
                                    {activity.type === "study" && "Study session participation"}
                                    {activity.type === "sports" && "Sports activity participation"}
                                    {activity.type === "performance" && "Performance or presentation given"}
                                    {activity.type === "presentation" && "Academic presentation delivered"}
                                    {activity.type === "research" && "Research work conducted"}
                                    {![
                                      "assignment",
                                      "quiz",
                                      "achievement",
                                      "tutorial",
                                      "activity",
                                      "project",
                                      "study",
                                      "sports",
                                      "performance",
                                      "presentation",
                                      "research",
                                    ].includes(activity.type) && "Academic activity completed"}
                                  </p>

                                  {/* Show attachment icon for certain activity types */}
                                  {(activity.type === "assignment" || activity.type === "project") && (
                                    <div className="flex items-center mt-2">
                                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="w-3 h-3 bg-red-500 rounded-sm flex items-center justify-center">
                                          <span className="text-white text-[8px] font-bold">📄</span>
                                        </div>
                                        <span>
                                          {activity.type === "assignment" ? "assignment.pdf" : "project_files.zip"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/80 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 sticky top-6">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Select a Student</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Click on any student from the directory to view their detailed profile information and academic
                    performance.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
