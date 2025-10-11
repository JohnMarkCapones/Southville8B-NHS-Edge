"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PartyPopper, Gift, Award, SparklesIcon } from "lucide-react"
import { MOCK_HONORS_STUDENT, MOCK_BIRTHDAY_STUDENT, type StudentHonor } from "@/lib/constants"

interface CelebrationModalProps {
  honorStudent?: StudentHonor
  birthdayStudent?: { name: string }
  // onClose?: () => void
}

export function CelebrationModal({
  honorStudent = MOCK_HONORS_STUDENT,
  birthdayStudent = MOCK_BIRTHDAY_STUDENT,
}: CelebrationModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Ensure modal shows on page load
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500) // Even faster delay
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Force show modal for demo
    if (typeof window !== "undefined") {
      setIsOpen(true)
    }
  }, [])

  if (!isOpen) return null

  const hasHonor = honorStudent && honorStudent.name
  const hasBirthday = birthdayStudent && birthdayStudent.name

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px] bg-gradient-to-br from-vibrant-purple via-vibrant-pink to-vibrant-orange text-white p-0 overflow-hidden border-0">
        <div className="relative p-8">
          {/* Enhanced Sparkles background effect */}
          {[...Array(15)].map((_, i) => (
            <SparklesIcon
              key={i}
              className="absolute text-school-gold/80 animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 24 + 12}px`,
                height: `${Math.random() * 24 + 12}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}

          <DialogHeader className="text-center mb-8">
            <DialogTitle className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
              <PartyPopper className="w-12 h-12 text-school-gold animate-bounce" />🎉 Welcome to Southville 8B NHS! 🎉
            </DialogTitle>
            <p className="text-lg opacity-90">Get ready for an amazing educational journey!</p>
          </DialogHeader>

          <div className="space-y-6">
            {hasHonor && (
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl text-center animate-fadeIn animation-delay-200 border border-white/30">
                <Award className="w-16 h-16 mx-auto mb-4 text-school-gold animate-pulse" />
                <DialogDescription className="text-2xl font-bold text-white mb-2">
                  🏆 Congratulations, {honorStudent.name}! 🏆
                </DialogDescription>
                <p className="text-lg text-white/90">
                  For achieving <span className="font-bold text-school-gold text-xl">{honorStudent.level}!</span>
                  <br />
                  We are incredibly proud of your dedication!
                </p>
              </div>
            )}

            {hasBirthday && (
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl text-center animate-fadeIn animation-delay-400 border border-white/30">
                <Gift className="w-16 h-16 mx-auto mb-4 text-school-gold animate-bounce" />
                <DialogDescription className="text-2xl font-bold text-white mb-2">
                  🎂 Happy Birthday, {birthdayStudent.name}! 🎂
                </DialogDescription>
                <p className="text-lg text-white/90">Wishing you a fantastic day filled with joy and success!</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center animate-fadeIn animation-delay-600">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-school-gold text-school-blue hover:bg-school-gold/90 px-10 py-4 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Let's Get Started! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
