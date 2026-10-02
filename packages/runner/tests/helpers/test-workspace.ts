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

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface TestWorkspace {
  workspaceDir: string;
  cleanup: () => Promise<void>;
}

export async function createTestWorkspace(): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'carefold-test-'));

  // Scaffold workspace folders
  await fs.mkdir(path.join(tmpDir, 'agents', 'visit-steward'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'skills', 'visit-prep', 'references'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'skills', 'unverified-skill'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'attachments'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'workspace', 'notes'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'notes'), { recursive: true });
  await fs.mkdir(path.join(tmpDir, 'logs'), { recursive: true });

  // 1. Valid visit-steward agent.yaml
  const agentYaml = `
id: visit-steward
title: Visit Steward
version: 0.1.0
risk_class: wellness
skills:
  - visit-prep
tools:
  - workspace-note
persona:
  role: Visit Steward
  tone: supportive
  instructions: You help someone prepare for a visit. You do not diagnose or dose.
`;
  await fs.writeFile(path.join(tmpDir, 'agents', 'visit-steward', 'agent.yaml'), agentYaml.trim());

  // 2. Valid visit-prep SKILL.md
  const skillMd = `---
name: visit-prep
description: Prepares questions and checklist for doctor or therapist visits
---
# Visit Prep Instructions
Help the user prepare questions for their appointment.

## Important Disclosures
- Not a clinician and not emergency care.
- If this is an emergency, contact local emergency services immediately.
- Do not change medication without the prescribing clinician.
`;
  await fs.writeFile(path.join(tmpDir, 'skills', 'visit-prep', 'SKILL.md'), skillMd.trim());

  // 3. Valid visit-prep carefold.yaml
  const carefoldYaml = `
id: visit-prep
version: 0.1.0
risk_class: wellness
tools:
  - skill-docs
forbidden:
  - diagnose
  - dose
`;
  await fs.writeFile(path.join(tmpDir, 'skills', 'visit-prep', 'carefold.yaml'), carefoldYaml.trim());

  // 4. Sample reference file for skill-docs
  await fs.writeFile(
    path.join(tmpDir, 'skills', 'visit-prep', 'references', 'agenda.md'),
    '# Appointment Questions\n1. How has your sleep been?\n2. Any symptoms?'
  );

  // 5. Unverified skill (missing carefold.yaml)
  const unverifiedSkillMd = `---
name: unverified-skill
description: A third party community skill
---
# Instructions
- Not a clinician and not emergency care.
- If this is an emergency, contact local emergency services.
- Do not change medication without the prescribing clinician.
`;
  await fs.writeFile(path.join(tmpDir, 'skills', 'unverified-skill', 'SKILL.md'), unverifiedSkillMd.trim());

  // 6. Sample attachment files
  await fs.writeFile(
    path.join(tmpDir, 'attachments', 'sample.txt'),
    'Insurance Plan Summary: Copay $20, Deductible $500.'
  );

  // Simple minimal PDF structure with a text object
  const pdfBytes = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Length 50 >>\nstream\nBT\n/F1 12 Tf\n(Plan Summary Benefits Overview) Tj\nET\nendstream\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000010 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n110\n%%EOF\n',
    'latin1'
  );
  await fs.writeFile(path.join(tmpDir, 'attachments', 'sample.pdf'), pdfBytes);

  return tmpDir;
}

export async function cleanupTestWorkspace(workspaceDir: string): Promise<void> {
  try {
    await fs.rm(workspaceDir, { recursive: true, force: true });
  } catch {}
}
