"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Plus, Edit3, Trash2, Save, X, Calendar, Flag } from "lucide-react"

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  category: string
}

const priorityColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
}

const categories = ["Personal", "Study", "Projects", "Assignments", "Other"]

export function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
    category: "Study",
  })

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("student-todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }))
      setTodos(parsedTodos)
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem("student-todos", JSON.stringify(todos))
  }, [todos])

  const createTodo = () => {
    if (!newTodo.title.trim()) return

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: newTodo.category,
    }

    setTodos((prev) => [todo, ...prev])
    setNewTodo({ title: "", description: "", priority: "medium", dueDate: "", category: "Study" })
    setIsCreating(false)
  }

  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo)))
    setEditingId(null)
  }

  const toggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date() } : todo)),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const filteredTodos = todos.filter((todo) => {
    const statusMatch =
      filter === "all" || (filter === "pending" && !todo.completed) || (filter === "completed" && todo.completed)

    const categoryMatch = categoryFilter === "all" || todo.category === categoryFilter

    return statusMatch && categoryMatch
  })

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
            Todo List
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount} ({completionRate}%)
          </Badge>
        </CardTitle>
        <CardDescription>Organize your tasks and stay productive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {["all", "pending", "completed"].map((filterType) => (
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Add Todo Button */}
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Task
        </Button>

        {/* Create Todo Form */}
        {isCreating && (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Task title..."
                value={newTodo.title}
                onChange={(e) => setNewTodo((prev) => ({ ...prev, title: e.target.value }))}
                className="font-medium"
              />
              <Input
                placeholder="Description (optional)..."
                value={newTodo.description}
                onChange={(e) => setNewTodo((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo((prev) => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={newTodo.category}
                  onChange={(e) => setNewTodo((prev) => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={createTodo} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setNewTodo({ title: "", description: "", priority: "medium", dueDate: "", category: "Study" })
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

        {/* Todo List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tasks found. Add your first task!</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  todo.completed ? "opacity-60 bg-gray-50" : "bg-white"
                }`}
              >
                <CardContent className="p-3">
                  {editingId === todo.id ? (
                    <EditTodoForm
                      todo={todo}
                      onSave={(updates) => updateTodo(todo.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleComplete(todo.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4
                                className={`font-medium text-sm ${
                                  todo.completed ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {todo.title}
                              </h4>
                              {todo.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{todo.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                onClick={() => setEditingId(todo.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => deleteTodo(todo.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs px-2 py-0 ${priorityColors[todo.priority]}`}>
                              <Flag className="w-2 h-2 mr-1" />
                              {todo.priority}
                            </Badge>

                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              {todo.category}
                            </Badge>

                            {todo.dueDate && (
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0 ${
                                  todo.dueDate < new Date() && !todo.completed
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                              >
                                <Calendar className="w-2 h-2 mr-1" />
                                {todo.dueDate.toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
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

function EditTodoForm({
  todo,
  onSave,
  onCancel,
}: {
  todo: TodoItem
  onSave: (updates: Partial<TodoItem>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || "")
  const [priority, setPriority] = useState(todo.priority)
  const [category, setCategory] = useState(todo.category)
  const [dueDate, setDueDate] = useState(todo.dueDate ? todo.dueDate.toISOString().split("T")[0] : "")

  const handleSave = () => {
    onSave({
      title,
      description,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
  }

  return (
    <div className="space-y-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium text-sm" />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        className="text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="px-2 py-1 text-xs border rounded-md bg-background"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-1 text-xs border rounded-md bg-background"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-xs" />
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
