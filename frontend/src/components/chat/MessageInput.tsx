import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled,
  placeholder = 'Message BrokeGPT... (Shift+Enter for newline)',
}) => {
  const [content, setContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || disabled) return;

    onSendMessage(content.trim());
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        padding: '16px 24px 20px',
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          maxWidth: '850px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 12px 8px 16px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            resize: 'none',
            maxHeight: '180px',
            padding: '6px 0',
          }}
        />

        <button
          type="submit"
          disabled={disabled || !content.trim()}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: content.trim() && !disabled ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: '#ffffff',
            flexShrink: 0,
            transition: 'background-color 0.15s ease',
          }}
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 size={18} className="animate-pulse" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
      <div
        style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        BrokeGPT agents execute actions with Composio MCP tools. Actions may require your confirmation.
      </div>
    </div>
  );
};
