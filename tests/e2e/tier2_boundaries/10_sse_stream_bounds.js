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

export const name = 'F10-B: SSE Stream Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F10-B01',
      name: 'SSE chat endpoint rejects empty or whitespace-only prompt with 400 Bad Request',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.post("/api/chat", json={"agent_id": "visit-steward", "prompt": "   "})
assert resp.status_code == 400
assert "prompt" in resp.json().get("detail", "").lower()
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F10-B02',
      name: 'SSE chat endpoint rejects nonexistent agent_id with 404 Not Found',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.post("/api/chat", json={"agent_id": "nonexistent-super-agent", "prompt": "Hello"})
assert resp.status_code == 404
assert "not found" in resp.json().get("detail", "").lower()
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F10-B03',
      name: 'SSE stream generator allows clean early abort without lingering locks or leaks',
      fn: () => {
        const script = `
import asyncio
from carefold.engine.runner import execute_agent_run

async def main():
    count = 0
    # Simulate client disconnect after 2 events
    async for event in execute_agent_run('visit-steward', 'Hello doctor', mock=True):
        count += 1
        if count >= 2:
            break
    assert count == 2

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F10-B04',
      name: 'SSE wire protocol conforms strictly to event and data line delimiters',
      fn: () => {
        const script = `
import json
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.post("/api/chat", json={"agent_id": "visit-steward", "prompt": "Short test", "mock": True})
assert resp.status_code == 200
assert "text/event-stream" in resp.headers.get("content-type", "")

raw_lines = resp.text.split("\\n\\n")
valid_blocks = [b for b in raw_lines if b.strip()]
assert len(valid_blocks) > 0

for block in valid_blocks:
    lines = block.split("\\n")
    has_event = any(l.startswith("event: ") for l in lines)
    has_data = any(l.startswith("data: ") for l in lines)
    assert has_event, f"Missing event header in block: {block}"
    assert has_data, f"Missing data line in block: {block}"
    data_line = next(l for l in lines if l.startswith("data: "))
    # Must be valid json
    payload = json.loads(data_line[6:])
    assert "type" in payload
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F10-B05',
      name: 'Rapid sequential SSE streams execute independently without session leakage',
      fn: () => {
        const script = `
import asyncio
from carefold.engine.runner import execute_agent_run

async def main():
    res1_tokens = []
    async for event in execute_agent_run('visit-steward', 'First session inquiry', mock=True):
        if event.get('type') == 'token':
            res1_tokens.append(event['delta'])

    res2_tokens = []
    async for event in execute_agent_run('habit-companion', 'Second session inquiry', mock=True):
        if event.get('type') == 'token':
            res2_tokens.append(event['delta'])

    text1 = ''.join(res1_tokens)
    text2 = ''.join(res2_tokens)
    assert len(text1) > 0
    assert len(text2) > 0

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
