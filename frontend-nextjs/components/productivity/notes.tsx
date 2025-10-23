"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StickyNote, Plus, Search, Edit3, Trash2, Save, X, Hash, Clock } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  color: string
}

const noteColors = [
  "bg-yellow-100 border-yellow-200 text-yellow-800",
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-green-100 border-green-200 text-green-800",
  "bg-purple-100 border-purple-200 text-purple-800",
  "bg-pink-100 border-pink-200 text-pink-800",
  "bg-orange-100 border-orange-200 text-orange-800",
]

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" })

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("student-notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }))
      setNotes(parsedNotes)
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("student-notes", JSON.stringify(notes))
  }, [notes])

  const createNote = () => {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
    }

    setNotes((prev) => [note, ...prev])
    setNewNote({ title: "", content: "", tags: "" })
    setIsCreating(false)
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note)))
    setEditingId(null)
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <StickyNote className="w-5 h-5 mr-2 text-yellow-500" />
          Notes
        </CardTitle>
        <CardDescription>Capture your thoughts and ideas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Create Note Form */}
        {isCreating && (
          <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                className="font-medium"
              />
              <Textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                rows={3}
              />
              <Input
                placeholder="Tags (comma separated)..."
                value={newNote.tags}
                onChange={(e) => setNewNote((prev) => ({ ...prev, tags: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button onClick={createNote} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setNewNote({ title: "", content: "", tags: "" })
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

        {/* Notes Grid */}
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes yet. Create your first note!</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className={`${note.color} hover:shadow-md transition-all duration-200`}>
                <CardContent className="p-4">
                  {editingId === note.id ? (
                    <EditNoteForm
                      note={note}
                      onSave={(updates) => updateNote(note.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => setEditingId(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-black/10"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteNote(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {note.content && <p className="text-xs opacity-80 line-clamp-3">{note.content}</p>}

                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                              <Hash className="w-2 h-2 mr-0.5" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <Clock className="w-3 h-3" />
                        <span>{note.updatedAt.toLocaleDateString()}</span>
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

function EditNoteForm({
  note,
  onSave,
  onCancel,
}: {
  note: Note
  onSave: (updates: Partial<Note>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags.join(", "))

  const handleSave = () => {
    onSave({
      title,
      content,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="space-y-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium text-sm" />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} className="text-xs" />
      <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags..." className="text-xs" />
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
