import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingEvents, getEvents } from '@/lib/api/endpoints/events';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Testing events API...');
    
    // Test upcoming events
    console.log('📡 Testing getUpcomingEvents...');
    const upcomingResult = await getUpcomingEvents();
    console.log('✅ Upcoming events result:', {
      count: upcomingResult.length,
      events: upcomingResult.map(e => ({
        id: e.id,
        title: e.title,
        highlights: e.highlights?.length || 0,
        schedule: e.schedule?.length || 0,
        faq: e.faq?.length || 0,
        additionalInfo: e.additionalInfo?.length || 0
      }))
    });

    // Test all events
    console.log('📡 Testing getEvents...');
    const allEventsResult = await getEvents({ 
      status: 'published',
      limit: 10
    });
    console.log('✅ All events result:', {
      count: allEventsResult.data.length,
      events: allEventsResult.data.map(e => ({
        id: e.id,
        title: e.title,
        highlights: e.highlights?.length || 0,
        schedule: e.schedule?.length || 0,
        faq: e.faq?.length || 0,
        additionalInfo: e.additionalInfo?.length || 0
      }))
    });

    // Find State Basketball Championship specifically
    const basketballEvent = allEventsResult.data.find(e => 
      e.title.toLowerCase().includes('basketball')
    );
    
    if (basketballEvent) {
      console.log('🏀 State Basketball Championship found:', {
        id: basketballEvent.id,
        title: basketballEvent.title,
        highlights: basketballEvent.highlights,
        schedule: basketballEvent.schedule,
        faq: basketballEvent.faq,
        additionalInfo: basketballEvent.additionalInfo
      });
    } else {
      console.log('❌ State Basketball Championship not found');
    }

    return NextResponse.json({
      success: true,
      upcoming: {
        count: upcomingResult.length,
        events: upcomingResult.map(e => ({
          id: e.id,
          title: e.title,
          highlights: e.highlights?.length || 0,
          schedule: e.schedule?.length || 0,
          faq: e.faq?.length || 0,
          additionalInfo: e.additionalInfo?.length || 0
        }))
      },
      allEvents: {
        count: allEventsResult.data.length,
        events: allEventsResult.data.map(e => ({
          id: e.id,
          title: e.title,
          highlights: e.highlights?.length || 0,
          schedule: e.schedule?.length || 0,
          faq: e.faq?.length || 0,
          additionalInfo: e.additionalInfo?.length || 0
        }))
      },
      basketballEvent: basketballEvent ? {
        id: basketballEvent.id,
        title: basketballEvent.title,
        highlights: basketballEvent.highlights,
        schedule: basketballEvent.schedule,
        faq: basketballEvent.faq,
        additionalInfo: basketballEvent.additionalInfo
      } : null
    });

  } catch (error) {
    console.error('❌ Debug events error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
