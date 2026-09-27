import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UIMessage, HITLDecision } from '../../types/chat';
import { HITLApprovalCard } from './HITLApprovalCard';
import { Bot, User as UserIcon, Check, Copy } from 'lucide-react';

interface MessageItemProps {
  message: UIMessage;
  onDecision: (decision: HITLDecision) => void;
  isLatest: boolean;
  disabledDecision?: boolean;
}

const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      style={{
        margin: '14px 0',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid var(--border-light)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
        }}
      >
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: copied ? 'var(--success)' : 'var(--text-secondary)',
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
          title="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '14px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#e2e8f0',
          lineHeight: 1.55,
        }}
      >
        <code>{value}</code>
      </pre>
    </div>
  );
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onDecision,
  isLatest,
  disabledDecision = false,
}) => {
  const isUser = message.role === 'user';

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '22px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          maxWidth: isUser ? '82%' : '90%',
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
              padding: isUser ? '12px 18px' : '16px 20px',
              backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
              color: isUser ? '#ffffff' : 'var(--text-primary)',
              borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              boxShadow: 'var(--shadow-sm)',
              border: isUser ? 'none' : '1px solid var(--border-light)',
            }}
          >
            {isUser ? (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: '0.95rem' }}>
                {message.content}
              </div>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');

                      // Check if it's an inline code vs block code
                      const isInline = !className && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85em',
                              color: '#e0e7ff',
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return <CodeBlock language={match ? match[1] : undefined} value={codeString} />;
                    },
                    a({ href, children }) {
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      );
                    },
                    table({ children }) {
                      return (
                        <div style={{ overflowX: 'auto', margin: '14px 0' }}>
                          <table>{children}</table>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
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
