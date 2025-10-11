"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/student/student-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Target,
  Trophy,
  CalendarIcon,
  Star,
  CheckCircle2,
  Edit3,
  Trash2,
  Zap,
  Award,
  BookOpen,
  Heart,
  Briefcase,
  Lightbulb,
  BarChart3,
  Flame,
  Gift,
  Filter,
  Search,
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"

interface Goal {
  id: string
  title: string
  description: string
  category: "academic" | "personal" | "health" | "career"
  priority: "low" | "medium" | "high"
  targetDate: Date
  progress: number
  milestones: string[]
  completedMilestones: number
  status: "active" | "completed" | "paused"
  createdAt: Date
}

const categoryColors = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  personal: "bg-green-100 text-green-800 border-green-200",
  health: "bg-pink-100 text-pink-800 border-pink-200",
  career: "bg-purple-100 text-purple-800 border-purple-200",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

const goalTemplates = [
  {
    title: "Improve Academic Performance",
    description: "Boost your grades and academic standing",
    category: "academic" as const,
    milestones: [
      "Complete all assignments on time",
      "Study 2 hours daily",
      "Attend all classes",
      "Achieve target grade",
    ],
  },
  {
    title: "Build Healthy Habits",
    description: "Develop sustainable healthy lifestyle habits",
    category: "health" as const,
    milestones: [
      "Exercise 3 times per week",
      "Drink 8 glasses of water daily",
      "Sleep 8 hours nightly",
      "Eat balanced meals",
    ],
  },
  {
    title: "Learn New Skill",
    description: "Master a new skill or hobby",
    category: "personal" as const,
    milestones: ["Research and choose skill", "Find learning resources", "Practice daily", "Complete first project"],
  },
  {
    title: "Career Development",
    description: "Advance your career prospects",
    category: "career" as const,
    milestones: ["Update resume", "Build portfolio", "Network with professionals", "Apply for opportunities"],
  },
]

const motivationalContent = {
  quotes: [
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "The only impossible journey is the one you never begin.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
  ],
  tips: [
    "Break large goals into smaller, manageable milestones",
    "Set specific deadlines to create urgency",
    "Celebrate small wins along the way",
    "Review and adjust your goals regularly",
    "Share your goals with others for accountability",
  ],
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [currentQuote, setCurrentQuote] = useState("")
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "academic" as const,
    priority: "medium" as const,
    targetDate: undefined as Date | undefined,
    milestones: [""],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentTip, setCurrentTip] = useState("")

  useEffect(() => {
    const savedGoals = localStorage.getItem("student-goals")
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        targetDate: new Date(goal.targetDate),
      }))
      setGoals(parsedGoals)
    } else {
      const sampleGoals: Goal[] = [
        {
          id: "1",
          title: "Improve Math Grade to A",
          description: "Focus on algebra and geometry to achieve an A grade this semester",
          category: "academic",
          priority: "high",
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          progress: 65,
          milestones: ["Complete practice tests", "Study with tutor", "Review all chapters", "Take final exam"],
          completedMilestones: 2,
          status: "active",
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "Read 12 Books This Year",
          description: "Develop a reading habit by reading one book per month",
          category: "personal",
          priority: "medium",
          targetDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
          progress: 33,
          milestones: ["Read 3 books", "Read 6 books", "Read 9 books", "Read 12 books"],
          completedMilestones: 1,
          status: "active",
          createdAt: new Date(),
        },
      ]
      setGoals(sampleGoals)
    }

    setCurrentQuote(motivationalContent.quotes[Math.floor(Math.random() * motivationalContent.quotes.length)])
    setCurrentTip(motivationalContent.tips[Math.floor(Math.random() * motivationalContent.tips.length)])
  }, [])

  useEffect(() => {
    localStorage.setItem("student-goals", JSON.stringify(goals))
  }, [goals])

  const addMilestone = () => {
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, ""],
    })
  }

  const updateMilestone = (index: number, value: string) => {
    const updatedMilestones = [...newGoal.milestones]
    updatedMilestones[index] = value
    setNewGoal({
      ...newGoal,
      milestones: updatedMilestones,
    })
  }

  const removeMilestone = (index: number) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter((_, i) => i !== index),
    })
  }

  const addGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetDate) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetDate: newGoal.targetDate,
      progress: 0,
      milestones: newGoal.milestones.filter((m) => m.trim()),
      completedMilestones: 0,
      status: "active",
      createdAt: new Date(),
    }

    setGoals([goal, ...goals])
    resetForm()
    setIsAddDialogOpen(false)
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 3000)
  }

  const updateGoal = () => {
    if (!editingGoal || !newGoal.title.trim() || !newGoal.targetDate) return

    setGoals(
      goals.map((goal) =>
        goal.id === editingGoal.id
          ? {
              ...goal,
              title: newGoal.title,
              description: newGoal.description,
              category: newGoal.category,
              priority: newGoal.priority,
              targetDate: newGoal.targetDate,
              milestones: newGoal.milestones.filter((m) => m.trim()),
            }
          : goal,
      ),
    )

    setEditingGoal(null)
    resetForm()
    setIsAddDialogOpen(false)
  }

  const updateProgress = (goalId: string, newProgress: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : goal.status,
            }
          : goal,
      ),
    )
  }

  const toggleMilestone = (goalId: string, milestoneIndex: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const isCompleting = milestoneIndex >= goal.completedMilestones
          const newCompletedMilestones = isCompleting
            ? goal.completedMilestones + 1
            : Math.max(0, goal.completedMilestones - 1)

          const newProgress = Math.round((newCompletedMilestones / goal.milestones.length) * 100)

          return {
            ...goal,
            completedMilestones: newCompletedMilestones,
            progress: newProgress,
            status: newProgress >= 100 ? "completed" : goal.status,
          }
        }
        return goal
      }),
    )
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate,
      milestones: [...goal.milestones],
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setNewGoal({
      title: "",
      description: "",
      category: "academic",
      priority: "medium",
      targetDate: undefined,
      milestones: [""],
    })
  }

  const selectTemplate = (template: any) => {
    setNewGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: "medium",
      targetDate: undefined,
      milestones: [...template.milestones],
    })
    setSelectedTemplate(template)
    setShowTemplates(false)
    setIsAddDialogOpen(true)
  }

  const activeGoals = goals.filter((goal) => goal.status === "active")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const averageProgress =
    goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Goals Tracker
                </h1>
                {showCelebration && (
                  <div className="animate-bounce">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                )}
              </div>
              <p className="text-gray-600">Set, track, and achieve your dreams with purpose</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="career">Career</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Templates
                </Button>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Goal title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={newGoal.category}
                          onValueChange={(value: any) => setNewGoal({ ...newGoal, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="career">Career</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={newGoal.priority}
                          onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newGoal.targetDate ? format(newGoal.targetDate, "PPP") : "Set target date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newGoal.targetDate}
                            onSelect={(date) => setNewGoal({ ...newGoal, targetDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Milestones</label>
                        {newGoal.milestones.map((milestone, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Milestone ${index + 1}`}
                              value={milestone}
                              onChange={(e) => updateMilestone(index, e.target.value)}
                            />
                            {newGoal.milestones.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                                className="px-3"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addMilestone} className="w-full bg-transparent">
                          Add Milestone
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={editingGoal ? updateGoal : addGoal} className="flex-1">
                          {editingGoal ? "Update Goal" : "Add Goal"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false)
                            setEditingGoal(null)
                            resetForm()
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Tabs defaultValue="quote" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
              <TabsTrigger
                value="quote"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                Daily Quote
              </TabsTrigger>
              <TabsTrigger
                value="tip"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                Pro Tip
              </TabsTrigger>
            </TabsList>
            <TabsContent value="quote">
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-3 text-yellow-300 animate-pulse" />
                  <p className="text-lg font-medium italic">"{currentQuote}"</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tip">
              <Card className="bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                  <p className="text-lg font-medium">{currentTip}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Goals</p>
                    <p className="text-3xl font-bold text-purple-600">{goals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Goals</p>
                    <p className="text-3xl font-bold text-blue-600">{activeGoals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">In progress</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Flame className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Achieved</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Avg Progress</p>
                    <p className="text-3xl font-bold text-orange-600">{averageProgress}%</p>
                    <p className="text-xs text-gray-500 mt-1">Overall</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {completedGoals.length > 0 && (
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Achievement Unlocked!</h3>
                      <p className="text-white/90">
                        You've completed {completedGoals.length} goal{completedGoals.length > 1 ? "s" : ""}. Keep up the
                        great work!
                      </p>
                    </div>
                  </div>
                  <Gift className="w-12 h-12 text-white/70" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {filteredGoals.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {goals.length === 0 ? "No goals yet" : "No goals match your filters"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {goals.length === 0
                      ? "Set your first goal to get started on your journey!"
                      : "Try adjusting your search or filter criteria"}
                  </p>
                  {goals.length === 0 && (
                    <Button
                      onClick={() => setShowTemplates(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className="bg-white/70 backdrop-blur-sm border-0 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200">
                            {goal.category === "academic" && <BookOpen className="w-5 h-5 text-purple-600" />}
                            {goal.category === "personal" && <Heart className="w-5 h-5 text-pink-600" />}
                            {goal.category === "health" && <Zap className="w-5 h-5 text-green-600" />}
                            {goal.category === "career" && <Briefcase className="w-5 h-5 text-blue-600" />}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                          {goal.status === "completed" && (
                            <div className="animate-pulse">
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">{goal.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge
                            className={`${categoryColors[goal.category]} transition-all duration-200 hover:scale-105`}
                          >
                            {goal.category}
                          </Badge>
                          <Badge
                            className={`${priorityColors[goal.priority]} transition-all duration-200 hover:scale-105`}
                          >
                            {goal.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs hover:bg-gray-50 transition-all duration-200">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Due {format(goal.targetDate, "MMM dd, yyyy")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(goal)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-purple-600">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-3 transition-all duration-300" />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Milestones ({goal.completedMilestones}/{goal.milestones.length})
                        </h4>
                        <div className="grid gap-2">
                          {goal.milestones.map((milestone, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={index < goal.completedMilestones}
                                onChange={() => toggleMilestone(goal.id, index)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                              />
                              <span
                                className={`text-sm flex-1 transition-all duration-200 ${
                                  index < goal.completedMilestones
                                    ? "line-through text-gray-500"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                {milestone}
                              </span>
                              {index < goal.completedMilestones && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {goals.length > 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Goal Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round((goals.filter((g) => g.category === "academic").length / goals.length) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Academic Focus</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {goals.filter((g) => g.priority === "high").length}
                    </div>
                    <p className="text-sm text-gray-600">High Priority Goals</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {Math.round(
                        (goals.reduce((sum, goal) => sum + goal.completedMilestones, 0) /
                          Math.max(
                            goals.reduce((sum, goal) => sum + goal.milestones.length, 0),
                            1,
                          )) *
                          100,
                      )}
                      %
                    </div>
                    <p className="text-sm text-gray-600">Milestones Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Goal Templates
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => selectTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        {template.category === "academic" && <BookOpen className="w-5 h-5 text-purple-600" />}
                        {template.category === "personal" && <Heart className="w-5 h-5 text-pink-600" />}
                        {template.category === "health" && <Zap className="w-5 h-5 text-green-600" />}
                        {template.category === "career" && <Briefcase className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <Badge className={categoryColors[template.category]} size="sm">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  )
}
