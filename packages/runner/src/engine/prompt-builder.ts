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

import { buildSafetyPreamble } from '../safety/prompt.js';
import type { AgentManifest, SkillManifest } from '../types/manifest.js';

export function buildSystemPrompt(
  agent: AgentManifest,
  skills: SkillManifest[] = [],
  effectiveTools: string[] = []
): string {
  const safetyPreamble = buildSafetyPreamble(agent, skills);

  // Persona instructions
  let personaText = '';
  if (typeof agent.persona === 'string') {
    personaText = agent.persona.trim();
  } else if (agent.persona && typeof agent.persona === 'object') {
    personaText = [
      agent.persona.role ? `Role: ${agent.persona.role}` : '',
      agent.persona.tone ? `Tone: ${agent.persona.tone}` : '',
      agent.persona.instructions ? `Instructions: ${agent.persona.instructions}` : ''
    ].filter(Boolean).join('\n');
  }

  // Skills instructions
  const skillSections: string[] = [];
  for (const skill of skills) {
    if (skill.instructions && skill.instructions.trim().length > 0) {
      skillSections.push(`### Skill: ${skill.name} (${skill.id})\n${skill.instructions.trim()}`);
    }
  }

  // Effective tools list
  const toolsSummary = effectiveTools.length > 0
    ? `Available Tools (Sandboxed): ${effectiveTools.join(', ')}`
    : 'Available Tools: None (Conversational Only)';

  return [
    safetyPreamble,
    '',
    '# AGENT PERSONA & INSTRUCTIONS',
    `Agent ID: ${agent.id}`,
    `Title: ${agent.title}`,
    `Risk Class: ${agent.risk_class}`,
    personaText,
    '',
    '# AVAILABLE CAPABILITIES',
    toolsSummary,
    '',
    skillSections.length > 0 ? '# SKILL INSTRUCTION PACKS\n' + skillSections.join('\n\n') : ''
  ].filter(Boolean).join('\n');
}
