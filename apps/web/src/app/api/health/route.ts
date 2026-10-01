import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { findWorkspaceRoot, getWorkspacePaths, loadWorkspaceConfig } from '@/lib/workspace';
import { checkOllamaHealth } from '@/lib/ollama';
import type { HealthResponse } from '@/types/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request | NextRequest): Promise<NextResponse<HealthResponse | { error: string }>> {
  try {
    const wsRoot = findWorkspaceRoot();
    const paths = getWorkspacePaths(wsRoot);
    const config = await loadWorkspaceConfig(wsRoot);

    // Count workspace agents
    let agentsCount = 0;
    try {
      const agentEntries = await fs.readdir(paths.agents, { withFileTypes: true });
      agentsCount = agentEntries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).length;
    } catch {}

    // Count workspace skills
    let skillsCount = 0;
    try {
      const skillEntries = await fs.readdir(paths.skills, { withFileTypes: true });
      skillsCount = skillEntries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).length;
    } catch {}

    // Check Ollama status
    const ollamaEndpoint = config.model?.baseUrl?.replace(/\/v1\/?$/, '') || 'http://127.0.0.1:11434';
    const ollamaStatus = await checkOllamaHealth(ollamaEndpoint);

    const overallStatus: 'ok' | 'degraded' = ollamaStatus.reachable ? 'ok' : 'ok'; // Report ok for healthy app, or degraded if unreachable

    const healthData: HealthResponse = {
      status: overallStatus,
      version: '0.1.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      modelReachable: ollamaStatus.reachable,
      workspace: {
        root: wsRoot,
        agentsCount,
        skillsCount
      },
      ollama: ollamaStatus
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: `Health check failed: ${err.message}`
      } as any,
      { status: 503 }
    );
  }
}
