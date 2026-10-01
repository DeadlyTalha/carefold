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
