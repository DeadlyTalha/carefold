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

import { runPython, assertEqual, assertTrue } from '../helpers/utils.js';

export const name = 'F03: Skill Manifest Schema & Load';

export async function run() {
  const tests = [
    {
      id: 'F03-T01',
      name: 'Skill manifest loader parses frontmatter from SKILL.md',
      fn: () => {
        const script = `
from carefold.loaders.skill_loader import load_skill
skill = load_skill('skills/visit-prep')
assert skill.id == 'visit-prep'
assert skill.version == '0.1.0'
assert skill.risk_class.value == 'wellness'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F03-T02',
      name: 'Skill manifest loader verifies mandatory intended-use statements',
      fn: () => {
        const script = `
from carefold.loaders.frontmatter import check_mandatory_intended_use, parse_frontmatter
from pathlib import Path
content = Path('skills/visit-prep/SKILL.md').read_text(encoding='utf-8')
fm = parse_frontmatter(content)
check_mandatory_intended_use(fm.body)
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F03-T03',
      name: 'Skill manifest loader resolves declared tools list accurately',
      fn: () => {
        const script = `
from carefold.loaders.skill_loader import load_skill
skill = load_skill('skills/visit-prep')
assert 'attach-read' in skill.tools
assert 'skill-docs' in skill.tools
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F03-T04',
      name: 'load_all_skills enumerates all bundled reference skills',
      fn: () => {
        const script = `
from carefold.loaders.skill_loader import load_all_skills
skills = load_all_skills('skills')
ids = [s.id for s in skills]
assert 'visit-prep' in ids
assert 'benefits-explainer' in ids
assert 'habit-checkin' in ids
assert '_template' in ids
assert len(skills) == 4
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F03-T05',
      name: 'Skill manifest parses markdown instructions body',
      fn: () => {
        const script = `
from carefold.loaders.skill_loader import load_skill
skill = load_skill('skills/benefits-explainer')
assert skill.instructions is not None
assert len(skill.instructions) > 50
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
