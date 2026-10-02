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

import type { ToolResult } from './tool.js';
import type { AuditEvent } from './audit.js';
import type { CarefoldConfig } from './context.js';
import type { ModelClient } from '../model/types.js';

export type StreamChunk =
  | { type: 'token'; delta: string; token: string }
  | { type: 'tool_start'; tool: string; input: Record<string, any> }
  | { type: 'tool_end'; tool: string; result: ToolResult; duration_ms: number; allowed?: boolean; status?: 'completed' | 'denied' | 'failed' }
  | { type: 'tool_call'; tool: string; status: 'allowed' | 'denied'; input?: Record<string, any>; result?: ToolResult; duration_ms?: number }
  | { type: 'refusal'; reason: string; message: string }
  | { type: 'error'; error: string };

export interface ToolCallRecord {
  tool: string;
  input: Record<string, any>;
  allowed: boolean;
  duration_ms: number;
  success?: boolean;
  output?: any;
  error?: string;
}

export interface RunOptions {
  agentDir?: string;
  agentId?: string;
  skillsDir?: string;
  workspaceDir?: string;
  workspaceRoot?: string;
  prompt: string;
  attachments?: string[];
  config?: CarefoldConfig;
  mockModel?: boolean | ModelClient | ((messages: any[], tools: any[]) => AsyncGenerator<any, any, any>);
  modelClient?: ModelClient;
}

export interface RunResult {
  text: string;
  refused: boolean;
  refusalReason?: string;
  toolCalls: ToolCallRecord[];
  auditEvents: AuditEvent[];
}
