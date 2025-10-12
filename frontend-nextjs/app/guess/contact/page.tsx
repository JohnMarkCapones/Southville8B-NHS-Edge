"use client"

import type React from "react"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Phone,
  MailIcon,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Building,
  GraduationCap,
  Users,
  Heart,
  Star,
  Calendar,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })

  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: ["Main Office: (02) 8123-4567", "Admissions: (02) 8123-4568", "Athletics: (02) 8123-4569"],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <MailIcon className="w-6 h-6" />,
      title: "Email",
      details: ["info@southville8bnhs.edu.ph", "admissions@southville8bnhs.edu.ph", "athletics@southville8bnhs.edu.ph"],
      color: "from-green-500 to-green-600",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address",
      details: ["123 Education Street", "Southville 8B, Rodriguez", "Rizal, Philippines 1860"],
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Office Hours",
      details: ["Monday - Friday: 7:00 AM - 5:00 PM", "Saturday: 8:00 AM - 12:00 PM", "Sunday: Closed"],
      color: "from-orange-500 to-orange-600",
    },
  ]

  const departments = [
    {
      name: "Principal's Office",
      head: "Dr. Maria Santos",
      email: "principal@southville8bnhs.edu.ph",
      phone: "(02) 8123-4570",
      description: "School administration and general inquiries",
      icon: <Building className="w-5 h-5" />,
    },
    {
      name: "Admissions Office",
      head: "Ms. Jennifer Cruz",
      email: "admissions@southville8bnhs.edu.ph",
      phone: "(02) 8123-4568",
      description: "Enrollment, applications, and student records",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      name: "Guidance & Counseling",
      head: "Mrs. Lisa Rodriguez",
      email: "guidance@southville8bnhs.edu.ph",
      phone: "(02) 8123-4571",
      description: "Student counseling and academic guidance",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      name: "Athletics Department",
      head: "Coach Michael Johnson",
      email: "athletics@southville8bnhs.edu.ph",
      phone: "(02) 8123-4569",
      description: "Sports programs and athletic activities",
      icon: <Users className="w-5 h-5" />,
    },
  ]

  const faqs = [
    {
      question: "What are the admission requirements?",
      answer:
        "Students must submit completed application forms, academic transcripts, birth certificate, and pass the entrance examination.",
    },
    {
      question: "What is the school calendar?",
      answer:
        "We follow the DepEd calendar with classes starting in August and ending in March, with breaks for Christmas and summer.",
    },
    {
      question: "Are scholarships available?",
      answer:
        "Yes, we offer academic scholarships, athletic scholarships, and need-based financial assistance programs.",
    },
    {
      question: "What extracurricular activities are offered?",
      answer:
        "We have over 30 clubs and organizations including academic clubs, sports teams, arts groups, and community service organizations.",
    },
    {
      question: "What is the student-teacher ratio?",
      answer:
        "We maintain a low student-teacher ratio of 25:1 to ensure personalized attention and quality education for all students.",
    },
    {
      question: "How can parents get involved?",
      answer:
        "Parents can join the PTA, volunteer for school events, participate in parent-teacher conferences, and support various school activities and fundraising initiatives.",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white">
            Contact <span className="text-yellow-300">Us</span>
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-white/80 mb-6" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 mb-8">
            We're here to help and answer any questions you might have. Reach out to us and we'll respond as soon as we
            can.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </button>
            <button className="px-8 py-3 bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/30 hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </button>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Contact <span className="gradient-text">Information</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to reach us for all your questions and needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <AnimatedCard
                key={info.title}
                variant="lift"
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-lg flex items-center justify-center mx-auto mb-4 text-white`}
                >
                  {info.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section id="form" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-slideInLeft">
              <AnimatedCard variant="lift" className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Send className="w-6 h-6 mr-3 text-primary" />
                  Send us a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+63 XXX XXX XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admissions">Admissions</SelectItem>
                          <SelectItem value="academics">Academics</SelectItem>
                          <SelectItem value="athletics">Athletics</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Student Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief subject of your message"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>

                  <AnimatedButton type="submit" variant="gradient" size="lg" className="w-full" animation="glow">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </AnimatedButton>
                </form>
              </AnimatedCard>
            </div>

            {/* Map & Additional Info */}
            <div className="animate-slideInRight space-y-8">
              {/* Map Placeholder */}
              <AnimatedCard variant="lift" className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Our Location
                </h3>
                <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">Rodriguez, Rizal, Philippines</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Address:</strong> 123 Education Street, Southville 8B
                  </p>
                  <p>
                    <strong>City:</strong> Rodriguez, Rizal 1860
                  </p>
                  <p>
                    <strong>Landmarks:</strong> Near Southville 8B Subdivision
                  </p>
                </div>
              </AnimatedCard>

              {/* Quick Contact */}
              <AnimatedCard variant="gradient" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Emergency Hotline</p>
                      <p className="text-sm text-muted-foreground">(02) 8123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MailIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">General Inquiries</p>
                      <p className="text-sm text-muted-foreground">info@southville8bnhs.edu.ph</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section id="departments" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Building className="w-4 h-4 mr-2" />
              Department Contacts
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              School <span className="gradient-text">Departments</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect directly with specific departments for specialized assistance and information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {departments.map((dept, index) => (
              <AnimatedCard
                key={dept.name}
                variant="lift"
                className="animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4 p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-lg flex items-center justify-center text-white">
                    {dept.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
                    <p className="text-primary font-medium mb-2">{dept.head}</p>
                    <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MailIcon className="w-4 h-4 text-primary" />
                        <span>{dept.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>{dept.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <MessageSquare className="w-4 h-4 mr-2" />
              Frequently Asked
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Common <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to the most commonly asked questions about our school.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedCard
                key={index}
                variant="lift"
                className="animate-slideInUp overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left hover:bg-muted/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Star className="w-5 h-5 mr-3 text-primary" />
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 animate-slideInUp">
                    <div className="pl-8 border-l-2 border-primary/20">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </AnimatedCard>
            ))}
          </div>

          <div className="text-center mt-12">
            <AnimatedButton variant="gradient" size="lg" animation="glow">
              <MessageSquare className="w-5 h-5 mr-2" />
              View All FAQs
            </AnimatedButton>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 text-center relative">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-300/30 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <Heart className="w-4 h-4 mr-2" />
              Stay Connected
            </Badge>
            <h2 className="text-4xl font-bold mb-3 text-foreground">Stay Connected</h2>
            <div className="mx-auto h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-6" />
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
              Follow us on social media for the latest updates, events, and school news.
            </p>

            <div className="flex justify-center space-x-4 mb-12">
              {[
                { icon: Facebook, label: "Facebook", href: "#", color: "hover:bg-blue-600" },
                { icon: Twitter, label: "Twitter", href: "#", color: "hover:bg-sky-500" },
                { icon: Instagram, label: "Instagram", href: "#", color: "hover:bg-pink-600" },
                { icon: Youtube, label: "YouTube", href: "#", color: "hover:bg-red-600" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center ${social.color} hover:text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <AnimatedCard variant="lift" className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Website</h3>
                <p className="text-sm text-muted-foreground">www.southville8bnhs.edu.ph</p>
              </AnimatedCard>
              <AnimatedCard variant="lift" className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">School Hours</h3>
                <p className="text-sm text-muted-foreground">Monday - Friday: 7:00 AM - 5:00 PM</p>
              </AnimatedCard>
              <AnimatedCard variant="lift" className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Serving families since 2009</p>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
