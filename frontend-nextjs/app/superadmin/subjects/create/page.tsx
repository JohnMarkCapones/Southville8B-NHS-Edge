"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSubjects } from "@/hooks/useSubjects"
import { useDepartments } from "@/hooks/useDepartments"
import {
  ArrowLeft,
  BookOpen,
  Save,
  X,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const CreateSubjectPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { addSubject, loading, error, clearError, checkCodeExists, checkNameExists } = useSubjects()
  const { departments, loadActiveDepartments, loading: departmentsLoading } = useDepartments()

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    department: "none",
    status: "inactive",
    visibility: "public",
  })

  const [selectedGradeLevels, setSelectedGradeLevels] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [validatingCode, setValidatingCode] = useState(false)
  const [validatingName, setValidatingName] = useState(false)

  // Load departments on mount
  useEffect(() => {
    loadActiveDepartments()
  }, [loadActiveDepartments])

  // Debounce timer for validation
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Trigger real-time validation for code and name fields
    if (field === 'code' || field === 'name') {
      // Clear existing timer
      if (validationTimer) {
        clearTimeout(validationTimer)
      }

      // Set new timer for debounced validation (500ms delay)
      const timer = setTimeout(async () => {
        if (field === 'code' && value.trim().length >= 2) {
          setValidatingCode(true)
          const exists = await checkCodeExists(value.trim())
          setValidatingCode(false)

          if (exists) {
            setValidationErrors(prev => ({
              ...prev,
              code: 'This subject code is already in use'
            }))
          }
        } else if (field === 'name' && value.trim().length >= 2) {
          setValidatingName(true)
          const exists = await checkNameExists(value.trim())
          setValidatingName(false)

          if (exists) {
            setValidationErrors(prev => ({
              ...prev,
              name: 'This subject name is already in use'
            }))
          }
        }
      }, 500)

      setValidationTimer(timer)
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer)
      }
    }
  }, [validationTimer])

  const handleGradeLevelToggle = (level: string) => {
    setSelectedGradeLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
    
    // Clear grade level validation error when user selects a level
    if (validationErrors.gradeLevels) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.gradeLevels
        return newErrors
      })
    }
  }

  // Real-time validation helper
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'code':
        if (!value || value.trim() === "") return "Subject Code is required"
        if (value.trim().length < 2) return "Subject Code must be at least 2 characters"
        if (!/^[A-Za-z0-9_-]+$/.test(value.trim())) return "Subject Code can only contain letters, numbers, hyphens, and underscores"
        return null
      case 'name':
        if (!value || value.trim() === "") return "Subject Name is required"
        if (value.trim().length < 2) return "Subject Name must be at least 2 characters"
        if (!/^[A-Za-z0-9\s\-.,()&]+$/.test(value.trim())) return "Subject Name contains invalid characters"
        return null
      case 'description':
        if (value && value.trim().length > 1000) return "Description must be less than 1000 characters"
        return null
      default:
        return null
    }
  }

  // Get field validation state
  const getFieldValidationState = (field: string) => {
    const error = validationErrors[field]
    if (error) return 'error'

    // Show loading state for code and name fields during validation
    if (field === 'code' && validatingCode) return 'validating'
    if (field === 'name' && validatingName) return 'validating'

    if (formData[field as keyof typeof formData] && !error) return 'success'
    return 'default'
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous errors
    clearError()

    // Comprehensive validation
    const validationErrors: string[] = []

    // Required field validations
    if (!formData.code || formData.code.trim() === "") {
      validationErrors.push("Subject Code is required")
    } else if (formData.code.trim().length < 2) {
      validationErrors.push("Subject Code must be at least 2 characters")
    }

    if (!formData.name || formData.name.trim() === "") {
      validationErrors.push("Subject Name is required")
    } else if (formData.name.trim().length < 2) {
      validationErrors.push("Subject Name must be at least 2 characters")
    }

    if (selectedGradeLevels.length === 0) {
      validationErrors.push("At least one Grade Level must be selected")
    }

    // Code format validation (alphanumeric with hyphens/underscores)
    if (formData.code && !/^[A-Za-z0-9_-]+$/.test(formData.code.trim())) {
      validationErrors.push("Subject Code can only contain letters, numbers, hyphens, and underscores")
    }

    // Name format validation (letters, numbers, spaces, and common punctuation)
    if (formData.name && !/^[A-Za-z0-9\s\-.,()&]+$/.test(formData.name.trim())) {
      validationErrors.push("Subject Name contains invalid characters")
    }

    // Description length validation (if provided)
    if (formData.description && formData.description.trim().length > 1000) {
      validationErrors.push("Description must be less than 1000 characters")
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      toast({
        title: "⚠️ Validation Error",
        description: (
          <div className="space-y-1">
            <p className="font-medium">Please fix the following issues:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-muted-foreground">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
        duration: 6000,
      })
      return
    }

    try {
      // Helper function to check if a string is a valid UUID
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      const subjectData = {
        code: formData.code,
        subject_name: formData.name,
        description: formData.description || undefined,
        // Only include department_id if it's a valid UUID and not "none"
        ...(formData.department && formData.department !== "none" && isValidUUID(formData.department) 
          ? { department_id: formData.department } 
          : {}),
        grade_levels: selectedGradeLevels,
        status: formData.status as 'active' | 'inactive' | 'archived',
        visibility: formData.visibility as 'public' | 'students' | 'restricted',
      }

      const newSubject = await addSubject(subjectData)

      if (newSubject) {
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

        // Reset form
        setFormData({
          code: "",
          name: "",
          description: "",
          department: "none",
          status: "inactive",
          visibility: "public",
        })
        setSelectedGradeLevels([])

        // Navigate back to subjects page
        setTimeout(() => {
          router.push("/superadmin/subjects")
        }, 1500)
      }
    } catch (error: any) {
      toast({
        title: "❌ Error Creating Subject",
        description: error?.message || "Failed to create subject. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
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
                  className={`bg-background text-foreground ${
                    getFieldValidationState('code') === 'error' 
                      ? 'border-red-500 focus:border-red-500' 
                      : getFieldValidationState('code') === 'success'
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-border'
                  }`}
                  required
                />
                {validationErrors.code && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.code}
                  </p>
                )}
                {!validationErrors.code && validatingCode && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking availability...
                  </p>
                )}
                {!validationErrors.code && !validatingCode && formData.code && formData.code.length >= 2 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid subject code
                  </p>
                )}
                {!validationErrors.code && !validatingCode && !formData.code && (
                  <p className="text-xs text-muted-foreground">Unique identifier for the subject</p>
                )}
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
                  className={`bg-background text-foreground ${
                    getFieldValidationState('name') === 'error' 
                      ? 'border-red-500 focus:border-red-500' 
                      : getFieldValidationState('name') === 'success'
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-border'
                  }`}
                  required
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
                {!validationErrors.name && validatingName && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking availability...
                  </p>
                )}
                {!validationErrors.name && !validatingName && formData.name && formData.name.length >= 2 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid subject name
                  </p>
                )}
                {!validationErrors.name && !validatingName && !formData.name && (
                  <p className="text-xs text-muted-foreground">Full name of the subject</p>
                )}
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
                className={`bg-background text-foreground min-h-[100px] ${
                  getFieldValidationState('description') === 'error' 
                    ? 'border-red-500 focus:border-red-500' 
                    : getFieldValidationState('description') === 'success'
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-border'
                }`}
                rows={4}
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.description}
                </p>
              )}
              {!validationErrors.description && formData.description && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid description ({formData.description.length}/1000 characters)
                </p>
              )}
              {!validationErrors.description && !formData.description && (
                <p className="text-xs text-muted-foreground">Brief overview of what students will learn</p>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground">
                  Department
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)} disabled={departmentsLoading}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {departmentsLoading
                    ? "Loading departments from database..."
                    : departments.length > 0
                    ? `${departments.length} department${departments.length > 1 ? 's' : ''} available`
                    : "Academic department managing this subject"}
                </p>
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
              {validationErrors.gradeLevels && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.gradeLevels}
                </p>
              )}
              {!validationErrors.gradeLevels && selectedGradeLevels.length > 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {selectedGradeLevels.length} grade level{selectedGradeLevels.length > 1 ? 's' : ''} selected
                </p>
              )}
              {!validationErrors.gradeLevels && selectedGradeLevels.length === 0 && (
                <p className="text-xs text-muted-foreground">Select all applicable grade levels</p>
              )}
            </div>
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
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90" 
            disabled={loading || Object.keys(validationErrors).length > 0 || !formData.code || !formData.name || selectedGradeLevels.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : Object.keys(validationErrors).length > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Fix Errors
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Subject
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateSubjectPage
