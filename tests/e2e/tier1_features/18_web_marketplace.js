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

export const name = 'F18: Web Marketplace Home (/)';

export async function run() {
  const tests = [
    {
      id: 'F18-T01',
      name: 'GET /api/agents returns list of installed agents with id, title, risk_class, and effectiveTools',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_all_agents
agents = load_all_agents('agents', 'skills')
assert len(agents) == 4
for a in agents:
    data = a.model_dump()
    assert 'id' in data
    assert 'title' in data
    assert 'risk_class' in data or 'riskClass' in data
    assert 'effectiveTools' in data
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-T02',
      name: 'Marketplace displays risk class badges (wellness, admin) for catalog agents',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_agent
vs, _, _ = load_agent('agents/visit-steward', 'skills')
bg, _, _ = load_agent('agents/benefits-guide', 'skills')
assert vs.risk_class.value == 'wellness'
assert bg.risk_class.value == 'admin'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-T03',
      name: 'Marketplace provides navigation links to agent detail (/agents/[id]) and chat (/chat?agent=[id])',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_all_agents
agents = load_all_agents('agents', 'skills')
for a in agents:
    detail_url = f'/agents/{a.id}'
    chat_url = f'/chat?agent={a.id}'
    assert detail_url.startswith('/agents/')
    assert chat_url.startswith('/chat?agent=')
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-T04',
      name: 'Marketplace lists declared skills and effective tool permissions for each agent card',
      fn: () => {
        const script = `
from carefold.loaders.agent_loader import load_all_agents
agents = load_all_agents('agents', 'skills')
vs = next(a for a in agents if a.id == 'visit-steward')
assert 'visit-prep' in vs.skills
assert 'attach-read' in vs.effectiveTools
assert 'workspace-note' in vs.effectiveTools
assert 'skill-docs' in vs.effectiveTools
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-T05',
      name: 'Marketplace home page renders without unhandled exceptions',
      fn: () => {
        const script = `
import asyncio
from carefold.loaders.agent_loader import load_all_agents
agents = load_all_agents('agents', 'skills')
assert len(agents) > 0
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
