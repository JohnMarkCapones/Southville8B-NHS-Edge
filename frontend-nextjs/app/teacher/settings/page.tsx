"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Bell,
  Shield,
  User,
  Lock,
  Globe,
  Moon,
  Sun,
  Volume2,
  Smartphone,
  BookOpen,
  Users,
  FileText,
  Monitor,
  Palette,
  Save,
  RotateCcw,
  Camera,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@teacher.southville8b.edu",
    phone: "+63 917 123 4567",
    department: "Mathematics",
    employeeId: "TCH-2024-001",
    bio: "Passionate mathematics teacher with 8 years of experience in secondary education.",
    notifications: {
      assignments: true,
      grades: true,
      meetings: true,
      announcements: true,
      reminders: false,
    },
    preferences: {
      theme: "light",
      language: "english",
      timezone: "asia/manila",
      autoSave: true,
      showOnlineStatus: true,
      profileVisibility: "school",
    },
    quiz: {
      defaultTimeLimit: "60",
      allowRetakes: false,
      shuffleQuestions: true,
      showResults: "after_submission",
      securityMode: "standard",
    },
  })

  const handlePasswordChangeClick = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      return
    }

    setShowPasswordConfirmation(true)
  }

  const handleConfirmPasswordChange = () => {
    setShowPasswordConfirmation(false)

    const correctCurrentPassword = "teacher123"

    if (passwordForm.currentPassword !== correctCurrentPassword) {
      setShowPasswordError(true)
    } else {
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }

  const handleSave = () => {
    toast({
      title: "Settings saved successfully",
      description: "Your preferences have been updated.",
    })
  }

  const handleReset = () => {
    toast({
      title: "Settings reset",
      description: "All settings have been restored to default values.",
    })
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account, preferences, and teaching settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-green-100 dark:border-green-700">
          <TabsTrigger
            value="account"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="teaching"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <BookOpen className="w-4 h-4" />
            Teaching
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4" />
            Quiz Settings
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Account Information Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-green-200 dark:border-green-700">
                        <AvatarImage src="/teacher-avatar.png" alt="Profile" />
                        <AvatarFallback className="bg-green-600 text-white text-xl">MS</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Maria Santos</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Teacher</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/80 dark:bg-gray-700/80 dark:border-gray-600"
                        >
                          Change Photo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/80 dark:bg-gray-700/80 dark:border-gray-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-green-800 dark:text-green-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-green-800 dark:text-green-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-green-800 dark:text-green-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-green-800 dark:text-green-300">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-green-800 dark:text-green-300">
                        Department
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Filipino">Filipino</SelectItem>
                          <SelectItem value="Social Studies">Social Studies</SelectItem>
                          <SelectItem value="Physical Education">Physical Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId" className="text-green-800 dark:text-green-300">
                        Employee ID
                      </Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        disabled
                        className="bg-gray-100 dark:bg-gray-700 border-green-200 dark:border-green-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-green-800 dark:text-green-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500 min-h-[100px]"
                      placeholder="Tell us about yourself and your teaching philosophy..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-green-800 dark:text-green-300">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="pl-10 pr-10 bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-green-800 dark:text-green-300">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-green-800 dark:text-green-300">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChangeClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>

                  <Separator />

                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      View Active Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Teaching Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Years Teaching</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Classes</span>
                    <span className="font-bold">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Students</span>
                    <span className="font-bold">180</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quizzes Created</span>
                    <span className="font-bold">45</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 dark:bg-gray-700/80 dark:border-gray-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 dark:bg-gray-700/80 dark:border-gray-600"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Classes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 dark:bg-gray-700/80 dark:border-gray-600"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Upload Resources
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Teaching Preferences Tab */}
        <TabsContent value="teaching" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Teaching Preferences
                </CardTitle>
                <CardDescription>Configure your default teaching settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Default Class Duration</Label>
                  <Select defaultValue="45">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Grading Scale</Label>
                  <Select defaultValue="percentage">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                      <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                      <SelectItem value="points">Points Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Auto-save student work</Label>
                    <p className="text-sm text-muted-foreground">Automatically save student progress</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Allow late submissions</Label>
                    <p className="text-sm text-muted-foreground">Accept assignments after due date</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Users className="w-5 h-5 mr-2" />
                  Classroom Management
                </CardTitle>
                <CardDescription>Set your classroom interaction preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Student chat enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow students to chat during class</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Screen sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow students to share screens</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Raise hand feature</Label>
                    <p className="text-sm text-muted-foreground">Enable virtual hand raising</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Maximum class size</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 students</SelectItem>
                      <SelectItem value="25">25 students</SelectItem>
                      <SelectItem value="30">30 students</SelectItem>
                      <SelectItem value="35">35 students</SelectItem>
                      <SelectItem value="40">40 students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quiz Settings Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <FileText className="w-5 h-5 mr-2" />
                  Default Quiz Settings
                </CardTitle>
                <CardDescription>Set your preferred quiz defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Default time limit (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.quiz.defaultTimeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quiz: { ...formData.quiz, defaultTimeLimit: e.target.value },
                      })
                    }
                    className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Show results</Label>
                  <Select
                    value={formData.quiz.showResults}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        quiz: { ...formData.quiz, showResults: value },
                      })
                    }
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="after_submission">After submission</SelectItem>
                      <SelectItem value="after_due_date">After due date</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Security mode</Label>
                  <Select
                    value={formData.quiz.securityMode}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        quiz: { ...formData.quiz, securityMode: value },
                      })
                    }
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="secure">Secure</SelectItem>
                      <SelectItem value="lockdown">Full Lockdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Settings className="w-5 h-5 mr-2" />
                  Quiz Behavior
                </CardTitle>
                <CardDescription>Configure quiz interaction settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Allow retakes</Label>
                    <p className="text-sm text-muted-foreground">Let students retake quizzes</p>
                  </div>
                  <Switch
                    checked={formData.quiz.allowRetakes}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        quiz: { ...formData.quiz, allowRetakes: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Shuffle questions</Label>
                    <p className="text-sm text-muted-foreground">Randomize question order</p>
                  </div>
                  <Switch
                    checked={formData.quiz.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        quiz: { ...formData.quiz, shuffleQuestions: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Auto-submit on time</Label>
                    <p className="text-sm text-muted-foreground">Automatically submit when time expires</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Show progress bar</Label>
                    <p className="text-sm text-muted-foreground">Display completion progress</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Bell className="w-5 h-5 mr-2" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Choose what email notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Assignment submissions</Label>
                    <p className="text-sm text-muted-foreground">When students submit assignments</p>
                  </div>
                  <Switch
                    checked={formData.notifications.assignments}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, assignments: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Grade requests</Label>
                    <p className="text-sm text-muted-foreground">When students request grade reviews</p>
                  </div>
                  <Switch
                    checked={formData.notifications.grades}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, grades: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Meeting reminders</Label>
                    <p className="text-sm text-muted-foreground">Upcoming meetings and conferences</p>
                  </div>
                  <Switch
                    checked={formData.notifications.meetings}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, meetings: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">School announcements</Label>
                    <p className="text-sm text-muted-foreground">Important school-wide updates</p>
                  </div>
                  <Switch
                    checked={formData.notifications.announcements}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, announcements: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Push Notifications
                </CardTitle>
                <CardDescription>Manage browser and mobile notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Browser notifications</Label>
                    <p className="text-sm text-muted-foreground">Show notifications in browser</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Sound alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Daily reminders</Label>
                    <p className="text-sm text-muted-foreground">Daily summary of pending tasks</p>
                  </div>
                  <Switch
                    checked={formData.notifications.reminders}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, reminders: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Notification frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your interface appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={formData.preferences.theme === "light" ? "default" : "outline"}
                      size="sm"
                      className="flex-col h-16 bg-white/80 dark:bg-gray-700/80"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, theme: "light" },
                        })
                      }
                    >
                      <Sun className="w-4 h-4 mb-1" />
                      Light
                    </Button>
                    <Button
                      variant={formData.preferences.theme === "dark" ? "default" : "outline"}
                      size="sm"
                      className="flex-col h-16 bg-white/80 dark:bg-gray-700/80"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, theme: "dark" },
                        })
                      }
                    >
                      <Moon className="w-4 h-4 mb-1" />
                      Dark
                    </Button>
                    <Button
                      variant={formData.preferences.theme === "auto" ? "default" : "outline"}
                      size="sm"
                      className="flex-col h-16 bg-white/80 dark:bg-gray-700/80"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, theme: "auto" },
                        })
                      }
                    >
                      <Monitor className="w-4 h-4 mb-1" />
                      Auto
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Dashboard layout</Label>
                  <Select defaultValue="grid">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid view</SelectItem>
                      <SelectItem value="list">List view</SelectItem>
                      <SelectItem value="compact">Compact view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Compact sidebar</Label>
                    <p className="text-sm text-muted-foreground">Use minimal sidebar design</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-green-100 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                  <Globe className="w-5 h-5 mr-2" />
                  Language & Region
                </CardTitle>
                <CardDescription>Set your language and regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Language</Label>
                  <Select
                    value={formData.preferences.language}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, language: value },
                      })
                    }
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="filipino">Filipino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Timezone</Label>
                  <Select
                    value={formData.preferences.timezone}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, timezone: value },
                      })
                    }
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/manila">Asia/Manila (GMT+8)</SelectItem>
                      <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-green-300">Date format</Label>
                  <Select defaultValue="mm/dd/yyyy">
                    <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-green-200 dark:border-green-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-green-800 dark:text-green-300">Show online status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={formData.preferences.showOnlineStatus}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, showOnlineStatus: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Password Change Confirmation Dialog */}
      <Dialog open={showPasswordConfirmation} onOpenChange={setShowPasswordConfirmation}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-800 dark:text-green-300">
              <Shield className="w-5 h-5 mr-2" />
              Confirm Password Change
            </DialogTitle>
            <DialogDescription>Are you sure you want to change your password?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                This action will update your account password. Make sure you remember your new password.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPasswordChange} className="bg-green-600 hover:bg-green-700 text-white">
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Error Dialog */}
      <Dialog open={showPasswordError} onOpenChange={setShowPasswordError}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Password Change Failed
            </DialogTitle>
            <DialogDescription>There was a problem changing your password.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Current password is incorrect.</strong>
                <br />
                Please verify your current password and try again.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPasswordError(false)} className="bg-red-600 hover:bg-red-700 text-white">
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
