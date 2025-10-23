"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandChip } from "@/components/ui/brand-chip"

const teachers = [
  {
    name: "Ms. Angela Cruz",
    subject: "Science Department Head",
    image: "/placeholder.svg?height=240&width=240",
  },
  {
    name: "Mr. Daniel Reyes",
    subject: "Mathematics",
    image: "/placeholder.svg?height=240&width=240",
  },
  {
    name: "Ms. Liza Navarro",
    subject: "English",
    image: "/placeholder.svg?height=240&width=240",
  },
  {
    name: "Coach Ramon Dela Torre",
    subject: "Athletics",
    image: "/placeholder.svg?height=240&width=240",
  },
]

export default function AboutPageClient() {
  return (
    <main>
      {/* Top banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_10%_10%,rgba(37,99,235,0.18),transparent),radial-gradient(60%_55%_at_90%_20%,rgba(14,165,233,0.16),transparent)]" />
        <div className="container mx-auto px-4 py-10 md:py-16">
          <BrandChip />
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white">About Us</h1>
          <p className="mt-3 text-lg text-slate-700 dark:text-slate-200 max-w-3xl">
            Southville 8B National High School is committed to excellence in academic achievement, character
            development, and community service.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-blue-600 text-white">Founded 2009</Badge>
            <Badge variant="secondary">K to 12 Ready</Badge>
            <Badge variant="secondary">Community-Driven</Badge>
          </div>
        </div>
      </section>

      {/* History and Mission */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Our History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                Established in 2009, Southville 8B National High School has grown from a small campus into a thriving
                learning community. Over the years, we have expanded our academic programs and upgraded our facilities
                to meet the needs of 21st‑century learners.
              </p>
              <div className="relative w-full h-48 md:h-56 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=320&width=640"
                  alt="Historic photo of the campus"
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Our Mission and Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700 dark:text-slate-300">
                Our mission is to foster academic excellence, creativity, and leadership through student‑centered
                learning and strong community partnerships. We envision graduates who are globally competitive,
                compassionate, and resilient.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mission">
                  <AccordionTrigger>Mission</AccordionTrigger>
                  <AccordionContent>
                    To empower students to become responsible citizens and lifelong learners through a holistic,
                    inclusive, and innovative education.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="vision">
                  <AccordionTrigger>Vision</AccordionTrigger>
                  <AccordionContent>
                    A leading public high school recognized for excellence, integrity, and service to the nation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="values">
                  <AccordionTrigger>Core Values</AccordionTrigger>
                  <AccordionContent>
                    Integrity, Excellence, Compassion, Collaboration, and Stewardship.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Teachers */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">Meet Our Teachers</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((t) => (
            <Card key={t.name} className="text-center">
              <CardContent className="pt-6">
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={t.image || "/placeholder.svg"} alt={`Portrait of ${t.name}`} />
                  <AvatarFallback>
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 font-medium">{t.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{t.subject}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
