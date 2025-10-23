"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Send,
  X,
  Minimize2,
  Sparkles,
  BookOpen,
  Calendar,
  Trophy,
  Users,
  HelpCircle,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface BotMessage {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type: "text" | "suggestion"
  suggestions?: string[]
}

interface BotChatProps {
  className?: string
}

export function BotChat({ className }: BotChatProps) {
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  const [isOpen, setIsOpen] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const [messages, setMessages] = React.useState<BotMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your school assistant bot. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "suggestion",
      suggestions: [
        "What are my grades?",
        "Show me today's schedule",
        "Upcoming events",
        "School announcements",
        "Library hours",
        "Contact information",
      ],
    },
  ])

  const quickSuggestions = [
    { text: "Academic Help", icon: <BookOpen className="w-4 h-4" /> },
    { text: "Schedule Info", icon: <Calendar className="w-4 h-4" /> },
    { text: "School Events", icon: <Trophy className="w-4 h-4" /> },
    { text: "Student Services", icon: <Users className="w-4 h-4" /> },
  ]

  const handleSendMessage = async () => {
    if (message.trim() === "") return

    const userMessage: BotMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse: BotMessage = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(message),
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("grade") || lowerMessage.includes("score")) {
      return "I can help you check your grades! Please log into your student portal to view your current grades and academic progress. Would you like me to guide you through the login process?"
    }
    if (lowerMessage.includes("schedule") || lowerMessage.includes("class")) {
      return "Your class schedule is available in your student portal. Today's classes include Math (Period 1), Science (Period 2), English (Period 3), and History (Period 4). Would you like more details about any specific class?"
    }
    if (lowerMessage.includes("event") || lowerMessage.includes("activity")) {
      return "Here are some upcoming events: Science Fair (March 15), Basketball Championship (March 20), Spring Musical Auditions (March 25). Check the events calendar for more details!"
    }
    if (lowerMessage.includes("library") || lowerMessage.includes("book")) {
      return "The library is open Monday-Friday 8:00 AM - 6:00 PM, and Saturday 9:00 AM - 4:00 PM. You can search for books, reserve study rooms, and access digital resources through the library portal."
    }
    if (lowerMessage.includes("contact") || lowerMessage.includes("phone")) {
      return "Main Office: (555) 123-4567\nGuidance Counselor: (555) 123-4568\nNurse: (555) 123-4569\nLibrary: (555) 123-4570\nEmail: info@southville8bnhs.edu"
    }
    if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return "I'm here to help! I can assist you with grades, schedules, events, school policies, contact information, and general questions about Southville 8B NHS. What would you like to know?"
    }

    return "I understand you're asking about that topic. For specific information, I recommend checking your student portal or contacting the main office at (555) 123-4567. Is there anything else I can help you with?"
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-60 right-6 rounded-full w-14 h-14 shadow-lg z-[100]",
          isGamingTheme
            ? "bg-gradient-to-r from-gaming-neon-purple to-gaming-neon-pink text-gaming-dark animate-gamingPulse"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        )}
        aria-label="Open AI assistant"
      >
        <Bot className="h-6 w-6" />
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 animate-pulse" />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-70 right-6 rounded-full w-14 h-14 shadow-lg z-[100] transition-all duration-300",
          isGamingTheme
            ? "bg-gradient-to-r from-gaming-neon-purple to-gaming-neon-pink text-gaming-dark animate-gamingPulse border-gaming-neon-purple/30"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110",
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        {!isOpen && <Sparkles className="absolute -top-1 -right-1 w-4 h-4 animate-pulse" />}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "fixed bottom-28 right-10 w-96 h-[600px] rounded-lg shadow-2xl flex flex-col z-[99] animate-fadeIn border",
            isGamingTheme
              ? "bg-gaming-dark border-gaming-neon-purple/20 backdrop-blur-xl"
              : "bg-background/95 backdrop-blur-xl border-border",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between p-4 border-b rounded-t-lg",
              isGamingTheme ? "bg-gaming-accent border-gaming-neon-purple/20" : "bg-muted/50",
            )}
          >
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isGamingTheme
                    ? "bg-gradient-to-r from-gaming-neon-purple to-gaming-neon-pink animate-gamingPulse"
                    : "bg-gradient-to-r from-purple-500 to-pink-500",
                )}
              >
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className={cn("font-semibold text-sm", isGamingTheme && "text-gaming-neon-purple")}>
                  AI Assistant
                </h3>
                <p className={cn("text-xs", isGamingTheme ? "text-gaming-neon-blue/70" : "text-muted-foreground")}>
                  Always here to help
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn("text-xs", isGamingTheme && "bg-gaming-accent text-gaming-neon-green animate-pulse")}
              >
                Online
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="p-3 border-b">
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs h-8 justify-start",
                    isGamingTheme && "border-gaming-neon-purple/30 text-gaming-neon-purple hover:bg-gaming-accent",
                  )}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.icon}
                  <span className="ml-1 truncate">{suggestion.text}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex space-x-3", msg.sender === "user" && "flex-row-reverse space-x-reverse")}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {msg.sender === "bot" ? (
                      <AvatarFallback
                        className={cn(
                          "text-white",
                          isGamingTheme
                            ? "bg-gradient-to-r from-gaming-neon-purple to-gaming-neon-pink"
                            : "bg-gradient-to-r from-purple-500 to-pink-500",
                        )}
                      >
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="text-xs">You</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={cn("flex-1 max-w-[80%]", msg.sender === "user" && "flex flex-col items-end")}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          msg.sender === "bot"
                            ? isGamingTheme
                              ? "text-gaming-neon-purple"
                              : "text-purple-600"
                            : isGamingTheme
                              ? "text-gaming-neon-blue"
                              : "text-blue-600",
                        )}
                      >
                        {msg.sender === "bot" ? "AI Assistant" : "You"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-full",
                        msg.sender === "user"
                          ? isGamingTheme
                            ? "bg-gaming-neon-blue/20 text-gaming-neon-blue"
                            : "bg-primary text-primary-foreground"
                          : isGamingTheme
                            ? "bg-gaming-accent text-gaming-neon-purple"
                            : "bg-muted",
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.suggestions && (
                        <div className="mt-3 space-y-1">
                          {msg.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-xs h-8",
                                isGamingTheme && "hover:bg-gaming-neon-purple/20 text-gaming-neon-purple",
                              )}
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <HelpCircle className="w-3 h-3 mr-2" />
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-white",
                        isGamingTheme
                          ? "bg-gradient-to-r from-gaming-neon-purple to-gaming-neon-pink"
                          : "bg-gradient-to-r from-purple-500 to-pink-500",
                      )}
                    >
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      isGamingTheme ? "bg-gaming-accent text-gaming-neon-purple" : "bg-muted",
                    )}
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className={cn("p-3 border-t", isGamingTheme && "border-gaming-neon-purple/20")}>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Ask me anything about school..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "resize-none",
                    isGamingTheme && "bg-gaming-accent border-gaming-neon-purple/30 text-gaming-neon-purple",
                  )}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={message.trim() === ""}
                className={cn(
                  "h-10 w-10 p-0",
                  isGamingTheme && "bg-gaming-neon-purple text-gaming-dark hover:bg-gaming-neon-pink",
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center mt-2">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3" />
                <span>Powered by AI • Always learning</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
