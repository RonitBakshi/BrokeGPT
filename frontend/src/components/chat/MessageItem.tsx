import React from 'react';
import { UIMessage, HITLDecision } from '../../types/chat';
import { HITLApprovalCard } from './HITLApprovalCard';
import { Bot, User as UserIcon } from 'lucide-react';

interface MessageItemProps {
  message: UIMessage;
  onDecision: (decision: HITLDecision) => void;
  isLatest: boolean;
  disabledDecision?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onDecision,
  isLatest,
  disabledDecision = false,
}) => {
  const isUser = message.role === 'user';

  // Format simple code blocks or text
  const renderFormattedContent = (content: string) => {
    // If empty content, return null
    if (!content) return null;

    // Basic markdown code blocks parser: ```code```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const code = language ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div
            key={index}
            style={{
              margin: '12px 0',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            {language && (
              <div
                style={{
                  padding: '4px 12px',
                  backgroundColor: 'var(--bg-hover)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                {language}
              </div>
            )}
            <pre
              style={{
                margin: 0,
                padding: '12px',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}
            >
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline backticks `code`
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
          {inlineParts.map((sub, sIdx) => {
            if (sub.startsWith('`') && sub.endsWith('`')) {
              return (
                <code
                  key={sIdx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85em',
                    color: '#e0e7ff',
                  }}
                >
                  {sub.slice(1, -1)}
                </code>
              );
            }
            return sub;
          })}
        </span>
      );
    });
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '20px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          maxWidth: isUser ? '80%' : '88%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {isUser ? <UserIcon size={18} color="#ffffff" /> : <Bot size={18} color="#cbd5e1" />}
        </div>

        {/* Message bubble */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              padding: isUser ? '12px 18px' : '14px 20px',
              backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
              color: isUser ? '#ffffff' : 'var(--text-primary)',
              borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              boxShadow: 'var(--shadow-sm)',
              border: isUser ? 'none' : '1px solid var(--border-light)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            {renderFormattedContent(message.content)}
          </div>

          {/* HITL Card embedded right under the message if pending */}
          {message.pendingApproval && (
            <HITLApprovalCard
              pendingApproval={message.pendingApproval}
              onDecision={onDecision}
              disabled={disabledDecision || !isLatest}
            />
          )}
        </div>
      </div>
    </div>
  );
};
