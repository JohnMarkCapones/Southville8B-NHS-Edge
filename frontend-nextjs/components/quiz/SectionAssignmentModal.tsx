"use client"

/**
 * Section Assignment Modal Component
 *
 * Allows teachers to assign/unassign quizzes to sections with a checkbox UI.
 * Shows currently assigned sections and allows bulk updates.
 */

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { quizApi } from "@/lib/api/endpoints"
import { Loader2, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Section {
  id: string
  name: string
  grade_level?: string
  school_year?: string
}

interface SectionAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizId: string
  quizTitle: string
  onAssignmentComplete?: (selectedSectionIds?: string[]) => void
  skipApiCall?: boolean // If true, just return selections without calling API (for draft quizzes)
}

export function SectionAssignmentModal({
  open,
  onOpenChange,
  quizId,
  quizTitle,
  onAssignmentComplete,
  skipApiCall = false,
}: SectionAssignmentModalProps) {
  const { toast } = useToast()

  // State
  const [availableSections, setAvailableSections] = useState<Section[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [initialSections, setInitialSections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Load teacher's sections and current assignments
   */
  useEffect(() => {
    if (open && quizId) {
      loadSections()
    }
  }, [open, quizId])

  const loadSections = async () => {
    setIsLoading(true)

    try {
      // Load teacher's available sections (from sections API)
      // TODO: Replace with actual API endpoint for teacher's sections
      // For now, using mock data - you'll need to implement getTeacherSections()
      const teacherSections = await fetchTeacherSections()

      // Load currently assigned sections for this quiz
      const assignedSections = await quizApi.teacher.getAssignedSections(quizId)

      setAvailableSections(teacherSections)

      // Extract section IDs from assigned sections
      const assignedIds = assignedSections.map((s: any) => s.section_id || s.id)
      setSelectedSections(assignedIds)
      setInitialSections(assignedIds) // Store initial state for comparison

      console.log('[SectionModal] Loaded sections:', {
        available: teacherSections.length,
        assigned: assignedIds.length,
      })
    } catch (error) {
      console.error('[SectionModal] Error loading sections:', error)
      toast({
        title: 'Error',
        description: 'Failed to load sections. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fetch teacher's sections
   */
  const fetchTeacherSections = async (): Promise<Section[]> => {
    try {
      // Get current user
      const { getCurrentUser } = await import('@/lib/api/endpoints/auth')
      const { getTeacherSections } = await import('@/lib/api/endpoints/sections')

      const currentUser = await getCurrentUser()

      // Try different possible field names for user ID
      const userId = currentUser?.id || currentUser?.user_id || (currentUser as any)?.userId

      if (!userId) {
        console.error('[SectionModal] Unable to get user ID')
        throw new Error('Unable to get user information')
      }

      // Fetch teacher's sections
      const sections = await getTeacherSections(userId)
      return sections
    } catch (error) {
      console.warn('[SectionModal] Error fetching sections, using fallback:', error)
      // Fallback mock data if API fails
      return [
        { id: '1', name: 'Grade 10-A', grade_level: '10' },
        { id: '2', name: 'Grade 10-B', grade_level: '10' },
        { id: '3', name: 'Grade 11-Science', grade_level: '11' },
      ]
    }
  }

  /**
   * Toggle section selection
   */
  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  /**
   * Select all sections
   */
  const selectAll = () => {
    setSelectedSections(availableSections.map(s => s.id))
  }

  /**
   * Clear all selections
   */
  const clearAll = () => {
    setSelectedSections([])
  }

  /**
   * Save section assignments
   */
  const handleSave = async () => {
    // Validate
    if (selectedSections.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one section.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      // ✅ If skipApiCall is true (for draft quizzes), just pass selections back to parent
      if (skipApiCall) {
        console.log('[SectionModal] Skipping API call, returning selections to parent')

        // Notify parent with selected section IDs
        if (onAssignmentComplete) {
          onAssignmentComplete(selectedSections)
        }

        // Close modal
        onOpenChange(false)
        setIsSaving(false)
        return
      }

      // ✅ For published quizzes, make API calls to update assignments
      // Calculate sections to add and remove
      const sectionsToAdd = selectedSections.filter(
        id => !initialSections.includes(id)
      )
      const sectionsToRemove = initialSections.filter(
        id => !selectedSections.includes(id)
      )

      console.log('[SectionModal] Updating assignments:', {
        add: sectionsToAdd.length,
        remove: sectionsToRemove.length,
      })

      // Assign new sections
      if (sectionsToAdd.length > 0) {
        await quizApi.teacher.assignToSections(quizId, {
          sectionIds: sectionsToAdd,
        })
      }

      // Remove old sections
      if (sectionsToRemove.length > 0) {
        await quizApi.teacher.removeFromSections(quizId, sectionsToRemove)
      }

      toast({
        title: 'Success!',
        description: `Quiz assigned to ${selectedSections.length} section(s)`,
      })

      // Update initial sections to current selection
      setInitialSections(selectedSections)

      // Notify parent component
      if (onAssignmentComplete) {
        onAssignmentComplete(selectedSections)
      }

      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error: any) {
      console.error('[SectionModal] Error saving assignments:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update section assignments',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Check if there are changes
   */
  const hasChanges = () => {
    if (selectedSections.length !== initialSections.length) return true
    return selectedSections.some(id => !initialSections.includes(id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Section Assignments
          </DialogTitle>
          <DialogDescription>
            Select which sections can access "{quizTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Loading sections...</span>
            </div>
          )}

          {/* Section List */}
          {!isLoading && (
            <>
              {/* Action Buttons */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedSections.length} of {availableSections.length} selected
                  </Badge>
                  {hasChanges() && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    disabled={selectedSections.length === availableSections.length}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    disabled={selectedSections.length === 0}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <ScrollArea className="h-[300px] pr-4">
                {availableSections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No sections available</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please contact your administrator
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableSections.map(section => (
                      <div
                        key={section.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                          selectedSections.includes(section.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => toggleSection(section.id)}
                      >
                        <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <Label
                            className="font-medium cursor-pointer"
                            htmlFor={`section-${section.id}`}
                          >
                            {section.name}
                          </Label>
                          {section.grade_level && (
                            <p className="text-xs text-gray-500">
                              Grade {section.grade_level}
                              {section.school_year && ` • ${section.school_year}`}
                            </p>
                          )}
                        </div>
                        {selectedSections.includes(section.id) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              isLoading ||
              selectedSections.length === 0 ||
              !hasChanges()
            }
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
