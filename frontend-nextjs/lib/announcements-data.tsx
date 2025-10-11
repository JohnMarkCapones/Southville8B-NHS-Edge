export interface Announcement {
  id: string
  slug: string
  date: string
  title: string
  category: "urgent" | "academic" | "event" | "general"
  source: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  tags?: string[]
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  sticky?: boolean
}

export const announcementsData: Announcement[] = [
  {
    id: "1",
    slug: "early-application-extended",
    date: "2024-03-15",
    title: "Early Application Deadline Extended - Apply by March 31st for Priority Consideration",
    category: "urgent",
    source: "Admissions Office",
    excerpt:
      "We've extended our early application deadline to give prospective students more time to submit their applications.",
    content: `
      <p>The Admissions Office is pleased to announce that we have extended the early application deadline to <strong>March 31st, 2024</strong>. This extension provides prospective students additional time to complete their applications and gather necessary documentation.</p>
      
      <h3>Why Apply Early?</h3>
      <p>Early applicants will receive priority consideration for:</p>
      <ul>
        <li>Enrollment in our most popular programs</li>
        <li>Merit-based scholarship opportunities</li>
        <li>Preferred class scheduling</li>
        <li>Early access to orientation programs</li>
      </ul>
      
      <h3>Application Requirements</h3>
      <p>To complete your application, please ensure you submit:</p>
      <ul>
        <li>Completed application form</li>
        <li>Official transcripts from previous schools</li>
        <li>Two letters of recommendation</li>
        <li>Personal statement (500-750 words)</li>
        <li>Proof of residence</li>
      </ul>
      
      <h3>Important Dates</h3>
      <ul>
        <li><strong>March 31, 2024:</strong> Early application deadline</li>
        <li><strong>April 15, 2024:</strong> Admission decisions released</li>
        <li><strong>May 1, 2024:</strong> Enrollment confirmation deadline</li>
      </ul>
      
      <p>For questions or assistance with your application, please contact the Admissions Office at admissions@southville8bnhs.edu or call (555) 123-4567.</p>
    `,
    author: {
      name: "Maria Santos",
      role: "Director of Admissions",
    },
    tags: ["admissions", "deadline", "applications"],
    sticky: true,
  },
  {
    id: "2",
    slug: "science-olympiad-championship",
    date: "2024-03-12",
    title: "Science Olympiad Team Wins State Championship for Third Consecutive Year",
    category: "academic",
    source: "Academic Affairs",
    excerpt:
      "Our talented Science Olympiad team has once again proven their excellence by securing the state championship title.",
    content: `
      <p>Congratulations to our Science Olympiad team for their outstanding performance at the State Championship held at the University of the Philippines on March 9-10, 2024! This marks the <strong>third consecutive year</strong> our team has claimed the top spot, demonstrating exceptional dedication and scientific prowess.</p>
      
      <h3>Championship Highlights</h3>
      <p>Our team competed against 45 schools from across the region and achieved remarkable results:</p>
      <ul>
        <li><strong>1st Place Overall</strong> - Team Score: 287 points</li>
        <li><strong>Gold Medals</strong> in Anatomy & Physiology, Chemistry Lab, and Experimental Design</li>
        <li><strong>Silver Medals</strong> in Physics, Astronomy, and Forensics</li>
        <li><strong>Bronze Medals</strong> in Ecology and Robotics</li>
      </ul>
      
      <h3>Team Members</h3>
      <p>Special recognition to our dedicated team members:</p>
      <ul>
        <li>Sarah Chen (Team Captain) - Grade 12</li>
        <li>Michael Rodriguez - Grade 12</li>
        <li>Emily Thompson - Grade 11</li>
        <li>David Kim - Grade 11</li>
        <li>Jessica Martinez - Grade 10</li>
        <li>Alex Johnson - Grade 10</li>
      </ul>
      
      <h3>Coach's Statement</h3>
      <p>"I couldn't be prouder of our team's dedication and hard work," said Coach Dr. Robert Chen. "They've spent countless hours preparing, and their passion for science truly shines through in their performance."</p>
      
      <h3>National Competition</h3>
      <p>The team will now advance to the National Science Olympiad Championship in Manila on May 15-17, 2024. We wish them the best of luck as they represent our school on the national stage!</p>
    `,
    author: {
      name: "Dr. Robert Chen",
      role: "Science Olympiad Coach",
    },
    tags: ["science", "competition", "achievement"],
  },
  {
    id: "3",
    slug: "hamilton-musical-tickets",
    date: "2024-03-10",
    title: "Spring Musical 'Hamilton' Tickets Now Available - Shows Begin April 20th",
    category: "event",
    source: "Drama Department",
    excerpt:
      "Don't miss our spectacular production of Hamilton! Tickets are selling fast for all three weekend performances.",
    content: `
      <p>The Drama Department is thrilled to present <strong>Hamilton</strong> this spring! This groundbreaking musical tells the story of American founding father Alexander Hamilton through a revolutionary blend of hip-hop, jazz, and traditional show tunes.</p>
      
      <h3>Performance Schedule</h3>
      <ul>
        <li><strong>Friday, April 20, 2024</strong> - 7:00 PM</li>
        <li><strong>Saturday, April 21, 2024</strong> - 2:00 PM & 7:00 PM</li>
        <li><strong>Sunday, April 22, 2024</strong> - 2:00 PM</li>
      </ul>
      
      <p><strong>Location:</strong> Main Auditorium, Southville 8B National High School</p>
      
      <h3>Ticket Information</h3>
      <ul>
        <li><strong>Students:</strong> ₱300</li>
        <li><strong>Adults:</strong> ₱500</li>
        <li><strong>Senior Citizens:</strong> ₱400</li>
        <li><strong>VIP Seating:</strong> ₱750 (includes program and refreshments)</li>
      </ul>
      
      <h3>How to Purchase</h3>
      <p>Tickets can be purchased:</p>
      <ul>
        <li><strong>Online:</strong> Visit our ticketing portal at tickets.southville8bnhs.edu</li>
        <li><strong>Box Office:</strong> Monday-Friday, 3:00-5:00 PM at the Main Auditorium</li>
        <li><strong>Phone:</strong> Call (555) 123-4567 ext. 234</li>
      </ul>
      
      <h3>Cast & Crew</h3>
      <p>Our production features over 40 talented students and is directed by Ms. Patricia Reyes, with musical direction by Mr. James Anderson and choreography by Ms. Lisa Wong.</p>
      
      <p><strong>Note:</strong> This production runs approximately 2 hours and 45 minutes with one 15-minute intermission. Recommended for ages 10 and up.</p>
    `,
    author: {
      name: "Patricia Reyes",
      role: "Drama Department Head",
    },
    tags: ["theater", "musical", "event"],
    attachments: [
      {
        name: "Hamilton Program Guide.pdf",
        url: "/attachments/hamilton-program.pdf",
        type: "application/pdf",
      },
    ],
  },
  {
    id: "4",
    slug: "stem-lab-opening",
    date: "2024-03-08",
    title: "New STEM Lab Opening Ceremony Scheduled for March 25th",
    category: "general",
    source: "Facilities Management",
    excerpt:
      "Join us for the grand opening of our state-of-the-art STEM laboratory featuring cutting-edge equipment and technology.",
    content: `
      <p>We're excited to unveil our brand new <strong>STEM Innovation Laboratory</strong> on March 25th at 10:00 AM. This state-of-the-art facility represents a significant investment in our students' future and will provide unparalleled opportunities for hands-on learning in science, technology, engineering, and mathematics.</p>
      
      <h3>Facility Features</h3>
      <p>The new 2,500 square foot laboratory includes:</p>
      <ul>
        <li><strong>Robotics Station:</strong> 10 workstations with VEX Robotics kits and programming computers</li>
        <li><strong>3D Printing Center:</strong> 5 professional-grade 3D printers with design software</li>
        <li><strong>Electronics Lab:</strong> Soldering stations, oscilloscopes, and component libraries</li>
        <li><strong>Collaborative Spaces:</strong> Flexible seating for group projects and presentations</li>
        <li><strong>Virtual Reality Corner:</strong> VR headsets for immersive learning experiences</li>
        <li><strong>Maker Space:</strong> Tools and materials for prototyping and invention</li>
      </ul>
      
      <h3>Opening Ceremony Schedule</h3>
      <ul>
        <li><strong>10:00 AM:</strong> Welcome remarks by Principal Dr. Amanda Cruz</li>
        <li><strong>10:15 AM:</strong> Ribbon cutting ceremony</li>
        <li><strong>10:30 AM:</strong> Guided tours of the facility</li>
        <li><strong>11:00 AM:</strong> Student demonstrations and presentations</li>
        <li><strong>12:00 PM:</strong> Light refreshments in the cafeteria</li>
      </ul>
      
      <h3>Who Should Attend</h3>
      <p>All students, parents, faculty, staff, and community members are invited to attend this special event. No RSVP required.</p>
      
      <h3>Future Programs</h3>
      <p>The STEM Lab will host various programs including:</p>
      <ul>
        <li>After-school robotics club</li>
        <li>Weekend maker workshops</li>
        <li>Summer STEM camps</li>
        <li>Industry partnership programs</li>
      </ul>
      
      <p>This facility was made possible through generous grants from the Department of Education and partnerships with local technology companies.</p>
    `,
    author: {
      name: "Dr. Amanda Cruz",
      role: "School Principal",
    },
    tags: ["facilities", "stem", "technology"],
  },
  {
    id: "5",
    slug: "parent-teacher-conferences",
    date: "2024-03-05",
    title: "Parent-Teacher Conferences Scheduled for March 18-19",
    category: "general",
    source: "Administration",
    excerpt: "Sign up now for spring parent-teacher conferences to discuss your student's academic progress.",
    content: `
      <p>Spring parent-teacher conferences will be held on <strong>March 18-19, 2024</strong> from 3:00-7:00 PM. These conferences provide an excellent opportunity for parents and guardians to meet with teachers, discuss academic progress, and address any concerns.</p>
      
      <h3>Conference Schedule</h3>
      <ul>
        <li><strong>Monday, March 18:</strong> Grades 7-9 (3:00-7:00 PM)</li>
        <li><strong>Tuesday, March 19:</strong> Grades 10-12 (3:00-7:00 PM)</li>
      </ul>
      
      <h3>How to Schedule</h3>
      <p>Parents can schedule 15-minute appointments with teachers through:</p>
      <ul>
        <li><strong>Parent Portal:</strong> Log in at portal.southville8bnhs.edu</li>
        <li><strong>Phone:</strong> Call the main office at (555) 123-4567</li>
        <li><strong>Email:</strong> Contact teachers directly through their school email</li>
      </ul>
      
      <h3>What to Discuss</h3>
      <p>Consider preparing questions about:</p>
      <ul>
        <li>Current grades and academic performance</li>
        <li>Homework completion and study habits</li>
        <li>Classroom behavior and participation</li>
        <li>Standardized test preparation</li>
        <li>College and career planning (for upperclassmen)</li>
        <li>Extracurricular involvement</li>
      </ul>
      
      <h3>Virtual Option Available</h3>
      <p>For parents unable to attend in person, virtual conferences via Zoom are available. Please indicate your preference when scheduling.</p>
      
      <h3>Important Notes</h3>
      <ul>
        <li>Please arrive 5 minutes before your scheduled time</li>
        <li>Check in at the main office upon arrival</li>
        <li>Parking is available in the main lot</li>
        <li>Childcare services will be provided in the library</li>
      </ul>
      
      <p>We encourage all families to participate in these important conversations about student success!</p>
    `,
    author: {
      name: "Office of the Principal",
      role: "Administration",
    },
    tags: ["parents", "conferences", "academic"],
  },
  {
    id: "6",
    slug: "national-merit-semifinalists",
    date: "2024-03-01",
    title: "National Merit Scholarship Semifinalists Announced",
    category: "academic",
    source: "Counseling Office",
    excerpt: "Five Southville 8B NHS students named National Merit Scholarship Semifinalists.",
    content: `
      <p>We're proud to announce that five of our seniors have been named <strong>National Merit Scholarship Semifinalists</strong>, placing them among the top 1% of students nationwide who took the PSAT/NMSQT.</p>
      
      <h3>Our Semifinalists</h3>
      <ul>
        <li><strong>Sarah Chen</strong> - Plans to study Biomedical Engineering</li>
        <li><strong>Michael Rodriguez</strong> - Interested in Computer Science</li>
        <li><strong>Emily Thompson</strong> - Pursuing Environmental Science</li>
        <li><strong>David Kim</strong> - Aspiring Aerospace Engineer</li>
        <li><strong>Jessica Martinez</strong> - Future Mathematics major</li>
      </ul>
      
      <h3>About the Program</h3>
      <p>The National Merit Scholarship Program is an academic competition for recognition and scholarships. Approximately 16,000 semifinalists are chosen from over 1.5 million students who take the PSAT/NMSQT each year.</p>
      
      <h3>Next Steps</h3>
      <p>Semifinalists will now compete for finalist status by:</p>
      <ul>
        <li>Submitting a detailed scholarship application</li>
        <li>Providing academic records and test scores</li>
        <li>Writing an essay</li>
        <li>Obtaining a school recommendation</li>
      </ul>
      
      <p>Finalists will be announced in February 2025, with scholarship winners notified in spring 2025.</p>
      
      <h3>Recognition Ceremony</h3>
      <p>A special recognition ceremony will be held on March 15th at 6:00 PM in the auditorium. All students, families, and community members are invited to celebrate this outstanding achievement.</p>
      
      <p>Congratulations to our semifinalists on this remarkable accomplishment!</p>
    `,
    author: {
      name: "Ms. Jennifer Lee",
      role: "College Counselor",
    },
    tags: ["achievement", "scholarship", "academic"],
  },
  {
    id: "7",
    slug: "spring-sports-tryouts",
    date: "2024-02-28",
    title: "Spring Sports Tryouts Begin Next Week",
    category: "event",
    source: "Athletic Department",
    excerpt: "Tryouts for baseball, softball, track & field, and tennis start March 4th.",
    content: `
      <p>Spring sports tryouts begin <strong>Monday, March 4th</strong>! Students interested in baseball, softball, track & field, or tennis should report to their respective coaches at the designated times and locations.</p>
      
      <h3>Tryout Schedule</h3>
      
      <h4>Baseball (Boys)</h4>
      <ul>
        <li><strong>Dates:</strong> March 4-6</li>
        <li><strong>Time:</strong> 3:30-5:30 PM</li>
        <li><strong>Location:</strong> Main Baseball Field</li>
        <li><strong>Coach:</strong> Coach Mike Thompson</li>
      </ul>
      
      <h4>Softball (Girls)</h4>
      <ul>
        <li><strong>Dates:</strong> March 4-6</li>
        <li><strong>Time:</strong> 3:30-5:30 PM</li>
        <li><strong>Location:</strong> Softball Field</li>
        <li><strong>Coach:</strong> Coach Sarah Williams</li>
      </ul>
      
      <h4>Track & Field (Co-ed)</h4>
      <ul>
        <li><strong>Dates:</strong> March 4-5</li>
        <li><strong>Time:</strong> 3:30-5:00 PM</li>
        <li><strong>Location:</strong> Track Stadium</li>
        <li><strong>Coach:</strong> Coach David Martinez</li>
      </ul>
      
      <h4>Tennis (Co-ed)</h4>
      <ul>
        <li><strong>Dates:</strong> March 4-6</li>
        <li><strong>Time:</strong> 3:30-5:00 PM</li>
        <li><strong>Location:</strong> Tennis Courts</li>
        <li><strong>Coach:</strong> Coach Lisa Anderson</li>
      </ul>
      
      <h3>Requirements</h3>
      <p>Before tryouts, all students must:</p>
      <ul>
        <li>Submit a current physical examination form (within the last year)</li>
        <li>Have parent/guardian consent form signed</li>
        <li>Maintain a minimum 2.0 GPA</li>
        <li>Have no outstanding disciplinary issues</li>
      </ul>
      
      <h3>What to Bring</h3>
      <ul>
        <li>Athletic clothing and appropriate footwear</li>
        <li>Water bottle</li>
        <li>Any personal equipment (gloves, rackets, etc.)</li>
      </ul>
      
      <p>Forms are available at the athletic office or can be downloaded from our website. For questions, contact the Athletic Department at athletics@southville8bnhs.edu or call (555) 123-4567 ext. 300.</p>
    `,
    author: {
      name: "Mr. James Patterson",
      role: "Athletic Director",
    },
    tags: ["sports", "tryouts", "athletics"],
  },
  {
    id: "8",
    slug: "college-fair",
    date: "2024-02-25",
    title: "College Fair Featuring 100+ Universities - March 12th",
    category: "academic",
    source: "College Counseling",
    excerpt: "Meet representatives from over 100 colleges and universities at our annual college fair.",
    content: `
      <p>Our annual college fair will take place on <strong>Tuesday, March 12th</strong> from 6:00-8:00 PM in the main gymnasium. This is an excellent opportunity for students and parents to meet with representatives from over 100 colleges and universities.</p>
      
      <h3>Participating Institutions</h3>
      <p>Representatives from a diverse range of institutions will be present, including:</p>
      <ul>
        <li>Public and private universities</li>
        <li>Liberal arts colleges</li>
        <li>Technical and vocational schools</li>
        <li>Community colleges</li>
        <li>International universities</li>
        <li>Military academies</li>
      </ul>
      
      <h3>What to Expect</h3>
      <p>At the fair, you can:</p>
      <ul>
        <li>Learn about admission requirements and deadlines</li>
        <li>Explore academic programs and majors</li>
        <li>Discuss financial aid and scholarship opportunities</li>
        <li>Ask about campus life and student activities</li>
        <li>Collect brochures and application materials</li>
        <li>Schedule campus visits</li>
      </ul>
      
      <h3>Preparation Tips</h3>
      <p>To make the most of the college fair:</p>
      <ul>
        <li>Research schools beforehand and prioritize which booths to visit</li>
        <li>Prepare questions about programs, costs, and campus culture</li>
        <li>Bring a folder or bag for collecting materials</li>
        <li>Dress appropriately (business casual recommended)</li>
        <li>Bring a pen and notepad for taking notes</li>
        <li>Have your academic information ready (GPA, test scores, interests)</li>
      </ul>
      
      <h3>Special Presentations</h3>
      <p>Throughout the evening, there will be presentations on:</p>
      <ul>
        <li><strong>6:15 PM:</strong> Financial Aid 101</li>
        <li><strong>7:00 PM:</strong> The College Application Process</li>
        <li><strong>7:30 PM:</strong> Choosing the Right College for You</li>
      </ul>
      
      <p>All students in grades 9-12 and their families are encouraged to attend. No registration required.</p>
    `,
    author: {
      name: "College Counseling Office",
      role: "Student Services",
    },
    tags: ["college", "fair", "admissions"],
  },
]

export function getAnnouncementBySlug(slug: string): Announcement | undefined {
  return announcementsData.find((announcement) => announcement.slug === slug)
}

export function getRelatedAnnouncements(currentSlug: string, category: string, limit = 3): Announcement[] {
  return announcementsData
    .filter((announcement) => announcement.slug !== currentSlug && announcement.category === category)
    .slice(0, limit)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
