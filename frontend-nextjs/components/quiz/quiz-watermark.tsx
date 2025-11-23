/**
 * QuizWatermark Component
 * 
 * Displays a dynamic watermark overlay on the quiz page.
 * - Always shows a subtle watermark (low opacity, small)
 * - Shows prominent watermark when screenshot is detected (high opacity, larger, animated)
 * 
 * @module components/quiz/quiz-watermark
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuizAttemptStore } from '@/lib/stores';

interface QuizWatermarkProps {
  /** Whether screenshot was detected (triggers slightly more visible watermark) */
  screenshotDetected: boolean;
  /** Student name for watermark text */
  studentName?: string;
}

/**
 * Generate watermark text - just student name
 */
const generateWatermarkText = (studentName?: string): string => {
  return studentName || 'Student';
};

export function QuizWatermark({
  screenshotDetected,
  studentName,
}: QuizWatermarkProps) {
  const { attempt } = useQuizAttemptStore();

  // Get student name from attempt if not provided
  const displayName = studentName || attempt?.student_name || 'Student';
  const watermarkText = generateWatermarkText(displayName);

  return (
    <>
      {/* Always-on watermark - gray, visible but not intrusive */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          userSelect: 'none',
        }}
      >
        {/* Center watermark */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] whitespace-nowrap"
          style={{
            fontSize: '20px',
            color: 'rgba(107, 114, 128, 0.35)', // Gray color - more visible
            fontFamily: 'sans-serif',
            letterSpacing: '2px',
            fontWeight: 'normal',
          }}
        >
          {watermarkText}
        </div>
        {/* Diagonal watermarks across screen */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${(i * 16) + 8}%`,
              left: `${(i * 16) + 8}%`,
              transform: 'rotate(-45deg)',
              fontSize: '18px',
              color: 'rgba(107, 114, 128, 0.3)', // Gray color - more visible
              fontFamily: 'sans-serif',
              letterSpacing: '2px',
              whiteSpace: 'nowrap',
              fontWeight: 'normal',
            }}
          >
            {watermarkText}
          </div>
        ))}
      </div>

      {/* More visible when screenshot detected - still gray */}
      {screenshotDetected && (
        <div
          className="fixed inset-0 pointer-events-none z-[60]"
          style={{
            userSelect: 'none',
          }}
        >
          {/* Center watermark */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] whitespace-nowrap"
            style={{
              fontSize: '24px',
              color: 'rgba(107, 114, 128, 0.5)', // Gray color - more visible
              fontFamily: 'sans-serif',
              letterSpacing: '2px',
              fontWeight: 'normal',
            }}
          >
            {watermarkText}
          </div>
          {/* More diagonal watermarks when detected */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`detected-${i}`}
              className="absolute"
              style={{
                top: `${(i * 12) + 4}%`,
                left: `${(i * 12) + 4}%`,
                transform: 'rotate(-45deg)',
                fontSize: '20px',
                color: 'rgba(107, 114, 128, 0.45)', // Gray color - more visible
                fontFamily: 'sans-serif',
                letterSpacing: '2px',
                whiteSpace: 'nowrap',
                fontWeight: 'normal',
              }}
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

