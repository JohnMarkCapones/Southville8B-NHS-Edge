"use client"

import { NavigationMenuItem } from "@/components/ui/navigation-menu"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { AnimatedButton } from "@/components/ui/animated-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Sun,
  Moon,
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  Home,
  Newspaper,
  User,
  Shield,
  Calendar,
  MapPin,
  Briefcase,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchComponent } from "@/components/header/search-component"

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
      { title: "TLE Focus", href: "/guess/academics/tle", description: "Technology and Livelihood Education" },
      {
        title: "Curriculum Overview",
        href: "/guess/academics/curriculum",
        description: "Complete curriculum overview",
      },
      { title: "Academic Excellence", href: "/guess/academic-excellence", description: "Rankings and honors" },
      { title: "Library", href: "/guess/library", description: "Digital and physical library resources" },
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
      { title: "Sports Programs", href: "/guess/athletics/programs", description: "Available sports and activities" },
      { title: "Facilities", href: "/guess/athletics/facilities", description: "Athletic facilities and equipment" },
      { title: "Schedules", href: "/guess/athletics/schedules", description: "Game schedules and results" },
      { title: "Teams & Coaches", href: "/guess/athletics/teams", description: "Meet our teams and coaching staff" },
    ],
  },
  {
    title: "News & Events",
    href: "/guess/news-events",
    description: "Stay updated with school news and upcoming events",
    icon: Newspaper,
    items: [
      { title: "Latest News", href: "/guess/news", description: "Recent school announcements" },
      { title: "Event Calendar", href: "/guess/news-events/calendar", description: "Upcoming events and activities" },
      { title: "Newsletter", href: "/guess/news-events/newsletter", description: "Monthly school newsletter" },
      { title: "Photo Gallery", href: "/guess/gallery", description: "School photos and memories" },
      { title: "Live Stream", href: "/guess/live-stream", description: "Watch school events live" },
    ],
  },
]

const quickAccessButtons = [
  { title: "Student Portal", href: "/guess/login", icon: User, color: "from-blue-500 to-blue-600" },
  { title: "Parent Portal", href: "/guess/parent-portal", icon: Users, color: "from-green-500 to-green-600" },
  { title: "Staff Portal", href: "/guess/staff-portal", icon: Briefcase, color: "from-purple-500 to-purple-600" },
  { title: "Library", href: "/guess/library", icon: BookOpen, color: "from-orange-500 to-orange-600" },
  { title: "Calendar", href: "/guess/calendar", icon: Calendar, color: "from-pink-500 to-pink-600" },
  { title: "Directory", href: "/guess/directory", icon: MapPin, color: "from-teal-500 to-teal-600" },
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  const isDarkMode = theme === "dark"

  const mainNavigation = navigation.slice(0, 3) // Home, Academics, Student Life
  const moreNavigation = navigation.slice(3) // Athletics, News & Events

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b-0",
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-b shadow-xl"
            : "bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-md",
          isDarkMode && "border-border/50",
        )}
      >
        <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-10 xs:h-11 sm:h-12 md:h-13 lg:h-14 xl:h-16 items-center justify-between gap-1 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {/* Logo Section - Enhanced mobile optimization */}
            <Link
              href="/"
              className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 group flex-shrink-0 min-w-0"
            >
              <div className="relative flex-shrink-0">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-lg xs:rounded-xl overflow-hidden transition-all duration-300 shadow-md xs:shadow-lg group-hover:scale-105">
                  <img
                    src="/logo.png"
                    alt="Southville 8B NHS Logo"
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 rounded-lg xs:rounded-xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
              </div>
              <div className="hidden xs:block min-w-0 flex-1">
                <div
                  className={cn(
                    "font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl truncate transition-all duration-300",
                    "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500",
                  )}
                >
                  Southville 8B NHS
                </div>
                <div
                  className={cn(
                    "text-[8px] xs:text-[9px] sm:text-xs md:text-sm -mt-0.5 xs:-mt-0.5 font-medium hidden sm:block truncate transition-colors duration-300",
                    isDarkMode
                      ? "text-muted-foreground group-hover:text-foreground/80"
                      : "text-muted-foreground group-hover:text-foreground/80",
                  )}
                >
                  Excellence in Education
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Enhanced */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList className="space-x-1 xl:space-x-2">
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            "group hover:bg-accent/50 transition-all duration-300 text-sm xl:text-base font-medium px-2 xl:px-3 py-1.5 rounded-lg",
                            isDarkMode && "hover:bg-accent text-foreground",
                          )}
                        >
                          <item.icon className="w-4 h-4 xl:w-5 xl:h-5 mr-2 transition-transform duration-300" />
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div
                            className={cn(
                              "grid w-[500px] xl:w-[600px] gap-3 p-6 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                              isDarkMode && "bg-card border-border shadow-2xl",
                            )}
                          >
                            <div className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "flex h-full w-full select-none flex-col justify-end rounded-xl p-6 no-underline outline-none focus:shadow-lg hover:bg-accent transition-all duration-300 group",
                                    isDarkMode && "bg-muted/50 hover:bg-accent",
                                  )}
                                >
                                  <item.icon className="h-8 w-8 xl:h-10 xl:w-10 text-primary transition-all duration-300" />
                                  <div className="mb-2 mt-4 text-lg xl:text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                                    {item.title}
                                  </div>
                                  <p className="text-sm xl:text-base leading-tight text-muted-foreground group-hover:text-foreground transition-colors duration-300">
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
                                    className={cn(
                                      "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                      isDarkMode && "hover:bg-accent",
                                    )}
                                  >
                                    <div className="text-sm xl:text-base font-medium leading-none">{subItem.title}</div>
                                    <p className="line-clamp-2 text-xs xl:text-sm leading-snug text-muted-foreground">
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
                          className={cn(
                            "group inline-flex h-9 xl:h-10 w-max items-center justify-center rounded-lg bg-background px-2 xl:px-3 py-1.5 text-sm xl:text-base font-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isDarkMode && "bg-card hover:bg-accent",
                          )}
                        >
                          <item.icon className="w-4 h-4 xl:w-5 xl:h-5 mr-2 transition-transform duration-300" />
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <NavigationMenu className="hidden md:flex lg:hidden">
              <NavigationMenuList className="space-x-1">
                {/* Main navigation items */}
                {mainNavigation.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            "group hover:bg-accent/50 transition-all duration-300 text-sm font-medium px-2 py-1.5 rounded-lg",
                            isDarkMode && "hover:bg-accent text-foreground",
                          )}
                        >
                          <item.icon className="w-4 h-4 mr-2 transition-transform duration-300" />
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div
                            className={cn(
                              "grid w-[450px] gap-3 p-6 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                              isDarkMode && "bg-card border-border shadow-2xl",
                            )}
                          >
                            <div className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "flex h-full w-full select-none flex-col justify-end rounded-xl p-6 no-underline outline-none focus:shadow-lg hover:bg-accent transition-all duration-300 group",
                                    isDarkMode && "bg-muted/50 hover:bg-accent",
                                  )}
                                >
                                  <item.icon className="h-8 w-8 text-primary transition-all duration-300" />
                                  <div className="mb-2 mt-4 text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                                    {item.title}
                                  </div>
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
                                    className={cn(
                                      "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                      isDarkMode && "hover:bg-accent",
                                    )}
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
                          className={cn(
                            "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-background px-2 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isDarkMode && "bg-card hover:bg-accent",
                          )}
                        >
                          <item.icon className="w-4 h-4 mr-2 transition-transform duration-300" />
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}

                {/* More dropdown for remaining items */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "group hover:bg-accent/50 transition-all duration-300 text-sm font-medium px-2 py-1.5 rounded-lg",
                      isDarkMode && "hover:bg-accent text-foreground",
                    )}
                  >
                    <Menu className="w-4 h-4 mr-2 transition-transform duration-300" />
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div
                      className={cn(
                        "w-[350px] p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                        isDarkMode && "bg-card border-border shadow-2xl",
                      )}
                    >
                      <div className="grid gap-2">
                        {moreNavigation.map((item) => (
                          <NavigationMenuLink key={item.title} asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-all duration-300 group",
                                isDarkMode && "hover:bg-accent",
                              )}
                            >
                              <item.icon className="w-5 h-5 text-primary transition-transform duration-300" />
                              <div>
                                <div className="text-sm font-medium">{item.title}</div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Side Actions - Enhanced mobile layout */}
            <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
              {/* Search Component - Enhanced responsive visibility */}
              <div className="hidden sm:block">
                <SearchComponent />
              </div>

              {/* Theme Toggle - Enhanced */}
              <AnimatedButton
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-accent/50 transition-all duration-300 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10",
                  isDarkMode && "hover:bg-accent",
                )}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Sun className="h-3 w-3 xs:h-4 xs:w-4 sm:h-4 sm:w-4 text-yellow-500 transition-transform duration-300" />
                ) : (
                  <Moon className="h-3 w-3 xs:h-4 xs:w-4 sm:h-4 sm:w-4 text-blue-400 transition-transform duration-300" />
                )}
              </AnimatedButton>

              {/* Portal Button - Enhanced mobile responsiveness */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton
                    variant="nav-primary"
                    size="sm"
                    className={cn(
                      "relative overflow-hidden group shadow-md xs:shadow-lg hover:shadow-xl transition-all duration-300",
                      "px-1.5 xs:px-2 sm:px-2.5 md:px-3 lg:px-4 xl:px-5",
                      "h-6 xs:h-7 sm:h-8 md:h-8 lg:h-9 xl:h-10",
                      "text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-sm",
                      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white",
                    )}
                  >
                    <div className="relative flex items-center">
                      <Shield className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-0.5 xs:mr-1 sm:mr-1.5 md:mr-2 transition-transform duration-300" />
                      <span className="font-bold">Portal</span>
                    </div>
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "w-40 xs:w-44 sm:w-48 md:w-52 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                    isDarkMode && "bg-card border-border",
                  )}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs xs:text-sm font-semibold">Access Portal As:</p>
                  </div>
                  {[
                    { href: "/guess/portal?role=student", icon: User, label: "Student", color: "text-blue-500" },
                    {
                      href: "/guess/portal?role=teacher",
                      icon: GraduationCap,
                      label: "Teacher",
                      color: "text-blue-600",
                    },
                    { href: "/guess/portal?role=admin", icon: Shield, label: "Administrator", color: "text-blue-700" },
                    {
                      href: "/guess/portal?role=parent",
                      icon: Users,
                      label: "Parent/Guardian",
                      color: "text-blue-500",
                    },
                  ].map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} className="cursor-pointer group">
                        <item.icon
                          className={`mr-2 h-3 w-3 xs:h-4 xs:w-4 ${item.color} transition-transform duration-200 group-hover:scale-110`}
                        />
                        <span className="text-xs xs:text-sm">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu - Enhanced */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "md:hidden hover:bg-accent/50 transition-all duration-300 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8",
                      isDarkMode && "hover:bg-accent",
                    )}
                  >
                    <Menu className="h-4 w-4 xs:h-4 xs:w-4 transition-transform duration-300" />
                  </AnimatedButton>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className={cn("w-72 xs:w-80 sm:w-96 flex flex-col", isDarkMode && "bg-card border-border")}
                >
                  <SheetHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                    <SheetTitle className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-base font-bold">Southville 8B NHS</span>
                    </SheetTitle>
                    <AnimatedButton
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 hover:bg-accent/50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </AnimatedButton>
                  </SheetHeader>

                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Mobile Search - Always visible in mobile menu */}
                    <div className="flex-shrink-0 mt-6 mb-4">
                      <SearchComponent className="w-full" />
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                      {/* Quick Access Buttons - Enhanced */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Quick Access
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {quickAccessButtons.slice(0, 4).map((button) => (
                            <Link
                              key={button.title}
                              href={button.href}
                              className={cn(
                                "flex flex-col items-center p-3 rounded-xl transition-all duration-300 group",
                                `bg-gradient-to-r ${button.color} text-white hover:shadow-lg`,
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <button.icon className="w-5 h-5 mb-2 transition-transform duration-300" />
                              <span className="text-xs font-medium text-center leading-tight">{button.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Menu Items - Enhanced */}
                      <div className="space-y-4 pb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                          <Menu className="w-4 h-4 mr-2" />
                          Navigation
                        </h3>
                        {navigation.map((item) => (
                          <div key={item.title} className="space-y-2">
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-xl hover:bg-accent transition-all duration-300 group",
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <item.icon className="w-5 h-5 text-primary transition-transform duration-300" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                            {item.items && (
                              <div className="ml-8 space-y-1">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.title}
                                    href={subItem.href}
                                    className="block p-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50 rounded-lg hover:scale-105"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {subItem.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
