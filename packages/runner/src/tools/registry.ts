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

import { executeAttachRead } from './attach-read.js';
import { executeWorkspaceNote } from './workspace-note.js';
import { executeSkillDocs } from './skill-docs.js';
import { PHASE0_CLOSED_TOOLS, type ClosedToolName, type ToolDefinition, type ToolResult } from '../types/tool.js';
import type { ExecutionContext } from '../types/context.js';

export { PHASE0_CLOSED_TOOLS };
export const PHASE_0_REGISTRY = PHASE0_CLOSED_TOOLS;

export const CLOSED_TOOL_DEFINITIONS: Record<ClosedToolName, ToolDefinition> = {
  'attach-read': {
    name: 'attach-read',
    description: 'Read a text or PDF file located in the workspace attachments directory.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Filename or path of the attachment in the attachments folder (e.g. "blood_work.txt", "benefits.pdf").'
        }
      },
      required: ['path']
    },
    execute: (params: any, context: ExecutionContext) => executeAttachRead(params, context)
  },
  'workspace-note': {
    name: 'workspace-note',
    description: 'Save a markdown note into the workspace notes directory.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Short title for the note (letters, numbers, hyphens).'
        },
        content: {
          type: 'string',
          description: 'Markdown formatted note content to record.'
        }
      },
      required: ['title', 'content']
    },
    execute: (params: any, context: ExecutionContext) => executeWorkspaceNote(params, context)
  },
  'skill-docs': {
    name: 'skill-docs',
    description: 'Read documentation or reference files from an installed skill references directory.',
    parameters: {
      type: 'object',
      properties: {
        skill_id: {
          type: 'string',
          description: 'The ID of the skill owning the reference document.'
        },
        doc: {
          type: 'string',
          description: 'Filename of the reference document (e.g. "copay_definitions.md").'
        }
      },
      required: ['skill_id', 'doc']
    },
    execute: (params: any, context: ExecutionContext) => executeSkillDocs(params, context)
  }
};

export function getClosedTool(name: string): ToolDefinition | undefined {
  if (typeof name === 'string' && Object.hasOwn(CLOSED_TOOL_DEFINITIONS, name)) {
    return CLOSED_TOOL_DEFINITIONS[name as ClosedToolName];
  }
  return undefined;
}

export async function executeTool(
  name: string,
  params: any,
  context: ExecutionContext
): Promise<ToolResult> {
  const tool = getClosedTool(name);
  if (!tool || typeof tool.execute !== 'function') {
    return {
      success: false,
      output: null,
      error: `Tool "${name}" is not recognized or not available in the Phase 0 closed tool registry.`
    };
  }

  try {
    return await tool.execute(params, context);
  } catch (err: any) {
    return {
      success: false,
      output: null,
      error: `Tool execution failed: ${err.message}`
    };
  }
}
