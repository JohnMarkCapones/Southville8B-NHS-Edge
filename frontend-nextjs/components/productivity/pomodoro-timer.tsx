"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Timer, Play, Pause, RotateCcw, Settings, Coffee, BookOpen, Target } from "lucide-react"

interface PomodoroSession {
  id: string
  type: "work" | "shortBreak" | "longBreak"
  duration: number
  completedAt: Date
}

interface PomodoroSettings {
  workDuration: number // in minutes
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
}

export function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [currentSession, setCurrentSession] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Safe default: 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("pomodoro-settings")
    const savedSessions = localStorage.getItem("pomodoro-sessions")

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        const validatedSettings = {
          workDuration: Number(parsedSettings.workDuration) || 25,
          shortBreakDuration: Number(parsedSettings.shortBreakDuration) || 5,
          longBreakDuration: Number(parsedSettings.longBreakDuration) || 15,
          sessionsUntilLongBreak: Number(parsedSettings.sessionsUntilLongBreak) || 4,
        }
        setSettings(validatedSettings)
        setTempSettings(validatedSettings)
        setTimeLeft(validatedSettings.workDuration * 60)
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
        setTimeLeft(defaultSettings.workDuration * 60)
      }
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        completedAt: new Date(session.completedAt),
      }))
      setCompletedSessions(parsedSessions)
    }

    // Create audio element for notifications
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem("pomodoro-sessions", JSON.stringify(completedSessions))
  }, [completedSessions])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
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

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete()
    }
  }, [timeLeft, isRunning])

  const handleSessionComplete = () => {
    setIsRunning(false)

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback if audio fails
        console.log("Audio notification failed")
      })
    }

    // Save completed session
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type: currentSession,
      duration: getCurrentSessionDuration(),
      completedAt: new Date(),
    }
    setCompletedSessions((prev) => [session, ...prev])

    // Determine next session type
    if (currentSession === "work") {
      const workSessions = completedSessions.filter((s) => s.type === "work").length + 1
      const nextSession = workSessions % settings.sessionsUntilLongBreak === 0 ? "longBreak" : "shortBreak"
      setCurrentSession(nextSession)
      setTimeLeft(nextSession === "longBreak" ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60)
    } else {
      setCurrentSession("work")
      setTimeLeft(settings.workDuration * 60)
    }

    // Show browser notification
    if (Notification.permission === "granted") {
      new Notification("Pomodoro Timer", {
        body: `${currentSession === "work" ? "Work" : "Break"} session completed!`,
        icon: "/favicon.ico",
      })
    }
  }

  const getCurrentSessionDuration = () => {
    switch (currentSession) {
      case "work":
        return settings.workDuration
      case "shortBreak":
        return settings.shortBreakDuration
      case "longBreak":
        return settings.longBreakDuration
      default:
        return settings.workDuration
    }
  }

  const toggleTimer = () => {
    if (!isRunning && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(getCurrentSessionDuration() * 60)
  }

  const skipSession = () => {
    setIsRunning(false)
    handleSessionComplete()
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) {
      return "00:00"
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = () => {
    const totalTime = getCurrentSessionDuration() * 60
    if (isNaN(totalTime) || totalTime <= 0 || isNaN(timeLeft)) {
      return 0
    }
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const saveSettings = () => {
    const validatedSettings = {
      workDuration: Number(tempSettings.workDuration) || 25,
      shortBreakDuration: Number(tempSettings.shortBreakDuration) || 5,
      longBreakDuration: Number(tempSettings.longBreakDuration) || 15,
      sessionsUntilLongBreak: Number(tempSettings.sessionsUntilLongBreak) || 4,
    }
    setSettings(validatedSettings)
    setTimeLeft(validatedSettings.workDuration * 60)
    setCurrentSession("work")
    setIsRunning(false)
    setShowSettings(false)
  }

  const getTodaysSessions = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return completedSessions.filter((session) => session.completedAt >= today)
  }

  const getSessionIcon = () => {
    switch (currentSession) {
      case "work":
        return <BookOpen className="w-6 h-6 text-red-500" />
      case "shortBreak":
        return <Coffee className="w-6 h-6 text-green-500" />
      case "longBreak":
        return <Target className="w-6 h-6 text-blue-500" />
    }
  }

  const getSessionColor = () => {
    switch (currentSession) {
      case "work":
        return "from-red-500 to-red-600"
      case "shortBreak":
        return "from-green-500 to-green-600"
      case "longBreak":
        return "from-blue-500 to-blue-600"
    }
  }

  const todaysSessions = getTodaysSessions()
  const todaysWorkSessions = todaysSessions.filter((s) => s.type === "work").length
  const todaysBreakSessions = todaysSessions.filter((s) => s.type !== "work").length

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Timer className="w-5 h-5 mr-2 text-red-500" />
            Pomodoro Timer
          </div>
          <Button onClick={() => setShowSettings(!showSettings)} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>Focus with the Pomodoro Technique</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings ? (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Timer Settings</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Work Duration (min)</label>
                  <input
                    type="number"
                    value={tempSettings.workDuration}
                    onChange={(e) => setTempSettings((prev) => ({ ...prev, workDuration: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Short Break (min)</label>
                  <input
                    type="number"
                    value={tempSettings.shortBreakDuration}
                    onChange={(e) =>
                      setTempSettings((prev) => ({ ...prev, shortBreakDuration: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Long Break (min)</label>
                  <input
                    type="number"
                    value={tempSettings.longBreakDuration}
                    onChange={(e) =>
                      setTempSettings((prev) => ({ ...prev, longBreakDuration: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sessions until Long Break</label>
                  <input
                    type="number"
                    value={tempSettings.sessionsUntilLongBreak}
                    onChange={(e) =>
                      setTempSettings((prev) => ({ ...prev, sessionsUntilLongBreak: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    min="2"
                    max="8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSettings} size="sm" className="bg-green-500 hover:bg-green-600">
                  Save Settings
                </Button>
                <Button
                  onClick={() => {
                    setShowSettings(false)
                    setTempSettings(settings)
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {getSessionIcon()}
                <Badge
                  variant="secondary"
                  className={`text-sm px-3 py-1 bg-gradient-to-r ${getSessionColor()} text-white`}
                >
                  {currentSession === "work"
                    ? "Work Session"
                    : currentSession === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                </Badge>
              </div>

              <div className="relative">
                <div className="text-6xl font-mono font-bold text-center mb-4">{formatTime(timeLeft)}</div>
                <Progress value={getProgressPercentage()} className="h-3 mb-4" />
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-2">
                <Button
                  onClick={toggleTimer}
                  className={`bg-gradient-to-r ${getSessionColor()} text-white hover:opacity-90`}
                >
                  {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="default">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={skipSession} variant="outline" size="default" className="text-xs bg-transparent">
                  Skip
                </Button>
              </div>
            </div>

            {/* Today's Stats */}
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3 text-center">Today's Progress</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{todaysWorkSessions}</div>
                    <div className="text-xs text-muted-foreground">Work Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{todaysBreakSessions}</div>
                    <div className="text-xs text-muted-foreground">Breaks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(((todaysWorkSessions * settings.workDuration) / 60) * 10) / 10}h
                    </div>
                    <div className="text-xs text-muted-foreground">Focus Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            {todaysSessions.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-3">Recent Sessions</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {todaysSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {session.type === "work" ? (
                            <BookOpen className="w-3 h-3 text-red-500" />
                          ) : (
                            <Coffee className="w-3 h-3 text-green-500" />
                          )}
                          <span className="capitalize">
                            {session.type === "shortBreak"
                              ? "Short Break"
                              : session.type === "longBreak"
                                ? "Long Break"
                                : "Work"}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {session.completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
