import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenIntegrations: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenIntegrations }) => {
  const { activeThread } = useChat();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {activeThread?.title || 'New Conversation'}
        </h2>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            backgroundColor: 'var(--success-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '9999px',
            color: 'var(--success)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <ShieldCheck size={12} />
          <span>HITL Guard Active</span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onOpenIntegrations}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <SlidersHorizontal size={14} color="var(--accent)" />
          <span>Integrations & Tools</span>
        </button>
      </div>
    </header>
  );
};
