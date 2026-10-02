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

export const name = 'F22-B: Local File Attachments Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F22-B01',
      name: 'attach-read rejects files exceeding MAX_FILE_SIZE limit (10MB)',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          const hugeFile = path.join(attachDir, 'huge.txt');
          // Create sparse file or 11MB file
          const fd = fs.openSync(hugeFile, 'w');
          fs.writeSync(fd, Buffer.alloc(1), 0, 1, 11 * 1024 * 1024);
          fs.closeSync(fd);

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'huge.txt'}, ctx)
    assert res.success is False
    assert 'exceeds' in res.error.lower() or 'size' in res.error.lower()

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
      id: 'F22-B02',
      name: 'attach-read handles empty attachment file (0 bytes) without failing',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          fs.writeFileSync(path.join(attachDir, 'empty.txt'), '');

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'empty.txt'}, ctx)
    assert res.success is True
    assert res.output['size_bytes'] == 0
    assert res.output['content'] == ''

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
      id: 'F22-B03',
      name: 'attach-read preserves UTF-8 unicode characters in text attachments',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          const utf8Text = 'Symptoms: 🩺 Heart rate 72 bpm, 100°C temp, 日本語, español, café';
          fs.writeFileSync(path.join(attachDir, 'unicode.txt'), utf8Text, 'utf8');

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'unicode.txt'}, ctx)
    assert res.success is True
    assert '🩺' in res.output['content']
    assert '日本語' in res.output['content']

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
      id: 'F22-B04',
      name: 'attach-read allows accessing files in subdirectories nested under attachments/',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const subDir = path.join(ws, 'attachments', 'records', '2026');
          fs.mkdirSync(subDir, { recursive: true });
          fs.writeFileSync(path.join(subDir, 'labs.txt'), 'Cholesterol 180 mg/dL');

          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'records/2026/labs.txt'}, ctx)
    assert res.success is True
    assert 'Cholesterol 180' in res.output['content']

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
      id: 'F22-B05',
      name: 'attach-read neutralizes URL-encoded path traversal tokens (%2e%2e)',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': '%2e%2e%2f%2e%2e%2fetc%2fpasswd'}, ctx)
    assert res.success is False

asyncio.run(main())
`;
          const res = runPython(script);
          assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
        } finally {
          removeTempWorkspace(ws);
        }
      }
    }
  ];

  return tests;
}
