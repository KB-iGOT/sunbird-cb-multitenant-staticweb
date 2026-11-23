import { environment } from 'src/environments/environment';
import { ResolvedJagoChatbot, TenantConfig, TenantJagoChatbot } from '../models/tenant.interface';

/**
 * Jago chatbot settings for a tenant, from the `jagochatbot` block of the form configuration.
 * The chatbot stays off unless `enabled` is true. The form stores the flag as a string, so it is
 * compared as text: "false" (or any other value) keeps the chatbot off.
 * The api url and key fall back to the environment (assets/env.json).
 */
export function resolveJagoChatbot(config: Partial<TenantConfig> | null | undefined): ResolvedJagoChatbot {
  const chatbot: TenantJagoChatbot = (config && config.jagochatbot) || {};
  return {
    enabled: String(chatbot.enabled).trim().toLowerCase() === 'true',
    apiUrl: chatbot.apiUrl || environment.chatbotApiUrl || '',
    apiKey: chatbot.apiKey || environment.chatbotApiKey || '',
  };
}
