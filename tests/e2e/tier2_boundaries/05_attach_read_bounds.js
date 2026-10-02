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

export const name = 'F05-B: attach-read Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F05-B01',
      name: 'attach-read rejects directory traversal attempts using ../',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': '../../../etc/passwd'}, ctx)
    assert res.success is False
    assert 'escapes' in res.error.lower() or 'forbidden' in res.error.lower()

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
      id: 'F05-B02',
      name: 'attach-read rejects absolute root paths',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': '/etc/passwd'}, ctx)
    assert res.success is False
    assert 'escapes' in res.error.lower() or 'forbidden' in res.error.lower()

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
      id: 'F05-B03',
      name: 'attach-read rejects forbidden file extensions like .py, .sh, .exe',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          fs.writeFileSync(path.join(attachDir, 'script.py'), 'print("exploit")');
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'script.py'}, ctx)
    assert res.success is False
    assert 'unsupported' in res.error.lower()

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
      id: 'F05-B04',
      name: 'attach-read rejects symlinks pointing outside attachments directory',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          const secretFile = path.join(ws, 'secret.txt');
          fs.writeFileSync(secretFile, 'secret data');
          try {
            fs.symlinkSync(secretFile, path.join(attachDir, 'symlink.txt'));
          } catch {}
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'symlink.txt'}, ctx)
    assert res.success is False
    assert 'escapes' in res.error.lower() or 'symlink' in res.error.lower() or 'forbidden' in res.error.lower()

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
      id: 'F05-B05',
      name: 'attach-read rejects null byte poison in path string',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'valid.txt\\x00.exe'}, ctx)
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
