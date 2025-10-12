// Enhanced leaderboard page with points system and gamification
import { AnimatedCard } from "@/components/ui/animated-card"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Crown, Star, Trophy, Medal, Zap, Target, Award, TrendingUp } from "lucide-react"

// Enhanced mock data with points system
const mockStudents = (grade: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: `Student ${String.fromCharCode(65 + i)}${grade.replace("Grade ", "")}`,
    score: 1000 - i * 10 - Math.floor(Math.random() * 50),
    points: 2500 - i * 50 - Math.floor(Math.random() * 100),
    grade: grade,
    achievements: Math.floor(Math.random() * 5) + 1,
    streak: Math.floor(Math.random() * 30) + 1,
    level: Math.floor((2500 - i * 50) / 500) + 1,
  }))

const overallTop20 = [
  ...mockStudents("Overall", 5).map((s) => ({ ...s, grade: `Grade ${Math.floor(Math.random() * 4) + 7}` })),
  ...mockStudents("Overall", 5).map((s) => ({ ...s, grade: `Grade ${Math.floor(Math.random() * 4) + 7}` })),
  ...mockStudents("Overall", 5).map((s) => ({ ...s, grade: `Grade ${Math.floor(Math.random() * 4) + 7}` })),
  ...mockStudents("Overall", 5).map((s) => ({ ...s, grade: `Grade ${Math.floor(Math.random() * 4) + 7}` })),
]
  .sort((a, b) => b.points - a.points)
  .map((s, i) => ({ ...s, rank: i + 1 }))
  .slice(0, 20)

const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"]

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-school-gold via-vibrant-orange to-vibrant-red text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="morphing-shape w-16 h-16 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">🏆 Student Leaderboard</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slideInLeft">
            Celebrating academic excellence and student achievements across all grades
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Gamification Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: Trophy,
              label: "Total Points",
              value: "125K+",
              color: "text-school-gold",
              bg: "from-school-gold/20 to-vibrant-orange/20",
            },
            {
              icon: Target,
              label: "Active Students",
              value: "850+",
              color: "text-vibrant-purple",
              bg: "from-vibrant-purple/20 to-vibrant-pink/20",
            },
            {
              icon: Zap,
              label: "Achievements",
              value: "2.3K+",
              color: "text-vibrant-emerald",
              bg: "from-vibrant-emerald/20 to-vibrant-cyan/20",
            },
            {
              icon: TrendingUp,
              label: "This Month",
              value: "+15%",
              color: "text-vibrant-pink",
              bg: "from-vibrant-pink/20 to-vibrant-red/20",
            },
          ].map((stat, index) => (
            <AnimatedCard
              key={index}
              animation="lift"
              className={`text-center p-6 bg-gradient-to-br ${stat.bg} animate-fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-primary mb-1 animate-bounce">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </AnimatedCard>
          ))}
        </div>

        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 mb-8 bg-gradient-to-r from-muted to-background p-2">
            <TabsTrigger
              value="overall"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-vibrant-purple data-[state=active]:to-vibrant-pink data-[state=active]:text-white whitespace-nowrap px-4 py-2"
            >
              🌟 Overall Top 20
            </TabsTrigger>
            {grades.map((grade) => (
              <TabsTrigger
                key={grade}
                value={grade.toLowerCase().replace(" ", "")}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-school-gold data-[state=active]:to-vibrant-orange data-[state=active]:text-white whitespace-nowrap px-4 py-2"
              >
                {grade}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overall">
            <EnhancedLeaderboardTable title="🏆 Overall School Champions" students={overallTop20} showGrade />
          </TabsContent>

          {grades.map((grade) => (
            <TabsContent key={grade} value={grade.toLowerCase().replace(" ", "")}>
              <EnhancedLeaderboardTable title={`${grade} Top Performers`} students={mockStudents(grade, 10)} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

interface EnhancedLeaderboardTableProps {
  title: string
  students: Array<{
    rank: number
    name: string
    score: number
    points: number
    grade?: string
    achievements: number
    streak: number
    level: number
  }>
  showGrade?: boolean
}

function EnhancedLeaderboardTable({ title, students, showGrade = false }: EnhancedLeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-school-gold fill-school-gold animate-bounce" />
      case 2:
        return (
          <Medal className="w-6 h-6 text-gray-400 fill-gray-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
        )
      case 3:
        return (
          <Award
            className="w-6 h-6 text-yellow-700 fill-yellow-700 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        )
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 5) return "from-vibrant-purple to-vibrant-pink"
    if (level >= 4) return "from-school-gold to-vibrant-orange"
    if (level >= 3) return "from-vibrant-emerald to-vibrant-cyan"
    return "from-muted to-background"
  }

  return (
    <AnimatedCard animation="lift" className="shadow-2xl overflow-hidden animate-fadeIn">
      <CardHeader className="bg-gradient-to-r from-vibrant-purple via-vibrant-pink to-vibrant-orange text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          {title}
        </CardTitle>
        <CardDescription className="text-white/90">
          Ranking based on academic performance, participation, and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/50 to-background">
                <TableHead className="w-[100px] font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Student</TableHead>
                {showGrade && <TableHead className="font-semibold">Grade</TableHead>}
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="text-right font-semibold">Points</TableHead>
                <TableHead className="text-center font-semibold">Streak</TableHead>
                <TableHead className="text-center font-semibold">Achievements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow
                  key={student.name}
                  className="hover:bg-gradient-to-r hover:from-vibrant-purple/5 hover:to-vibrant-pink/5 transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">{getRankIcon(student.rank)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${getLevelColor(student.level)} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-muted-foreground">Score: {student.score}</div>
                      </div>
                    </div>
                  </TableCell>
                  {showGrade && (
                    <TableCell>
                      <Badge variant="outline" className="bg-gradient-to-r from-school-blue/10 to-school-green/10">
                        {student.grade}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProgressRing progress={(student.level / 6) * 100} size={40} strokeWidth={4}>
                        <span className="text-xs font-bold">{student.level}</span>
                      </ProgressRing>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Zap className="w-4 h-4 text-school-gold" />
                      <span className="font-bold text-lg gradient-text">{student.points.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-gradient-to-r from-vibrant-emerald to-vibrant-cyan text-white">
                      🔥 {student.streak}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-school-gold fill-school-gold" />
                      <span className="font-semibold">{student.achievements}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
