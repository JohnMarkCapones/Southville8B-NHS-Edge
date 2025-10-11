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

      {/* Comprehensive History Timeline */}
      <section className="container mx-auto px-4 py-10 md:py-16 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-sky-300 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse opacity-35"></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Our Journey Through Time
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From humble beginnings to academic excellence - discover the milestones that shaped our school's legacy
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-sky-400 to-indigo-500 rounded-full opacity-80">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-sky-300 to-indigo-400 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-12 md:space-y-16">
            {/* 2009 - Foundation */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pr-8">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-l-4 md:border-l-4 border-blue-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-blue-500/10 rounded-full -translate-y-8 md:-translate-y-10 translate-x-8 md:translate-x-10"></div>
                        <div className="flex items-center mb-3">
                          <Badge className="bg-blue-600 text-white shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm">
                            Foundation
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                          School Establishment
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Southville 8B National High School was officially established with 120 students and 8
                          dedicated teachers.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pl-8">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 transform transition-all duration-500 hover:scale-110 hover:text-blue-700">
                    2009
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-blue-600">2009</div>
              </div>
            </div>

            {/* 2012 - First Graduation */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-sky-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-sky-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pl-8 md:order-2">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:-rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-sky-50 dark:from-slate-800 dark:to-slate-700 border-l-4 md:border-r-4 md:border-l-0 border-sky-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-16 md:w-20 h-16 md:h-20 bg-sky-500/10 rounded-full -translate-y-8 md:-translate-y-10 -translate-x-8 md:-translate-x-10"></div>
                        <div className="flex items-center mb-3">
                          <Badge
                            variant="secondary"
                            className="shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm"
                          >
                            Milestone
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sky-600 transition-colors">
                          First Graduation Class
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Celebrated our first batch of 98 graduates, marking the beginning of our alumni legacy.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pr-8 md:order-1">
                  <div className="text-2xl md:text-3xl font-bold text-sky-600 transform transition-all duration-500 hover:scale-110 hover:text-sky-700">
                    2012
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-sky-600">2012</div>
              </div>
            </div>

            {/* 2015 - Campus Expansion */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-green-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pr-8 md:text-right">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-700 border-l-4 border-green-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-green-500/10 rounded-full -translate-y-8 md:-translate-y-10 translate-x-8 md:translate-x-10"></div>
                        <div className="flex items-center justify-start md:justify-end mb-3">
                          <Badge className="bg-green-600 text-white shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm">
                            Growth
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 transition-colors">
                          Campus Expansion
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Added new science laboratories, library expansion, and additional classrooms to accommodate
                          growing enrollment.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pl-8">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 transform transition-all duration-500 hover:scale-110 hover:text-green-700">
                    2015
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-green-600">2015</div>
              </div>
            </div>

            {/* 2018 - STEM Program */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-purple-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pl-8 md:order-2">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:-rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700 border-l-4 md:border-r-4 md:border-l-0 border-purple-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-16 md:w-20 h-16 md:h-20 bg-purple-500/10 rounded-full -translate-y-8 md:-translate-y-10 -translate-x-8 md:-translate-x-10"></div>
                        <div className="flex items-center mb-3">
                          <Badge className="bg-purple-600 text-white shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm">
                            Innovation
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 transition-colors">
                          STEM Program Launch
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Introduced specialized STEM curriculum with robotics lab and advanced mathematics programs.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pr-8 md:order-1">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600 transform transition-all duration-500 hover:scale-110 hover:text-purple-700">
                    2018
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-purple-600">2018</div>
              </div>
            </div>

            {/* 2020 - Digital Learning */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-orange-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pr-8 md:text-right">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-700 border-l-4 border-orange-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-orange-500/10 rounded-full -translate-y-8 md:-translate-y-10 translate-x-8 md:translate-x-10"></div>
                        <div className="flex items-center justify-start md:justify-end mb-3">
                          <Badge className="bg-orange-600 text-white shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm">
                            Adaptation
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">
                          Digital Learning Era
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Successfully transitioned to blended learning model, ensuring continuous education during
                          challenging times.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pl-8">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600 transform transition-all duration-500 hover:scale-110 hover:text-orange-700">
                    2020
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-orange-600">2020</div>
              </div>
            </div>

            {/* 2022 - Sports Complex */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-6 h-6 bg-red-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125">
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pl-8 md:order-2">
                  <div className="transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 hover:-rotate-1 perspective-1000">
                    <Card className="max-w-md shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-slate-700 border-l-4 md:border-r-4 md:border-l-0 border-red-500 touch-manipulation">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-16 md:w-20 h-16 md:h-20 bg-red-500/10 rounded-full -translate-y-8 md:-translate-y-10 -translate-x-8 md:-translate-x-10"></div>
                        <div className="flex items-center mb-3">
                          <Badge className="bg-red-600 text-white shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm">
                            Excellence
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-red-600 transition-colors">
                          Sports Complex Opening
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Inaugurated state-of-the-art sports facilities including covered court and fitness center.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pr-8 md:order-1">
                  <div className="text-2xl md:text-3xl font-bold text-red-600 transform transition-all duration-500 hover:scale-110 hover:text-red-700">
                    2022
                  </div>
                </div>
                <div className="md:hidden mt-2 text-xl font-bold text-red-600">2022</div>
              </div>
            </div>

            {/* 2024 - Present */}
            <div className="relative flex items-center group">
              <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-125 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
              </div>

              <div className="ml-16 md:ml-0 md:flex md:items-center w-full">
                <div className="md:flex-1 md:pr-8">
                  <div className="transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:rotate-1">
                    <Card className="max-w-md shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-l-4 border-blue-500 ring-2 ring-blue-500/30 ring-offset-2">
                      <CardContent className="p-4 md:p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
                        <div className="flex items-center mb-3">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-pulse text-xs md:text-sm">
                            Present
                          </Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          Continued Excellence
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                          Recognized as Regional STEM Excellence Award winner with over 800 students and 45 faculty
                          members.
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="hidden md:block md:flex-1 md:pl-8">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transform transition-all duration-300 hover:scale-110 animate-pulse">
                    2024
                  </div>
                </div>
                <div className="md:hidden mt-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  2024
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .touch-manipulation {
            touch-action: manipulation;
          }
        `}</style>
      </section>

      {/* Achievements */}
      <section className="container mx-auto px-4 pb-10 md:pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2 text-slate-700 dark:text-slate-300">
              <li>• Regional STEM Excellence Award 2024</li>
              <li>• Consistent Top Performing School in Division Assessment</li>
              <li>• National Qualifiers in Science and Mathematics competitions</li>
              <li>• Regional Champions in Basketball and Volleyball</li>
            </ul>
          </CardContent>
        </Card>
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
