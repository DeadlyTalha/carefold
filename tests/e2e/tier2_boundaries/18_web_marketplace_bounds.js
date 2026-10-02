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

export const name = 'F18-B: Web Marketplace Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F18-B01',
      name: 'GET /api/agents?risk_class=admin filters catalog exclusively to admin agents',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.get("/api/agents?risk_class=admin")
assert resp.status_code == 200
data = resp.json()
assert len(data) >= 1
for a in data:
    assert a["risk_class"] == "admin"
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-B02',
      name: 'GET /api/agents?search=steward performs case-insensitive substring search',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.get("/api/agents?search=STEWARD")
assert resp.status_code == 200
data = resp.json()
assert len(data) == 1
assert data[0]["id"] == "visit-steward"
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-B03',
      name: 'GET /api/agents?search=nonexistent returns empty list with 200 OK',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.get("/api/agents?search=completely_nonexistent_agent_query_123")
assert resp.status_code == 200
data = resp.json()
assert data == []
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-B04',
      name: 'GET /api/agents handles special characters and symbols in query gracefully',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
for query in ["!@#$%^&*()", "'; DROP TABLE agents;--", "../../../etc/passwd"]:
    resp = client.get(f"/api/agents?search={query}")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F18-B05',
      name: 'GET /api/agents?risk_class=unsupported_class returns empty list with 200 OK',
      fn: () => {
        const script = `
from fastapi.testclient import TestClient
from carefold.main import app

client = TestClient(app)
resp = client.get("/api/agents?risk_class=unsupported_risk_level")
assert resp.status_code == 200
assert resp.json() == []
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
