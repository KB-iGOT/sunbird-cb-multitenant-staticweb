import { environment } from 'src/environments/environment';
import { resolveJagoChatbot } from './chatbot.config';

describe('resolveJagoChatbot', () => {
  it.each([
    ['"true"', true, 'true'],
    ['" TRUE "', true, ' TRUE '],
    ['true', true, true],
    ['"false"', false, 'false'],
    ['false', false, false],
    ['an empty string', false, ''],
    ['an unexpected value', false, 'yes'],
    ['not set', false, undefined],
  ])('treats enabled set to %s as %s', (_label, expected, enabled) => {
    expect(resolveJagoChatbot({ jagochatbot: { enabled } } as any).enabled).toBe(expected);
  });

  it('is disabled without a configuration or a jagochatbot block', () => {
    expect(resolveJagoChatbot(null).enabled).toBe(false);
    expect(resolveJagoChatbot(undefined).enabled).toBe(false);
    expect(resolveJagoChatbot({}).enabled).toBe(false);
  });

  it('uses the api url and key from the form configuration', () => {
    const chatbot = resolveJagoChatbot({
      jagochatbot: { enabled: 'true', apiUrl: 'https://chat.example.com/api/v1', apiKey: 'tenant-key' },
    });

    expect(chatbot.apiUrl).toBe('https://chat.example.com/api/v1');
    expect(chatbot.apiKey).toBe('tenant-key');
  });

  it('falls back to the environment for a missing api url or key', () => {
    const chatbot = resolveJagoChatbot({ jagochatbot: { enabled: 'true' } });

    expect(chatbot.apiUrl).toBe(environment.chatbotApiUrl);
    expect(chatbot.apiKey).toBe(environment.chatbotApiKey);
  });
});
