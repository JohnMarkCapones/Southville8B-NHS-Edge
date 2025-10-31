"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { academicYearsApi } from "@/lib/api/endpoints/academic-years"
import { adminListSections, adminListSubjects, adminListTeachers, adminListBuildings, adminListFloors, adminListRooms, adminCreateSchedule, adminCheckConflicts } from "@/lib/api/endpoints/schedules"
import Link from "next/link"
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  UserCheck,
  CalendarDays,
  Repeat,
  Eye,
  Loader2,
  AlertTriangle,
  Trash2,
  Keyboard
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export default function WizardPage() {
  const { data: activeYear } = useQuery({ queryKey: ['active-year'], queryFn: () => academicYearsApi.getActive() })
  const { data: currentPeriod } = useQuery({ queryKey: ['current-period'], queryFn: () => academicYearsApi.getCurrentPeriod() })
  const defaultSchoolYear = activeYear?.year_name || ''

  // Map current period to grading period (Q1, Q2, Q3, Q4)
  const defaultGradingPeriod = (() => {
    if (!currentPeriod?.period_name) return ''
    const n = currentPeriod.period_name.toLowerCase()

    // Check for quarter patterns
    if (n.includes('q1') || n.includes('first quarter') || n.includes('1st quarter')) return 'Q1'
    if (n.includes('q2') || n.includes('second quarter') || n.includes('2nd quarter')) return 'Q2'
    if (n.includes('q3') || n.includes('third quarter') || n.includes('3rd quarter')) return 'Q3'
    if (n.includes('q4') || n.includes('fourth quarter') || n.includes('4th quarter')) return 'Q4'

    // Fallback: Try to extract Q + number pattern
    const match = n.match(/q(\d)/)
    if (match && match[1] >= '1' && match[1] <= '4') {
      return `Q${match[1]}` as 'Q1' | 'Q2' | 'Q3' | 'Q4'
    }

    return ''
  })()

  const defaultSemester = defaultGradingPeriod // Keep for backwards compatibility

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:scale-105"
            >
              <Link href="/superadmin/schedule">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Schedule Wizard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Step-by-step schedule creation with conflict detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <Keyboard className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono">Enter</kbd>
                <span>Next</span>
                <span className="mx-1">•</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono">Esc</kbd>
                <span>Back</span>
              </div>
            </div>
          </div>
        </div>
        <WizardTopStepper
          defaultSchoolYear={defaultSchoolYear}
          defaultSemester={defaultSemester}
          defaultGradingPeriod={defaultGradingPeriod}
          activeYear={activeYear}
          currentPeriod={currentPeriod}
        />
      </div>
    </div>
  )
}

function WizardTopStepper({
  defaultSchoolYear,
  defaultSemester,
  defaultGradingPeriod,
  activeYear,
  currentPeriod
}: {
  defaultSchoolYear: string;
  defaultSemester: string;
  defaultGradingPeriod: string;
  activeYear: any;
  currentPeriod: any;
}) {
  const STORAGE_KEY = 'schedule-wizard-progress'
  const { toast } = useToast()

  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error)
    }
    return null
  }

  const [step, setStep] = useState(() => {
    const saved = loadSavedProgress()
    return saved?.step || 1
  })
  const [busy, setBusy] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successDetails, setSuccessDetails] = useState({ count: 0, days: [] as string[] })
  const [conflictCheck, setConflictCheck] = useState<{ loading: boolean; conflicts: any[] }>({ loading: false, conflicts: [] })

  const useDebounce = <T,>(value: T, delay = 250) => {
    const [v, setV] = useState(value as T)
    useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id) }, [value, delay])
    return v
  }

  const [form, setForm] = useState(() => {
    const saved = loadSavedProgress()
    if (saved?.form) {
      // Migrate old form data: remove semester, ensure gradingPeriod exists
      const { semester, ...rest } = saved.form
      return {
        ...rest,
        gradingPeriod: rest.gradingPeriod || ((['Q1','Q2','Q3','Q4'] as string[]).includes(semester) ? semester : '') || (['Q1','Q2','Q3','Q4'] as string[]).includes(defaultSemester) ? (defaultSemester as 'Q1'|'Q2'|'Q3'|'Q4') : '',
      }
    }
    return {
      schoolYear: defaultSchoolYear || '',
      gradingPeriod: (['Q1','Q2','Q3','Q4'] as string[]).includes(defaultSemester) ? (defaultSemester as 'Q1'|'Q2'|'Q3'|'Q4') : '',
      sectionId: '', sectionIds: [] as string[], bulkMode: false,
      subjectId: '', teacherId: '',
      buildingId: '', floorId: '', roomId: '',
      pattern: 'MWF' as 'MWF' | 'TTh' | 'Custom', days: ['Monday','Wednesday','Friday'] as string[],
      startTime: '08:00', endTime: '09:00',
    }
  })

  // Show notification if progress was restored
  useEffect(() => {
    const saved = loadSavedProgress()
    if (saved?.form) {
      toast({
        title: 'Progress Restored',
        description: 'Your previous wizard progress has been restored.',
        duration: 3000,
      })
    }
  }, [])

  useEffect(()=>{ if (!form.schoolYear && defaultSchoolYear) setForm(f=>({...f, schoolYear: defaultSchoolYear})) }, [defaultSchoolYear])
  useEffect(()=>{ if (!form.gradingPeriod && (['Q1','Q2','Q3','Q4'] as string[]).includes(defaultSemester)) setForm(f=>({...f, gradingPeriod: defaultSemester as any})) }, [defaultSemester])

  // Save progress to localStorage whenever form or step changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [form, step])

  // Function to clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
    toast({
      title: 'Progress Cleared',
      description: 'Wizard progress has been reset.',
    })
  }

  const { data: sectionsData } = useQuery({ queryKey: ['wizard2-sections'], queryFn: () => adminListSections({ limit: 200 }) })
  const { data: subjectsData } = useQuery({ queryKey: ['wizard2-subjects'], queryFn: () => adminListSubjects({ limit: 100 }) })
  
  // Fetch all teachers when a subject is selected (not filtered by subject)
  const { data: allTeachersData } = useQuery({ 
    queryKey: ['wizard2-all-teachers'], 
    queryFn: () => adminListTeachers({ limit: 200 }), 
    enabled: !!form.subjectId 
  })
  
  // Fetch teachers with this subject specialization (for reference)
  const { data: specializedTeachersData } = useQuery({ 
    queryKey: ['wizard2-teachers', form.subjectId], 
    queryFn: () => adminListTeachers({ limit: 200, subjectId: form.subjectId || undefined }), 
    enabled: !!form.subjectId 
  })
  const [subjectSearch, setSubjectSearch] = useState('')
  const [teacherSearch, setTeacherSearch] = useState('')
  const [showTeacherConfirmModal, setShowTeacherConfirmModal] = useState(false)
  const [pendingTeacherId, setPendingTeacherId] = useState<string | null>(null)
  const [bSearch, setBSearch] = useState(''); const dbB = useDebounce(bSearch)
  const [fSearch, setFSearch] = useState(''); const dbF = useDebounce(fSearch)
  const [rSearch, setRSearch] = useState(''); const dbR = useDebounce(rSearch)
  const { data: buildingsData } = useQuery({ queryKey: ['wizard2-buildings', dbB], queryFn: () => adminListBuildings({ limit: 100, search: dbB || undefined }) })
  const { data: floorsData } = useQuery({ queryKey: ['wizard2-floors', form.buildingId, dbF], queryFn: () => adminListFloors({ limit: 100, buildingId: form.buildingId || undefined, search: dbF || undefined }), enabled: !!form.buildingId })
  const { data: roomsData } = useQuery({ queryKey: ['wizard2-rooms', form.floorId, dbR], queryFn: () => adminListRooms({ limit: 100, floorId: form.floorId || undefined, search: dbR || undefined }), enabled: !!form.floorId })
  const sections = sectionsData?.data || []
  const subjects = subjectsData?.data || []
  const allTeachers = allTeachersData?.data || []
  const specializedTeachers = specializedTeachersData?.data || []
  const teachers = allTeachers // Alias for Summary usage and rendering
  
  // Create lookup sets for specialization by both id and email (emails are more reliable across endpoints)
  const specializedTeacherIds = new Set(
    specializedTeachers
      .map((t: any) => t?.id)
      .filter(Boolean)
  )
  const specializedTeacherEmails = new Set(
    specializedTeachers
      .map((t: any) => (t?.email || '').toLowerCase())
      .filter((e: string) => !!e)
  )
  
  // Helper to check if teacher has the selected subject
  const teacherHasSelectedSubject = (t: any): boolean => {
    const idHas = t?.id ? specializedTeacherIds.has(t.id) : false
    const emailHas = (t?.email ? specializedTeacherEmails.has(String(t.email).toLowerCase()) : false)
    return !!(idHas || emailHas)
  }
  
  // Helper to match name/email against search (case-insensitive)
  const teacherMatchesSearch = (t: any, q: string) => {
    const searchLower = q.toLowerCase()
    const fullName = (t.full_name || '').toLowerCase()
    const firstName = (t.first_name || '').toLowerCase()
    const lastName = (t.last_name || '').toLowerCase()
    const email = (t.email || '').toLowerCase()
    return (
      fullName.includes(searchLower) ||
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower) ||
      `${firstName} ${lastName}`.trim().includes(searchLower)
    )
  }
  
  const isSearchingTeachers = teacherSearch.trim().length > 0

  // Base list: if searching -> all teachers filtered by search; else -> only specialized teachers
  const teachersFiltered = isSearchingTeachers
    ? (teachers as any[]).filter(t => teacherMatchesSearch(t, teacherSearch))
    : (teachers as any[]).filter(t => teacherHasSelectedSubject(t))
  
  // Filter subjects by search query
  const subjectsFiltered = subjectSearch.trim() 
    ? subjects.filter((sub: any) => {
        const searchLower = subjectSearch.toLowerCase()
        const subjectName = (sub.subject_name || sub.subjectName || '').toLowerCase()
        const code = (sub.code || '').toLowerCase()
        const description = (sub.description || '').toLowerCase()
        return subjectName.includes(searchLower) || 
               code.includes(searchLower) || 
               description.includes(searchLower)
      })
    : subjects
  
  // Derive grades from sections and support Grade -> Section cascading selection
  const getSectionGrade = (s:any) => String(s.grade_level ?? s.gradeLevel ?? s.grade?.level ?? s.grade?.name ?? '')
  const gradeOptions = Array.from(new Set((sections||[]).map(getSectionGrade).filter(Boolean)))
  const [selectedGrade, setSelectedGrade] = useState('')
  const filteredSections = (selectedGrade ? sections.filter((s:any)=> getSectionGrade(s) === selectedGrade) : sections)
  const buildings = buildingsData?.data || []; const floors = floorsData?.data || []; const rooms = roomsData?.data || []

  const stepsMeta = [
    { n:1, title:'Academic Term', desc:'School year and quarter', icon: CalendarDays, color: 'from-blue-500 to-cyan-500' },
    { n:2, title:'Section', desc:'Select target section', icon: GraduationCap, color: 'from-purple-500 to-pink-500' },
    { n:3, title:'Details', desc:'Subject, teacher & room', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { n:4, title:'Pattern', desc:'Weekly schedule pattern', icon: Repeat, color: 'from-orange-500 to-amber-500' },
    { n:5, title:'Time', desc:'Start and end time', icon: Clock, color: 'from-red-500 to-rose-500' },
    { n:6, title:'Review', desc:'Confirm and create', icon: CheckCircle2, color: 'from-indigo-500 to-blue-500' },
  ]

  const applyPattern = (pattern: 'MWF' | 'TTh' | 'Custom') => pattern==='MWF' ? ['Monday','Wednesday','Friday'] : pattern==='TTh' ? ['Tuesday','Thursday'] : form.days

  // UUID validation helper
  const isValidUUID = (uuid: string) => {
    if (!uuid || uuid.trim() === '') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Validation for each step - moved before useEffect hooks that depend on it
  const getStepValidation = (stepNum: number) => {
    if (stepNum===1) return !form.schoolYear || !form.gradingPeriod
    if (stepNum===2) {
      if (form.bulkMode) {
        return form.sectionIds.length === 0 || !form.sectionIds.every(isValidUUID)
      }
      return !form.sectionId || !isValidUUID(form.sectionId)
    }
    if (stepNum===3) return !form.subjectId || !isValidUUID(form.subjectId) || !form.teacherId || !isValidUUID(form.teacherId)
    if (stepNum===4) return form.pattern==='Custom' && form.days.length===0
    if (stepNum===5) return !form.startTime || !form.endTime
    return false
  }

  const invalid = getStepValidation(step)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      if (e.key === 'Enter' && !busy) {
        e.preventDefault()
        if (step < 6 && !invalid) {
          setStep(s => Math.min(6, s + 1))
        } else if (step === 6) {
          submit()
        }
      } else if (e.key === 'Escape' && !busy) {
        e.preventDefault()
        if (step > 1) {
          setStep(s => Math.max(1, s - 1))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, busy, invalid])

  // Auto-check conflicts when reaching step 6
  useEffect(() => {
    if (step === 6 && isValidUUID(form.teacherId) && isValidUUID(form.sectionId) && form.startTime && form.endTime) {
      const checkConflicts = async () => {
        setConflictCheck({ loading: true, conflicts: [] })
        try {
          const days = form.pattern === 'Custom' ? form.days : applyPattern(form.pattern)
          const normalize = (t:string) => t && t.length===5 ? `${t}:00` : t

          const allConflicts: any[] = []
          for (const day of days) {
            const conflictData: any = {
              teacherId: form.teacherId,
              sectionId: form.sectionId,
              dayOfWeek: day,
              startTime: normalize(form.startTime),
              endTime: normalize(form.endTime)
            }
            if (form.roomId && isValidUUID(form.roomId)) {
              conflictData.roomId = form.roomId
            }

            const check = await adminCheckConflicts(conflictData)
            if (check?.hasConflicts) {
              allConflicts.push({ day, conflicts: check.conflicts })
            }
          }

          setConflictCheck({ loading: false, conflicts: allConflicts })
        } catch (error) {
          console.error('Failed to check conflicts:', error)
          setConflictCheck({ loading: false, conflicts: [] })
        }
      }

      checkConflicts()
    }
  }, [step, form.teacherId, form.sectionId, form.roomId, form.startTime, form.endTime, form.pattern, form.days])

  const submit = async () => {
    try {
      setBusy(true)

      // Get sections to create schedules for
      const sectionsToProcess = form.bulkMode ? form.sectionIds : [form.sectionId]

      // Validate sections
      if (sectionsToProcess.length === 0 || !sectionsToProcess.every(isValidUUID)) {
        toast({ title: 'Invalid Section', description: 'Please select valid section(s) from the dropdown.', variant: 'destructive' })
        setBusy(false)
        return
      }

      if (!isValidUUID(form.teacherId)) {
        toast({ title: 'Invalid Teacher', description: 'Please select a valid teacher from the dropdown.', variant: 'destructive' })
        setBusy(false)
        return
      }

      if (!isValidUUID(form.subjectId)) {
        toast({ title: 'Invalid Subject', description: 'Please select a valid subject from the dropdown.', variant: 'destructive' })
        setBusy(false)
        return
      }

      // Validate grading period
      const validPeriods = new Set(['Q1','Q2','Q3','Q4'])
      if (!form.gradingPeriod || !validPeriods.has(form.gradingPeriod)) {
        toast({ title: 'Invalid Grading Period', description: "Please select Q1, Q2, Q3, or Q4.", variant: 'destructive' })
        setBusy(false)
        return
      }

      const days = form.pattern === 'Custom' ? form.days : applyPattern(form.pattern)
      const normalize = (t:string) => t && t.length===5 ? `${t}:00` : t

      let totalCreated = 0

      // Process each section
      for (const sectionId of sectionsToProcess) {
        // Check conflicts for each day in this section
        for (const day of days) {
          const conflictData: any = {
            teacherId: form.teacherId,
            sectionId: sectionId,
            dayOfWeek: day,
            startTime: normalize(form.startTime),
            endTime: normalize(form.endTime)
          }

          // Only add roomId if it's a valid UUID
          if (form.roomId && isValidUUID(form.roomId)) {
            conflictData.roomId = form.roomId
          }

          const check = await adminCheckConflicts(conflictData)

          if (check?.hasConflicts) {
            const sectionName = sections.find((s:any) => s.id === sectionId)?.name || sectionId.slice(0,8)
            toast({ title: 'Schedule Conflicts Detected', description: `Section ${sectionName} on ${day}: ${check.conflicts.map((c:any)=>c.message).join(', ')}`, variant: 'destructive' })
            setBusy(false)
            return
          }
        }

        // Create schedules for all days for this section
        await Promise.all(days.map(day => {
          // Explicitly construct payload without semester to avoid validation errors
          const scheduleData: {
            subjectId: string;
            teacherId: string;
            sectionId: string;
            dayOfWeek: string;
            startTime: string;
            endTime: string;
            schoolYear: string;
            gradingPeriod: 'Q1'|'Q2'|'Q3'|'Q4';
            roomId?: string;
            buildingId?: string;
          } = {
            subjectId: form.subjectId,
            teacherId: form.teacherId,
            sectionId: sectionId,
            dayOfWeek: day,
            startTime: normalize(form.startTime),
            endTime: normalize(form.endTime),
            schoolYear: form.schoolYear,
            gradingPeriod: form.gradingPeriod as 'Q1'|'Q2'|'Q3'|'Q4',
          }

          // Only add roomId if it's a valid UUID
          if (form.roomId && isValidUUID(form.roomId)) {
            scheduleData.roomId = form.roomId
          }

          // Only add buildingId if it's a valid UUID
          if (form.buildingId && isValidUUID(form.buildingId)) {
            scheduleData.buildingId = form.buildingId
          }

          totalCreated++
          return adminCreateSchedule(scheduleData)
        }))
      }

      // Show success dialog with action buttons
      setSuccessDetails({ count: totalCreated, days })
      setShowSuccessDialog(true)

      // Clear saved progress after successful submission
      clearProgress()
    } catch (error: any) {
      toast({ title: 'Error Creating Schedules', description: error?.message || 'An unexpected error occurred. Please try again.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  // Check if a step has errors (for visual indicators)
  const stepHasError = (stepNum: number) => {
    if (stepNum >= step) return false // Don't show errors for future steps
    return getStepValidation(stepNum)
  }

  // Validation summary component
  const ValidationSummary = () => {
    const allValidationIssues = []

    // Step 1 issues
    if (!form.schoolYear) allValidationIssues.push({ step: 1, field: 'School Year', message: 'Required' })
    if (!form.gradingPeriod) allValidationIssues.push({ step: 1, field: 'Grading Period', message: 'Required' })

    // Step 2 issues
    if (form.bulkMode) {
      if (form.sectionIds.length === 0) allValidationIssues.push({ step: 2, field: 'Sections', message: 'At least one section required' })
      else if (!form.sectionIds.every(isValidUUID)) allValidationIssues.push({ step: 2, field: 'Sections', message: 'Invalid selections' })
    } else {
      if (!form.sectionId) allValidationIssues.push({ step: 2, field: 'Section', message: 'Required' })
      else if (!isValidUUID(form.sectionId)) allValidationIssues.push({ step: 2, field: 'Section', message: 'Invalid selection' })
    }

    // Step 3 issues
    if (!form.subjectId) allValidationIssues.push({ step: 3, field: 'Subject', message: 'Required' })
    else if (!isValidUUID(form.subjectId)) allValidationIssues.push({ step: 3, field: 'Subject', message: 'Invalid selection' })
    if (!form.teacherId) allValidationIssues.push({ step: 3, field: 'Teacher', message: 'Required' })
    else if (!isValidUUID(form.teacherId)) allValidationIssues.push({ step: 3, field: 'Teacher', message: 'Invalid selection' })

    // Step 4 issues
    if (form.pattern === 'Custom' && form.days.length === 0) {
      allValidationIssues.push({ step: 4, field: 'Days', message: 'At least one day required' })
    }

    // Step 5 issues
    if (!form.startTime) allValidationIssues.push({ step: 5, field: 'Start Time', message: 'Required' })
    if (!form.endTime) allValidationIssues.push({ step: 5, field: 'End Time', message: 'Required' })

    if (allValidationIssues.length === 0) {
      return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">All Required Fields Complete</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            You're ready to review and create the schedule!
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
          <AlertTriangle className="w-4 h-4" />
          <span>{allValidationIssues.length} Requirement{allValidationIssues.length !== 1 ? 's' : ''} Remaining</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allValidationIssues.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => setStep(issue.step)}
              className="w-full text-left p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Step {issue.step} • {stepsMeta[issue.step - 1]?.title}
                  </div>
                  <div className="text-sm font-semibold text-orange-900 dark:text-orange-100 mt-1">
                    {issue.field}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                    {issue.message}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const Summary = () => (
    <div className="space-y-4 text-sm">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Academic Term</div>
          <div className="text-gray-900 dark:text-white font-semibold">
            {form.schoolYear || '-'} • {form.gradingPeriod || '-'}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Section{form.bulkMode ? 's' : ''}</div>
          <div className="text-gray-900 dark:text-white font-semibold">
            {form.bulkMode ? (
              <div className="space-y-1">
                {form.sectionIds.map((id, idx) => {
                  const sec:any = sections.find((s:any)=> s.id===id)
                  const grade = sec ? getSectionGrade(sec) : ''
                  const name = sec?.name || id.slice(0,8)
                  return (
                    <div key={idx} className="text-sm">
                      {grade ? `Grade ${grade} • ` : ''}{name}
                    </div>
                  )
                })}
                {form.sectionIds.length === 0 && '-'}
              </div>
            ) : (
              (() => {
                const sec:any = sections.find((s:any)=> s.id===form.sectionId)
                const grade = (typeof selectedGrade === 'string' && selectedGrade) ? selectedGrade : (sec ? getSectionGrade(sec) : '')
                const name = sec?.name || '-'
                return grade ? `Grade ${grade} • ${name}` : name
              })()
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
        <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Course Details</div>
          <div className="text-gray-900 dark:text-white font-semibold">
            {subjects.find((s:any)=> s.id===form.subjectId)?.subject_name || '-'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            {teachers.find((t:any)=> t.id===form.teacherId)?.full_name || '-'}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Room Location</div>
          <div className="text-gray-900 dark:text-white font-semibold">
            {rooms.find((r:any)=> r.id===form.roomId)?.room_number || 'TBA'}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
        <Repeat className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Weekly Pattern</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(form.pattern==='Custom' ? form.days : applyPattern(form.pattern)).map((day: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                {day}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
        <Clock className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Time Schedule</div>
          <div className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
            {form.startTime} <ArrowRight className="w-3 h-3" /> {form.endTime}
          </div>
        </div>
      </div>
    </div>
  )

  // Reset wizard to create another schedule
  const resetWizard = () => {
    setShowSuccessDialog(false)
    setForm({
      schoolYear: defaultSchoolYear || '',
      gradingPeriod: (['Q1','Q2','Q3','Q4'] as string[]).includes(defaultSemester) ? (defaultSemester as 'Q1'|'Q2'|'Q3'|'Q4') : '',
      sectionId: '', sectionIds: [] as string[], bulkMode: false,
      subjectId: '', teacherId: '',
      buildingId: '', floorId: '', roomId: '',
      pattern: 'MWF' as 'MWF' | 'TTh' | 'Custom', days: ['Monday','Wednesday','Friday'] as string[],
      startTime: '08:00', endTime: '09:00',
    })
    setStep(1)
    clearProgress()
    toast({
      title: 'Wizard Reset',
      description: 'Ready to create another schedule!',
    })
  }

  return (
    <>
      <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Progress auto-saved</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearProgress}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Progress
          </Button>
        </div>
        <div className="space-y-6">
          {/* Step Indicators */}
          <div className="grid grid-cols-6 gap-3">
            {stepsMeta.map((s, idx) => {
              const Icon = s.icon
              const isActive = step === s.n
              const isCompleted = step > s.n
              const isUpcoming = step < s.n

              return (
                <button
                  key={s.n}
                  onClick={() => setStep(s.n)}
                  disabled={busy}
                  className={cn(
                    "relative group transition-all duration-300 hover:scale-105",
                    isActive && "scale-105"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                      isActive && "border-primary bg-primary/5 shadow-lg",
                      isCompleted && !stepHasError(s.n) && "border-green-500 bg-green-50 dark:bg-green-900/20",
                      isCompleted && stepHasError(s.n) && "border-red-500 bg-red-50 dark:bg-red-900/20",
                      isUpcoming && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50"
                    )}
                  >
                    {/* Error indicator badge */}
                    {stepHasError(s.n) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    {/* Icon with gradient background */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                        isActive && `bg-gradient-to-br ${s.color} shadow-md`,
                        isCompleted && !stepHasError(s.n) && "bg-gradient-to-br from-green-500 to-emerald-500",
                        isCompleted && stepHasError(s.n) && "bg-gradient-to-br from-red-500 to-rose-600",
                        isUpcoming && "bg-slate-100 dark:bg-slate-700"
                      )}
                    >
                      {isCompleted && !stepHasError(s.n) ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : isCompleted && stepHasError(s.n) ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                      )}
                    </div>

                    {/* Step number badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        isActive && "bg-primary text-white border-primary",
                        isCompleted && !stepHasError(s.n) && "bg-green-500 text-white border-green-500",
                        isCompleted && stepHasError(s.n) && "bg-red-500 text-white border-red-500"
                      )}
                    >
                      Step {s.n}
                    </Badge>

                    {/* Title and description */}
                    <div className="text-center">
                      <div className={cn(
                        "text-sm font-semibold",
                        isActive && "text-primary",
                        stepHasError(s.n) && "text-red-600 dark:text-red-400"
                      )}>
                        {s.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.desc}
                      </div>
                    </div>
                  </div>

                  {/* Connecting line */}
                  {idx < stepsMeta.length - 1 && (
                    <div className="absolute top-12 left-full w-3 h-0.5 bg-slate-200 dark:bg-slate-700 hidden lg:block">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          step > s.n && !stepHasError(s.n) ? "bg-green-500" : stepHasError(s.n) ? "bg-red-500" : "bg-transparent"
                        )}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{Math.round(((step - 1) / 5) * 100)}% Complete</span>
              <span>{6 - step} step{6 - step !== 1 ? 's' : ''} remaining</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Academic Term</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set the school year and grading period</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      School Year
                      {defaultSchoolYear && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Auto: {defaultSchoolYear}
                        </Badge>
                      )}
                    </label>
                    <Input
                      aria-label="School Year"
                      value={form.schoolYear}
                      onChange={e=>setForm({...form, schoolYear:e.target.value})}
                      placeholder="e.g., 2024-2025"
                      className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                    />
                    {activeYear && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Active academic year
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-cyan-500" />
                      Grading Period (Quarter)
                      {defaultGradingPeriod && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                          Auto: {defaultGradingPeriod}
                        </Badge>
                      )}
                    </label>
                    <Select value={form.gradingPeriod} onValueChange={(v:any)=>setForm({...form, gradingPeriod: v})}>
                      <SelectTrigger className="h-12 text-base border-2 focus:border-cyan-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="Q1" className="dark:text-white dark:focus:bg-slate-700">
                          Q1 - First Quarter
                        </SelectItem>
                        <SelectItem value="Q2" className="dark:text-white dark:focus:bg-slate-700">
                          Q2 - Second Quarter
                        </SelectItem>
                        <SelectItem value="Q3" className="dark:text-white dark:focus:bg-slate-700">
                          Q3 - Third Quarter
                        </SelectItem>
                        <SelectItem value="Q4" className="dark:text-white dark:focus:bg-slate-700">
                          Q4 - Fourth Quarter
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {currentPeriod?.period_name && (
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Current period: {currentPeriod.period_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Section{form.bulkMode ? 's' : ''}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose the target class section{form.bulkMode ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bulk-mode"
                      checked={form.bulkMode}
                      onCheckedChange={(checked) => setForm({...form, bulkMode: !!checked, sectionId: '', sectionIds: []})}
                    />
                    <label htmlFor="bulk-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Bulk Mode
                    </label>
                  </div>
                </div>

                {form.bulkMode ? (
                  // Bulk mode - multi-select checkboxes
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-pink-500" />
                        Grade (Filter)
                      </label>
                      <Select value={selectedGrade} onValueChange={(v:any)=>setSelectedGrade(v)}>
                        <SelectTrigger className="h-12 text-base border-2 focus:border-pink-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700">
                          <SelectValue placeholder="All grades" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <SelectItem value="" className="dark:text-white dark:focus:bg-slate-700">All Grades</SelectItem>
                          {gradeOptions.map((g:string)=> (
                            <SelectItem key={g} value={g} className="dark:text-white dark:focus:bg-slate-700">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredSections.map((s: any) => (
                          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                            <Checkbox
                              id={`section-${s.id}`}
                              checked={form.sectionIds.includes(s.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setForm({...form, sectionIds: [...form.sectionIds, s.id]})
                                } else {
                                  setForm({...form, sectionIds: form.sectionIds.filter(id => id !== s.id)})
                                }
                              }}
                            />
                            <label htmlFor={`section-${s.id}`} className="flex-1 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                              {s.name || s.id.slice(0,8)} {getSectionGrade(s) && `(Grade ${getSectionGrade(s)})`}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {form.sectionIds.length} section{form.sectionIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                ) : (
                  // Single mode - original UI
                  <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-pink-500" />
                      Grade
                    </label>
                    <Select value={selectedGrade} onValueChange={(v:any)=>{ setSelectedGrade(v); setForm({...form, sectionId: ''}) }}>
                      <SelectTrigger className="h-12 text-base border-2 focus:border-pink-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        {gradeOptions.map((g:string)=> (
                          <SelectItem key={g} value={g} className="dark:text-white dark:focus:bg-slate-700">{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      Section
                    </label>
                    <Select value={form.sectionId} onValueChange={(v:any)=>setForm({...form, sectionId:v})}>
                      <SelectTrigger className={cn(
                        "h-12 text-base border-2 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700",
                        form.sectionId && !isValidUUID(form.sectionId) ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"
                      )}>
                        <SelectValue placeholder={selectedGrade? "Select section":"Choose grade first"} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        {(filteredSections||[]).map((s:any)=> (
                          <SelectItem key={s.id} value={s.id} className="dark:text-white dark:focus:bg-slate-700">
                            {s.name || s.id.slice(0,8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.sectionId && !isValidUUID(form.sectionId) ? (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Please select a section from the dropdown
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} available
                      </p>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subject, teacher, and location</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Select value={form.subjectId} onValueChange={(v:any)=>{ setForm({...form, subjectId:v, teacherId: ''}); setSubjectSearch(''); setTeacherSearch('') }}>
                      <SelectTrigger className={cn(
                        "h-12 text-base border-2 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700",
                        form.subjectId && !isValidUUID(form.subjectId) ? "border-red-500 focus:border-red-500" : "focus:border-green-500"
                      )}>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                          <Input 
                            className="h-8 dark:bg-slate-700 dark:border-slate-600" 
                            placeholder="Search subjects..." 
                            value={subjectSearch} 
                            onChange={(e) => setSubjectSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {subjectsFiltered.length > 0 ? (
                          subjectsFiltered.map((sub:any)=> (
                            <SelectItem key={sub.id} value={sub.id} className="dark:text-white dark:focus:bg-slate-700">
                              {sub.subject_name || sub.subjectName || sub.code || sub.id.slice(0,8)}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            {subjectSearch.trim() ? 'No subjects found' : 'No subjects available'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {form.subjectId && !isValidUUID(form.subjectId) && (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Please select a subject from the dropdown
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      Teacher <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      disabled={!form.subjectId} 
                      value={form.teacherId} 
                      onValueChange={(v:any)=>{
                        // Check if this teacher has the subject specialization
                        const selected = (teachers as any[]).find((t:any)=> t.id===v)
                        const hasSubjectSpecialization = selected ? teacherHasSelectedSubject(selected) : false
                        if (!hasSubjectSpecialization && form.subjectId) {
                          // Show confirmation modal
                          setPendingTeacherId(v)
                          setShowTeacherConfirmModal(true)
                        } else {
                          // Directly set the teacher
                          setForm({...form, teacherId: v})
                          setTeacherSearch('')
                        }
                      }}
                    >
                      <SelectTrigger className={cn(
                        "h-12 text-base border-2 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700",
                        !form.subjectId && "opacity-50",
                        form.teacherId && !isValidUUID(form.teacherId) ? "border-red-500 focus:border-red-500" : "focus:border-emerald-500"
                      )}>
                        <SelectValue placeholder={form.subjectId ? "Select teacher" : "Choose subject first"} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                          <Input 
                            className="h-8 dark:bg-slate-700 dark:border-slate-600" 
                            placeholder="Search teachers..." 
                            value={teacherSearch} 
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            disabled={!form.subjectId}
                          />
                        </div>
                        {teachersFiltered.length > 0 ? (
                          teachersFiltered.map((t:any)=> {
                            const displayName = t.full_name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email || t.id.slice(0,8)
                            const hasSubject = teacherHasSelectedSubject(t)
                            return (
                              <SelectItem 
                                key={t.id} 
                                value={t.id} 
                                className={cn(
                                  "dark:text-white dark:focus:bg-slate-700",
                                  hasSubject && "font-semibold"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {displayName}
                                  {!hasSubject && !isSearchingTeachers && (
                                    <Badge variant="outline" className="text-xs ml-auto opacity-60">
                                      Other Subject
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                            {teacherSearch.trim() 
                              ? 'No teachers found matching your search' 
                              : form.subjectId 
                                ? 'No teachers available' 
                                : 'Choose subject first'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {form.teacherId && !isValidUUID(form.teacherId) ? (
                      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Please select a teacher from the dropdown
                      </p>
                    ) : form.subjectId ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {teachersFiltered.length} teacher{teachersFiltered.length !== 1 ? 's' : ''} available
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Room Location</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Building</label>
                      <Select value={form.buildingId} onValueChange={(v:any)=>{ setForm({...form, buildingId:v, floorId:'', roomId:''}); setFSearch(''); setRSearch(''); }}>
                        <SelectTrigger className="h-11 border-2 focus:border-green-500 bg-white dark:bg-slate-800 dark:border-slate-700">
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                            <Input className="h-8 dark:bg-slate-700 dark:border-slate-600" placeholder="Search building" value={bSearch} onChange={e=>setBSearch(e.target.value)} />
                          </div>
                          {(buildings||[]).map((b:any)=>{ const label = (b.building_name || b.name || b.buildingName || b.code || `Building ${String(b.id).slice(0,8)}`); return (<SelectItem key={b.id} value={b.id} className="dark:text-white dark:focus:bg-slate-700">{label}</SelectItem>) })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Floor</label>
                      <Select disabled={!form.buildingId} value={form.floorId} onValueChange={(v:any)=>setForm({...form, floorId:v, roomId:''})}>
                        <SelectTrigger className={cn("h-11 border-2 focus:border-green-500 bg-white dark:bg-slate-800 dark:border-slate-700", !form.buildingId && "opacity-50")}>
                          <SelectValue placeholder={form.buildingId? 'Select floor':'Select building first'} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                            <Input className="h-8 dark:bg-slate-700 dark:border-slate-600" placeholder="Search floor" value={fSearch} onChange={e=>setFSearch(e.target.value)} />
                          </div>
                          {(floors||[]).map((f:any)=>{ const label = (f.number != null ? `Floor ${f.number}` : (f.name || f.floor_name || String(f.id).slice(0,8))); return (<SelectItem key={f.id} value={f.id} className="dark:text-white dark:focus:bg-slate-700">{label}</SelectItem>) })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room <span className="text-xs text-gray-500">(optional)</span></label>
                      <Select disabled={!form.floorId} value={form.roomId} onValueChange={(v:any)=>setForm({...form, roomId:v})}>
                        <SelectTrigger className={cn("h-11 border-2 focus:border-green-500 bg-white dark:bg-slate-800 dark:border-slate-700", !form.floorId && "opacity-50")}>
                          <SelectValue placeholder={form.floorId? 'Select room':'Select floor first'} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-2 border-b dark:border-slate-700">
                            <Input className="h-8 dark:bg-slate-700 dark:border-slate-600" placeholder="Search room" value={rSearch} onChange={e=>setRSearch(e.target.value)} />
                          </div>
                          {(rooms||[]).map((r:any)=> (
                            <SelectItem key={r.id} value={r.id} className="dark:text-white dark:focus:bg-slate-700">
                              {r.room_number || r.name || r.id.slice(0,8)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Pattern</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose the schedule recurrence pattern</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-orange-500" />
                      Pattern Type
                    </label>
                    <Select value={form.pattern} onValueChange={(v:any)=>setForm({...form, pattern:v, days: applyPattern(v)})}>
                      <SelectTrigger className="h-12 text-base border-2 focus:border-orange-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="MWF" className="dark:text-white dark:focus:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-semibold">MWF Pattern</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Monday, Wednesday, Friday</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TTh" className="dark:text-white dark:focus:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-semibold">TTh Pattern</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Tuesday, Thursday</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Custom" className="dark:text-white dark:focus:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-semibold">Custom Pattern</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Choose your own days</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.pattern === 'Custom' && (
                    <div className="space-y-2 animate-in slide-in-from-right duration-300">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        Custom Days
                      </label>
                      <Input
                        aria-label="Custom Days"
                        value={form.days.join(',')}
                        onChange={e=>setForm({...form, days: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                        placeholder="Monday, Tuesday, Wednesday"
                        className="h-12 text-base border-2 focus:border-amber-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Separate days with commas</p>
                    </div>
                  )}
                </div>

                {/* Pattern preview */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">Selected Days Preview</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.pattern === 'Custom' ? form.days : applyPattern(form.pattern)).map((day: string, idx: number) => (
                      <Badge key={idx} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Time Schedule</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set start and end times or pick a preset</p>
                  </div>
                </div>

                {/* Quick Time Slot Suggestions */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Quick Time Slots</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: '7:00 - 8:00', start: '07:00', end: '08:00' },
                      { label: '8:00 - 9:00', start: '08:00', end: '09:00' },
                      { label: '9:00 - 10:00', start: '09:00', end: '10:00' },
                      { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
                      { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
                      { label: '1:00 - 2:00', start: '13:00', end: '14:00' },
                      { label: '2:00 - 3:00', start: '14:00', end: '15:00' },
                      { label: '3:00 - 4:00', start: '15:00', end: '16:00' },
                    ].map((slot, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, startTime: slot.start, endTime: slot.end })}
                        className={cn(
                          "text-xs transition-all duration-200",
                          form.startTime === slot.start && form.endTime === slot.end
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 hover:from-blue-600 hover:to-indigo-600"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        )}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      Start Time
                    </label>
                    <Input
                      type="time"
                      step="60"
                      aria-label="Start Time"
                      value={form.startTime}
                      onChange={e=>setForm({...form, startTime:e.target.value})}
                      className="h-12 text-base border-2 focus:border-red-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-500" />
                      End Time
                    </label>
                    <Input
                      type="time"
                      step="60"
                      aria-label="End Time"
                      value={form.endTime}
                      onChange={e=>setForm({...form, endTime:e.target.value})}
                      className="h-12 text-base border-2 focus:border-rose-500 transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Time preview with duration calculation */}
                {form.startTime && form.endTime && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-semibold text-red-900 dark:text-red-100">Schedule Duration</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
                        {(() => {
                          const [startHour, startMin] = form.startTime.split(':').map(Number)
                          const [endHour, endMin] = form.endTime.split(':').map(Number)
                          const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                          const hours = Math.floor(durationMin / 60)
                          const minutes = durationMin % 60
                          return `${hours}h ${minutes}m`
                        })()}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-red-700 dark:text-red-300">
                      <span className="font-medium">{form.startTime}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">{form.endTime}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-left duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review & Confirm</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review your schedule before creating</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800">
                  <Summary />
                </div>

                {/* Conflict Check Results */}
                {conflictCheck.loading ? (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                      <span className="text-sm text-blue-900 dark:text-blue-100 font-semibold">Checking for conflicts...</span>
                    </div>
                  </div>
                ) : conflictCheck.conflicts.length > 0 ? (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Schedule Conflicts Detected</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                          The following conflicts were found. You can still create the schedule, but conflicts should be resolved.
                        </p>
                        <div className="space-y-2">
                          {conflictCheck.conflicts.map((dayConflict, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                              <div className="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">{dayConflict.day}</div>
                              {dayConflict.conflicts.map((conflict: any, cIdx: number) => (
                                <div key={cIdx} className="text-xs text-red-700 dark:text-red-300">
                                  • {conflict.message}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">No Conflicts Found</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          This schedule doesn't conflict with any existing schedules. You're ready to create it!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-700 mt-8 -mx-8 -mb-8 px-8 py-6 flex items-center justify-between shadow-lg">
              <Button
                variant="outline"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1 || busy}
                size="lg"
                className="h-12 px-6 border-2 hover:scale-105 transition-all duration-200 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                {step < 6 ? (
                  <Button
                    onClick={() => setStep(s => Math.min(6, s + 1))}
                    disabled={invalid}
                    size="lg"
                    className={cn(
                      "h-12 px-8 hover:scale-105 transition-all duration-200 shadow-md",
                      invalid
                        ? "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 cursor-not-allowed opacity-60"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    )}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    disabled={busy}
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Schedules...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Draft Schedules
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            {/* Validation Summary Panel */}
            <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ValidationSummary />
              </CardContent>
            </Card>

            {/* Live Preview Panel */}
            <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Summary />
                <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Conflicts will be automatically checked before schedule creation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Teacher Subject Mismatch Confirmation Dialog */}
    <Dialog open={showTeacherConfirmModal} onOpenChange={setShowTeacherConfirmModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Confirm Teacher Selection</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {(() => {
            const selectedTeacher = teachers.find((t: any) => t.id === pendingTeacherId)
            const selectedSubject = subjects.find((s: any) => s.id === form.subjectId)
            const teacherName = selectedTeacher?.full_name || 
                              `${selectedTeacher?.first_name || ''} ${selectedTeacher?.last_name || ''}`.trim() || 
                              selectedTeacher?.email || 
                              'This teacher'
            const subjectName = selectedSubject?.subject_name || selectedSubject?.subjectName || 'this subject'
            
            return (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-900 dark:text-orange-100 font-semibold mb-2">
                    Teacher Subject Mismatch
                  </p>
                  <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                    <p>
                      <strong>{teacherName}</strong> does not have <strong>{subjectName}</strong> as their assigned subject specialization.
                    </p>
                    <p>
                      You can still assign this teacher to teach this subject, but please ensure they are qualified and willing to teach it.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                    Are you sure you want to assign this teacher to this subject?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTeacherConfirmModal(false)
                      setPendingTeacherId(null)
                    }}
                    className="w-full border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (pendingTeacherId) {
                        setForm({...form, teacherId: pendingTeacherId})
                        setTeacherSearch('')
                      }
                      setShowTeacherConfirmModal(false)
                      setPendingTeacherId(null)
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Yes, Continue
                  </Button>
                </div>
              </>
            )
          })()}
        </div>
      </DialogContent>
    </Dialog>

    {/* Success Dialog */}
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Success!</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-2">
              Created {successDetails.count} draft schedule{successDetails.count !== 1 ? 's' : ''} successfully!
            </p>
            <div className="flex flex-wrap gap-1">
              {successDetails.days.map((day, idx) => (
                <Badge key={idx} className="bg-green-600 text-white">
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">What would you like to do next?</p>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={resetWizard}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Another Schedule
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Link href="/superadmin/schedule">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Schedules
                </Link>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowSuccessDialog(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}


