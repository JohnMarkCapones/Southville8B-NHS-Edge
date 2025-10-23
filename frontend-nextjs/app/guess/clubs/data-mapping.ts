// Define the ClubItem type locally since it's not exported from the page
export interface ClubItem {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  members: number;
  meetingTime: string;
  location: string;
  adviser: {
    name: string;
    title: string;
    credentials: string;
    bio: string;
    achievements: string[];
    quote: string;
    email: string;
    office: string;
    image: string;
  };
  description: string;
  mission: string;
  goals: string[];
  officers: Array<{
    name: string;
    position: string;
    grade: string;
    bio: string;
    achievements: string[];
    image: string;
    icon: string;
  }>;
  upcomingEvents: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    type: string;
    icon: string;
  }>;
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  stats: Array<{
    number: string;
    label: string;
    icon: string;
  }>;
}

export interface BackendClub {
  id: string;
  name: string;
  description: string;
  president_id: string;
  vp_id: string;
  secretary_id: string;
  advisor_id: string;
  co_advisor_id?: string;
  domain_id: string;
  created_at: string;
  updated_at: string;
  // Related data (from joins)
  president?: {
    id: string;
    email: string;
    full_name: string;
  };
  vp?: {
    id: string;
    email: string;
    full_name: string;
  };
  secretary?: {
    id: string;
    email: string;
    full_name: string;
  };
  advisor?: {
    id: string;
    email: string;
    full_name: string;
  };
  co_advisor?: {
    id: string;
    email: string;
    full_name: string;
  };
  domain?: {
    id: string;
    name: string;
    type: string;
  };
}

// Club icons mapping based on domain/name
const getClubIcon = (clubName: string, domainName?: string): string => {
  const name = clubName.toLowerCase();
  const domain = domainName?.toLowerCase() || '';
  
  if (name.includes('math') || domain.includes('math')) return 'Calculator';
  if (name.includes('science') || domain.includes('science')) return 'Microscope';
  if (name.includes('javascript') || name.includes('coding') || name.includes('programming')) return 'Code';
  if (name.includes('debate') || name.includes('speech')) return 'Users';
  if (name.includes('robotics') || name.includes('robot')) return 'Code';
  if (name.includes('music') || name.includes('band') || name.includes('choir')) return 'Music';
  if (name.includes('art') || name.includes('drawing') || name.includes('painting')) return 'Palette';
  if (name.includes('sports') || name.includes('athletic')) return 'Trophy';
  if (name.includes('environment') || name.includes('eco')) return 'Leaf';
  if (name.includes('model un') || name.includes('mun')) return 'Globe';
  if (name.includes('drama') || name.includes('theater')) return 'Drama';
  if (name.includes('chess') || name.includes('strategy')) return 'Users';
  
  return 'Users'; // Default icon
};

// Club colors mapping
const getClubColor = (clubName: string, domainName?: string): string => {
  const name = clubName.toLowerCase();
  const domain = domainName?.toLowerCase() || '';
  
  if (name.includes('math') || domain.includes('math')) return 'from-blue-500 to-blue-600';
  if (name.includes('science') || domain.includes('science')) return 'from-green-500 to-green-600';
  if (name.includes('javascript') || name.includes('coding') || name.includes('programming')) return 'from-purple-500 to-purple-600';
  if (name.includes('debate') || name.includes('speech')) return 'from-red-500 to-red-600';
  if (name.includes('robotics') || name.includes('robot')) return 'from-purple-500 to-purple-600';
  if (name.includes('music') || name.includes('band') || name.includes('choir')) return 'from-pink-500 to-pink-600';
  if (name.includes('art') || name.includes('drawing') || name.includes('painting')) return 'from-orange-500 to-orange-600';
  if (name.includes('sports') || name.includes('athletic')) return 'from-green-500 to-emerald-500';
  if (name.includes('environment') || name.includes('eco')) return 'from-green-500 to-teal-500';
  if (name.includes('model un') || name.includes('mun')) return 'from-teal-500 to-teal-600';
  if (name.includes('drama') || name.includes('theater')) return 'from-purple-500 to-pink-500';
  if (name.includes('chess') || name.includes('strategy')) return 'from-gray-500 to-gray-600';
  
  return 'from-blue-500 to-blue-600'; // Default color
};

export function mapBackendClubToFrontend(backendClub: BackendClub): ClubItem {
  // Generate slug from club name
  const slug = backendClub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
  
  // Get icon and color based on club name/domain
  const iconName = getClubIcon(backendClub.name, backendClub.domain?.name);
  const colorClass = getClubColor(backendClub.name, backendClub.domain?.name);
  
  return {
    id: backendClub.id,
    slug: slug,
    name: backendClub.name,
    icon: iconName, // We'll need to import the actual icon component
    color: colorClass,
    members: 25, // Default member count - could be calculated from memberships
    meetingTime: "Tuesdays 3:30 PM", // Default - could be from club settings
    location: "Room 205", // Default - could be from club settings
    adviser: {
      name: backendClub.advisor?.full_name || 'Club Advisor',
      title: "Club Advisor",
      credentials: "Club Advisor",
      bio: "Dedicated club advisor supporting student activities and growth.",
      achievements: ["Club Advisor"],
      quote: "Supporting students in their extracurricular journey.",
      email: backendClub.advisor?.email || 'advisor@southville8b.edu',
      office: "Main Office",
      image: "/placeholder.svg?height=150&width=150&text=Advisor",
    },
    description: backendClub.description || "Join our club for exciting activities and learning opportunities.",
    mission: "Our mission is to provide students with opportunities to explore their interests, develop new skills, and build lasting friendships through club activities.",
    goals: [
      "🤝 Build a supportive community",
      "📚 Learn new skills and knowledge",
      "🎯 Achieve club objectives",
      "🌟 Develop leadership abilities",
      "🎉 Have fun and make memories",
    ],
    officers: [
      ...(backendClub.president ? [{
        name: backendClub.president.full_name,
        position: "President",
        grade: "Grade 12",
        bio: "Club president leading with dedication and vision.",
        achievements: ["Leadership Excellence"],
        image: "/placeholder.svg?height=120&width=120&text=P",
        icon: "Crown",
      }] : []),
      ...(backendClub.vp ? [{
        name: backendClub.vp.full_name,
        position: "Vice President",
        grade: "Grade 11",
        bio: "Supporting the club's mission as vice president.",
        achievements: ["Leadership Excellence"],
        image: "/placeholder.svg?height=120&width=120&text=VP",
        icon: "Medal",
      }] : []),
      ...(backendClub.secretary ? [{
        name: backendClub.secretary.full_name,
        position: "Secretary",
        grade: "Grade 10",
        bio: "Managing club records and communications.",
        achievements: ["Organizational Excellence"],
        image: "/placeholder.svg?height=120&width=120&text=S",
        icon: "Star",
      }] : []),
    ],
    upcomingEvents: [
      {
        title: "Club Meeting",
        date: "2024-03-20",
        time: "3:30 PM - 4:30 PM",
        location: "Room 205",
        description: "Weekly club meeting and activities",
        type: "Meeting",
        icon: "Calendar",
      },
    ],
    benefits: [
      {
        title: "Skill Development",
        description: "Learn new skills and enhance existing ones",
        icon: "GraduationCap",
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Leadership Opportunities",
        description: "Develop leadership and teamwork skills",
        icon: "Crown",
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Community Building",
        description: "Connect with like-minded peers",
        icon: "Users",
        color: "from-green-500 to-teal-500",
      },
    ],
    faqItems: [
      {
        question: "Who can join this club?",
        answer: "Any student from grades 9-12 with an interest in our activities is welcome to join!",
      },
      {
        question: "When do you meet?",
        answer: "We meet regularly during the school year. Contact us for specific meeting times.",
      },
      {
        question: "Are there any requirements?",
        answer: "Just bring your enthusiasm and willingness to participate in club activities!",
      },
    ],
    stats: [
      { number: "25+", label: "Active Members", icon: "👥" },
      { number: "100%", label: "Student Satisfaction", icon: "⭐" },
      { number: "10+", label: "Activities Yearly", icon: "📅" },
      { number: "4.0", label: "Average GPA", icon: "🎓" },
    ],
  };
}

export async function fetchClubsFromAPI(): Promise<ClubItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
  const res = await fetch(`${apiUrl}/api/v1/clubs`, {
    next: { revalidate: 0 }, // No caching for development
  });

  if (!res.ok) {
    console.error('Failed to fetch clubs from API:', res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return data.map(mapBackendClubToFrontend);
}

export async function findClubBySlugFromAPI(slug: string): Promise<ClubItem | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
  
  // First, get all clubs and find the one with matching slug
  const res = await fetch(`${apiUrl}/api/v1/clubs`, {
    next: { revalidate: 0 }, // No caching for development
  });

  if (!res.ok) {
    console.error('Failed to fetch clubs from API:', res.status, res.statusText);
    return null;
  }

  const clubs = await res.json();
  const club = clubs.find((c: BackendClub) => {
    const clubSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
    return clubSlug === slug;
  });

  if (!club) {
    return null;
  }

  return mapBackendClubToFrontend(club);
}
