export const dynamic = "force-static"
export const revalidate = 86400
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_ALUMNI } from "@/lib/constants"
import Image from "next/image"
import { GraduationCap, Award, Users, Heart } from "lucide-react"

export default function AlumniPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-vibrant-purple via-vibrant-pink to-vibrant-orange text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="morphing-shape w-16 h-16 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">Our Amazing Alumni</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slideInLeft">
            Celebrating the achievements of our graduates who continue to make a difference in the world
          </p>
        </div>
      </section>

      {/* Alumni Profiles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground">Meet some of our distinguished alumni</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_ALUMNI.map((alumni, index) => (
              <AnimatedCard
                key={alumni.id}
                animation="glow"
                variant="gradient" // Changed from boolean gradient prop to variant="gradient"
                className="overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-4">
                    <Image
                      src={alumni.image || "/placeholder.svg"}
                      alt={alumni.name}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-gradient-to-r from-vibrant-purple to-vibrant-pink hover-scale"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <Badge className="bg-gradient-to-r from-school-gold to-vibrant-orange text-white">
                        Class of {alumni.graduationYear}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl gradient-text">{alumni.name}</CardTitle>
                  <p className="text-primary font-semibold">{alumni.profession}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <Award className="w-6 h-6 mx-auto mb-2 text-school-gold" />
                    <p className="font-medium text-sm">{alumni.achievement}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{alumni.story}</p>
                  <AnimatedButton variant="gradient" size="sm" animation="glow" className="w-full">
                    Read Full Story
                  </AnimatedButton>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Network Stats */}
      <section className="py-16 bg-gradient-to-r from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Alumni Network</h2>
            <p className="text-lg text-muted-foreground">Our graduates are making an impact worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "2,500+", label: "Alumni Worldwide", color: "text-vibrant-purple" },
              { icon: Award, number: "150+", label: "Awards Received", color: "text-school-gold" },
              { icon: GraduationCap, number: "85%", label: "Higher Education", color: "text-vibrant-pink" },
              { icon: Heart, number: "50+", label: "Countries", color: "text-vibrant-emerald" },
            ].map((stat, index) => (
              <AnimatedCard
                key={index}
                animation="glow"
                className="text-center p-6 animate-fadeIn"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl font-bold text-primary mb-2 animate-bounce">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Alumni Network</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Stay connected with your alma mater and fellow graduates. Share your success story!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton
                variant="outline"
                size="lg"
                animation="glow"
                className="text-white border-white hover:bg-white/10"
              >
              Register as Alumni
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="lg"
              animation="glow"
              className="text-white border-white hover:bg-white/10"
            >
              Submit Your Story
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
