/**
 * Event Highlights Showcase Component
 * 
 * Displays event highlights in a beautiful showcase format.
 * Supports images, rich content, and responsive grid layouts.
 */

'use client';

import React, { useState } from 'react';
import { Star, Image as ImageIcon, ExternalLink, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EventHighlight } from '@/lib/api/types/events';

interface EventHighlightsShowcaseProps {
  highlights: EventHighlight[];
  className?: string;
  showImages?: boolean;
  showStats?: boolean;
  variant?: 'default' | 'grid' | 'list' | 'carousel';
  maxItems?: number;
}

/**
 * Event Highlights Showcase Component
 * 
 * @param highlights - Array of highlight items from the backend
 * @param className - Additional CSS classes
 * @param showImages - Whether to display highlight images
 * @param showStats - Whether to show highlight statistics
 * @param variant - Display variant (default, grid, list, carousel)
 * @param maxItems - Maximum number of items to display
 */
export function EventHighlightsShowcase({
  highlights,
  className,
  showImages = true,
  showStats = true,
  variant = 'default',
  maxItems
}: EventHighlightsShowcaseProps) {
  // Safety check for undefined/null highlights
  const safeHighlights = Array.isArray(highlights) ? highlights : [];

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Sort highlights by orderIndex
  const sortedHighlights = [...safeHighlights].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Limit items if maxItems is specified
  const displayedHighlights = maxItems && !showAll 
    ? sortedHighlights.slice(0, maxItems)
    : sortedHighlights;

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
  const hasMoreItems = maxItems && sortedHighlights.length > maxItems;

  if (!highlights.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No highlights available for this event.</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-4", className)}>
        {showStats && (
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {highlights.length} Highlight{highlights.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {displayedHighlights.map((highlight) => (
          <Card key={highlight.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                  {showImages && highlight.imageUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={highlight.imageUrl}
                        alt={highlight.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base mb-1">{highlight.title}</h4>
                  <div 
                    className={cn(
                      "text-sm text-muted-foreground",
                      !isExpanded(highlight.id) && "line-clamp-2"
                    )}
                    dangerouslySetInnerHTML={{ 
                      __html: isExpanded(highlight.id) 
                        ? highlight.content 
                        : highlight.content.substring(0, 150) + (highlight.content.length > 150 ? '...' : '')
                    }}
                  />
                  
                  {highlight.content.length > 150 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(highlight.id)}
                      className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
                    >
                      {isExpanded(highlight.id) ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}
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
              {showAll ? 'Show less' : `Show all ${sortedHighlights.length} highlights`}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className={cn("space-y-4", className)}>
        {showStats && (
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {highlights.length} Highlight{highlights.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedHighlights.map((highlight) => (
            <Card key={highlight.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {showImages && highlight.imageUrl && (
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={highlight.imageUrl}
                    alt={highlight.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{highlight.title}</h4>
                <div 
                  className="text-xs text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: highlight.content }}
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
              {showAll ? 'Show less' : `Show all ${sortedHighlights.length} highlights`}
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
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Event Highlights</h3>
            </div>
            <Badge variant="outline">
              {highlights.length} items
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedHighlights.map((highlight) => (
            <Card key={highlight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {showImages && highlight.imageUrl && (
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={highlight.imageUrl}
                    alt={highlight.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      <Star className="h-3 w-3 mr-1" />
                      Highlight
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-lg">{highlight.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: highlight.content }}
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
              {showAll ? 'Show less' : `Show all ${sortedHighlights.length} highlights`}
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
          <Star className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Event Highlights</h3>
        </div>
        {showStats && (
          <Badge variant="outline">
            {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Highlights */}
      <div className="space-y-4">
        {displayedHighlights.map((highlight, index) => (
          <Card key={highlight.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Highlight number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4">
                    {showImages && highlight.imageUrl && (
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={highlight.imageUrl}
                          alt={highlight.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-2">{highlight.title}</h4>
                      <div 
                        className={cn(
                          "prose prose-sm max-w-none text-muted-foreground",
                          !isExpanded(highlight.id) && "line-clamp-3"
                        )}
                        dangerouslySetInnerHTML={{ 
                          __html: isExpanded(highlight.id) 
                            ? highlight.content 
                            : highlight.content.substring(0, 200) + (highlight.content.length > 200 ? '...' : '')
                        }}
                      />
                      
                      {highlight.content.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(highlight.id)}
                          className="mt-2 h-auto p-0 text-primary hover:text-primary/80"
                        >
                          {isExpanded(highlight.id) ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Show more
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
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
            {showAll ? 'Show less' : `Show all ${sortedHighlights.length} highlights`}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Event Highlights Summary Component
 * Shows a quick overview of available highlights
 */
export function EventHighlightsSummary({ 
  highlights, 
  className 
}: { 
  highlights: EventHighlight[]; 
  className?: string; 
}) {
  if (!highlights.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4" />
        <span>{highlights.length} highlight{highlights.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
