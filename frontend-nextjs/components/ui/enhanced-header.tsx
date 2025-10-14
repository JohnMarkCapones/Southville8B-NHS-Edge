"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Sun,
  Moon,
  Palette,
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  Phone,
  Sparkles,
  Bell,
  Search,
  Accessibility,
  Home,
  Newspaper,
  User,
  Settings,
  Shield,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    title: "Home",
    href: "/",
    description: "Return to homepage",
    icon: Home,
  },
  {
    title: "Academics",
    href: "/guess/academics",
    description: "Explore our comprehensive curriculum and programs",
    icon: BookOpen,
    items: [
      { title: "Departments", href: "/guess/academics/departments", description: "Academic departments and faculty" },
      { title: "AP Programs", href: "/guess/academics/ap-programs", description: "Advanced Placement courses" },
      { title: "STEM Focus", href: "/guess/academics/stem", description: "Science, Technology, Engineering, Math" },
      { title: "Course Catalog", href: "/guess/academics/courses", description: "Complete course listings" },
    ],
  },
  {
    title: "Student Life",
    href: "/guess/student-life",
    description: "Discover clubs, activities, and campus culture",
    icon: Users,
    items: [
      { title: "Campus Facilities", href: "/guess/student-life/facilities", description: "Tour our modern facilities" },
      { title: "Clubs & Organizations", href: "/guess/student-life/clubs", description: "Join student organizations" },
      {
        title: "Student Government",
        href: "/guess/student-life/government",
        description: "Student leadership opportunities",
      },
      { title: "Support Services", href: "/guess/student-life/support", description: "Academic and personal support" },
      {
        title: "Events & Traditions",
        href: "/guess/student-life/events",
        description: "School traditions and activities",
      },
    ],
  },
  {
    title: "Athletics",
    href: "/guess/athletics",
    description: "Join our championship sports programs",
    icon: Trophy,
    items: [
      { title: "Fall Sports", href: "/guess/athletics/fall", description: "Football, Soccer, Cross Country" },
      { title: "Winter Sports", href: "/guess/athletics/winter", description: "Basketball, Wrestling, Swimming" },
      { title: "Spring Sports", href: "/guess/athletics/spring", description: "Baseball, Track, Tennis" },
      { title: "Facilities", href: "/guess/athletics/facilities", description: "Athletic facilities and equipment" },
    ],
  },
  {
    title: "News & Events",
    href: "/guess/news-events",
    description: "Stay updated with school news and upcoming events",
    icon: Newspaper,
    items: [
      { title: "Latest News", href: "/guess/news", description: "Recent school announcements" }, // Updated link
      { title: "Event Calendar", href: "/guess/news-events/calendar", description: "Upcoming events and activities" },
      { title: "Newsletter", href: "/guess/news-events/newsletter", description: "Monthly school newsletter" },
    ],
  },
  {
    title: "Contact",
    href: "/guess/contact",
    description: "Get in touch with our school community",
    icon: Phone,
  },
]

export function EnhancedHeader() {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't return null - causes hydration mismatch
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        isScrolled ? "bg-background/95 backdrop-blur-xl border-b shadow-xl" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg" />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Southville 8B NHS
              </div>
              <div className="text-xs text-muted-foreground -mt-1 font-medium">Excellence in Education</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <NavigationMenuTrigger className="group hover:bg-accent/50 transition-all duration-300">
                        <item.icon className="w-4 h-4 mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                        {item.title}
                        <ChevronDown className="w-3 h-3 ml-1 group-hover:rotate-180 transition-transform duration-300" />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[500px] gap-3 p-6">
                          <div className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-lg hover:bg-accent transition-all duration-300 group"
                              >
                                <item.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                                <div className="mb-2 mt-4 text-lg font-semibold">{item.title}</div>
                                <p className="text-sm leading-tight text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                          <div className="grid gap-2">
                            {item.items.map((subItem) => (
                              <NavigationMenuLink key={subItem.title} asChild>
                                <Link
                                  href={subItem.href}
                                  className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-105"
                                >
                                  <div className="text-sm font-medium leading-none">{subItem.title}</div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {subItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-lg bg-background px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-105"
                      >
                        <item.icon className="w-4 h-4 mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <AnimatedButton
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-accent/50 hover:scale-110 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
            </AnimatedButton>

            {/* Notifications */}
            <AnimatedButton
              variant="ghost"
              size="icon"
              className="hidden md:flex relative hover:bg-accent/50 hover:scale-110 transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                3
              </Badge>
            </AnimatedButton>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  animation="glow"
                  className="hover:bg-accent/50 hover:scale-110 transition-all duration-300"
                  suppressHydrationWarning
                >
                  {mounted && theme === "light" ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : mounted && theme === "dark" ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                  ) : mounted && theme === "theme-colorblind" ? (
                    <Accessibility className="h-4 w-4 text-green-500" />
                  ) : (
                    <Palette className="h-4 w-4" />
                  )}
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                  <Moon className="mr-2 h-4 w-4 text-blue-400" />
                  Dark Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("theme-colorblind")} className="cursor-pointer">
                  <Accessibility className="mr-2 h-4 w-4 text-green-500" />
                  Colorblind Friendly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                  <Palette className="mr-2 h-4 w-4" />
                  System Default
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Portal Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="gradient"
                  size="sm"
                  animation="glow"
                  className="hidden sm:flex relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <Shield className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Portal
                    <Sparkles className="w-3 h-3 ml-2 group-hover:animate-spin" />
                  </div>
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/guess/login" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Student Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/guess/parent-portal" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Parent Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/guess/staff-portal" className="cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Staff Portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/guess/guest-access" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Guest Access
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-accent/50 hover:scale-110 transition-all duration-300"
                >
                  <Menu className="h-5 w-5" />
                </AnimatedButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span>Southville 8B NHS</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {navigation.map((item) => (
                    <div key={item.title} className="space-y-2">
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-all duration-300 group"
                      >
                        <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                      {item.items && (
                        <div className="ml-8 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className="block p-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:bg-accent/50 rounded"
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <AnimatedButton variant="gradient" className="w-full group" asChild>
                      <Link href="/guess/login">
                        <Shield className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                        Student Portal
                        <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
                      </Link>
                    </AnimatedButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
