"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User as UserIcon, Shield, Briefcase, RefreshCw } from "lucide-react"
import type { User, UserStatus, UserRole } from "@/lib/api/endpoints/users"
import { updateUserData } from "@/lib/api/endpoints/users"
import { getRoles } from "@/lib/api/endpoints/roles"
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

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Base data
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [availableDomainRoles, setAvailableDomainRoles] = useState<DomainRole[]>([])
  const [userDomainRoles, setUserDomainRoles] = useState<UserDomainRole[]>([])

  // Form state
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [selectedRoleName, setSelectedRoleName] = useState<string>("")
  const [selectedDomainId, setSelectedDomainId] = useState<string>("")
  const [selectedDomainRoleId, setSelectedDomainRoleId] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>("Active")

  // Load base roles on mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getRoles()
        setRoles(rolesData)
      } catch (error) {
        console.error("Failed to load roles:", error)
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        })
      }
    }
    loadRoles()
  }, [toast])

  // Load domains on mount
  useEffect(() => {
    const loadDomains = async () => {
      setLoadingDomains(true)
      try {
        const domainsData = await getDomains()
        setDomains(domainsData)
      } catch (error) {
        console.error("Failed to load domains:", error)
        toast({
          title: "Error",
          description: "Failed to load domains (clubs, departments, etc.)",
          variant: "destructive",
        })
      } finally {
        setLoadingDomains(false)
      }
    }
    if (open) {
      loadDomains()
    }
  }, [open, toast])

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setSelectedRoleId(user.role_id || "")
      setSelectedRoleName(user.role?.name || "")
      setSelectedStatus(user.status)

      // Load user's current domain roles
      const loadUserDomainRoles = async () => {
        try {
          const userRoles = await getUserDomainRoles(user.id)
          setUserDomainRoles(userRoles)

          // Set first domain role as selected if exists
          if (userRoles.length > 0 && userRoles[0].domain_role) {
            setSelectedDomainId(userRoles[0].domain_role.domain_id)
            setSelectedDomainRoleId(userRoles[0].domain_role_id)
          }
        } catch (error) {
          console.error("Failed to load user domain roles:", error)
        }
      }
      loadUserDomainRoles()
    }
  }, [user])

  // Load domain roles when domain is selected
  useEffect(() => {
    const loadDomainRoles = async () => {
      if (!selectedDomainId || selectedDomainId === "none") {
        setAvailableDomainRoles([])
        setSelectedDomainRoleId("")
        return
      }

      setLoadingRoles(true)
      try {
        const roles = await getDomainRolesByDomain(selectedDomainId)
        setAvailableDomainRoles(roles)
      } catch (error) {
        console.error("Failed to load domain roles:", error)
        toast({
          title: "Error",
          description: "Failed to load positions for selected domain",
          variant: "destructive",
        })
      } finally {
        setLoadingRoles(false)
      }
    }
    loadDomainRoles()
  }, [selectedDomainId, toast])

  const handleRoleChange = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      setSelectedRoleId(roleId)
      setSelectedRoleName(role.name)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Build update payload
      const updates: { role?: UserRole; status?: UserStatus } = {}

      // Check if role changed
      if (selectedRoleName && selectedRoleName !== user.role?.name) {
        updates.role = selectedRoleName as UserRole
      }

      // Check if status changed
      if (selectedStatus !== user.status) {
        updates.status = selectedStatus
      }

      // Update base role and status if needed
      if (Object.keys(updates).length > 0) {
        await updateUserData(user.id, updates)
      }

      // Update domain role if changed
      // Remove existing domain role assignments
      for (const existingRole of userDomainRoles) {
        await removeUserDomainRole(user.id, existingRole.id)
      }

      // Assign new domain role (if not "none")
      if (selectedDomainRoleId && selectedDomainId !== "none") {
        await assignUserDomainRole(user.id, selectedDomainRoleId)
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "Inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      case "Suspended":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "Student":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "Teacher":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "Admin":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit User Role & Status</DialogTitle>
          <DialogDescription>Update user role, position, and account status</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info Display */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-school-blue/10">
                <UserIcon className="h-6 w-6 text-school-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{user.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Base Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Base Role
            </Label>
            <Select value={selectedRoleId} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(role.name)} variant="secondary">
                        {role.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              System role: Student, Teacher, or Admin
            </p>
          </div>

          {/* Domain Selection (Club, Department, etc.) */}
          <div className="space-y-2">
            <Label htmlFor="domain" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Organization / Domain
            </Label>
            <Select
              value={selectedDomainId}
              onValueChange={setSelectedDomainId}
              disabled={loadingDomains}
            >
              <SelectTrigger id="domain">
                <SelectValue placeholder={loadingDomains ? "Loading..." : "Select club, department, etc."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (No domain role)</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase">{domain.type}</span>
                      <span>•</span>
                      <span>{domain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select which club, department, or organization this role applies to
            </p>
          </div>

          {/* Domain Role/Position Selection */}
          {selectedDomainId && (
            <div className="space-y-2">
              <Label htmlFor="domain-role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Position in {domains.find(d => d.id === selectedDomainId)?.name || "Organization"}
              </Label>
              <Select
                value={selectedDomainRoleId}
                onValueChange={setSelectedDomainRoleId}
                disabled={loadingRoles}
              >
                <SelectTrigger id="domain-role">
                  <SelectValue placeholder={loadingRoles ? "Loading positions..." : "Select position"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingRoles ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Loading...
                      </div>
                    </SelectItem>
                  ) : availableDomainRoles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No positions available
                    </SelectItem>
                  ) : (
                    availableDomainRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Specific position: President, Secretary, Editor, etc.
              </p>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as UserStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor("Active")} variant="secondary">
                      Active
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="Inactive">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor("Inactive")} variant="secondary">
                      Inactive
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="Suspended">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor("Suspended")} variant="secondary">
                      Suspended
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls system access
            </p>
          </div>

          {/* Current Domain Roles Display */}
          {userDomainRoles.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Assignments:</p>
              <div className="space-y-1">
                {userDomainRoles.map((udr) => (
                  <div key={udr.id} className="text-sm text-foreground">
                    {udr.domain_role?.name || "Unknown"}
                    {udr.domain_role?.domain && (
                      <span className="text-muted-foreground"> in {udr.domain_role.domain.name}</span>
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
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
