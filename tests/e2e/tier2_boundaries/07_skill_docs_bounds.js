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

import fs from 'node:fs';
import path from 'node:path';
import { runPython, createTempWorkspace, removeTempWorkspace, assertEqual, assertTrue } from '../helpers/utils.js';

export const name = 'F07-B: skill-docs Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F07-B01',
      name: 'skill-docs rejects path traversal or invalid characters in skill_id',
      fn: () => {
        const script = `
import asyncio
from pathlib import Path
from carefold.tools.skill_docs import skill_docs_tool

async def main():
    agent = type('Agent', (), {'id': 'visit-steward', 'skills': ['visit-prep']})()
    skill = type('Skill', (), {'id': 'visit-prep'})()
    ctx = type('Ctx', (), {
        'workspace_root': Path('.').resolve(),
        'skills_dir': Path('skills').resolve(),
        'agent': agent,
        'effective_tools': ['skill-docs'],
        'skills': [skill]
    })()
    # Path traversal pattern in skill_id
    res = await skill_docs_tool({'skill_id': '../../etc/passwd', 'doc': 'questions_guide.md'}, ctx)
    assert res.success is False
    assert 'invalid' in res.error.lower() or 'not declared' in res.error.lower()

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F07-B02',
      name: 'skill-docs rejects path traversal attempts in doc parameter escaping references/',
      fn: () => {
        const script = `
import asyncio
from pathlib import Path
from carefold.tools.skill_docs import skill_docs_tool

async def main():
    agent = type('Agent', (), {'id': 'visit-steward', 'skills': ['visit-prep']})()
    skill = type('Skill', (), {'id': 'visit-prep'})()
    ctx = type('Ctx', (), {
        'workspace_root': Path('.').resolve(),
        'skills_dir': Path('skills').resolve(),
        'agent': agent,
        'effective_tools': ['skill-docs'],
        'skills': [skill]
    })()
    res = await skill_docs_tool({'skill_id': 'visit-prep', 'doc': '../../skill.yaml'}, ctx)
    assert res.success is False
    assert 'escapes' in res.error.lower() or 'sandbox' in res.error.lower() or 'forbidden' in res.error.lower()

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F07-B03',
      name: 'skill-docs rejects unsupported executable or code file extensions in references/',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const refDir = path.join(ws, 'skills', 'custom-skill', 'references');
          fs.mkdirSync(refDir, { recursive: true });
          fs.writeFileSync(path.join(refDir, 'exploit.py'), 'print("hacked")');

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.skill_docs import skill_docs_tool

async def main():
    agent = type('Agent', (), {'id': 'custom-agent', 'skills': ['custom-skill']})()
    skill = type('Skill', (), {'id': 'custom-skill'})()
    ctx = type('Ctx', (), {
        'workspace_root': Path('${ws}'),
        'skills_dir': Path('${ws}') / 'skills',
        'agent': agent,
        'effective_tools': ['skill-docs'],
        'skills': [skill]
    })()
    res = await skill_docs_tool({'skill_id': 'custom-skill', 'doc': 'exploit.py'}, ctx)
    assert res.success is False
    assert 'unsupported' in res.error.lower() or 'only' in res.error.lower()

asyncio.run(main())
`;
          const res = runPython(script);
          assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F07-B04',
      name: 'skill-docs gracefully handles skill without references/ directory',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const skillDir = path.join(ws, 'skills', 'empty-skill');
          fs.mkdirSync(skillDir, { recursive: true });

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.skill_docs import skill_docs_tool

async def main():
    agent = type('Agent', (), {'id': 'empty-agent', 'skills': ['empty-skill']})()
    skill = type('Skill', (), {'id': 'empty-skill'})()
    ctx = type('Ctx', (), {
        'workspace_root': Path('${ws}'),
        'skills_dir': Path('${ws}') / 'skills',
        'agent': agent,
        'effective_tools': ['skill-docs'],
        'skills': [skill]
    })()
    res = await skill_docs_tool({'skill_id': 'empty-skill', 'doc': 'guide.md'}, ctx)
    assert res.success is False
    assert 'no references' in res.error.lower() or 'not found' in res.error.lower()

asyncio.run(main())
`;
          const res = runPython(script);
          assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F07-B05',
      name: 'skill-docs rejects requests when agent has empty declared skills list',
      fn: () => {
        const script = `
import asyncio
from pathlib import Path
from carefold.tools.skill_docs import skill_docs_tool

async def main():
    agent = type('Agent', (), {'id': 'lonely-agent', 'skills': []})()
    ctx = type('Ctx', (), {
        'workspace_root': Path('.').resolve(),
        'skills_dir': Path('skills').resolve(),
        'agent': agent,
        'effective_tools': ['skill-docs'],
        'skills': []
    })()
    res = await skill_docs_tool({'skill_id': 'visit-prep', 'doc': 'questions_guide.md'}, ctx)
    assert res.success is False
    assert 'not declared' in res.error.lower() or 'undeclared' in res.error.lower()

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
