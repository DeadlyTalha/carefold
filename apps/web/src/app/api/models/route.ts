import { NextRequest, NextResponse } from 'next/server';
import { findWorkspaceRoot, loadWorkspaceConfig } from '@/lib/workspace';
import { PREDEFINED_MODELS, type ModelOption, type ProviderType } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OllamaTagModel {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
  capabilities?: string[];
}

function isEmbeddingModel(m: OllamaTagModel): boolean {
  const name = (m.name || '').toLowerCase();
  if (name.includes('embed') || name.includes('embedding')) {
    return true;
  }
  if (m.capabilities && m.capabilities.length > 0) {
    if (m.capabilities.includes('embedding') && !m.capabilities.includes('completion')) {
      return true;
    }
  }
  return false;
}

function formatModelLabel(name: string, details?: OllamaTagModel['details']): string {
  const colonIdx = name.lastIndexOf(':');
  const baseName = colonIdx !== -1 ? name.slice(0, colonIdx) : name;
  const tag = colonIdx !== -1 ? name.slice(colonIdx + 1) : '';

  const slashIdx = baseName.lastIndexOf('/');
  const shortBase = slashIdx !== -1 ? baseName.slice(slashIdx + 1) : baseName;

  const formattedTitle = shortBase
    .replace(/^([a-zA-Z]+)(\d.*)$/, '$1 $2')
    .replace(/^([a-z])/, (c) => c.toUpperCase());

  const tagInfo = tag && tag !== 'latest' ? ` (${tag})` : (details?.parameter_size ? ` (${details.parameter_size})` : '');
  return `${formattedTitle}${tagInfo}`;
}

export async function GET(req: Request | NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const provider = (url.searchParams.get('provider') || 'ollama') as ProviderType;
  const endpointParam = url.searchParams.get('endpoint');

  // If not ollama, return predefined static models for cloud providers
  if (provider !== 'ollama') {
    const models = PREDEFINED_MODELS[provider] || [];
    return NextResponse.json({
      provider,
      models,
      reachable: true
    });
  }

  // Resolve Ollama Endpoint
  let endpoint = endpointParam?.trim();
  if (!endpoint) {
    try {
      const wsRoot = findWorkspaceRoot();
      const config = await loadWorkspaceConfig(wsRoot);
      endpoint = config.model?.baseUrl;
    } catch {}
  }
  if (!endpoint) {
    endpoint = 'http://127.0.0.1:11434';
  }

  // Strip /v1 to talk to Ollama native /api/tags
  const cleanEndpoint = endpoint.replace(/\/+$/, '').replace(/\/v1\/?$/, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${cleanEndpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { models?: OllamaTagModel[] };
      const rawModels = data.models || [];

      // Filter out embedding-only models
      const chatModels = rawModels.filter((m) => !isEmbeddingModel(m));

      const modelOptions: ModelOption[] = chatModels.map((m) => {
        const isDefault = m.name.startsWith('llama3.2');
        const descParts: string[] = [];
        if (m.details?.parameter_size) descParts.push(m.details.parameter_size);
        if (m.details?.quantization_level) descParts.push(m.details.quantization_level);
        descParts.push('Installed locally');

        return {
          id: m.name,
          name: formatModelLabel(m.name, m.details),
          recommended: isDefault,
          description: descParts.join(' • ')
        };
      });

      // Sort so recommended models (e.g. llama3.2) appear first
      modelOptions.sort((a, b) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json({
        provider: 'ollama',
        models: modelOptions,
        reachable: true,
        count: modelOptions.length
      });
    }

    // Fallback: try /v1/models if native /api/tags fails
    const resV1 = await fetch(`${cleanEndpoint}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });

    if (resV1.ok) {
      const dataV1 = (await resV1.json().catch(() => ({}))) as { data?: Array<{ id: string }> };
      const v1Models = (dataV1.data || [])
        .filter((m) => !m.id.toLowerCase().includes('embed'))
        .map((m) => ({
          id: m.id,
          name: formatModelLabel(m.id),
          recommended: m.id.startsWith('llama3.2'),
          description: 'Installed locally'
        }));

      return NextResponse.json({
        provider: 'ollama',
        models: v1Models,
        reachable: true,
        count: v1Models.length
      });
    }

    // If endpoint responded with error, return default fallback models
    return NextResponse.json({
      provider: 'ollama',
      models: PREDEFINED_MODELS.ollama,
      reachable: false,
      error: `HTTP ${res.status}: ${res.statusText}`
    });
  } catch (err: any) {
    return NextResponse.json({
      provider: 'ollama',
      models: PREDEFINED_MODELS.ollama,
      reachable: false,
      error: err.name === 'AbortError' ? 'Ollama connection timed out' : 'Ollama not reachable'
    });
  }
}
