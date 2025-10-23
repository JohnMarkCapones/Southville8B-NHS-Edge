"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/student/student-layout"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { formatDate } from "@/lib/utils/dateUtils"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, CalendarIcon, Star, Clock, CheckCircle2, Circle, Trash2, Edit3, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface Todo {
  id: string
  title: string
  description: string
  category: "academic" | "personal" | "health" | "work"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  completed: boolean
  createdAt: Date
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  tags: string[]
  subtasks: { id: string; title: string; completed: boolean }[]
}

const categoryColors = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  personal: "bg-green-100 text-green-800 border-green-200",
  health: "bg-pink-100 text-pink-800 border-pink-200",
  work: "bg-purple-100 text-purple-800 border-purple-200",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export default function TodoPage() {
  const { t } = useTranslation()
  // Use reliable localStorage hook
  const [todos, setTodos] = useLocalStorage<Todo[]>("student-todos-v2", [])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created")
  const [showCompleted, setShowCompleted] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "academic" as const,
    priority: "medium" as const,
    dueDate: undefined as Date | undefined,
    estimatedTime: 30,
    tags: "",
    subtasks: [] as { id: string; title: string; completed: boolean }[],
  })

  // Initialize with sample data only if no todos exist
  useEffect(() => {
    if (todos.length === 0) {
      const sampleTodos: Todo[] = [
        {
          id: "1",
          title: "Complete Math Assignment",
          description: "Finish algebra problems 1-20",
          category: "academic",
          priority: "high",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          completed: false,
          createdAt: new Date(),
          estimatedTime: 60,
          actualTime: 0,
          tags: ["math", "homework"],
          subtasks: [
            { id: "1a", title: "Problems 1-10", completed: true },
            { id: "1b", title: "Problems 11-20", completed: false },
          ],
        },
        {
          id: "2",
          title: "Read Science Chapter",
          description: "Read chapter 5 on photosynthesis",
          category: "academic",
          priority: "medium",
          completed: true,
          createdAt: new Date(),
          estimatedTime: 45,
          actualTime: 50,
          tags: ["science", "reading"],
          subtasks: [],
        },
        {
          id: "3",
          title: "Exercise for 30 minutes",
          description: "Go for a run or do home workout",
          category: "health",
          priority: "medium",
          completed: false,
          createdAt: new Date(),
          estimatedTime: 30,
          actualTime: 0,
          tags: ["fitness", "health"],
          subtasks: [],
        },
      ]
      setTodos(sampleTodos)
    } else {
      // Ensure all dates are properly converted to Date objects
      const todosWithProperDates = todos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt instanceof Date ? todo.createdAt : new Date(todo.createdAt),
        dueDate: todo.dueDate ? (todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate)) : undefined,
      }))
      
      // Only update if dates were actually converted
      const needsUpdate = todos.some(todo => 
        !(todo.createdAt instanceof Date) || 
        (todo.dueDate && !(todo.dueDate instanceof Date))
      )
      
      if (needsUpdate) {
        setTodos(todosWithProperDates)
      }
    }
  }, [todos.length, setTodos])

  useEffect(() => {
    let filtered = todos

    if (searchTerm) {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((todo) => todo.category === filterCategory)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((todo) => todo.priority === filterPriority)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((todo) => (filterStatus === "completed" ? todo.completed : !todo.completed))
    }

    if (!showCompleted) {
      filtered = filtered.filter((todo) => !todo.completed)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.getTime() - b.dueDate.getTime()
        case "created":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    setFilteredTodos(filtered)
  }, [todos, searchTerm, filterCategory, filterPriority, filterStatus, showCompleted, sortBy])

  const addTodo = () => {
    if (!newTodo.title.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      category: newTodo.category,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate,
      completed: false,
      createdAt: new Date(),
      estimatedTime: newTodo.estimatedTime,
      actualTime: 0,
      tags: newTodo.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      subtasks: newTodo.subtasks,
    }

    setTodos([todo, ...todos])
    setNewTodo({
      title: "",
      description: "",
      category: "academic",
      priority: "medium",
      dueDate: undefined,
      estimatedTime: 30,
      tags: "",
      subtasks: [],
    })
    setIsAddDialogOpen(false)
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
              ),
            }
          : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate,
      estimatedTime: todo.estimatedTime || 30,
      tags: todo.tags.join(", "),
      subtasks: todo.subtasks,
    })
    setIsAddDialogOpen(true)
  }

  const updateTodo = () => {
    if (!editingTodo || !newTodo.title.trim()) return

    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id
          ? {
              ...todo,
              title: newTodo.title,
              description: newTodo.description,
              category: newTodo.category,
              priority: newTodo.priority,
              dueDate: newTodo.dueDate,
              estimatedTime: newTodo.estimatedTime,
              tags: newTodo.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              subtasks: newTodo.subtasks,
            }
          : todo,
      ),
    )

    setEditingTodo(null)
    setNewTodo({
      title: "",
      description: "",
      category: "academic",
      priority: "medium",
      dueDate: undefined,
      estimatedTime: 30,
      tags: "",
      subtasks: [],
    })
    setIsAddDialogOpen(false)
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const pendingCount = todos.filter((todo) => !todo.completed).length
  const highPriorityCount = todos.filter((todo) => todo.priority === "high" && !todo.completed).length
  const totalEstimatedTime = todos.reduce((acc, todo) => acc + (todo.estimatedTime || 0), 0)
  const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0
  const overdueCount = todos.filter((todo) => !todo.completed && todo.dueDate && todo.dueDate < new Date()).length

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('productivity.todo.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('student.readyToAchieve')}</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('productivity.todo.addTask')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTodo ? t('productivity.todo.editTask') : t('productivity.todo.addTask')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t('productivity.todo.taskTitle')}
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                  <Textarea
                    placeholder={t('productivity.todo.taskDescription')}
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    rows={3}
                    className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={newTodo.category}
                      onValueChange={(value: any) => setNewTodo({ ...newTodo, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value: any) => setNewTodo({ ...newTodo, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('productivity.todo.low')}</SelectItem>
                        <SelectItem value="medium">{t('productivity.todo.medium')}</SelectItem>
                        <SelectItem value="high">{t('productivity.todo.high')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estimated Time (minutes)</label>
                      <Input
                        type="number"
                        value={newTodo.estimatedTime}
                        onChange={(e) => setNewTodo({ ...newTodo, estimatedTime: Number(e.target.value) })}
                        min="5"
                        max="480"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tags</label>
                      <Input
                        placeholder="work, urgent, etc."
                        value={newTodo.tags}
                        onChange={(e) => setNewTodo({ ...newTodo, tags: e.target.value })}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent hover:bg-gray-50 transition-all duration-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTodo.dueDate ? format(newTodo.dueDate, "PPP") : t('productivity.todo.dueDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTodo.dueDate}
                        onSelect={(date) => setNewTodo({ ...newTodo, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-2">
                    <Button
                      onClick={editingTodo ? updateTodo : addTodo}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      {editingTodo ? t('productivity.todo.editTask') : t('productivity.todo.addTask')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setEditingTodo(null)
                        setNewTodo({
                          title: "",
                          description: "",
                          category: "academic",
                          priority: "medium",
                          dueDate: undefined,
                          estimatedTime: 30,
                          tags: "",
                          subtasks: [],
                        })
                      }}
                      className="hover:bg-gray-50 transition-all duration-200"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
                  </div>
                  <Star className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {completedCount}/{todos.length} tasks
                </Badge>
              </div>
              <Progress value={completionRate} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Total estimated time: {Math.round(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
                </span>
                {overdueCount > 0 && <span className="text-red-600 font-medium">{overdueCount} overdue</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('productivity.todo.searchTasks')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Created Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks found. Add your first task to get started!</p>
                </CardContent>
              </Card>
            ) : (
              filteredTodos.map((todo) => {
                const subtaskProgress =
                  todo.subtasks.length > 0
                    ? (todo.subtasks.filter((st) => st.completed).length / todo.subtasks.length) * 100
                    : 0

                return (
                  <Card
                    key={todo.id}
                    className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                      todo.completed ? "opacity-75" : ""
                    } ${todo.priority === "high" && !todo.completed ? "ring-2 ring-red-200" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-1 transition-all duration-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold transition-all duration-200 ${
                                  todo.completed ? "line-through text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {todo.title}
                              </h3>
                              {todo.description && (
                                <p
                                  className={`text-sm mt-1 transition-all duration-200 ${
                                    todo.completed ? "line-through text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {todo.description}
                                </p>
                              )}

                              {todo.subtasks.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Subtasks:</span>
                                    <Progress value={subtaskProgress} className="h-1 flex-1" />
                                    <span className="text-xs text-gray-500">
                                      {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
                                    </span>
                                  </div>
                                  <div className="space-y-1 ml-4">
                                    {todo.subtasks.map((subtask) => (
                                      <div key={subtask.id} className="flex items-center gap-2">
                                        <Checkbox
                                          checked={subtask.completed}
                                          onCheckedChange={() => toggleSubtask(todo.id, subtask.id)}
                                          className="h-3 w-3"
                                        />
                                        <span
                                          className={`text-xs ${subtask.completed ? "line-through text-gray-400" : "text-gray-600"}`}
                                        >
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge className={categoryColors[todo.category]}>{todo.category}</Badge>
                                <Badge className={priorityColors[todo.priority]}>{todo.priority} priority</Badge>
                                {todo.estimatedTime && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {todo.estimatedTime}m
                                  </Badge>
                                )}
                                {todo.dueDate && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      todo.dueDate < new Date() && !todo.completed
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : ""
                                    }`}
                                  >
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {formatDate(todo.dueDate, { month: "short", day: "2-digit" })}
                                  </Badge>
                                )}
                                {todo.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button variant="ghost" size="sm" onClick={() => startEdit(todo)} className="h-8 w-8 p-0">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTodo(todo.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
