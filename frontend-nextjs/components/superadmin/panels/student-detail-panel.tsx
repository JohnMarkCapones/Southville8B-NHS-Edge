"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Mail,
  Phone,
  User,
  Edit,
  MessageSquare,
  MapPin,
  GraduationCap,
  Clock,
  UserCheck,
  Award,
  Cake,
  Heart,
  Calendar,
  BookOpen,
  Users,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react"

interface StudentDetailPanelProps {
  selectedStudent: any
  isPanelOpen: boolean
  onClose: () => void
}

export const StudentDetailPanel = ({ selectedStudent, isPanelOpen, onClose }: StudentDetailPanelProps) => {
  if (!selectedStudent) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getSubRoleColor = (subRole: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    ]
    return colors[subRole.length % colors.length]
  }

  const formatBirthday = (birthday: string) => {
    if (!birthday) return "Not provided"
    const date = new Date(birthday)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Sheet open={isPanelOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[40vw] min-w-[600px] max-w-[1600px] p-0 overflow-y-auto">
        <div className="h-full bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-lg border-2 border-white/30">
                    {selectedStudent.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{selectedStudent.name}</h1>
                    <p className="text-white/90 text-lg">
                      {selectedStudent.grade} - {selectedStudent.section}
                    </p>
                    <p className="text-white/80 text-sm font-mono">{selectedStudent.id}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={`${getStatusColor(selectedStudent.status)} border-0`}>
                  <UserCheck className="w-3 h-3 mr-1" />
                  {selectedStudent.status}
                </Badge>
                {selectedStudent.subRole && (
                  <Badge className={`${getSubRoleColor(selectedStudent.subRole)} border-0`}>
                    <Award className="w-3 h-3 mr-1" />
                    {selectedStudent.subRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-foreground">{selectedStudent.name}</p>
                    </div>
                  </div>
                  {selectedStudent.birthday && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Cake className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Birthday</p>
                        <p className="font-medium text-foreground">{formatBirthday(selectedStudent.birthday)}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.age && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium text-foreground">{selectedStudent.age} years old</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium text-foreground">{selectedStudent.bloodType || "O+"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium text-foreground">{selectedStudent.gender || "Male"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground truncate">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedStudent.phone || "+63 912 345 6789"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">
                        {selectedStudent.address || "456 Student St, Southville 8B"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Parent/Guardian Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Guardian Name</p>
                      <p className="font-medium text-foreground">{selectedStudent.guardian || "Juan Dela Cruz"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium text-foreground">{selectedStudent.guardianRelationship || "Father"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <p className="font-medium text-foreground">
                        {selectedStudent.emergencyContact || "+63 917 987 6543"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Guardian Email</p>
                      <p className="font-medium text-foreground truncate">
                        {selectedStudent.guardianEmail || "juan.delacruz@email.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Grade Level</p>
                      <p className="font-medium text-foreground">{selectedStudent.grade}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Section</p>
                      <p className="font-medium text-foreground">{selectedStudent.section}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium text-foreground font-mono">{selectedStudent.id}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">LRN</p>
                      <p className="font-medium text-foreground font-mono">{selectedStudent.lrn || "123456789012"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Track/Strand</p>
                      <p className="font-medium text-foreground">{selectedStudent.track || "Academic"}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Academic Year</p>
                      <p className="font-medium text-foreground">{selectedStudent.academicYear || "2024-2025"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Scholarship</p>
                      <p className="font-medium text-foreground">{selectedStudent.scholarship || "None"}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Transportation</p>
                      <p className="font-medium text-foreground">{selectedStudent.transportation || "Private"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Academic Performance
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Overall GPA</p>
                      <p className="font-medium text-foreground">{selectedStudent.gpa || "3.8"}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((selectedStudent.gpa || 3.8) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Academic Standing</span>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {selectedStudent.academicStanding || "Good Standing"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {selectedStudent.attendanceRate || "95%"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Behavior Rating</span>
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        {selectedStudent.behaviorRating || "Excellent"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities & Involvement */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Activities & Involvement
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Clubs</p>
                      <p className="font-medium text-foreground">
                        {selectedStudent.clubs || "Science Club, Math Club"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sports</p>
                      <p className="font-medium text-foreground">
                        {selectedStudent.sports || "Basketball, Volleyball"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Leadership Roles</p>
                      <p className="font-medium text-foreground">{selectedStudent.leadership || "Class President"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  System Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="font-medium text-foreground">
                        {selectedStudent.lastLogin || "2024-01-15 08:30 AM"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Enrollment Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <Badge className={getStatusColor(selectedStudent.status)}>{selectedStudent.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Student Information
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-muted bg-transparent justify-start"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    View Academic Records
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-muted bg-transparent justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message to Student
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-muted bg-transparent justify-start"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Parent/Guardian
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-muted bg-transparent justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-border/50 hover:bg-muted bg-transparent justify-start"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Disciplinary Actions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
