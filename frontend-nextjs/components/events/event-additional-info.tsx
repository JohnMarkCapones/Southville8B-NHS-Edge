/**
 * Event Additional Info Component
 * 
 * Displays event additional information in organized cards.
 * Supports icons, rich content, and responsive layouts.
 */

'use client';

import React, { useState } from 'react';
import { 
  Info, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Users, 
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EventAdditionalInfo } from '@/lib/api/types/events';

interface EventAdditionalInfoProps {
  additionalInfo: EventAdditionalInfo[];
  className?: string;
  showIcons?: boolean;
  showStats?: boolean;
  variant?: 'default' | 'grid' | 'list' | 'accordion';
  maxItems?: number;
}

/**
 * Event Additional Info Component
 * 
 * @param additionalInfo - Array of additional info items from the backend
 * @param className - Additional CSS classes
 * @param showIcons - Whether to display contextual icons
 * @param showStats - Whether to show info statistics
 * @param variant - Display variant (default, grid, list, accordion)
 * @param maxItems - Maximum number of items to display
 */
export function EventAdditionalInfoComponent({
  additionalInfo,
  className,
  showIcons = true,
  showStats = true,
  variant = 'default',
  maxItems
}: EventAdditionalInfoProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Sort additional info by orderIndex
  const sortedInfo = [...additionalInfo].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Limit items if maxItems is specified
  const displayedInfo = maxItems && !showAll 
    ? sortedInfo.slice(0, maxItems)
    : sortedInfo;

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => expandedItems.has(id);
  const hasMoreItems = maxItems && sortedInfo.length > maxItems;

  // Get contextual icon based on title/content
  const getContextualIcon = (title: string, content: string) => {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('contact') || titleLower.includes('phone') || contentLower.includes('phone')) {
      return <Phone className="h-4 w-4" />;
    }
    if (titleLower.includes('email') || titleLower.includes('contact') || contentLower.includes('@')) {
      return <Mail className="h-4 w-4" />;
    }
    if (titleLower.includes('location') || titleLower.includes('address') || titleLower.includes('venue')) {
      return <MapPin className="h-4 w-4" />;
    }
    if (titleLower.includes('website') || titleLower.includes('url') || contentLower.includes('http')) {
      return <Globe className="h-4 w-4" />;
    }
    if (titleLower.includes('time') || titleLower.includes('schedule') || titleLower.includes('duration')) {
      return <Clock className="h-4 w-4" />;
    }
    if (titleLower.includes('capacity') || titleLower.includes('attendees') || titleLower.includes('seats')) {
      return <Users className="h-4 w-4" />;
    }
    if (titleLower.includes('price') || titleLower.includes('cost') || titleLower.includes('fee') || titleLower.includes('$')) {
      return <CreditCard className="h-4 w-4" />;
    }
    if (titleLower.includes('guidelines') || titleLower.includes('rules') || titleLower.includes('policy')) {
      return <FileText className="h-4 w-4" />;
    }
    if (titleLower.includes('important') || titleLower.includes('note') || titleLower.includes('warning')) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (titleLower.includes('included') || titleLower.includes('provided') || titleLower.includes('free')) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  };

  // Get contextual color based on content type
  const getContextualColor = (title: string, content: string) => {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('important') || titleLower.includes('warning') || titleLower.includes('urgent')) {
      return 'text-amber-600 dark:text-amber-400';
    }
    if (titleLower.includes('contact') || titleLower.includes('phone') || titleLower.includes('email')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (titleLower.includes('location') || titleLower.includes('address') || titleLower.includes('venue')) {
      return 'text-green-600 dark:text-green-400';
    }
    if (titleLower.includes('price') || titleLower.includes('cost') || titleLower.includes('fee')) {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-primary';
  };

  if (!additionalInfo.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No additional information available for this event.</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {showStats && (
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {additionalInfo.length} Info Section{additionalInfo.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {displayedInfo.map((info) => (
          <Card key={info.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {showIcons && (
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-muted text-muted-foreground"
                  )}>
                    {getContextualIcon(info.title, info.content)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{info.title}</h4>
                  <div 
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: info.content }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hasMoreItems && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show less' : `Show all ${sortedInfo.length} sections`}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("space-y-6", className)}>
        {showStats && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>
            <Badge variant="outline">
              {additionalInfo.length} sections
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedInfo.map((info) => (
            <Card key={info.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {showIcons && (
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      "bg-muted text-muted-foreground"
                    )}>
                      {getContextualIcon(info.title, info.content)}
                    </div>
                  )}
                  <CardTitle className="text-base">{info.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: info.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {hasMoreItems && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show less' : `Show all ${sortedInfo.length} sections`}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'accordion') {
    return (
      <div className={cn("space-y-4", className)}>
        {showStats && (
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {additionalInfo.length} Info Section{additionalInfo.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {displayedInfo.map((info) => (
          <Card key={info.id} className="overflow-hidden">
            <button
              onClick={() => toggleExpanded(info.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {showIcons && (
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                    "bg-muted text-muted-foreground"
                  )}>
                    {getContextualIcon(info.title, info.content)}
                  </div>
                )}
                <h4 className="font-semibold text-sm">{info.title}</h4>
              </div>
              <div className="ml-4 flex-shrink-0">
                {isExpanded(info.id) ? (
                  <span className="text-xs text-muted-foreground">Hide</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Show</span>
                )}
              </div>
            </button>
            
            {isExpanded(info.id) && (
              <CardContent className="pt-0">
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: info.content }}
                />
              </CardContent>
            )}
          </Card>
        ))}

        {hasMoreItems && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show less' : `Show all ${sortedInfo.length} sections`}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Additional Information</h3>
        </div>
        {showStats && (
          <Badge variant="outline">
            {additionalInfo.length} section{additionalInfo.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Info sections */}
      <div className="space-y-4">
        {displayedInfo.map((info, index) => (
          <Card key={info.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Section number and icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {index + 1}
                  </div>
                  {showIcons && (
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      "bg-muted text-muted-foreground"
                    )}>
                      {getContextualIcon(info.title, info.content)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-semibold text-lg mb-3",
                    getContextualColor(info.title, info.content)
                  )}>
                    {info.title}
                  </h4>
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: info.content }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show more/less button */}
      {hasMoreItems && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? 'Show less' : `Show all ${sortedInfo.length} sections`}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Event Additional Info Summary Component
 * Shows a quick overview of available additional info
 */
export function EventAdditionalInfoSummary({ 
  additionalInfo, 
  className 
}: { 
  additionalInfo: EventAdditionalInfo[]; 
  className?: string; 
}) {
  if (!additionalInfo.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Info className="h-4 w-4" />
        <span>{additionalInfo.length} info section{additionalInfo.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
