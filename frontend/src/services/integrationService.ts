import { request } from './api';
import {
  ConnectResponse,
  SupportedIntegration,
  ToolItem,
  ToolPreference,
  UserIntegration,
} from '../types/integration';

export const integrationService = {
  async getIntegrations(): Promise<UserIntegration[]> {
    return request<UserIntegration[]>('/integrations/', {
      method: 'GET',
    });
  },

  async getSupported(): Promise<SupportedIntegration[]> {
    return request<SupportedIntegration[]>('/integrations/supported', {
      method: 'GET',
    });
  },

  async connect(integration: string): Promise<ConnectResponse> {
    return request<ConnectResponse>(`/integrations/${integration}/connect`, {
      method: 'POST',
    });
  },

  async disconnect(integration: string): Promise<{ integration: string; connected: boolean }> {
    return request<{ integration: string; connected: boolean }>(
      `/integrations/${integration}/disconnect`,
      {
        method: 'POST',
      }
    );
  },

  async getTools(integration: string): Promise<ToolItem[]> {
    return request<ToolItem[]>(`/integrations/${integration}/tools`, {
      method: 'GET',
    });
  },

  async getPreferences(): Promise<ToolPreference[]> {
    return request<ToolPreference[]>('/integrations/preferences', {
      method: 'GET',
    });
  },

  async updateToolHITL(
    integration: string,
    toolName: string,
    enabled: boolean
  ): Promise<{ integration: string; tool_name: string; hitl_enabled: boolean }> {
    return request<{ integration: string; tool_name: string; hitl_enabled: boolean }>(
      `/integrations/${integration}/tools/${toolName}/hitl`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      }
    );
  },
};
