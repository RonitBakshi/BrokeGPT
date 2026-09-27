export interface ActionRequest {
  name: string;
  args: Record<string, any>;
  id?: string;
}

export interface ReviewConfig {
  allowed_decisions?: string[];
  [key: string]: any;
}

export interface PendingApproval {
  action_requests: ActionRequest[];
  review_configs: ReviewConfig[];
}

export interface HITLDecision {
  type: 'approve' | 'reject' | 'edit' | 'respond';
  message?: string;
  edited_action?: {
    name: string;
    args: Record<string, any>;
  } | Record<string, any>;
}

export interface ChatRequest {
  message?: string;
  decision?: HITLDecision;
}

export interface ChatCompletedResponse {
  status: 'completed';
  thread_id: string;
  response: string;
}

export interface ChatApprovalRequiredResponse {
  status: 'approval_required';
  thread_id: string;
  action_requests: ActionRequest[];
  review_configs: ReviewConfig[];
}

export type ChatResponse = ChatCompletedResponse | ChatApprovalRequiredResponse;

export interface ChatHistoryResponse {
  thread_id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: any;
    name?: string;
  }>;
  pending_approval?: PendingApproval | null;
}

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pendingApproval?: PendingApproval;
  toolCalls?: any;
  error?: boolean;
}
