// Placeholder for Chat Widget
// This would require a backend and likely a third-party service or custom WebSocket implementation.
// For now, it's a UI placeholder.
"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { MessageSquare, Send, X } from "lucide-react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to S8BNHS Support! How can I help you?", sender: "bot" },
  ])
  const [inputText, setInputText] = useState("")

  // Add drag functionality
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleChat = () => setIsOpen(!isOpen)

  const handleSend = () => {
    if (inputText.trim() === "") return
    setMessages([...messages, { id: Date.now(), text: inputText, sender: "user" }])
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Thanks for your message! An agent will be with you shortly.", sender: "bot" },
      ])
    }, 1000)
    setInputText("")
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className={cn(
          "fixed w-14 h-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-[100] cursor-move select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{
          bottom: position.y ? `${window.innerHeight - position.y - 56}px` : "24px",
          right: position.x ? `${window.innerWidth - position.x - 56}px` : "24px",
          left: position.x ? `${position.x}px` : "auto",
          top: position.y ? `${position.y}px` : "auto",
        }}
        onClick={!isDragging ? toggleChat : undefined}
        onMouseDown={handleMouseDown}
        aria-label="Toggle chat (draggable)"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div
          className="fixed w-80 h-[400px] bg-card border rounded-lg shadow-xl flex flex-col z-[99] animate-fadeIn"
          style={{
            bottom: position.y ? `${window.innerHeight - position.y + 10}px` : "96px",
            right: position.x ? `${window.innerWidth - position.x - 56}px` : "24px",
            left: position.x ? `${position.x}px` : "auto",
            top: position.y && position.y > window.innerHeight - 500 ? `${position.y - 410}px` : "auto",
          }}
        >
          <div className="p-3 border-b flex justify-between items-center bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">Live Chat Support</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-primary-foreground hover:bg-primary/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-grow p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" onClick={handleSend} className="bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
