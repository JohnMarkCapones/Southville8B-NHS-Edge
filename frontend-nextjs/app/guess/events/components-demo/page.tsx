/**
 * Events Components Demo Page
 * 
 * Showcases all the new event components with sample data.
 * This page demonstrates the rich event features available.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  EventScheduleTimeline,
  EventScheduleSummary,
  EventFAQAccordion,
  EventFAQSummary,
  EventHighlightsShowcase,
  EventHighlightsSummary,
  EventAdditionalInfoComponent,
  EventAdditionalInfoSummary
} from '@/components/events';

// Sample data for demonstration
const sampleSchedule = [
  {
    id: '1',
    activityTime: '09:00',
    activityDescription: 'Registration and Welcome Coffee',
    orderIndex: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    activityTime: '09:30',
    activityDescription: 'Opening Keynote: The Future of Education',
    orderIndex: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    activityTime: '10:30',
    activityDescription: 'Coffee Break and Networking',
    orderIndex: 2,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    activityTime: '11:00',
    activityDescription: 'Workshop Session A: Digital Learning Tools',
    orderIndex: 3,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    activityTime: '12:00',
    activityDescription: 'Lunch Break',
    orderIndex: 4,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    activityTime: '13:00',
    activityDescription: 'Panel Discussion: Student Engagement Strategies',
    orderIndex: 5,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const sampleFAQs = [
  {
    id: '1',
    question: 'What should I bring to the event?',
    answer: 'Please bring your ID, confirmation email, and any materials mentioned in the event description. We recommend bringing a notebook and pen for taking notes during sessions.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    question: 'Is parking available at the venue?',
    answer: 'Yes, free parking is available in the main lot. Additional parking is available in the overflow lot if needed. Please arrive early as parking can fill up quickly.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    question: 'Will food and drinks be provided?',
    answer: 'Light refreshments and coffee will be available throughout the day. Lunch will be provided for all registered attendees. Please let us know of any dietary restrictions when you register.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    question: 'Can I get a certificate of attendance?',
    answer: 'Yes, certificates of attendance will be provided to all participants who attend the full event. Digital certificates will be emailed within 5 business days after the event.',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const sampleHighlights = [
  {
    id: '1',
    title: 'Keynote Speaker: Dr. Sarah Johnson',
    content: 'Dr. Sarah Johnson, renowned education researcher and author of "The Digital Classroom Revolution," will deliver the opening keynote on the future of education technology.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop',
    orderIndex: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Interactive Workshop Sessions',
    content: 'Hands-on workshops covering the latest digital learning tools, student engagement strategies, and assessment techniques. All materials and devices will be provided.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    orderIndex: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Networking Opportunities',
    content: 'Connect with fellow educators, administrators, and education technology professionals during dedicated networking sessions and coffee breaks.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
    orderIndex: 2,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const sampleAdditionalInfo = [
  {
    id: '1',
    title: 'Contact Information',
    content: 'For questions about this event, please contact:<br><strong>Event Coordinator:</strong> Jane Smith<br><strong>Email:</strong> events@southville8b.edu<br><strong>Phone:</strong> (555) 123-4567',
    orderIndex: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Venue Details',
    content: 'The event will be held at the Main Auditorium, Southville 8B National High School.<br><strong>Address:</strong> 123 Education Street, Southville City<br><strong>Capacity:</strong> 200 attendees<br><strong>Accessibility:</strong> Wheelchair accessible with designated seating',
    orderIndex: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Important Guidelines',
    content: 'Please follow these guidelines during the event:<br>• Arrive 15 minutes early for registration<br>• Turn off or silence mobile devices during sessions<br>• Respect other attendees and speakers<br>• Complete the feedback form at the end of the day',
    orderIndex: 2,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'What\'s Included',
    content: 'Your registration includes:<br>• All workshop materials and handouts<br>• Light refreshments and lunch<br>• Certificate of attendance<br>• Access to presentation slides (digital)<br>• Networking opportunities',
    orderIndex: 3,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export default function EventsComponentsDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Events Components Demo</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Showcase of the new rich event components that integrate with the backend API.
            These components display schedules, FAQs, highlights, and additional information dynamically.
          </p>
        </div>

        {/* Event Schedule Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Event Schedule Timeline</h2>
            <p className="text-muted-foreground">
              Beautiful timeline component for displaying event schedules with multiple variants.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Default Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Default</Badge>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventScheduleTimeline 
                  schedule={sampleSchedule} 
                  variant="default"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>

            {/* Compact Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Compact</Badge>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventScheduleTimeline 
                  schedule={sampleSchedule} 
                  variant="compact"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>

            {/* Detailed Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Detailed</Badge>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventScheduleTimeline 
                  schedule={sampleSchedule.slice(0, 3)} 
                  variant="detailed"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>
          </div>

          {/* Schedule Summary */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <EventScheduleSummary schedule={sampleSchedule} />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Event FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Event FAQ Accordion</h2>
            <p className="text-muted-foreground">
              Interactive FAQ component with search functionality and multiple display variants.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Default</Badge>
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventFAQAccordion 
                  faqs={sampleFAQs} 
                  variant="default"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>

            {/* Compact Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Compact</Badge>
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventFAQAccordion 
                  faqs={sampleFAQs} 
                  variant="compact"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>
          </div>

          {/* FAQ Summary */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>FAQ Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <EventFAQSummary faqs={sampleFAQs} />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Event Highlights Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Event Highlights Showcase</h2>
            <p className="text-muted-foreground">
              Rich highlights display with image support and multiple layout options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Default</Badge>
                  Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventHighlightsShowcase 
                  highlights={sampleHighlights} 
                  variant="default"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>

            {/* Grid Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Grid</Badge>
                  Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventHighlightsShowcase 
                  highlights={sampleHighlights} 
                  variant="grid"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>
          </div>

          {/* Highlights Summary */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Highlights Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <EventHighlightsSummary highlights={sampleHighlights} />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Event Additional Info Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Event Additional Information</h2>
            <p className="text-muted-foreground">
              Organized information cards with contextual icons and rich content support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Default</Badge>
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventAdditionalInfoComponent 
                  additionalInfo={sampleAdditionalInfo} 
                  variant="default"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>

            {/* Grid Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Grid</Badge>
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventAdditionalInfoComponent 
                  additionalInfo={sampleAdditionalInfo} 
                  variant="grid"
                  className="max-h-96 overflow-y-auto"
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Summary */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Additional Info Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <EventAdditionalInfoSummary additionalInfo={sampleAdditionalInfo} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integration Status */}
        <section className="mb-16">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                ✅ Events Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300">
              <div className="space-y-2">
                <p>• <strong>API Layer:</strong> Complete with 25+ endpoint functions</p>
                <p>• <strong>TypeScript Types:</strong> Full backend integration</p>
                <p>• <strong>UI Components:</strong> 4 reusable components with multiple variants</p>
                <p>• <strong>Backend Data:</strong> 12 events available, 10 published</p>
                <p>• <strong>Next Step:</strong> Integrate with existing event pages</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
