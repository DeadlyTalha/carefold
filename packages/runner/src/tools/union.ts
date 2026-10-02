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

import { PHASE0_CLOSED_TOOLS } from '../types/tool.js';
import type { AgentManifest, SkillManifest } from '../types/manifest.js';
import { ToolValidationError } from '../manifest/skill.js';

export { ToolValidationError };
export const PHASE_0_REGISTRY = PHASE0_CLOSED_TOOLS;

/**
 * Checks if a given tool is permitted under the effective allowlist.
 */
export function isToolPermitted(tool: string, effectiveTools: string[]): boolean {
  return effectiveTools.includes(tool);
}

/**
 * Computes effective tools:
 * effective_tools = unique(agent.tools ∪ (skill.tools for skill in agent.skills)) ∩ Phase0Registry
 *
 * Supports both signatures:
 * - computeEffectiveTools(agent: AgentManifest, skills: SkillManifest[])
 * - computeEffectiveTools(agentTools: string[], skillTools: (string[] | string)[])
 */
export function computeEffectiveTools(
  agentOrTools: AgentManifest | string[],
  skillsOrTools: SkillManifest[] | (string[] | string)[] = []
): string[] {
  const allowedSet = new Set<string>(PHASE_0_REGISTRY);

  let agentTools: string[] = [];
  let candidateSkillTools: string[] = [];

  if (Array.isArray(agentOrTools)) {
    agentTools = agentOrTools;
    for (const item of skillsOrTools) {
      if (Array.isArray(item)) {
        candidateSkillTools.push(...item);
      } else if (typeof item === 'string') {
        candidateSkillTools.push(item);
      } else if (item && typeof item === 'object' && 'tools' in item) {
        candidateSkillTools.push(...((item as SkillManifest).tools || []));
      }
    }
  } else {
    const agent = agentOrTools;
    const skills = skillsOrTools as SkillManifest[];
    agentTools = agent.tools || [];

    // Filter to skills declared on agent
    const declaredSkillSet = new Set(agent.skills || []);
    const activeSkills = skills.filter(s => declaredSkillSet.has(s.id));
    for (const skill of activeSkills) {
      candidateSkillTools.push(...(skill.tools || []));
    }
  }

  // Deduplicate and filter against Phase 0 registry
  const unionSet = new Set<string>([...agentTools, ...candidateSkillTools]);
  return Array.from(unionSet).filter(t => allowedSet.has(t));
}
