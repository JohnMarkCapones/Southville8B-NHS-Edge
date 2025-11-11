/**
 * Message Input Component
 * 
 * Input field for sending messages with send button.
 * 
 * @module components/chat/message-input
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onAttachmentClick?: () => void;
  onImageClick?: () => void;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  className,
  onAttachmentClick,
  onImageClick,
}: MessageInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled && !isLoading) {
      onSend();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={cn('border-t p-4', className)}>
      <div className="flex items-end gap-2">
        {/* Attachment Buttons */}
        {(onAttachmentClick || onImageClick) && (
          <div className="flex gap-1">
            {onImageClick && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onImageClick}
                disabled={disabled || isLoading}
                className="h-9 w-9"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            )}
            {onAttachmentClick && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onAttachmentClick}
                disabled={disabled || isLoading}
                className="h-9 w-9"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled || isLoading}
          size="icon"
          className="h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

