import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { Bot, Sparkles, AlertCircle, X, Loader2 } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const {
    messages,
    sendingMessage,
    loadingMessages,
    error,
    clearError,
    sendMessage,
    submitHITLDecision,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  const samplePrompts = [
    {
      title: 'Slack Action',
      desc: 'Send a status update message to #general channel',
      prompt: 'Please send a message to the #general channel in Slack: "Daily progress update: frontend and backend integration active."',
    },
    {
      title: 'Notion Sync',
      desc: 'Read my latest notes in Notion',
      prompt: 'Search my Notion workspace for recent notes about project architecture.',
    },
    {
      title: 'Jira Issue',
      desc: 'Create or inspect Jira tasks',
      prompt: 'List the open tasks assigned to me on Jira.',
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Error alert toast */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            maxWidth: '650px',
            width: '90%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            style={{ color: 'var(--text-secondary)', padding: '4px' }}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', flex: 1 }}>
          {loadingMessages ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              <Loader2 size={24} className="animate-pulse" />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div
              className="animate-fade-in"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Bot size={36} color="var(--accent)" />
              </div>
              <h2
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                How can I help you today?
              </h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '480px',
                  marginBottom: '32px',
                  lineHeight: 1.5,
                }}
              >
                BrokeGPT is connected with LangGraph agents and Composio MCP tools (Slack, Notion, Jira) with full Human-in-the-Loop controls.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  width: '100%',
                  maxWidth: '750px',
                }}
              >
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        marginBottom: '6px',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{item.title}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <>
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id || index}
                  message={message}
                  onDecision={submitHITLDecision}
                  isLatest={index === messages.length - 1}
                  disabledDecision={sendingMessage}
                />
              ))}

              {/* Agent Thinking indicator */}
              {sendingMessage && (
                <div
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 18px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px 18px 18px 18px',
                    width: 'fit-content',
                    marginBottom: '16px',
                  }}
                >
                  <Bot size={18} color="var(--accent)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Agent is working...
                    </span>
                    <Loader2 size={14} className="animate-pulse" color="var(--accent)" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={sendMessage} disabled={sendingMessage} />
    </div>
  );
};
