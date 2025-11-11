'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { quizApi } from '@/lib/api/endpoints/quiz';

interface ExportButtonsProps {
  quizId: string;
  quizTitle: string;
}

/**
 * Export Buttons Component
 *
 * Provides CSV and PDF export functionality for quiz monitoring data.
 * Uses backend export endpoint to generate reports.
 */
export function ExportButtons({ quizId, quizTitle }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const { toast } = useToast();

  /**
   * Export monitoring data as CSV
   */
  const handleExportCSV = async () => {
    setIsExporting('csv');
    try {
      // Fetch report data from backend
      const report = await quizApi.monitoring.exportReport(quizId);

      // Convert to CSV
      const csvContent = generateCSV(report);

      // Download file
      downloadFile(csvContent, `${sanitizeFilename(quizTitle)}_monitoring_report.csv`, 'text/csv');

      toast({
        title: 'Export Successful',
        description: 'Monitoring report exported as CSV',
      });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export monitoring report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  /**
   * Export monitoring data as PDF
   */
  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      // Fetch report data from backend
      const report = await quizApi.monitoring.exportReport(quizId);

      // Generate PDF using browser's print function
      generatePDF(report, quizTitle);

      toast({
        title: 'PDF Ready',
        description: 'PDF print dialog opened',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export monitoring report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={isExporting !== null}
      >
        {isExporting === 'csv' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting !== null}
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        Export PDF
      </Button>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate CSV content from monitoring report
 */
function generateCSV(report: any): string {
  const headers = [
    'Student Name',
    'Status',
    'Progress (%)',
    'Current Question',
    'Time Spent (min)',
    'Flags',
    'Last Activity',
  ];

  const rows = report.participants.map((p: any) => [
    p.student_name || 'Unknown',
    p.status || 'unknown',
    p.progress_percentage || 0,
    p.current_question_index + 1 || 0,
    Math.round((p.time_spent || 0) / 60),
    p.flag_count || 0,
    p.last_activity ? new Date(p.last_activity).toLocaleString() : 'Never',
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Generate PDF using print dialog
 */
function generatePDF(report: any, quizTitle: string) {
  // Create a new window with print-friendly content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${quizTitle} - Monitoring Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            color: #2563EB;
            margin-bottom: 10px;
          }
          .summary {
            margin: 20px 0;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #2563EB;
            color: white;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${quizTitle}</h1>
        <p><strong>Monitoring Report</strong> - Generated on ${new Date().toLocaleString()}</p>

        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Students:</strong> ${report.participants.length}</p>
          <p><strong>Active:</strong> ${report.participants.filter((p: any) => p.status === 'active').length}</p>
          <p><strong>Completed:</strong> ${report.participants.filter((p: any) => p.status === 'completed').length}</p>
          <p><strong>Total Flags:</strong> ${report.participants.reduce((sum: number, p: any) => sum + (p.flag_count || 0), 0)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Current Q</th>
              <th>Time (min)</th>
              <th>Flags</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            ${report.participants
              .map(
                (p: any) => `
              <tr>
                <td>${p.student_name || 'Unknown'}</td>
                <td>${p.status || 'unknown'}</td>
                <td>${p.progress_percentage || 0}%</td>
                <td>${p.current_question_index + 1 || 0}</td>
                <td>${Math.round((p.time_spent || 0) / 60)}</td>
                <td>${p.flag_count || 0}</td>
                <td>${p.last_activity ? new Date(p.last_activity).toLocaleString() : 'Never'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Southville 8B NHS - Quiz Monitoring System</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger print after content loads
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
