"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Calendar, Search, Edit, Eye, Clock, MapPin, Filter, BookOpen, Loader2 } from "lucide-react"
import { useTeacherClubs } from "@/hooks"

export default function ClubsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Fetch clubs from API where teacher is advisor or co-advisor
  const { data: clubs = [], isLoading, isError, error } = useTeacherClubs()

  // Extract unique categories from actual club data
  const categories = ["all", ...Array.from(new Set(clubs.map(club => club.domain?.name).filter(Boolean)))]
  const statuses = ["all", "active", "recruiting", "inactive"]

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || club.domain?.name === selectedCategory
    // Note: status field not in current API, so we'll ignore it for now
    const matchesStatus = selectedStatus === "all" // || club.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleViewClub = (clubId: string) => {
    router.push(`/teacher/clubs/${clubId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your clubs...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto mt-20">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Clubs</h3>
          <p className="text-red-600 dark:text-red-300">{error?.message || 'Failed to load clubs. Please try again later.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Clubs</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage clubs where you are advisor or co-advisor</p>
        </div>
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
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    >
                      {club.domain?.name || 'No Category'}
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
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">{club.description || 'No description available'}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-gray-200">View members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm dark:text-gray-300">Est. {new Date(club.created_at).getFullYear()}</span>
                </div>
              </div>

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
          <p className="text-gray-600 dark:text-gray-400">
            {clubs.length === 0
              ? "You are not assigned as advisor to any clubs yet."
              : "Try adjusting your search terms or filters."}
          </p>
        </div>
      )}
    </div>
  )
}
