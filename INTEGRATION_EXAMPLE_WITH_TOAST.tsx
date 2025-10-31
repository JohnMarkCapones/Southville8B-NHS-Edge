/**
 * COMPLETE INTEGRATION EXAMPLE
 * How to integrate Club Benefits & FAQs API with Toast Notifications
 *
 * Copy this code pattern into: app/teacher/clubs/[id]/page.tsx
 */

"use client"

import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useClubBenefits, useCreateClubBenefit, useUpdateClubBenefit, useDeleteClubBenefit } from "@/hooks/useClubBenefits"
import { useClubFaqs, useCreateClubFaq, useUpdateClubFaq, useDeleteClubFaq } from "@/hooks/useClubFaqs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Save, Loader2 } from "lucide-react"
import { useState } from "react"

export default function ClubManagementPage() {
  const params = useParams()
  const clubId = params.id as string // Get club ID from URL
  const { toast } = useToast()

  // ========================================
  // FETCH DATA FROM API
  // ========================================
  const { data: benefits = [], isLoading: benefitsLoading } = useClubBenefits(clubId)
  const { data: faqs = [], isLoading: faqsLoading } = useClubFaqs(clubId)

  // ========================================
  // MUTATIONS WITH TOAST NOTIFICATIONS
  // ========================================

  // Benefits mutations
  const createBenefit = useCreateClubBenefit()
  const updateBenefit = useUpdateClubBenefit()
  const deleteBenefit = useDeleteClubBenefit()

  // FAQs mutations
  const createFaq = useCreateClubFaq()
  const updateFaq = useUpdateClubFaq()
  const deleteFaq = useDeleteClubFaq()

  // ========================================
  // BENEFIT HANDLERS
  // ========================================

  const handleAddBenefit = () => {
    createBenefit.mutate(
      {
        clubId,
        data: {
          title: "New Benefit",
          description: "Describe the benefit here",
          order_index: benefits.length,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Benefit added successfully",
            variant: "default", // green checkmark
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to add benefit: ${error.message}`,
            variant: "destructive", // red error
          })
        },
      }
    )
  }

  const handleUpdateBenefit = (benefitId: string, title: string, description: string) => {
    updateBenefit.mutate(
      {
        clubId,
        benefitId,
        data: { title, description },
      },
      {
        onSuccess: () => {
          toast({
            title: "Saved!",
            description: "Benefit updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update benefit: ${error.message}`,
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleDeleteBenefit = (benefitId: string) => {
    deleteBenefit.mutate(
      { clubId, benefitId },
      {
        onSuccess: () => {
          toast({
            title: "Deleted",
            description: "Benefit removed successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete benefit: ${error.message}`,
            variant: "destructive",
          })
        },
      }
    )
  }

  // ========================================
  // FAQ HANDLERS
  // ========================================

  const handleAddFaq = () => {
    createFaq.mutate(
      {
        clubId,
        data: {
          question: "New Question?",
          answer: "Answer here...",
          order_index: faqs.length,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "FAQ added successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to add FAQ: ${error.message}`,
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleUpdateFaq = (faqId: string, question: string, answer: string) => {
    updateFaq.mutate(
      {
        clubId,
        faqId,
        data: { question, answer },
      },
      {
        onSuccess: () => {
          toast({
            title: "Saved!",
            description: "FAQ updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update FAQ: ${error.message}`,
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleDeleteFaq = (faqId: string) => {
    deleteFaq.mutate(
      { clubId, faqId },
      {
        onSuccess: () => {
          toast({
            title: "Deleted",
            description: "FAQ removed successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete FAQ: ${error.message}`,
            variant: "destructive",
          })
        },
      }
    )
  }

  // ========================================
  // RENDER BENEFITS SECTION
  // ========================================

  return (
    <div className="space-y-6">
      {/* Benefits Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Club Membership Benefits</CardTitle>
            <CardDescription>
              Manage the benefits that members receive when joining the club
            </CardDescription>
          </div>
          <Button
            onClick={handleAddBenefit}
            disabled={createBenefit.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createBenefit.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {benefitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading benefits...</span>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                No benefits added yet. Click "Add Benefit" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  index={index}
                  onUpdate={handleUpdateBenefit}
                  onDelete={handleDeleteBenefit}
                  isUpdating={updateBenefit.isPending}
                  isDeleting={deleteBenefit.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQs Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions and answers about your club
            </CardDescription>
          </div>
          <Button
            onClick={handleAddFaq}
            disabled={createFaq.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createFaq.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {faqsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading FAQs...</span>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                No FAQs added yet. Click "Add FAQ" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FaqCard
                  key={faq.id}
                  faq={faq}
                  index={index}
                  onUpdate={handleUpdateFaq}
                  onDelete={handleDeleteFaq}
                  isUpdating={updateFaq.isPending}
                  isDeleting={deleteFaq.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ========================================
// BENEFIT CARD COMPONENT
// ========================================

interface BenefitCardProps {
  benefit: any
  index: number
  onUpdate: (id: string, title: string, description: string) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

function BenefitCard({ benefit, index, onUpdate, onDelete, isUpdating, isDeleting }: BenefitCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(benefit.title)
  const [description, setDescription] = useState(benefit.description)

  const handleSave = () => {
    onUpdate(benefit.id, title, description)
    setEditing(false)
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Benefit {index + 1}</h4>
        <div className="flex gap-2">
          {editing ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              <Save className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(benefit.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!editing}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Benefit title"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!editing}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Benefit description"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}

// ========================================
// FAQ CARD COMPONENT
// ========================================

interface FaqCardProps {
  faq: any
  index: number
  onUpdate: (id: string, question: string, answer: string) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

function FaqCard({ faq, index, onUpdate, onDelete, isUpdating, isDeleting }: FaqCardProps) {
  const [editing, setEditing] = useState(false)
  const [question, setQuestion] = useState(faq.question)
  const [answer, setAnswer] = useState(faq.answer)

  const handleSave = () => {
    onUpdate(faq.id, question, answer)
    setEditing(false)
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">FAQ {index + 1}</h4>
        <div className="flex gap-2">
          {editing ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              <Save className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(faq.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Question</Label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!editing}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter question"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-600 dark:text-gray-400">Answer</Label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!editing}
            className="mt-1 dark:bg-slate-800 dark:border-slate-600"
            placeholder="Enter answer"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * ========================================
 * HOW TO USE THIS CODE:
 * ========================================
 *
 * 1. FIND THE "SETTINGS" SECTION in your existing page
 *    Look for: {activeSection === "settings" && (
 *
 * 2. REPLACE OR ADD this code in the Settings section
 *    This will show the Benefits and FAQs management cards
 *
 * 3. BUTTONS TO CLICK:
 *    - "Add Benefit" (green button) - Creates a new benefit
 *    - "Add FAQ" (purple button) - Creates a new FAQ
 *    - Save icon (blue) - Saves changes to a benefit/FAQ
 *    - Trash icon (red) - Deletes a benefit/FAQ
 *
 * 4. TOAST NOTIFICATIONS WILL APPEAR:
 *    - ✅ "Success!" when items are added
 *    - ✅ "Saved!" when items are updated
 *    - ✅ "Deleted" when items are removed
 *    - ❌ "Error" if something goes wrong
 *
 * 5. DATA IS AUTOMATICALLY:
 *    - Fetched from the API on page load
 *    - Updated in real-time when changes are made
 *    - Saved to the database
 *    - Shown with loading spinners during operations
 *
 * ========================================
 * WHAT EACH BUTTON DOES:
 * ========================================
 *
 * ADD BENEFIT BUTTON (green):
 *   → Creates a new benefit with placeholder text
 *   → Shows "Adding..." while saving
 *   → Toast: "Success! Benefit added successfully"
 *   → Data appears instantly in the list
 *
 * SAVE BUTTON (blue, on each card):
 *   → Click to enable editing
 *   → Edit the title and description
 *   → Click again to save changes
 *   → Toast: "Saved! Benefit updated successfully"
 *
 * DELETE BUTTON (red, trash icon):
 *   → Removes the benefit/FAQ
 *   → Toast: "Deleted. Benefit removed successfully"
 *   → Item disappears from list
 *
 * Same pattern for FAQs with Question/Answer fields!
 */
