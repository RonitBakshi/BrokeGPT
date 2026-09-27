import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Thread } from '../types/thread';
import { HITLDecision, PendingApproval, UIMessage } from '../types/chat';
import { threadService } from '../services/threadService';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  threads: Thread[];
  activeThread: Thread | null;
  messages: UIMessage[];
  loadingThreads: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;
  pendingApproval: PendingApproval | null;
  selectThread: (threadId: string) => Promise<void>;
  createThread: (title?: string) => Promise<Thread | null>;
  deleteThread: (threadId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  submitHITLDecision: (decision: HITLDecision) => Promise<void>;
  clearError: () => void;
  refreshThreads: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);

  const clearError = () => setError(null);

  // Load user threads
  const loadThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setActiveThread(null);
      setMessages([]);
      return;
    }

    setLoadingThreads(true);
    try {
      const userThreads = await threadService.getThreads();
      // Sort newest first
      const sorted = [...userThreads].sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setThreads(sorted);

      if (sorted.length > 0 && !activeThread) {
        // Select the first thread
        await selectThreadInternal(sorted[0]);
      } else if (sorted.length === 0) {
        setActiveThread(null);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to load threads:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoadingThreads(false);
    }
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Internal select helper
  const selectThreadInternal = async (thread: Thread) => {
    setActiveThread(thread);
    setPendingApproval(null);
    setError(null);
    setLoadingMessages(true);

    try {
      const history = await chatService.getChatHistory(thread.id);
      
      const loadedMessages: UIMessage[] = history.messages
        .filter((m) => m.content && typeof m.content === 'string' && m.content.trim().length > 0)
        .map((m, idx) => ({
          id: `${thread.id}-${idx}`,
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content.trim(),
          timestamp: new Date().toISOString(),
        }));

      // Check if there is an interrupt pending for this thread
      if (history.pending_approval) {
        setPendingApproval(history.pending_approval);
        // Add pending approval to the last assistant message or as a new card
        if (loadedMessages.length > 0 && loadedMessages[loadedMessages.length - 1].role === 'assistant') {
          loadedMessages[loadedMessages.length - 1].pendingApproval = history.pending_approval;
        } else {
          loadedMessages.push({
            id: `${thread.id}-pending-hitl`,
            role: 'assistant',
            content: 'The agent is requesting your approval for a tool action:',
            timestamp: new Date().toISOString(),
            pendingApproval: history.pending_approval,
          });
        }
      }

      setMessages(loadedMessages);
    } catch (err: any) {
      console.error('Failed to load thread history:', err);
      // Fallback: empty messages
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectThread = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      await selectThreadInternal(thread);
    }
  };

  const createThread = async (title: string = 'New conversation'): Promise<Thread | null> => {
    setError(null);
    try {
      const newThread = await threadService.createThread(title);
      const fullThread: Thread = {
        id: newThread.id,
        title: newThread.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setThreads((prev) => [fullThread, ...prev]);
      setActiveThread(fullThread);
      setMessages([]);
      setPendingApproval(null);
      return fullThread;
    } catch (err: any) {
      console.error('Failed to create thread:', err);
      setError(err.message || 'Failed to create conversation');
      return null;
    }
  };

  const deleteThread = async (threadId: string) => {
    setError(null);
    try {
      await threadService.deleteThread(threadId);
      const updatedThreads = threads.filter((t) => t.id !== threadId);
      setThreads(updatedThreads);

      if (activeThread?.id === threadId) {
        if (updatedThreads.length > 0) {
          await selectThreadInternal(updatedThreads[0]);
        } else {
          setActiveThread(null);
          setMessages([]);
          setPendingApproval(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete thread:', err);
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let targetThread = activeThread;
    if (!targetThread) {
      targetThread = await createThread(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
      if (!targetThread) return;
    }

    const userMessage: UIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSendingMessage(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(targetThread.id, content.trim());

      if (response.status === 'completed') {
        const assistantMessage: UIMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setPendingApproval(null);
      } else if (response.status === 'approval_required') {
        const pending: PendingApproval = {
          action_requests: response.action_requests,
          review_configs: response.review_configs,
        };
        setPendingApproval(pending);

        const approvalMessage: UIMessage = {
          id: `msg-${Date.now()}-hitl`,
          role: 'assistant',
          content: 'The agent is requesting approval to execute the following tool action:',
          timestamp: new Date().toISOString(),
          pendingApproval: pending,
        };
        setMessages((prev) => [...prev, approvalMessage]);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to get response from agent');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Failed to get response'}`,
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const submitHITLDecision = async (decision: HITLDecision) => {
    if (!activeThread) return;

    setSendingMessage(true);
    setError(null);

    try {
      const response = await chatService.sendDecision(activeThread.id, decision);

      // Clear pending approval on previous message
      setMessages((prev) =>
        prev.map((msg) => (msg.pendingApproval ? { ...msg, pendingApproval: undefined } : msg))
      );
      setPendingApproval(null);

      if (response.status === 'completed') {
        const assistantMessage: UIMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (response.status === 'approval_required') {
        const nextPending: PendingApproval = {
          action_requests: response.action_requests,
          review_configs: response.review_configs,
        };
        setPendingApproval(nextPending);

        const nextApprovalMessage: UIMessage = {
          id: `msg-${Date.now()}-hitl`,
          role: 'assistant',
          content: 'The agent is requesting approval for the next tool action:',
          timestamp: new Date().toISOString(),
          pendingApproval: nextPending,
        };
        setMessages((prev) => [...prev, nextApprovalMessage]);
      }
    } catch (err: any) {
      console.error('Error submitting HITL decision:', err);
      setError(err.message || 'Failed to submit approval decision');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        activeThread,
        messages,
        loadingThreads,
        loadingMessages,
        sendingMessage,
        error,
        pendingApproval,
        selectThread,
        createThread,
        deleteThread,
        sendMessage,
        submitHITLDecision,
        clearError,
        refreshThreads: loadThreads,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
