import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
export interface CarefoldConfig {
  allow_clinical?: boolean;
  model?: {
    baseUrl?: string;
    model?: string;
    apiKey?: string;
    timeout?: number;
  };
}

export interface WorkspacePaths {
  root: string;
  config: string;
  agents: string;
  skills: string;
  chats: string;
  attachments: string;
  logs: string;
  auditLog: string;
}

export function findWorkspaceRoot(explicitDir?: string): string {
  if (explicitDir) {
    return path.resolve(process.cwd(), explicitDir);
  }

  if (process.env.CAREFOLD_WORKSPACE) {
    return path.resolve(process.cwd(), process.env.CAREFOLD_WORKSPACE);
  }

  // Walk upwards from current working directory
  let current = process.cwd();
  while (true) {
    if (
      fsSync.existsSync(path.join(current, 'carefold.config.json')) ||
      (fsSync.existsSync(path.join(current, 'agents')) && fsSync.existsSync(path.join(current, 'skills')))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return process.cwd();
}

export function getWorkspacePaths(workspaceRoot: string): WorkspacePaths {
  return {
    root: workspaceRoot,
    config: path.join(workspaceRoot, 'carefold.config.json'),
    agents: path.join(workspaceRoot, 'agents'),
    skills: path.join(workspaceRoot, 'skills'),
    chats: path.join(workspaceRoot, 'chats'),
    attachments: path.join(workspaceRoot, 'attachments'),
    logs: path.join(workspaceRoot, 'logs'),
    auditLog: path.join(workspaceRoot, 'logs', 'audit.jsonl')
  };
}

export async function loadWorkspaceConfig(workspaceRoot: string): Promise<CarefoldConfig> {
  const configPath = path.join(workspaceRoot, 'carefold.config.json');
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      allow_clinical: Boolean(parsed?.allow_clinical),
      model: parsed?.model || {}
    };
  } catch {
    return {};
  }
}
