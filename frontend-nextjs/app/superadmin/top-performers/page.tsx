"use client"

import type React from "react"

import { useState, useRef, useMemo, useEffect } from "react"
import { useTopPerformers } from "@/hooks/useTopPerformers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Download,
  MoreVertical,
  Trophy,
  Award,
  FileText,
  Eye,
  Mail,
  TrendingUp,
  Target,
  Star,
  Medal,
  Crown,
  ChevronDown,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AwardStatus = "Active" | "Archived"

interface TopPerformer {
  id: string
  rank: number
  studentId: string
  name: string
  gradeLevel: number
  section: string
  achievement: string
  gwa: number // Renamed from gpa to gwa
  recognitionDate: string
  status: AwardStatus
}

export default function TopPerformersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("current-quarter")
  const [gradeLevel, setGradeLevel] = useState("all")
  const [category, setCategory] = useState("all")
  const [topN, setTopN] = useState("10")
  const [selectedPerformer, setSelectedPerformer] = useState<TopPerformer | null>(null)

  // Use the API hook
  const {
    performers: topPerformers,
    stats,
    loading,
    error,
    fetchTopPerformers,
    refetch,
  } = useTopPerformers({
    initialParams: {
      timePeriod: timePeriod as any,
      gradeLevel: gradeLevel as any,
      topN: parseInt(topN),
    },
  })

  // Confirmation modals
  const [showAwardModal, setShowAwardModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<AwardStatus | null>(null)

  // Form states
  const [awardTitle, setAwardTitle] = useState("")
  const [awardDescription, setAwardDescription] = useState("")
  const [messageContent, setMessageContent] = useState("")

  // Stats are now provided by the API hook
  const calculatedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      totalHonorStudents: stats.totalHonorStudents,
      honorRollStudents: stats.honorRollStudents,
      perfectGwaStudents: stats.perfectGwaStudents,
      gradeDistribution: stats.gradeDistribution,
    };
  }, [stats]);

  const filteredPerformers = useMemo(() => {
    return topPerformers.filter((performer) => {
      const matchesSearch =
        performer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        performer.studentId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGrade = gradeLevel === "all" || performer.gradeLevel.toString() === gradeLevel

      return matchesSearch && matchesGrade
    }).slice(0, Number.parseInt(topN))
  }, [topPerformers, searchQuery, gradeLevel, topN])

  const handleStatusChange = (performer: TopPerformer, newStatus: AwardStatus) => {
    setSelectedPerformer(performer)
    setPendingStatus(newStatus)
    setShowStatusChangeModal(true)
  }

  const confirmStatusChange = () => {
    if (selectedPerformer && pendingStatus) {
      // TODO: Implement API call to update student status
      console.log(`Updating status for ${selectedPerformer.name} to ${pendingStatus}`)
      // After successful API call, refetch the data
      refetch()
    }
    setShowStatusChangeModal(false)
    setSelectedPerformer(null)
    setPendingStatus(null)
  }

  const handleAwardRecognition = (performer: TopPerformer) => {
    setSelectedPerformer(performer)
    setShowAwardModal(true)
  }

  const confirmAwardRecognition = () => {
    console.log("[v0] Awarding recognition to:", selectedPerformer?.name)
    setShowAwardModal(false)
    setSelectedPerformer(null)
    setAwardTitle("")
    setAwardDescription("")
  }

  const handleGenerateCertificate = (performer: TopPerformer) => {
    setSelectedPerformer(performer)
    setShowCertificateModal(true)
  }

  const confirmGenerateCertificate = () => {
    console.log("[v0] Generating certificate for:", selectedPerformer?.name)
    setShowCertificateModal(false)
    setSelectedPerformer(null)
  }

  const handleSendMessage = (performer: TopPerformer) => {
    setSelectedPerformer(performer)
    setShowMessageModal(true)
  }

  const confirmSendMessage = () => {
    console.log("[v0] Sending message to:", selectedPerformer?.name)
    setShowMessageModal(false)
    setSelectedPerformer(null)
    setMessageContent("")
  }

  const handleArchive = (performer: TopPerformer) => {
    setSelectedPerformer(performer)
    setShowArchiveModal(true)
  }

  const confirmArchive = () => {
    if (selectedPerformer) {
      // TODO: Implement API call to archive student
      console.log(`Archiving ${selectedPerformer.name}`)
      // After successful API call, refetch the data
      refetch()
    }
    setShowArchiveModal(false)
    setSelectedPerformer(null)
  }

  const handleViewDetails = (performer: TopPerformer) => {
    setSelectedPerformer(performer)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status: AwardStatus) => {
    return status === "Active"
      ? "bg-green-500/10 text-green-700 dark:text-green-400"
      : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <Star className="h-5 w-5 text-gray-400" />
  }

  const dropdownRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const handleContextMenu = (e: React.MouseEvent, performer: TopPerformer) => {
    e.preventDefault()
    const trigger = dropdownRefs.current[performer.id]
    if (trigger) {
      trigger.click()
    }
  }

  // Handle filter changes
  const handleFilterChange = async () => {
    await fetchTopPerformers({
      search: searchQuery,
      timePeriod: timePeriod as any,
      gradeLevel: gradeLevel as any,
      topN: parseInt(topN),
    })
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        handleFilterChange()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, timePeriod, gradeLevel, topN])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Performers</h1>
          <p className="text-muted-foreground">Track and recognize high-achieving students</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Honor Students</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats?.totalHonorStudents || 0}</div>
            <p className="text-xs text-muted-foreground">All grade levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade 7</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats?.gradeDistribution.grade7 || 0}</div>
            <p className="text-xs text-muted-foreground">Honor students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade 8</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats?.gradeDistribution.grade8 || 0}</div>
            <p className="text-xs text-muted-foreground">Honor students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade 9</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats?.gradeDistribution.grade9 || 0}</div>
            <p className="text-xs text-muted-foreground">Honor students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade 10</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStats?.gradeDistribution.grade10 || 0}</div>
            <p className="text-xs text-muted-foreground">Honor students</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="school-year">School Year</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Show Top</Label>
              <Select value={topN} onValueChange={setTopN}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading top performers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Grade & Section</TableHead>
                <TableHead>GWA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformers.map((performer) => (
                <TableRow
                  key={performer.id}
                  className="cursor-context-menu"
                  onContextMenu={(e) => handleContextMenu(e, performer)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(performer.rank)}
                      <span className="font-semibold">{performer.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{performer.name}</div>
                      <div className="text-sm text-muted-foreground">{performer.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    Grade {performer.gradeLevel} - {performer.section}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{performer.gwa}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge variant="outline" className={`cursor-pointer ${getStatusColor(performer.status)}`}>
                          {performer.status}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(performer, "Active")}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(performer, "Archived")}>
                          Archived
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          ref={(el) => {
                            dropdownRefs.current[performer.id] = el
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(performer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAwardRecognition(performer)}>
                          <Award className="mr-2 h-4 w-4" />
                          Award Recognition
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateCertificate(performer)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Certificate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(performer)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Congratulations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleStatusChange(performer, "Active")}>
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(performer, "Archived")}>
                              Archived
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedPerformer?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-3">Student Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedPerformer?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedPerformer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade Level:</span>
                  <span className="font-medium">Grade {selectedPerformer?.gradeLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-medium">{selectedPerformer?.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rank:</span>
                  <span className="font-medium">#{selectedPerformer?.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GWA:</span>
                  <span className="font-medium">{selectedPerformer?.gwa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achievement:</span>
                  <span className="font-medium">{selectedPerformer?.achievement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recognition Date:</span>
                  <span className="font-medium">
                    {new Date(selectedPerformer?.recognitionDate || "").toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={getStatusColor(selectedPerformer?.status || "Active")}>
                    {selectedPerformer?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Award Recognition Modal */}
      <Dialog open={showAwardModal} onOpenChange={setShowAwardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Recognition</DialogTitle>
            <DialogDescription>
              Award recognition to {selectedPerformer?.name} for their outstanding achievement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Student Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedPerformer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedPerformer?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade & Section:</span>
                  <span className="font-medium">
                    Grade {selectedPerformer?.gradeLevel} - {selectedPerformer?.section}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current GWA:</span>
                  <span className="font-medium">{selectedPerformer?.gwa}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="award-title">Award Title</Label>
              <Input
                id="award-title"
                placeholder="e.g., Academic Excellence Award"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="award-description">Description</Label>
              <Textarea
                id="award-description"
                placeholder="Describe the achievement..."
                value={awardDescription}
                onChange={(e) => setAwardDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This will add a new award to the student's record. The student will be notified
                via email.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAwardRecognition}>Award Recognition</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Certificate Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogDescription>Generate a certificate of recognition for {selectedPerformer?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Certificate Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedPerformer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedPerformer?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achievement:</span>
                  <span className="font-medium">{selectedPerformer?.achievement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GWA:</span>
                  <span className="font-medium">{selectedPerformer?.gwa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedPerformer?.recognitionDate || "").toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>Info:</strong> The certificate will be generated as a PDF and can be downloaded or emailed to
                the student. It will include the school logo and authorized signatures.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmGenerateCertificate}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Congratulations</DialogTitle>
            <DialogDescription>Send a congratulatory message to {selectedPerformer?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Recipient Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedPerformer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedPerformer?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achievement:</span>
                  <span className="font-medium">{selectedPerformer?.achievement}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Write your congratulatory message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>Note:</strong> This message will be sent to the student's registered email address and will also
                appear in their portal notifications.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendMessage}>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <Dialog open={showStatusChangeModal} onOpenChange={setShowStatusChangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedPerformer?.name}'s recognition to <strong>{pendingStatus}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold mb-2">Current Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedPerformer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedPerformer?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achievement:</span>
                  <span className="font-medium">{selectedPerformer?.achievement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant="outline" className={getStatusColor(selectedPerformer?.status || "Active")}>
                    {selectedPerformer?.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Status:</span>
                  <Badge variant="outline" className={getStatusColor(pendingStatus || "Active")}>
                    {pendingStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Warning:</strong>{" "}
                {pendingStatus === "Archived"
                  ? "Archiving this recognition will remove it from the active leaderboard but keep it in the student's history."
                  : "Activating this recognition will make it visible on the leaderboard again."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusChangeModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
