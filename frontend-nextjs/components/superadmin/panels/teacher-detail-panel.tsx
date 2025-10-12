"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Mail,
  Clock,
  TrendingUp,
  Edit,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Award,
  Building,
  UserCheck,
  Phone,
  User,
  MapPin,
  Cake,
  Calendar,
} from "lucide-react"

interface TeacherDetailPanelProps {
  teacher: any
  isOpen: boolean
  onClose: () => void
}

export const TeacherDetailPanel = ({ teacher, isOpen, onClose }: TeacherDetailPanelProps) => {
  if (!teacher) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "on leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[40vw] min-w-[600px] max-w-[1600px] p-0 overflow-y-auto">
        <div className="h-full bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 text-white p-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                    {teacher.avatar ? (
                      <img
                        src={teacher.avatar || "/placeholder.svg"}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                        {teacher.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{teacher.name}</h1>
                    <p className="text-white/90 text-lg">{teacher.position}</p>
                    <p className="text-white/80 text-sm font-mono">{teacher.employeeId}</p>
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
                <Badge className={`${getStatusColor(teacher.status)} border-0`}>
                  <UserCheck className="w-3 h-3 mr-1" />
                  {teacher.status}
                </Badge>
                {teacher.subRole && (
                  <Badge className={`${getSubRoleColor(teacher.subRole)} border-0`}>
                    <Award className="w-3 h-3 mr-1" />
                    {teacher.subRole}
                  </Badge>
                )}
                <Badge className="bg-white/20 text-white border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {teacher.performance || 95}% Performance
                </Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-foreground">{teacher.name}</p>
                    </div>
                  </div>
                  {teacher.birthday && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Cake className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Birthday</p>
                        <p className="font-medium text-foreground">{formatBirthday(teacher.birthday)}</p>
                      </div>
                    </div>
                  )}
                  {teacher.age && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium text-foreground">{teacher.age} years old</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="font-medium text-foreground">{teacher.bloodType || "O+"}</p>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{teacher.phone || "+63 918 765 4321"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{teacher.address || "123 Main St, Southville 8B"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  Emergency Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p className="font-medium text-foreground">{teacher.emergencyContactName || "Maria Santos"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Phone</p>
                      <p className="font-medium text-foreground">{teacher.emergencyContact || "+63 917 123 4567"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium text-foreground">{teacher.emergencyRelationship || "Spouse"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium text-foreground">{teacher.department}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium text-foreground">{teacher.position}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium text-foreground font-mono">{teacher.employeeId}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p className="font-medium text-foreground">{new Date(teacher.hireDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium text-foreground">{teacher.yearsOfExperience || 5} years</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <p className="font-medium text-foreground">{teacher.employmentType || "Full-time"}</p>
                  </div>
                </div>
              </div>

              {/* Teaching Information */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Teaching Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium text-foreground">{teacher.specialization || teacher.department}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Grade Level</p>
                      <p className="font-medium text-foreground">{teacher.gradeLevel || "7-10"}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Class Load</p>
                      <p className="font-medium text-foreground">{teacher.classLoad || 6} classes</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Teaching Hours</p>
                      <p className="font-medium text-foreground">{teacher.teachingHours || 24} hrs/week</p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Office Location</p>
                    <p className="font-medium text-foreground">{teacher.officeLocation || "Faculty Room 2"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Subjects Teaching</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects?.map((subject: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {subject}
                        </Badge>
                      )) || (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {teacher.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Overall Performance</p>
                      <p className="font-medium text-foreground">{teacher.performance || 95}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${teacher.performance || 95}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Student Satisfaction</span>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Excellent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Attendance Rate</span>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">98%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Class Management</span>
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Outstanding</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Account Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="font-medium text-foreground">{teacher.lastLogin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium text-foreground">{new Date(teacher.hireDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <Badge className={getStatusColor(teacher.status)}>{teacher.status}</Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Teacher</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Permissions</p>
                      <p className="font-medium text-foreground">Standard Teacher Access</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Login Frequency</p>
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Daily</Badge>
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
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Teacher Profile
                  </Button>
                  <Button size="sm" variant="outline" className="w-full border-border/50 hover:bg-muted bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline" className="w-full border-border/50 hover:bg-muted bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Teacher
                  </Button>
                  <Button size="sm" variant="outline" className="w-full border-border/50 hover:bg-muted bg-transparent">
                    <User className="w-4 h-4 mr-2" />
                    View Full Profile
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
