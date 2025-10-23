"use client"

import { useState, useEffect, useRef } from "react"
import { StudentLayout } from "@/components/student/student-layout"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { formatDate, formatTime } from "@/lib/utils/dateUtils"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Coffee,
  BookOpen,
  Target,
  TrendingUp,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Award,
  Zap,
  Clock,
  BarChart3,
  Trophy,
  Brain,
  Heart,
  CheckCircle,
  Timer,
} from "lucide-react"

interface PomodoroSession {
  id: string
  date: Date
  focusTime: number
  breakTime: number
  completedCycles: number
  mood?: "great" | "good" | "okay" | "tired"
  productivity?: number
}

interface TimerSettings {
  focusTime: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  soundEnabled: boolean
  soundType: string
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  darkMode: boolean
  notifications: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

type TimerState = "focus" | "shortBreak" | "longBreak" | "idle"

export default function PomodoroPage() {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [completedCycles, setCompletedCycles] = useState(0)
  
  // Use reliable localStorage hooks
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>("pomodoro-sessions-v2", [])
  const [settings, setSettings] = useLocalStorage<TimerSettings>("pomodoro-settings-v2", {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    soundType: "bell",
    autoStartBreaks: false,
    autoStartPomodoros: false,
    darkMode: false,
    notifications: true,
  })
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>("pomodoro-achievements-v2", [])
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const initializeAchievements = () => {
    return [
      {
        id: "first-session",
        title: "First Steps",
        description: "Complete your first Pomodoro session",
        icon: "🎯",
        unlocked: false,
      },
      {
        id: "daily-warrior",
        title: "Daily Warrior",
        description: "Complete 8 Pomodoros in one day",
        icon: "⚔️",
        unlocked: false,
      },
      {
        id: "week-streak",
        title: "Week Streak",
        description: "Use Pomodoro for 7 consecutive days",
        icon: "🔥",
        unlocked: false,
      },
      {
        id: "focus-master",
        title: "Focus Master",
        description: "Complete 100 Pomodoro sessions",
        icon: "🧠",
        unlocked: false,
      },
      {
        id: "early-bird",
        title: "Early Bird",
        description: "Start a session before 8 AM",
        icon: "🌅",
        unlocked: false,
      },
      {
        id: "night-owl",
        title: "Night Owl",
        description: "Complete a session after 10 PM",
        icon: "🦉",
        unlocked: false,
      },
    ]
  }

  // Initialize achievements if empty and ensure dates are proper
  useEffect(() => {
    if (achievements.length === 0) {
      setAchievements(initializeAchievements())
    } else {
      // Ensure all dates are properly converted to Date objects
      const achievementsWithProperDates = achievements.map(achievement => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? 
          (achievement.unlockedAt instanceof Date ? achievement.unlockedAt : new Date(achievement.unlockedAt)) : 
          undefined,
      }))
      
      // Only update if dates were actually converted
      const needsUpdate = achievements.some(achievement => 
        achievement.unlockedAt && !(achievement.unlockedAt instanceof Date)
      )
      
      if (needsUpdate) {
        setAchievements(achievementsWithProperDates)
      }
    }
  }, [achievements.length, setAchievements])

  // Ensure session dates are proper
  useEffect(() => {
    if (sessions.length > 0) {
      const sessionsWithProperDates = sessions.map(session => ({
        ...session,
        date: session.date instanceof Date ? session.date : new Date(session.date),
      }))
      
      // Only update if dates were actually converted
      const needsUpdate = sessions.some(session => 
        !(session.date instanceof Date)
      )
      
      if (needsUpdate) {
        setSessions(sessionsWithProperDates)
      }
    }
  }, [sessions.length, setSessions])

  // Initialize audio with different sound types
  useEffect(() => {
    audioRef.current = new Audio(`/sounds/${settings.soundType}.mp3`)
  }, [settings.soundType])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Play notification sound
    if (audioRef.current && settings.soundEnabled) {
      audioRef.current.play().catch(() => {
        // Handle audio play failure silently
      })
    }

    // Show browser notification
    if (settings.notifications && "Notification" in window && Notification.permission === "granted") {
      new Notification(`${getTimerTitle()} completed!`, {
        body: timerState === "focus" ? "Time for a break!" : "Ready to focus again?",
        icon: "/logo-48.webp",
      })
    }

    if (timerState === "focus") {
      const newCompletedCycles = completedCycles + 1
      setCompletedCycles(newCompletedCycles)
      setCurrentStreak(currentStreak + 1)

      // Check achievements
      checkAchievements(newCompletedCycles)

      // Save session with mood tracking
      const session: PomodoroSession = {
        id: Date.now().toString(),
        date: new Date(),
        focusTime: settings.focusTime,
        breakTime: 0,
        completedCycles: 1,
        productivity: Math.floor(Math.random() * 5) + 1, // Placeholder for user input
      }
      setSessions([session, ...sessions])

      // Determine next break type
      if (newCompletedCycles % settings.longBreakInterval === 0) {
        setTimerState("longBreak")
        setTimeLeft(settings.longBreak * 60)
      } else {
        setTimerState("shortBreak")
        setTimeLeft(settings.shortBreak * 60)
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000)
      }
    } else {
      // Break completed, back to focus
      setTimerState("focus")
      setTimeLeft(settings.focusTime * 60)

      // Auto-start pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 1000)
      }
    }
  }

  const checkAchievements = (cycles: number) => {
    const now = new Date()
    const hour = now.getHours()
    const todaySessions = sessions.filter((s) => s.date.toDateString() === now.toDateString()).length + 1

    const newAchievements = [...achievements]
    let hasNewAchievement = false

    // First session
    if (cycles === 1 && !achievements.find((a) => a.id === "first-session")?.unlocked) {
      const achievement = newAchievements.find((a) => a.id === "first-session")
      if (achievement) {
        achievement.unlocked = true
        achievement.unlockedAt = now
        hasNewAchievement = true
      }
    }

    // Daily warrior (8 sessions in one day)
    if (todaySessions >= 8 && !achievements.find((a) => a.id === "daily-warrior")?.unlocked) {
      const achievement = newAchievements.find((a) => a.id === "daily-warrior")
      if (achievement) {
        achievement.unlocked = true
        achievement.unlockedAt = now
        hasNewAchievement = true
      }
    }

    // Early bird
    if (hour < 8 && !achievements.find((a) => a.id === "early-bird")?.unlocked) {
      const achievement = newAchievements.find((a) => a.id === "early-bird")
      if (achievement) {
        achievement.unlocked = true
        achievement.unlockedAt = now
        hasNewAchievement = true
      }
    }

    // Night owl
    if (hour >= 22 && !achievements.find((a) => a.id === "night-owl")?.unlocked) {
      const achievement = newAchievements.find((a) => a.id === "night-owl")
      if (achievement) {
        achievement.unlocked = true
        achievement.unlockedAt = now
        hasNewAchievement = true
      }
    }

    if (hasNewAchievement) {
      setAchievements(newAchievements)
      // Show achievement notification
      if (settings.notifications) {
        setTimeout(() => {
          alert("🎉 Achievement unlocked!")
        }, 500)
      }
    }
  }

  const startTimer = () => {
    if (timerState === "idle") {
      setTimerState("focus")
      setTimeLeft(settings.focusTime * 60)
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimerState("idle")
    setTimeLeft(settings.focusTime * 60)
  }

  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
    if (!focusMode) {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) {
      return "00:00"
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    switch (timerState) {
      case "focus":
        return "from-red-500 to-orange-500"
      case "shortBreak":
        return "from-green-500 to-teal-500"
      case "longBreak":
        return "from-blue-500 to-purple-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getTimerIcon = () => {
    switch (timerState) {
      case "focus":
        return <BookOpen className="w-8 h-8" />
      case "shortBreak":
      case "longBreak":
        return <Coffee className="w-8 h-8" />
      default:
        return <Target className="w-8 h-8" />
    }
  }

  const getTimerTitle = () => {
    switch (timerState) {
      case "focus":
        return "Focus Time"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
      default:
        return "Ready to Focus"
    }
  }

  const updateSettings = (newSettings: TimerSettings) => {
    const validatedSettings = {
      focusTime: Number(newSettings.focusTime) || 25,
      shortBreak: Number(newSettings.shortBreak) || 5,
      longBreak: Number(newSettings.longBreak) || 15,
      longBreakInterval: Number(newSettings.longBreakInterval) || 4,
      soundEnabled: newSettings.soundEnabled,
      soundType: newSettings.soundType,
      autoStartBreaks: newSettings.autoStartBreaks,
      autoStartPomodoros: newSettings.autoStartPomodoros,
      darkMode: newSettings.darkMode,
      notifications: newSettings.notifications,
    }
    setSettings(validatedSettings)
    if (timerState === "idle") {
      setTimeLeft(validatedSettings.focusTime * 60)
    }

    // Update audio source
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${validatedSettings.soundType}.mp3`
    }

    setIsSettingsOpen(false)
  }

  const todaySessions = sessions.filter((session) => session.date.toDateString() === new Date().toDateString())
  const totalFocusTime = todaySessions.reduce((sum, session) => sum + session.focusTime, 0)
  const weekSessions = sessions.filter((session) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return session.date >= weekAgo
  })
  const averageProductivity =
    sessions.length > 0 ? sessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / sessions.length : 0
  const totalSessions = sessions.length
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length

  const getProgressPercentage = () => {
    const totalTime =
      timerState === "focus"
        ? settings.focusTime * 60
        : timerState === "shortBreak"
          ? settings.shortBreak * 60
          : settings.longBreak * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <StudentLayout>
      <div
        className={`min-h-screen transition-all duration-500 ${
          focusMode
            ? "bg-gradient-to-br from-gray-900 to-black"
            : settings.darkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
        } p-4 sm:p-6 lg:p-8`}
      >
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1
                className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent ${focusMode ? "text-white" : ""}`}
              >
                {t('productivity.pomodoro.title')}
              </h1>
              <p className={`mt-1 text-sm lg:text-base ${focusMode ? "text-gray-300" : "text-gray-600"}`}>
                {t('student.readyToAchieve')}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleFocusMode}
                variant="outline"
                size="sm"
                className={`${focusMode ? "bg-gray-800 text-white border-gray-600" : "bg-white/70 backdrop-blur-sm hover:bg-white/90"} transition-all duration-200`}
              >
                {focusMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {focusMode ? t('common.stop') : t('productivity.pomodoro.focus')}
              </Button>

              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${focusMode ? "bg-gray-800 text-white border-gray-600" : "bg-white/70 backdrop-blur-sm"}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('productivity.pomodoro.settings')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('productivity.pomodoro.settings')}</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="timer" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="timer">Timer</TabsTrigger>
                      <TabsTrigger value="audio">Audio & Notifications</TabsTrigger>
                      <TabsTrigger value="automation">Automation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timer" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="focusTime">Focus Time (minutes)</Label>
                          <Input
                            id="focusTime"
                            type="number"
                            min="1"
                            max="60"
                            value={settings.focusTime}
                            onChange={(e) =>
                              setSettings({ ...settings, focusTime: Number.parseInt(e.target.value) || 25 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                          <Input
                            id="shortBreak"
                            type="number"
                            min="1"
                            max="30"
                            value={settings.shortBreak}
                            onChange={(e) =>
                              setSettings({ ...settings, shortBreak: Number.parseInt(e.target.value) || 5 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longBreak">Long Break (minutes)</Label>
                          <Input
                            id="longBreak"
                            type="number"
                            min="1"
                            max="60"
                            value={settings.longBreak}
                            onChange={(e) =>
                              setSettings({ ...settings, longBreak: Number.parseInt(e.target.value) || 15 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longBreakInterval">Long Break Interval</Label>
                          <Input
                            id="longBreakInterval"
                            type="number"
                            min="2"
                            max="10"
                            value={settings.longBreakInterval}
                            onChange={(e) =>
                              setSettings({ ...settings, longBreakInterval: Number.parseInt(e.target.value) || 4 })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="audio" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sound-enabled">{t('productivity.pomodoro.settings')}</Label>
                        <Switch
                          id="sound-enabled"
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sound Type</Label>
                        <Select
                          value={settings.soundType}
                          onValueChange={(value) => setSettings({ ...settings, soundType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bell">Bell</SelectItem>
                            <SelectItem value="chime">Chime</SelectItem>
                            <SelectItem value="ding">Ding</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">Browser Notifications</Label>
                        <Switch
                          id="notifications"
                          checked={settings.notifications}
                          onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="automation" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-breaks">Auto-start Breaks</Label>
                          <p className="text-sm text-gray-500">Automatically start break timers</p>
                        </div>
                        <Switch
                          id="auto-breaks"
                          checked={settings.autoStartBreaks}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoStartBreaks: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-pomodoros">Auto-start Pomodoros</Label>
                          <p className="text-sm text-gray-500">Automatically start focus sessions after breaks</p>
                        </div>
                        <Switch
                          id="auto-pomodoros"
                          checked={settings.autoStartPomodoros}
                          onCheckedChange={(checked) => setSettings({ ...settings, autoStartPomodoros: checked })}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button onClick={() => updateSettings(settings)} className="w-full">
                    {t('common.save')}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {!focusMode && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Today's Focus</p>
                        <p className="text-xl lg:text-2xl font-bold text-red-600">{totalFocusTime}m</p>
                      </div>
                      <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Completed Cycles</p>
                        <p className="text-xl lg:text-2xl font-bold text-orange-600">{completedCycles}</p>
                      </div>
                      <Target className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Current Streak</p>
                        <p className="text-xl lg:text-2xl font-bold text-green-600">{currentStreak}</p>
                      </div>
                      <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Total Sessions</p>
                        <p className="text-xl lg:text-2xl font-bold text-purple-600">{totalSessions}</p>
                      </div>
                      <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Avg. Productivity</p>
                        <p className="text-xl lg:text-2xl font-bold text-blue-600">{averageProductivity.toFixed(1)}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Achievements</p>
                        <p className="text-xl lg:text-2xl font-bold text-yellow-600">{unlockedAchievements}</p>
                      </div>
                      <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <Card className={`${focusMode ? "bg-gray-800/50" : "bg-white/80"} backdrop-blur-sm border-0 shadow-xl`}>
            <CardContent className="p-6 lg:p-8">
              <div className="text-center space-y-6 lg:space-y-8">
                {/* Timer State Badge */}
                <Badge className={`bg-gradient-to-r ${getTimerColor()} text-white px-4 py-2 text-base lg:text-lg`}>
                  {getTimerIcon()}
                  <span className="ml-2">{getTimerTitle()}</span>
                </Badge>

                <div className="w-full max-w-md mx-auto">
                  <Progress value={getProgressPercentage()} className="h-3 mb-4" />
                  <p className={`text-sm ${focusMode ? "text-gray-300" : "text-gray-600"}`}>
                    {Math.round(getProgressPercentage())}% Complete
                  </p>
                </div>

                <div
                  className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-mono font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent transition-all duration-300`}
                >
                  {formatTime(timeLeft)}
                </div>

                {/* Enhanced Progress Ring */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                  <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className={`${focusMode ? "text-gray-700" : "text-gray-200"}`}
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000 ease-in-out"
                      style={{
                        stroke:
                          timerState === "focus" ? "#ef4444" : timerState === "shortBreak" ? "#10b981" : "#3b82f6",
                      }}
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-3 lg:p-4 rounded-full bg-gradient-to-r ${getTimerColor()}`}>
                      {getTimerIcon()}
                    </div>
                  </div>
                </div>

                {/* Enhanced Control Buttons */}
                <div className="flex justify-center gap-3 lg:gap-4 flex-wrap">
                  {!isRunning ? (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className={`bg-gradient-to-r ${getTimerColor()} hover:opacity-90 text-white px-6 lg:px-8 py-3 text-base lg:text-lg transform hover:scale-105 transition-all duration-200 shadow-lg`}
                    >
                      <Play className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                      {t('productivity.pomodoro.startTimer')}
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      variant="outline"
                      className={`px-6 lg:px-8 py-3 text-base lg:text-lg ${focusMode ? "bg-gray-700 text-white border-gray-600" : "bg-white/80 backdrop-blur-sm hover:bg-white/90"} transform hover:scale-105 transition-all duration-200 shadow-lg`}
                    >
                      <Pause className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                      {t('productivity.pomodoro.pauseTimer')}
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className={`px-6 lg:px-8 py-3 text-base lg:text-lg ${focusMode ? "bg-gray-700 text-white border-gray-600" : "bg-white/80 backdrop-blur-sm hover:bg-white/90"} transform hover:scale-105 transition-all duration-200 shadow-lg`}
                  >
                    <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                    {t('productivity.pomodoro.resetTimer')}
                  </Button>

                  <Button
                    onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                    size="lg"
                    variant="outline"
                    className={`px-4 py-3 ${focusMode ? "bg-gray-700 text-white border-gray-600" : "bg-white/80 backdrop-blur-sm hover:bg-white/90"} transform hover:scale-105 transition-all duration-200 shadow-lg`}
                  >
                    {settings.soundEnabled ? (
                      <Volume2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    ) : (
                      <VolumeX className="w-5 h-5 lg:w-6 lg:h-6" />
                    )}
                  </Button>
                </div>

                {/* Enhanced Cycle Progress */}
                <div className="text-center">
                  <p className={`mb-2 text-sm lg:text-base ${focusMode ? "text-gray-300" : "text-gray-600"}`}>
                    Completed Cycles Today
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {Array.from({ length: Math.max(8, completedCycles) }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index < completedCycles ? "bg-red-500 shadow-lg" : focusMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!focusMode && (
            <>
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Achievements
                    </h3>
                    <Badge variant="outline">
                      {unlockedAchievements}/{achievements.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg text-center transition-all duration-300 ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-lg transform hover:scale-105"
                            : "bg-gray-100 border-2 border-gray-200 opacity-50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-1">{formatDate(achievement.unlockedAt)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Recent Sessions */}
              {sessions.length > 0 && (
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Recent Sessions
                    </h3>
                    <div className="space-y-3">
                      {sessions.slice(0, 5).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                              <BookOpen className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">{session.focusTime} min focus session</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(session.date)} at {formatTime(session.date, { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.productivity && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Productivity:</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < session.productivity! ? "bg-yellow-400" : "bg-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <Badge variant="outline">{session.completedCycles} cycle</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                      How Pomodoro Transforms Your Life
                    </h3>
                    <p className="text-gray-600 text-base lg:text-lg max-w-3xl mx-auto">
                      The Pomodoro Technique isn't just about time management—it's about transforming how you approach
                      work, learning, and personal growth.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Enhanced Focus</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Train your brain to maintain deep concentration for extended periods, improving your ability to
                        tackle complex tasks without distraction.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Reduced Stress</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Regular breaks prevent mental fatigue and burnout, creating a sustainable work rhythm that
                        protects your mental health and well-being.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Better Productivity</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Accomplish more in less time by working in focused bursts, eliminating procrastination and
                        maximizing your output quality.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Timer className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Time Awareness</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Develop a better understanding of how long tasks actually take, improving your planning and
                        estimation skills for future projects.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Goal Achievement</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Break down overwhelming projects into manageable chunks, making large goals feel achievable and
                        maintaining motivation throughout.
                      </p>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Energy Management</h4>
                      <p className="text-gray-600 text-sm lg:text-base">
                        Maintain consistent energy levels throughout the day by balancing intense work periods with
                        restorative breaks for optimal performance.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white text-center">
                    <h4 className="text-xl lg:text-2xl font-bold mb-2">Start Your Transformation Today</h4>
                    <p className="text-red-100 text-sm lg:text-base">
                      Join millions of students and professionals who have revolutionized their productivity with the
                      Pomodoro Technique. Your future self will thank you.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
