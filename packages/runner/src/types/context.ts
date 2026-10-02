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

import type { AgentManifest, SkillManifest } from './manifest.js';

export interface CarefoldConfig {
  version?: string;
  model?: {
    provider?: string;      // Default: 'ollama'
    baseUrl?: string;       // Default: 'http://127.0.0.1:11434/v1'
    model?: string;         // Default: 'llama3.2'
    apiKey?: string;        // Default: ''
    temperature?: number;
  };
  audit?: {
    enabled?: boolean;      // Default: true
    store_bodies?: boolean; // Default: false
    log_path?: string;      // Default: 'logs/audit.jsonl'
  };
  allow_clinical?: boolean; // Default: false
  telemetry?: boolean;      // Default: false
}

export interface ExecutionContext {
  workspaceRoot: string;
  skillsDir?: string;
  agent: AgentManifest;
  effectiveTools: string[];
  skills: SkillManifest[];
  activeSkillId?: string;
  sessionId?: string;
  config?: CarefoldConfig;
}
