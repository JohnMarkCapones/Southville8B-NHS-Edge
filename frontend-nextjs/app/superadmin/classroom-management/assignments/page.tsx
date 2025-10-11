"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Trash2,
  X,
  GripVertical,
  Copy,
  Edit,
  Maximize2,
  Minimize2,
  Keyboard,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  FolderOpen,
  BookTemplate,
  Calendar,
  Clock,
  AlertTriangle,
  Map,
  ArrowDown,
} from "lucide-react"

interface TimeSlot {
  id: string
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  subject: string
  teacher: string
  section: string
}

interface Classroom {
  id: string
  name: string
  capacity: number
  equipment: string
  status: "available" | "in-use" | "maintenance"
  schedule: TimeSlot[]
  section?: string // e.g., "Grade 8-A", "Grade 9-B"
  adviser?: string // Teacher who governs this section
}

interface Floor {
  id: string
  number: number
  classrooms: Classroom[]
}

interface Building {
  id: string
  name: string
  floors: Floor[]
}

// Add interface for BuildingTemplate
interface BuildingTemplate {
  id: string
  name: string
  description: string
  building: Building
  createdAt: string
}

interface ConflictInfo {
  classroomId: string
  classroomName: string
  conflicts: {
    slot1: TimeSlot
    slot2: TimeSlot
  }[]
}

export default function ClassAssignmentsPage() {
  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: "1",
      name: "Main Building",
      floors: [
        {
          id: "f1",
          number: 1,
          classrooms: [
            {
              id: "c1",
              name: "Room 101",
              capacity: 30,
              equipment: "Projector, Whiteboard",
              status: "available",
              schedule: [], // Added empty schedule
            },
            {
              id: "c2",
              name: "Room 102",
              capacity: 25,
              equipment: "Computers, Projector",
              status: "in-use",
              schedule: [], // Added empty schedule
            },
          ],
        },
        {
          id: "f2",
          number: 2,
          classrooms: [
            {
              id: "c3",
              name: "Room 201",
              capacity: 35,
              equipment: "Lab Equipment",
              status: "available",
              schedule: [], // Added empty schedule
            },
          ],
        },
      ],
    },
  ])

  const [selectedClassroom, setSelectedClassroom] = useState<{
    buildingId: string
    floorId: string
    classroom: Classroom
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBuildingName, setNewBuildingName] = useState("")
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false)
  const [draggedClassroom, setDraggedClassroom] = useState<{
    buildingId: string
    floorId: string
    classroom: Classroom
  } | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{
    buildingId: string
    floorId: string
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: "classroom" | "floor" | "building"
    buildingId: string
    floorId?: string
    classroom?: Classroom
  } | null>(null)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set())
  const [focusedBuilding, setFocusedBuilding] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set())

  const [templates, setTemplates] = useState<BuildingTemplate[]>([])
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isLoadTemplateDialogOpen, setIsLoadTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [selectedBuildingForTemplate, setSelectedBuildingForTemplate] = useState<string | null>(null)

  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])
  const [showConflictsDialog, setShowConflictsDialog] = useState(false)

  const [showMinimap, setShowMinimap] = useState(true)
  const [currentBuildingInView, setCurrentBuildingInView] = useState<string | null>(null)

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "building" | "floor" | "classroom" | "template"
    id: string
    buildingId?: string
    floorId?: string
    name: string
  } | null>(null)

  const detectConflicts = (): ConflictInfo[] => {
    const allConflicts: ConflictInfo[] = []

    buildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.classrooms.forEach((classroom) => {
          const classroomConflicts: { slot1: TimeSlot; slot2: TimeSlot }[] = []

          // Check each time slot against all other time slots
          for (let i = 0; i < classroom.schedule.length; i++) {
            for (let j = i + 1; j < classroom.schedule.length; j++) {
              const slot1 = classroom.schedule[i]
              const slot2 = classroom.schedule[j]

              // Check if slots are on the same day
              if (slot1.day === slot2.day) {
                // Check if time ranges overlap
                const start1 = timeToMinutes(slot1.startTime)
                const end1 = timeToMinutes(slot1.endTime)
                const start2 = timeToMinutes(slot2.startTime)
                const end2 = timeToMinutes(slot2.endTime)

                // Overlap occurs if: start1 < end2 AND start2 < end1
                if (start1 < end2 && start2 < end1) {
                  classroomConflicts.push({ slot1, slot2 })
                }
              }
            }
          }

          if (classroomConflicts.length > 0) {
            allConflicts.push({
              classroomId: classroom.id,
              classroomName: classroom.name,
              conflicts: classroomConflicts,
            })
          }
        })
      })
    })

    return allConflicts
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  useEffect(() => {
    const detectedConflicts = detectConflicts()
    setConflicts(detectedConflicts)
  }, [buildings])

  const hasConflict = (classroomId: string): boolean => {
    return conflicts.some((conflict) => conflict.classroomId === classroomId)
  }

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const animateItem = (id: string) => {
    setAnimatingItems((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setAnimatingItems((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 500)
  }

  useEffect(() => {
    const savedTemplates = localStorage.getItem("buildingTemplates")
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    }
  }, [])

  // Add new building
  const addBuilding = () => {
    if (!newBuildingName.trim()) return
    setIsLoading(true)
    setTimeout(() => {
      const newBuilding: Building = {
        id: Date.now().toString(),
        name: newBuildingName,
        floors: [],
      }
      setBuildings([...buildings, newBuilding])
      setNewBuildingName("")
      setIsAddBuildingOpen(false)
      setIsLoading(false)
      animateItem(newBuilding.id)
      showNotification("success", `Building "${newBuildingName}" created successfully`)
    }, 500)
  }

  const deleteBuilding = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    if (!building) return

    setBuildings(buildings.filter((b) => b.id !== buildingId))
    if (focusedBuilding === buildingId) {
      setFocusedBuilding(null)
    }
    showNotification("success", `Building "${building.name}" deleted`)
    setDeleteConfirmation(null)
  }

  // Add floor to building
  const addFloor = (buildingId: string) => {
    setBuildings(
      buildings.map((building) => {
        if (building.id === buildingId) {
          const newFloor: Floor = {
            id: Date.now().toString(),
            number: building.floors.length + 1,
            classrooms: [],
          }
          animateItem(newFloor.id)
          showNotification("success", `Floor ${newFloor.number} added to ${building.name}`)
          return { ...building, floors: [...building.floors, newFloor] }
        }
        return building
      }),
    )
  }

  const deleteFloor = (buildingId: string, floorId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    const floor = building?.floors.find((f) => f.id === floorId)

    setBuildings(
      buildings.map((building) => {
        if (building.id === buildingId) {
          const updatedFloors = building.floors
            .filter((f) => f.id !== floorId)
            .map((f, index) => ({ ...f, number: index + 1 }))
          return { ...building, floors: updatedFloors }
        }
        return building
      }),
    )
    setCollapsedFloors((prev) => {
      const next = new Set(prev)
      next.delete(floorId)
      return next
    })

    if (floor) {
      showNotification("success", `Floor ${floor.number} deleted`)
    }
    setDeleteConfirmation(null)
  }

  // Add classroom to floor
  const addClassroom = (buildingId: string, floorId: string) => {
    setBuildings(
      buildings.map((building) => {
        if (building.id === buildingId) {
          return {
            ...building,
            floors: building.floors.map((floor) => {
              if (floor.id === floorId) {
                const newClassroom: Classroom = {
                  id: Date.now().toString(),
                  name: `Room ${floor.number}0${floor.classrooms.length + 1}`,
                  capacity: 30,
                  equipment: "Whiteboard",
                  status: "available",
                  schedule: [], // Added empty schedule
                }
                animateItem(newClassroom.id)
                showNotification("success", `${newClassroom.name} added`)
                return {
                  ...floor,
                  classrooms: [...floor.classrooms, newClassroom],
                }
              }
              return floor
            }),
          }
        }
        return building
      }),
    )
  }

  const deleteClassroom = (buildingId: string, floorId: string, classroomId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    const floor = building?.floors.find((f) => f.id === floorId)
    const classroom = floor?.classrooms.find((c) => c.id === classroomId)

    setBuildings(
      buildings.map((building) => {
        if (building.id === buildingId) {
          return {
            ...building,
            floors: building.floors.map((floor) => {
              if (floor.id === floorId) {
                return {
                  ...floor,
                  classrooms: floor.classrooms.filter((c) => c.id !== classroomId),
                }
              }
              return floor
            }),
          }
        }
        return building
      }),
    )

    if (classroom) {
      showNotification("success", `${classroom.name} deleted`)
    }
    setDeleteConfirmation(null)
  }

  // Open classroom details
  const openClassroomDetails = (buildingId: string, floorId: string, classroom: Classroom) => {
    setSelectedClassroom({ buildingId, floorId, classroom })
    setIsModalOpen(true)
  }

  // Update classroom details
  const updateClassroom = (updatedClassroom: Classroom) => {
    if (!selectedClassroom) return
    setIsLoading(true)
    setTimeout(() => {
      setBuildings(
        buildings.map((building) => {
          if (building.id === selectedClassroom.buildingId) {
            return {
              ...building,
              floors: building.floors.map((floor) => {
                if (floor.id === selectedClassroom.floorId) {
                  return {
                    ...floor,
                    classrooms: floor.classrooms.map((c) => (c.id === updatedClassroom.id ? updatedClassroom : c)),
                  }
                }
                return floor
              }),
            }
          }
          return building
        }),
      )
      setIsModalOpen(false)
      setSelectedClassroom(null)
      setIsLoading(false)
      animateItem(updatedClassroom.id)
      showNotification("success", `${updatedClassroom.name} updated successfully`)
    }, 500)
  }

  const handleDragStart = (buildingId: string, floorId: string, classroom: Classroom) => {
    setDraggedClassroom({ buildingId, floorId, classroom })
  }

  const handleDragOver = (e: React.DragEvent, buildingId: string, floorId: string) => {
    e.preventDefault()
    setDragOverTarget({ buildingId, floorId })
  }

  const handleDragLeave = () => {
    setDragOverTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetBuildingId: string, targetFloorId: string) => {
    e.preventDefault()
    if (!draggedClassroom) return

    const targetBuilding = buildings.find((b) => b.id === targetBuildingId)
    const targetFloor = targetBuilding?.floors.find((f) => f.id === targetFloorId)

    // Remove from original location
    setBuildings(
      buildings.map((building) => {
        if (building.id === draggedClassroom.buildingId) {
          return {
            ...building,
            floors: building.floors.map((floor) => {
              if (floor.id === draggedClassroom.floorId) {
                return {
                  ...floor,
                  classrooms: floor.classrooms.filter((c) => c.id !== draggedClassroom.classroom.id),
                }
              }
              return floor
            }),
          }
        }
        return building
      }),
    )

    // Add to new location
    setBuildings((prevBuildings) =>
      prevBuildings.map((building) => {
        if (building.id === targetBuildingId) {
          return {
            ...building,
            floors: building.floors.map((floor) => {
              if (floor.id === targetFloorId) {
                return {
                  ...floor,
                  classrooms: [...floor.classrooms, draggedClassroom.classroom],
                }
              }
              return floor
            }),
          }
        }
        return building
      }),
    )

    animateItem(draggedClassroom.classroom.id)
    showNotification(
      "success",
      `${draggedClassroom.classroom.name} moved to ${targetBuilding?.name} - Floor ${targetFloor?.number}`,
    )

    setDraggedClassroom(null)
    setDragOverTarget(null)
  }

  const getStatusColor = (status: Classroom["status"]) => {
    switch (status) {
      case "available":
        return "bg-emerald-500"
      case "in-use":
        return "bg-amber-500"
      case "maintenance":
        return "bg-red-500"
    }
  }

  const toggleFloorCollapse = (floorId: string) => {
    setCollapsedFloors((prev) => {
      const next = new Set(prev)
      if (next.has(floorId)) {
        next.delete(floorId)
      } else {
        next.add(floorId)
      }
      return next
    })
  }

  const collapseAllFloors = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    if (!building) return
    setCollapsedFloors((prev) => {
      const next = new Set(prev)
      building.floors.forEach((floor) => next.add(floor.id))
      return next
    })
    showNotification("info", "All floors collapsed")
  }

  const expandAllFloors = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    if (!building) return
    setCollapsedFloors((prev) => {
      const next = new Set(prev)
      building.floors.forEach((floor) => next.delete(floor.id))
      return next
    })
    showNotification("info", "All floors expanded")
  }

  const toggleFocusMode = (buildingId: string) => {
    if (focusedBuilding === buildingId) {
      setFocusedBuilding(null)
      showNotification("info", "Focus mode disabled")
    } else {
      const building = buildings.find((b) => b.id === buildingId)
      setFocusedBuilding(buildingId)
      showNotification("info", `Focusing on ${building?.name}`)
    }
  }

  const scrollToBuilding = (buildingId: string) => {
    const element = document.getElementById(`building-${buildingId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      setCurrentBuildingInView(buildingId)
      showNotification("info", `Jumped to ${buildings.find((b) => b.id === buildingId)?.name}`)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const buildingId = entry.target.getAttribute("data-building-id")
            if (buildingId) {
              setCurrentBuildingInView(buildingId)
            }
          }
        })
      },
      { threshold: 0.5 },
    )

    const buildingElements = document.querySelectorAll("[data-building-id]")
    buildingElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [buildings])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard help with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowKeyboardHelp(true)
        return
      }

      // Ctrl/Cmd + B: Add new building
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        setIsAddBuildingOpen(true)
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && focusedBuilding) {
        e.preventDefault()
        setFocusedBuilding(null)
        return
      }

      // Escape: Close all dialogs
      if (e.key === "Escape") {
        setContextMenu(null)
        setIsModalOpen(false)
        setIsAddBuildingOpen(false)
        setIsTemplateDialogOpen(false) // close save template dialog
        setIsLoadTemplateDialogOpen(false) // close load template dialog
        setShowKeyboardHelp(false)
        setShowConflictsDialog(false) // close conflicts dialog
        setDeleteConfirmation(null) // close delete confirmation dialog
        if (focusedBuilding) {
          setFocusedBuilding(null)
        }
        return
      }

      // Delete: Delete selected item (if context menu is open)
      if (e.key === "Delete" && contextMenu) {
        e.preventDefault()
        if (contextMenu.type === "classroom" && contextMenu.classroom) {
          const building = buildings.find((b) => b.id === contextMenu.buildingId)
          const floor = building?.floors.find((f) => f.id === contextMenu.floorId)
          const classroom = floor?.classrooms.find((c) => c.id === contextMenu.classroom!.id)
          if (classroom) {
            setDeleteConfirmation({
              type: "classroom",
              id: classroom.id,
              buildingId: contextMenu.buildingId,
              floorId: contextMenu.floorId,
              name: classroom.name,
            })
          }
        } else if (contextMenu.type === "floor" && contextMenu.floorId) {
          const building = buildings.find((b) => b.id === contextMenu.buildingId)
          const floor = building?.floors.find((f) => f.id === contextMenu.floorId)
          if (floor) {
            setDeleteConfirmation({
              type: "floor",
              id: floor.id,
              buildingId: contextMenu.buildingId,
              name: `Floor ${floor.number}`,
            })
          }
        } else if (contextMenu.type === "building") {
          const building = buildings.find((b) => b.id === contextMenu.buildingId)
          if (building) {
            setDeleteConfirmation({
              type: "building",
              id: building.id,
              name: building.name,
            })
          }
        }
        setContextMenu(null)
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [contextMenu, buildings, focusedBuilding, collapsedFloors, templates]) // Added dependencies

  const saveTemplate = () => {
    if (!templateName.trim() || !selectedBuildingForTemplate) return

    const building = buildings.find((b) => b.id === selectedBuildingForTemplate)
    if (!building) return

    setIsLoading(true)
    setTimeout(() => {
      const newTemplate: BuildingTemplate = {
        id: Date.now().toString(),
        name: templateName,
        description: templateDescription,
        building: JSON.parse(JSON.stringify(building)), // Deep clone
        createdAt: new Date().toISOString(),
      }

      const updatedTemplates = [...templates, newTemplate]
      setTemplates(updatedTemplates)
      localStorage.setItem("buildingTemplates", JSON.stringify(updatedTemplates))

      setTemplateName("")
      setTemplateDescription("")
      setSelectedBuildingForTemplate(null)
      setIsTemplateDialogOpen(false)
      setIsLoading(false)
      showNotification("success", `Template "${newTemplate.name}" saved successfully`)
    }, 500)
  }

  const loadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    setIsLoading(true)
    setTimeout(() => {
      const newBuilding: Building = {
        ...JSON.parse(JSON.stringify(template.building)), // Deep clone
        id: Date.now().toString(),
        name: `${template.building.name} (from template)`,
        floors: template.building.floors.map((floor, floorIndex) => ({
          ...floor,
          id: `${Date.now()}-f${floorIndex}`,
          classrooms: floor.classrooms.map((classroom, classroomIndex) => ({
            ...classroom,
            id: `${Date.now()}-f${floorIndex}-c${classroomIndex}`,
          })),
        })),
      }

      setBuildings([...buildings, newBuilding])
      setIsLoadTemplateDialogOpen(false)
      setIsLoading(false)
      animateItem(newBuilding.id)
      showNotification("success", `Building created from template "${template.name}"`)
    }, 500)
  }

  const deleteTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    const updatedTemplates = templates.filter((t) => t.id !== templateId)
    setTemplates(updatedTemplates)
    localStorage.setItem("buildingTemplates", JSON.stringify(updatedTemplates))
    if (template) {
      showNotification("success", `Template "${template.name}" deleted`)
    }
    setDeleteConfirmation(null)
  }

  const handleClassroomContextMenu = (
    e: React.MouseEvent,
    buildingId: string,
    floorId: string,
    classroom: Classroom,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "classroom",
      buildingId,
      floorId,
      classroom,
    })
  }

  const handleFloorContextMenu = (e: React.MouseEvent, buildingId: string, floorId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "floor",
      buildingId,
      floorId,
    })
  }

  const handleBuildingContextMenu = (e: React.MouseEvent, buildingId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: "building",
      buildingId,
    })
  }

  const duplicateClassroom = (buildingId: string, floorId: string, classroom: Classroom) => {
    setBuildings(
      buildings.map((building) => {
        if (building.id === buildingId) {
          return {
            ...building,
            floors: building.floors.map((floor) => {
              if (floor.id === floorId) {
                const newClassroom: Classroom = {
                  ...classroom,
                  id: Date.now().toString(),
                  name: `${classroom.name} (Copy)`,
                  schedule: [], // Reset schedule for duplicated classroom
                }
                animateItem(newClassroom.id)
                showNotification("success", `${classroom.name} duplicated`)
                return {
                  ...floor,
                  classrooms: [...floor.classrooms, newClassroom],
                }
              }
              return floor
            }),
          }
        }
        return building
      }),
    )
  }

  const displayedBuildings = focusedBuilding ? buildings.filter((b) => b.id === focusedBuilding) : buildings

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border-2 animate-in slide-in-from-top-5 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
          {notification.type === "info" && <AlertCircle className="w-5 h-5 text-blue-600" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {showMinimap && buildings.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-slate-200 p-4 w-72 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Campus Map</h3>
            </div>
            <button
              onClick={() => setShowMinimap(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {buildings.map((building) => {
              const isInView = currentBuildingInView === building.id
              const isFocused = focusedBuilding === building.id
              const hasConflicts = conflicts.some((c) =>
                building.floors.some((f) => f.classrooms.some((cl) => cl.id === c.classroomId)),
              )

              return (
                <button
                  key={building.id}
                  onClick={() => scrollToBuilding(building.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    isInView
                      ? "bg-blue-50 border-blue-400 shadow-lg"
                      : isFocused
                        ? "bg-purple-50 border-purple-400"
                        : "bg-slate-50 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold text-sm ${
                            isInView ? "text-blue-900" : isFocused ? "text-purple-900" : "text-slate-900"
                          }`}
                        >
                          {building.name}
                        </h4>
                        {isInView && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                            In View
                          </span>
                        )}
                        {isFocused && !isInView && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Focused</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-600">{building.floors.length} floors</span>
                        <span className="text-xs text-slate-600">
                          {building.floors.reduce((sum, f) => sum + f.classrooms.length, 0)} rooms
                        </span>
                      </div>
                    </div>
                    {hasConflicts && (
                      <div className="ml-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Mini building visualization */}
                  <div className="mt-2 flex gap-1">
                    {building.floors.slice(0, 5).map((floor, idx) => (
                      <div
                        key={floor.id}
                        className={`flex-1 h-2 rounded-sm ${
                          isInView ? "bg-blue-400" : isFocused ? "bg-purple-400" : "bg-slate-300"
                        }`}
                        title={`Floor ${floor.number}: ${floor.classrooms.length} rooms`}
                      />
                    ))}
                    {building.floors.length > 5 && (
                      <span className="text-xs text-slate-500 ml-1">+{building.floors.length - 5}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">Click a building to jump to it</p>
          </div>
        </div>
      )}

      {!showMinimap && (
        <button
          onClick={() => setShowMinimap(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110"
          title="Show Campus Map"
        >
          <Map className="w-5 h-5" />
        </button>
      )}

      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Building & Classroom Manager</h1>
              <p className="text-slate-600">Manage your campus buildings, floors, and classrooms in 3D view</p>
            </div>
            <div className="flex gap-2">
              {conflicts.length > 0 && (
                <Button
                  onClick={() => setShowConflictsDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50 animate-pulse"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""}
                </Button>
              )}
              <Button onClick={() => setIsLoadTemplateDialogOpen(true)} variant="outline" size="sm" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Load Template
              </Button>
              <Button onClick={() => setShowKeyboardHelp(true)} variant="outline" size="sm" className="gap-2">
                <Keyboard className="w-4 h-4" />
                Shortcuts
              </Button>
            </div>
          </div>
        </div>

        {focusedBuilding && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3">
              <ZoomIn className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Focus Mode Active</p>
                <p className="text-sm text-blue-700">
                  Viewing: {buildings.find((b) => b.id === focusedBuilding)?.name}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setFocusedBuilding(null)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <ZoomOut className="w-4 h-4 mr-2" />
              Exit Focus Mode
              <span className="ml-2 text-xs opacity-70">(Esc)</span>
            </Button>
          </div>
        )}

        {/* Add Building Button */}
        <div className="mb-8">
          <Button onClick={() => setIsAddBuildingOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Add New Building
            <span className="ml-2 text-xs opacity-70">(Ctrl+B)</span>
          </Button>
        </div>

        {/* Buildings */}
        <div className="space-y-12">
          {displayedBuildings.map((building) => (
            <div
              key={building.id}
              id={`building-${building.id}`}
              data-building-id={building.id}
              className={`relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl p-8 border border-slate-200 transition-all duration-500 ${
                animatingItems.has(building.id) ? "animate-in zoom-in-95" : ""
              }`}
              style={{ perspective: "2000px" }}
              onContextMenu={(e) => handleBuildingContextMenu(e, building.id)}
            >
              {/* Building Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{building.name}</h2>
                  <p className="text-slate-600">{building.floors.length} Floor(s)</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setSelectedBuildingForTemplate(building.id)
                      setIsTemplateDialogOpen(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <BookTemplate className="w-4 h-4 mr-2" />
                    Save as Template
                  </Button>
                  <Button
                    onClick={() => collapseAllFloors(building.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Collapse All
                  </Button>
                  <Button
                    onClick={() => expandAllFloors(building.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Expand All
                  </Button>
                  {!focusedBuilding && (
                    <Button
                      onClick={() => toggleFocusMode(building.id)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <ZoomIn className="w-4 h-4 mr-2" />
                      Focus
                    </Button>
                  )}
                  <Button
                    onClick={() => addFloor(building.id)}
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Floor
                  </Button>
                  {/* Update delete building to show confirmation */}
                  <Button
                    onClick={() => {
                      const buildingToDelete = buildings.find((b) => b.id === building.id)
                      if (buildingToDelete) {
                        setDeleteConfirmation({
                          type: "building",
                          id: buildingToDelete.id,
                          name: buildingToDelete.name,
                        })
                      }
                    }}
                    variant="outline"
                    size="icon"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                {building.floors.length > 0 && (
                  <div className="flex justify-center mb-0">
                    <div className="relative w-full max-w-4xl">
                      <div className="relative h-16 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 rounded-t-xl shadow-2xl border-x-4 border-t-4 border-slate-900">
                        {/* Roof tiles texture */}
                        <div
                          className="absolute inset-0 opacity-30 rounded-t-xl"
                          style={{
                            backgroundImage: `
                              repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(0,0,0,0.4) 30px, rgba(0,0,0,0.4) 31px),
                              repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 9px)
                            `,
                          }}
                        />
                        {/* Roof edge highlight */}
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 shadow-inner" />
                        {/* Parapet walls */}
                        <div className="absolute top-2 left-0 w-full h-3 border-t-2 border-slate-900/50" />
                        {/* Roof drainage pipes */}
                        <div className="absolute bottom-0 left-12 w-4 h-6 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-md shadow-lg" />
                        <div className="absolute bottom-0 right-12 w-4 h-6 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-md shadow-lg" />
                        {/* Ventilation units */}
                        <div className="absolute top-4 left-1/4 w-8 h-6 bg-slate-800 rounded border border-slate-900 shadow-md" />
                        <div className="absolute top-4 right-1/4 w-8 h-6 bg-slate-800 rounded border border-slate-900 shadow-md" />
                        {/* Building name plate with enhanced styling */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-2 rounded-lg border-2 border-amber-600 shadow-2xl">
                            <span className="text-amber-400 text-lg font-bold tracking-wider drop-shadow-lg">
                              {building.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-0">
                  {[...building.floors].reverse().map((floor, index) => {
                    const isCollapsed = collapsedFloors.has(floor.id)

                    return (
                      <div
                        key={floor.id}
                        className={`relative transition-all duration-300 ${
                          animatingItems.has(floor.id) ? "animate-in slide-in-from-left-5" : ""
                        }`}
                      >
                        <div className="relative overflow-hidden border-x-4 border-slate-400 shadow-lg">
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(135deg, #F5F1E8 0%, #EDE7DC 25%, #F8F4EB 50%, #EDE7DC 75%, #F5F1E8 100%)",
                            }}
                          />

                          {/* Enhanced brick texture with mortar lines */}
                          <div
                            className="absolute inset-0 opacity-15 pointer-events-none"
                            style={{
                              backgroundImage: `
                                repeating-linear-gradient(0deg, #8B7355 0px, #8B7355 1px, transparent 1px, transparent 22px),
                                repeating-linear-gradient(90deg, #8B7355 0px, #8B7355 1px, transparent 1px, transparent 45px),
                                repeating-linear-gradient(90deg, transparent 0px, transparent 22px, #8B7355 22px, #8B7355 23px, transparent 23px, transparent 45px),
                                repeating-linear-gradient(45deg, rgba(139,115,85,0.1) 0px, rgba(139,115,85,0.1) 2px, transparent 2px, transparent 4px)
                              `,
                            }}
                          />

                          {/* Wall shadows for depth */}
                          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
                          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

                          {/* Floor Header - compact and clean */}
                          <div
                            className="relative flex items-center justify-between bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white px-6 py-2 border-b-2 border-slate-800 cursor-pointer hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 transition-all"
                            onContextMenu={(e) => handleFloorContextMenu(e, building.id, floor.id)}
                            onClick={() => toggleFloorCollapse(floor.id)}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                className="hover:bg-slate-500/50 rounded p-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFloorCollapse(floor.id)
                                }}
                              >
                                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                              </button>
                              <span className="text-base font-bold">Floor {floor.number}</span>
                              <span className="text-xs text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded-full">
                                {floor.classrooms.length} Rooms
                              </span>

                              {index < building.floors.length - 1 && (
                                <div className="flex items-center gap-2 ml-4">
                                  {/* Stairs icon */}
                                  <div className="flex items-center gap-0.5 bg-slate-800/70 px-2 py-1 rounded">
                                    <div className="w-1 h-1 bg-slate-400" />
                                    <div className="w-1 h-1.5 bg-slate-400" />
                                    <div className="w-1 h-2 bg-slate-400" />
                                    <ArrowDown className="w-3 h-3 text-slate-400 ml-1" />
                                  </div>
                                  {/* Elevator icon */}
                                  <div className="bg-slate-800/70 px-2 py-1 rounded flex items-center gap-1">
                                    <div className="w-3 h-4 border border-slate-400 rounded-sm flex flex-col justify-center items-center">
                                      <ArrowDown className="w-2 h-2 text-slate-400" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                onClick={() => addClassroom(building.id, floor.id)}
                                size="sm"
                                variant="secondary"
                                className="bg-blue-500 hover:bg-blue-600 text-white h-7 text-xs"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Room
                              </Button>
                              {/* Update delete floor to show confirmation */}
                              <Button
                                onClick={() => {
                                  const buildingRef = buildings.find((b) => b.id === building.id)
                                  const floorRef = buildingRef?.floors.find((f) => f.id === floor.id)
                                  if (floorRef) {
                                    setDeleteConfirmation({
                                      type: "floor",
                                      id: floor.id,
                                      buildingId: building.id,
                                      name: `Floor ${floorRef.number}`,
                                    })
                                  }
                                }}
                                size="sm"
                                variant="secondary"
                                className="bg-red-500 hover:bg-red-600 text-white h-7"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div
                              className={`relative overflow-x-auto p-4 bg-gradient-to-b from-slate-50/80 to-slate-100/80 backdrop-blur-sm transition-all ${
                                dragOverTarget?.buildingId === building.id && dragOverTarget?.floorId === floor.id
                                  ? "ring-4 ring-blue-500 ring-inset bg-blue-50/50"
                                  : ""
                              }`}
                              onDragOver={(e) => handleDragOver(e, building.id, floor.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, building.id, floor.id)}
                            >
                              <div className="flex gap-6 min-w-max pb-6">
                                {floor.classrooms.map((classroom) => (
                                  <div
                                    key={classroom.id}
                                    className={`relative group cursor-move transition-all duration-300 ${
                                      animatingItems.has(classroom.id) ? "animate-in zoom-in-95" : ""
                                    }`}
                                    draggable
                                    onDragStart={() => handleDragStart(building.id, floor.id, classroom)}
                                    onContextMenu={(e) =>
                                      handleClassroomContextMenu(e, building.id, floor.id, classroom)
                                    }
                                    style={{
                                      transformStyle: "preserve-3d",
                                      transition: "transform 0.3s ease",
                                      opacity: draggedClassroom?.classroom.id === classroom.id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!draggedClassroom) {
                                        e.currentTarget.style.transform =
                                          "translateY(-10px) rotateX(5deg) rotateY(-5deg) scale(1.02)"
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)"
                                    }}
                                  >
                                    {hasConflict(classroom.id) && (
                                      <div className="absolute -top-3 -right-3 z-30 bg-red-500 text-white rounded-full p-1.5 shadow-lg animate-pulse">
                                        <AlertTriangle className="w-4 h-4" />
                                      </div>
                                    )}

                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                      <GripVertical className="w-4 h-4" />
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteConfirmation({
                                          type: "classroom",
                                          id: classroom.id,
                                          buildingId: building.id,
                                          floorId: floor.id,
                                          name: classroom.name,
                                        })
                                      }}
                                      className="absolute -top-2 -right-2 z-50 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-xl border-2 border-white"
                                      style={{ pointerEvents: "auto" }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>

                                    <div
                                      className="relative w-56 h-40"
                                      style={{
                                        transformStyle: "preserve-3d",
                                      }}
                                      onClick={() => openClassroomDetails(building.id, floor.id, classroom)}
                                    >
                                      {/* Front Face */}
                                      <div
                                        className={`absolute inset-0 rounded-lg shadow-2xl border-4 flex flex-col p-4 ${
                                          hasConflict(classroom.id)
                                            ? "bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-800 ring-2 ring-red-500"
                                            : classroom.status === "available"
                                              ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 border-emerald-800"
                                              : classroom.status === "in-use"
                                                ? "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-800"
                                                : "bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-800"
                                        }`}
                                        style={{
                                          transform: "translateZ(20px)",
                                        }}
                                      >
                                        {/* Classroom Windows - Multiple windows for realism */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-slate-700 rounded shadow-inner overflow-hidden">
                                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
                                          </div>
                                          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-slate-700 rounded shadow-inner overflow-hidden">
                                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                              <div className="bg-gradient-to-br from-sky-200/70 to-blue-300/50" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
                                          </div>
                                        </div>

                                        {/* Classroom Door with realistic details - moved slightly left */}
                                        <div className="absolute bottom-0 left-[45%] -translate-x-1/2 w-12 h-20 bg-gradient-to-b from-amber-900 via-amber-950 to-slate-900 rounded-t-lg border-3 border-slate-900 shadow-xl overflow-hidden">
                                          {/* Wood grain texture */}
                                          <div
                                            className="absolute inset-0 opacity-40"
                                            style={{
                                              backgroundImage: `
                                                repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px),
                                                repeating-linear-gradient(90deg, rgba(139,69,19,0.2) 0px, rgba(101,67,33,0.2) 50%, rgba(139,69,19,0.2) 100%)
                                              `,
                                            }}
                                          />
                                          {/* Door window */}
                                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-sky-100 to-sky-200 border border-slate-900 rounded">
                                            <div className="absolute inset-0.5 border border-slate-700" />
                                            {/* Glass reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent" />
                                          </div>
                                          {/* Door handle */}
                                          <div className="absolute top-1/2 right-1 w-2 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-md" />
                                          {/* Door frame */}
                                          <div className="absolute inset-1 border-2 border-amber-950/50 rounded-md" />
                                          {/* Door panels */}
                                          <div className="absolute bottom-2 left-2 right-2 h-8 border border-amber-950/30 rounded" />
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-white">
                                          <div className="text-center mb-2">
                                            <div className="text-lg font-bold drop-shadow-lg mb-1">
                                              {classroom.name}
                                            </div>
                                          </div>

                                          {/* Section and Adviser Info */}
                                          {classroom.section && (
                                            <div className="text-xs bg-black/40 px-3 py-1.5 rounded-lg mb-1 backdrop-blur-sm border border-white/20">
                                              <div className="font-semibold text-amber-200">
                                                Section: {classroom.section}
                                              </div>
                                            </div>
                                          )}

                                          {classroom.adviser && (
                                            <div className="text-xs bg-black/40 px-3 py-1.5 rounded-lg mb-1 backdrop-blur-sm border border-white/20">
                                              <div className="font-medium">Adviser: {classroom.adviser}</div>
                                            </div>
                                          )}

                                          {classroom.schedule.length > 0 && (
                                            <div className="text-xs opacity-95 bg-black/30 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                                              <Calendar className="w-3 h-3" />
                                              {classroom.schedule.length} schedule
                                              {classroom.schedule.length > 1 ? "s" : ""}
                                            </div>
                                          )}
                                        </div>

                                        {/* Lighting effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none rounded-lg" />

                                        {/* Floor texture */}
                                        <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                      </div>

                                      {/* Side Face - Enhanced depth */}
                                      <div
                                        className={`absolute inset-0 rounded-lg ${
                                          hasConflict(classroom.id)
                                            ? "bg-gradient-to-b from-red-500 to-red-800"
                                            : classroom.status === "available"
                                              ? "bg-gradient-to-b from-emerald-500 to-emerald-800"
                                              : classroom.status === "in-use"
                                                ? "bg-gradient-to-b from-amber-500 to-amber-800"
                                                : "bg-gradient-to-b from-red-500 to-red-800"
                                        }`}
                                        style={{
                                          transform: "rotateY(90deg) translateZ(20px) translateX(20px)",
                                          width: "40px",
                                          height: "100%",
                                        }}
                                      />

                                      {/* Top Face - Enhanced depth */}
                                      <div
                                        className={`absolute inset-0 rounded-lg ${
                                          hasConflict(classroom.id)
                                            ? "bg-red-700"
                                            : classroom.status === "available"
                                              ? "bg-emerald-700"
                                              : classroom.status === "in-use"
                                                ? "bg-amber-700"
                                                : "bg-red-700"
                                        }`}
                                        style={{
                                          transform: "rotateX(90deg) translateZ(20px) translateY(-20px)",
                                          width: "100%",
                                          height: "40px",
                                        }}
                                      />

                                      {/* Enhanced shadow */}
                                      <div
                                        className="absolute -bottom-4 left-3 right-3 h-4 bg-black/40 blur-xl rounded-full"
                                        style={{
                                          transform: "translateZ(-10px)",
                                        }}
                                      />
                                    </div>

                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                      <span
                                        className={`relative text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md border-2 ${
                                          hasConflict(classroom.id)
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : classroom.status === "available"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : classroom.status === "in-use"
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                        }`}
                                      >
                                        {hasConflict(classroom.id) ? (
                                          <>
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                            Schedule Conflict
                                          </>
                                        ) : (
                                          <>
                                            {classroom.status === "in-use" && (
                                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                              </span>
                                            )}
                                            {classroom.status === "maintenance" && (
                                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                              </span>
                                            )}
                                            {classroom.status === "available"
                                              ? "Available"
                                              : classroom.status === "in-use"
                                                ? "In Use"
                                                : "Maintenance"}
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                {floor.classrooms.length === 0 && (
                                  <div className="text-slate-400 text-center py-8 w-full">
                                    {dragOverTarget?.buildingId === building.id && dragOverTarget?.floorId === floor.id
                                      ? "Drop classroom here"
                                      : "No classrooms yet. Click 'Add Room' or drag a classroom here."}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="h-3 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 border-t border-slate-300 relative">
                            <div className="absolute inset-x-0 top-0 h-px bg-slate-300/50" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-slate-700/50" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {building.floors.length > 0 && (
                  <div className="relative h-8 rounded-b-xl border-x-4 border-b-4 border-slate-500 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900" />
                    {/* Concrete texture */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(90deg, transparent 0px, transparent 3px, #000 3px, #000 4px),
                          repeating-linear-gradient(0deg, transparent 0px, transparent 3px, #000 3px, #000 4px)
                        `,
                      }}
                    />
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-slate-600/50 to-transparent" />

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-16 h-full bg-gradient-to-b from-slate-900 to-slate-950 border-x-2 border-slate-600 flex items-center justify-center">
                      {/* Door frame */}
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-900/40 to-blue-950/60 rounded-sm" />
                      {/* Door handle */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-400 rounded-full shadow-lg" />
                      {/* Glass reflection */}
                      <div className="absolute inset-2 bg-gradient-to-br from-sky-200/20 to-transparent rounded-sm" />
                    </div>
                  </div>
                )}

                {building.floors.length > 0 && (
                  <div className="relative mt-2 h-16 flex items-end justify-center gap-8">
                    {/* Pathway */}
                    <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-b from-slate-400 to-slate-500 border-t-2 border-slate-300">
                      {/* Pathway texture */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(0,0,0,0.2) 30px, rgba(0,0,0,0.2) 31px)`,
                        }}
                      />
                    </div>

                    {/* Small fence at bottom */}
                    <div className="absolute bottom-8 inset-x-0 h-6 flex items-center justify-center gap-1 px-4">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          {/* Fence post */}
                          <div className="w-1 h-5 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm" />
                          {/* Fence base */}
                          <div className="w-1.5 h-1 bg-amber-900" />
                        </div>
                      ))}
                      {/* Horizontal fence rails */}
                      <div className="absolute top-1 inset-x-4 h-0.5 bg-amber-800" />
                      <div className="absolute top-3 inset-x-4 h-0.5 bg-amber-800" />
                    </div>

                    {/* Decorative trees on sides */}
                    <div className="absolute bottom-8 left-8 flex flex-col items-center">
                      {/* Tree foliage */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-lg relative">
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-400/50 to-transparent" />
                      </div>
                      {/* Tree trunk */}
                      <div className="w-3 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm" />
                    </div>

                    <div className="absolute bottom-8 right-8 flex flex-col items-center">
                      {/* Tree foliage */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-lg relative">
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-400/50 to-transparent" />
                      </div>
                      {/* Tree trunk */}
                      <div className="w-3 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm" />
                    </div>
                  </div>
                )}

                {building.floors.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <p className="text-xl">No floors yet.</p>
                    <p>Click "Add Floor" to start building.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {buildings.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-2xl font-semibold mb-2">No buildings yet.</p>
            <p>Click "Add New Building" to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={showConflictsDialog} onOpenChange={setShowConflictsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Schedule Conflicts Detected
            </DialogTitle>
            <DialogDescription>
              The following classrooms have overlapping time slots. Please resolve these conflicts to avoid
              double-booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {conflicts.map((conflict) => (
              <div key={conflict.classroomId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-lg text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {conflict.classroomName}
                </h3>
                <div className="space-y-3">
                  {conflict.conflicts.map((conflictPair, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-2">Conflict #{index + 1}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded p-3 border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-sm text-red-900">{conflictPair.slot1.day}</span>
                          </div>
                          <p className="text-sm text-red-800">
                            {conflictPair.slot1.startTime} - {conflictPair.slot1.endTime}
                          </p>
                          <p className="text-sm font-medium text-red-900 mt-1">{conflictPair.slot1.subject}</p>
                          <p className="text-xs text-red-700">{conflictPair.slot1.teacher}</p>
                          <p className="text-xs text-red-700">{conflictPair.slot1.section}</p>
                        </div>
                        <div className="bg-red-50 rounded p-3 border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-sm text-red-900">{conflictPair.slot2.day}</span>
                          </div>
                          <p className="text-sm text-red-800">
                            {conflictPair.slot2.startTime} - {conflictPair.slot2.endTime}
                          </p>
                          <p className="text-sm font-medium text-red-900 mt-1">{conflictPair.slot2.subject}</p>
                          <p className="text-xs text-red-700">{conflictPair.slot2.teacher}</p>
                          <p className="text-xs text-red-700">{conflictPair.slot2.section}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowConflictsDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Building Dialog */}
      <Dialog open={isAddBuildingOpen} onOpenChange={setIsAddBuildingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
            <DialogDescription>Enter a name for your new building</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="building-name">Building Name</Label>
              <Input
                id="building-name"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                placeholder="e.g., Science Building"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddBuildingOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={addBuilding} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Building
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Classroom Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Classroom Details</DialogTitle>
            <DialogDescription>View and edit classroom information</DialogDescription>
          </DialogHeader>
          {selectedClassroom && (
            <ClassroomDetailsForm
              classroom={selectedClassroom.classroom}
              onSave={updateClassroom}
              onCancel={() => setIsModalOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookTemplate className="w-5 h-5 text-purple-600" />
              Save Building as Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable template from this building configuration. You can load it later to quickly create
              similar buildings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard 3-Floor Building"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsTemplateDialogOpen(false)
                  setTemplateName("")
                  setTemplateDescription("")
                  setSelectedBuildingForTemplate(null)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={saveTemplate} disabled={isLoading || !templateName.trim()}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadTemplateDialogOpen} onOpenChange={setIsLoadTemplateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Load Building Template
            </DialogTitle>
            <DialogDescription>
              Select a template to create a new building with the same configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookTemplate className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No templates saved yet</p>
                <p className="text-sm">Save a building as a template to reuse its configuration later.</p>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[500px] overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                        {template.description && <p className="text-sm text-slate-600 mb-3">{template.description}</p>}
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{template.building.floors.length}</span> floors
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">
                              {template.building.floors.reduce((sum, floor) => sum + floor.classrooms.length, 0)}
                            </span>{" "}
                            classrooms
                          </span>
                          <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => loadTemplate(template.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Load
                        </Button>
                        {/* Update delete template to show confirmation */}
                        <Button
                          onClick={() => {
                            setDeleteConfirmation({
                              type: "template",
                              id: template.id,
                              name: template.name,
                            })
                          }}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsLoadTemplateDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>Speed up your workflow with these keyboard shortcuts</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-3">General</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Show keyboard shortcuts</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">?</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Close dialogs</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-3">Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Add new building</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl</kbd>
                    <span className="text-slate-400">+</span>
                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">B</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Delete selected item</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Del</kbd>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Exit focus mode</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl</kbd>
                    <span className="text-slate-400">+</span>
                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Z</kbd>
                    <span className="text-slate-400 mx-1">or</span>
                    <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-3">Context Menu</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Open quick actions</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">
                    Right Click
                  </kbd>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Tip: Right-click on any building, floor, or classroom to access quick actions and shortcuts. Click on
                floor headers to collapse/expand them.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={contextMenu !== null} onOpenChange={() => setContextMenu(null)}>
        {contextMenu && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 min-w-[200px] animate-in fade-in-0 zoom-in-95"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.type === "classroom" && contextMenu.classroom && (
              <>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    openClassroomDetails(contextMenu.buildingId, contextMenu.floorId!, contextMenu.classroom!)
                    setContextMenu(null)
                  }}
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span>Edit Details</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    duplicateClassroom(contextMenu.buildingId, contextMenu.floorId!, contextMenu.classroom!)
                    setContextMenu(null)
                  }}
                >
                  <Copy className="w-4 h-4 text-green-600" />
                  <span>Duplicate</span>
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                  onClick={() => {
                    setDeleteConfirmation({
                      type: "classroom",
                      id: contextMenu.classroom!.id,
                      buildingId: contextMenu.buildingId,
                      floorId: contextMenu.floorId,
                      name: contextMenu.classroom!.name,
                    })
                    setContextMenu(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                  <span className="ml-auto text-xs opacity-60">Del</span>
                </button>
              </>
            )}

            {contextMenu.type === "floor" && contextMenu.floorId && (
              <>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    addClassroom(contextMenu.buildingId, contextMenu.floorId!)
                    setContextMenu(null)
                  }}
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Add Classroom</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    toggleFloorCollapse(contextMenu.floorId!)
                    setContextMenu(null)
                  }}
                >
                  {collapsedFloors.has(contextMenu.floorId!) ? (
                    <>
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                      <span>Expand Floor</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                      <span>Collapse Floor</span>
                    </>
                  )}
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                  onClick={() => {
                    const building = buildings.find((b) => b.id === contextMenu.buildingId)
                    const floor = building?.floors.find((f) => f.id === contextMenu.floorId)
                    if (floor) {
                      setDeleteConfirmation({
                        type: "floor",
                        id: floor.id,
                        buildingId: contextMenu.buildingId,
                        name: `Floor ${floor.number}`,
                      })
                    }
                    setContextMenu(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Floor</span>
                  <span className="ml-auto text-xs opacity-60">Del</span>
                </button>
              </>
            )}

            {contextMenu.type === "building" && (
              <>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    addFloor(contextMenu.buildingId)
                    setContextMenu(null)
                  }}
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Add Floor</span>
                </button>
                {!focusedBuilding && (
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                    onClick={() => {
                      toggleFocusMode(contextMenu.buildingId)
                      setContextMenu(null)
                    }}
                  >
                    <ZoomIn className="w-4 h-4 text-blue-600" />
                    <span>Focus on Building</span>
                  </button>
                )}
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    collapseAllFloors(contextMenu.buildingId)
                    setContextMenu(null)
                  }}
                >
                  <Minimize2 className="w-4 h-4 text-slate-600" />
                  <span>Collapse All Floors</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-3 text-sm"
                  onClick={() => {
                    expandAllFloors(contextMenu.buildingId)
                    setContextMenu(null)
                  }}
                >
                  <Maximize2 className="w-4 h-4 text-slate-600" />
                  <span>Expand All Floors</span>
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                  onClick={() => {
                    const building = buildings.find((b) => b.id === contextMenu.buildingId)
                    if (building) {
                      setDeleteConfirmation({
                        type: "building",
                        id: building.id,
                        name: building.name,
                      })
                    }
                    setContextMenu(null)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Building</span>
                  <span className="ml-auto text-xs opacity-60">Del</span>
                </button>
              </>
            )}
          </div>
        )}
      </Dialog>

      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmation?.type === "building" && (
                <>
                  Are you sure you want to delete the building <strong>{deleteConfirmation.name}</strong>?
                  <br />
                  <span className="text-red-600 font-medium">
                    This will permanently delete all floors and classrooms in this building.
                  </span>
                </>
              )}
              {deleteConfirmation?.type === "floor" && (
                <>
                  Are you sure you want to delete <strong>{deleteConfirmation.name}</strong>?
                  <br />
                  <span className="text-red-600 font-medium">
                    This will permanently delete all classrooms on this floor.
                  </span>
                </>
              )}
              {deleteConfirmation?.type === "classroom" && (
                <>
                  Are you sure you want to delete <strong>{deleteConfirmation.name}</strong>?
                  <br />
                  <span className="text-red-600 font-medium">This action cannot be undone.</span>
                </>
              )}
              {deleteConfirmation?.type === "template" && (
                <>
                  Are you sure you want to delete the template <strong>{deleteConfirmation.name}</strong>?
                  <br />
                  <span className="text-red-600 font-medium">This action cannot be undone.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteConfirmation) return
                if (deleteConfirmation.type === "building") {
                  deleteBuilding(deleteConfirmation.id)
                } else if (deleteConfirmation.type === "floor") {
                  deleteFloor(deleteConfirmation.buildingId!, deleteConfirmation.id)
                } else if (deleteConfirmation.type === "classroom") {
                  deleteClassroom(deleteConfirmation.buildingId!, deleteConfirmation.floorId!, deleteConfirmation.id)
                } else if (deleteConfirmation.type === "template") {
                  deleteTemplate(deleteConfirmation.id)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Classroom Details Form Component
function ClassroomDetailsForm({
  classroom,
  onSave,
  onCancel,
  isLoading,
}: {
  classroom: Classroom
  onSave: (classroom: Classroom) => void
  onCancel: () => void
  isLoading?: boolean
}) {
  const [formData, setFormData] = useState(classroom)
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [newTimeSlot, setNewTimeSlot] = useState<Partial<TimeSlot>>({
    day: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "",
    teacher: "",
    section: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addTimeSlot = () => {
    if (!newTimeSlot.subject || !newTimeSlot.teacher || !newTimeSlot.section) {
      return
    }

    const timeSlot: TimeSlot = {
      id: Date.now().toString(),
      day: newTimeSlot.day as TimeSlot["day"],
      startTime: newTimeSlot.startTime!,
      endTime: newTimeSlot.endTime!,
      subject: newTimeSlot.subject,
      teacher: newTimeSlot.teacher,
      section: newTimeSlot.section,
    }

    setFormData({
      ...formData,
      schedule: [...formData.schedule, timeSlot],
    })

    // Reset form
    setNewTimeSlot({
      day: "Monday",
      startTime: "08:00",
      endTime: "09:00",
      subject: "",
      teacher: "",
      section: "",
    })
    setIsAddingSchedule(false)
  }

  const removeTimeSlot = (slotId: string) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((slot) => slot.id !== slotId),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="room-name">Room Name</Label>
          <Input
            id="room-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Physics Lab"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="capacity">Capacity (Students)</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
            min="1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="section">Section (Optional)</Label>
          <Input
            id="section"
            value={formData.section || ""}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            placeholder="e.g., Grade 8-A, Grade 9-B"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="adviser">Adviser (Optional)</Label>
          <Input
            id="adviser"
            value={formData.adviser || ""}
            onChange={(e) => setFormData({ ...formData, adviser: e.target.value })}
            placeholder="e.g., Ms. Rodriguez, Mr. Santos"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="equipment">Equipment</Label>
          <Textarea
            id="equipment"
            value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            placeholder="e.g., Projector, Computers, Lab Equipment"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: Classroom["status"]) => setFormData({ ...formData, status: value })}
            disabled={isLoading}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Class Schedule</Label>
            <Button
              type="button"
              onClick={() => setIsAddingSchedule(!isAddingSchedule)}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Time Slot
            </Button>
          </div>

          {isAddingSchedule && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="day" className="text-sm">
                    Day
                  </Label>
                  <Select
                    value={newTimeSlot.day}
                    onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, day: value as TimeSlot["day"] })}
                  >
                    <SelectTrigger id="day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject" className="text-sm">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={newTimeSlot.subject}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-time" className="text-sm">
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm">
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="teacher" className="text-sm">
                    Teacher
                  </Label>
                  <Input
                    id="teacher"
                    value={newTimeSlot.teacher}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, teacher: e.target.value })}
                    placeholder="e.g., Mr. Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="section" className="text-sm">
                    Section
                  </Label>
                  <Input
                    id="section"
                    value={newTimeSlot.section}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, section: e.target.value })}
                    placeholder="e.g., Grade 10-A"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingSchedule(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={addTimeSlot}>
                  Add Slot
                </Button>
              </div>
            </div>
          )}

          {formData.schedule.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {formData.schedule.map((slot) => (
                <div key={slot.id} className="bg-slate-50 rounded-lg p-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="font-semibold text-sm">{slot.day}</span>
                      <Clock className="w-4 h-4 text-slate-600 ml-2" />
                      <span className="text-sm text-slate-600">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{slot.subject}</p>
                    <p className="text-xs text-slate-600">
                      {slot.teacher} • {slot.section}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeSlot(slot.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No schedule added yet</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
