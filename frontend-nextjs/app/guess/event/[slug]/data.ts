export type EventItem = {
  id: number
  title: string
  slug: string
  description: string
  fullDescription: string
  date: string
  time: string
  location: string
  category: string
  registrationCount: number
  maxRegistration?: number
  image: string
  tags: string[]
  organizer: string
  organizerContact: string
  organizerPhone?: string
  price?: string
  featured?: boolean
  highlights?: string[]
  schedule?: { time: string; activity: string }[]
}

export const EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Spring Musical: Hamilton",
    slug: "spring-musical-hamilton",
    description: "Drama department with professional-level production",
    fullDescription:
      "Join us for an unforgettable evening as our talented drama department presents Hamilton, the revolutionary musical that tells the story of American founding father Alexander Hamilton. This professional-level production features our most talented students in a spectacular showcase of music, dance, and storytelling.",
    date: "2024-04-20",
    time: "7:00 PM",
    location: "Main Auditorium",
    category: "Arts & Culture",
    registrationCount: 342,
    maxRegistration: 500,
    image: "/placeholder.svg?height=400&width=800&text=Hamilton+Musical",
    tags: ["Musical", "Drama", "Hamilton"],
    organizer: "Drama Department",
    organizerContact: "drama@southville8b.edu",
    organizerPhone: "(555) 123-4567",
    price: "$15",
    featured: true,
    highlights: [
      "Professional-level choreography and staging",
      "Live orchestra accompaniment",
      "Stunning period costumes and set design",
      "Meet & greet with cast after show",
    ],
    schedule: [
      { time: "6:30 PM", activity: "Doors Open" },
      { time: "7:00 PM", activity: "Show Begins" },
      { time: "8:15 PM", activity: "Intermission" },
      { time: "9:30 PM", activity: "Show Ends" },
      { time: "9:45 PM", activity: "Cast Meet & Greet" },
    ],
  },
  {
    id: 2,
    title: "State Basketball Championship",
    slug: "state-basketball-championship",
    description: "Eagles compete for state championship",
    fullDescription:
      "Cheer on our Southville Eagles as they compete in the State Basketball Championship! This is the culmination of an incredible season, and our team needs your support as they face off against the best teams in the state.",
    date: "2024-03-15",
    time: "8:00 PM",
    location: "State Arena, Downtown",
    category: "Sports",
    registrationCount: 150,
    image: "/placeholder.svg?height=400&width=800&text=Basketball+Championship",
    tags: ["Basketball", "Championship", "Sports"],
    organizer: "Athletic Department",
    organizerContact: "athletics@southville8b.edu",
    organizerPhone: "(555) 123-4568",
    highlights: [
      "State championship game",
      "Live streaming available",
      "Team merchandise available",
      "Post-game celebration",
    ],
    schedule: [
      { time: "7:00 PM", activity: "Arena Opens" },
      { time: "7:30 PM", activity: "Warm-ups Begin" },
      { time: "8:00 PM", activity: "Game Starts" },
      { time: "10:00 PM", activity: "Estimated Game End" },
    ],
  },
  {
    id: 3,
    title: "Science Fair 2024",
    slug: "science-fair-2024",
    description: "Annual showcase of student STEM projects with university judges",
    fullDescription:
      "Discover the future of science at our annual Science Fair! Students from all grade levels will present their innovative STEM projects, judged by professors from local universities. This event celebrates scientific inquiry and innovation.",
    date: "2024-05-10",
    time: "9:00 AM",
    location: "Gymnasium",
    category: "Academic",
    registrationCount: 89,
    maxRegistration: 100,
    image: "/placeholder.svg?height=400&width=800&text=Science+Fair",
    tags: ["Science", "STEM", "Competition"],
    organizer: "Science Department",
    organizerContact: "science@southville8b.edu",
    organizerPhone: "(555) 123-4569",
    featured: true,
    highlights: [
      "Over 50 student projects",
      "University professor judges",
      "Awards ceremony at 3 PM",
      "Interactive demonstrations",
    ],
    schedule: [
      { time: "9:00 AM", activity: "Fair Opens" },
      { time: "10:00 AM", activity: "Judging Begins" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "1:00 PM", activity: "Public Viewing" },
      { time: "3:00 PM", activity: "Awards Ceremony" },
    ],
  },
  {
    id: 4,
    title: "Graduation Ceremony 2024",
    slug: "graduation-ceremony-2024",
    description: "Celebrating the graduating class of 2024",
    fullDescription:
      "Join us in celebrating the achievements of our Class of 2024! This momentous occasion marks the culmination of years of hard work, dedication, and growth. Our graduates are ready to take on the world and make their mark.",
    date: "2024-06-15",
    time: "10:00 AM",
    location: "Football Stadium",
    category: "Special Event",
    registrationCount: 560,
    maxRegistration: 600,
    image: "/placeholder.svg?height=400&width=800&text=Graduation+2024",
    tags: ["Graduation", "Class of 2024", "Ceremony"],
    organizer: "Administration",
    organizerContact: "admin@southville8b.edu",
    organizerPhone: "(555) 123-4570",
    featured: true,
    highlights: [
      "Keynote speaker: Dr. Sarah Johnson",
      "Recognition of academic achievements",
      "Musical performances by school choir",
      "Reception following ceremony",
    ],
    schedule: [
      { time: "9:00 AM", activity: "Guests Arrive" },
      { time: "9:30 AM", activity: "Processional Music" },
      { time: "10:00 AM", activity: "Ceremony Begins" },
      { time: "11:30 AM", activity: "Diploma Presentation" },
      { time: "12:00 PM", activity: "Reception" },
    ],
  },
  {
    id: 5,
    title: "Senior Prom 2024",
    slug: "senior-prom-2024",
    description: "Elegant senior prom with 'Enchanted Garden' theme",
    fullDescription:
      "Step into an Enchanted Garden at Senior Prom 2024! This magical evening will feature elegant decorations, professional photography, and an unforgettable night of dancing and celebration for our senior class.",
    date: "2024-05-18",
    time: "7:00 PM",
    location: "Grand Ballroom Hotel",
    category: "Social",
    registrationCount: 287,
    maxRegistration: 400,
    image: "/placeholder.svg?height=400&width=800&text=Senior+Prom",
    tags: ["Prom", "Senior", "Dance"],
    organizer: "Student Council",
    organizerContact: "studentcouncil@southville8b.edu",
    organizerPhone: "(555) 123-4571",
    price: "$75",
    highlights: [
      "Enchanted Garden theme decorations",
      "Professional DJ and live band",
      "Professional photography",
      "Elegant dinner service",
      "Prom king and queen ceremony",
    ],
    schedule: [
      { time: "7:00 PM", activity: "Doors Open" },
      { time: "7:30 PM", activity: "Dinner Service" },
      { time: "8:30 PM", activity: "Dancing Begins" },
      { time: "10:00 PM", activity: "Prom Court Ceremony" },
      { time: "11:00 PM", activity: "Event Ends" },
    ],
  },
  {
    id: 6,
    title: "Robotics Competition",
    slug: "robotics-competition",
    description: "Regional robotics competition featuring innovative student robots",
    fullDescription:
      "Watch our engineering students showcase their innovative robots in this exciting regional competition! Teams will compete in various challenges that test their robots' capabilities and their programming skills.",
    date: "2024-04-12",
    time: "8:00 AM",
    location: "Engineering Lab",
    category: "Academic",
    registrationCount: 78,
    maxRegistration: 100,
    image: "/placeholder.svg?height=400&width=800&text=Robotics+Competition",
    tags: ["Robotics", "Engineering", "Competition"],
    organizer: "Engineering Club",
    organizerContact: "engineering@southville8b.edu",
    organizerPhone: "(555) 123-4572",
    highlights: [
      "Multiple competition categories",
      "Live robot demonstrations",
      "Awards for innovation and design",
      "Meet the engineering teams",
    ],
    schedule: [
      { time: "8:00 AM", activity: "Registration Opens" },
      { time: "9:00 AM", activity: "Competition Begins" },
      { time: "12:00 PM", activity: "Lunch Break" },
      { time: "1:00 PM", activity: "Final Rounds" },
      { time: "3:00 PM", activity: "Awards Ceremony" },
    ],
  },
]

export function findEventBySlug(slug: string) {
  return EVENTS.find((e) => e.slug === slug)
}