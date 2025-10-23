import { EnhancedNavButtons, ApplyNowButton, ScheduleVisitButton } from "@/components/ui/enhanced-nav-buttons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnhancedNavDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enhanced Navigation Buttons</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Redesigned navigation elements with improved visual appeal and user experience
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Combined Buttons */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-700">Combined Navigation Buttons</CardTitle>
              <CardDescription>Apply Now and Schedule Visit buttons displayed together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <EnhancedNavButtons />
              </div>
              <div className="flex justify-center">
                <EnhancedNavButtons size="lg" />
              </div>
            </CardContent>
          </Card>

          {/* Individual Buttons */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-700">Individual Button Components</CardTitle>
              <CardDescription>Standalone Apply Now and Schedule Visit buttons for flexible placement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-gray-700">Apply Now Button</h3>
                  <ApplyNowButton />
                  <ApplyNowButton size="lg" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-gray-700">Schedule Visit Button</h3>
                  <ScheduleVisitButton />
                  <ScheduleVisitButton size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-700">Enhanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Visual Enhancements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Gradient backgrounds with hover effects</li>
                    <li>• Animated icons and sparkle effects</li>
                    <li>• Smooth scaling and shadow transitions</li>
                    <li>• Consistent red color scheme</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Interactive Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Hover state animations</li>
                    <li>• Active state feedback</li>
                    <li>• Accessible focus indicators</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
