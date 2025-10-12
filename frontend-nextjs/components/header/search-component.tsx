"use client"

import * as React from "react"
import { Search, X, Clock, TrendingUp, FileText, Users, Calendar } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  url: string
  icon: React.ReactNode
}

interface SearchComponentProps {
  className?: string
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Academic Calendar 2024",
    description: "View important dates and deadlines for the academic year",
    category: "Academics",
    url: "/academics/calendar",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    id: "2",
    title: "Student Clubs & Organizations",
    description: "Explore extracurricular activities and join student groups",
    category: "Student Life",
    url: "/student-life/clubs",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "3",
    title: "Spring Musical: Hamilton",
    description: "Drama department's professional-level production",
    category: "Events",
    url: "/events/spring-musical",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "4",
    title: "Science Fair 2024",
    description: "Annual showcase of student STEM projects",
    category: "Events",
    url: "/events/science-fair",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "5",
    title: "Athletics Programs",
    description: "Join our championship sports teams",
    category: "Athletics",
    url: "/athletics",
    icon: <Users className="w-4 h-4" />,
  },
]

const recentSearches = ["Academic Calendar", "Student Portal", "Graduation Requirements", "Club Registration"]

const trendingSearches = ["Spring Musical", "Science Fair", "Basketball Championship", "College Prep"]

export function SearchComponent({ className }: SearchComponentProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Handle search functionality
  React.useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true)
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filteredResults = mockSearchResults.filter(
          (result) =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase()) ||
            result.category.toLowerCase().includes(query.toLowerCase()),
        )
        setResults(filteredResults)
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [query])

  // Handle click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearchClick = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClearSearch = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery("")
    // Navigate to result URL
    window.location.href = result.url
  }

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Trigger Button */}
      <AnimatedButton
        variant="ghost"
        size="icon"
        onClick={handleSearchClick}
        className="hidden md:flex hover:bg-accent/50 hover:scale-110 transition-all duration-300 relative"
      >
        <Search className="w-4 h-4" />
        <span className="sr-only">Search</span>
      </AnimatedButton>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-300">
          <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl mx-4">
            <div className="bg-background border rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
              {/* Search Input */}
              <div className="flex items-center border-b px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for content, events, or information..."
                  className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {query && (
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="ml-2 h-8 w-8 hover:bg-accent"
                  >
                    <X className="w-4 h-4" />
                  </AnimatedButton>
                )}
                <div className="ml-3 flex items-center space-x-1 text-xs text-muted-foreground">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                  </div>
                ) : query && results.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
                      Search Results ({results.length})
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm group-hover:text-primary transition-colors">
                            {result.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{result.description}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {result.category}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query && results.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium">No results found</p>
                    <p className="text-xs text-muted-foreground">Try searching for something else</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Recent Searches */}
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        <span>Recent Searches</span>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickSearch(search)}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending Searches */}
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>Trending</span>
                      </div>
                      <div className="space-y-1">
                        {trendingSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickSearch(search)}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Tips */}
                    <div className="border-t pt-3">
                      <div className="text-xs text-muted-foreground">
                        <p className="mb-1">
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd> to search
                        </p>
                        <p>
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↑↓</kbd> to navigate
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
