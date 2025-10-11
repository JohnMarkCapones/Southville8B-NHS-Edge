"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Edit3, Trash2, Save, X, Calendar, CheckCircle2 } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  createdAt: Date
  updatedAt: Date
  completed: boolean
  priority: "low" | "medium" | "high"
}

const goalCategories = ["Academic", "Personal", "Health", "Skills", "Projects", "Other"]

const priorityColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Academic",
    targetValue: 0,
    unit: "hours",
    deadline: "",
    priority: "medium" as const,
  })

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("student-goals")
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        deadline: new Date(goal.deadline),
      }))
      setGoals(parsedGoals)
    }
  }, [])

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem("student-goals", JSON.stringify(goals))
  }, [goals])

  const createGoal = () => {
    if (!newGoal.title.trim() || !newGoal.targetValue || !newGoal.deadline) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      deadline: new Date(newGoal.deadline),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      priority: newGoal.priority,
    }

    setGoals((prev) => [goal, ...prev])
    setNewGoal({
      title: "",
      description: "",
      category: "Academic",
      targetValue: 0,
      unit: "hours",
      deadline: "",
      priority: "medium",
    })
    setIsCreating(false)
  }

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const updatedGoal = { ...goal, ...updates, updatedAt: new Date() }
          // Auto-complete if target reached
          if (updatedGoal.currentValue >= updatedGoal.targetValue && !updatedGoal.completed) {
            updatedGoal.completed = true
          }
          return updatedGoal
        }
        return goal
      }),
    )
    setEditingId(null)
  }

  const updateProgress = (id: string, newValue: number) => {
    updateGoal(id, { currentValue: Math.max(0, newValue) })
  }

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  const filteredGoals = goals.filter((goal) => {
    const statusMatch =
      filter === "all" || (filter === "active" && !goal.completed) || (filter === "completed" && goal.completed)

    const categoryMatch = categoryFilter === "all" || goal.category === categoryFilter

    return statusMatch && categoryMatch
  })

  const completedGoals = goals.filter((goal) => goal.completed).length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Goal Tracker
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedGoals}/{totalGoals} ({completionRate}%)
          </Badge>
        </CardTitle>
        <CardDescription>Set and track your academic and personal goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{totalGoals}</div>
              <div className="text-xs text-blue-600">Total Goals</div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedGoals}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{completionRate}%</div>
              <div className="text-xs text-purple-600">Success Rate</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {["all", "active", "completed"].map((filterType) => (
              <Button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                className="text-xs capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            {goalCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Add Goal Button */}
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Set New Goal
        </Button>

        {/* Create Goal Form */}
        {isCreating && (
          <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Goal title..."
                value={newGoal.title}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                className="font-medium"
              />
              <Textarea
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                >
                  {goalCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Target value"
                  value={newGoal.targetValue || ""}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, targetValue: Number(e.target.value) }))}
                />
                <Input
                  placeholder="Unit (hours, books, etc.)"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={createGoal} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-1" />
                  Create Goal
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setNewGoal({
                      title: "",
                      description: "",
                      category: "Academic",
                      targetValue: 0,
                      unit: "hours",
                      deadline: "",
                      priority: "medium",
                    })
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No goals found. Set your first goal!</p>
            </div>
          ) : (
            filteredGoals.map((goal) => (
              <Card
                key={goal.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  goal.completed ? "bg-green-50 border-green-200" : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  {editingId === goal.id ? (
                    <EditGoalForm
                      goal={goal}
                      onSave={(updates) => updateGoal(goal.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium text-sm ${goal.completed ? "text-green-700" : ""}`}>
                              {goal.title}
                            </h4>
                            {goal.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </div>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            onClick={() => setEditingId(goal.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-purple-100"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteGoal(goal.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                          <span className="font-medium">{Math.round(getProgressPercentage(goal))}%</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(goal)}
                          className={`h-2 ${goal.completed ? "bg-green-100" : ""}`}
                        />
                      </div>

                      {/* Progress Controls */}
                      {!goal.completed && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => updateProgress(goal.id, goal.currentValue - 1)}
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 text-xs"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={goal.currentValue}
                            onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                            className="h-6 text-xs text-center flex-1"
                            min="0"
                            max={goal.targetValue}
                          />
                          <Button
                            onClick={() => updateProgress(goal.id, goal.currentValue + 1)}
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 text-xs"
                          >
                            +
                          </Button>
                        </div>
                      )}

                      {/* Goal Metadata */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs px-2 py-0 ${priorityColors[goal.priority]}`}>
                          {goal.priority}
                        </Badge>

                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {goal.category}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0 ${
                            getDaysUntilDeadline(goal.deadline) < 0 && !goal.completed
                              ? "bg-red-50 text-red-600 border-red-200"
                              : getDaysUntilDeadline(goal.deadline) <= 7 && !goal.completed
                                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          <Calendar className="w-2 h-2 mr-1" />
                          {getDaysUntilDeadline(goal.deadline) < 0
                            ? "Overdue"
                            : `${getDaysUntilDeadline(goal.deadline)} days left`}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EditGoalForm({
  goal,
  onSave,
  onCancel,
}: {
  goal: Goal
  onSave: (updates: Partial<Goal>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description)
  const [category, setCategory] = useState(goal.category)
  const [priority, setPriority] = useState(goal.priority)
  const [targetValue, setTargetValue] = useState(goal.targetValue)
  const [unit, setUnit] = useState(goal.unit)
  const [deadline, setDeadline] = useState(goal.deadline.toISOString().split("T")[0])

  const handleSave = () => {
    onSave({
      title,
      description,
      category,
      priority,
      targetValue,
      unit,
      deadline: new Date(deadline),
    })
  }

  return (
    <div className="space-y-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium text-sm" />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        rows={2}
        className="text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-1 text-xs border rounded-md bg-background"
        >
          {goalCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="px-2 py-1 text-xs border rounded-md bg-background"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          className="text-xs"
        />
        <Input value={unit} onChange={(e) => setUnit(e.target.value)} className="text-xs" />
      </div>
      <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="text-xs" />
      <div className="flex gap-1">
        <Button onClick={handleSave} size="sm" className="h-6 text-xs bg-green-500 hover:bg-green-600">
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="h-6 text-xs bg-transparent">
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
