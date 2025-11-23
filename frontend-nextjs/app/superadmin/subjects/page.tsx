"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSubjects } from "@/hooks/useSubjects"
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  GraduationCap,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SubjectsPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    subjects, 
    loading, 
    error, 
    pagination, 
    loadSubjects, 
    removeSubject, 
    searchSubjects,
    clearError 
  } = useSubjects()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<string>("desc")

  // Load subjects on mount
  useEffect(() => {
    loadSubjects({
      page: 1,
      limit: 20,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    })
  }, [])

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    await searchSubjects(query)
  }

  // Handle filter change
  const handleFilterChange = async (filter: string) => {
    setStatusFilter(filter)
    // Apply filter logic here
    await loadSubjects({
      page: 1,
      limit: 20,
      search: searchQuery,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    })
  }

  // Handle sort change
  const handleSortChange = async (field: string, order: string) => {
    setSortBy(field)
    setSortOrder(order)
    await loadSubjects({
      page: 1,
      limit: 20,
      search: searchQuery,
      sortBy: field as any,
      sortOrder: order as any,
    })
  }

  // Handle delete subject
  const handleDeleteSubject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      const success = await removeSubject(id)
      if (success) {
        toast({
          title: "✅ Subject Deleted",
          description: `${name} has been successfully deleted.`,
          duration: 3000,
        })
      }
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'archived':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Get visibility badge variant
  const getVisibilityBadgeVariant = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'default'
      case 'students':
        return 'secondary'
      case 'restricted':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects Management</h1>
          <p className="text-muted-foreground">Manage academic subjects and curriculum</p>
        </div>
        <Button onClick={() => router.push("/superadmin/subjects/create")} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Subject
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search subjects by name or code..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40 bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                handleSortChange(field, order)
              }}>
                <SelectTrigger className="w-48 bg-background border-border text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="subject_name-asc">Name A-Z</SelectItem>
                  <SelectItem value="subject_name-desc">Name Z-A</SelectItem>
                  <SelectItem value="code-asc">Code A-Z</SelectItem>
                  <SelectItem value="code-desc">Code Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Error Loading Subjects</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={clearError} className="ml-auto">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading subjects...</span>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {!loading && subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {subject.subject_name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      {subject.code}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => router.push(`/superadmin/subjects/${subject.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/superadmin/subjects/${subject.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Subject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSubject(subject.id, subject.subject_name)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Subject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subject.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusBadgeVariant(subject.status)}>
                    {subject.status}
                  </Badge>
                  <Badge variant={getVisibilityBadgeVariant(subject.visibility)}>
                    {subject.visibility}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>Grade Levels:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subject.grade_levels.map((level, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Created {new Date(subject.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>0 teachers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Subjects Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery ? 
                `No subjects match your search for "${searchQuery}". Try adjusting your search terms.` :
                "Get started by creating your first subject. Subjects help organize your academic curriculum."
              }
            </p>
            <Button onClick={() => router.push("/superadmin/subjects/create")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create First Subject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => loadSubjects({ 
              ...pagination, 
              page: pagination.page - 1 
            })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => loadSubjects({ 
              ...pagination, 
              page: pagination.page + 1 
            })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default SubjectsPage