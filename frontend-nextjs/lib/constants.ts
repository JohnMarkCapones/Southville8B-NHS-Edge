export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/guess/academics", label: "Academics" },
  { href: "/guess/extracurricular", label: "Extracurricular" },
  { href: "/guess/student-life", label: "Student Life" },
  { href: "/guess/alumni", label: "Alumni" },
  { href: "/guess/virtual-tour", label: "Virtual Tour" },
  { href: "/guess/news", label: "News" },
  { href: "/guess/leaderboard", label: "Leaderboard" },
  { href: "/guess/contact", label: "Contact" },
  { href: "/guess/login", label: "Login" },
]

export const MOCK_GALLERY_IMAGES = [
  { src: "/placeholder.svg?width=800&height=600&text=Science+Fair", alt: "Science Fair 2024" },
  { src: "/placeholder.svg?width=800&height=600&text=Sports+Day", alt: "Annual Sports Day" },
  { src: "/placeholder.svg?width=800&height=600&text=Graduation", alt: "Graduation Ceremony" },
  { src: "/placeholder.svg?width=800&height=600&text=Art+Exhibition", alt: "Student Art Exhibition" },
  { src: "/placeholder.svg?width=800&height=600&text=Music+Concert", alt: "School Music Concert" },
  { src: "/placeholder.svg?width=800&height=600&text=Campus+Life", alt: "Daily Campus Life" },
]

export type StudentHonor = {
  name: string
  level: "Honors" | "High Honors" | "Highest Honors"
  points?: number
}

export const MOCK_HONORS_STUDENT: StudentHonor = {
  name: "Alex Doe",
  level: "Highest Honors",
  points: 2500,
}

export const MOCK_BIRTHDAY_STUDENT = {
  name: "Jamie Lee",
}

export const MOCK_NEWS = [
  {
    id: 1,
    title: "Science Fair 2024 Winners Announced",
    excerpt:
      "Congratulations to all participants in this year's science fair. Outstanding projects showcased innovation and creativity.",
    date: "2024-01-15",
    category: "Academic",
    image: "/placeholder.svg?width=400&height=250&text=Science+Fair",
  },
  {
    id: 2,
    title: "New Computer Lab Opens",
    excerpt: "Municipal-grade computer laboratory now available for students with latest technology and software.",
    date: "2024-01-10",
    category: "Facilities",
    image: "/placeholder.svg?width=400&height=250&text=Computer+Lab",
  },
  {
    id: 3,
    title: "Basketball Team Wins Regional Championship",
    excerpt: "Our varsity basketball team brings home the regional championship trophy after an exciting final game.",
    date: "2024-01-08",
    category: "Sports",
    image: "/placeholder.svg?width=400&height=250&text=Basketball+Champions",
  },
]

export const MOCK_ALUMNI = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    graduationYear: 2010,
    profession: "Medical Doctor",
    achievement: "Chief of Surgery at National Hospital",
    image: "/placeholder.svg?width=200&height=200&text=Dr.+Maria",
    story: "From our science labs to saving lives, Maria's journey exemplifies excellence.",
  },
  {
    id: 2,
    name: "Eng. Carlos Rodriguez",
    graduationYear: 2008,
    profession: "Software Engineer",
    achievement: "Lead Developer at Tech Giant",
    image: "/placeholder.svg?width=200&height=200&text=Eng.+Carlos",
    story: "Carlos credits his programming foundation to our computer science program.",
  },
  {
    id: 3,
    name: "Prof. Ana Dela Cruz",
    graduationYear: 2005,
    profession: "University Professor",
    achievement: "PhD in Environmental Science",
    image: "/placeholder.svg?width=200&height=200&text=Prof.+Ana",
    story: "Ana's passion for environmental conservation started in our biology classes.",
  },
]

export const VIRTUAL_TOUR_LOCATIONS = [
  {
    id: 1,
    name: "Main Building",
    description: "Administrative offices and faculty rooms",
    image: "/placeholder.svg?width=600&height=400&text=Main+Building",
    hotspots: [
      { x: 30, y: 40, label: "Principal's Office" },
      { x: 70, y: 60, label: "Faculty Lounge" },
    ],
  },
  {
    id: 2,
    name: "Science Laboratory",
    description: "Fully equipped labs for physics, chemistry, and biology",
    image: "/placeholder.svg?width=600&height=400&text=Science+Lab",
    hotspots: [
      { x: 25, y: 35, label: "Chemistry Station" },
      { x: 75, y: 45, label: "Microscope Area" },
    ],
  },
  {
    id: 3,
    name: "Library",
    description: "Quiet study spaces and extensive book collection",
    image: "/placeholder.svg?width=600&height=400&text=Library",
    hotspots: [
      { x: 40, y: 30, label: "Reading Area" },
      { x: 60, y: 70, label: "Computer Section" },
    ],
  },
]
