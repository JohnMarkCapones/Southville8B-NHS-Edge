"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  MapPin,
  Clock,
  Info,
  AlertCircle,
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
  const router = useRouter()

  // Get user role from cookie
  const getUserRole = (): string => {
    if (typeof window === "undefined") return "Student"
    const match = document.cookie.match(/user-role=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : "Student"
  }

  // Get role-specific suggestions
  const getRoleBasedSuggestions = (role: string): string[] => {
    switch (role) {
      case "Teacher":
        return [
          "Where is quiz management?",
          "How do I create a quiz?",
          "View my schedule",
          "Upload learning modules",
          "Manage student materials",
          "View my classes",
        ]
      case "Admin":
        return [
          "User management",
          "System configuration",
          "View reports",
          "School announcements",
          "System settings",
          "Help & support",
        ]
      case "Student":
      default:
        return [
          "What are my grades?",
          "Show me today's schedule",
          "Upcoming events",
          "School announcements",
          "Library hours",
          "Contact information",
        ]
    }
  }

  // Get role-based quick suggestions
  const getRoleBasedQuickSuggestions = (role: string) => {
    switch (role) {
      case "Teacher":
        return [
          { text: "Quiz Management", icon: <BookOpen className="w-4 h-4" /> },
          { text: "My Schedule", icon: <Calendar className="w-4 h-4" /> },
          { text: "Modules", icon: <BookOpen className="w-4 h-4" /> },
          { text: "Classes", icon: <Users className="w-4 h-4" /> },
        ]
      case "Admin":
        return [
          { text: "User Management", icon: <Users className="w-4 h-4" /> },
          { text: "Reports", icon: <BookOpen className="w-4 h-4" /> },
          { text: "Settings", icon: <Calendar className="w-4 h-4" /> },
          { text: "Help", icon: <HelpCircle className="w-4 h-4" /> },
        ]
      case "Student":
      default:
        return [
          { text: "Academic Help", icon: <BookOpen className="w-4 h-4" /> },
          { text: "Schedule Info", icon: <Calendar className="w-4 h-4" /> },
          { text: "School Events", icon: <Trophy className="w-4 h-4" /> },
          { text: "Student Services", icon: <Users className="w-4 h-4" /> },
        ]
    }
  }

  const userRole = getUserRole()
  const roleSuggestions = getRoleBasedSuggestions(userRole)
  const quickSuggestions = getRoleBasedQuickSuggestions(userRole)

  // Persist chat state across navigation
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("bot-chat-open")
      return saved === "true"
    }
    return false
  })
  
  const [isMinimized, setIsMinimized] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("bot-chat-minimized")
      return saved === "true"
    }
    return false
  })

  // Save state to sessionStorage when it changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bot-chat-open", String(isOpen))
    }
  }, [isOpen])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bot-chat-minimized", String(isMinimized))
    }
  }, [isMinimized])
  const [message, setMessage] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const [messages, setMessages] = React.useState<BotMessage[]>([
    {
      id: "1",
      content: "Hello! I'm CampusConnect AI, your school assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "suggestion",
      suggestions: roleSuggestions,
    },
  ])

  const getTokenFromCookie = (): string | null => {
    if (typeof window === "undefined") return null
    const match = document.cookie.match(/sb-access-token=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }

  const getCsrfTokenFromCookie = (): string | null => {
    if (typeof window === "undefined") return null
    const match = document.cookie.match(/csrf-token=([^;]+)/)
    return match ? match[1] : null
  }

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
    const currentMessage = message
    setMessage("")
    setIsTyping(true)

    try {
      const token = getTokenFromCookie()
      const csrfToken = getCsrfTokenFromCookie()
      
      if (!token) {
        throw new Error("You need to be logged in to use the assistant")
      }

      if (!csrfToken) {
        throw new Error("CSRF token missing. Please refresh the page.")
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-csrf-token": csrfToken,
      }

      const response = await fetch("/api/agent", {
        method: "POST",
        headers,
        body: JSON.stringify({
          input_as_text: currentMessage,
          jwt_token: token,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody?.error ?? errorBody?.details ?? "Assistant service returned an error")
      }

      const result = await response.json()
      const botResponse: BotMessage = {
        id: (Date.now() + 1).toString(),
        content: result.output_text || "I couldn't generate a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't reach the assistant service."
      const botResponse: BotMessage = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    // Create user message
    const userMessage: BotMessage = {
      id: Date.now().toString(),
      content: suggestion,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Call agent API directly
    const callAgent = async () => {
      try {
        const token = getTokenFromCookie()
        const csrfToken = getCsrfTokenFromCookie()
        
        if (!token) {
          throw new Error("You need to be logged in to use the assistant")
        }

        if (!csrfToken) {
          throw new Error("CSRF token missing. Please refresh the page.")
        }

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-csrf-token": csrfToken,
        }

        const response = await fetch("/api/agent", {
          method: "POST",
          headers,
          body: JSON.stringify({
            input_as_text: suggestion,
            jwt_token: token,
          }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new Error(errorBody?.error ?? errorBody?.details ?? "Assistant service returned an error")
        }

        const result = await response.json().catch(() => ({}))
        
        // Handle empty, undefined, or invalid responses
        let responseText = result?.output_text || result?.outputText || result?.text || ""
        
        // Check if response is truly empty or just whitespace
        if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
          responseText = "I apologize, but I couldn't generate a response to that question. Could you please rephrase your question or try asking something else?"
        }
        
        const botResponse: BotMessage = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        }
        setMessages((prev) => [...prev, botResponse])
      } catch (error) {
        console.error("Error calling agent:", error)
        let errorMessage = "Sorry, I couldn't reach the assistant service. Please try again."
        
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        
        // Ensure error message is not empty
        if (!errorMessage || errorMessage.trim().length === 0) {
          errorMessage = "An unexpected error occurred. Please try again."
        }
        
        const botResponse: BotMessage = {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        }
        setMessages((prev) => [...prev, botResponse])
      } finally {
        setIsTyping(false)
      }
    }

    callAgent()
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
              "flex items-center justify-between p-4 border-b",
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
                  CampusConnect AI
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
                  <div className={cn("flex-1 max-w-[85%] min-w-0", msg.sender === "user" && "flex flex-col items-end")}>
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
                        {msg.sender === "bot" ? "CampusConnect AI" : "You"}
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
                        "rounded-lg p-3 w-full overflow-hidden",
                        msg.sender === "user"
                          ? isGamingTheme
                            ? "bg-gaming-neon-blue/20 text-gaming-neon-blue"
                            : "bg-primary text-primary-foreground"
                          : isGamingTheme
                            ? "bg-gaming-accent text-gaming-neon-purple"
                            : "bg-muted",
                      )}
                    >
                      {msg.sender === "bot" ? (
                        <FormattedMessage 
                          content={msg.content} 
                          isGamingTheme={isGamingTheme}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">{msg.content}</p>
                      )}
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
            <div className="flex flex-col items-center justify-center mt-2 space-y-1.5 px-2">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3" />
                <span>Powered by OpenAI ChatGPT 4.1 • Always learning</span>
              </div>
              <div className={cn(
                "flex items-start gap-1.5 text-[10px] leading-tight px-2 py-1 rounded-md w-full",
                isGamingTheme 
                  ? "text-gaming-neon-blue/80 bg-gaming-dark/30 border border-gaming-neon-purple/20" 
                  : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              )}>
                <AlertCircle className={cn("w-2.5 h-2.5 mt-0.5 flex-shrink-0", isGamingTheme ? "text-gaming-neon-blue" : "text-amber-600 dark:text-amber-400")} />
                <span><strong>Note:</strong> AI responses may contain errors. Please verify important information with official sources.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Component to format AI responses with better styling
function FormattedMessage({ content, isGamingTheme }: { content: string; isGamingTheme: boolean }) {
  const router = useRouter()
  
  // Simple markdown parser for bold, italic, links, and line breaks
  const parseMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let keyCounter = 0
    
    // Match **bold**, *italic*, [links](url), and line breaks
    // Order matters: links first, then bold, then italic
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|\n\n)/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        if (beforeText) {
          parts.push(beforeText)
        }
      }
      
      if (match[1].startsWith('[')) {
        // Link: [text](url)
        const linkText = match[2]
        const linkUrl = match[3]
        parts.push(
          <Link
            key={`link-${keyCounter++}`}
            href={linkUrl}
            className={cn(
              "underline hover:no-underline font-medium cursor-pointer",
              isGamingTheme ? "text-gaming-neon-blue hover:text-gaming-neon-purple" : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Use router for client-side navigation - chat stays open
              router.push(linkUrl)
            }}
          >
            {linkText}
          </Link>
        )
      } else if (match[1].startsWith('**')) {
        // Bold text
        parts.push(
          <strong key={`bold-${keyCounter++}`} className={isGamingTheme ? "text-gaming-neon-purple" : "font-semibold text-foreground"}>
            {match[4]}
          </strong>
        )
      } else if (match[1].startsWith('*') && !match[1].startsWith('**')) {
        // Italic text
        parts.push(<em key={`italic-${keyCounter++}`} className="italic">{match[5]}</em>)
      } else if (match[1] === '\n\n') {
        // Double line break - add a break
        parts.push(<br key={`br-${keyCounter++}`} />)
      }
      
      lastIndex = regex.lastIndex
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex)
      if (remaining) {
        parts.push(remaining)
      }
    }
    
    return parts.length > 0 ? <>{parts}</> : <>{text}</>
  }

  // Parse the content and format it
  const formatContent = (text: string) => {
    if (!text || text.trim().length === 0) {
      return <p className="text-sm text-muted-foreground">No response generated.</p>
    }

    // Check if text starts with intro text before numbered list
    const introMatch = text.match(/^(.+?)(?=\d+\.\s)/)
    const introText = introMatch ? introMatch[1].trim() : null
    
    // Split by numbered items (1., 2., etc.)
    const parts = text.split(/(?=\d+\.\s)/g).filter(p => p.trim())
    
    // If no numbered list, just format as paragraphs with markdown
    if (parts.length <= 1 && !introText) {
      return text.split(/\n\n/).map((para, i) => {
        const trimmed = para.trim()
        if (!trimmed) return null
        return (
          <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
            {parseMarkdown(trimmed)}
          </p>
        )
      }).filter(Boolean)
    }

    const eventParts = parts.filter(part => /^\d+\.\s/.test(part.trim()))
    
    // If we have introText but no valid event parts, show introText as regular content
    if (introText && eventParts.length === 0) {
      return text.split(/\n\n/).map((para, i) => {
        const trimmed = para.trim()
        if (!trimmed) return null
        return (
          <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
            {parseMarkdown(trimmed)}
          </p>
        )
      }).filter(Boolean)
    }
    
    return (
      <>
        {/* Show intro text if exists */}
        {introText && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-purple-600 dark:text-purple-400">CampusConnect AI:</span> {parseMarkdown(introText)}
            </p>
          </div>
        )}
        
        {/* Render events */}
        {eventParts.map((part, index) => {
          if (!part.trim()) return null
          
          const trimmed = part.trim()
          
          // Extract the actual number from the text
          const numberMatch = trimmed.match(/^(\d+)\.\s+/)
          const eventNumber = numberMatch ? numberMatch[1] : String(index + 1)
          
          // Extract event title (usually after the number)
          const titleMatch = trimmed.match(/^\d+\.\s+(.+?)(?:\s*-\s*Date|$)/)
          const title = titleMatch ? titleMatch[1].trim() : null
          
          // Extract date/time - improved regex to capture full date
          const dateMatch = trimmed.match(/Date\s*[&:]\s*Time:\s*([^-\n]+?)(?:\s*-\s*Location|$)/i)
          const dateTime = dateMatch ? dateMatch[1].trim() : null
          
          // Extract location - improved regex to capture full location including line breaks
          const locationMatch = trimmed.match(/Location:\s*([^-\n]+(?:\s+[^-\n]+)*)/i)
          const location = locationMatch ? locationMatch[1].trim().replace(/\s+/g, ' ') : null
          
          // Extract details (everything after "Details:")
          const detailsMatch = trimmed.match(/Details:\s*([\s\S]+?)(?=\d+\.\s|$)/i)
          const details = detailsMatch ? detailsMatch[1].trim() : null
          
          // Extract theme if exists
          const themeMatch = trimmed.match(/Theme:\s*"([^"]+)"/i)
          const theme = themeMatch ? themeMatch[1] : null

          // If no title found, render as plain text instead of returning null
          if (!title) {
            return (
              <p key={index} className="mb-3 last:mb-0 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {parseMarkdown(trimmed)}
              </p>
            )
          }

          return (
            <div
              key={index}
              className={cn(
                "mb-4 last:mb-0 p-4 rounded-lg border",
                isGamingTheme
                  ? "bg-gaming-dark/50 border-gaming-neon-purple/30"
                  : "bg-background/50 border-border"
              )}
            >
              <h4
                className={cn(
                  "font-semibold text-base mb-3 flex items-center gap-2",
                  isGamingTheme ? "text-gaming-neon-purple" : "text-foreground"
                )}
              >
                <span className="text-lg">{eventNumber}.</span>
                {title}
              </h4>
              
              <div className="space-y-2 ml-6">
                {dateTime && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isGamingTheme ? "text-gaming-neon-blue" : "text-muted-foreground")} />
                    <span className={cn("flex-1", isGamingTheme ? "text-gaming-neon-blue/90" : "text-muted-foreground")}>
                      <strong>Date & Time:</strong> <span className="whitespace-normal">{dateTime}</span>
                    </span>
                  </div>
                )}
                
                {location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isGamingTheme ? "text-gaming-neon-green" : "text-muted-foreground")} />
                    <span className={cn("flex-1 break-words break-all overflow-wrap-anywhere", isGamingTheme ? "text-gaming-neon-green/90" : "text-muted-foreground")}>
                      <strong>Location:</strong> <span className="whitespace-normal">{location}</span>
                    </span>
                  </div>
                )}
                
                {theme && (
                  <div className="flex items-start gap-2 text-sm">
                    <Info className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isGamingTheme ? "text-gaming-neon-pink" : "text-muted-foreground")} />
                    <span className={cn("flex-1", isGamingTheme ? "text-gaming-neon-pink/90" : "text-muted-foreground")}>
                      <strong>Theme:</strong> "{theme}"
                    </span>
                  </div>
                )}
                
                {details && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
                      <strong className={isGamingTheme ? "text-gaming-neon-purple" : "text-foreground"}>Details:</strong>{" "}
                      <span className={isGamingTheme ? "text-gaming-neon-blue/90" : "text-muted-foreground"}>
                        {details}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // Ensure content is always rendered
  if (!content || content.trim().length === 0) {
    return (
      <div className="text-sm space-y-2">
        <p className="text-muted-foreground">No response generated.</p>
      </div>
    )
  }

  const formatted = formatContent(content)
  
  // If formatContent returns null/undefined/empty, fallback to simple rendering
  if (!formatted || (Array.isArray(formatted) && formatted.length === 0)) {
    // Fallback: render content as simple paragraphs with markdown
    return (
      <div className="text-sm space-y-2">
        {content.split(/\n\n/).map((para, i) => {
          const trimmed = para.trim()
          if (!trimmed) return null
          return (
            <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
              {parseMarkdown(trimmed)}
            </p>
          )
        }).filter(Boolean)}
      </div>
    )
  }

  // Check if formatted is a React fragment with no children
  if (formatted && typeof formatted === 'object' && 'type' in formatted && formatted.type === React.Fragment) {
    const children = (formatted as any).props?.children
    if (!children || (Array.isArray(children) && children.filter(Boolean).length === 0)) {
      // Empty fragment, use fallback
      return (
        <div className="text-sm space-y-2">
          {content.split(/\n\n/).map((para, i) => {
            const trimmed = para.trim()
            if (!trimmed) return null
            return (
              <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-wrap-anywhere">
                {parseMarkdown(trimmed)}
              </p>
            )
          }).filter(Boolean)}
        </div>
      )
    }
  }

  return (
    <div className="text-sm space-y-2">
      {formatted}
    </div>
  )
}
