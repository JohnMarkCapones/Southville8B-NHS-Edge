"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Settings, BarChart3, UserCog, Building, ChevronDown, ChevronRight } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    name: "User & Access Management",
    icon: Users,
    children: [
      { name: "All Users", href: "/admin/users/all" },
      { name: "Students", href: "/admin/users/students" },
      { name: "Teachers", href: "/admin/users/teachers" },
      { name: "Administrators", href: "/admin/users/administrators" },
    ],
  },
  {
    name: "System Management",
    icon: Settings,
    children: [
      { name: "System Settings", href: "/admin/system/settings" },
      { name: "Database", href: "/admin/system/database" },
      { name: "Security", href: "/admin/system/security" },
    ],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["User & Access Management"])

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[hsl(var(--superadmin-sidebar-primary))] border-r border-[hsl(var(--superadmin-border))]">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-[hsl(var(--superadmin-border))]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[hsl(var(--superadmin-primary))] rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[hsl(var(--superadmin-foreground))]">Southville 8B NHS</h1>
              <p className="text-xs text-[hsl(var(--superadmin-muted-foreground))]">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "text-[hsl(var(--superadmin-muted-foreground))] hover:text-[hsl(var(--superadmin-foreground))] hover:bg-[hsl(var(--superadmin-secondary))]",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {expandedItems.includes(item.name) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.name) && (
                    <div className="mt-2 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-lg transition-colors",
                            pathname === child.href
                              ? "bg-[hsl(var(--superadmin-primary))] text-white"
                              : "text-[hsl(var(--superadmin-muted-foreground))] hover:text-[hsl(var(--superadmin-foreground))] hover:bg-[hsl(var(--superadmin-secondary))]",
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-[hsl(var(--superadmin-primary))] text-white"
                      : "text-[hsl(var(--superadmin-muted-foreground))] hover:text-[hsl(var(--superadmin-foreground))] hover:bg-[hsl(var(--superadmin-secondary))]",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-[hsl(var(--superadmin-border))]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[hsl(var(--superadmin-primary))] rounded-full flex items-center justify-center">
              <UserCog className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--superadmin-foreground))] truncate">Super Admin</p>
              <p className="text-xs text-[hsl(var(--superadmin-muted-foreground))] truncate">
                admin@southville8b.edu.ph
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
