import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AuthModal } from './components/auth/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatContainer } from './components/chat/ChatContainer';
import { IntegrationsModal } from './components/integrations/IntegrationsModal';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [integrationsOpen, setIntegrationsOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--text-secondary)',
        }}
      >
        <Loader2 size={32} className="animate-pulse" color="var(--accent)" />
        <span style={{ fontSize: '0.95rem' }}>Loading BrokeGPT...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <ChatProvider>
      <div className="app-container">
        {/* Left Sidebar */}
        <Sidebar onOpenIntegrations={() => setIntegrationsOpen(true)} />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Header onOpenIntegrations={() => setIntegrationsOpen(true)} />
          <ChatContainer />
        </div>

        {/* Integrations Modal */}
        <IntegrationsModal
          isOpen={integrationsOpen}
          onClose={() => setIntegrationsOpen(false)}
        />
      </div>
    </ChatProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
