"use client"
import { Shield, Lock, Mail, AlertTriangle, Server, Database, HardDrive, Cpu, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function MaintenancePage() {
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [scanPosition, setScanPosition] = useState(0)

  useEffect(() => {
    const logMessages = [
      "[SYSTEM] Initiating maintenance protocol...",
      "[DATABASE] Backing up user data... OK",
      "[SECURITY] Running security audit... OK",
      "[SERVER] Updating core modules... IN PROGRESS",
      "[CACHE] Clearing system cache... OK",
      "[API] Testing endpoint connections... OK",
      "[NETWORK] Optimizing network routes... IN PROGRESS",
      "[STORAGE] Defragmenting storage... OK",
      "[AUTH] Refreshing authentication tokens... OK",
      "[SYSTEM] Applying security patches... IN PROGRESS",
    ]

    let currentIndex = 0
    const logInterval = setInterval(() => {
      if (currentIndex < logMessages.length) {
        setLogs((prev) => [...prev.slice(-9), logMessages[currentIndex]])
        currentIndex++
      } else {
        currentIndex = 0
        setLogs([])
      }
    }, 2000)

    return () => clearInterval(logInterval)
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 300)

    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)

    return () => clearInterval(scanInterval)
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 69, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 69, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Scanning line effect */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent h-32 blur-sm"
          style={{
            top: `${scanPosition}%`,
            transition: "top 0.05s linear",
          }}
        />

        {/* Animated background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-red-500/50 shadow-2xl shadow-red-500/20 rounded-lg overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                {/* Outer rotating ring */}
                <div
                  className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-spin"
                  style={{ animationDuration: "8s" }}
                />
                <div
                  className="absolute inset-2 border-4 border-orange-500/30 rounded-full animate-spin"
                  style={{ animationDuration: "6s", animationDirection: "reverse" }}
                />
                <div
                  className="absolute inset-4 border-4 border-yellow-500/30 rounded-full animate-spin"
                  style={{ animationDuration: "4s" }}
                />

                {/* Pulsing glow */}
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />

                {/* Center lock icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-full shadow-lg shadow-red-500/50">
                    <Lock className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-center">
              <h1 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-balance animate-pulse">
                SYSTEM LOCKDOWN
              </h1>
              <div className="flex items-center justify-center gap-3 text-red-400 animate-bounce">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <p className="text-xl font-bold tracking-wider">MAINTENANCE MODE ACTIVE</p>
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto text-balance">
                Critical system upgrades in progress. All services temporarily suspended.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-black/80 border-2 border-red-500/50 p-6 shadow-lg shadow-red-500/20">
                <div className="flex items-center gap-2 mb-4 border-b border-red-500/30 pb-3">
                  <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="font-bold text-red-400 tracking-wider">SYSTEM STATUS TERMINAL</h3>
                </div>
                <div className="font-mono text-xs space-y-1 h-48 overflow-hidden">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-green-400 opacity-0 animate-[fadeIn_0.3s_ease-in_forwards]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-yellow-500">&gt;</span> {log}
                    </div>
                  ))}
                  <div className="text-green-400 animate-pulse">
                    <span className="text-yellow-500">&gt;</span> _
                  </div>
                </div>
              </Card>

              <Card className="bg-black/80 border-2 border-orange-500/50 p-6 shadow-lg shadow-orange-500/20">
                <div className="flex items-center gap-2 mb-4 border-b border-orange-500/30 pb-3">
                  <Cpu className="w-5 h-5 text-orange-500 animate-pulse" />
                  <h3 className="font-bold text-orange-400 tracking-wider">SYSTEM OPERATIONS</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Database Migration", value: progress, color: "red" },
                    { label: "Security Patches", value: (progress + 20) % 100, color: "orange" },
                    { label: "Cache Optimization", value: (progress + 40) % 100, color: "yellow" },
                    { label: "Network Routing", value: (progress + 60) % 100, color: "red" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-slate-400 font-mono">{item.value}%</span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-2 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
                            item.color === "red"
                              ? "bg-red-500"
                              : item.color === "orange"
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                          }`}
                          style={{ width: `${item.value}%` }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-2 border-red-500/50 p-4 shadow-lg shadow-red-500/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-red-500/20 p-3 rounded-full relative">
                    <Server className="w-8 h-8 text-red-400 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h3 className="font-bold text-red-400 text-center">SERVER UPGRADE</h3>
                  <p className="text-xs text-slate-400 text-center">Core systems updating</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-950/50 to-orange-900/30 border-2 border-orange-500/50 p-4 shadow-lg shadow-orange-500/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-orange-500/20 p-3 rounded-full relative">
                    <Shield className="w-8 h-8 text-orange-400 animate-pulse" />
                    <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h3 className="font-bold text-orange-400 text-center">SECURITY SCAN</h3>
                  <p className="text-xs text-slate-400 text-center">Running diagnostics</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-950/50 to-yellow-900/30 border-2 border-yellow-500/50 p-4 shadow-lg shadow-yellow-500/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-yellow-500/20 p-3 rounded-full relative">
                    <Database className="w-8 h-8 text-yellow-400 animate-bounce" />
                    <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h3 className="font-bold text-yellow-400 text-center">DATA BACKUP</h3>
                  <p className="text-xs text-slate-400 text-center">Securing information</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-950/50 to-orange-900/30 border-2 border-red-500/50 p-4 shadow-lg shadow-red-500/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-red-500/20 p-3 rounded-full relative">
                    <HardDrive className="w-8 h-8 text-red-400 animate-pulse" />
                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h3 className="font-bold text-red-400 text-center">STORAGE SYNC</h3>
                  <p className="text-xs text-slate-400 text-center">Optimizing drives</p>
                </div>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="bg-slate-800/50 border-2 border-yellow-500/50 p-6 mb-6 shadow-lg shadow-yellow-500/20">
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center justify-center gap-2 text-lg">
                <Mail className="w-5 h-5 animate-bounce" />
                EMERGENCY CONTACT
              </h3>
              <p className="text-slate-300 mb-4 text-center">For critical issues during maintenance:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-400 shadow-lg shadow-red-500/30">
                  <Mail className="w-4 h-4 mr-2" />
                  support@southville8b.edu.ph
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-400 shadow-lg shadow-orange-500/30">
                  Emergency: (02) 1234-5678
                </Button>
              </div>
            </Card>

            {/* Footer Message */}
            <div className="text-center">
              <p className="text-slate-400 text-sm animate-pulse">System will resume normal operations shortly</p>
              <p className="text-red-400 text-xs mt-2 font-mono">LOCKDOWN PROTOCOL ACTIVE</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
