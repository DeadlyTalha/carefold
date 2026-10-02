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

export type RiskClass = 'wellness' | 'admin' | 'education' | 'clinical_assist';

export interface AgentModelConfig {
  provider?: string;
  name: string;
  temperature?: number;
}

export interface AgentPersonaObject {
  role: string;
  tone: string;
  instructions: string;
}

export type AgentPersona = string | AgentPersonaObject;

export interface AgentManifest {
  id: string;
  title: string;
  version: string;
  license?: string;
  risk_class: RiskClass;
  model?: string | AgentModelConfig;
  skills: string[];
  tools?: string[];
  forbidden?: string[];
  hidden?: boolean;
  can_delegate?: boolean;
  max_iterations?: number;
  description?: string;
  persona: AgentPersona;
}

export interface SkillManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  license?: string;
  risk_class: RiskClass;
  tools?: string[];
  forbidden?: string[];
  instructions?: string;
  evals?: string;
  is_verified?: boolean; // true if carefold.yaml was present; false if fallback
  unverified?: boolean; // alias for compatibility
}

export interface LoadAgentResult {
  agent: AgentManifest;
  effectiveTools: string[];
  skills: SkillManifest[];
}
