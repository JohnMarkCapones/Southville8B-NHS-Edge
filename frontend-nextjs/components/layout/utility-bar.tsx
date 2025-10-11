"use client"

import { Phone, Mail, MapPin, Clock } from "lucide-react"

export function UtilityBar() {
  return (
    <div className="bg-card border-b border-border utility-bar-shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Left side - Contact info with enhanced styling */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group">
              <Phone className="h-4 w-4 text-blue-600 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">(02) 8123-4567</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group">
              <Mail className="h-4 w-4 text-blue-600 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">info@southville8bnhs.edu</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors group">
              <MapPin className="h-4 w-4 text-blue-600 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">
                Southville 8B, Brgy. San Isidro, Rodriguez, Rizal, Philippines
              </span>
            </div>
          </div>

          {/* Mobile contact info */}
          <div className="md:hidden flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">(02) 8123-4567</span>
            </div>
          </div>

          {/* Right side - Enhanced quick links without notifications */}
          <div className="flex items-center space-x-4">
            {/* Office hours with icon */}
            <div className="hidden lg:flex items-center space-x-2 text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Office Hours: 7:00 AM - 5:00 PM</span>
            </div>

            <div className="flex items-center space-x-1">
              <a href="/guess/admissions" className="utility-link text-sm font-medium text-foreground">
                Admissions
              </a>
              <span className="text-border mx-2">•</span>
              <a href="/guess/contact" className="utility-link text-sm font-medium text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
