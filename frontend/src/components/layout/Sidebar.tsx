import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  Bot,
  Loader2,
  Check,
  X,
} from 'lucide-react';

interface SidebarProps {
  onOpenIntegrations: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenIntegrations }) => {
  const { user, logout } = useAuth();
  const {
    threads,
    activeThread,
    selectThread,
    createThread,
    deleteThread,
    loadingThreads,
    sendingMessage,
  } = useChat();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateNew = async () => {
    if (sendingMessage) return;
    await createThread('New conversation');
  };

  const handleDeleteConfirm = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    await deleteThread(threadId);
    setDeletingId(null);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setDeletingId(threadId);
  };

  return (
    <aside
      style={{
        width: '280px',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* App Branding & Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--accent)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Bot size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            BrokeGPT
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Agent Platform
          </span>
        </div>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: '16px' }}>
        <button
          type="button"
          onClick={handleCreateNew}
          disabled={sendingMessage}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Plus size={16} color="var(--accent)" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Thread List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '8px 8px 4px',
          }}
        >
          Recent Conversations
        </div>

        {loadingThreads ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Loader2 size={16} className="animate-pulse" />
            <span>Loading...</span>
          </div>
        ) : threads.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            No conversations yet. Start a new chat!
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = activeThread?.id === thread.id;
            const isDeleting = deletingId === thread.id;

            return (
              <div
                key={thread.id}
                onClick={() => !isDeleting && selectThread(thread.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'background-color 0.15s ease',
                  fontSize: '0.875rem',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    flex: 1,
                  }}
                >
                  <MessageSquare
                    size={16}
                    color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {thread.title || 'New conversation'}
                  </span>
                </div>

                {/* Delete / Confirm actions */}
                {isDeleting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConfirm(e, thread.id)}
                      style={{
                        padding: '4px',
                        color: 'var(--danger)',
                        borderRadius: '4px',
                      }}
                      title="Confirm delete"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      style={{
                        padding: '4px',
                        color: 'var(--text-muted)',
                        borderRadius: '4px',
                      }}
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, thread.id)}
                    style={{
                      padding: '4px',
                      color: 'var(--text-muted)',
                      borderRadius: '4px',
                      opacity: isActive ? 1 : 0.6,
                      transition: 'opacity 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Delete thread"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Profile & Integrations Section */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={onOpenIntegrations}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            transition: 'color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
        >
          <Settings size={16} />
          <span>Integrations & HITL Tools</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 4px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              padding: '6px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
