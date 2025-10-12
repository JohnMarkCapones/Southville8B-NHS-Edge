"use client"

import type React from "react"
import StudentLayout from "@/components/student/student-layout"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Bell,
  Shield,
  Palette,
  Camera,
  Mail,
  Phone,
  Calendar,
  Target,
  Award,
  BookOpen,
  Save,
  Edit,
  Eye,
  EyeOff,
  Download,
  Trash2,
} from "lucide-react"

export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Mock student profile data
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: "Alex",
    lastName: "Rivera",
    middleName: "Santos",
    studentId: "S2024001",
    email: "alex.rivera@s8bnhs.edu",
    phone: "+63 912 345 6789",
    dateOfBirth: "2009-03-15",
    address: "123 Main Street, Southville, Biñan, Laguna",

    // Academic Information
    grade: "Grade 8",
    section: "Section B",
    schoolYear: "2023-2024",
    gpa: 94.5,
    rank: 12,
    totalStudents: 240,

    // Emergency Contacts
    emergencyContact1: {
      name: "Maria Rivera",
      relationship: "Mother",
      phone: "+63 917 123 4567",
      email: "maria.rivera@email.com",
    },
    emergencyContact2: {
      name: "Jose Rivera",
      relationship: "Father",
      phone: "+63 918 234 5678",
      email: "jose.rivera@email.com",
    },

    // Academic Goals
    targetGPA: 95.0,
    careerGoal: "Software Engineer",
    favoriteSubjects: ["Mathematics", "Science"],

    // Settings
    notifications: {
      email: true,
      sms: false,
      push: true,
      assignments: true,
      grades: true,
      events: true,
      announcements: false,
    },
    privacy: {
      profileVisible: true,
      gradesVisible: false,
      contactVisible: false,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "Asia/Manila",
      dateFormat: "MM/DD/YYYY",
    },
  })

  const achievements = [
    { title: "Honor Roll", description: "Achieved honor roll status for 3 consecutive quarters", date: "2024-01-15" },
    { title: "Math Competition Winner", description: "1st place in Regional Math Competition", date: "2023-11-20" },
    { title: "Perfect Attendance", description: "No absences for the entire semester", date: "2023-12-15" },
    {
      title: "Science Fair Champion",
      description: "Best in Show for Environmental Science project",
      date: "2023-10-10",
    },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    // Mock save functionality
    setIsEditing(false)
    console.log("Profile saved:", profileData)
  }

  const handleUpdateNotifications = (key: string, value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const handleUpdatePrivacy = (key: string, value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const handleUpdatePreferences = (key: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile & Settings</h1>
              <p className="text-muted-foreground">Manage your personal information and preferences</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              {isEditing && (
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          {/* Profile Overview Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white/20">
                    <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-white/20">
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-blue-100 mb-2">
                    {profileData.grade} • {profileData.section} • ID: {profileData.studentId}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      GPA: {profileData.gpa}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Rank: #{profileData.rank}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Honor Roll
                    </Badge>
                  </div>
                  <div className="text-sm text-blue-100">
                    <p>
                      Target GPA: {profileData.targetGPA} | Career Goal: {profileData.careerGoal}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={profileData.middleName}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, middleName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="min-h-20"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>How we can reach you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contacts */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      Emergency Contacts
                    </CardTitle>
                    <CardDescription>People to contact in case of emergency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Primary Contact</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={profileData.emergencyContact1.name}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact1: { ...prev.emergencyContact1, name: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Relationship</Label>
                            <Input
                              value={profileData.emergencyContact1.relationship}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact1: { ...prev.emergencyContact1, relationship: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={profileData.emergencyContact1.phone}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact1: { ...prev.emergencyContact1, phone: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={profileData.emergencyContact1.email}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact1: { ...prev.emergencyContact1, email: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Secondary Contact</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={profileData.emergencyContact2.name}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact2: { ...prev.emergencyContact2, name: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Relationship</Label>
                            <Input
                              value={profileData.emergencyContact2.relationship}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact2: { ...prev.emergencyContact2, relationship: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={profileData.emergencyContact2.phone}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact2: { ...prev.emergencyContact2, phone: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={profileData.emergencyContact2.email}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  emergencyContact2: { ...prev.emergencyContact2, email: e.target.value },
                                }))
                              }
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Academic Information Tab */}
            <TabsContent value="academic" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Academic Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Academic Status
                    </CardTitle>
                    <CardDescription>Your current academic standing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Grade Level</Label>
                        <Input value={profileData.grade} disabled />
                      </div>
                      <div>
                        <Label>Section</Label>
                        <Input value={profileData.section} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>School Year</Label>
                      <Input value={profileData.schoolYear} disabled />
                    </div>
                    <div>
                      <Label>Student ID</Label>
                      <Input value={profileData.studentId} disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current GPA</Label>
                        <Input value={profileData.gpa} disabled />
                      </div>
                      <div>
                        <Label>Class Rank</Label>
                        <Input value={`#${profileData.rank} of ${profileData.totalStudents}`} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Academic Goals
                    </CardTitle>
                    <CardDescription>Set and track your academic objectives</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="targetGPA">Target GPA</Label>
                      <Input
                        id="targetGPA"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={profileData.targetGPA}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, targetGPA: Number.parseFloat(e.target.value) }))
                        }
                        disabled={!isEditing}
                      />
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Progress to Goal</span>
                          <span>{((profileData.gpa / profileData.targetGPA) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(profileData.gpa / profileData.targetGPA) * 100} className="h-2" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="careerGoal">Career Goal</Label>
                      <Input
                        id="careerGoal"
                        value={profileData.careerGoal}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, careerGoal: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Favorite Subjects</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileData.favoriteSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={profileData.notifications.email}
                          onCheckedChange={(checked) => handleUpdateNotifications("email", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                        </div>
                        <Switch
                          checked={profileData.notifications.sms}
                          onCheckedChange={(checked) => handleUpdateNotifications("sms", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                        <Switch
                          checked={profileData.notifications.push}
                          onCheckedChange={(checked) => handleUpdateNotifications("push", checked)}
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Assignment Reminders</Label>
                          <Switch
                            checked={profileData.notifications.assignments}
                            onCheckedChange={(checked) => handleUpdateNotifications("assignments", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Grade Updates</Label>
                          <Switch
                            checked={profileData.notifications.grades}
                            onCheckedChange={(checked) => handleUpdateNotifications("grades", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>School Events</Label>
                          <Switch
                            checked={profileData.notifications.events}
                            onCheckedChange={(checked) => handleUpdateNotifications("events", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Announcements</Label>
                          <Switch
                            checked={profileData.notifications.announcements}
                            onCheckedChange={(checked) => handleUpdateNotifications("announcements", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Preferences
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <Select
                        value={profileData.preferences.theme}
                        onValueChange={(value) => handleUpdatePreferences("theme", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Select
                        value={profileData.preferences.language}
                        onValueChange={(value) => handleUpdatePreferences("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fil">Filipino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Timezone</Label>
                      <Select
                        value={profileData.preferences.timezone}
                        onValueChange={(value) => handleUpdatePreferences("timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                          <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date Format</Label>
                      <Select
                        value={profileData.preferences.dateFormat}
                        onValueChange={(value) => handleUpdatePreferences("dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" placeholder="Enter new password" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                        </div>
                        <Button className="w-full">Update Password</Button>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Password Requirements</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Include uppercase and lowercase letters</li>
                            <li>• Include at least one number</li>
                            <li>• Include at least one special character</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Download className="w-4 h-4 mr-2" />
                            Download Account Data
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" className="w-full">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Account</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete your account and remove all
                                  your data from our servers.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive">Delete Account</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control who can see your information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow other students to see your profile</p>
                      </div>
                      <Switch
                        checked={profileData.privacy.profileVisible}
                        onCheckedChange={(checked) => handleUpdatePrivacy("profileVisible", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Grades Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow others to see your academic performance</p>
                      </div>
                      <Switch
                        checked={profileData.privacy.gradesVisible}
                        onCheckedChange={(checked) => handleUpdatePrivacy("gradesVisible", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Contact Information Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow others to see your contact details</p>
                      </div>
                      <Switch
                        checked={profileData.privacy.contactVisible}
                        onCheckedChange={(checked) => handleUpdatePrivacy("contactVisible", checked)}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Data & Privacy</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h5 className="font-medium mb-2">Data Collection</h5>
                        <p className="text-sm text-muted-foreground">
                          We collect and process your academic data to provide educational services and track your
                          progress. This includes grades, assignments, attendance, and communication records.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h5 className="font-medium mb-2">Data Sharing</h5>
                        <p className="text-sm text-muted-foreground">
                          Your academic data is shared with your teachers, parents/guardians, and school administrators
                          as necessary for educational purposes. We do not share your data with third parties without
                          consent.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h5 className="font-medium mb-2">Data Retention</h5>
                        <p className="text-sm text-muted-foreground">
                          Your academic records are retained according to school policy and legal requirements. Personal
                          data may be deleted upon request after graduation or withdrawal.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Academic Achievements
                  </CardTitle>
                  <CardDescription>Your accomplishments and recognitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentLayout>
  )
}
