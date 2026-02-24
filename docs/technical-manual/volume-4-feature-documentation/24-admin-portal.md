# Chapter 24: Admin Portal

## Table of Contents
- [Overview](#overview)
- [Admin Dashboard](#admin-dashboard)
- [User Management](#user-management)
- [Academic Management](#academic-management)
- [Content Management](#content-management)
- [System Configuration](#system-configuration)
- [Reports & Analytics](#reports--analytics)
- [Best Practices](#best-practices)

---

## Overview

The **Admin Portal** provides school administrators with comprehensive tools for managing users, academic content, school operations, and system configuration.

### Key Features

- **User Management** - Create, update, and manage all user accounts
- **Academic Structure** - Manage subjects, sections, and schedules
- **Content Moderation** - Review and approve student/teacher content
- **System Settings** - Configure school-wide settings and policies
- **Analytics** - View comprehensive reports and insights
- **Announcements** - Broadcast important messages school-wide

### Route Structure

```
/admin/
├── dashboard/          # Admin homepage
├── users/              # User management
│   ├── students/
│   ├── teachers/
│   └── admins/
├── academics/          # Academic structure
│   ├── subjects/
│   ├── sections/
│   └── schedules/
├── content/            # Content moderation
│   ├── news/
│   ├── announcements/
│   └── events/
├── settings/           # System configuration
└── reports/            # Analytics and reports
```

---

## Admin Dashboard

```typescript
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = {
    totalUsers: 1250,
    activeClasses: 45,
    upcomingEvents: 12,
    systemHealth: 98
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatsCard title="Active Classes" value={stats.activeClasses} icon={BookOpen} />
          <StatsCard title="Upcoming Events" value={stats.upcomingEvents} icon={Calendar} />
          <StatsCard title="System Health" value={`${stats.systemHealth}%`} icon={TrendingUp} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
```

---

## User Management

### User List and CRUD Operations

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userApi } from "@/lib/api/endpoints/users"

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateUser = async (userData) => {
    await userApi.createUser(userData)
    toast({ title: "User created successfully" })
    setShowCreateDialog(false)
    // Refresh user list
  }

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await userApi.deleteUser(userId)
      toast({ title: "User deleted" })
      // Refresh user list
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* User Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "success" : "secondary"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleCreateUser} onCancel={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
```

### Bulk User Import

```typescript
export default function BulkUserImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    if (!file) return

    setImporting(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const result = await userApi.bulkImport(formData)
      toast({
        title: "Import successful",
        description: `${result.created} users created, ${result.updated} users updated`
      })
    } catch (error) {
      toast({ title: "Import failed", variant: "destructive" })
    } finally {
      setImporting(false)
    }
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Bulk User Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with user data. Format: Name, Email, Role
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importing..." : "Import Users"}
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
```

---

## Academic Management

### Subject Management

```typescript
export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState([])

  const handleCreateSubject = async (subjectData) => {
    await subjectApi.createSubject(subjectData)
    toast({ title: "Subject created" })
    // Refresh list
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subject Management</h1>
          <Button onClick={() => setShowDialog(true)}>Add Subject</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{subject.code}</p>
                <p className="text-sm">Grade Level: {subject.gradeLevel}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
```

### Section Management

```typescript
export default function SectionManagementPage() {
  const [sections, setSections] = useState([])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Section Management</h1>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Adviser</TableHead>
                  <TableHead>Student Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map(section => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>{section.gradeLevel}</TableCell>
                    <TableCell>{section.adviser?.name || "Unassigned"}</TableCell>
                    <TableCell>{section.studentCount}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">View Students</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
```

---

## Content Management

### News Moderation

```typescript
export default function NewsModerationPage() {
  const [pendingArticles, setPendingArticles] = useState([])

  const handleApprove = async (articleId) => {
    await newsApi.updateArticleStatus(articleId, "published")
    toast({ title: "Article approved" })
    // Refresh list
  }

  const handleReject = async (articleId, reason) => {
    await newsApi.updateArticleStatus(articleId, "rejected", { reason })
    toast({ title: "Article rejected" })
    // Refresh list
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Content Moderation</h1>

        <Card>
          <CardHeader>
            <CardTitle>Pending Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingArticles.map(article => (
              <div key={article.id} className="border-b pb-4 mb-4">
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-muted-foreground">
                  By: {article.author.name} | Submitted: {new Date(article.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => router.push(`/admin/content/preview/${article.id}`)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleApprove(article.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(article.id, "")}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
```

---

## System Configuration

### School Settings

```typescript
export default function SchoolSettingsPage() {
  const [settings, setSettings] = useState({
    schoolName: "",
    academicYear: "",
    semesterStart: "",
    semesterEnd: "",
    gradeScale: 100
  })

  const handleSave = async () => {
    await settingsApi.updateSchoolSettings(settings)
    toast({ title: "Settings updated successfully" })
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>School Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block font-medium mb-2">School Name</label>
            <Input
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Academic Year</label>
            <Input
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              placeholder="2023-2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2">Semester Start</label>
              <Input
                type="date"
                value={settings.semesterStart}
                onChange={(e) => setSettings({ ...settings, semesterStart: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Semester End</label>
              <Input
                type="date"
                value={settings.semesterEnd}
                onChange={(e) => setSettings({ ...settings, semesterEnd: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
```

---

## Reports & Analytics

### System Analytics Dashboard

```typescript
export default function AnalyticsPage() {
  const { data: analytics } = useSystemAnalytics()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Analytics</h1>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UsageMetric title="Daily Active Users" value={analytics?.dau} />
              <UsageMetric title="Average Session Duration" value={`${analytics?.avgSession} min`} />
              <UsageMetric title="Total Page Views" value={analytics?.pageViews} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
```

---

## Best Practices

### ✅ Do's

1. **Implement audit logs for all admin actions**
   ```typescript
   await auditLog.create({
     action: "USER_CREATED",
     userId: admin.id,
     targetId: newUser.id,
     details: { role: newUser.role }
   })
   ```

2. **Use confirmation dialogs for destructive actions**
   ```typescript
   const handleDelete = async () => {
     const confirmed = await confirm("Are you sure?")
     if (confirmed) await deleteUser()
   }
   ```

3. **Provide bulk operations for efficiency**
   ```typescript
   await bulkUpdateUsers(selectedUserIds, { status: "active" })
   ```

### ❌ Don'ts

1. **Don't allow deletion without data backup**
2. **Don't skip validation on critical operations**
3. **Don't expose sensitive system information**

---

## Summary

The Admin Portal provides **comprehensive system management** with:
- ✅ User and role management
- ✅ Academic structure configuration
- ✅ Content moderation
- ✅ System settings
- ✅ Analytics and reporting

---

## Navigation

- **Previous Chapter:** [Chapter 23: Teacher Portal](./23-teacher-portal.md)
- **Next Chapter:** [Chapter 25: Public/Guest Features](./25-public-guest-features.md)
- **Volume Index:** [Volume 4: Feature Documentation](./README.md)
