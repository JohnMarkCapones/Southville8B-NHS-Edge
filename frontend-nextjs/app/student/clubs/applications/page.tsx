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
import { useState } from "react"

export default function MyApplicationsPage() {
  // Mock application data
  const myApplications = [
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
      default:
        return null
    }
  }

  const stats = {
    total: myApplications.length,
    pending: myApplications.filter((app) => app.status === "pending").length,
    approved: myApplications.filter((app) => app.status === "approved").length,
    rejected: myApplications.filter((app) => app.status === "rejected").length,
  }

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)

  const handleWithdrawClick = (applicationId: number) => {
    setSelectedApplication(applicationId)
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = () => {
    if (selectedApplication) {
      console.log("[v0] Withdrawing application:", selectedApplication)
      // TODO: Connect to backend API
      setWithdrawDialogOpen(false)
      setSelectedApplication(null)
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {myApplications.map((application) => (
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
                          {application.clubCategory}
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
                        ? 33
                        : application.status === "interview"
                          ? 66
                          : application.status === "approved"
                            ? 100
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
                          Your application is being reviewed by {application.advisor}. Estimated review time:{" "}
                          {application.estimatedReview}
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
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                          Approved by {application.approvedBy} on{" "}
                          {new Date(application.reviewedDate!).toLocaleDateString()}
                        </p>
                        {application.nextSteps && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Next Steps:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.nextSteps}</p>
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
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                          Reviewed on {new Date(application.reviewedDate!).toLocaleDateString()}
                        </p>
                        {application.rejectionReason && (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mt-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.rejectionReason}</p>
                          </div>
                        )}
                        {application.canReapply && (
                          <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            You can reapply starting {new Date(application.reapplyDate!).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {application.status === "interview" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Interview Scheduled
                        </p>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mt-2 space-y-2">
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">
                              {new Date(application.interviewDate!).toLocaleDateString()} at {application.interviewTime}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Location: {application.interviewLocation}</span>
                          </div>
                        </div>
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
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Experience</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.experience}</p>
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
                  {application.status === "rejected" && application.canReapply && (
                    <Link href={`/student/clubs/${application.clubSlug}/join`}>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reapply
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {myApplications.length === 0 && (
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
