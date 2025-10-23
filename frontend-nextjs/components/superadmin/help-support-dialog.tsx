"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  X, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Mail,
  FileText,
  AlertTriangle
} from "lucide-react"
import { helpSections } from "@/lib/help-data"

interface HelpSupportDialogProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: string
  initialTopic?: string
}

export function HelpSupportDialog({ 
  isOpen, 
  onClose, 
  currentPage,
  initialTopic 
}: HelpSupportDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [selectedContent, setSelectedContent] = useState("")

  useEffect(() => {
    if (isOpen && helpSections.length > 0) {
      setSelectedSection(helpSections[0].id)
    }
  }, [isOpen])

  // Scroll to selected topic
  useEffect(() => {
    if (selectedContent) {
      const el = document.getElementById(`help-topic-${selectedContent}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [selectedContent])

  const filteredSections = helpSections
    .filter(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 12)

  const selectedSectionData = helpSections.find(s => s.id === selectedSection)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-[80vh] sm:h-[85vh] flex flex-col rounded-lg overflow-hidden p-0">
        {/* HEADER */}
        <DialogHeader className="p-5 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Help & Support
              </DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Get help with the SuperAdmin dashboard
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <aside className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              {filteredSections.map(section => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`cursor-pointer rounded-lg p-3 flex items-start gap-3 hover:bg-muted transition 
                    ${selectedSection === section.id ? "bg-muted border-l-4 border-primary" : ""}`}
                >
                  <span className="text-lg mt-0.5">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{section.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{section.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {selectedSectionData ? (
              <>
                {/* Section Header */}
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedSectionData.icon}</span>
                    {selectedSectionData.title}
                  </h2>
                  <p className="text-muted-foreground text-sm">{selectedSectionData.description}</p>
                </div>

                {/* Quick Actions */}
                {selectedSectionData.quickActions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wide">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedSectionData.quickActions.slice(0, 6).map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto p-3 justify-start text-left"
                          onClick={() => {
                            if (action.action === 'navigate') {
                              window.location.href = action.target
                            } else if (action.action === 'contact') {
                              window.location.href = `mailto:${action.target}`
                            }
                          }}
                        >
                          <span className="mr-3 text-base">{action.icon}</span>
                          <div>
                            <div className="font-medium">{action.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Help Topics */}
                {selectedSectionData.content?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wide">
                      Help Topics
                    </h3>
                    <div className="space-y-3">
                      {selectedSectionData.content.slice(0, 10).map((content) => (
                        <button
                          id={`help-topic-${content.id}`}
                          key={content.id}
                          type="button"
                          onClick={() => setSelectedContent(content.id)}
                          className={`w-full p-4 border rounded-lg text-left transition-all cursor-pointer
                            ${selectedContent === content.id 
                              ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-md' 
                              : 'border-border hover:bg-muted/20 hover:shadow-md hover:border-primary/50'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {content.type === 'guide' && <FileText className="h-4 w-4 text-blue-500" />}
                              {content.type === 'troubleshooting' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{content.title}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {content.difficulty}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                                {content.content}
                              </p>
                              {content.steps && (
                                <div className="text-xs text-muted-foreground">
                                  {content.steps.length} steps available
                                </div>
                              )}
                              <div className="text-xs text-primary font-medium mt-2">
                                Click to view detailed guide →
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Content View */}
                {selectedContent && (
                  <div className="mt-6 p-6 border-2 border-primary/20 rounded-lg bg-primary/5 shadow-lg">
                    {(() => {
                      const contentData = selectedSectionData?.content?.find(c => c.id === selectedContent)
                      if (!contentData) return <div>Content not found for ID: {selectedContent}</div>
                      
                      return (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              {contentData.type === 'guide' && <FileText className="h-5 w-5 text-blue-500" />}
                              {contentData.type === 'troubleshooting' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                              <h3 className="text-lg font-semibold">{contentData.title}</h3>
                              <Badge variant="secondary">{contentData.difficulty}</Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedContent("")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">{contentData.content}</p>

                          {contentData.steps?.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Step-by-Step Instructions:</h4>
                              <ol className="space-y-1 text-sm">
                                {contentData.steps.map((step, index) => (
                                  <li key={index} className="flex gap-2">
                                    <span className="font-medium text-primary">{index + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {contentData.tags?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Tags:</h4>
                              <div className="flex flex-wrap gap-1">
                                {contentData.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {contentData.relatedPages?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Related Pages:</h4>
                              <div className="flex flex-wrap gap-2">
                                {contentData.relatedPages.map((page) => (
                                  <Button
                                    key={page}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                      window.location.href = page
                                      onClose()
                                    }}
                                  >
                                    {page.split('/').pop() || page}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a help section to get started</p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex justify-between items-center bg-background/80 backdrop-blur">
          <div className="text-xs text-muted-foreground">
            Need more help? Contact our support team
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = 'mailto:itsupport@southville8bnhs.edu.ph'}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = 'tel:+1234567890'}
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
