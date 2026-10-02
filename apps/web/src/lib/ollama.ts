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

import type { OllamaHealthStatus } from '../types/api.js';

export async function checkOllamaHealth(
  endpoint = 'http://127.0.0.1:11434',
  timeoutMs = 2500
): Promise<OllamaHealthStatus> {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Probe Ollama /api/tags to get installed model tags
    const res = await fetch(`${cleanEndpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { models?: Array<{ name: string }> };
      const models = (data.models || []).map((m) => m.name);
      const activeModel = models.find((m) => m.startsWith('llama3.2')) || models[0] || 'default';
      return {
        status: 'connected',
        endpoint: cleanEndpoint,
        reachable: true,
        activeModel,
        availableModels: models
      };
    }

    // Fallback: probe OpenAI compatible /v1/models
    const resV1 = await fetch(`${cleanEndpoint}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500)
    });
    if (resV1.ok) {
      const dataV1 = (await resV1.json().catch(() => ({}))) as { data?: Array<{ id: string }> };
      const models = (dataV1.data || []).map((m) => m.id);
      return {
        status: 'connected',
        endpoint: cleanEndpoint,
        reachable: true,
        activeModel: models[0] || 'default',
        availableModels: models
      };
    }

    return {
      status: 'error',
      endpoint: cleanEndpoint,
      reachable: false,
      error: `HTTP ${res.status}: ${res.statusText}`
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      status: 'unreachable',
      endpoint: cleanEndpoint,
      reachable: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Ollama not reachable'
    };
  }
}
