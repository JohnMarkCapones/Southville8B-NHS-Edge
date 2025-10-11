"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Calendar, Plus, Search, Edit, Eye, Clock, MapPin, Filter, Trash2, BookOpen } from "lucide-react"

export default function ClubsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const clubs = [
    {
      id: "math-club",
      name: "Mathematics Club",
      description: "Exploring the beauty and applications of mathematics through competitions and problem-solving",
      members: 24,
      meetings: "Tuesdays & Fridays 3:30 PM",
      location: "Math Laboratory",
      status: "active",
      category: "Academic",
      established: "2023-09-01",
      nextEvent: "Regional Math Olympiad",
      nextEventDate: "2024-03-15",
    },
    {
      id: "science-club",
      name: "Science Club",
      description: "Exploring the wonders of science through experiments and research",
      members: 18,
      meetings: "Wednesdays 3:30 PM",
      location: "Science Lab",
      status: "active",
      category: "Academic",
      established: "2023-09-01",
      nextEvent: "Science Fair Preparation",
      nextEventDate: "2024-01-25",
    },
    {
      id: "drama-club",
      name: "Drama Club",
      description: "Developing theatrical skills and putting on amazing performances",
      members: 16,
      meetings: "Fridays 4:00 PM",
      location: "Auditorium",
      status: "active",
      category: "Arts",
      established: "2023-08-15",
      nextEvent: "Spring Play Auditions",
      nextEventDate: "2024-01-30",
    },
  ]

  const categories = ["all", "Academic", "Arts", "Service", "Sports", "Technology", "Games"]
  const statuses = ["all", "active", "recruiting", "inactive"]

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || club.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || club.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleViewClub = (clubId: string) => {
    router.push(`/teacher/clubs/${clubId}`)
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Clubs</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your student clubs and activities</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Create New Club
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Create New Club</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Start a new student club or organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="club-name" className="dark:text-gray-200">
                  Club Name
                </Label>
                <Input
                  id="club-name"
                  placeholder="Enter club name"
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="club-category" className="dark:text-gray-200">
                  Category
                </Label>
                <Select>
                  <SelectTrigger className="w-40 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 backdrop-blur-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="academic" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Academic
                    </SelectItem>
                    <SelectItem value="arts" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Arts
                    </SelectItem>
                    <SelectItem value="sports" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Sports
                    </SelectItem>
                    <SelectItem value="games" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Games
                    </SelectItem>
                    <SelectItem value="service" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Service
                    </SelectItem>
                    <SelectItem value="technology" className="dark:text-gray-100 dark:hover:bg-gray-700">
                      Technology
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="dark:text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Club description and goals"
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="meeting-schedule" className="dark:text-gray-200">
                  Meeting Schedule
                </Label>
                <Input
                  id="meeting-schedule"
                  placeholder="e.g., Wednesdays 3:30 PM"
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="location" className="dark:text-gray-200">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Meeting location"
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500">
                Create Club
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 backdrop-blur-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 backdrop-blur-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="dark:text-gray-100 dark:hover:bg-gray-700">
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-100 backdrop-blur-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className="dark:text-gray-100 dark:hover:bg-gray-700">
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClubs.map((club) => (
          <Card
            key={club.id}
            className="hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {club.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={club.status === "active" ? "default" : "secondary"}
                      className={
                        club.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }
                    >
                      {club.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    >
                      {club.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    onClick={() => handleViewClub(club.id)}
                    title="View Club Dashboard"
                  >
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    title="Edit Club"
                  >
                    <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete Club"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">{club.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-gray-200">{club.members} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm dark:text-gray-300">Est. {new Date(club.established).getFullYear()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium dark:text-gray-200">{club.meetings}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{club.location}</span>
                </div>
              </div>

              {club.nextEvent && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Next Event</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{club.nextEvent}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{club.nextEventDate}</p>
                </div>
              )}

              <div
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg transition-all duration-200"
                onClick={() => handleViewClub(club.id)}
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Click to manage this club
                  <Eye className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No clubs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search terms or create a new club.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500">
                <Plus className="h-4 w-4 mr-2" />
                Create First Club
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  )
}
