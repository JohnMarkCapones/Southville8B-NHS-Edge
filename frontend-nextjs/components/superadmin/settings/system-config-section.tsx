"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Calendar,
  Mail,
  Power,
  Shield,
  Upload,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Phone,
  Globe,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export function SystemConfigSection() {
  // School Information State
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Southville 8B National High School",
    shortName: "S8B NHS",
    address: "123 Education Street, Barangay 8B, City",
    phone: "+63 123 456 7890",
    email: "info@southville8bnhs.edu.ph",
    website: "www.southville8bnhs.edu.ph",
    principalName: "Dr. Maria Santos",
    logo: null as File | null,
  })

  // Academic Year State
  const [academicYear, setAcademicYear] = useState({
    currentYear: "2024-2025",
    startDate: "2024-08-15",
    endDate: "2025-05-30",
    structure: "quarters" as "quarters" | "semesters",
    quarters: [
      { name: "1st Quarter", start: "2024-08-15", end: "2024-10-31" },
      { name: "2nd Quarter", start: "2024-11-04", end: "2025-01-24" },
      { name: "3rd Quarter", start: "2025-01-27", end: "2025-03-28" },
      { name: "4th Quarter", start: "2025-03-31", end: "2025-05-30" },
    ],
    semesters: [
      { name: "1st Semester", start: "2024-08-15", end: "2024-12-20" },
      { name: "2nd Semester", start: "2025-01-06", end: "2025-05-30" },
    ],
  })

  // Email Notification State
  const [emailSettings, setEmailSettings] = useState({
    enableNotifications: true,
    notifyOnNewUser: true,
    notifyOnGradeSubmission: true,
    notifyOnAttendance: false,
    notifyOnAnnouncement: true,
    notifyOnEvent: true,
    digestFrequency: "daily" as "realtime" | "daily" | "weekly",
    adminEmails: "admin@southville8bnhs.edu.ph, principal@southville8bnhs.edu.ph",
  })

  // Maintenance Mode State
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: "System is currently under maintenance. We'll be back shortly.",
    allowedIPs: "127.0.0.1, 192.168.1.1",
    scheduledStart: "",
    scheduledEnd: "",
  })

  // Security Audit Logs State (mock data)
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: "2025-01-10 14:30:25",
      user: "admin@southville8bnhs.edu.ph",
      action: "Updated school information",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2025-01-10 13:15:42",
      user: "principal@southville8bnhs.edu.ph",
      action: "Changed academic year settings",
      ipAddress: "192.168.1.101",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2025-01-10 11:20:18",
      user: "unknown@example.com",
      action: "Failed login attempt",
      ipAddress: "203.45.67.89",
      status: "failed",
    },
    {
      id: 4,
      timestamp: "2025-01-10 09:45:33",
      user: "admin@southville8bnhs.edu.ph",
      action: "Enabled maintenance mode",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: 5,
      timestamp: "2025-01-09 16:30:12",
      user: "teacher@southville8bnhs.edu.ph",
      action: "Accessed security settings",
      ipAddress: "192.168.1.105",
      status: "warning",
    },
  ])

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const handleSave = (section: string) => {
    setSaveStatus("saving")
    // Simulate API call
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSchoolInfo({ ...schoolInfo, logo: file })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Manage school information, academic settings, and system preferences
        </p>
      </div>

      <Tabs defaultValue="school-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="school-info" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">School Info</span>
          </TabsTrigger>
          <TabsTrigger value="academic-year" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Academic Year</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Power className="h-4 w-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* School Information Tab */}
        <TabsContent value="school-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>Update your school's basic information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={schoolInfo.name}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short-name">Short Name</Label>
                  <Input
                    id="short-name"
                    value={schoolInfo.shortName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, shortName: e.target.value })}
                    placeholder="Enter short name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    placeholder="+63 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    placeholder="info@school.edu.ph"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={schoolInfo.website}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                    placeholder="www.school.edu.ph"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Principal Name
                  </Label>
                  <Input
                    id="principal"
                    value={schoolInfo.principalName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, principalName: e.target.value })}
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="logo">School Logo</Label>
                <div className="flex items-center gap-4">
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Recommended: PNG or SVG, max 2MB, 500x500px</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("school-info")} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? (
                    <>Saving...</>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Year Tab */}
        <TabsContent value="academic-year" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Year Settings
              </CardTitle>
              <CardDescription>Configure academic year dates and structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current-year">Current Academic Year</Label>
                  <Input
                    id="current-year"
                    value={academicYear.currentYear}
                    onChange={(e) => setAcademicYear({ ...academicYear, currentYear: e.target.value })}
                    placeholder="2024-2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={academicYear.startDate}
                    onChange={(e) => setAcademicYear({ ...academicYear, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={academicYear.endDate}
                    onChange={(e) => setAcademicYear({ ...academicYear, endDate: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Academic Structure</Label>
                <Select
                  value={academicYear.structure}
                  onValueChange={(value: "quarters" | "semesters") =>
                    setAcademicYear({ ...academicYear, structure: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarters">Quarters (4 periods)</SelectItem>
                    <SelectItem value="semesters">Semesters (2 periods)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {academicYear.structure === "quarters" ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Quarter Dates</h4>
                  {academicYear.quarters.map((quarter, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>{quarter.name}</Label>
                            <Input value={quarter.name} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={quarter.start}
                              onChange={(e) => {
                                const newQuarters = [...academicYear.quarters]
                                newQuarters[index].start = e.target.value
                                setAcademicYear({ ...academicYear, quarters: newQuarters })
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={quarter.end}
                              onChange={(e) => {
                                const newQuarters = [...academicYear.quarters]
                                newQuarters[index].end = e.target.value
                                setAcademicYear({ ...academicYear, quarters: newQuarters })
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">Semester Dates</h4>
                  {academicYear.semesters.map((semester, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>{semester.name}</Label>
                            <Input value={semester.name} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={semester.start}
                              onChange={(e) => {
                                const newSemesters = [...academicYear.semesters]
                                newSemesters[index].start = e.target.value
                                setAcademicYear({ ...academicYear, semesters: newSemesters })
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={semester.end}
                              onChange={(e) => {
                                const newSemesters = [...academicYear.semesters]
                                newSemesters[index].end = e.target.value
                                setAcademicYear({ ...academicYear, semesters: newSemesters })
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => handleSave("academic-year")} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? (
                    <>Saving...</>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Notifications Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notification Settings
              </CardTitle>
              <CardDescription>Configure email notifications for system events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Master switch for all email notifications</p>
                </div>
                <Switch
                  checked={emailSettings.enableNotifications}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New User Registration</Label>
                    <p className="text-sm text-muted-foreground">Notify when new users register</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnNewUser}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, notifyOnNewUser: checked })}
                    disabled={!emailSettings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Grade Submission</Label>
                    <p className="text-sm text-muted-foreground">Notify when teachers submit grades</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnGradeSubmission}
                    onCheckedChange={(checked) =>
                      setEmailSettings({ ...emailSettings, notifyOnGradeSubmission: checked })
                    }
                    disabled={!emailSettings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify on attendance changes</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnAttendance}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, notifyOnAttendance: checked })}
                    disabled={!emailSettings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Announcements</Label>
                    <p className="text-sm text-muted-foreground">Notify when announcements are posted</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnAnnouncement}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, notifyOnAnnouncement: checked })}
                    disabled={!emailSettings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notify about upcoming events</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnEvent}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, notifyOnEvent: checked })}
                    disabled={!emailSettings.enableNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="digest-frequency">Notification Frequency</Label>
                  <Select
                    value={emailSettings.digestFrequency}
                    onValueChange={(value: "realtime" | "daily" | "weekly") =>
                      setEmailSettings({ ...emailSettings, digestFrequency: value })
                    }
                    disabled={!emailSettings.enableNotifications}
                  >
                    <SelectTrigger id="digest-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Choose how often to receive notification emails</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-emails">Admin Email Addresses</Label>
                  <Textarea
                    id="admin-emails"
                    value={emailSettings.adminEmails}
                    onChange={(e) => setEmailSettings({ ...emailSettings, adminEmails: e.target.value })}
                    placeholder="admin1@school.edu.ph, admin2@school.edu.ph"
                    rows={3}
                    disabled={!emailSettings.enableNotifications}
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated list of email addresses to receive notifications
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("email")} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? (
                    <>Saving...</>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Mode Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                Maintenance Mode
              </CardTitle>
              <CardDescription>Control system availability and maintenance windows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {maintenanceMode.enabled && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Maintenance mode is currently <strong>ACTIVE</strong>. Only whitelisted IPs can access the system.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to the system for maintenance</p>
                </div>
                <Switch
                  checked={maintenanceMode.enabled}
                  onCheckedChange={(checked) => setMaintenanceMode({ ...maintenanceMode, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={maintenanceMode.message}
                  onChange={(e) => setMaintenanceMode({ ...maintenanceMode, message: e.target.value })}
                  placeholder="Enter message to display to users"
                  rows={3}
                  disabled={!maintenanceMode.enabled}
                />
                <p className="text-sm text-muted-foreground">
                  This message will be displayed to users during maintenance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                <Textarea
                  id="allowed-ips"
                  value={maintenanceMode.allowedIPs}
                  onChange={(e) => setMaintenanceMode({ ...maintenanceMode, allowedIPs: e.target.value })}
                  placeholder="127.0.0.1, 192.168.1.1"
                  rows={2}
                  disabled={!maintenanceMode.enabled}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of IP addresses that can access the system during maintenance
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Schedule Maintenance</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-start">Scheduled Start</Label>
                    <Input
                      id="scheduled-start"
                      type="datetime-local"
                      value={maintenanceMode.scheduledStart}
                      onChange={(e) => setMaintenanceMode({ ...maintenanceMode, scheduledStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-end">Scheduled End</Label>
                    <Input
                      id="scheduled-end"
                      type="datetime-local"
                      value={maintenanceMode.scheduledEnd}
                      onChange={(e) => setMaintenanceMode({ ...maintenanceMode, scheduledEnd: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Schedule automatic maintenance mode activation and deactivation
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("maintenance")} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? (
                    <>Saving...</>
                  ) : saveStatus === "saved" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Audit Logs
              </CardTitle>
              <CardDescription>View system activity and security events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Total Logs:</Label>
                  <Badge variant="secondary">{auditLogs.length}</Badge>
                </div>
                <Button variant="outline" size="sm">
                  Export Logs
                </Button>
              </div>

              <div className="rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Timestamp
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            User
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">IP Address</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{log.timestamp}</td>
                          <td className="px-4 py-3 text-sm font-medium">{log.user}</td>
                          <td className="px-4 py-3 text-sm">{log.action}</td>
                          <td className="px-4 py-3 text-sm font-mono">{log.ipAddress}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                log.status === "success"
                                  ? "default"
                                  : log.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Showing {auditLogs.length} of {auditLogs.length} logs
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
