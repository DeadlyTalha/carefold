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
import path from 'node:path';
import { redactAuditEvent } from './redaction.js';
import type { AuditEvent } from '../types/audit.js';
import type { CarefoldConfig } from '../types/context.js';

let appendQueue: Promise<void> = Promise.resolve();

export async function recordAudit(
  event: AuditEvent,
  configOrOptions?: CarefoldConfig | { workspaceDir?: string; storeBodies?: boolean; logPath?: string; audit?: any },
  workspaceRoot?: string
): Promise<void> {
  try {
    const wsRoot =
      workspaceRoot ||
      (configOrOptions as any)?.workspaceDir ||
      (configOrOptions as any)?.workspaceRoot ||
      process.cwd();

    const relativeLogPath =
      (configOrOptions as any)?.logPath ||
      (configOrOptions as any)?.audit?.log_path ||
      'logs/audit.jsonl';

    const logFilePath = path.resolve(wsRoot, relativeLogPath);

    // Ensure ts is present
    const eventWithTs: AuditEvent = {
      ts: event.ts || new Date().toISOString(),
      ...event
    };

    // Apply zero-body redaction
    const safeEntry = redactAuditEvent(eventWithTs, configOrOptions);
    const line = JSON.stringify(safeEntry);

    // Queue atomic append
    appendQueue = appendQueue
      .then(async () => {
        await fs.mkdir(path.dirname(logFilePath), { recursive: true });
        await fs.appendFile(logFilePath, line + '\n', { flag: 'a', encoding: 'utf8' });
      })
      .catch((err) => {
        // Non-blocking fault isolation: do not crash user execution on log write failure
        console.error('[Carefold Audit Engine Error]: Failed to write audit event', err);
      });

    await appendQueue;
  } catch (err) {
    console.error('[Carefold Audit Engine Error]: Unexpected exception', err);
  }
}

// Alias for test compatibility
export const recordAuditEvent = recordAudit;

/**
 * Reads and parses audit events from a jsonl file
 */
export async function readAuditEvents(logPath: string): Promise<AuditEvent[]> {
  try {
    const content = await fs.readFile(logPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.map(l => JSON.parse(l));
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}
