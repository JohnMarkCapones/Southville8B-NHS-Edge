"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import StudentLayout from "@/components/student/student-layout"
import Link from "next/link"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageCircle,
  Eye,
  Trash2,
  RefreshCw,
  Award,
  Users,
  Loader2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect, useMemo } from "react"
import { getUserClubFormResponses, withdrawClubApplication, generateClubSlug } from "@/lib/api/endpoints/clubs"
import type { ClubFormResponse } from "@/lib/api/types/clubs"
import { useToast } from "@/hooks/use-toast"

export default function MyApplicationsPage() {
  const { toast } = useToast()
  const [myApplications, setMyApplications] = useState<ClubFormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const responses = await getUserClubFormResponses()
        setMyApplications(responses || [])
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast({
          title: "Error",
          description: "Failed to load your applications.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [toast])

  const stats = useMemo(() => {
    const withdrawnCount = myApplications.filter((app) => 
      app.status === 'rejected' && app.review_notes === 'Application withdrawn by student'
    ).length;
    
    return {
      total: myApplications.length,
      pending: myApplications.filter((app) => app.status === "pending").length,
      approved: myApplications.filter((app) => app.status === "approved").length,
      rejected: myApplications.filter((app) => 
        app.status === "rejected" && app.review_notes !== 'Application withdrawn by student'
      ).length,
      withdrawn: withdrawnCount,
    }
  }, [myApplications])

  // Transform backend data to display format
  const displayApplications = useMemo(() => {
    return myApplications.map((app: any) => {
      // Check if application was withdrawn by student
      const isWithdrawn = app.status === 'rejected' && 
        app.review_notes === 'Application withdrawn by student';
      
      return {
        id: app.id,
        clubName: app.form?.club?.name || 'Unknown Club',
        clubId: app.form?.club?.id,
        clubSlug: app.form?.club?.name ? generateClubSlug(app.form.club.name) : '',
        formName: app.form?.name || 'Application Form',
        appliedDate: app.created_at,
        status: isWithdrawn ? 'withdrawn' : app.status,
        advisor: app.form?.club?.advisor?.full_name || 'N/A',
        advisorEmail: app.form?.club?.advisor?.email,
        lastUpdated: app.updated_at,
        reviewedDate: app.reviewed_at,
        reviewedBy: app.reviewed_by_user?.full_name,
        reviewNotes: app.review_notes,
        answers: app.answers || [],
      }
    })
  }, [myApplications])

  const handleWithdrawClick = (applicationId: number) => {
    setSelectedApplication(applicationId)
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = async () => {
    if (selectedApplication) {
      try {
        await withdrawClubApplication(selectedApplication.toString())
        
        // Refresh applications list
        const responses = await getUserClubFormResponses()
        setMyApplications(responses || [])
        
        toast({
          title: "Application Withdrawn",
          description: "Your club application has been successfully withdrawn.",
        })
      } catch (error) {
        console.error('Error withdrawing application:', error)
        toast({
          title: "Error",
          description: "Failed to withdraw application. Please try again.",
          variant: "destructive",
        })
      } finally {
        setWithdrawDialogOpen(false)
        setSelectedApplication(null)
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading your applications...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Keeping previous mock data structure for reference
  const mockApplications = [
    {
      id: 1,
      clubName: "Drama Club",
      clubCategory: "Arts",
      appliedDate: "2024-03-10",
      status: "pending",
      advisor: "Ms. Torres",
      reason: "I've always been passionate about drama and theater.",
      experience: "Participated in 3 school plays",
      lastUpdated: "2024-03-10",
      estimatedReview: "2-3 days",
      clubSlug: "drama-club",
    },
    {
      id: 2,
      clubName: "Robotics Club",
      clubCategory: "Technology",
      appliedDate: "2024-03-08",
      status: "approved",
      advisor: "Mr. Chen",
      reason: "I want to learn programming and build robots.",
      experience: "Basic Arduino knowledge",
      lastUpdated: "2024-03-09",
      reviewedDate: "2024-03-09",
      approvedBy: "Mr. Chen",
      nextSteps: "Attend orientation on March 15 at 3:00 PM in Room 204",
      clubSlug: "robotics-club",
    },
    {
      id: 3,
      clubName: "Debate Society",
      clubCategory: "Academic",
      appliedDate: "2024-03-05",
      status: "rejected",
      advisor: "Mrs. Gonzales",
      reason: "I want to improve my public speaking skills.",
      experience: "No prior debate experience",
      lastUpdated: "2024-03-06",
      reviewedDate: "2024-03-06",
      rejectionReason: "Club is currently at full capacity. You may reapply next semester.",
      canReapply: true,
      reapplyDate: "2024-06-01",
      clubSlug: "debate-society",
    },
    {
      id: 4,
      clubName: "Environmental Club",
      clubCategory: "Service",
      appliedDate: "2024-03-12",
      status: "interview",
      advisor: "Ms. Reyes",
      reason: "I'm passionate about environmental conservation.",
      experience: "Volunteer at local beach cleanups",
      lastUpdated: "2024-03-13",
      interviewDate: "2024-03-18",
      interviewTime: "3:30 PM",
      interviewLocation: "Garden Area",
      clubSlug: "environmental-club",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "interview":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
            <Calendar className="w-3 h-3 mr-1" />
            Interview Scheduled
          </Badge>
        )
      case "withdrawn":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300">
            <XCircle className="w-3 h-3 mr-1" />
            Withdrawn
          </Badge>
        )
      default:
        return null
    }
  }


  return (
    <StudentLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Club Applications</h1>
                <p className="text-white/90 text-lg">Track the status of your club membership applications</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-white/80">Total</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-sm text-white/80">Pending</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <div className="text-sm text-white/80">Approved</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                  <div className="text-sm text-white/80">Rejected</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.withdrawn}</div>
                  <div className="text-sm text-white/80">Withdrawn</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List or Empty State */}
        {displayApplications.length > 0 ? (
          <div className="space-y-6">
            {displayApplications.map((application) => (
            <Card
              key={application.id}
              className="border-2 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{application.clubName}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(application.status)}
                        <Badge variant="outline" className="text-xs">
                          {application.formName}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Application Timeline */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Status</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(application.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      application.status === "pending"
                        ? 50
                        : application.status === "approved"
                          ? 100
                          : application.status === "withdrawn"
                            ? 0
                            : 0
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Submitted</span>
                    <span>Under Review</span>
                    <span>Decision</span>
                  </div>
                </div>

                {/* Status-specific Information */}
                {application.status === "pending" && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                          Application Under Review
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Your application is being reviewed by {application.advisor}. You will be notified once a decision is made.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === "approved" && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                          Congratulations! Application Approved
                        </p>
                        {application.reviewedDate && (
                          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            Approved {application.reviewedBy ? `by ${application.reviewedBy}` : ''} on{" "}
                            {new Date(application.reviewedDate).toLocaleDateString()}
                          </p>
                        )}
                        {application.reviewNotes && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {application.status === "rejected" && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                          Application Not Approved
                        </p>
                        {application.reviewedDate && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Reviewed on {new Date(application.reviewedDate).toLocaleDateString()}
                          </p>
                        )}
                        {application.reviewNotes && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {application.status === "withdrawn" && (
                  <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Application Withdrawn
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You have withdrawn this application. You can reapply to this club in the future if you change your mind.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Club Advisor</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.advisor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Application Form</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.formName}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700">
                  <Link href={`/student/clubs/${application.clubSlug}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Eye className="w-4 h-4 mr-2" />
                      View Club
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      console.log("[v0] Opening message to advisor")
                      // TODO: Connect to messaging system
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Advisor
                  </Button>
                  {application.status === "pending" && (
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                      onClick={() => handleWithdrawClick(application.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  )}
                  {application.status === "withdrawn" && (
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900/20 bg-transparent"
                      disabled
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Withdrawn
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          // Empty State
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't applied to any clubs yet. Explore available clubs and start your journey!
              </p>
              <Link href="/student/clubs">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <Award className="w-4 h-4 mr-2" />
                  Discover Clubs
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application? This action cannot be undone and you will need to
              reapply if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudentLayout>
  )
}
