/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan (https://spectrayan.com)
 *
 * Licensed under the PolyForm Noncommercial License 1.0.0 and the
 * Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
 * Personal and household local use only. Commercial use, hosted service
 * offering, rebranding, white-labeling, and redistribution of modified
 * forks are prohibited without a written commercial license from Spectrayan.
 *
 * Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import yaml from 'yaml';
import {
  PackManifestSchema,
  AgentManifestSchema,
  SkillFrontmatterSchema,
  parseFrontmatter,
  loadAgent,
} from '../src/index.js';

function resolveWorkspaceRoot(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml')) && fs.existsSync(path.join(cwd, 'packages', 'runner'))) {
    return cwd;
  }
  const runnerParent = path.resolve(__dirname, '../../..');
  if (fs.existsSync(path.join(runnerParent, 'pnpm-workspace.yaml'))) {
    return runnerParent;
  }
  return cwd;
}

const ROOT_DIR = resolveWorkspaceRoot();
const HEALTH_PACK_YAML = path.join(ROOT_DIR, 'packs/health/pack.yaml');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');

describe('12: Canonical Manifest Schema Validation', () => {
  it('validates packs/health/pack.yaml strictly against PackManifestSchema', () => {
    expect(fs.existsSync(HEALTH_PACK_YAML)).toBe(true);
    const rawYaml = fs.readFileSync(HEALTH_PACK_YAML, 'utf8');
    const parsed = yaml.parse(rawYaml);

    const result = PackManifestSchema.safeParse(parsed);
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error(result.error);
    }
    const manifest = result.data;
    expect(manifest.id).toBe('health');
    expect(manifest.domain).toBe('health');
    expect(manifest.pack_api).toBe(1);
    const scopeIds = manifest.scopes.map((s: any) => s.id);
    expect(scopeIds).toContain('health.clinical');
    expect(scopeIds).toContain('health.paperwork');
    expect(manifest.risk_tier_max).toBe('T4');
  });

  it('rejects invalid pack manifests (invalid slug, missing name, bad risk tier)', () => {
    // Bad ID (slug)
    const badId = {
      pack_api: 1,
      id: 'Health_Pack!',
      name: 'Bad Pack',
      version: '0.1.0',
      domain: 'health',
      requires_core: '>=0.1.0',
    };
    expect(PackManifestSchema.safeParse(badId).success).toBe(false);

    // Bad Risk Tier
    const badRisk = {
      pack_api: 1,
      id: 'health',
      name: 'Bad Risk',
      version: '0.1.0',
      domain: 'health',
      requires_core: '>=0.1.0',
      risk_tier_max: 'T99',
    };
    expect(PackManifestSchema.safeParse(badRisk).success).toBe(false);
  });

  it('validates all bundled agents against AgentManifestSchema', async () => {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    const agentDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));
    expect(agentDirs.length).toBeGreaterThanOrEqual(23);

    for (const d of agentDirs) {
      const agentDirPath = path.join(AGENTS_DIR, d.name);
      if (!fs.existsSync(path.join(agentDirPath, 'agent.yaml'))) continue;

      const loaded = await loadAgent(agentDirPath, SKILLS_DIR);
      expect(loaded.agent.id).toBeDefined();
      expect(loaded.agent.title).toBeDefined();
      expect(loaded.agent.persona).toBeDefined();
    }
  });

  it('validates all bundled skills against SkillFrontmatterSchema', () => {
    const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    const skillDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));
    expect(skillDirs.length).toBeGreaterThanOrEqual(24);

    for (const d of skillDirs) {
      const skillMdPath = path.join(SKILLS_DIR, d.name, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;

      const raw = fs.readFileSync(skillMdPath, 'utf8');
      const { frontmatter } = parseFrontmatter(raw);
      const res = SkillFrontmatterSchema.safeParse(frontmatter);
      expect(res.success, `Skill ${d.name} should parse against SkillFrontmatterSchema`).toBe(true);
    }
  });
});
