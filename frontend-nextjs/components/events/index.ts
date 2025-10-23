/**
 * Events Components Index
 * Centralized exports for all event-related components
 */

// Main event components
export { EventScheduleTimeline, EventScheduleSummary } from './event-schedule-timeline';
export { EventFAQAccordion, EventFAQSummary } from './event-faq-accordion';
export { EventHighlightsShowcase, EventHighlightsSummary } from './event-highlights-showcase';
export { EventAdditionalInfoComponent, EventAdditionalInfoSummary } from './event-additional-info';

// Re-export types for convenience
export type { EventSchedule, EventFaq, EventHighlight, EventAdditionalInfo } from '@/lib/api/types/events';
