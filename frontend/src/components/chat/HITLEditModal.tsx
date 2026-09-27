import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ActionRequest, HITLDecision } from '../../types/chat';
import { Check, AlertCircle } from 'lucide-react';

interface HITLEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionRequest: ActionRequest;
  onSubmit: (decision: HITLDecision) => void;
  loading: boolean;
}

export const HITLEditModal: React.FC<HITLEditModalProps> = ({
  isOpen,
  onClose,
  actionRequest,
  onSubmit,
  loading,
}) => {
  const [toolName, setToolName] = useState<string>(actionRequest.name);
  const [argsJson, setArgsJson] = useState<string>(() =>
    JSON.stringify(actionRequest.args || {}, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);

    let parsedArgs: Record<string, any>;
    try {
      parsedArgs = JSON.parse(argsJson);
    } catch (err: any) {
      setParseError('Invalid JSON format for arguments. Please check syntax.');
      return;
    }

    onSubmit({
      type: 'edit',
      edited_action: {
        name: toolName.trim(),
        args: parsedArgs,
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tool Action (HITL)" maxWidth="600px">
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Modify the action parameters before approving execution. The agent will execute this modified version.
        </p>

        {parseError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{parseError}</span>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Tool Name
          </label>
          <input
            type="text"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Action Arguments (JSON)
          </label>
          <textarea
            value={argsJson}
            onChange={(e) => setArgsJson(e.target.value)}
            disabled={loading}
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 500,
              gap: '6px',
            }}
          >
            <Check size={16} />
            <span>{loading ? 'Submitting...' : 'Submit & Execute'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
