import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';
import { parseFrontmatter, checkMandatoryIntendedUse } from './frontmatter.js';
import { SkillFrontmatterSchema, CarefoldYamlSchema } from './schema.js';
import { PHASE_0_REGISTRY } from '../types/tool.js';
import type { SkillManifest } from '../types/manifest.js';

export class ManifestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestValidationError';
  }
}

export class ToolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolValidationError';
  }
}

/**
 * Loads and validates a skill directory containing SKILL.md and optional carefold.yaml
 */
export async function loadSkill(skillDir: string): Promise<SkillManifest> {
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  let rawSkillMd: string;
  try {
    rawSkillMd = await fs.readFile(skillMdPath, 'utf8');
  } catch (err: any) {
    throw new ManifestValidationError(`Missing required SKILL.md in "${skillDir}": ${err.message}`);
  }

  // Parse frontmatter & body
  const { frontmatter, body } = parseFrontmatter(rawSkillMd);

  // Validate frontmatter
  const fmResult = SkillFrontmatterSchema.safeParse(frontmatter);
  if (!fmResult.success) {
    const issues = fmResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new ManifestValidationError(`Invalid SKILL.md frontmatter in "${skillDir}": ${issues}`);
  }
  const fm = fmResult.data;

  // Validate mandatory intended-use lines
  const intendedUseCheck = checkMandatoryIntendedUse(rawSkillMd);
  if (!intendedUseCheck.valid) {
    throw new ManifestValidationError(
      `Mandatory intended-use line missing in "${skillDir}/SKILL.md": "${intendedUseCheck.missing}"`
    );
  }

  // Skill ID defaults to folder name or frontmatter name
  const folderId = path.basename(skillDir);
  const skillId = folderId || fm.name;

  // Check for carefold.yaml
  const carefoldYamlPath = path.join(skillDir, 'carefold.yaml');
  let hasCarefoldYaml = false;
  let carefoldConfig: any = null;

  try {
    const rawYaml = await fs.readFile(carefoldYamlPath, 'utf8');
    hasCarefoldYaml = true;
    try {
      carefoldConfig = yaml.parse(rawYaml) || {};
    } catch (parseErr: any) {
      throw new ManifestValidationError(`Malformed carefold.yaml in "${skillDir}": ${parseErr.message}`);
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (hasCarefoldYaml) {
    const cfResult = CarefoldYamlSchema.safeParse(carefoldConfig);
    if (!cfResult.success) {
      const issues = cfResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      throw new ManifestValidationError(`Invalid carefold.yaml in "${skillDir}": ${issues}`);
    }
    const cf = cfResult.data;

    // Validate tools
    const tools = cf.tools || [];
    const allowedToolsSet = new Set<string>(PHASE_0_REGISTRY);
    for (const tool of tools) {
      if (!allowedToolsSet.has(tool)) {
        throw new ToolValidationError(
          `Tool '${tool}' in skill "${skillId}" is not in Phase 0 closed registry [${PHASE_0_REGISTRY.join(', ')}]`
        );
      }
    }

    return {
      id: cf.id || skillId,
      name: fm.name,
      description: fm.description,
      version: cf.version || fm.metadata?.version || '0.1.0',
      license: cf.license || fm.license,
      risk_class: cf.risk_class || 'wellness',
      tools,
      forbidden: cf.forbidden || [],
      instructions: body,
      evals: cf.evals,
      is_verified: true,
      unverified: false
    };
  }

  // Fallback for missing carefold.yaml per CF-S11:
  // Missing carefold.yaml -> risk_class wellness, tools = none, unverified
  return {
    id: skillId,
    name: fm.name,
    description: fm.description,
    version: fm.metadata?.version || '0.1.0',
    license: fm.license,
    risk_class: 'wellness',
    tools: [],
    forbidden: [],
    instructions: body,
    is_verified: false,
    unverified: true
  };
}

/**
 * Loads all skills from a skills root directory
 */
export async function loadAllSkills(skillsDir: string): Promise<SkillManifest[]> {
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const skills: SkillManifest[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const fullPath = path.join(skillsDir, entry.name);
        try {
          const skill = await loadSkill(fullPath);
          skills.push(skill);
        } catch (err: any) {
          // If not a valid skill directory (e.g. no SKILL.md), continue or rethrow
          if (!(err instanceof ManifestValidationError && err.message.includes('ENOENT'))) {
            // Rethrow genuine schema/validation errors
            throw err;
          }
        }
      }
    }

    return skills;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}
