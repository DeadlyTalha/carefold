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

import type { ExecutionContext } from './context.js';

export type ClosedToolName = 'attach-read' | 'workspace-note' | 'skill-docs';

export const PHASE0_CLOSED_TOOLS: readonly ClosedToolName[] = [
  'attach-read',
  'workspace-note',
  'skill-docs'
] as const;

export const PHASE_0_REGISTRY = PHASE0_CLOSED_TOOLS;

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
}

export interface ToolDefinition {
  name: ClosedToolName;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any, context: ExecutionContext) => Promise<ToolResult>;
}

export interface AttachReadParams {
  path?: string;
  file_path?: string;
}

export interface WorkspaceNoteParams {
  title: string;
  content: string;
}

export interface SkillDocsParams {
  skill_id: string;
  doc?: string;
  doc_name?: string;
}
