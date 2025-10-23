import { Users } from "your-icon-library"

const sidebarItems = [
  {
    name: "Clubs",
    href: "/student/clubs",
    icon: Users,
    submenu: [
      { name: "My Clubs", href: "/student/clubs" },
      { name: "My Applications", href: "/student/clubs/applications" },
      { name: "Discover Clubs", href: "/student/clubs/discover" },
    ],
  },
  // /** rest of code here **/
]

export default sidebarItems
