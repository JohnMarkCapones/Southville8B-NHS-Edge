"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User as UserIcon, Briefcase, RefreshCw } from "lucide-react"
import {
  getDomains,
  getDomainRolesByDomain,
  getUserDomainRoles,
  assignUserDomainRole,
  removeUserDomainRole,
  type Domain,
  type DomainRole,
  type UserDomainRole
} from "@/lib/api/endpoints/domains"

interface EditJournalismMemberDialogProps {
  member: { id: string; name: string; email: string; position?: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditJournalismMemberDialog({
  member,
  open,
  onOpenChange,
  onSuccess
}: EditJournalismMemberDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Data
  const [journalismDomains, setJournalismDomains] = useState<Domain[]>([])
  const [availablePositions, setAvailablePositions] = useState<DomainRole[]>([])
  const [userDomainRoles, setUserDomainRoles] = useState<UserDomainRole[]>([])

  // Form state
  const [selectedDomainId, setSelectedDomainId] = useState<string>("")
  const [selectedPositionId, setSelectedPositionId] = useState<string>("")

  // Load journalism domains on mount
  useEffect(() => {
    const loadJournalismDomains = async () => {
      setLoadingDomains(true)
      try {
        const allDomains = await getDomains()
        // Filter for journalism type domains
        const journalism = allDomains.filter(d => d.type === 'journalism')
        setJournalismDomains(journalism)

        // Auto-select first journalism domain if exists
        if (journalism.length > 0) {
          setSelectedDomainId(journalism[0].id)
        }
      } catch (error) {
        console.error("Failed to load journalism domains:", error)
        toast({
          title: "Error",
          description: "Failed to load journalism organizations",
          variant: "destructive",
        })
      } finally {
        setLoadingDomains(false)
      }
    }

    if (open) {
      loadJournalismDomains()
    }
  }, [open, toast])

  // Load user's current journalism domain roles
  useEffect(() => {
    const loadUserRoles = async () => {
      if (!member?.id) return

      try {
        const roles = await getUserDomainRoles(member.id)
        // Filter for journalism domain roles only
        const journalismRoles = roles.filter(
          r => r.domain_role?.domain?.type === 'journalism'
        )
        setUserDomainRoles(journalismRoles)

        // Set selected domain and position if user has one
        if (journalismRoles.length > 0 && journalismRoles[0].domain_role) {
          setSelectedDomainId(journalismRoles[0].domain_role.domain_id)
          setSelectedPositionId(journalismRoles[0].domain_role_id)
        }
      } catch (error) {
        console.error("Failed to load user journalism roles:", error)
      }
    }

    if (member && open) {
      loadUserRoles()
    }
  }, [member, open])

  // Load positions when domain is selected
  useEffect(() => {
    const loadPositions = async () => {
      if (!selectedDomainId) {
        setAvailablePositions([])
        return
      }

      setLoadingRoles(true)
      try {
        const positions = await getDomainRolesByDomain(selectedDomainId)
        setAvailablePositions(positions)
      } catch (error) {
        console.error("Failed to load positions:", error)
        toast({
          title: "Error",
          description: "Failed to load positions",
          variant: "destructive",
        })
      } finally {
        setLoadingRoles(false)
      }
    }

    loadPositions()
  }, [selectedDomainId, toast])

  const handleSave = async () => {
    if (!member) return

    setLoading(true)
    try {
      // Remove existing journalism domain role assignments
      for (const existingRole of userDomainRoles) {
        await removeUserDomainRole(member.id, existingRole.id)
      }

      // Assign new position
      if (selectedPositionId) {
        await assignUserDomainRole(member.id, selectedPositionId)
      }

      toast({
        title: "Success",
        description: `${member.name}'s position updated successfully`,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update member position:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update position",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPositionBadgeColor = (position: string) => {
    if (position.includes('Editor')) return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
    if (position.includes('Writer')) return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
    if (position.includes('Photographer')) return "bg-green-500/10 text-green-700 dark:text-green-400"
    if (position.includes('Designer')) return "bg-pink-500/10 text-pink-700 dark:text-pink-400"
    if (position.includes('Adviser')) return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
    return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member Position</DialogTitle>
          <DialogDescription>Update journalism team member's position and role</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Member Info Display */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{member.name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Journalism Organization Selection */}
          {journalismDomains.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="domain">Journalism Organization</Label>
              <Select
                value={selectedDomainId}
                onValueChange={setSelectedDomainId}
                disabled={loadingDomains}
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder={loadingDomains ? "Loading..." : "Select organization"} />
                </SelectTrigger>
                <SelectContent>
                  {journalismDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Which journalism publication this member belongs to
              </p>
            </div>
          )}

          {/* Position Selection */}
          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Position
            </Label>
            <Select
              value={selectedPositionId}
              onValueChange={setSelectedPositionId}
              disabled={loadingRoles || !selectedDomainId}
            >
              <SelectTrigger id="position">
                <SelectValue
                  placeholder={
                    loadingRoles
                      ? "Loading positions..."
                      : !selectedDomainId
                      ? "Select organization first"
                      : "Select position"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingRoles ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Loading...
                    </div>
                  </SelectItem>
                ) : availablePositions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No positions available
                  </SelectItem>
                ) : (
                  availablePositions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getPositionBadgeColor(position.name)}
                          variant="secondary"
                        >
                          {position.name}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Editor-in-Chief, Writer, Photographer, etc.
            </p>
          </div>

          {/* Current Assignment Display */}
          {userDomainRoles.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Position:</p>
              <div className="space-y-1">
                {userDomainRoles.map((udr) => (
                  <div key={udr.id} className="text-sm text-foreground">
                    <Badge
                      className={getPositionBadgeColor(udr.domain_role?.name || "")}
                      variant="secondary"
                    >
                      {udr.domain_role?.name || "Unknown"}
                    </Badge>
                    {udr.domain_role?.domain && (
                      <span className="text-muted-foreground ml-2">
                        in {udr.domain_role.domain.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedPositionId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Position
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
