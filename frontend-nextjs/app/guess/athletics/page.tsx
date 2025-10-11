import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Users, Calendar, Clock, Star, Award, Target, Heart, Zap, TrendingUp } from "lucide-react"

export default function AthleticsPage() {
  const availableSports = [
    {
      name: "Soccer (Boys & Girls)",
      coach: "Coach Thompson",
      record: "12-3-1",
      achievements: "Municipal Semifinals",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Volleyball",
      coach: "Coach Davis",
      record: "15-5",
      achievements: "District Champions",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Basketball (Boys & Girls)",
      coach: "Coach Johnson",
      record: "18-4",
      achievements: "Municipal Champions",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Indoor Track",
      coach: "Coach Garcia",
      record: "Top 5 Municipal",
      achievements: "School Records Set",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Baseball",
      coach: "Coach Rodriguez",
      record: "16-6",
      achievements: "Regional Runners-up",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Track & Field",
      coach: "Coach Anderson",
      record: "Top 3 Municipal",
      achievements: "Multiple Municipal Champions",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const facilities = [
    {
      title: "Gymnasium Complex",
      description: "Multi-purpose gymnasium with basketball courts, volleyball courts, and training areas.",
      icon: <Users className="w-6 h-6" />,
      image: "/placeholder.svg?height=200&width=400",
      badge: "Multi-Sport",
      stats: [
        { label: "Courts", value: "3" },
        { label: "Capacity", value: "1,500" },
      ],
    },
    {
      title: "Track & Field Complex",
      description: "8-lane all-weather track with field event areas for shot put, discus, and long jump.",
      icon: <Target className="w-6 h-6" />,
      badge: "All-Weather",
    },
    {
      title: "Baseball Field",
      description: "Regulation baseball field with dugouts and spectator seating for home games.",
      icon: <Trophy className="w-6 h-6" />,
      badge: "Regulation Size",
    },
    {
      title: "Soccer Field",
      description: "Full-size soccer field with natural grass and lighting for evening games.",
      icon: <Award className="w-6 h-6" />,
      badge: "Full Size",
    },
    {
      title: "Fitness Center",
      description: "Modern weight room and cardio equipment for strength and conditioning programs.",
      icon: <Zap className="w-6 h-6" />,
      badge: "Modern Equipment",
    },
  ]

  const achievements = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Municipal Championships",
      value: "12",
      description: "Total municipal titles across all sports",
      color: "from-school-gold to-vibrant-orange",
    },
    {
      icon: <Medal className="w-8 h-8" />,
      title: "Regional Titles",
      value: "28",
      description: "Regional championships won",
      color: "from-vibrant-purple to-vibrant-pink",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "All-Municipal Athletes",
      value: "45+",
      description: "Student-athletes recognized municipally",
      color: "from-vibrant-cyan to-vibrant-teal",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Participation Rate",
      value: "78%",
      description: "Students involved in athletics",
      color: "from-vibrant-rose to-vibrant-pink",
    },
  ]

  const upcomingGames = [
    { date: "2024-02-15", sport: "Basketball", opponent: "Central High", time: "7:00 PM", location: "Home" },
    { date: "2024-02-18", sport: "Volleyball", opponent: "Regional Tournament", time: "9:00 AM", location: "Away" },
    { date: "2024-02-22", sport: "Soccer", opponent: "North Valley", time: "4:00 PM", location: "Home" },
    { date: "2024-02-25", sport: "Basketball", opponent: "East Side", time: "6:00 PM", location: "Away" },
  ]

  const coaches = [
    {
      name: "Michael Johnson",
      sport: "Basketball",
      experience: "8 years",
      achievements: "Municipal Championship Coach",
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      name: "Lisa Thompson",
      sport: "Soccer",
      experience: "10 years",
      achievements: "Former Professional Player",
      image: "/placeholder.svg?height=150&width=150",
    },
    {
      name: "Coach Davis",
      sport: "Volleyball",
      experience: "6 years",
      achievements: "District Coach of the Year",
      image: "/placeholder.svg?height=150&width=150",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 dark:from-blue-800 dark:via-blue-700 dark:to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute top-32 right-20 w-24 h-24 bg-white/15 dark:bg-white/25 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 dark:bg-white/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-32 right-1/3 w-28 h-28 bg-white/20 dark:bg-white/30 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/40 transition-all duration-300"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Championship Athletics
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white drop-shadow-lg">
            Eagles <span className="text-yellow-300 dark:text-yellow-200 drop-shadow-md">Athletics</span>
          </h1>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-white via-yellow-300 dark:via-yellow-200 to-white mb-6 shadow-lg" />
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/95 dark:text-white/90 drop-shadow-sm leading-relaxed">
            Building champions on and off the field through dedication, teamwork, and excellence in athletic
            competition.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white/30 dark:border-white/40 text-black dark:text-white hover:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Explore Athletics
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-yellow-300/50 dark:border-yellow-200/50 text-black dark:text-white hover:bg-yellow-300/20 dark:hover:bg-yellow-200/20 backdrop-blur-sm transition-all duration-300"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Schedule
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* Sports Programs - Single Section */}
      <section id="sports" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Sports Programs</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compete at the highest level with our championship-caliber athletic programs available year-round.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSports.map((sport, index) => (
              <AnimatedCard
                key={sport.name}
                variant="lift"
                className="overflow-hidden animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img src={sport.image || "/placeholder.svg"} alt={sport.name} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{sport.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{sport.coach}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Record:</span>
                      <Badge variant="outline">{sport.record}</Badge>
                    </div>
                    <div className="text-xs text-primary font-medium">{sport.achievements}</div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Athletic Achievements - Championship Legacy */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-vibrant-purple via-vibrant-pink to-vibrant-orange">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white">Championship Legacy</h2>
            <div className="mx-auto h-1.5 w-20 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/80 mb-6" />
            <p className="text-xl text-slate-800 dark:text-white/90 max-w-2xl mx-auto">
              Our athletic programs have a proud tradition of excellence and championship success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <AnimatedCard
                key={achievement.title}
                variant="glass"
                animation="float"
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${achievement.color} mb-4`}>
                  {achievement.icon}
                </div>
                <div className="text-3xl font-bold mb-2 animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                  {achievement.value}
                </div>
                <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Games */}
      <section id="schedule" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-slideInLeft">
              <Badge variant="secondary" className="mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                Game Schedule
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Upcoming <span className="gradient-text">Games</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Come support our Eagles as they compete for championship glory. Check out our upcoming games and cheer
                on our student-athletes.
              </p>

              <div className="space-y-4">
                {upcomingGames.map((game, index) => (
                  <AnimatedCard
                    key={index}
                    variant="lift"
                    className="animate-slideInLeft"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-school-gold to-vibrant-orange rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {new Date(game.date).getDate()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{game.sport}</h4>
                          <p className="text-sm text-muted-foreground">vs {game.opponent}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {game.time}
                        </div>
                        <Badge variant={game.location === "Home" ? "default" : "outline"}>{game.location}</Badge>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              <div className="mt-8">
                <AnimatedButton variant="gradient" size="lg" animation="glow">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Full Schedule
                </AnimatedButton>
              </div>
            </div>

            <div className="animate-slideInRight">
              <AnimatedCard variant="gradient" className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Season Highlights</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">18-4</div>
                    <p className="text-muted-foreground">Basketball Record</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">3</div>
                    <p className="text-muted-foreground">Municipal Qualifiers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">85%</div>
                    <p className="text-muted-foreground">Win Percentage</p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <AnimatedButton variant="outline" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Statistics
                  </AnimatedButton>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Coaching Staff */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeIn">
            <Badge variant="secondary" className="mb-4">
              <Users className="w-4 h-4 mr-2" />
              Expert Leadership
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Coaching <span className="gradient-text">Staff</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our experienced coaching staff brings championship-level expertise and mentorship to every program.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coaches.map((coach, index) => (
              <AnimatedCard
                key={coach.name}
                variant="lift"
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <img
                  src={coach.image || "/placeholder.svg"}
                  alt={coach.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/20"
                />
                <h3 className="text-xl font-bold mb-2">{coach.name}</h3>
                <p className="text-primary font-semibold mb-2">{coach.sport}</p>
                <p className="text-sm text-muted-foreground mb-3">{coach.experience} Experience</p>
                <Badge variant="outline" className="text-xs">
                  {coach.achievements}
                </Badge>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-school-blue to-vibrant-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the Championship Tradition</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Become part of our winning tradition. Try out for our teams and experience the thrill of Eagle athletics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Join a Team
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-school-blue"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Tryout Schedule
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
