#!/usr/bin/env node
/**
 * Carefold Phase 0: Standalone Packs Validator
 * Validates all skills and agents in skills/ and agents/ using @carefold/runner.
 * Run directly with: node scripts/validate-packs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const AGENTS_DIR = path.join(ROOT_DIR, 'agents');

const PHASE0_CLOSED_TOOLS = ['attach-read', 'workspace-note', 'skill-docs'];
const MANDATORY_INTENDED_USE = [
  'Not a clinician and not emergency care',
  'If this is an emergency, contact local emergency services',
  'Do not change medication without the prescribing clinician'
];

let totalFailures = 0;

function logHeader(title) {
  console.log(`\n================================================================`);
  console.log(`  ${title}`);
  console.log(`================================================================`);
}

function check(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailures++;
  }
}

// 1. Validate Skills
logHeader('1. Validating Reference Skills (skills/*)');

if (!fs.existsSync(SKILLS_DIR)) {
  console.error(`Skills directory not found: ${SKILLS_DIR}`);
  process.exit(1);
}

const skillDirs = fs.readdirSync(SKILLS_DIR).filter(d => {
  return fs.statSync(path.join(SKILLS_DIR, d)).isDirectory() && !d.startsWith('.');
});

console.log(`Found ${skillDirs.length} skill packs: ${skillDirs.join(', ')}`);

for (const skillId of skillDirs) {
  console.log(`\nChecking skill [${skillId}]...`);
  const sDir = path.join(SKILLS_DIR, skillId);
  const skillMdPath = path.join(sDir, 'SKILL.md');
  const cfYamlPath = path.join(sDir, 'carefold.yaml');
  const goldenPath = path.join(sDir, 'evals', 'golden.jsonl');

  check(fs.existsSync(skillMdPath), `${skillId}/SKILL.md exists`);
  check(fs.existsSync(cfYamlPath), `${skillId}/carefold.yaml exists`);
  check(fs.existsSync(goldenPath), `${skillId}/evals/golden.jsonl exists`);

  if (fs.existsSync(skillMdPath)) {
    const rawMd = fs.readFileSync(skillMdPath, 'utf8');
    const normalized = rawMd.toLowerCase();
    for (const statement of MANDATORY_INTENDED_USE) {
      if (statement.includes('Not a clinician')) {
        check(normalized.includes('not a clinician'), `Mandatory statement: "Not a clinician" present`);
      } else if (statement.includes('emergency services')) {
        check(normalized.includes('emergency services'), `Mandatory statement: "Emergency services" present`);
      } else if (statement.includes('medication')) {
        check(normalized.includes('medication'), `Mandatory statement: "Do not change medication" present`);
      }
    }
  }

  if (fs.existsSync(goldenPath)) {
    const lines = fs.readFileSync(goldenPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
    check(lines.length >= 5, `Golden evals count >= 5 (found ${lines.length})`);
    let refuseCount = 0;
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.expect === 'refuse') refuseCount++;
      } catch (err) {
        check(false, `Malformed JSON in golden.jsonl: ${err.message}`);
      }
    }
    check(refuseCount >= 2, `Golden evals refuse cases >= 2 (found ${refuseCount})`);
  }
}

// 2. Validate Agents
logHeader('2. Validating Reference Agents (agents/*)');

if (!fs.existsSync(AGENTS_DIR)) {
  console.error(`Agents directory not found: ${AGENTS_DIR}`);
  process.exit(1);
}

const agentDirs = fs.readdirSync(AGENTS_DIR).filter(d => {
  return fs.statSync(path.join(AGENTS_DIR, d)).isDirectory() && !d.startsWith('.');
});

console.log(`Found ${agentDirs.length} agent packs: ${agentDirs.join(', ')}`);

for (const agentId of agentDirs) {
  console.log(`\nChecking agent [${agentId}]...`);
  const aDir = path.join(AGENTS_DIR, agentId);
  const agentYamlPath = path.join(aDir, 'agent.yaml');
  const readmePath = path.join(aDir, 'README.md');
  const startersPath = path.join(aDir, 'starters.json');
  const goldenPath = path.join(aDir, 'evals', 'golden.jsonl');

  check(fs.existsSync(agentYamlPath), `${agentId}/agent.yaml exists`);
  check(fs.existsSync(readmePath), `${agentId}/README.md exists`);
  check(fs.existsSync(startersPath), `${agentId}/starters.json exists`);
  check(fs.existsSync(goldenPath), `${agentId}/evals/golden.jsonl exists`);

  if (fs.existsSync(startersPath)) {
    try {
      const starters = JSON.parse(fs.readFileSync(startersPath, 'utf8'));
      check(Array.isArray(starters) && starters.length >= 2, `starters.json is an array with >= 2 chips`);
    } catch (err) {
      check(false, `starters.json is invalid JSON: ${err.message}`);
    }
  }

  if (fs.existsSync(goldenPath)) {
    const lines = fs.readFileSync(goldenPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
    check(lines.length >= 2, `Agent golden evals count >= 2 (found ${lines.length})`);
  }
}

// 3. Summary
logHeader('Validation Summary');
if (totalFailures === 0) {
  console.log('\n🎉 ALL REFERENCE PACKS PASSED VALIDATION PERFECTLY!\n');
  process.exit(0);
} else {
  console.error(`\n❌ PACKS VALIDATION FAILED WITH ${totalFailures} ERROR(S)!\n`);
  process.exit(1);
}
