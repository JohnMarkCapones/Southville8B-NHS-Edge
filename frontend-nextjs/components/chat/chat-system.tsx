"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  X,
  Search,
  Paperclip,
  Smile,
  Bell,
  BellOff,
  Pin,
  Download,
  ImageIcon,
  File,
  Minimize2,
  Hash,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
    role: "student" | "teacher" | "admin" | "parent"
  }
  timestamp: Date
  type: "text" | "file" | "image" | "system"
  fileUrl?: string
  fileName?: string
  isEdited?: boolean
}

interface Chat {
  id: string
  name: string
  type: "direct" | "class" | "announcement"
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isOnline?: boolean
  isPinned?: boolean
  avatar?: string
  description?: string
}

interface ChatSystemProps {
  className?: string
}

export function ChatSystem({ className }: ChatSystemProps) {
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  const [isOpen, setIsOpen] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [activeChat, setActiveChat] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [notifications, setNotifications] = React.useState(true)

  // Simplified mock data - only direct messages and class chats
  const [chats] = React.useState<Chat[]>([
    {
      id: "1",
      name: "Math Class - Period 3",
      type: "class",
      participants: ["teacher1", "student1", "student2"],
      unreadCount: 3,
      isPinned: true,
      lastMessage: {
        id: "msg1",
        content: "Don't forget about tomorrow's quiz on Chapter 5!",
        sender: { id: "teacher1", name: "Ms. Johnson", role: "teacher" },
        timestamp: new Date(Date.now() - 300000),
        type: "text",
      },
    },
    {
      id: "2",
      name: "Sarah Williams",
      type: "direct",
      participants: ["student1", "student4"],
      unreadCount: 1,
      isOnline: true,
      lastMessage: {
        id: "msg2",
        content: "Hey! Are you coming to the basketball game tonight?",
        sender: { id: "student4", name: "Sarah Williams", role: "student" },
        timestamp: new Date(Date.now() - 600000),
        type: "text",
      },
    },
    {
      id: "3",
      name: "School Announcements",
      type: "announcement",
      participants: ["admin1"],
      unreadCount: 2,
      isPinned: true,
      lastMessage: {
        id: "msg3",
        content: "Early dismissal on Friday due to teacher conference",
        sender: { id: "admin1", name: "Principal Davis", role: "admin" },
        timestamp: new Date(Date.now() - 1800000),
        type: "text",
      },
    },
  ])

  const [messages] = React.useState<Message[]>([
    {
      id: "1",
      content: "Good morning everyone! Today we'll be reviewing Chapter 5 before tomorrow's quiz.",
      sender: { id: "teacher1", name: "Ms. Johnson", role: "teacher" },
      timestamp: new Date(Date.now() - 3600000),
      type: "text",
    },
    {
      id: "2",
      content: "I have a question about problem 15 on page 127",
      sender: { id: "student1", name: "You", role: "student" },
      timestamp: new Date(Date.now() - 3300000),
      type: "text",
    },
    {
      id: "3",
      content: "Great question! Let me share a diagram that might help.",
      sender: { id: "teacher1", name: "Ms. Johnson", role: "teacher" },
      timestamp: new Date(Date.now() - 3000000),
      type: "text",
    },
  ])

  const handleSendMessage = () => {
    if (message.trim() === "") return
    console.log("Sending message:", message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "text-green-500"
      case "admin":
        return "text-purple-500"
      case "parent":
        return "text-orange-500"
      default:
        return "text-blue-500"
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "teacher":
        return "Teacher"
      case "admin":
        return "Admin"
      case "parent":
        return "Parent"
      default:
        return "Student"
    }
  }

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-[100]",
          isGamingTheme
            ? "bg-gradient-to-r from-gaming-neon-green to-gaming-neon-blue text-gaming-dark animate-gamingPulse"
            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
        )}
      >
        <MessageSquare className="h-6 w-6" />
        {chats.reduce((total, chat) => total + chat.unreadCount, 0) > 0 && (
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500 text-white">
            {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-[100] transition-all duration-300",
          isGamingTheme
            ? "bg-gradient-to-r from-gaming-neon-green to-gaming-neon-blue text-gaming-dark animate-gamingPulse border-gaming-neon-green/30"
            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-110",
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && chats.reduce((total, chat) => total + chat.unreadCount, 0) > 0 && (
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500 text-white animate-pulse">
            {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 w-96 h-[600px] rounded-lg shadow-2xl flex flex-col z-[99] animate-fadeIn border",
            isGamingTheme
              ? "bg-gaming-dark border-gaming-neon-green/20 backdrop-blur-xl"
              : "bg-background/95 backdrop-blur-xl border-border",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between p-4 border-b rounded-t-lg",
              isGamingTheme ? "bg-gaming-accent border-gaming-neon-green/20" : "bg-muted/50",
            )}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className={cn("h-5 w-5", isGamingTheme && "text-gaming-neon-green")} />
              <h3 className={cn("font-semibold", isGamingTheme && "text-gaming-neon-green")}>Messages</h3>
              {notifications && (
                <Badge variant="secondary" className="text-xs">
                  {chats.reduce((total, chat) => total + chat.unreadCount, 0)} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNotifications(!notifications)}>
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          {!activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-10 h-9",
                      isGamingTheme && "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green",
                    )}
                  />
                </div>
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 group",
                        isGamingTheme && "hover:bg-gaming-accent/50",
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                          <AvatarFallback
                            className={cn(
                              "text-xs font-semibold",
                              chat.type === "class" && "bg-green-100 text-green-700",
                              chat.type === "announcement" && "bg-purple-100 text-purple-700",
                              chat.type === "direct" && "bg-gray-100 text-gray-700",
                            )}
                          >
                            {chat.type === "class" && <Hash className="h-4 w-4" />}
                            {chat.type === "announcement" && <Bell className="h-4 w-4" />}
                            {chat.type === "direct" && chat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p
                              className={cn("text-sm font-medium truncate", isGamingTheme && "text-gaming-neon-green")}
                            >
                              {chat.name}
                            </p>
                            {chat.isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                            {chat.type === "announcement" && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="flex items-center space-x-1">
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                {chat.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessage?.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <p
                          className={cn(
                            "text-xs text-muted-foreground truncate",
                            isGamingTheme && "text-gaming-neon-blue/70",
                          )}
                        >
                          {chat.lastMessage?.type === "file"
                            ? `📎 ${chat.lastMessage.fileName}`
                            : chat.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            /* Active Chat View */
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-3 border-b",
                  isGamingTheme && "border-gaming-neon-green/20",
                )}
              >
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveChat(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={cn("text-sm font-medium", isGamingTheme && "text-gaming-neon-green")}>
                      Math Class - Period 3
                    </p>
                    <p className={cn("text-xs text-muted-foreground", isGamingTheme && "text-gaming-neon-blue/70")}>
                      24 members • 3 online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex space-x-3",
                        msg.sender.id === "student1" && "flex-row-reverse space-x-reverse",
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.sender.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn("flex-1 max-w-[80%]", msg.sender.id === "student1" && "flex flex-col items-end")}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              getRoleColor(msg.sender.role),
                              isGamingTheme && msg.sender.role === "teacher" && "text-gaming-neon-green",
                              isGamingTheme && msg.sender.role === "student" && "text-gaming-neon-blue",
                            )}
                          >
                            {msg.sender.name}
                          </span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {getRoleBadge(msg.sender.role)}
                          </Badge>
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
                            msg.sender.id === "student1"
                              ? isGamingTheme
                                ? "bg-gaming-neon-green/20 text-gaming-neon-green"
                                : "bg-primary text-primary-foreground"
                              : isGamingTheme
                                ? "bg-gaming-accent text-gaming-neon-blue"
                                : "bg-muted",
                          )}
                        >
                          {msg.type === "file" ? (
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4" />
                              <span className="text-sm">{msg.fileName}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className={cn("p-3 border-t", isGamingTheme && "border-gaming-neon-green/20")}>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 mb-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={cn(
                        "resize-none",
                        isGamingTheme && "bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green",
                      )}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={message.trim() === ""}
                    className={cn(
                      "h-10 w-10 p-0",
                      isGamingTheme && "bg-gaming-neon-green text-gaming-dark hover:bg-gaming-neon-blue",
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
