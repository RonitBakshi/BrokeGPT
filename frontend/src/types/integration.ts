export interface UserIntegration {
  id: number;
  integration: string;
  connected: boolean;
}

export interface SupportedIntegration {
  name: string;
  toolkit: string;
}

export interface ToolItem {
  name: string;
  description: string;
  integration: string;
  hitl_enabled: boolean;
}

export interface ToolPreference {
  id?: number;
  integration: string;
  tool_name: string;
  hitl_enabled: boolean;
}

export interface ConnectResponse {
  integration: string;
  authorization_url: string;
}
