/**
 * ========================================
 * EVENT VALIDATION MODAL COMPONENTS
 * ========================================
 * Modal dialogs for displaying event validation errors and warnings.
 */

'use client';

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ValidationResult,
  ValidationSeverity,
  hasBlockingErrors,
  hasWarnings
} from '@/lib/utils/event-validations';
import type { Event } from '@/lib/api/types/events';

interface EventValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed?: () => void;
  validationResults: ValidationResult[];
  mode?: 'create' | 'edit';
}

/**
 * Main validation modal component
 * Shows all validation errors and warnings with appropriate styling
 */
export function EventValidationModal({
  isOpen,
  onClose,
  onProceed,
  validationResults,
  mode = 'create'
}: EventValidationModalProps) {
  const errors = validationResults.filter(
    r => !r.isValid && r.severity === ValidationSeverity.ERROR
  );
  const warnings = validationResults.filter(
    r => !r.isValid && r.severity === ValidationSeverity.WARNING
  );

  const hasErrors = errors.length > 0;
  const canProceed = !hasErrors && onProceed;

  // Determine modal style based on severity
  const getModalStyle = () => {
    if (hasErrors) {
      return {
        borderColor: 'border-red-500',
        iconBgColor: 'bg-red-100 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
        icon: XCircle,
        title: 'Cannot Create Event',
        description: 'Please fix the following errors before proceeding'
      };
    }

    if (warnings.length > 0) {
      return {
        borderColor: 'border-amber-500',
        iconBgColor: 'bg-amber-100 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        icon: AlertTriangle,
        title: 'Warning: Potential Conflicts',
        description: 'Please review the following warnings before proceeding'
      };
    }

    return {
      borderColor: 'border-green-500',
      iconBgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: CheckCircle,
      title: 'Validation Passed',
      description: 'All validations passed successfully'
    };
  };

  const style = getModalStyle();
  const Icon = style.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl border-2",
        style.borderColor
      )}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              style.iconBgColor
            )}>
              <Icon className={cn("w-6 h-6", style.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {style.title}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {style.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {/* Critical Errors Section */}
            {errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Critical Errors ({errors.length})
                  </h3>
                </div>
                {errors.map((error, index) => (
                  <ValidationItem
                    key={`error-${index}`}
                    result={error}
                    index={index + 1}
                  />
                ))}
              </div>
            )}

            {/* Separator between errors and warnings */}
            {errors.length > 0 && warnings.length > 0 && (
              <Separator className="my-4" />
            )}

            {/* Warnings Section */}
            {warnings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Warnings ({warnings.length})
                  </h3>
                </div>
                {warnings.map((warning, index) => (
                  <ValidationItem
                    key={`warning-${index}`}
                    result={warning}
                    index={index + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasErrors ? (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Go Back and Fix Errors
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {canProceed && (
                <Button
                  onClick={onProceed}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {warnings.length > 0 ? 'Proceed Anyway' : 'Continue'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Individual validation item display
 */
function ValidationItem({ result, index }: { result: ValidationResult; index: number }) {
  const isError = result.severity === ValidationSeverity.ERROR;
  const isWarning = result.severity === ValidationSeverity.WARNING;

  return (
    <div className={cn(
      "p-4 rounded-lg border-l-4",
      isError && "bg-red-50 dark:bg-red-950/20 border-red-500",
      isWarning && "bg-amber-50 dark:bg-amber-950/20 border-amber-500",
      !isError && !isWarning && "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
    )}>
      <div className="flex items-start gap-3">
        <Badge
          variant="outline"
          className={cn(
            "mt-0.5 flex-shrink-0",
            isError && "border-red-500 text-red-700 dark:text-red-300",
            isWarning && "border-amber-500 text-amber-700 dark:text-amber-300"
          )}
        >
          {index}
        </Badge>
        <div className="flex-1 space-y-2">
          <h4 className={cn(
            "font-semibold",
            isError && "text-red-900 dark:text-red-100",
            isWarning && "text-amber-900 dark:text-amber-100"
          )}>
            {result.message}
          </h4>
          {result.details && (
            <p className={cn(
              "text-sm",
              isError && "text-red-700 dark:text-red-300",
              isWarning && "text-amber-700 dark:text-amber-300",
              !isError && !isWarning && "text-blue-700 dark:text-blue-300"
            )}>
              {result.details}
            </p>
          )}
          {result.conflictingEvents && result.conflictingEvents.length > 0 && (
            <ConflictingEventsList events={result.conflictingEvents} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Display list of conflicting events
 */
function ConflictingEventsList({ events }: { events: Event[] }) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        Conflicting Events:
      </p>
      {events.slice(0, 3).map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-2 p-2 rounded bg-background/50 border text-xs"
        >
          <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{event.title}</p>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}{' '}
                at {event.time}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {events.length > 3 && (
        <p className="text-xs text-muted-foreground">
          +{events.length - 3} more event{events.length - 3 !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

/**
 * Quick validation summary badge for form
 */
export function ValidationSummaryBadge({
  validationResults,
  className
}: {
  validationResults: ValidationResult[];
  className?: string;
}) {
  const errors = validationResults.filter(
    r => !r.isValid && r.severity === ValidationSeverity.ERROR
  );
  const warnings = validationResults.filter(
    r => !r.isValid && r.severity === ValidationSeverity.WARNING
  );

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {errors.length > 0 && (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          {errors.length} Error{errors.length !== 1 ? 's' : ''}
        </Badge>
      )}
      {warnings.length > 0 && (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3" />
          {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
