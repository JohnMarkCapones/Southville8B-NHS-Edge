"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  X,
  Megaphone,
  Trophy,
  Cake,
  Star,
  Award,
  Calendar,
  Gift,
  PartyPopper,
  Sparkles,
  Crown,
  Heart,
  SnowflakeIcon as Confetti,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface CelebrationOverlayProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  type: "general" | "urgent" | "academic" | "event"
  date: Date
  author: string
}

interface Honor {
  id: string
  studentName: string
  achievement: string
  category: "academic" | "athletic" | "artistic" | "service"
  date: Date
  description: string
  avatar?: string
}

interface Birthday {
  id: string
  name: string
  role: "student" | "teacher" | "staff"
  grade?: number
  date: Date
  avatar?: string
  age?: number
}

export function CelebrationOverlay({ isOpen, onClose, className }: CelebrationOverlayProps) {
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  // Mock data
  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Spring Break Schedule",
      content: "Spring break will be from March 25-29. Classes resume on April 1st. Have a wonderful break!",
      type: "general",
      date: new Date("2024-03-15"),
      author: "Principal Davis",
    },
    {
      id: "2",
      title: "Science Fair Registration Open",
      content:
        "Registration for the annual science fair is now open. Deadline is April 15th. Prizes for top 3 projects!",
      type: "academic",
      date: new Date("2024-03-14"),
      author: "Ms. Johnson",
    },
    {
      id: "3",
      title: "Emergency Drill Tomorrow",
      content: "We will be conducting a fire drill tomorrow at 10:30 AM. Please follow evacuation procedures.",
      type: "urgent",
      date: new Date("2024-03-13"),
      author: "Safety Coordinator",
    },
    {
      id: "4",
      title: "Basketball Championship Game",
      content: "Come support our Eagles in the championship game this Friday at 7 PM at the State Arena!",
      type: "event",
      date: new Date("2024-03-12"),
      author: "Coach Wilson",
    },
  ]

  const honors: Honor[] = [
    {
      id: "1",
      studentName: "Emma Johnson",
      achievement: "National Merit Scholar Finalist",
      category: "academic",
      date: new Date("2024-03-15"),
      description: "Selected as a finalist for the prestigious National Merit Scholarship program.",
      avatar: "/placeholder.svg?height=40&width=40&text=EJ",
    },
    {
      id: "2",
      studentName: "Michael Chen",
      achievement: "State Math Competition Winner",
      category: "academic",
      date: new Date("2024-03-14"),
      description: "First place in the state mathematics competition, representing our school with excellence.",
    },
    {
      id: "3",
      studentName: "Sarah Williams",
      achievement: "Regional Track & Field Champion",
      category: "athletic",
      date: new Date("2024-03-13"),
      description: "Won first place in the 400m dash at the regional championship meet.",
      avatar: "/placeholder.svg?height=40&width=40&text=SW",
    },
    {
      id: "4",
      studentName: "David Kim",
      achievement: "Art Portfolio Excellence Award",
      category: "artistic",
      date: new Date("2024-03-12"),
      description: "Received recognition for outstanding artistic achievement in digital media.",
    },
    {
      id: "5",
      studentName: "Aisha Patel",
      achievement: "Community Service Leadership",
      category: "service",
      date: new Date("2024-03-11"),
      description: "Led 100+ hours of community service projects, inspiring fellow students.",
    },
  ]

  const birthdays: Birthday[] = [
    {
      id: "1",
      name: "Alex Martinez",
      role: "student",
      grade: 9,
      date: new Date("2024-03-16"),
      avatar: "/placeholder.svg?height=40&width=40&text=AM",
      age: 15,
    },
    {
      id: "2",
      name: "Ms. Rodriguez",
      role: "teacher",
      date: new Date("2024-03-16"),
      avatar: "/placeholder.svg?height=40&width=40&text=MR",
    },
    {
      id: "3",
      name: "Jordan Smith",
      role: "student",
      grade: 8,
      date: new Date("2024-03-17"),
      age: 14,
    },
    {
      id: "4",
      name: "Principal Davis",
      role: "staff",
      date: new Date("2024-03-18"),
      avatar: "/placeholder.svg?height=40&width=40&text=PD",
    },
    {
      id: "5",
      name: "Isabella Garcia",
      role: "student",
      grade: 10,
      date: new Date("2024-03-19"),
      age: 16,
    },
  ]

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <Megaphone className="w-5 h-5 text-red-500" />
      case "academic":
        return <Star className="w-5 h-5 text-blue-500" />
      case "event":
        return <Calendar className="w-5 h-5 text-purple-500" />
      default:
        return <Megaphone className="w-5 h-5 text-green-500" />
    }
  }

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-red-500 bg-red-50 dark:bg-red-950/20"
      case "academic":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
      case "event":
        return "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
      default:
        return "border-green-500 bg-green-50 dark:bg-green-950/20"
    }
  }

  const getHonorIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case "athletic":
        return <Award className="w-5 h-5 text-orange-500" />
      case "artistic":
        return <Sparkles className="w-5 h-5 text-pink-500" />
      case "service":
        return <Heart className="w-5 h-5 text-green-500" />
      default:
        return <Star className="w-5 h-5 text-blue-500" />
    }
  }

  const getHonorColor = (category: string) => {
    switch (category) {
      case "academic":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "athletic":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
      case "artistic":
        return "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
      case "service":
        return "border-green-500 bg-green-50 dark:bg-green-950/20"
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isGamingTheme
            ? "bg-gradient-to-br from-gaming-dark via-gaming-accent to-gaming-darker"
            : "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
        )}
        onClick={onClose}
      />

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full animate-float opacity-60",
              isGamingTheme ? "bg-gaming-neon-green" : "bg-white",
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "relative w-full max-w-6xl h-[90vh] mx-4 rounded-2xl shadow-2xl backdrop-blur-xl border animate-fadeIn",
          isGamingTheme ? "bg-gaming-dark/95 border-gaming-neon-green/30" : "bg-background/95 border-white/20",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between p-6 border-b rounded-t-2xl",
            isGamingTheme ? "bg-gaming-accent/50 border-gaming-neon-green/20" : "bg-white/10 border-white/20",
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isGamingTheme
                  ? "bg-gradient-to-r from-gaming-neon-green to-gaming-neon-blue animate-gamingPulse"
                  : "bg-gradient-to-r from-yellow-400 to-orange-500",
              )}
            >
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", isGamingTheme ? "text-gaming-neon-green" : "text-white")}>
                School Celebrations
              </h1>
              <p className={cn("text-sm opacity-90", isGamingTheme ? "text-gaming-neon-blue" : "text-white")}>
                Announcements, Honors & Birthdays
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "text-white hover:bg-white/20 rounded-full",
              isGamingTheme && "hover:bg-gaming-accent text-gaming-neon-green",
            )}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="announcements" className="flex-1 flex flex-col">
          <TabsList
            className={cn("grid w-full grid-cols-3 m-6 mb-0", isGamingTheme ? "bg-gaming-accent" : "bg-white/10")}
          >
            <TabsTrigger
              value="announcements"
              className={cn(
                "text-white data-[state=active]:text-foreground",
                isGamingTheme && "data-[state=active]:bg-gaming-neon-green data-[state=active]:text-gaming-dark",
              )}
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="honors"
              className={cn(
                "text-white data-[state=active]:text-foreground",
                isGamingTheme && "data-[state=active]:bg-gaming-neon-green data-[state=active]:text-gaming-dark",
              )}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Honors
            </TabsTrigger>
            <TabsTrigger
              value="birthdays"
              className={cn(
                "text-white data-[state=active]:text-foreground",
                isGamingTheme && "data-[state=active]:bg-gaming-neon-green data-[state=active]:text-gaming-dark",
              )}
            >
              <Cake className="w-4 h-4 mr-2" />
              Birthdays
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="flex-1 p-6 pt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card
                    key={announcement.id}
                    className={cn(
                      "border-l-4 transition-all duration-300 hover:scale-105",
                      getAnnouncementColor(announcement.type),
                      isGamingTheme && "bg-gaming-dark/90 border-gaming-neon-green/20",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getAnnouncementIcon(announcement.type)}
                          <div>
                            <CardTitle
                              className={cn("text-lg", isGamingTheme ? "text-gaming-neon-green" : "text-foreground")}
                            >
                              {announcement.title}
                            </CardTitle>
                            <CardDescription
                              className={cn(
                                "text-sm",
                                isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground",
                              )}
                            >
                              By {announcement.author} • {announcement.date.toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("capitalize", isGamingTheme && "bg-gaming-accent text-gaming-neon-green")}
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isGamingTheme ? "text-gaming-neon-blue" : "text-foreground",
                        )}
                      >
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Honors Tab */}
          <TabsContent value="honors" className="flex-1 p-6 pt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {honors.map((honor) => (
                  <Card
                    key={honor.id}
                    className={cn(
                      "border-l-4 transition-all duration-300 hover:scale-105",
                      getHonorColor(honor.category),
                      isGamingTheme && "bg-gaming-dark/90 border-gaming-neon-green/20",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={honor.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-sm font-semibold">
                            {honor.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getHonorIcon(honor.category)}
                            <CardTitle
                              className={cn("text-lg", isGamingTheme ? "text-gaming-neon-green" : "text-foreground")}
                            >
                              {honor.studentName}
                            </CardTitle>
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                          <CardDescription
                            className={cn(
                              "text-sm font-medium",
                              isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground",
                            )}
                          >
                            {honor.achievement}
                          </CardDescription>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              isGamingTheme ? "text-gaming-neon-blue/70" : "text-muted-foreground",
                            )}
                          >
                            {honor.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("capitalize", isGamingTheme && "bg-gaming-accent text-gaming-neon-green")}
                        >
                          {honor.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isGamingTheme ? "text-gaming-neon-blue" : "text-foreground",
                        )}
                      >
                        {honor.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Birthdays Tab */}
          <TabsContent value="birthdays" className="flex-1 p-6 pt-4">
            <div className="relative">
              {/* Celebration animations */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random()}s`,
                    }}
                  >
                    {i % 3 === 0 && <Confetti className="w-4 h-4 text-yellow-400" />}
                    {i % 3 === 1 && <Gift className="w-4 h-4 text-pink-400" />}
                    {i % 3 === 2 && <Sparkles className="w-4 h-4 text-blue-400" />}
                  </div>
                ))}
              </div>

              <ScrollArea className="h-full relative z-10">
                <div className="space-y-4">
                  {birthdays.map((birthday) => (
                    <Card
                      key={birthday.id}
                      className={cn(
                        "border-l-4 border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 transition-all duration-300 hover:scale-105 animate-pulse",
                        isGamingTheme &&
                          "bg-gaming-dark/90 border-gaming-neon-pink from-gaming-accent/20 to-gaming-accent/30",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 ring-4 ring-pink-200 dark:ring-pink-800">
                              <AvatarImage src={birthday.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                {birthday.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-spin">
                              <Cake className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className={cn(
                                  "text-xl font-bold",
                                  isGamingTheme ? "text-gaming-neon-pink" : "text-foreground",
                                )}
                              >
                                🎉 {birthday.name}
                              </h3>
                              <PartyPopper className="w-5 h-5 text-pink-500 animate-bounce" />
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "capitalize bg-gradient-to-r from-pink-400 to-purple-400 text-white",
                                  isGamingTheme && "from-gaming-neon-pink to-gaming-neon-purple",
                                )}
                              >
                                {birthday.role}
                                {birthday.grade && ` - Grade ${birthday.grade}`}
                              </Badge>
                              {birthday.age && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border-pink-400 text-pink-600",
                                    isGamingTheme && "border-gaming-neon-pink text-gaming-neon-pink",
                                  )}
                                >
                                  Turning {birthday.age}!
                                </Badge>
                              )}
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground",
                                )}
                              >
                                {birthday.date.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl animate-bounce">🎂</div>
                            <p
                              className={cn(
                                "text-xs font-medium mt-1",
                                isGamingTheme ? "text-gaming-neon-pink" : "text-pink-600",
                              )}
                            >
                              Happy Birthday!
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
