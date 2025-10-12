"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/student/student-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  Search,
  BookOpen,
  Star,
  Edit3,
  Trash2,
  FileText,
  Bookmark,
  Clock,
  Download,
  Share2,
  Eye,
  EyeOff,
  Grid,
  List,
} from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  category: "academic" | "personal" | "ideas" | "reminders"
  tags: string[]
  isPinned: boolean
  isPrivate: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

const categoryColors = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  personal: "bg-green-100 text-green-800 border-green-200",
  ideas: "bg-purple-100 text-purple-800 border-purple-200",
  reminders: "bg-orange-100 text-orange-800 border-orange-200",
}

const noteColors = [
  { name: "Default", value: "bg-white", class: "bg-white border-gray-200" },
  { name: "Yellow", value: "bg-yellow-50", class: "bg-yellow-50 border-yellow-200" },
  { name: "Blue", value: "bg-blue-50", class: "bg-blue-50 border-blue-200" },
  { name: "Green", value: "bg-green-50", class: "bg-green-50 border-green-200" },
  { name: "Purple", value: "bg-purple-50", class: "bg-purple-50 border-purple-200" },
  { name: "Pink", value: "bg-pink-50", class: "bg-pink-50 border-pink-200" },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [selectedColor, setSelectedColor] = useState("bg-white")
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "academic" as const,
    tags: "",
    isPrivate: false,
  })

  useEffect(() => {
    const savedNotes = localStorage.getItem("student-notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        color: note.color || "bg-white",
        isPrivate: note.isPrivate || false,
      }))
      setNotes(parsedNotes)
    } else {
      const sampleNotes: Note[] = [
        {
          id: "1",
          title: "Math Formulas",
          content: "Quadratic formula: x = (-b ± √(b²-4ac)) / 2a\nPythagorean theorem: a² + b² = c²",
          category: "academic",
          tags: ["math", "formulas", "algebra"],
          isPinned: true,
          isPrivate: false,
          color: "bg-blue-50",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Book Ideas",
          content: "1. The Great Gatsby themes\n2. Character analysis of Jay Gatsby\n3. Symbolism in the green light",
          category: "ideas",
          tags: ["literature", "analysis"],
          isPinned: false,
          isPrivate: false,
          color: "bg-purple-50",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setNotes(sampleNotes)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("student-notes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((note) => note.category === filterCategory)
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

    setFilteredNotes(filtered)
  }, [notes, searchTerm, filterCategory])

  const addNote = () => {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPinned: false,
      isPrivate: newNote.isPrivate,
      color: selectedColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes([note, ...notes])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const updateNote = () => {
    if (!editingNote || !newNote.title.trim()) return

    setNotes(
      notes.map((note) =>
        note.id === editingNote.id
          ? {
              ...note,
              title: newNote.title,
              content: newNote.content,
              category: newNote.category,
              tags: newNote.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              isPrivate: newNote.isPrivate,
              color: selectedColor,
              updatedAt: new Date(),
            }
          : note,
      ),
    )

    setEditingNote(null)
    resetForm()
    setIsAddDialogOpen(false)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const togglePin = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              isPinned: !note.isPinned,
              updatedAt: new Date(),
            }
          : note,
      ),
    )
  }

  const startEdit = (note: Note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(", "),
      isPrivate: note.isPrivate,
    })
    setSelectedColor(note.color)
    setIsAddDialogOpen(true)
  }

  const exportNotes = () => {
    const exportData = {
      notes: filteredNotes,
      exportedAt: new Date().toISOString(),
      totalNotes: filteredNotes.length,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notes-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareNote = async (note: Note) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
    }
  }

  const resetForm = () => {
    setNewNote({
      title: "",
      content: "",
      category: "academic",
      tags: "",
      isPrivate: false,
    })
    setSelectedColor("bg-white")
  }

  const totalNotes = notes.length
  const pinnedNotes = notes.filter((note) => note.isPinned).length
  const privateNotes = notes.filter((note) => note.isPrivate).length
  const recentNotes = notes.filter((note) => {
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)
    return note.updatedAt >= dayAgo
  }).length

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Notes
              </h1>
              <p className="text-gray-600 mt-1">Capture and organize your thoughts and ideas</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={exportNotes}
                variant="outline"
                className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Note title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    />
                    <Textarea
                      placeholder="Write your note content here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={8}
                      className="resize-none transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      <Select
                        value={newNote.category}
                        onValueChange={(value: any) => setNewNote({ ...newNote, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="ideas">Ideas</SelectItem>
                          <SelectItem value="reminders">Reminders</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Tags (comma separated)"
                        value={newNote.tags}
                        onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                        className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Note Color</label>
                        <div className="flex gap-2 flex-wrap">
                          {noteColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setSelectedColor(color.value)}
                              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${color.class} ${
                                selectedColor === color.value ? "ring-2 ring-green-500 ring-offset-2" : ""
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPrivate"
                          checked={newNote.isPrivate}
                          onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="isPrivate" className="text-sm font-medium">
                          Private note
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={editingNote ? updateNote : addNote}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                      >
                        {editingNote ? "Update Note" : "Add Note"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false)
                          setEditingNote(null)
                          resetForm()
                        }}
                        className="hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Notes</p>
                    <p className="text-2xl font-bold text-green-600">{totalNotes}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pinned</p>
                    <p className="text-2xl font-bold text-teal-600">{pinnedNotes}</p>
                  </div>
                  <Bookmark className="w-8 h-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Private</p>
                    <p className="text-2xl font-bold text-purple-600">{privateNotes}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent</p>
                    <p className="text-2xl font-bold text-blue-600">{recentNotes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="ideas">Ideas</SelectItem>
                    <SelectItem value="reminders">Reminders</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {filteredNotes.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No notes found. Create your first note to get started!</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const colorClass = noteColors.find((c) => c.value === note.color)?.class || "bg-white border-gray-200"

                return (
                  <Card
                    key={note.id}
                    className={`${colorClass} backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl group transform hover:scale-105 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <CardContent className={`p-4 ${viewMode === "list" ? "flex-1 flex items-center gap-4" : ""}`}>
                      {viewMode === "list" ? (
                        <>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{note.title}</h3>
                                {note.isPinned && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                )}
                                {note.isPrivate && <EyeOff className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.content}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={categoryColors[note.category]}>{note.category}</Badge>
                              {note.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => shareNote(note)} className="h-8 w-8 p-0">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePin(note.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Star
                                className={`w-4 h-4 ${note.isPinned ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                              />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => startEdit(note)} className="h-8 w-8 p-0">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 line-clamp-1">{note.title}</h3>
                              {note.isPinned && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                              {note.isPrivate && <EyeOff className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button variant="ghost" size="sm" onClick={() => shareNote(note)} className="h-8 w-8 p-0">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePin(note.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Star
                                  className={`w-4 h-4 ${note.isPinned ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                                />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => startEdit(note)} className="h-8 w-8 p-0">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNote(note.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-4 whitespace-pre-wrap">{note.content}</p>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={categoryColors[note.category]}>{note.category}</Badge>
                            {note.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{note.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            Updated {note.updatedAt.toLocaleDateString()} at{" "}
                            {note.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      )}
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
