/**
 * Event FAQ Accordion Component
 * 
 * Displays event FAQ items in an interactive accordion format.
 * Supports search, filtering, and accessibility features.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EventFaq } from '@/lib/api/types/events';

interface EventFAQAccordionProps {
  faqs: EventFaq[];
  className?: string;
  showSearch?: boolean;
  showStats?: boolean;
  defaultOpen?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

/**
 * Event FAQ Accordion Component
 * 
 * @param faqs - Array of FAQ items from the backend
 * @param className - Additional CSS classes
 * @param showSearch - Whether to show search functionality
 * @param showStats - Whether to show FAQ statistics
 * @param defaultOpen - Whether to open all items by default
 * @param variant - Display variant (default, compact, minimal)
 */
export function EventFAQAccordion({
  faqs,
  className,
  showSearch = true,
  showStats = true,
  defaultOpen = false,
  variant = 'default'
}: EventFAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpen ? new Set(faqs.map(faq => faq.id)) : new Set()
  );

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    
    const query = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  // Get FAQ statistics
  const stats = useMemo(() => {
    const total = faqs.length;
    const filtered = filteredFaqs.length;
    const open = openItems.size;
    
    return { total, filtered, open };
  }, [faqs.length, filteredFaqs.length, openItems.size]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (openItems.size === filteredFaqs.length) {
      setOpenItems(new Set());
    } else {
      setOpenItems(new Set(filteredFaqs.map(faq => faq.id)));
    }
  };

  if (!faqs.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No frequently asked questions available for this event.</p>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("space-y-2", className)}>
        {filteredFaqs.map((faq) => (
          <div key={faq.id} className="border rounded-lg">
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm">{faq.question}</span>
              {openItems.has(faq.id) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {openItems.has(faq.id) && (
              <div className="px-3 pb-3">
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {filteredFaqs.map((faq) => (
          <Card key={faq.id} className="overflow-hidden">
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{faq.question}</h4>
                {openItems.has(faq.id) && (
                  <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                {openItems.has(faq.id) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </Card>
        ))}

        {filteredFaqs.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No FAQs found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with search and stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
          </div>
          {showStats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {stats.filtered} of {stats.total}
              </Badge>
              {stats.open > 0 && (
                <Badge variant="secondary">
                  {stats.open} open
                </Badge>
              )}
            </div>
          )}
        </div>

        {showSearch && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="whitespace-nowrap"
            >
              {openItems.size === filteredFaqs.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <Card key={faq.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left flex items-center justify-between hover:bg-muted/50 -m-6 p-6 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {faq.question}
                    </CardTitle>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.has(faq.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CardHeader>
            
            {openItems.has(faq.id) && (
              <CardContent className="pt-0">
                <div className="pl-9">
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredFaqs.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">No FAQs found</h4>
          <p className="text-muted-foreground">
            No frequently asked questions match your search for "{searchQuery}".
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
            className="mt-4"
          >
            Clear search
          </Button>
        </div>
      )}

      {/* Empty state */}
      {filteredFaqs.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">No FAQs available</h4>
          <p className="text-muted-foreground">
            There are no frequently asked questions for this event yet.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Event FAQ Summary Component
 * Shows a quick overview of available FAQs
 */
export function EventFAQSummary({ 
  faqs, 
  className 
}: { 
  faqs: EventFaq[]; 
  className?: string; 
}) {
  if (!faqs.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <HelpCircle className="h-4 w-4" />
        <span>{faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} available</span>
      </div>
    </div>
  );
}
