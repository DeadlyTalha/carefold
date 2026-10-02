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

import yaml from 'yaml';

export interface ParsedFrontmatter {
  frontmatter: Record<string, any>;
  body: string;
}

export const MANDATORY_INTENDED_USE_LINES = [
  'Not a clinician and not emergency care',
  'If this is an emergency, contact local emergency services',
  'Do not change medication without the prescribing clinician'
] as const;

/**
 * Extracts and parses YAML frontmatter from a markdown string.
 */
export function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {},
      body: normalized.trim()
    };
  }

  const rawYaml = match[1];
  const body = match[2].trim();

  let frontmatter: Record<string, any> = {};
  try {
    frontmatter = yaml.parse(rawYaml) || {};
  } catch (err: any) {
    throw new Error(`Malformed YAML frontmatter in SKILL.md: ${err.message}`);
  }

  return { frontmatter, body };
}

/**
 * Checks whether the content includes all 3 mandatory intended-use statements.
 */
export function checkMandatoryIntendedUse(content: string): { valid: boolean; missing?: string } {
  const normalized = content.toLowerCase();

  for (const line of MANDATORY_INTENDED_USE_LINES) {
    // Check key phrases from each line
    if (line === 'Not a clinician and not emergency care') {
      const hasClinician = normalized.includes('not a clinician');
      const hasEmergency = normalized.includes('not emergency care') || normalized.includes('not emergency');
      if (!hasClinician || !hasEmergency) {
        return { valid: false, missing: line };
      }
    } else if (line === 'If this is an emergency, contact local emergency services') {
      const hasEmergencyContact =
        normalized.includes('contact local emergency services') ||
        normalized.includes('contact emergency services') ||
        normalized.includes('call 911') ||
        normalized.includes('emergency services');
      if (!hasEmergencyContact) {
        return { valid: false, missing: line };
      }
    } else if (line === 'Do not change medication without the prescribing clinician') {
      const hasMedicationChange =
        normalized.includes('do not change medication') ||
        normalized.includes('prescribing clinician') ||
        normalized.includes('without your doctor') ||
        normalized.includes('without consulting');
      if (!hasMedicationChange) {
        return { valid: false, missing: line };
      }
    }
  }

  return { valid: true };
}
