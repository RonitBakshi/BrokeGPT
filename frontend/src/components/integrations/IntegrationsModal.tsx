import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { integrationService } from '../../services/integrationService';
import { ToolItem, UserIntegration } from '../../types/integration';
import {
  Link2,
  Unlink,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Search,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'tools'>('integrations');
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState<boolean>(false);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);

  // Tools state
  const [selectedIntegrationForTools, setSelectedIntegrationForTools] = useState<string>('slack');
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loadingTools, setLoadingTools] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingTool, setUpdatingTool] = useState<string | null>(null);

  // Custom tool preference entry
  const [customToolName, setCustomToolName] = useState<string>('');
  const [addingCustomTool, setAddingCustomTool] = useState<boolean>(false);

  // Supported integrations catalog with descriptions and icons
  const supportedCatalog = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Interact with channels, send messages, search channel history, and manage notifications.',
      iconColor: '#4A154B',
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Search pages, query databases, read documentation, and append blocks or notes.',
      iconColor: '#000000',
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Manage backlog issues, transition sprint tickets, assign users, and create bugs.',
      iconColor: '#0052CC',
    },
  ];

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const data = await integrationService.getIntegrations();
      setUserIntegrations(data);
    } catch (err) {
      console.error('Failed to load user integrations:', err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const loadTools = async (integration: string) => {
    setLoadingTools(true);
    try {
      const toolList = await integrationService.getTools(integration);
      setTools(toolList);
    } catch (err) {
      console.error(`Failed to load tools for ${integration}:`, err);
      setTools([]);
    } finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadIntegrations();
      loadTools(selectedIntegrationForTools);
    }
  }, [isOpen]);

  const handleConnect = async (integrationId: string) => {
    setConnectingApp(integrationId);
    try {
      const response = await integrationService.connect(integrationId);
      if (response.authorization_url) {
        // Open authorization link in a new window/tab
        window.open(response.authorization_url, '_blank', 'width=700,height=800');
      }
    } catch (err: any) {
      alert(`Connect error: ${err.message || 'Failed to initiate authorization'}`);
    } finally {
      setConnectingApp(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setConnectingApp(integrationId);
    try {
      await integrationService.disconnect(integrationId);
      await loadIntegrations();
    } catch (err: any) {
      alert(`Disconnect error: ${err.message || 'Failed to disconnect integration'}`);
    } finally {
      setConnectingApp(null);
    }
  };

  const handleToggleHITL = async (tool: ToolItem) => {
    const newEnabled = !tool.hitl_enabled;
    setUpdatingTool(tool.name);

    // Optimistic update
    setTools((prev) =>
      prev.map((t) => (t.name === tool.name ? { ...t, hitl_enabled: newEnabled } : t))
    );

    try {
      await integrationService.updateToolHITL(tool.integration, tool.name, newEnabled);
    } catch (err: any) {
      // Revert on failure
      setTools((prev) =>
        prev.map((t) => (t.name === tool.name ? { ...t, hitl_enabled: !newEnabled } : t))
      );
      alert(`Failed to update preference: ${err.message}`);
    } finally {
      setUpdatingTool(null);
    }
  };

  const handleAddCustomTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToolName.trim()) return;

    setAddingCustomTool(true);
    const name = customToolName.trim();
    try {
      await integrationService.updateToolHITL(selectedIntegrationForTools, name, true);
      setTools((prev) => [
        {
          name,
          description: 'Custom user-configured tool preference',
          integration: selectedIntegrationForTools,
          hitl_enabled: true,
        },
        ...prev.filter((t) => t.name !== name),
      ]);
      setCustomToolName('');
    } catch (err: any) {
      alert(`Failed to configure tool: ${err.message}`);
    } finally {
      setAddingCustomTool(false);
    }
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Integrations & HITL Settings" maxWidth="720px">
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: activeTab === 'integrations' ? 'var(--text-primary)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'integrations' ? 'var(--bg-tertiary)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link2 size={16} />
          <span>Connected MCPs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: activeTab === 'tools' ? 'var(--text-primary)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'tools' ? 'var(--bg-tertiary)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Shield size={16} />
          <span>Tool HITL Preferences</span>
        </button>
      </div>

      {/* Tab 1: Connected Integrations */}
      {activeTab === 'integrations' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Connect your external workspaces to empower BrokeGPT with live MCP tools.
            </p>
            <button
              onClick={loadIntegrations}
              disabled={loadingIntegrations}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                padding: '4px 8px',
              }}
              title="Refresh status"
            >
              <RefreshCw size={14} className={loadingIntegrations ? 'animate-pulse' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {supportedCatalog.map((catalogItem) => {
            const userConn = userIntegrations.find((u) => u.integration === catalogItem.id);
            const isConnected = !!userConn?.connected;
            const isProcessing = connectingApp === catalogItem.id;

            return (
              <div
                key={catalogItem.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: catalogItem.iconColor === '#000000' ? '#ffffff' : catalogItem.iconColor,
                      flexShrink: 0,
                    }}
                  >
                    {catalogItem.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {catalogItem.name}
                      </span>
                      {isConnected ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--success)',
                            backgroundColor: 'var(--success-light)',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontWeight: 500,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Connected
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          <XCircle size={12} />
                          Not connected
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {catalogItem.description}
                    </p>
                  </div>
                </div>

                {/* Connect / Disconnect button */}
                <div>
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(catalogItem.id)}
                      disabled={isProcessing}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--danger-light)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        gap: '6px',
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-pulse" />
                      ) : (
                        <Unlink size={14} />
                      )}
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(catalogItem.id)}
                      disabled={isProcessing}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--accent)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-pulse" />
                      ) : (
                        <ExternalLink size={14} />
                      )}
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: MCP Tool HITL Preferences */}
      {activeTab === 'tools' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Choose which tools require <strong>Human-in-the-Loop (HITL)</strong> approval before execution. When HITL is enabled (default), the agent will pause and request your confirmation.
          </p>

          {/* Integration Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {supportedCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedIntegrationForTools(item.id);
                  loadTools(item.id);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  backgroundColor:
                    selectedIntegrationForTools === item.id ? 'var(--accent)' : 'var(--bg-primary)',
                  color: selectedIntegrationForTools === item.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {item.name} Tools
              </button>
            ))}
          </div>

          {/* Search Bar & Custom Tool Entry */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 10px',
              }}
            >
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name or description..."
                style={{
                  width: '100%',
                  padding: '8px 0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              onClick={() => loadTools(selectedIntegrationForTools)}
              disabled={loadingTools}
              style={{
                padding: '0 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
              title="Refresh tools"
            >
              <RefreshCw size={14} className={loadingTools ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* Add custom tool rule */}
          <form onSubmit={handleAddCustomTool} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={customToolName}
              onChange={(e) => setCustomToolName(e.target.value)}
              placeholder={`Add custom tool name for ${selectedIntegrationForTools}...`}
              style={{
                flex: 1,
                padding: '6px 12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button
              type="submit"
              disabled={addingCustomTool || !customToolName.trim()}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>Add Preference</span>
            </button>
          </form>

          {/* Tools List */}
          <div
            style={{
              maxHeight: '340px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {loadingTools ? (
              <div
                style={{
                  padding: '30px',
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
                <span>Fetching tools from MCP server...</span>
              </div>
            ) : filteredTools.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                {searchQuery
                  ? 'No matching tools found.'
                  : `No tools registered yet for ${selectedIntegrationForTools}. Connect the app or add a custom tool preference above.`}
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isToggling = updatingTool === tool.name;

                return (
                  <div
                    key={tool.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-light)',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {tool.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tool.integration}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tool.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: tool.hitl_enabled ? 'var(--warning)' : 'var(--text-muted)',
                        }}
                      >
                        {tool.hitl_enabled ? 'HITL Required' : 'Auto Execute'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleHITL(tool)}
                        disabled={isToggling}
                        style={{
                          width: '42px',
                          height: '24px',
                          backgroundColor: tool.hitl_enabled ? 'var(--accent)' : 'var(--bg-hover)',
                          borderRadius: '9999px',
                          position: 'relative',
                          padding: '2px',
                          transition: 'background-color 0.2s ease',
                          border: '1px solid var(--border)',
                        }}
                        aria-label="Toggle HITL preference"
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            transform: tool.hitl_enabled ? 'translateX(18px)' : 'translateX(0)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
