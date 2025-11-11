/**
 * Monitoring Report Export Utilities
 *
 * Functions to export monitoring data to CSV and PDF formats.
 *
 * @module lib/utils/export-monitoring-report
 */

import type { MonitoringExportResponse, ActiveParticipant, QuizFlag } from '@/lib/api/types';

/**
 * Convert monitoring data to CSV format
 *
 * @param data - Monitoring export data
 * @returns CSV string
 */
export function exportToCSV(data: MonitoringExportResponse): string {
  const { quizTitle, exportedAt, participants, flags, summary } = data;

  // CSV Header
  const header = [
    'Student Name',
    'Section',
    'Status',
    'Progress (%)',
    'Questions Answered',
    'Total Questions',
    'Current Question',
    'Time Elapsed (min)',
    'Tab Switches',
    'Started At',
    'Last Heartbeat',
    'IP Changed',
    'Initial IP',
    'Current IP',
    'Device Fingerprint',
    'Idle Time (min)',
  ].join(',');

  // CSV Rows
  const rows = participants.map((p) => {
    const timeElapsedMin = Math.floor(p.time_elapsed / 60);
    const idleTimeMin = Math.floor((p.idle_time_seconds || 0) / 60);
    const status = p.is_active ? 'Active' : 'Inactive';

    return [
      escapeCsvValue(p.student_name),
      escapeCsvValue(p.section),
      status,
      p.progress,
      p.questions_answered,
      p.total_questions,
      p.current_question_index + 1, // +1 for human-readable
      timeElapsedMin,
      p.tab_switches,
      p.started_at,
      p.last_heartbeat || 'N/A',
      p.ip_changed ? 'Yes' : 'No',
      p.initial_ip_address || 'N/A',
      p.current_ip_address || 'N/A',
      escapeCsvValue(p.device_fingerprint),
      idleTimeMin,
    ].join(',');
  });

  // Summary section
  const summaryRows = [
    '',
    '=== SUMMARY ===',
    `Quiz Title,${escapeCsvValue(quizTitle)}`,
    `Exported At,${exportedAt}`,
    `Total Participants,${summary.totalParticipants}`,
    `Active,${summary.activeCount}`,
    `Completed,${summary.completedCount}`,
    `Flagged,${summary.flaggedCount}`,
    `Total Flags,${summary.totalFlags}`,
    `Average Progress,${summary.averageProgress}%`,
    `Average Time Elapsed,${Math.floor(summary.averageTimeElapsed / 60)} min`,
  ];

  // Flags section
  const flagsHeader = [
    '',
    '=== SECURITY FLAGS ===',
    'Student Name,Flag Type,Severity,Description,Timestamp',
  ];

  const flagRows = flags.map((f) => {
    return [
      escapeCsvValue(f.student_name || 'Unknown'),
      f.flag_type,
      f.severity,
      escapeCsvValue(f.description || ''),
      f.created_at,
    ].join(',');
  });

  // Combine all sections
  return [
    header,
    ...rows,
    ...summaryRows,
    ...flagsHeader,
    ...flagRows,
  ].join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Download CSV file
 *
 * @param csvContent - CSV string
 * @param filename - Filename (without extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export monitoring report as CSV
 *
 * @param data - Monitoring export data
 *
 * @example
 * ```typescript
 * const report = await quizApi.teacher.monitoring.exportReport(quizId);
 * exportMonitoringReportAsCSV(report);
 * ```
 */
export function exportMonitoringReportAsCSV(data: MonitoringExportResponse): void {
  const csvContent = exportToCSV(data);
  const filename = `quiz-monitoring-${data.quizId}-${new Date().getTime()}`;
  downloadCSV(csvContent, filename);
}

/**
 * Generate summary statistics text
 *
 * @param data - Monitoring export data
 * @returns Formatted summary text
 */
export function generateSummaryText(data: MonitoringExportResponse): string {
  const { summary, quizTitle, exportedAt } = data;

  return `
Quiz Monitoring Report
======================

Quiz: ${quizTitle}
Exported: ${new Date(exportedAt).toLocaleString()}

Participants Summary:
- Total: ${summary.totalParticipants}
- Active: ${summary.activeCount}
- Completed: ${summary.completedCount}
- Flagged: ${summary.flaggedCount}

Performance:
- Average Progress: ${summary.averageProgress.toFixed(1)}%
- Average Time: ${Math.floor(summary.averageTimeElapsed / 60)} minutes

Security:
- Total Flags: ${summary.totalFlags}
- Flag Rate: ${summary.totalParticipants > 0 ? (summary.totalFlags / summary.totalParticipants).toFixed(2) : 0} flags per student
  `.trim();
}

/**
 * Format time elapsed as readable string
 *
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "15m 30s")
 */
export function formatTimeElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs}s`;
  }

  if (secs === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${secs}s`;
}

/**
 * Calculate flag severity distribution
 *
 * @param flags - Quiz flags
 * @returns Severity counts
 */
export function calculateFlagDistribution(flags: QuizFlag[]): {
  low: number;
  medium: number;
  high: number;
} {
  return flags.reduce(
    (acc, flag) => {
      if (flag.severity === 'low') acc.low++;
      else if (flag.severity === 'medium') acc.medium++;
      else if (flag.severity === 'high') acc.high++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );
}

/**
 * Calculate participant status distribution
 *
 * @param participants - Active participants
 * @returns Status counts
 */
export function calculateStatusDistribution(participants: ActiveParticipant[]): {
  active: number;
  inactive: number;
  completed: number;
  flagged: number;
} {
  return participants.reduce(
    (acc, p) => {
      if (p.progress === 100) {
        acc.completed++;
      } else if (p.is_active) {
        acc.active++;
      } else {
        acc.inactive++;
      }

      if (p.tab_switches > 0) {
        acc.flagged++;
      }

      return acc;
    },
    { active: 0, inactive: 0, completed: 0, flagged: 0 }
  );
}
