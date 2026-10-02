/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Carefold User Settings & Model Configuration
 * 
 * Local-first settings management for model providers, API credentials,
 * and custom endpoints. Persisted in browser localStorage under 'carefold_user_settings_v1'.
 */

export type ProviderType = 'ollama' | 'google' | 'anthropic' | 'openai' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
  recommended?: boolean;
  description?: string;
}

export interface ProviderMeta {
  id: ProviderType;
  label: string;
  badge: string;
  requiresKey: boolean;
  keyUrl?: string;
  defaultModel: string;
  description: string;
}

export const PROVIDER_METADATA: Record<ProviderType, ProviderMeta> = {
  ollama: {
    id: 'ollama',
    label: 'Ollama',
    badge: '💻 Local',
    requiresKey: false,
    defaultModel: 'llama3.2',
    description: 'Local OpenAI-compatible runner (Zero API keys)'
  },
  google: {
    id: 'google',
    label: 'Gemini',
    badge: '✨ Google',
    requiresKey: true,
    keyUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-2.0-flash',
    description: 'Google Gemini models via langchain-google-genai'
  },
  anthropic: {
    id: 'anthropic',
    label: 'Claude',
    badge: '🧠 Anthropic',
    requiresKey: true,
    keyUrl: 'https://console.anthropic.com/',
    defaultModel: 'claude-3-5-sonnet-latest',
    description: 'Anthropic Claude models via langchain-anthropic'
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    badge: '⚡ OpenAI',
    requiresKey: true,
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o',
    description: 'OpenAI GPT models via langchain-openai'
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    badge: '🌐 Endpoint',
    requiresKey: false,
    defaultModel: 'custom',
    description: 'Custom OpenAI-compatible endpoint (LM Studio, vLLM, LocalAI)'
  }
};

export const PREDEFINED_MODELS: Record<ProviderType, ModelOption[]> = {
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2 (Default)', recommended: true, description: 'Meta lightweight state-of-the-art model' },
    { id: 'llama3.1', name: 'Llama 3.1 8B', description: 'Meta general-purpose reasoning model' }
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fastest)', recommended: true, description: 'Next-gen multimodal high-speed model' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Long-context complex reasoning model' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast, lightweight multimodal model' }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet (Recommended)', recommended: true, description: 'Industry-leading intelligence and coding' },
    { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku (Fast)', description: 'Ultra-fast, responsive assistant' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Deep reasoning for complex inquiries' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Omni)', recommended: true, description: 'Flagship omni-model for chat and reasoning' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)', description: 'Affordable, low-latency intelligent model' },
    { id: 'o1-mini', name: 'o1-mini (Reasoning)', description: 'Specialized STEM and step-by-step reasoning' }
  ],
  custom: [
    { id: 'custom', name: 'Custom Model...', recommended: true, description: 'Specify any model identifier hosted by your endpoint' }
  ]
};

export interface CarefoldUserSettings {
  provider: ProviderType;
  model: string;
  customModelName: string;
  keys: {
    google?: string;
    anthropic?: string;
    openai?: string;
    custom?: string;
  };
  endpoints: {
    ollamaUrl: string;
    customUrl: string;
  };
}

export const CAREFOLD_SETTINGS_STORAGE_KEY = 'carefold_user_settings_v1';

export const DEFAULT_USER_SETTINGS: CarefoldUserSettings = {
  provider: 'ollama',
  model: 'llama3.2',
  customModelName: '',
  keys: {
    google: '',
    anthropic: '',
    openai: '',
    custom: ''
  },
  endpoints: {
    ollamaUrl: 'http://127.0.0.1:11434',
    customUrl: 'http://127.0.0.1:8000/v1'
  }
};

/**
 * Safely loads user settings from browser localStorage.
 * Returns default settings if running on server or if stored data is invalid.
 */
export function loadSettings(): CarefoldUserSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_USER_SETTINGS };
  }

  try {
    const raw = window.localStorage.getItem(CAREFOLD_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_USER_SETTINGS };
    }

    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || DEFAULT_USER_SETTINGS.provider,
      model: parsed.model || DEFAULT_USER_SETTINGS.model,
      customModelName: parsed.customModelName ?? DEFAULT_USER_SETTINGS.customModelName,
      keys: {
        google: parsed.keys?.google ?? '',
        anthropic: parsed.keys?.anthropic ?? '',
        openai: parsed.keys?.openai ?? '',
        custom: parsed.keys?.custom ?? ''
      },
      endpoints: {
        ollamaUrl: parsed.endpoints?.ollamaUrl || DEFAULT_USER_SETTINGS.endpoints.ollamaUrl,
        customUrl: parsed.endpoints?.customUrl || DEFAULT_USER_SETTINGS.endpoints.customUrl
      }
    };
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

/**
 * Saves updated user settings to browser localStorage and dispatches a change event.
 */
export function saveSettings(partialSettings: Partial<CarefoldUserSettings>): CarefoldUserSettings {
  const current = loadSettings();
  const updated: CarefoldUserSettings = {
    ...current,
    ...partialSettings,
    keys: {
      ...current.keys,
      ...(partialSettings.keys || {})
    },
    endpoints: {
      ...current.endpoints,
      ...(partialSettings.endpoints || {})
    }
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CAREFOLD_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('carefold:settings-changed', { detail: updated }));
    } catch (err) {
      console.error('Failed to save Carefold settings to localStorage:', err);
    }
  }

  return updated;
}

/**
 * Checks whether the required API key exists for a given provider.
 * Ollama and Custom endpoints do not strictly require API keys.
 */
export function hasApiKeyForProvider(settings: CarefoldUserSettings, provider: ProviderType): boolean {
  if (provider === 'ollama' || provider === 'custom') {
    return true;
  }
  const key = settings.keys[provider];
  return Boolean(key && key.trim().length > 0);
}

/**
 * Retrieves the API key for the specified provider, or undefined if not present.
 */
export function getApiKeyForProvider(settings: CarefoldUserSettings, provider: ProviderType): string | undefined {
  if (provider === 'ollama') return undefined;
  const key = settings.keys[provider];
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

/**
 * Returns the effective model string to be transmitted in the chat request.
 */
export function getEffectiveModel(settings: CarefoldUserSettings): string {
  if (settings.provider === 'custom' || settings.model === 'custom') {
    return settings.customModelName.trim() || 'custom';
  }
  return settings.model || PROVIDER_METADATA[settings.provider]?.defaultModel || 'llama3.2';
}

/**
 * Returns the appropriate base URL endpoint for the selected provider.
 */
export function getEndpointForProvider(settings: CarefoldUserSettings, provider: ProviderType): string | undefined {
  if (provider === 'ollama') {
    return settings.endpoints.ollamaUrl?.trim() || 'http://127.0.0.1:11434';
  }
  if (provider === 'custom') {
    return settings.endpoints.customUrl?.trim() || 'http://127.0.0.1:8000/v1';
  }
  return undefined;
}
