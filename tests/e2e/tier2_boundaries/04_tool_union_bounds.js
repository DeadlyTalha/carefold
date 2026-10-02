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

export const name = 'F04-B: Tool Allowlist Union Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F04-B01',
      name: 'Union engine handles empty agent tools and empty skill tools cleanly',
      fn: () => {
        const script = `
from carefold.loaders.union import compute_effective_tools
res = compute_effective_tools([], [])
assert res == []
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F04-B02',
      name: 'Union engine handles None tools inputs safely without throwing TypeError',
      fn: () => {
        const script = `
from carefold.loaders.union import compute_effective_tools
res = compute_effective_tools(None, None)
assert res == []
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F04-B03',
      name: 'Union engine preserves deterministic ordering across multiple runs',
      fn: () => {
        const script = `
from carefold.loaders.union import compute_effective_tools
r1 = compute_effective_tools(['workspace-note'], [['skill-docs'], ['attach-read']])
r2 = compute_effective_tools(['workspace-note'], [['skill-docs'], ['attach-read']])
assert r1 == r2
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F04-B04',
      name: 'validate_tools_in_phase0 rejects shell and file-write tools outside closed registry',
      fn: () => {
        const script = `
from carefold.loaders.union import validate_tools_in_phase0, ToolValidationError
for dangerous_tool in ['bash', 'sh', 'exec', 'file-write', 'network-fetch', 'sql']:
    try:
        validate_tools_in_phase0([dangerous_tool])
        assert False, f'Failed to reject {dangerous_tool}'
    except ToolValidationError:
        pass
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F04-B05',
      name: 'Union engine ignores duplicate tool declarations across multiple skills',
      fn: () => {
        const script = `
from carefold.loaders.union import compute_effective_tools
res = compute_effective_tools(
    ['attach-read'],
    [['attach-read', 'skill-docs'], ['skill-docs'], ['attach-read']]
)
assert len(res) == 2
assert set(res) == {'attach-read', 'skill-docs'}
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
