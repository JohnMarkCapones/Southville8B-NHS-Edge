"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import StudentLayout from "@/components/student/student-layout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Heart,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Target,
  Sparkles,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { useState, useEffect, useMemo, use } from "react"
import { useToast } from "@/hooks/use-toast"
import { getClubBySlug, getActiveClubForms, submitClubFormResponse } from "@/lib/api/endpoints/clubs"
import type { Club, ClubForm, ClubFormQuestion } from "@/lib/api/types/clubs"

interface JoinClubPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function JoinClubPage({ params }: JoinClubPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [club, setClub] = useState<Club | null>(null)
  const [clubForm, setClubForm] = useState<ClubForm | null>(null)
  const [loadingClub, setLoadingClub] = useState(true)
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [applicationStep, setApplicationStep] = useState(1)
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({})

  // Fetch club data
  useEffect(() => {
    const fetchClubData = async () => {
      setLoadingClub(true)
      try {
        const clubData = await getClubBySlug(resolvedParams.slug)
        if (clubData) {
          setClub(clubData)
        } else {
          toast({
            title: "Club Not Found",
            description: "The club you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push('/student/clubs')
        }
      } catch (error) {
        console.error('Error fetching club:', error)
        toast({
          title: "Error",
          description: "Failed to load club information.",
          variant: "destructive",
        })
      } finally {
        setLoadingClub(false)
      }
    }

    fetchClubData()
  }, [resolvedParams.slug, router, toast])

  // Fetch club form when club is loaded
  useEffect(() => {
    const fetchClubForm = async () => {
      if (!club?.id) return

      setLoadingForm(true)
      try {
        const forms = await getActiveClubForms(club.id)

        if (forms && forms.length > 0) {
          // Use the first active form
          setClubForm(forms[0])
        }
      } catch (error) {
        console.error('Error fetching club form:', error)
        // It's okay if there's no form - we can still show club info
      } finally {
        setLoadingForm(false)
      }
    }

    fetchClubForm()
  }, [club?.id])

  const handleAnswerChange = (questionId: string, value: string) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmitApplication = async () => {
    if (!club?.id || !clubForm?.id) {
      toast({
        title: "Error",
        description: "Missing club or form information.",
        variant: "destructive",
      })
      return
    }

    // Validate required questions
    const requiredQuestions = clubForm.questions?.filter((q) => q.is_required) || []
    const missingAnswers = requiredQuestions.filter((q) => !formAnswers[q.id] || formAnswers[q.id].trim() === '')

    if (missingAnswers.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please answer all required questions.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      // Build answers array with proper types based on question type
      const answers = Object.entries(formAnswers).map(([question_id, value]) => {
        const question = clubForm.questions?.find((q) => q.id === question_id)

        // Select and radio use answer_value, text and textarea use answer_text
        if (question?.question_type === 'select' || question?.question_type === 'radio') {
          return {
            question_id,
            answer_value: value,
          }
        } else {
          // text, textarea use answer_text
          return {
            question_id,
            answer_text: value,
          }
        }
      })

      await submitClubFormResponse(club.id, clubForm.id, answers)

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. You'll be notified once it's reviewed.",
      })

      // Redirect to My Applications page
      router.push('/student/clubs?tab=applications')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loadingClub) {
    return (
      <StudentLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading club information...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Club not found
  if (!club) {
    return (
      <StudentLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Club Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The club you're looking for doesn't exist.
              </p>
              <Link href="/student/clubs">
                <Button>Back to Clubs</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="p-6 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student/clubs">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Join {club.name}</h1>
                  <p className="text-white/90 text-lg mb-4">{club.description || 'Join our community!'}</p>
                  {club.mission_statement && (
                    <p className="text-white/80 text-sm max-w-2xl">{club.mission_statement}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-500" />
                  About {club.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {club.description || 'Join our vibrant community and explore your interests!'}
                </p>
                {club.advisor && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <GraduationCap className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">Advisor</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{club.advisor.full_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Section */}
            {club.goals && club.goals.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Target className="w-6 h-6 mr-3 text-purple-500" />
                    Club Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{goal.goal_text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits Section */}
            {club.benefits && club.benefits.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Sparkles className="w-6 h-6 mr-3 text-green-500" />
                    What You'll Gain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.benefits.map((benefit) => (
                      <div
                        key={benefit.id}
                        className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20"
                      >
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            {club.faqs && club.faqs.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <MessageCircle className="w-6 h-6 mr-3 text-indigo-500" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {club.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"
                      >
                        <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.advisor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Advisor</span>
                    <span className="text-sm font-medium">{club.advisor.full_name}</span>
                  </div>
                )}
                {club.president && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">President</span>
                    <span className="text-sm font-medium">{club.president.full_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Button */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-white/90" />
                <h3 className="text-lg font-bold mb-2">Ready to Join?</h3>
                <p className="text-sm text-white/90 mb-4">Start your journey with {club.name} today!</p>
                {clubForm ? (
                  <Button
                    className="w-full bg-white text-green-600 hover:bg-gray-100"
                    onClick={() => setApplicationStep(2)}
                    disabled={loadingForm}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                ) : (
                  <p className="text-sm text-white/80">
                    {loadingForm ? "Loading application form..." : "No application form available at this time"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            {club.advisor && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Advisor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {applicationStep > 1 && clubForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-6 h-6 mr-3 text-green-500" />
                  {clubForm.title}
                </CardTitle>
                {clubForm.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {clubForm.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dynamic Form Questions */}
                <div className="space-y-5">
                  {clubForm.questions?.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {index + 1}. {question.question_text}
                        {question.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {/* Text Input */}
                      {question.question_type === 'text' && (
                        <Input
                          placeholder="Your answer..."
                          value={formAnswers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          required={question.is_required}
                        />
                      )}

                      {/* Textarea */}
                      {question.question_type === 'textarea' && (
                        <Textarea
                          placeholder="Your answer..."
                          value={formAnswers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="min-h-[100px]"
                          required={question.is_required}
                        />
                      )}

                      {/* Radio Buttons */}
                      {question.question_type === 'radio' && question.options && (
                        <RadioGroup
                          value={formAnswers[question.id] || ''}
                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                        >
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.option_text} id={option.id} />
                              <Label htmlFor={option.id} className="font-normal cursor-pointer">
                                {option.option_text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {/* Select */}
                      {question.question_type === 'select' && question.options && (
                        <select
                          value={formAnswers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required={question.is_required}
                        >
                          <option value="">Select an option...</option>
                          {question.options.map((option) => (
                            <option key={option.id} value={option.option_text}>
                              {option.option_text}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {/* Form Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationStep(1)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitApplication}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
