"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { adminListScheduleTemplates, adminListSchedules, adminSetSchedulePublish, adminCreateSchedule, adminUpdateSchedule, adminCheckConflicts, adminDeleteSchedule, adminListSections, adminListSubjects, adminListTeachers, adminListRooms, adminListBuildings, adminListFloors, adminGetScheduleAudit } from "@/lib/api/endpoints/schedules"
import { academicYearsApi } from "@/lib/api/endpoints/academic-years"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
  Calendar,
  LayoutGrid,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Plus,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Eye,
  Loader2,
  ArrowRight,
  Filter,
  Search,
  Download,
  BookOpen,
  UserCheck,
  Check,
  ChevronsUpDown
} from "lucide-react"

export default function SuperadminSchedulePage() {
  const [tab, setTab] = useState("planner")
  const qc = useQueryClient()

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: adminListScheduleTemplates,
  })

  // Active term (Academic Year + current period)
  const { data: activeYear } = useQuery({ queryKey: ['active-year'], queryFn: () => academicYearsApi.getActive() })
  const { data: currentPeriod } = useQuery({ queryKey: ['current-period'], queryFn: () => academicYearsApi.getCurrentPeriod() })
  const defaultSchoolYear = activeYear?.year_name || ''
  const defaultSemester = (() => {
    const n = (currentPeriod?.period_name || '').toLowerCase()
    if (n.includes('first') || n.includes('1st')) return '1st'
    if (n.includes('second') || n.includes('2nd')) return '2nd'
    if (n.includes('summer')) return 'Summer'
    return currentPeriod?.period_name || ''
  })()

  // Count data for badges
  const { data: draftsCountData } = useQuery({
    queryKey: ["drafts-count"],
    queryFn: () => adminListSchedules({ status: 'draft', limit: 1 }),
  })
  const draftsCount = draftsCountData?.pagination?.total || 0

  const tabsConfig = [
    {
      id: 'planner',
      label: 'Planner',
      icon: Calendar,
      description: 'Weekly schedule view',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'from-blue-50 to-cyan-50',
      bgDark: 'from-blue-900/20 to-cyan-900/20',
      badge: null
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: LayoutGrid,
      description: 'Apply schedule templates',
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'from-purple-50 to-pink-50',
      bgDark: 'from-purple-900/20 to-pink-900/20',
      badge: templates?.length || 0
    },
    {
      id: 'publish',
      label: 'Publish',
      icon: CheckCircle2,
      description: 'Bulk publish drafts',
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'from-green-50 to-emerald-50',
      bgDark: 'from-green-900/20 to-emerald-900/20',
      badge: draftsCount
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      description: 'Analytics & insights',
      gradient: 'from-orange-500 to-amber-500',
      bgLight: 'from-orange-50 to-amber-50',
      bgDark: 'from-orange-900/20 to-amber-900/20',
      badge: null
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                Schedule & Calendar Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage schedules, templates, publishing, and analytics
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Link href="/superadmin/schedule/wizard">
              <Sparkles className="h-5 w-5 mr-2" />
              Create via Wizard
            </Link>
          </Button>
        </div>

        {/* Academic Year Warning */}
        {!defaultSchoolYear && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">No Active Academic Year</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Go to Academic Year settings to set an active year. Fields below will default to "-" until configured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Tab Pills */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            {tabsConfig.map((tabConfig) => {
              const Icon = tabConfig.icon
              const isActive = tab === tabConfig.id

              return (
                <button
                  key={tabConfig.id}
                  onClick={() => setTab(tabConfig.id)}
                  className={cn(
                    "group relative p-6 rounded-2xl border-2 transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl",
                    isActive
                      ? `bg-gradient-to-br ${tabConfig.gradient} border-transparent shadow-2xl scale-105`
                      : `bg-gradient-to-br ${tabConfig.bgLight} dark:${tabConfig.bgDark} border-slate-200 dark:border-slate-700 hover:border-primary/50`
                  )}
                >
                  {/* Icon with gradient background */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                    isActive
                      ? "bg-white/20 shadow-lg"
                      : `bg-gradient-to-br ${tabConfig.gradient} opacity-80 group-hover:opacity-100`
                  )}>
                    <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-white")} />
                  </div>

                  {/* Tab info */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        isActive ? "text-white" : "text-gray-900 dark:text-white group-hover:text-primary"
                      )}>
                        {tabConfig.label}
                      </h3>
                      {tabConfig.badge !== null && tabConfig.badge > 0 && (
                        <Badge
                          className={cn(
                            "text-xs",
                            isActive
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          {tabConfig.badge}
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm transition-colors",
                      isActive ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                    )}>
                      {tabConfig.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full shadow-md animate-in slide-in-from-bottom duration-300" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <Tabs value={tab} onValueChange={setTab}>

          <TabsContent value="planner">
            <PlannerTab defaultSchoolYear={defaultSchoolYear} defaultSemester={defaultSemester} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesApply templates={templates} loading={templatesLoading} />
          </TabsContent>

          <TabsContent value="publish">
            <PublishQueue />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab defaultSchoolYear={defaultSchoolYear} defaultSemester={defaultSemester} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
function ReportsTab({ defaultSchoolYear, defaultSemester }: { defaultSchoolYear: string; defaultSemester: string }) {
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear || '')
  const [semester, setSemester] = useState(defaultSemester || '')
  useEffect(()=>{ if (!schoolYear && defaultSchoolYear) setSchoolYear(defaultSchoolYear) }, [defaultSchoolYear])
  useEffect(()=>{ if (!semester && defaultSemester) setSemester(defaultSemester) }, [defaultSemester])
  const [status, setStatus] = useState<'published'|'draft'|'all'>('all')
  const [teacherId, setTeacherId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useQuery({
    queryKey: ['reports-schedules', schoolYear, semester, status, teacherId, sectionId, roomId, dayOfWeek, search, page],
    queryFn: () => {
      const base:any = { page, limit: pageSize }
      if (schoolYear) base.schoolYear = schoolYear
      if (semester) base.semester = semester
      if (status !== 'all') base.status = status
      if (teacherId) base.teacherId = teacherId
      if (sectionId) base.sectionId = sectionId
      if (dayOfWeek) base.dayOfWeek = dayOfWeek
      if (search) base.search = search
      return adminListSchedules(base)
    }
  })
  const items:any[] = data?.data || []

  // Debug: Log first item to see structure
  if (items.length > 0) {
    console.log('[ReportsTab] First schedule item:', items[0])
    console.log('[ReportsTab] Teacher data:', items[0]?.teacher)
    console.log('[ReportsTab] Section data:', items[0]?.section)
    console.log('[ReportsTab] Room data:', items[0]?.room)
  }
  const total = data?.pagination?.total || 0
  const pages = data?.pagination?.pages || 1

  // Options for teacher/section pickers
  const { data: sectionsData } = useQuery({ queryKey: ['reports-sections'], queryFn: () => adminListSections({ limit: 1000 }) })
  const { data: teachersData } = useQuery({ queryKey: ['reports-teachers'], queryFn: () => adminListTeachers({ limit: 1000 }) })
  const sectionOpts:any[] = sectionsData?.data || []
  const teacherOpts:any[] = teachersData?.data || []

  const parseMin = (t:string) => (parseInt((t||'00:00:00').slice(0,2))*60) + parseInt((t||'00:00:00').slice(3,5))
  const overlaps = (a:any,b:any) => (a.day_of_week||a.dayOfWeek)===(b.day_of_week||b.dayOfWeek) && parseMin(a.start_time||a.startTime)<parseMin(b.end_time||b.endTime) && parseMin(b.start_time||b.startTime)<parseMin(a.end_time||a.endTime)

  // Clash report (teacher+room)
  const clashes: { type:string; a:any; b:any }[] = []
  for (let i=0;i<items.length;i++) {
    for (let j=i+1;j<items.length;j++) {
      const A = items[i], B = items[j]
      if ((A.teacher_id||A.teacherId) && (B.teacher_id||B.teacherId) && (A.teacher_id||A.teacherId)===(B.teacher_id||B.teacherId) && overlaps(A,B)) {
        clashes.push({ type:'Teacher', a:A, b:B })
      }
      if ((A.room_id||A.roomId) && (B.room_id||B.roomId) && (A.room_id||A.roomId)===(B.room_id||B.roomId) && overlaps(A,B)) {
        clashes.push({ type:'Room', a:A, b:B })
      }
    }
  }

  // Room utilization (minutes over 6-16)
  const dayStart = 6*60, dayEnd = 16*60
  const roomMinutes = new Map<string, number>()
  for (const s of items) {
    const rid = (s.room_id||s.roomId)
    if (!rid) continue
    const start = Math.max(dayStart, parseMin(s.start_time||s.startTime))
    const end = Math.min(dayEnd, parseMin(s.end_time||s.endTime))
    if (end>start) roomMinutes.set(rid, (roomMinutes.get(rid)||0) + (end-start))
  }
  const totalWindowPerRoom = (dayEnd-dayStart)*5 // 5 weekdays
  const utilization = Array.from(roomMinutes.entries()).map(([rid, mins])=> ({
    roomId: rid,
    percent: Math.round((mins/totalWindowPerRoom)*100),
    minutes: mins,
  })).sort((a,b)=> b.percent-a.percent).slice(0,10)

  // Teacher load (weekly minutes & count)
  const teacherLoad = new Map<string, { minutes:number; count:number }>()
  for (const s of items) {
    const tid = (s.teacher_id||s.teacherId)
    if (!tid) continue
    const start = parseMin(s.start_time||s.startTime)
    const end = parseMin(s.end_time||s.endTime)
    const curr = teacherLoad.get(tid) || { minutes:0, count:0 }
    curr.minutes += Math.max(0, end-start)
    curr.count += 1
    teacherLoad.set(tid, curr)
  }
  const teacherRows = Array.from(teacherLoad.entries()).map(([tid, v])=> ({ teacherId: tid, minutes: v.minutes, count: v.count })).sort((a,b)=> b.minutes-a.minutes).slice(0,10)

  const StatusChip = ({ value }: { value?: string }) => {
    const v = (value||'').toLowerCase()
    const cls = v==='published'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : v==='draft'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : v==='archived'
      ? 'bg-slate-100 text-slate-700 border-slate-300'
      : 'bg-slate-50 text-slate-600 border-slate-200'
    const label = value ? value.charAt(0).toUpperCase()+value.slice(1) : '-'
    return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${cls}`}>{label}</span>
  }

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
        <div className="space-y-4">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Reports & Analytics</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Schedule insights, conflicts, and utilization</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-orange-50 dark:from-slate-800/50 dark:to-orange-900/20 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                {(schoolYear || semester || status !== 'all' || teacherId || sectionId || dayOfWeek || search) && (
                  <Badge variant="secondary" className="text-xs">
                    {[schoolYear, semester, status !== 'all' ? status : null, teacherId, sectionId, dayOfWeek, search].filter(Boolean).length} active
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSchoolYear('');
                  setSemester('');
                  setStatus('all');
                  setTeacherId('');
                  setSectionId('');
                  setDayOfWeek('');
                  setSearch('');
                  setPage(1);
                }}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <Select value={status} onValueChange={(v:any)=>setStatus(v)}>
                <SelectTrigger className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="published" className="dark:text-white dark:focus:bg-slate-700">Published</SelectItem>
                  <SelectItem value="draft" className="dark:text-white dark:focus:bg-slate-700">Draft</SelectItem>
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All</SelectItem>
                </SelectContent>
              </Select>

              <Input
                className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700"
                placeholder={defaultSchoolYear? "School Year":"-"}
                value={schoolYear}
                onChange={e=>setSchoolYear(e.target.value)}
              />

              <Input
                className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700"
                placeholder={defaultSemester? "Semester":"-"}
                value={semester}
                onChange={e=>setSemester(e.target.value)}
              />

              <Select value={teacherId || 'all'} onValueChange={(v:any)=>{ setTeacherId(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Teacher" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All Teachers</SelectItem>
                  {teacherOpts.map((t:any)=> (
                    <SelectItem key={t.id} value={t.id} className="dark:text-white dark:focus:bg-slate-700">
                      {t.full_name || t.email || t.id.slice(0,8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sectionId || 'all'} onValueChange={(v:any)=>{ setSectionId(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All Sections</SelectItem>
                  {sectionOpts.map((s:any)=> (
                    <SelectItem key={s.id} value={s.id} className="dark:text-white dark:focus:bg-slate-700">
                      {s.name || s.id.slice(0,8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dayOfWeek} onValueChange={(v:any)=>setDayOfWeek(v)}>
                <SelectTrigger className="h-10 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Day of Week" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=> (
                    <SelectItem key={d} value={d} className="dark:text-white dark:focus:bg-slate-700">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                className="h-10 sm:col-span-2 border-2 focus:border-orange-500 dark:bg-slate-800 dark:border-slate-700"
                placeholder="Search subject/teacher/section"
                value={search}
                onChange={e=>{ setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading reports and analytics...</p>
          </div>
        ) : (
          <>
            {/* Schedules Table - Desktop */}
            <div className="hidden lg:block rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="grid px-4 py-3 text-xs font-semibold bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b-2 border-slate-200 dark:border-slate-700" style={{gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1.2fr 1.2fr 1.5fr 1fr'}}>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Subject
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Section
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Teacher
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Day
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Start
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  End
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Building
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  Room
                </div>
              </div>
              {items.length===0 ? (
                <div className="p-6 text-center text-slate-600 dark:text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                  <p className="font-medium text-lg mb-2">No schedules found</p>
                  <p className="text-sm mb-4">
                    {(schoolYear || semester || status !== 'all' || teacherId || sectionId)
                      ? "Try adjusting your filters or click 'Clear All' above"
                      : "No schedules have been created yet. Use the wizard to create schedules."}
                  </p>
                  {(schoolYear || semester) && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Filtering by: {[schoolYear, semester].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              ) : items.map((s:any)=> {
                // Get teacher name from the teacher object or find it in teacherOpts
                const teacherId = s.teacher_id || s.teacherId
                const teacherFromApi = s.teacher?.user?.full_name || s.teacher?.full_name
                const teacherFromOpts = teacherOpts.find((t:any) => t.id === teacherId)
                const teacherName = teacherFromApi
                  || teacherFromOpts?.full_name
                  || teacherFromOpts?.email
                  || (teacherId ? `Teacher ${teacherId.slice(0,8)}` : 'Not Set')

                // Get section name
                const sectionId = s.section_id || s.sectionId
                const sectionFromApi = s.section?.name
                const sectionFromOpts = sectionOpts.find((sec:any) => sec.id === sectionId)
                const sectionName = sectionFromApi
                  || sectionFromOpts?.name
                  || (sectionId ? `Section ${sectionId.slice(0,8)}` : 'Not Set')

                // Get building name
                const buildingName = s.room?.floor?.building?.building_name
                  || s.room?.floor?.building?.name
                  || s.building?.building_name
                  || s.building?.name
                  || (s.room_id || s.roomId ? '—' : 'Not Set')

                // Get room display - the room object uses camelCase (roomNumber)
                const roomDisplay = s.room?.roomNumber || s.room?.room_number || 'Not Set'

                // Convert 24h time to 12h AM/PM format
                const formatTime12h = (time24: string) => {
                  if (!time24) return ''
                  const [hours, minutes] = time24.split(':')
                  const h = parseInt(hours)
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  const h12 = h % 12 || 12
                  return `${h12}:${minutes} ${ampm}`
                }

                const startTime12h = formatTime12h(s.start_time || s.startTime)
                const endTime12h = formatTime12h(s.end_time || s.endTime)

                return (
                  <div key={s.id} className="grid px-4 py-3 text-base border-b last:border-b-0 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors" style={{gridTemplateColumns: '2fr 1.5fr 2fr 1fr 1.2fr 1.2fr 1.5fr 1fr'}}>
                    <div className="truncate font-medium" title={s.subject?.subject_name || s.subject?.subjectName || 'Class'}>{s.subject?.subject_name || s.subject?.subjectName || 'Class'}</div>
                    <div className="truncate" title={sectionName}>{sectionName}</div>
                    <div className="truncate" title={teacherName}>{teacherName}</div>
                    <div>{s.day_of_week || s.dayOfWeek}</div>
                    <div className="font-mono text-sm">{startTime12h}</div>
                    <div className="font-mono text-sm">{endTime12h}</div>
                    <div className="truncate text-gray-500 dark:text-gray-400 italic" title={buildingName}>{buildingName}</div>
                    <div className="truncate text-gray-500 dark:text-gray-400 italic" title={roomDisplay}>{roomDisplay}</div>
                  </div>
                )
              })}
            </div>

            {/* Schedules Cards - Mobile/Tablet */}
            <div className="lg:hidden space-y-3">
              {items.length===0 ? (
                <div className="p-6 text-center text-slate-600 dark:text-slate-400 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                  <p className="font-medium text-lg mb-2">No schedules found</p>
                  <p className="text-sm mb-4">
                    {(schoolYear || semester || status !== 'all' || teacherId || sectionId)
                      ? "Try adjusting your filters or click 'Clear All' above"
                      : "No schedules have been created yet. Use the wizard to create schedules."}
                  </p>
                  {(schoolYear || semester) && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Filtering by: {[schoolYear, semester].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              ) : items.map((s:any)=> {
                // Get teacher name from the teacher object or find it in teacherOpts
                const teacherId = s.teacher_id || s.teacherId
                const teacherFromApi = s.teacher?.user?.full_name || s.teacher?.full_name
                const teacherFromOpts = teacherOpts.find((t:any) => t.id === teacherId)
                const teacherName = teacherFromApi
                  || teacherFromOpts?.full_name
                  || teacherFromOpts?.email
                  || (teacherId ? `Teacher ${teacherId.slice(0,8)}` : 'Not Set')

                // Get section name
                const sectionId = s.section_id || s.sectionId
                const sectionFromApi = s.section?.name
                const sectionFromOpts = sectionOpts.find((sec:any) => sec.id === sectionId)
                const sectionName = sectionFromApi
                  || sectionFromOpts?.name
                  || (sectionId ? `Section ${sectionId.slice(0,8)}` : 'Not Set')

                // Get building name
                const buildingName = s.room?.floor?.building?.building_name
                  || s.room?.floor?.building?.name
                  || s.building?.building_name
                  || s.building?.name
                  || (s.room_id || s.roomId ? '—' : 'Not Set')

                // Get room display - the room object uses camelCase (roomNumber)
                const roomDisplay = s.room?.roomNumber || s.room?.room_number || 'Not Set'

                // Convert 24h time to 12h AM/PM format
                const formatTime12h = (time24: string) => {
                  if (!time24) return ''
                  const [hours, minutes] = time24.split(':')
                  const h = parseInt(hours)
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  const h12 = h % 12 || 12
                  return `${h12}:${minutes} ${ampm}`
                }

                const startTime12h = formatTime12h(s.start_time || s.startTime)
                const endTime12h = formatTime12h(s.end_time || s.endTime)

                return (
                  <div key={s.id} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-400 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{s.subject?.subject_name || s.subject?.subjectName || 'Class'}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          {sectionName}
                        </div>
                      </div>
                      <StatusChip value={s.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Teacher</div>
                          <div className="font-medium truncate" title={teacherName}>{teacherName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Building</div>
                          <div className="font-medium truncate italic text-gray-500 dark:text-gray-400" title={buildingName}>{buildingName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Room</div>
                          <div className="font-medium truncate italic text-gray-500 dark:text-gray-400" title={roomDisplay}>{roomDisplay}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Day</div>
                          <div className="font-medium">{s.day_of_week || s.dayOfWeek}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                          <div className="font-medium font-mono text-xs">
                            {startTime12h} - {endTime12h}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">Total: {total}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Previous</Button>
                <div className="px-2">{page} / {pages || 1}</div>
                <Button variant="outline" size="sm" disabled={page>=(pages||1)} onClick={()=>setPage(p=>p+1)}>Next</Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={cn("text-xs", clashes.length > 0 ? "bg-red-500 text-white" : "bg-green-500 text-white")}>
                    {clashes.length > 0 ? 'Issues' : 'Clear'}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{clashes.length}</div>
                <div className="text-sm text-red-600 dark:text-red-400 mt-1">Clashes Found</div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{roomMinutes.size}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Rooms Tracked</div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{teacherLoad.size}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">Teachers Active</div>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="px-3 py-2 text-sm font-semibold bg-slate-50 border-b">Clash report (top 20)</div>
              {clashes.slice(0,20).length===0 ? (
                <div className="p-3 text-sm text-slate-600">No clashes detected.</div>
              ) : clashes.slice(0,20).map((c, idx)=>{
                const fmt = (s:any)=> `${s.subject?.subject_name || s.subject?.subjectName || 'Class'} • ${(s.day_of_week||s.dayOfWeek)} ${(s.start_time||s.startTime)?.slice(0,5)}–${(s.end_time||s.endTime)?.slice(0,5)}`
                return (
                  <div key={idx} className="px-3 py-2 border-b text-sm">
                    <span className="font-medium text-rose-700">{c.type} clash</span>: {fmt(c.a)} vs {fmt(c.b)}
                  </div>
                )
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border overflow-hidden dark:border-slate-700">
                <div className="px-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">Room utilization (top 10)</div>
                {utilization.length===0 ? <div className="p-3 text-sm text-slate-600">No room data.</div> : utilization.map((r)=> (
                  <div key={r.roomId} className="px-3 py-2 border-b text-sm flex items-center justify-between">
                    <div className="truncate" title={r.roomId}>Room {(r.roomId||'').slice(0,8)}</div>
                    <div className="text-slate-700">{r.percent}%</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border overflow-hidden dark:border-slate-700">
                <div className="px-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">Teacher load (top 10 by minutes)</div>
                {teacherRows.length===0 ? <div className="p-3 text-sm text-slate-600">No teacher data.</div> : teacherRows.map((t)=> {
                  const teacher = teacherOpts.find((opt:any)=> opt.id === t.teacherId)
                  const teacherName = teacher?.full_name || teacher?.email || `Teacher ${(t.teacherId||'').slice(0,8)}`
                  return (
                    <div key={t.teacherId} className="px-3 py-2 border-b text-sm flex items-center justify-between">
                      <div className="truncate" title={teacherName}>{teacherName}</div>
                      <div className="text-slate-700">{Math.round(t.minutes/60)} hrs • {t.count} classes</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function PlannerTab({ defaultSchoolYear, defaultSemester }: { defaultSchoolYear: string; defaultSemester: string }) {
  const [status, setStatus] = useState<'draft' | 'published' | 'archived' | 'all'>('all')
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear || '')
  const [semester, setSemester] = useState(defaultSemester || '')
  useEffect(()=>{ if (!schoolYear && defaultSchoolYear) setSchoolYear(defaultSchoolYear) }, [defaultSchoolYear])
  useEffect(()=>{ if (!semester && defaultSemester) setSemester(defaultSemester) }, [defaultSemester])
  const [teacherId, setTeacherId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [subjectText, setSubjectText] = useState('')
  const [highContrast, setHighContrast] = useState(false)
  const [compactPrint, setCompactPrint] = useState(false)
  const [startHour, setStartHour] = useState(6)
  const [endHour, setEndHour] = useState(16)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [sectionOpen, setSectionOpen] = useState(false)
  const scrollRef = useState<HTMLDivElement | null>(null)[0] as any
  const { toast } = useToast()

  // Fetch reference data for dropdowns (with high limits to get all options)
  const { data: teachersData } = useQuery({ queryKey: ['planner-teachers'], queryFn: () => adminListTeachers({ limit: 1000 }) })
  const { data: sectionsData } = useQuery({ queryKey: ['planner-sections'], queryFn: () => adminListSections({ limit: 1000 }) })
  const teacherOpts = teachersData?.data || []
  const sectionOpts = sectionsData?.data || []

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-planner", status, schoolYear, semester, teacherId, sectionId],
    queryFn: () => {
      const base = status === 'all' ? {} : { status }
      return adminListSchedules({ ...base, schoolYear: schoolYear || undefined, semester: semester || undefined, teacherId: teacherId || undefined, sectionId: sectionId || undefined, limit: 200 })
    },
  })
  let items = data?.data || []
  if (subjectText) {
    const q = subjectText.toLowerCase()
    items = items.filter((s:any)=> (s.subject?.subject_name || s.subject?.subjectName || '').toLowerCase().includes(q))
  }

  const [tplOpen, setTplOpen] = useState(false)
  const [tplForm, setTplForm] = useState({ name: '', description: '', grade_level: '' })
  const createTemplateFromFiltered = async () => {
    const payloadEntries = (items || []).map((s:any)=> ({
      subjectId: s.subject_id || s.subjectId,
      teacherId: s.teacher_id || s.teacherId,
      sectionId: s.section_id || s.sectionId,
      roomId: s.room_id || s.roomId || undefined,
      buildingId: s.building_id || s.buildingId || undefined,
      dayOfWeek: s.day_of_week || s.dayOfWeek,
      startTime: s.start_time || s.startTime,
      endTime: s.end_time || s.endTime,
    }))
    await adminCreateScheduleTemplate({ name: tplForm.name || 'Template', description: tplForm.description || undefined, grade_level: tplForm.grade_level || undefined, payload: payloadEntries })
    setTplOpen(false)
  }

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Weekly Planner</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Drag and resize schedules on the calendar</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters & Options</h3>
              {(schoolYear || semester || status !== 'all' || teacherId || sectionId || subjectText) && (
                <Badge variant="secondary" className="text-xs">
                  {[schoolYear, semester, status !== 'all' ? status : null, teacherId, sectionId, subjectText].filter(Boolean).length} active
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSchoolYear('');
                setSemester('');
                setStatus('all');
                setTeacherId('');
                setSectionId('');
                setSubjectText('');
              }}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
          <Select value={status} onValueChange={(v:any)=>setStatus(v)}>
            <SelectTrigger className="h-10 border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="published" className="dark:text-white dark:focus:bg-slate-700">Published</SelectItem>
              <SelectItem value="draft" className="dark:text-white dark:focus:bg-slate-700">Draft</SelectItem>
              <SelectItem value="archived" className="dark:text-white dark:focus:bg-slate-700">Archived</SelectItem>
              <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">All</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder={defaultSchoolYear? "School Year":"-"} className="h-10 border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700" value={schoolYear} onChange={e=>setSchoolYear(e.target.value)} />
          <Input placeholder={defaultSemester? "Semester":"-"} className="h-10 border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700" value={semester} onChange={e=>setSemester(e.target.value)} />

          {/* Teacher Searchable Combobox */}
          <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={teacherOpen}
                className={cn(
                  "h-10 w-full justify-between border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700",
                  !teacherId && "text-muted-foreground"
                )}
              >
                {teacherId
                  ? teacherOpts.find((t: any) => t.id === teacherId)?.full_name ||
                    teacherOpts.find((t: any) => t.id === teacherId)?.email ||
                    "Selected Teacher"
                  : "Select Teacher..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 dark:bg-slate-800 dark:border-slate-700" align="start">
              <Command className="dark:bg-slate-800">
                <CommandInput placeholder="Search teachers..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No teacher found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setTeacherId('')
                        setTeacherOpen(false)
                      }}
                      className="dark:text-white dark:aria-selected:bg-slate-700"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          teacherId === '' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Teachers
                    </CommandItem>
                    {teacherOpts.map((t: any) => (
                      <CommandItem
                        key={t.id}
                        value={`${t.full_name || ''} ${t.email || ''} ${t.id}`}
                        onSelect={() => {
                          setTeacherId(t.id)
                          setTeacherOpen(false)
                        }}
                        className="dark:text-white dark:aria-selected:bg-slate-700"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            teacherId === t.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t.full_name || t.email || t.id.slice(0, 8)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Section Searchable Combobox */}
          <Popover open={sectionOpen} onOpenChange={setSectionOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sectionOpen}
                className={cn(
                  "h-10 w-full justify-between border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700",
                  !sectionId && "text-muted-foreground"
                )}
              >
                {sectionId
                  ? sectionOpts.find((s: any) => s.id === sectionId)?.name || "Selected Section"
                  : "Select Section..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 dark:bg-slate-800 dark:border-slate-700" align="start">
              <Command className="dark:bg-slate-800">
                <CommandInput placeholder="Search sections..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No section found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSectionId('')
                        setSectionOpen(false)
                      }}
                      className="dark:text-white dark:aria-selected:bg-slate-700"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          sectionId === '' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Sections
                    </CommandItem>
                    {sectionOpts.map((s: any) => (
                      <CommandItem
                        key={s.id}
                        value={`${s.name || ''} ${s.id}`}
                        onSelect={() => {
                          setSectionId(s.id)
                          setSectionOpen(false)
                        }}
                        className="dark:text-white dark:aria-selected:bg-slate-700"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            sectionId === s.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {s.name || s.id.slice(0, 8)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Input placeholder="Subject contains…" className="h-10 border-2 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700" value={subjectText} onChange={e=>setSubjectText(e.target.value)} />
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          {/* Time Range Config */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Start:</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={startHour}
              onChange={(e)=>setStartHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-16 h-8 text-center"
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">End:</span>
            <Input
              type="number"
              min={0}
              max={23}
              value={endHour}
              onChange={(e)=>setEndHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-16 h-8 text-center"
            />
          </div>

          <Button
            variant={highContrast? 'default':'outline'}
            size="sm"
            className={cn("h-10 transition-all duration-200", highContrast && "bg-gradient-to-r from-blue-500 to-cyan-500")}
            onClick={()=>setHighContrast(v=>!v)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {highContrast? 'High Contrast: On':'High Contrast'}
          </Button>
          <Button variant="outline" size="sm" className="h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={()=>{ setCompactPrint(v=>!v); setTimeout(()=>window.print(), 50) }}>
            <Download className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Dialog open={tplOpen} onOpenChange={setTplOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4 text-white" />
                  </div>
                  Create Template
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3">
                <Input placeholder="Template name" value={tplForm.name} onChange={e=>setTplForm({...tplForm, name:e.target.value})} className="dark:bg-slate-800" />
                <Input placeholder="Description (optional)" value={tplForm.description} onChange={e=>setTplForm({...tplForm, description:e.target.value})} className="dark:bg-slate-800" />
                <Input placeholder="Grade level (optional)" value={tplForm.grade_level} onChange={e=>setTplForm({...tplForm, grade_level:e.target.value})} className="dark:bg-slate-800" />
              </div>
              <div className="flex justify-end">
                <Button onClick={createTemplateFromFiltered} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <AddScheduleButton onCreated={refetch} />
          </div>
        </div>
        {isLoading ? (
          <div className="text-slate-500 text-sm">Loading schedules...</div>
        ) : (
          <div className="relative">
            {/* Quick Navigation */}
            <div className="sticky top-0 left-0 z-20 mb-4 flex gap-2 bg-gradient-to-r from-white/95 to-blue-50/95 dark:from-slate-900/95 dark:to-blue-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mr-4">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Jump:</span>
              </div>
              {['Mon','Tue','Wed','Thu','Fri'].map((d, i)=> (
                <Button
                  key={d}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-400 hover:scale-105 transition-all duration-200"
                  onClick={()=>{
                    const el = document.querySelector(`#planner-day-${i}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
                  }}
                >
                  {d}
                </Button>
              ))}
              <Button
                variant="default"
                size="sm"
                className="h-9 px-4 ml-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-200"
                onClick={()=>{
                  const sc = document.querySelector('#planner-scroll') as HTMLDivElement
                  if (!sc) return
                  const now = new Date(); const mins = now.getHours()*60+now.getMinutes(); const y = 56 + (mins - 360) * 2
                  sc.scrollTo({ top: Math.max(0, y-120), behavior: 'smooth' })
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Jump to Now
              </Button>
            </div>

            {/* Calendar Container */}
            <div id="planner-scroll" className="max-h-[70vh] overflow-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-900">
              <PlannerPrintStyles compact={compactPrint} />
              <WeeklyCanvas schedules={items} toast={toast} highContrast={highContrast} startHour={startHour} endHour={endHour} refetch={refetch} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WeeklyCanvas({ schedules, toast, highContrast, startHour, endHour, refetch }: { schedules: any[]; toast?: any; highContrast?: boolean; startHour: number; endHour: number; refetch?: () => Promise<any> }) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday']
  const dayStartMinutes = startHour*60
  const dayEndMinutes = endHour*60
  const pxPerMinute = 2
  const header = 56
  const height = header + (dayEndMinutes - dayStartMinutes) * pxPerMinute
  const now = new Date()
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]
  const nowMinutes = now.getHours()*60 + now.getMinutes()

  const [events, setEvents] = useState<any[]>([])
  const list = events.length ? events : schedules

  const parseMin = (t:string) => (parseInt(t.slice(0,2))*60) + parseInt(t.slice(3,5))

  // Convert 24h to 12h AM/PM
  const formatTime12h = (time24: string) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  // Build day events - MEMOIZED to prevent constant re-creation
  const byDay = useMemo(() => {
    const result: Record<string, any[]> = {}
    days.forEach(d => result[d] = [])

    for (const s of list) {
      const start = parseMin((s.start_time || s.startTime))
      const end = parseMin((s.end_time || s.endTime))
      const day = s.day_of_week || s.dayOfWeek
      const startTime = s.start_time || s.startTime
      const endTime = s.end_time || s.endTime

      // Try multiple ways to get teacher name (handle both camelCase and snake_case)
      const teacherName =
        s.teacher?.user?.full_name ||
        s.teacher?.user?.fullName ||
        s.teacher?.full_name ||
        s.teacher?.fullName ||
        // Try camelCase (from frontend transformation)
        (s.teacher?.firstName && s.teacher?.lastName
          ? `${s.teacher.firstName} ${s.teacher.lastName}`.trim()
          : null) ||
        // Try snake_case (from backend)
        (s.teacher?.first_name && s.teacher?.last_name
          ? `${s.teacher.first_name} ${s.teacher.last_name}`.trim()
          : null) ||
        s.teacher?.email ||
        'TBA'
      const sectionName = s.section?.name || 'TBA'
      const roomNumber = s.room?.roomNumber || s.room?.room_number || 'TBA'
      const buildingName = s.room?.floor?.building?.building_name || s.building?.building_name || s.building?.name || 'TBA'

      result[day]?.push({
        id: s.id,
        raw: s,
        startMin: start,
        endMin: end,
        start_time: startTime,
        end_time: endTime,
        startTime: startTime,
        endTime: endTime,
        label: `${(s.subject?.subject_name || s.subject?.subjectName || 'Class')}`,
        timeRange: `${formatTime12h(startTime)}–${formatTime12h(endTime)}`,
        teacher: teacherName,
        section: sectionName,
        room: roomNumber,
        building: buildingName,
        color: s.subject?.color_hex || '#4f46e5',
      })
    }
    return result
  }, [list])  // Only recalculate when list changes

  // Lane calculation per day
  for (const day of days) {
    const evs = byDay[day]
    evs.sort((a,b)=> a.startMin - b.startMin || a.endMin - b.endMin)
    const active: Array<{ end:number; lane:number }> = []
    let maxLanes = 0
    for (const e of evs) {
      for (let i=active.length-1;i>=0;i--) if (active[i].end <= e.startMin) active.splice(i,1)
      const used = new Set(active.map(a=>a.lane))
      let lane = 0
      while (used.has(lane)) lane++
      e.lane = lane
      active.push({ end: e.endMin, lane })
      if (active.length>maxLanes) maxLanes = active.length
      e.totalLanes = maxLanes
    }
    // Normalize to final max lanes
    evs.forEach(e=> e.totalLanes = Math.max(e.totalLanes, maxLanes))
  }

  return (
    <div className="min-w-[1000px] overflow-x-auto">
      <div className="grid grid-cols-[120px_repeat(5,1fr)]">
        {/* Time ruler */}
        <div className="relative border-r bg-white" style={{ height }}>
          <div className="sticky top-0 h-12 bg-white border-b flex items-center justify-center text-xs font-medium text-slate-600">Time</div>
          {Array.from({ length: (endHour - startHour) + 1 }).map((_, i)=>{
            const m = startHour*60 + i*60
            const label = new Date(0,0,0,Math.floor(m/60)).toLocaleTimeString('en-US',{hour:'numeric', hour12:true})
            return (
              <div key={i} className="absolute left-0 right-0" style={{ top: header + (m - dayStartMinutes) * pxPerMinute }}>
                <div className="h-px bg-slate-200" />
                <div className="-mt-2 pl-2 text-[10px] text-slate-500">{label}</div>
              </div>
            )
          })}
        </div>
        {days.map((day, idx)=> (
          <div key={day} id={`planner-day-${idx}`} className="relative border-r last:border-r-0 bg-white" style={{ height }}>
            <div className="sticky top-0 h-12 bg-white border-b flex items-center justify-center text-xs font-semibold text-slate-700">{day}</div>
            {/* Zebra stripes */}
            {Array.from({ length: endHour - startHour }).map((_, i)=> (
              <div key={i} className={`absolute left-0 right-0 ${i%2? 'bg-slate-50':'bg-transparent'}`} style={{ top: header + i*60*pxPerMinute, height: 60*pxPerMinute }} />
            ))}
            {/* Now line */}
            {day === todayName && nowMinutes>=dayStartMinutes && nowMinutes<=dayEndMinutes && (
              <div className="absolute left-0 right-0" style={{ top: header + (nowMinutes - dayStartMinutes) * pxPerMinute }}>
                <div className="h-0.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              </div>
            )}
            {(byDay[day]||[]).map(evt => (
              <DraggableResizableEvent
                key={evt.id}
                evt={evt}
                pxPerMinute={pxPerMinute}
                dayStartMinutes={dayStartMinutes}
                highContrast={!!highContrast}
                onChange={(updated)=>{
                  setEvents(prev=>{
                    const base = (prev.length? prev: schedules).map(x=> ({...x}))
                    const idx = base.findIndex(x=> x.id===evt.id)
                    if (idx>=0) { base[idx] = { ...base[idx], start_time: updated.startTime, end_time: updated.endTime } }
                    return base
                  })
                }}
                onSave={async(updated)=>{
                  console.log('🔄 [DRAG & DROP] Saving schedule...')
                  console.log('   Schedule ID:', evt.id)
                  console.log('   Old times:', evt.start_time || evt.startTime, 'to', evt.end_time || evt.endTime)
                  console.log('   New times:', updated.startTime, 'to', updated.endTime)

                  try {
                    console.log('   📤 Sending PATCH request to /schedules/' + evt.id)
                    const response = await adminUpdateSchedule(evt.id, { startTime: updated.startTime, endTime: updated.endTime })
                    console.log('   ✅ Response received:', response)

                    console.log('   🔄 Refetching data...')
                    setEvents([]) // Clear local events to force use of fresh data
                    await refetch?.()
                    console.log('   ✅ Refetch complete')

                    toast?.({ title: 'Schedule updated', description: `${evt.label} - ${updated.startTime} to ${updated.endTime}` })
                  } catch (error) {
                    console.error('❌ [DRAG & DROP] Failed to update schedule:', error)
                    console.error('   Error details:', error)
                    toast?.({
                      title: 'Failed to save',
                      description: error instanceof Error ? error.message : 'Unknown error',
                      variant: 'destructive'
                    })
                  }
                }}
                onDelete={async()=>{
                  await adminDeleteSchedule(evt.id)
                  toast?.({ title: 'Schedule deleted', variant: 'destructive' })
                  setEvents(prev=> (prev.length? prev: schedules).filter(x=> x.id!==evt.id))
                }}
                lane={evt.lane}
                totalLanes={evt.totalLanes}
                toast={toast}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DraggableResizableEvent({ evt, pxPerMinute, dayStartMinutes, onChange, onSave, onDelete, lane, totalLanes, highContrast, toast }: { evt:any; pxPerMinute:number; dayStartMinutes:number; onChange:(u:{startTime:string; endTime:string})=>void; onSave:(u:{startTime:string; endTime:string})=>Promise<void>; onDelete:()=>Promise<void>; lane:number; totalLanes:number; highContrast:boolean; toast:any }) {
  console.log('🔄 [RENDER] DraggableResizableEvent rendering:', evt.id, 'startMin:', evt.startMin, 'endMin:', evt.endMin)

  const [top, setTop] = useState(56 + (evt.startMin - dayStartMinutes) * pxPerMinute)
  const [h, setH] = useState(Math.max(8, (evt.endMin - evt.startMin) * pxPerMinute))
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const widthPct = 100/totalLanes
  const leftPct = lane * widthPct
  const calcLabel = (minutes:number) => new Date(0,0,0,Math.floor(minutes/60), minutes%60).toLocaleTimeString('en-US',{hour:'2-digit', minute:'2-digit'})
  const toTime = (minutes:number) => `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}:00`

  // Calculate current times based on current state (updates during drag)
  const currentStartMin = Math.round((top - 56)/pxPerMinute) + dayStartMinutes
  const currentEndMin = currentStartMin + Math.round(h/pxPerMinute)
  const currentTimeRange = `${calcLabel(currentStartMin)} - ${calcLabel(currentEndMin)}`

  // Drag move by header
  const onHeaderDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startTop = top
    let finalTop = startTop
    const move = (me: MouseEvent) => {
      const dt = me.clientY - startY
      const nt = Math.max(56, startTop + dt)
      finalTop = nt
      setTop(nt)
    }
    const up = async () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      // Use finalTop to ensure we capture the last position
      const startMin = Math.round((finalTop - 56)/pxPerMinute) + dayStartMinutes
      const endMin = startMin + Math.round(h/pxPerMinute)
      console.log('💾 [SAVE] Drag ended - saving position:', { finalTop, startMin, endMin, startTime: toTime(startMin), endTime: toTime(endMin) })
      setSaving(true)
      try {
        await onSave({ startTime: toTime(startMin), endTime: toTime(endMin) })
      } catch (error) {
        console.error('❌ [SAVE] Failed:', error)
      }
      setSaving(false)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = h
    let finalH = startH
    const move = (me: MouseEvent) => {
      const dh = me.clientY - startY
      const nh = Math.max(8, startH + dh)
      finalH = nh
      setH(nh)
    }
    const up = async () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      // Use finalH to ensure we capture the last height
      const startMin = Math.round((top - 56)/pxPerMinute) + dayStartMinutes
      const endMin = startMin + Math.round(finalH/pxPerMinute)
      console.log('💾 [SAVE] Resize ended - saving height:', { finalH, startMin, endMin, startTime: toTime(startMin), endTime: toTime(endMin) })
      setSaving(true)
      try {
        await onSave({ startTime: toTime(startMin), endTime: toTime(endMin) })
      } catch (error) {
        console.error('❌ [SAVE] Failed:', error)
      }
      setSaving(false)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return (
    <div
      className={cn(
        "absolute rounded-lg overflow-hidden transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
        "hover:shadow-lg hover:scale-[1.02] hover:z-10",
        "cursor-move group"
      )}
      tabIndex={0}
      style={{
        top,
        height: h,
        backgroundColor: highContrast? '#0f172a' : evt.color,
        color: '#ffffff',
        border: highContrast? '2px solid #334155':'2px solid rgba(255,255,255,0.2)',
        left: `calc(${leftPct}% + 8px)`,
        right: `calc(${100 - (leftPct + widthPct)}% + 8px)`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onKeyDown={async(e)=>{
        const step = (e.shiftKey? 15: 5) // 5 min, or 15 with Shift
        if (['ArrowUp','ArrowDown'].includes(e.key)) {
          e.preventDefault()
          const dir = e.key==='ArrowUp' ? -1 : 1
          const ntop = Math.max(56, top + dir * step * pxPerMinute)
          setTop(ntop)
          const startMin = Math.round((ntop - 56)/pxPerMinute) + dayStartMinutes
          const endMin = startMin + Math.round(h/pxPerMinute)
          onChange({ startTime: toTime(startMin), endTime: toTime(endMin) })
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const startMin = Math.round((top - 56)/pxPerMinute) + dayStartMinutes
          const endMin = startMin + Math.round(h/pxPerMinute)
          setSaving(true)
          await onSave({ startTime: toTime(startMin), endTime: toTime(endMin) })
          setSaving(false)
        } else if (e.key === 'Escape') {
          // revert by reloading from raw
          const sMin = evt.startMin
          const eMin = evt.endMin
          setTop(56 + (sMin - dayStartMinutes) * pxPerMinute)
          setH(Math.max(8, (eMin - sMin) * pxPerMinute))
        }
      }}
    >
      {/* Event Header - Draggable */}
      <div
        className="px-3 py-2 text-sm font-semibold cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors border-b border-white/20"
        onMouseDown={onHeaderDown}
        title={evt.label}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center gap-2 truncate">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-bold">{evt.label}</span>
          </span>
          {saving && (
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full animate-in fade-in duration-200">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px]">Saving</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {currentTimeRange}
        </div>
      </div>

      {/* Event Body - Clickable */}
      <div
        className="px-3 py-2 space-y-1.5 text-[11px] text-white/90 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={(e)=> {
          e.stopPropagation()
          setModalOpen(true)
        }}
      >
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{evt.teacher}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{evt.section}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{evt.building} - {evt.room}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-center text-[10px] text-white/60">
          Click for details
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize bg-gradient-to-t from-black/20 to-transparent hover:from-black/30 transition-colors flex items-center justify-center group-hover:from-white/20"
        onMouseDown={onMouseDown}
      >
        <div className="w-10 h-1 bg-white/50 rounded-full" />
      </div>

      {/* Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: evt.color}}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              {evt.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Time Info */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{currentTimeRange}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Teacher</span>
                </div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{evt.teacher}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Section</span>
                </div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{evt.section}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Building</span>
                </div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{evt.building}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Room</span>
                </div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{evt.room}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="destructive"
                size="lg"
                className="flex-1"
                onClick={async()=>{
                  if (!confirm('Are you sure you want to delete this schedule?')) return
                  setModalOpen(false)
                  await onDelete()
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Schedule
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={()=> setModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlannerPrintStyles({ compact }: { compact: boolean }) {
  return (
    <style>
      {`
      @media print {
        body { background: white; }
        header, nav, aside, .sticky, [role="tablist"], button { display: none !important; }
        #planner-scroll { max-height: unset !important; overflow: visible !important; border: 0 !important; }
        .grid { gap: 0 !important; }
        .absolute { box-shadow: none !important; }
        ${compact ? '.absolute > div { padding: 4px !important; font-size: 10px !important; }' : ''}
      }
    `}
    </style>
  )
}

function AddScheduleButton({ onCreated }: { onCreated: ()=>void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    subjectId: '', teacherId: '', sectionId: '', roomId: '', dayOfWeek: 'Monday', startTime: '08:00', endTime: '09:00', schoolYear: '2024-2025', semester: '1st', status: 'draft'
  } as any)
  const submit = async () => {
    const normalize = (t:string) => t && t.length===5 ? `${t}:00` : t
    await adminCreateSchedule({ ...form, startTime: normalize(form.startTime), endTime: normalize(form.endTime) })
    setOpen(false)
    onCreated()
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-10">
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            New Schedule (Draft)
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Subject ID" value={form.subjectId} onChange={e=>setForm({...form, subjectId:e.target.value})} />
          <Input placeholder="Teacher ID" value={form.teacherId} onChange={e=>setForm({...form, teacherId:e.target.value})} />
          <Input placeholder="Section ID" value={form.sectionId} onChange={e=>setForm({...form, sectionId:e.target.value})} />
          <Input placeholder="Room ID (optional)" value={form.roomId} onChange={e=>setForm({...form, roomId:e.target.value})} />
          <Select value={form.dayOfWeek} onValueChange={(v)=>setForm({...form, dayOfWeek:v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input type="time" step="60" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
          <Input type="time" step="60" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} />
          <Input placeholder="School Year" value={form.schoolYear} onChange={e=>setForm({...form, schoolYear:e.target.value})} />
          <Input placeholder="Semester (1st/2nd)" value={form.semester} onChange={e=>setForm({...form, semester:e.target.value})} />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Create Draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WizardTab({ defaultSchoolYear, defaultSemester }: { defaultSchoolYear: string; defaultSemester: string }) {
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const useDebounce = <T,>(value: T, delay = 250) => {
    const [v, setV] = useState(value as T)
    useEffect(() => {
      const id = setTimeout(() => setV(value), delay)
      return () => clearTimeout(id)
    }, [value, delay])
    return v
  }
  const [form, setForm] = useState({
    schoolYear: defaultSchoolYear || '',
    semester: defaultSemester || '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    buildingId: '',
    floorId: '',
    roomId: '',
    pattern: 'MWF' as 'MWF' | 'TTh' | 'Custom',
    days: ['Monday','Wednesday','Friday'] as string[],
    startTime: '08:00:00',
    endTime: '09:00:00',
  })
  useEffect(()=>{ if (!form.schoolYear && defaultSchoolYear) setForm(f=>({...f, schoolYear: defaultSchoolYear})) }, [defaultSchoolYear])
  useEffect(()=>{ if (!form.semester && defaultSemester) setForm(f=>({...f, semester: defaultSemester})) }, [defaultSemester])
  const { toast } = useToast()

  // Load options for dropdowns
  const { data: sectionsData } = useQuery({ queryKey: ['wizard-sections'], queryFn: () => adminListSections({ limit: 1000 }) })
  const { data: subjectsData } = useQuery({ queryKey: ['wizard-subjects'], queryFn: () => adminListSubjects({ limit: 1000 }) })
  const { data: teachersData } = useQuery({ queryKey: ['wizard-teachers'], queryFn: () => adminListTeachers({ limit: 1000 }) })
  const [bSearch, setBSearch] = useState('')
  const [fSearch, setFSearch] = useState('')
  const [rSearch, setRSearch] = useState('')
  const dbB = useDebounce(bSearch)
  const dbF = useDebounce(fSearch)
  const dbR = useDebounce(rSearch)
  const { data: buildingsData } = useQuery({ queryKey: ['wizard-buildings', dbB], queryFn: () => adminListBuildings({ limit: 1000, search: dbB || undefined }) })
  const { data: floorsData } = useQuery({ queryKey: ['wizard-floors', form.buildingId, dbF], queryFn: () => adminListFloors({ limit: 1000, buildingId: form.buildingId || undefined, search: dbF || undefined }), enabled: !!form.buildingId })
  const { data: roomsData } = useQuery({ queryKey: ['wizard-rooms', form.floorId, dbR], queryFn: () => adminListRooms({ limit: 1000, floorId: form.floorId || undefined, search: dbR || undefined }), enabled: !!form.floorId })
  const sections = sectionsData?.data || []
  const subjects = subjectsData?.data || []
  const teachers = teachersData?.data || []
  const buildings = buildingsData?.data || []
  const floors = floorsData?.data || []
  const rooms = roomsData?.data || []

  const next = () => setStep((s) => Math.min(6, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const applyPattern = (pattern: 'MWF' | 'TTh' | 'Custom') => {
    if (pattern === 'MWF') return ['Monday','Wednesday','Friday']
    if (pattern === 'TTh') return ['Tuesday','Thursday']
    return form.days
  }

  const submit = async () => {
    try {
      setBusy(true)
      const days = form.pattern === 'Custom' ? form.days : applyPattern(form.pattern)
      const normalize = (t:string) => t && t.length===5 ? `${t}:00` : t
      // Optional conflict precheck (minimal fields)
      for (const day of days) {
        const check = await adminCheckConflicts({
          teacherId: form.teacherId,
          roomId: form.roomId || undefined,
          sectionId: form.sectionId,
          dayOfWeek: day,
          startTime: normalize(form.startTime),
          endTime: normalize(form.endTime),
        })
        if (check?.hasConflicts) {
          const { toast } = require('@/hooks/use-toast')
          toast.useToast().toast({ title: 'Conflicts detected', description: `On ${day}: ${check.conflicts.map((c:any)=>c.message).join(', ')}`, variant: 'destructive' })
          setBusy(false)
          return
        }
      }
      await Promise.all(
        days.map((day) => adminCreateSchedule({
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          sectionId: form.sectionId,
          roomId: form.roomId || undefined,
          dayOfWeek: day,
          startTime: normalize(form.startTime),
          endTime: normalize(form.endTime),
          schoolYear: form.schoolYear,
          semester: form.semester,
          status: 'draft',
        }))
      )
      setStep(6)
    } finally {
      setBusy(false)
    }
  }

  const stepsMeta = [
    { n:1, title:'Term', desc:'School year and semester' },
    { n:2, title:'Section', desc:'Target section' },
    { n:3, title:'People/Room', desc:'Subject, teacher, room' },
    { n:4, title:'Pattern', desc:'Weekly pattern' },
    { n:5, title:'Time', desc:'Start/End' },
    { n:6, title:'Review', desc:'Confirm and create drafts' },
  ]

  const invalid = ((): boolean => {
    if (step===1) return !form.schoolYear || !form.semester
    if (step===2) return !form.sectionId
    if (step===3) return !form.subjectId || !form.teacherId
    if (step===4) return form.pattern==='Custom' && form.days.length===0
    if (step===5) return !form.startTime || !form.endTime
    return false
  })()

  const Summary = () => {
    const sectionLabel = sections.find((s:any)=> s.id===form.sectionId)?.name || (form.sectionId || '—')
    const subjectLabel = subjects.find((s:any)=> s.id===form.subjectId)?.subject_name || subjects.find((s:any)=> s.id===form.subjectId)?.subjectName || (form.subjectId || '—')
    const teacherLabel = teachers.find((t:any)=> t.id===form.teacherId)?.full_name || teachers.find((t:any)=> t.id===form.teacherId)?.email || (form.teacherId || '—')
    const buildingLabel = buildings.find((b:any)=> b.id===form.buildingId)?.building_name || buildings.find((b:any)=> b.id===form.buildingId)?.name || undefined
    const floorLabel = floors.find((f:any)=> f.id===form.floorId)?.number != null ? `Floor ${floors.find((f:any)=> f.id===form.floorId)?.number}` : floors.find((f:any)=> f.id===form.floorId)?.name
    const roomLabel = rooms.find((r:any)=> r.id===form.roomId)?.room_number || rooms.find((r:any)=> r.id===form.roomId)?.name || (form.roomId ? String(form.roomId).slice(0,8) : 'TBA')

    return (
      <div className="space-y-2 text-sm">
        <div><span className="font-medium">Term:</span> {form.schoolYear} • {form.semester}</div>
        <div><span className="font-medium">Section:</span> {sectionLabel}</div>
        <div><span className="font-medium">Subject:</span> {subjectLabel} • <span className="font-medium">Teacher:</span> {teacherLabel}</div>
        <div><span className="font-medium">Location:</span> {[buildingLabel, floorLabel, roomLabel && `Room ${roomLabel}`].filter(Boolean).join(' • ') || 'TBA'}</div>
        <div><span className="font-medium">Pattern:</span> {form.pattern==='Custom' ? form.days.join(', ') : form.pattern}</div>
        <div><span className="font-medium">Time:</span> {form.startTime} – {form.endTime}</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stepper */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {stepsMeta.map(s => (
              <button key={s.n} onClick={()=>setStep(s.n)} className={`px-3 py-2 rounded-lg border text-left min-w-[160px] transition-colors ${step===s.n ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                <div className="text-xs opacity-80">Step {s.n}</div>
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-xs opacity-75">{s.desc}</div>
              </button>
            ))}
          </div>
          <div className="h-1 mt-2 rounded bg-slate-200 overflow-hidden"><div className="h-full bg-slate-900 transition-all" style={{ width: `${(step-1)/5*100}%` }} /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">School Year</label>
                  <Input aria-label="School Year" value={form.schoolYear} onChange={e=>setForm({...form, schoolYear:e.target.value})} placeholder="2024-2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <Input aria-label="Semester" value={form.semester} onChange={e=>setForm({...form, semester:e.target.value})} placeholder="1st" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <Select value={form.sectionId} onValueChange={(v:any)=>setForm({...form, sectionId:v})}>
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent>
                      {sections.map((s:any)=> (
                        <SelectItem key={s.id} value={s.id}>{s.name || s.id.slice(0,8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Select value={form.subjectId} onValueChange={(v:any)=>setForm({...form, subjectId:v})}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub:any)=> (
                        <SelectItem key={sub.id} value={sub.id}>{sub.subject_name || sub.subjectName || sub.code || sub.id.slice(0,8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teacher</label>
                  <Select value={form.teacherId} onValueChange={(v:any)=>setForm({...form, teacherId:v})}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map((t:any)=> (
                        <SelectItem key={t.id} value={t.id}>{t.full_name || t.email || t.id.slice(0,8)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Building</label>
                    <Select value={form.buildingId} onValueChange={(v:any)=>{ setForm({...form, buildingId:v, floorId:'', roomId:''}); setFSearch(''); setRSearch(''); }}>
                      <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 z-10 bg-white p-2 border-b">
                          <Input className="h-8" placeholder="Search building" value={bSearch} onChange={e=>setBSearch(e.target.value)} />
                        </div>
                        {buildings.map((b:any)=> {
                          const label = (b.building_name || b.name || b.buildingName || b.code || `Building ${String(b.id).slice(0,8)}`)
                          return (
                            <SelectItem key={b.id} value={b.id}>{label}</SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Floor</label>
                    <Select disabled={!form.buildingId} value={form.floorId} onValueChange={(v:any)=>setForm({...form, floorId:v, roomId:''})}>
                      <SelectTrigger><SelectValue placeholder={form.buildingId? 'Select floor':'Select building first'} /></SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 z-10 bg-white p-2 border-b">
                          <Input className="h-8" placeholder="Search floor" value={fSearch} onChange={e=>setFSearch(e.target.value)} />
                        </div>
                        {floors.length === 0 ? (
                          <div className="px-2 py-1.5 text-xs text-slate-500">No floors found</div>
                        ) : floors.map((f:any)=> {
                          const label = (f.number != null ? `Floor ${f.number}` : (f.name || f.floor_name || String(f.id).slice(0,8)))
                          return <SelectItem key={f.id} value={f.id}>{label}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Room (optional)</label>
                    <Select disabled={!form.floorId} value={form.roomId} onValueChange={(v:any)=>setForm({...form, roomId:v})}>
                      <SelectTrigger><SelectValue placeholder={form.floorId? 'Select room':'Select floor first'} /></SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 z-10 bg-white p-2 border-b">
                          <Input className="h-8" placeholder="Search room" value={rSearch} onChange={e=>setRSearch(e.target.value)} />
                        </div>
                        {rooms.map((r:any)=> (
                          <SelectItem key={r.id} value={r.id}>{r.room_number || r.name || r.id.slice(0,8)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weekly Pattern</label>
                  <Select value={form.pattern} onValueChange={(v:any)=>setForm({...form, pattern:v, days: applyPattern(v)})}>
                    <SelectTrigger><SelectValue placeholder="Pattern" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MWF">MWF</SelectItem>
                      <SelectItem value="TTh">TTh</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.pattern === 'Custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Days</label>
                    <Input aria-label="Custom Days" value={form.days.join(',')} onChange={e=>setForm({...form, days: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Monday,Tuesday" />
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input type="time" step="60" aria-label="Start Time" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input type="time" step="60" aria-label="End Time" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="rounded-lg border p-4 bg-slate-50">
                <Summary />
              </div>
            )}

            {/* Sticky footer actions */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t mt-6 py-3 flex items-center justify-between">
              <Button variant="ghost" onClick={prev} disabled={step===1 || busy}>Back</Button>
              <div className="flex items-center gap-2">
                {step<6 ? (
                  <Button onClick={next} disabled={invalid}>Next</Button>
                ) : (
                  <Button onClick={submit} disabled={busy}>{busy? 'Creating…':'Create Drafts'}</Button>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
              <CardContent>
                <Summary />
                <div className="mt-4 text-xs text-slate-500">Conflicts will be checked before creation.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DraftsList() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-drafts"],
    queryFn: () => adminListSchedules({ status: 'draft', limit: 50 }),
  })

  if (isLoading) return <div className="text-slate-600">Loading drafts...</div>

  const drafts = data?.data || []
  if (drafts.length === 0) return <div className="text-slate-600">No drafts right now.</div>

  return (
    <div className="space-y-3">
      {drafts.map((s: any) => (
        <DraftRow key={s.id} s={s} onChanged={refetch} />
      ))}
    </div>
  )
}

function DraftRow({ s, onChanged }: { s: any; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [openAudit, setOpenAudit] = useState(false)
  const publish = async (flag: boolean) => {
    try {
      setBusy(true)
      await adminSetSchedulePublish(s.id, flag)
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between border rounded-lg p-3 bg-white">
      <div>
        <div className="font-medium">{s.subject?.subject_name || s.subject?.subjectName || 'Class'} • {s.day_of_week || s.dayOfWeek} {s.start_time?.slice(0,5) || s.startTime}–{s.end_time?.slice(0,5) || s.endTime}</div>
        <div className="text-xs text-slate-500">Section {s.section_id?.slice(0,8)} • Teacher {s.teacher_id?.slice(0,8)} • Room {s.room_id?.slice(0,8)}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={busy} onClick={()=> setOpenAudit(true)}>Audit</Button>
        <Button variant="outline" disabled={busy} onClick={() => publish(true)}>Publish</Button>
        <Button variant="ghost" disabled={busy} onClick={() => publish(false)}>Keep Draft</Button>
      </div>
      {openAudit && <AuditDrawer scheduleId={s.id} onClose={()=> setOpenAudit(false)} />}
    </div>
  )
}
function AuditDrawer({ scheduleId, onClose }: { scheduleId: string; onClose: ()=>void }) {
  const { data, isLoading } = useQuery({ queryKey: ['audit', scheduleId], queryFn: () => adminGetScheduleAudit(scheduleId) })
  const logs:any[] = data || []
  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-base font-semibold">Audit Trail</div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-4 space-y-3 overflow-auto h-[calc(100%-56px)]">
          {isLoading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : logs.length===0 ? (
            <div className="text-slate-500 text-sm">No audit records.</div>
          ) : logs.map((log:any)=>{
            const actor = log.actor?.full_name || log.actor?.email || log.actor_user_id
            return (
              <div key={log.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div><span className="font-medium capitalize">{log.action}</span> by {actor}</div>
                  <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                </div>
                {log.changed_fields && (
                  <div className="mt-2 text-xs text-slate-600"><span className="font-medium">Changed:</span> {Object.keys(log.changed_fields||{}).join(', ') || '—'}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TemplatesApply({ templates, loading }: { templates: any[]; loading: boolean }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [sectionId, setSectionId] = useState("")
  const [schoolYear, setSchoolYear] = useState("2024-2025")
  const [semester, setSemester] = useState("1st")
  const [applyBusy, setApplyBusy] = useState(false)
  const [lastAppliedIds, setLastAppliedIds] = useState<string[]>([])
  const { toast } = useToast()
  // Resolve labels for preview
  const { data: subjectsData } = useQuery({ queryKey: ['tpl-subjects'], queryFn: () => adminListSubjects({ limit: 1000 }) })
  const { data: teachersData } = useQuery({ queryKey: ['tpl-teachers'], queryFn: () => adminListTeachers({ limit: 1000 }) })
  const { data: roomsData } = useQuery({ queryKey: ['tpl-rooms'], queryFn: () => adminListRooms({ limit: 1000 }) })
  const subjects = subjectsData?.data || []
  const teachers = teachersData?.data || []
  const rooms = roomsData?.data || []

  const template = (templates || []).find((t:any)=> t.id === selectedTemplateId)
  const entries: Array<any> = Array.isArray(template?.payload) ? template.payload : []

  // Diff preview: check conflicts per entry
  const [conflicts, setConflicts] = useState<Record<number, { hasConflicts: boolean; details: any[] }>>({})

  const runPreview = async () => {
    const result: Record<number, { hasConflicts: boolean; details: any[] }> = {}
    for (let i=0;i<entries.length;i++) {
      const e = entries[i]
      try {
        const check = await adminCheckConflicts({
          teacherId: e.teacherId,
          roomId: e.roomId || undefined,
          sectionId,
          dayOfWeek: e.dayOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
        })
        result[i] = { hasConflicts: !!check?.hasConflicts, details: check?.conflicts || [] }
      } catch (err) {
        result[i] = { hasConflicts: true, details: [{ type: 'error', message: 'Preview failed' }] }
      }
    }
    setConflicts(result)
    toast({ title: 'Preview updated', description: 'Conflict precheck complete.' })
  }

  const applyTemplate = async () => {
    if (!template || !sectionId) { toast({ title: 'Missing inputs', description: 'Choose a template and section', variant: 'destructive' }); return }
    setApplyBusy(true)
    const createdIds: string[] = []
    try {
      for (const e of entries) {
        const res = await adminCreateSchedule({
          subjectId: e.subjectId,
          teacherId: e.teacherId,
          sectionId,
          roomId: e.roomId || undefined,
          buildingId: e.buildingId || undefined,
          dayOfWeek: e.dayOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
          schoolYear,
          semester,
          status: 'draft',
        })
        if (res?.id) createdIds.push(res.id)
      }
      setLastAppliedIds(createdIds)
      toast({ title: 'Template applied', description: `${createdIds.length} drafts created.` })
    } finally {
      setApplyBusy(false)
    }
  }

  const rollback = async () => {
    if (lastAppliedIds.length === 0) { toast({ title: 'Nothing to rollback', description: 'Apply a template first.' }); return }
    setApplyBusy(true)
    try {
      for (const id of lastAppliedIds) {
        await adminDeleteSchedule(id)
      }
      setLastAppliedIds([])
      toast({ title: 'Rollback complete', description: 'Deleted newly created drafts.' })
    } finally {
      setApplyBusy(false)
    }
  }

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Schedule Templates</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Apply pre-configured templates to sections</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="text-slate-600">Loading templates...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Template</label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>
                    {(templates||[]).map((t:any)=> (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section</label>
                <Input placeholder="section UUID" value={sectionId} onChange={e=>setSectionId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">School Year</label>
                  <Input value={schoolYear} onChange={e=>setSchoolYear(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <Input value={semester} onChange={e=>setSemester(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={runPreview}
                disabled={!selectedTemplateId || !sectionId}
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Conflicts
              </Button>
              <Button
                onClick={applyTemplate}
                disabled={!selectedTemplateId || !sectionId || applyBusy}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200"
              >
                {applyBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Apply as Drafts
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={rollback}
                disabled={applyBusy || lastAppliedIds.length===0}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Rollback
              </Button>
            </div>

            {/* Diff/preview table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-6 px-3 py-2 text-xs font-semibold bg-slate-50 border-b">
                <div>Subject</div><div>Teacher</div><div>Day</div><div>Time</div><div>Room</div><div>Status</div>
              </div>
              <div>
                {entries.length===0 ? (
                  <div className="p-3 text-sm text-slate-600">No entries in template.</div>
                ) : entries.map((e:any, i:number)=>{
                  const c = conflicts[i]
                  const status = c?.hasConflicts ? `Conflicts (${c.details?.length||0})` : (c ? 'OK' : '—')
                  const subj = subjects.find((s:any)=> s.id===e.subjectId)
                  const teach = teachers.find((t:any)=> t.id===e.teacherId)
                  const room = rooms.find((r:any)=> r.id===e.roomId)
                  return (
                    <div key={i} className="grid grid-cols-6 px-3 py-2 text-sm border-b last:border-b-0">
                      <div className="truncate" title={subj?.subject_name || subj?.subjectName || e.subjectId}>{subj?.subject_name || subj?.subjectName || e.subjectId?.slice(0,8)}</div>
                      <div className="truncate" title={teach?.full_name || teach?.email || e.teacherId}>{teach?.full_name || teach?.email || e.teacherId?.slice(0,8)}</div>
                      <div>{e.dayOfWeek}</div>
                      <div>{e.startTime?.slice(0,5)}–{e.endTime?.slice(0,5)}</div>
                      <div className="truncate" title={room?.room_number || room?.name || e.roomId || 'TBA'}>{room?.room_number || room?.name || (e.roomId ? e.roomId.slice(0,8) : 'TBA')}</div>
                      <div className={c?.hasConflicts? 'text-rose-600':'text-emerald-600'}>{status}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PublishQueue() {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [conflicts, setConflicts] = useState<Record<string, { hasConflicts: boolean; count: number; details: any[] }>>({})
  const [goLiveDate, setGoLiveDate] = useState<string>("")
  const [goLiveTime, setGoLiveTime] = useState<string>("")
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-drafts-queue"],
    queryFn: () => adminListSchedules({ status: 'draft', limit: 200 }),
  })

  const drafts = data?.data || []

  const toggle = (id: string) => setSelected(s=> ({ ...s, [id]: !s[id] }))

  const selectedIds = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)

  const bulkPublish = async () => {
    if (selectedIds.length===0) return
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => adminSetSchedulePublish(id, true)))
      setSelected({})
      await refetch()
    } finally {
      setBusy(false)
    }
  }

  const bulkUnpublish = async () => {
    if (selectedIds.length===0) return
    setBusy(true)
    try {
      await Promise.all(selectedIds.map(id => adminSetSchedulePublish(id, false)))
      setSelected({})
      await refetch()
    } finally {
      setBusy(false)
    }
  }

  const previewConflicts = async () => {
    if (selectedIds.length===0) return
    setBusy(true)
    try {
      const map: Record<string, { hasConflicts: boolean; count: number; details: any[] }> = {}
      for (const s of drafts.filter((d:any)=> selected[d.id])) {
        const res = await adminCheckConflicts({
          teacherId: s.teacher_id || s.teacherId,
          roomId: s.room_id || s.roomId || undefined,
          sectionId: s.section_id || s.sectionId,
          dayOfWeek: s.day_of_week || s.dayOfWeek,
          startTime: s.start_time || s.startTime,
          endTime: s.end_time || s.endTime,
        })
        map[s.id] = { hasConflicts: !!res?.hasConflicts, count: res?.conflicts?.length || 0, details: res?.conflicts || [] }
      }
      setConflicts(map)
    } finally {
      setBusy(false)
    }
  }

  const scheduleGoLive = async () => {
    const ids = selectedIds
    if (ids.length===0) return
    if (!goLiveDate || !goLiveTime) return
    const target = new Date(`${goLiveDate}T${goLiveTime}:00`)
    if (isNaN(target.getTime())) return
    const delay = target.getTime() - Date.now()
    if (delay <= 0) {
      await bulkPublish()
      return
    }
    // Client-side timer (best-effort). Note: requires the page to be open.
    setBusy(true)
    setTimeout(async () => {
      try {
        await Promise.all(ids.map(id => adminSetSchedulePublish(id, true)))
        setSelected({})
        await refetch()
      } finally {
        setBusy(false)
      }
    }, delay)
  }

  if (isLoading) return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xl font-bold">Publish Queue</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading drafts...
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Publish Queue</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Bulk publish draft schedules</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {drafts.length===0 ? (
          <div className="text-slate-600">No drafts right now.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800/50 dark:to-green-900/20 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected: <Badge variant="outline" className="ml-1">{selectedIds.length}</Badge>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={previewConflicts}
                  disabled={busy || selectedIds.length===0}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Conflicts
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={bulkUnpublish}
                  disabled={busy || selectedIds.length===0}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400"
                >
                  {busy ? 'Working...' : 'Bulk Unpublish'}
                </Button>
                <Button
                  onClick={bulkPublish}
                  disabled={busy || selectedIds.length===0}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all duration-200"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Bulk Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="text-slate-600">Go-live at:</div>
              <input type="date" className="border rounded px-2 py-1 h-8" value={goLiveDate} onChange={e=>setGoLiveDate(e.target.value)} />
              <input type="time" className="border rounded px-2 py-1 h-8" value={goLiveTime} onChange={e=>setGoLiveTime(e.target.value)} />
              <Button variant="outline" size="sm" onClick={scheduleGoLive} disabled={busy || selectedIds.length===0}>Schedule Go-Live</Button>
              <div className="text-xs text-slate-500">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
            </div>
            {Object.keys(conflicts).length>0 && (
              <div className="rounded-lg border p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">Conflicts summary</div>
                <div className="space-y-1 text-sm">
                  {selectedIds.map(id=>{
                    const c = conflicts[id]
                    const s:any = drafts.find((d:any)=> d.id===id)
                    const label = `${s?.subject?.subject_name || s?.subject?.subjectName || 'Class'} • ${s?.day_of_week || s?.dayOfWeek} ${(s?.start_time||s?.startTime)?.slice(0,5)}–${(s?.end_time||s?.endTime)?.slice(0,5)}`
                    return (
                      <div key={id} className={c?.hasConflicts? 'text-rose-600':'text-emerald-700'}>
                        {label}: {c? (c.hasConflicts? `${c.count} conflict(s)` : 'OK') : '—'}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-7 px-3 py-2 text-xs font-semibold bg-slate-50 border-b">
                <div></div><div>Subject</div><div>Day</div><div>Time</div><div>Teacher</div><div>Section</div><div>Room</div>
              </div>
              {drafts.map((s:any)=> (
                <div key={s.id} className="grid grid-cols-7 px-3 py-2 text-sm border-b last:border-b-0 items-center">
                  <div><input type="checkbox" checked={!!selected[s.id]} onChange={()=>toggle(s.id)} aria-label={`select ${s.id}`} /></div>
                  <div className="truncate" title={s.subject?.subject_name || s.subject?.subjectName || 'Class'}>{s.subject?.subject_name || s.subject?.subjectName || 'Class'}</div>
                  <div>{s.day_of_week || s.dayOfWeek}</div>
                  <div>{(s.start_time||s.startTime)?.slice(0,5)}–{(s.end_time||s.endTime)?.slice(0,5)}</div>
                  <div className="truncate" title={s.teacher_id}>{(s.teacher_id||'').slice(0,8)}</div>
                  <div className="truncate" title={s.section_id}>{(s.section_id||'').slice(0,8)}</div>
                  <div className="truncate" title={s.room_id}>{(s.room_id||'TBA')?.slice(0,8)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
