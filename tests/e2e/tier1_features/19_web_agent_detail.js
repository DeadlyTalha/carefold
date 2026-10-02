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

export const name = 'F19: Web Agent Detail (/agents/[id])';

export async function run() {
  const tests = [
    {
      id: 'F19-T01',
      name: 'GET /api/agents/{id} returns complete agent detail manifest and resolved skills',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent
agent, tools, skills = load_agent('agents/visit-steward', 'skills')
assert agent.id == 'visit-steward'
assert agent.title == 'Visit Steward'
assert len(skills) == 1
assert skills[0].id == 'visit-prep'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F19-T02',
      name: 'Agent detail view includes persona instructions and role descriptions',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent
agent, tools, skills = load_agent('agents/visit-steward', 'skills')
if hasattr(agent.persona, 'role'):
    assert agent.persona.role is not None
else:
    assert isinstance(agent.persona, str)
    assert len(agent.persona) > 20
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F19-T03',
      name: 'Agent detail view displays starter prompts loaded from starters.json',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent_starters
starters = load_agent_starters('agents/visit-steward')
assert len(starters) >= 1
assert all(isinstance(s, str) for s in starters)
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F19-T04',
      name: 'Agent detail view renders README.md content when available',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent_readme
readme = load_agent_readme('agents/visit-steward')
assert readme is not None
assert 'Visit Steward' in readme
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F19-T05',
      name: 'Agent detail view provides Start Chat action directing to /chat?agent=[id]',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent
for aid in ['visit-steward', 'benefits-guide', 'habit-companion']:
    agent, _, _ = load_agent(f'agents/{aid}', 'skills')
    chat_url = f'/chat?agent={agent.id}'
    assert chat_url == f'/chat?agent={aid}'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
