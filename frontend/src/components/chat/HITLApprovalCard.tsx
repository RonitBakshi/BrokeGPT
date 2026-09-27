import React, { useState } from 'react';
import { ActionRequest, HITLDecision, PendingApproval } from '../../types/chat';
import { HITLEditModal } from './HITLEditModal';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Terminal,
  ChevronDown,
  ChevronRight,
  Send,
} from 'lucide-react';

interface HITLApprovalCardProps {
  pendingApproval: PendingApproval;
  onDecision: (decision: HITLDecision) => void;
  disabled?: boolean;
}

export const HITLApprovalCard: React.FC<HITLApprovalCardProps> = ({
  pendingApproval,
  onDecision,
  disabled = false,
}) => {
  const [rejecting, setRejecting] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [editingRequest, setEditingRequest] = useState<ActionRequest | null>(null);
  const [expandedArgs, setExpandedArgs] = useState<boolean>(true);

  const actionRequest = pendingApproval.action_requests?.[0];

  if (!actionRequest) return null;

  const handleApprove = () => {
    onDecision({
      type: 'approve',
    });
  };

  const handleRejectConfirm = () => {
    onDecision({
      type: 'reject',
      message: rejectReason.trim() || undefined,
    });
    setRejecting(false);
  };

  const handleEditSubmit = (decision: HITLDecision) => {
    setEditingRequest(null);
    onDecision(decision);
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        marginTop: '12px',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--warning-light)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--warning)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--warning)' }}>
            Human Approval Required (HITL)
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '9999px',
            color: 'var(--warning)',
            fontWeight: 500,
          }}
        >
          Action Intercepted
        </span>
      </div>

      {/* Action Details */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tool:</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            <Terminal size={14} />
            <span>{actionRequest.name}</span>
          </div>
        </div>

        {/* Arguments Accordion */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setExpandedArgs(!expandedArgs)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              padding: 0,
            }}
          >
            {expandedArgs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Parameters & Arguments</span>
          </button>

          {expandedArgs && (
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                maxHeight: '220px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(actionRequest.args || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Rejection reason input form if rejecting */}
        {rejecting ? (
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--danger)',
              marginBottom: '16px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#fca5a5',
                marginBottom: '6px',
                fontWeight: 500,
              }}
            >
              Rejection Reason (optional, helps the agent adapt):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Do not send this message yet / incorrect channel"
                disabled={disabled}
                autoFocus
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRejectConfirm();
                }}
              />
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={disabled}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  gap: '4px',
                }}
              >
                <Send size={14} />
                <span>Confirm Reject</span>
              </button>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                disabled={disabled}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '6px',
            }}
          >
            {/* Approve Button */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '9px 16px',
                backgroundColor: 'var(--success)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Approve</span>
            </button>

            {/* Edit Action Button */}
            <button
              type="button"
              onClick={() => setEditingRequest(actionRequest)}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '9px 16px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                gap: '6px',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Edit3 size={16} />
              <span>Edit Action</span>
            </button>

            {/* Reject Button */}
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '110px',
                padding: '9px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                gap: '6px',
              }}
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <HITLEditModal
          isOpen={true}
          onClose={() => setEditingRequest(null)}
          actionRequest={editingRequest}
          onSubmit={handleEditSubmit}
          loading={disabled}
        />
      )}
    </div>
  );
};
