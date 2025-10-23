"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClub } from "@/lib/api/endpoints/clubs"
import type { CreateClubDto } from "@/lib/api/types/clubs"
import {
  ArrowLeft,
  Plus,
  X,
  GripVertical,
  Sparkles,
  Target,
  Gift,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ClubGoal = {
  id: string
  title: string
}

type MembershipBenefit = {
  id: string
  title: string
  description: string
}

type FAQ = {
  id: string
  question: string
  answer: string
}

export default function CreateClubPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [clubName, setClubName] = useState("")
  const [clubDescription, setClubDescription] = useState("")
  const [missionStatement, setMissionStatement] = useState("")

  const [goals, setGoals] = useState<ClubGoal[]>([{ id: "1", title: "" }])
  const [benefits, setBenefits] = useState<MembershipBenefit[]>([{ id: "1", title: "", description: "" }])
  const [faqs, setFaqs] = useState<FAQ[]>([{ id: "1", question: "", answer: "" }])

  const [nameCount, setNameCount] = useState(0)
  const [descCount, setDescCount] = useState(0)
  const [missionCount, setMissionCount] = useState(0)

  // Goals handlers
  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, { id: Date.now().toString(), title: "" }])
    } else {
      toast({
        title: "Maximum Goals Reached",
        description: "You can only add up to 5 goals.",
        variant: "destructive",
      })
    }
  }

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setGoals(goals.filter((goal) => goal.id !== id))
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one goal is required.",
        variant: "destructive",
      })
    }
  }

  const updateGoal = (id: string, title: string) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, title } : goal)))
  }

  // Benefits handlers
  const addBenefit = () => {
    if (benefits.length < 6) {
      setBenefits([...benefits, { id: Date.now().toString(), title: "", description: "" }])
    } else {
      toast({
        title: "Maximum Benefits Reached",
        description: "You can only add up to 6 membership benefits.",
        variant: "destructive",
      })
    }
  }

  const removeBenefit = (id: string) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((benefit) => benefit.id !== id))
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one membership benefit is required.",
        variant: "destructive",
      })
    }
  }

  const updateBenefit = (id: string, field: "title" | "description", value: string) => {
    setBenefits(benefits.map((benefit) => (benefit.id === id ? { ...benefit, [field]: value } : benefit)))
  }

  // FAQs handlers
  const addFAQ = () => {
    setFaqs([...faqs, { id: Date.now().toString(), question: "", answer: "" }])
  }

  const removeFAQ = (id: string) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((faq) => faq.id !== id))
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one FAQ is required.",
        variant: "destructive",
      })
    }
  }

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!clubName.trim()) {
      toast({
        title: "Validation Error",
        description: "Club name is required.",
        variant: "destructive",
      })
      return
    }

    if (clubName.length > 100) {
      toast({
        title: "Validation Error",
        description: "Club name must be 100 characters or less.",
        variant: "destructive",
      })
      return
    }

    if (!clubDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Club description is required.",
        variant: "destructive",
      })
      return
    }

    if (clubDescription.length > 500) {
      toast({
        title: "Validation Error",
        description: "Club description must be 500 characters or less.",
        variant: "destructive",
      })
      return
    }

    if (!missionStatement.trim()) {
      toast({
        title: "Validation Error",
        description: "Mission statement is required.",
        variant: "destructive",
      })
      return
    }

    if (missionStatement.length > 300) {
      toast({
        title: "Validation Error",
        description: "Mission statement must be 300 characters or less.",
        variant: "destructive",
      })
      return
    }

    // Validate goals
    const validGoals = goals.filter((g) => g.title.trim())
    if (validGoals.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one goal is required.",
        variant: "destructive",
      })
      return
    }

    // Validate benefits
    const validBenefits = benefits.filter((b) => b.title.trim() && b.description.trim())
    if (validBenefits.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one membership benefit with both title and description is required.",
        variant: "destructive",
      })
      return
    }

    // Validate FAQs
    const validFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())
    if (validFAQs.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one FAQ with both question and answer is required.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      const validGoals = goals.filter((g) => g.title.trim())
      const validBenefits = benefits.filter((b) => b.title.trim() && b.description.trim())
      const validFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())

      // Transform data to match backend DTO
      const createClubDto: CreateClubDto = {
        name: clubName,
        description: clubDescription,
        mission_statement: missionStatement,

        // Transform goals
        goals: validGoals.map((goal, index) => ({
          goal_text: goal.title,
          order_index: index,
        })),

        // Transform benefits
        benefits: validBenefits.map((benefit, index) => ({
          title: benefit.title,
          description: benefit.description,
          order_index: index,
        })),

        // Transform FAQs
        faqs: validFAQs.map((faq, index) => ({
          question: faq.question,
          answer: faq.answer,
          order_index: index,
        })),
      }

      // Call API
      const createdClub = await createClub(createClubDto)

      toast({
        title: "Club Created Successfully",
        description: `${clubName} has been added with ${validGoals.length} goals, ${validBenefits.length} benefits, and ${validFAQs.length} FAQs.`,
        duration: 4000,
      })

      router.push("/superadmin/clubs")
    } catch (error: any) {
      console.error("Error creating club:", error)
      toast({
        title: "Error Creating Club",
        description: error.message || "Failed to create club. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      setIsSubmitting(false)
    }
  }

  const getValidCounts = () => {
    const validGoals = goals.filter((g) => g.title.trim())
    const validBenefits = benefits.filter((b) => b.title.trim() && b.description.trim())
    const validFAQs = faqs.filter((f) => f.question.trim() && f.answer.trim())
    return { validGoals, validBenefits, validFAQs }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Club</h1>
          <p className="text-muted-foreground">Add a new club or organization with comprehensive details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Basic Information</CardTitle>
              </div>
              <CardDescription>Essential details about the club</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Club Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter club name (e.g., Math Club, Science Society)"
                  value={clubName}
                  onChange={(e) => {
                    setClubName(e.target.value)
                    setNameCount(e.target.value.length)
                  }}
                  maxLength={100}
                  className="text-base"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">A clear, descriptive name for your club</p>
                  <p className={`text-xs ${nameCount > 90 ? "text-red-500" : "text-muted-foreground"}`}>
                    {nameCount}/100
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Club Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the club's purpose, activities, and what makes it unique..."
                  rows={4}
                  value={clubDescription}
                  onChange={(e) => {
                    setClubDescription(e.target.value)
                    setDescCount(e.target.value.length)
                  }}
                  maxLength={500}
                  className="text-base resize-none"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">A compelling overview that attracts potential members</p>
                  <p className={`text-xs ${descCount > 450 ? "text-red-500" : "text-muted-foreground"}`}>
                    {descCount}/500
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission" className="text-base font-semibold">
                  Club Mission Statement <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="mission"
                  placeholder="What is the core purpose and vision of this club? (e.g., To foster a love for mathematics through collaborative problem-solving and competitions)"
                  rows={3}
                  value={missionStatement}
                  onChange={(e) => {
                    setMissionStatement(e.target.value)
                    setMissionCount(e.target.value.length)
                  }}
                  maxLength={300}
                  className="text-base resize-none"
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    The guiding principle that defines your club's purpose
                  </p>
                  <p className={`text-xs ${missionCount > 270 ? "text-red-500" : "text-muted-foreground"}`}>
                    {missionCount}/300
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Club Goals */}
          <Card className="border-2 border-blue-500/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">Club Goals</CardTitle>
                    <CardDescription>Define up to 5 specific goals for your club</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addGoal}
                  disabled={goals.length >= 5}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {goals.map((goal, index) => (
                <div key={goal.id} className="group relative">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Goal ${index + 1} (e.g., Participate in regional math competitions)`}
                        value={goal.title}
                        onChange={(e) => updateGoal(goal.id, e.target.value)}
                        className="text-base"
                        maxLength={150}
                      />
                      <p className="text-xs text-muted-foreground">{goal.title.length}/150 characters</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                      className="mt-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">{goals.length} of 5 goals • At least 1 goal required</p>
                {goals.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGoal}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Goal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Membership Benefits */}
          <Card className="border-2 border-green-500/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <div>
                    <CardTitle className="text-xl">Membership Benefits</CardTitle>
                    <CardDescription>Highlight up to 6 benefits of joining this club</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addBenefit}
                  disabled={benefits.length >= 6}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Benefit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {benefits.map((benefit, index) => (
                <div key={benefit.id} className="group relative">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Benefit Title</Label>
                        <Input
                          placeholder={`e.g., College Preparation, Leadership Development`}
                          value={benefit.title}
                          onChange={(e) => updateBenefit(benefit.id, "title", e.target.value)}
                          className="text-base"
                          maxLength={50}
                        />
                        <p className="text-xs text-muted-foreground">{benefit.title.length}/50 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Benefit Description</Label>
                        <Textarea
                          placeholder={`e.g., Build a strong foundation for advanced mathematics courses and college applications`}
                          value={benefit.description}
                          onChange={(e) => updateBenefit(benefit.id, "description", e.target.value)}
                          rows={2}
                          className="text-base resize-none"
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground">{benefit.description.length}/200 characters</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBenefit(benefit.id)}
                      className="mt-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {index < benefits.length - 1 && <div className="h-px bg-border mt-6" />}
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {benefits.length} of 6 benefits • At least 1 benefit required
                </p>
                {benefits.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBenefit}
                    className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Benefit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card className="border-2 border-purple-500/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                    <CardDescription>Answer common questions about your club</CardDescription>
                  </div>
                </div>
                <Button type="button" onClick={addFAQ} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="group relative">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Question</Label>
                        <Input
                          placeholder={`e.g., What are the meeting times?`}
                          value={faq.question}
                          onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                          className="text-base"
                          maxLength={150}
                        />
                        <p className="text-xs text-muted-foreground">{faq.question.length}/150 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Answer</Label>
                        <Textarea
                          placeholder={`e.g., We meet every Wednesday from 3:00 PM to 4:30 PM in Room 205`}
                          value={faq.answer}
                          onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                          rows={3}
                          className="text-base resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">{faq.answer.length}/500 characters</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFAQ(faq.id)}
                      className="mt-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {index < faqs.length - 1 && <div className="h-px bg-border mt-6" />}
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} • At least 1 FAQ required
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFAQ}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another FAQ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-2 border-border shadow-lg sticky bottom-4 z-10 bg-card/95 backdrop-blur-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Ready to create your club?</p>
                  <p className="text-xs">All required fields must be filled</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Club
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Confirm Club Creation</DialogTitle>
                <DialogDescription className="text-base">
                  Please review the details before creating this club
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Club Summary */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{clubName}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{clubDescription}</p>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Mission Statement
                </h4>
                <p className="text-sm text-muted-foreground pl-6 italic">&ldquo;{missionStatement}&rdquo;</p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600">Goals</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {getValidCounts().validGoals.length}
                  </p>
                  <p className="text-xs text-blue-600/70">of 5 maximum</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600">Benefits</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {getValidCounts().validBenefits.length}
                  </p>
                  <p className="text-xs text-green-600/70">of 6 maximum</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-medium text-purple-600">FAQs</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {getValidCounts().validFAQs.length}
                  </p>
                  <p className="text-xs text-purple-600/70">questions</p>
                </div>
              </div>

              {/* Preview Lists */}
              <div className="space-y-4 pt-2">
                {/* Goals Preview */}
                {getValidCounts().validGoals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Club Goals
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validGoals.slice(0, 3)
                        .map((goal, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600 font-medium">{idx + 1}.</span>
                            <span className="line-clamp-1">{goal.title}</span>
                          </li>
                        ))}
                      {getValidCounts().validGoals.length > 3 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validGoals.length - 3} more goal
                          {getValidCounts().validGoals.length - 3 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Benefits Preview */}
                {getValidCounts().validBenefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      Membership Benefits
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validBenefits.slice(0, 2)
                        .map((benefit, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{benefit.title}:</span>{" "}
                            <span className="line-clamp-1">{benefit.description}</span>
                          </li>
                        ))}
                      {getValidCounts().validBenefits.length > 2 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validBenefits.length - 2} more benefit
                          {getValidCounts().validBenefits.length - 2 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* FAQs Preview */}
                {getValidCounts().validFAQs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      Frequently Asked Questions
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {getValidCounts()
                        .validFAQs.slice(0, 2)
                        .map((faq, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Q:</span> {faq.question}
                          </li>
                        ))}
                      {getValidCounts().validFAQs.length > 2 && (
                        <li className="text-sm text-muted-foreground italic pl-4">
                          +{getValidCounts().validFAQs.length - 2} more question
                          {getValidCounts().validFAQs.length - 2 !== 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Are you sure you want to create this club?
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This will make the club visible to all students. You can edit the details later if needed.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Yes, Create Club
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
