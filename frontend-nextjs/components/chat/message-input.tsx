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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

// Popular emojis for quick access
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
  '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
  '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✍️', '💪', '🦾',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '✨', '💫', '⭐', '🌟', '✅', '❌', '❓', '❗', '💯', '🔥',
];

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
  const [emojiOpen, setEmojiOpen] = React.useState(false);

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

  const handleEmojiClick = (emoji: string) => {
    onChange(value + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={cn('border-t bg-background/95 backdrop-blur-sm p-4', className)}>
      <div className="flex items-end gap-2">
        {/* Emoji Picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || isLoading}
              className={cn(
                "h-10 w-10 rounded-full hover:bg-accent transition-colors",
                emojiOpen && "bg-accent"
              )}
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold text-foreground">Emojis</p>
              <p className="text-xs text-muted-foreground">Click an emoji to add it</p>
            </div>
            <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none rounded-2xl border-2 pr-12",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
              "placeholder:text-muted-foreground/60"
            )}
            rows={1}
          />
        </div>

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled || isLoading}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-200",
            value.trim()
              ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg scale-100"
              : "bg-muted text-muted-foreground scale-95 opacity-50"
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 px-2 flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift + Enter</kbd> for new line
          {value.length > 0 && <span className="ml-2">• {value.length} characters</span>}
        </p>
      </div>
    </div>
  );
}

