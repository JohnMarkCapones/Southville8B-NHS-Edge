"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Plus, Edit, Archive, CheckCircle, Clock, Settings, FileText, Users, BookOpen, TrendingUp, CalendarDays, Target, BarChart3, Activity, Zap, Star, Award, GraduationCap, Trash2, Lightbulb, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { academicYearsApi, type AcademicYear, type AcademicPeriod, type AcademicYearTemplate, type CreateAcademicYearDto, type CreateAcademicPeriodDto } from "@/lib/api/endpoints/academic-years"

// Types are now imported from the API endpoints

export function AcademicYearSection() {
  const { toast } = useToast()
  
  // State management
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState<AcademicPeriod | null>(null)
  const [templates, setTemplates] = useState<AcademicYearTemplate[]>([])
  const [periods, setPeriods] = useState<AcademicPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    year_name: "",
    start_date: "",
    end_date: "",
    structure: "quarters" as const, // Always quarters
    description: "",
    template_id: "d02de26d-9a33-4693-a5b7-efbb818bca9c", // Default quarters template
    auto_generate_periods: true,
    is_active: false,
    // Manual quarter dates
    quarters: {
      q1: { start_date: "", end_date: "" },
      q2: { start_date: "", end_date: "" },
      q3: { start_date: "", end_date: "" },
      q4: { start_date: "", end_date: "" }
    }
  })

  // Load data on component mount
  useEffect(() => {
    loadAcademicYearData()
  }, [])

  const loadAcademicYearData = async () => {
    try {
      setLoading(true)
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      await Promise.all([
        loadAcademicYears(),
        loadActiveYear(),
        loadCurrentPeriod(),
        loadTemplates()
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load academic year data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAcademicYears = async () => {
    try {
      const years = await academicYearsApi.getAll()
      setAcademicYears(years)
    } catch (error) {
      console.error('Error loading academic years:', error)
      toast({
        title: "Error",
        description: "Failed to load academic years",
        variant: "destructive"
      })
    }
  }

  const loadActiveYear = async () => {
    try {
      const activeYear = await academicYearsApi.getActive()
      setActiveYear(activeYear)
      
      // If there's an active year, also load its periods
      if (activeYear) {
        await loadPeriods(activeYear.id)
      }
    } catch (error) {
      console.error('Error loading active year:', error)
      toast({
        title: "Error",
        description: "Failed to load active academic year",
        variant: "destructive"
      })
    }
  }

  const loadCurrentPeriod = async () => {
    try {
      const currentPeriod = await academicYearsApi.getCurrentPeriod()
      setCurrentPeriod(currentPeriod)
    } catch (error) {
      console.error('Error loading current period:', error)
      toast({
        title: "Error",
        description: "Failed to load current academic period",
        variant: "destructive"
      })
    }
  }

  const loadTemplates = async () => {
    try {
      const templates = await academicYearsApi.getTemplates()
      setTemplates(templates)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load academic year templates",
        variant: "destructive"
      })
    }
  }

  const loadPeriods = async (academicYearId: string) => {
    try {
      const periods = await academicYearsApi.getPeriods(academicYearId)
      setPeriods(periods)
    } catch (error) {
      console.error('Error loading periods:', error)
      toast({
        title: "Error",
        description: "Failed to load academic periods",
        variant: "destructive"
      })
    }
  }

  const handleCreateAcademicYear = async () => {
    try {
      // Validate manual quarter dates if not auto-generating
      if (!formData.auto_generate_periods) {
        const validation = validateQuarterDates()
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: "Please fix the date validation issues before creating the academic year",
            variant: "destructive"
          })
          return
        }
      }

      const createData: CreateAcademicYearDto = {
        year_name: formData.year_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        structure: formData.structure,
        is_active: formData.is_active,
        description: formData.description,
        auto_generate_periods: formData.auto_generate_periods,
        template_id: formData.template_id
      }
      
      const createdYear = await academicYearsApi.create(createData)
      
      // If manual periods are specified, create them individually
      if (!formData.auto_generate_periods) {
        const quarters = [
          { name: "Quarter 1", order: 1, ...formData.quarters.q1 },
          { name: "Quarter 2", order: 2, ...formData.quarters.q2 },
          { name: "Quarter 3", order: 3, ...formData.quarters.q3 },
          { name: "Quarter 4", order: 4, ...formData.quarters.q4 }
        ]
        
        for (const quarter of quarters) {
          if (quarter.start_date && quarter.end_date) {
            const periodData: CreateAcademicPeriodDto = {
              academicYearId: createdYear.id,
              periodName: quarter.name,
              periodOrder: quarter.order,
              startDate: quarter.start_date,
              endDate: quarter.end_date,
              isGradingPeriod: true,
              weight: 0.25, // Each quarter is 25% of the year
              description: `${quarter.name} of ${formData.year_name}`
            }
            
            await academicYearsApi.createPeriod(periodData)
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Academic year created successfully"
      })
      
      setShowCreateForm(false)
      setFormData({
        year_name: "",
        start_date: "",
        end_date: "",
        structure: "quarters", // Always quarters
        description: "",
        template_id: "d02de26d-9a33-4693-a5b7-efbb818bca9c", // Default quarters template
        auto_generate_periods: true,
        is_active: false,
        quarters: {
          q1: { start_date: "", end_date: "" },
          q2: { start_date: "", end_date: "" },
          q3: { start_date: "", end_date: "" },
          q4: { start_date: "", end_date: "" }
        }
      })
      
      // Reload data
      await loadAcademicYearData()
    } catch (error: any) {
      let errorMessage = "Failed to create academic year"
      
      // Handle specific error cases
      if (error?.message?.includes("already exists")) {
        errorMessage = `Academic year "${formData.year_name}" already exists. Please use a different name or check if there's an archived version.`
      } else if (error?.message?.includes("overlaps")) {
        errorMessage = "This academic year overlaps with an existing one. Please adjust the dates."
      } else if (error?.message?.includes("Start date must be before end date")) {
        errorMessage = "Start date must be before end date. Please check your dates."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const handleSetActiveYear = async (yearId: string) => {
    try {
      await academicYearsApi.update(yearId, { is_active: true })
      
      toast({
        title: "Success",
        description: "Active academic year updated"
      })
      
      await loadAcademicYearData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update active academic year",
        variant: "destructive"
      })
    }
  }

  const handleArchiveYear = async (yearId: string) => {
    try {
      await academicYearsApi.archive(yearId)
      
      toast({
        title: "Success",
        description: "Academic year archived"
      })
      
      await loadAcademicYearData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive academic year",
        variant: "destructive"
      })
    }
  }

  const handleHardDeleteYear = async () => {
    if (!yearToDelete) return
    
    try {
      await academicYearsApi.hardDelete(yearToDelete.id)
      
      toast({
        title: "Success",
        description: `Academic year "${yearToDelete.year_name}" permanently deleted`
      })
      
      // Close modal and reset state
      setShowDeleteModal(false)
      setYearToDelete(null)
      setDeleteConfirmationText("")
      
      await loadAcademicYearData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete academic year",
        variant: "destructive"
      })
    }
  }

  const openDeleteModal = (year: AcademicYear) => {
    setYearToDelete(year)
    setShowDeleteModal(true)
    setDeleteConfirmationText("")
  }

  // Date validation and suggestion functions
  const generateQuarterSuggestions = () => {
    if (!formData.start_date || !formData.end_date) return null

    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const quarterDays = Math.floor(totalDays / 4)

    const suggestions = {
      q1: {
        start_date: formData.start_date,
        end_date: new Date(startDate.getTime() + (quarterDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      q2: {
        start_date: new Date(startDate.getTime() + ((quarterDays + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        end_date: new Date(startDate.getTime() + ((quarterDays * 2) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      q3: {
        start_date: new Date(startDate.getTime() + ((quarterDays * 2 + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        end_date: new Date(startDate.getTime() + ((quarterDays * 3) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      },
      q4: {
        start_date: new Date(startDate.getTime() + ((quarterDays * 3 + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        end_date: formData.end_date
      }
    }

    return suggestions
  }

  const validateQuarterDates = () => {
    const errors: string[] = []
    const quarters = formData.quarters

    // Check if all dates are filled
    const allDates = [
      quarters.q1.start_date, quarters.q1.end_date,
      quarters.q2.start_date, quarters.q2.end_date,
      quarters.q3.start_date, quarters.q3.end_date,
      quarters.q4.start_date, quarters.q4.end_date
    ]

    if (allDates.some(date => !date)) {
      return { isValid: false, errors: ['All quarter dates must be filled'] }
    }

    // Convert to Date objects
    const dates = {
      q1Start: new Date(quarters.q1.start_date),
      q1End: new Date(quarters.q1.end_date),
      q2Start: new Date(quarters.q2.start_date),
      q2End: new Date(quarters.q2.end_date),
      q3Start: new Date(quarters.q3.start_date),
      q3End: new Date(quarters.q3.end_date),
      q4Start: new Date(quarters.q4.start_date),
      q4End: new Date(quarters.q4.end_date)
    }

    // Validate each quarter's start < end
    if (dates.q1Start >= dates.q1End) errors.push('Quarter 1: Start date must be before end date')
    if (dates.q2Start >= dates.q2End) errors.push('Quarter 2: Start date must be before end date')
    if (dates.q3Start >= dates.q3End) errors.push('Quarter 3: Start date must be before end date')
    if (dates.q4Start >= dates.q4End) errors.push('Quarter 4: Start date must be before end date')

    // Validate quarter sequence
    if (dates.q1End >= dates.q2Start) errors.push('Quarter 1 end date must be before Quarter 2 start date')
    if (dates.q2End >= dates.q3Start) errors.push('Quarter 2 end date must be before Quarter 3 start date')
    if (dates.q3End >= dates.q4Start) errors.push('Quarter 3 end date must be before Quarter 4 start date')

    // Validate minimum quarter duration (6 weeks = 42 days)
    const q1Days = Math.ceil((dates.q1End.getTime() - dates.q1Start.getTime()) / (1000 * 60 * 60 * 24))
    const q2Days = Math.ceil((dates.q2End.getTime() - dates.q2Start.getTime()) / (1000 * 60 * 60 * 24))
    const q3Days = Math.ceil((dates.q3End.getTime() - dates.q3Start.getTime()) / (1000 * 60 * 60 * 24))
    const q4Days = Math.ceil((dates.q4End.getTime() - dates.q4Start.getTime()) / (1000 * 60 * 60 * 24))

    if (q1Days < 42) errors.push('Quarter 1 must be at least 6 weeks (42 days) long')
    if (q2Days < 42) errors.push('Quarter 2 must be at least 6 weeks (42 days) long')
    if (q3Days < 42) errors.push('Quarter 3 must be at least 6 weeks (42 days) long')
    if (q4Days < 42) errors.push('Quarter 4 must be at least 6 weeks (42 days) long')

    // Validate academic year alignment
    if (dates.q1Start.toISOString().split('T')[0] !== formData.start_date) {
      errors.push('Academic year start date should match Quarter 1 start date')
    }
    if (dates.q4End.toISOString().split('T')[0] !== formData.end_date) {
      errors.push('Academic year end date should match Quarter 4 end date')
    }

    return { isValid: errors.length === 0, errors }
  }

  const applyQuarterSuggestions = () => {
    const suggestions = generateQuarterSuggestions()
    if (suggestions) {
      setFormData({
        ...formData,
        quarters: suggestions
      })
    }
  }

  const syncAcademicYearDates = () => {
    const quarters = formData.quarters
    if (quarters.q1.start_date && quarters.q4.end_date) {
      setFormData({
        ...formData,
        start_date: quarters.q1.start_date,
        end_date: quarters.q4.end_date
      })
    }
  }

  // System always uses 4 quarters - no need for structure functions

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-blue"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Debug info
  console.log('AcademicYearSection render - showCreateForm:', showCreateForm, 'loading:', loading)

  return (
    <div className="space-y-6">
      {/* Enhanced Academic Year Overview */}
      <Card className="border-2 border-primary/20 shadow-lg dark:border-primary/30 dark:shadow-2xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-background to-muted/20 dark:from-background dark:to-muted/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            Academic Year Overview
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Comprehensive view of the current academic year and system status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeYear ? (
            <>
              {/* Main Year Information */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg p-6 border border-primary/20 dark:border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-primary dark:text-white">{activeYear.year_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activeYear.start_date).toLocaleDateString()} - {new Date(activeYear.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 border-primary/20 dark:border-primary/30">
                      <Star className="h-3 w-3 mr-1" />
                      4 Quarters
                    </Badge>
                  </div>
                </div>

                {activeYear.description && (
                  <p className="text-muted-foreground bg-white/50 dark:bg-black/20 rounded-md p-3 border dark:border-border">
                    {activeYear.description}
                  </p>
                )}
              </div>

              {/* Academic Quarters Display */}
              {periods.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Academic Quarters</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Quarterly schedule for {activeYear.year_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {periods
                      .sort((a, b) => a.period_order - b.period_order)
                      .map((period) => (
                        <div key={period.id} className={`p-3 rounded-lg border transition-colors ${
                          currentPeriod?.id === period.id 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-medium ${
                              currentPeriod?.id === period.id 
                                ? 'text-emerald-900 dark:text-emerald-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {period.period_name}
                            </h5>
                            {currentPeriod?.id === period.id && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Start:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {new Date(period.start_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">End:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {new Date(period.end_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {(period.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Periods</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{periods.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Grading Periods</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {periods.filter(p => p.is_grading_period).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Progress</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {activeYear ? Math.round((new Date().getTime() - new Date(activeYear.start_date).getTime()) / (new Date(activeYear.end_date).getTime() - new Date(activeYear.start_date).getTime()) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Templates</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{templates.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Period Highlight */}
              {currentPeriod && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                      <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Current Period</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">{currentPeriod.period_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-emerald-800 dark:text-emerald-200">Start:</span>
                      <span className="ml-2 text-emerald-700 dark:text-emerald-300">{new Date(currentPeriod.start_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-emerald-800 dark:text-emerald-200">End:</span>
                      <span className="ml-2 text-emerald-700 dark:text-emerald-300">{new Date(currentPeriod.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Quarters Overview */}
              {periods.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Academic Quarters</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Quarterly schedule for {activeYear?.year_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {periods
                      .sort((a, b) => a.period_order - b.period_order)
                      .map((period) => (
                        <div key={period.id} className={`p-3 rounded-lg border transition-colors ${
                          currentPeriod?.id === period.id 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`font-medium ${
                              currentPeriod?.id === period.id 
                                ? 'text-emerald-900 dark:text-emerald-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {period.period_name}
                            </h5>
                            {currentPeriod?.id === period.id && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Start:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {new Date(period.start_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">End:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {new Date(period.end_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                              <span className={`font-medium ${
                                currentPeriod?.id === period.id 
                                  ? 'text-emerald-700 dark:text-emerald-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {(period.weight * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </>
          ) : (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 transition-colors">
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  No active academic year found. Create one to get started with the academic year management system.
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Academic Years Management */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                Academic Years Management
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Create and manage academic years and their periods
              </CardDescription>
            </div>
            <Button onClick={() => {
              console.log('Create Academic Year button clicked!')
              setShowCreateForm(true)
            }} className="gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80">
              <Plus className="h-4 w-4" />
              Create Academic Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {academicYears.length === 0 ? (
            <Alert>
              <AlertDescription>
                No academic years found. Create your first academic year to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {academicYears.map((year) => (
                <div key={year.id} className={`border rounded-lg p-6 transition-all hover:shadow-md dark:hover:shadow-lg ${
                  year.is_active 
                    ? 'border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10' 
                    : year.is_archived 
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50' 
                      : 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          year.is_active 
                            ? 'bg-primary/10 dark:bg-primary/20' 
                            : year.is_archived 
                              ? 'bg-gray-100 dark:bg-gray-800' 
                              : 'bg-orange-100 dark:bg-orange-900/50'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            year.is_active 
                              ? 'text-primary' 
                              : year.is_archived 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-orange-600 dark:text-orange-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            year.is_active 
                              ? 'text-primary dark:text-primary-foreground' 
                              : year.is_archived 
                                ? 'text-gray-900 dark:text-gray-100' 
                                : 'text-orange-900 dark:text-orange-100'
                          }`}>
                            {year.year_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(year.start_date).toLocaleDateString()} - {new Date(year.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          4 Quarters
                        </Badge>
                        {year.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700">
                            <Activity className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : year.is_archived ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {year.description && (
                        <p className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 rounded-md p-3 border dark:border-border">
                          {year.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!year.is_active && !year.is_archived && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActiveYear(year.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingYear(year)
                          loadPeriods(year.id)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!year.is_archived && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveYear(year.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(year)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Academic Year Form */}
      {showCreateForm && (
        <Card className="border-2 border-red-500">
          <CardHeader>
            <CardTitle>Create New Academic Year</CardTitle>
            <CardDescription>Set up a new academic year with 4 quarters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year_name">Academic Year</Label>
                <Input
                  id="year_name"
                  value={formData.year_name}
                  onChange={(e) => setFormData({ ...formData, year_name: e.target.value })}
                  placeholder="2024-2025"
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    System Structure: 4 Quarters
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  All academic years use a 4-quarter structure (Q1, Q2, Q3, Q4)
                </p>
              </div>

              {/* Existing Academic Years Info */}
              {academicYears.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Existing Academic Years
                    </span>
                  </div>
                  <div className="space-y-1">
                    {academicYears.map((year) => (
                      <div key={year.id} className="flex items-center justify-between text-xs">
                        <span className="text-amber-800 dark:text-amber-200">{year.year_name}</span>
                        <div className="flex gap-1">
                          {year.is_active && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                              Active
                            </span>
                          )}
                          {year.is_archived && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    💡 You can reuse names of archived academic years
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            {/* Template is automatically set to quarters - no selection needed */}
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Template: Philippine Standard Quarters
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Automatically using the default quarters template for period generation
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_generate_periods"
                checked={formData.auto_generate_periods}
                onChange={(e) => setFormData({ ...formData, auto_generate_periods: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="auto_generate_periods">Auto-generate periods from template</Label>
            </div>

            {/* Manual Quarter Dates - Only show when auto-generate is unchecked */}
            {!formData.auto_generate_periods && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Manual Quarter Dates</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyQuarterSuggestions}
                      disabled={!formData.start_date || !formData.end_date}
                      className="gap-2"
                    >
                      <Lightbulb className="h-3 w-3" />
                      Auto-suggest
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={syncAcademicYearDates}
                      disabled={!formData.quarters.q1.start_date || !formData.quarters.q4.end_date}
                      className="gap-2"
                    >
                      <Calendar className="h-3 w-3" />
                      Sync Year Dates
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set custom start and end dates for each quarter. Use "Auto-suggest" to generate dates based on your academic year range.
                </p>

                {/* Validation Errors */}
                {(() => {
                  const validation = validateQuarterDates()
                  if (!validation.isValid && formData.quarters.q1.start_date) {
                    return (
                      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          <strong>Date Validation Issues:</strong>
                          <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                            {validation.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )
                  }
                  return null
                })()}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quarter 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-blue-600 dark:text-blue-400">Quarter 1</Label>
                      {formData.quarters.q1.start_date && formData.quarters.q1.end_date && (
                        <Badge variant="outline" className="text-xs">
                          {Math.ceil((new Date(formData.quarters.q1.end_date).getTime() - new Date(formData.quarters.q1.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="q1_start" className="text-xs">Start Date</Label>
                        <Input
                          id="q1_start"
                          type="date"
                          value={formData.quarters.q1.start_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q1: { ...formData.quarters.q1, start_date: e.target.value }
                            }
                          })}
                          className={formData.quarters.q1.start_date && formData.start_date && formData.quarters.q1.start_date !== formData.start_date ? "border-orange-300 focus:border-orange-400" : ""}
                        />
                        {formData.quarters.q1.start_date && formData.start_date && formData.quarters.q1.start_date !== formData.start_date && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            ⚠️ Should match academic year start date
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="q1_end" className="text-xs">End Date</Label>
                        <Input
                          id="q1_end"
                          type="date"
                          value={formData.quarters.q1.end_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q1: { ...formData.quarters.q1, end_date: e.target.value }
                            }
                          })}
                          className={formData.quarters.q1.start_date && formData.quarters.q1.end_date && new Date(formData.quarters.q1.start_date) >= new Date(formData.quarters.q1.end_date) ? "border-red-300 focus:border-red-400" : ""}
                        />
                        {formData.quarters.q1.start_date && formData.quarters.q1.end_date && new Date(formData.quarters.q1.start_date) >= new Date(formData.quarters.q1.end_date) && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ❌ End date must be after start date
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quarter 2 */}
                  <div className="space-y-2">
                    <Label className="font-medium text-green-600 dark:text-green-400">Quarter 2</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="q2_start" className="text-xs">Start Date</Label>
                        <Input
                          id="q2_start"
                          type="date"
                          value={formData.quarters.q2.start_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q2: { ...formData.quarters.q2, start_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q2_end" className="text-xs">End Date</Label>
                        <Input
                          id="q2_end"
                          type="date"
                          value={formData.quarters.q2.end_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q2: { ...formData.quarters.q2, end_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quarter 3 */}
                  <div className="space-y-2">
                    <Label className="font-medium text-orange-600 dark:text-orange-400">Quarter 3</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="q3_start" className="text-xs">Start Date</Label>
                        <Input
                          id="q3_start"
                          type="date"
                          value={formData.quarters.q3.start_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q3: { ...formData.quarters.q3, start_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q3_end" className="text-xs">End Date</Label>
                        <Input
                          id="q3_end"
                          type="date"
                          value={formData.quarters.q3.end_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q3: { ...formData.quarters.q3, end_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quarter 4 */}
                  <div className="space-y-2">
                    <Label className="font-medium text-purple-600 dark:text-purple-400">Quarter 4</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="q4_start" className="text-xs">Start Date</Label>
                        <Input
                          id="q4_start"
                          type="date"
                          value={formData.quarters.q4.start_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q4: { ...formData.quarters.q4, start_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="q4_end" className="text-xs">End Date</Label>
                        <Input
                          id="q4_end"
                          type="date"
                          value={formData.quarters.q4.end_date}
                          onChange={(e) => setFormData({
                            ...formData,
                            quarters: {
                              ...formData.quarters,
                              q4: { ...formData.quarters.q4, end_date: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Set as active academic year</Label>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAcademicYear}>
                Create Academic Year
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Periods Management */}
      {editingYear && periods.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Academic Periods - {editingYear.year_name}
            </CardTitle>
            <CardDescription>Manage periods and their dates for this academic year</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periods
                .sort((a, b) => a.period_order - b.period_order)
                .map((period) => (
                  <div key={period.id} className={`border rounded-lg p-4 transition-all hover:shadow-md dark:hover:shadow-lg ${
                    currentPeriod?.id === period.id 
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/40'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${
                            currentPeriod?.id === period.id 
                              ? 'text-emerald-900 dark:text-emerald-100' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {period.period_name}
                          </h4>
                          {currentPeriod?.id === period.id && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            #{period.period_order}
                          </Badge>
                          {period.is_grading_period && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Grading
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced Date Display */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date:</span>
                          <span className={`text-sm font-semibold ${
                            currentPeriod?.id === period.id 
                              ? 'text-emerald-700 dark:text-emerald-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {new Date(period.start_date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">End Date:</span>
                          <span className={`text-sm font-semibold ${
                            currentPeriod?.id === period.id 
                              ? 'text-emerald-700 dark:text-emerald-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {new Date(period.end_date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Weight:</span>
                          <span className={`text-sm font-semibold ${
                            currentPeriod?.id === period.id 
                              ? 'text-emerald-700 dark:text-emerald-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {(period.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Settings className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Academic Year
            </DialogTitle>
            <DialogDescription className="text-left">
              This action cannot be undone. This will permanently delete the academic year{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                "{yearToDelete?.year_name}"
              </span>{" "}
              and all associated periods from the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will permanently delete:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>The academic year "{yearToDelete?.year_name}"</li>
                  <li>All associated academic periods</li>
                  <li>All related data and records</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Type <span className="font-bold text-red-600 dark:text-red-400">Delete</span> to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Delete"
                className="border-red-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setYearToDelete(null)
                setDeleteConfirmationText("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHardDeleteYear}
              disabled={deleteConfirmationText !== "Delete"}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
