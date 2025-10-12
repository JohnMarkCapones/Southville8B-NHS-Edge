"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  BookOpen,
  Save,
  X,
  Plus,
  Users,
  GraduationCap,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

const CreateSubjectPage = () => {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
    department: "",
    maxCapacity: "",
    credits: "",
    schedule: "",
    status: "inactive",
    visibility: "public",
  })

  const [selectedGradeLevels, setSelectedGradeLevels] = useState<string[]>([])
  const [prerequisites, setPrerequisites] = useState<string[]>([])
  const [newPrerequisite, setNewPrerequisite] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGradeLevelToggle = (level: string) => {
    setSelectedGradeLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites((prev) => [...prev, newPrerequisite.trim()])
      setNewPrerequisite("")
    }
  }

  const handleRemovePrerequisite = (prerequisite: string) => {
    setPrerequisites((prev) => prev.filter((p) => p !== prerequisite))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.code || !formData.name || !formData.category || !formData.department) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please fill in all required fields (Code, Name, Category, Department)",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (selectedGradeLevels.length === 0) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please select at least one grade level",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    // TODO: Replace with actual database integration
    toast({
      title: "✅ Subject Created Successfully",
      description: (
        <div className="space-y-2">
          <p className="font-medium text-foreground">{formData.name} has been created</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              <BookOpen className="w-3 h-3" />
            </div>
            <span>{formData.code}</span>
            <span>•</span>
            <span>{formData.department}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for teacher assignment</span>
          </div>
        </div>
      ),
      variant: "default",
      duration: 6000,
      className: "border-green-500/20 bg-green-500/5 backdrop-blur-md",
    })

    // Navigate back to subjects page
    setTimeout(() => {
      router.push("/superadmin/subjects")
    }, 1500)
  }

  const handleCancel = () => {
    router.push("/superadmin/subjects")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel} className="border-border bg-transparent">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Subject</h1>
            <p className="text-muted-foreground">Add a new subject to the academic curriculum</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the fundamental details of the subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-foreground">
                  Subject Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., MATH-8A"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="bg-background border-border text-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier for the subject</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Subject Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics 8"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-background border-border text-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground">Full name of the subject</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter a detailed description of the subject..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-background border-border text-foreground min-h-[100px]"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Brief overview of what students will learn</p>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Classification
            </CardTitle>
            <CardDescription className="text-muted-foreground">Categorize and organize the subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="specialized">Specialized</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Type of subject in the curriculum</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Academic department managing this subject</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                Grade Levels <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {["Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((level) => (
                  <Badge
                    key={level}
                    variant={selectedGradeLevels.includes(level) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedGradeLevels.includes(level)
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleGradeLevelToggle(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select all applicable grade levels</p>
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-orange-600" />
              Course Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Schedule, capacity, and credit information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="text-foreground">
                  Max Capacity
                </Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="e.g., 40"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                  className="bg-background border-border text-foreground"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">Maximum number of students</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits" className="text-foreground">
                  Credits
                </Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="e.g., 4"
                  value={formData.credits}
                  onChange={(e) => handleInputChange("credits", e.target.value)}
                  className="bg-background border-border text-foreground"
                  min="1"
                  step="0.5"
                />
                <p className="text-xs text-muted-foreground">Academic credit units</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-foreground">
                  Schedule
                </Label>
                <Input
                  id="schedule"
                  placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
                  value={formData.schedule}
                  onChange={(e) => handleInputChange("schedule", e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Class meeting times</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="w-5 h-5 text-green-600" />
              Prerequisites
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Required subjects or conditions before enrollment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter prerequisite subject code (e.g., MATH-7A)"
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddPrerequisite()
                  }
                }}
                className="bg-background border-border text-foreground"
              />
              <Button
                type="button"
                onClick={handleAddPrerequisite}
                variant="outline"
                className="border-border bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prerequisite, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                    {prerequisite}
                    <button
                      type="button"
                      onClick={() => handleRemovePrerequisite(prerequisite)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {prerequisites.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No prerequisites added</div>
            )}
          </CardContent>
        </Card>

        {/* Status & Visibility */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-blue-600" />
              Status & Visibility
            </CardTitle>
            <CardDescription className="text-muted-foreground">Control subject availability and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Current operational status</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-foreground">
                  Visibility
                </Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange("visibility", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Who can view this subject</p>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    New subjects are created as <strong>Inactive</strong> by default. You can activate them after
                    assigning a teacher and adding course materials.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 sticky bottom-6 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
          <Button type="button" variant="outline" onClick={handleCancel} className="border-border bg-transparent">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Create Subject
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateSubjectPage
