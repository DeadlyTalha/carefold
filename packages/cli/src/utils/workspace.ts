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

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { CarefoldConfigSchema, type CarefoldConfig } from '@carefold/runner';
import { CliError, ExitCodes } from './errors.js';

export interface WorkspacePaths {
  root: string;
  config: string;
  agents: string;
  skills: string;
  chats: string;
  attachments: string;
  logs: string;
  auditLog: string;
  readme: string;
}

export function findWorkspaceRoot(explicitDir?: string): string {
  if (explicitDir) {
    return path.resolve(process.cwd(), explicitDir);
  }

  if (process.env.CAREFOLD_WORKSPACE) {
    return path.resolve(process.cwd(), process.env.CAREFOLD_WORKSPACE);
  }

  // Walk upwards from cwd checking for carefold.config.json
  let current = process.cwd();
  while (true) {
    if (fsSync.existsSync(path.join(current, 'carefold.config.json'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  // Fallback to current working directory
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
    auditLog: path.join(workspaceRoot, 'logs', 'audit.jsonl'),
    readme: path.join(workspaceRoot, 'README.md')
  };
}

export async function loadWorkspaceConfig(workspaceRoot: string): Promise<CarefoldConfig> {
  const configPath = path.join(workspaceRoot, 'carefold.config.json');
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e: any) {
      throw new CliError(`Invalid JSON in "${configPath}": ${e.message}`, ExitCodes.USER_ERROR);
    }
    const result = CarefoldConfigSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      throw new CliError(`Invalid configuration in "${configPath}": ${issues}`, ExitCodes.USER_ERROR);
    }
    return result.data;
  } catch (err: any) {
    if (err instanceof CliError) throw err;
    if (err.code === 'ENOENT') {
      return CarefoldConfigSchema.parse({});
    }
    throw new CliError(`Failed to read config: ${err.message}`, ExitCodes.USER_ERROR);
  }
}
