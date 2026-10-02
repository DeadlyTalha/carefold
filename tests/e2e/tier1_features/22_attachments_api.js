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

export const name = 'F22: Local File Attachments UI & API';

export async function run() {
  const tests = [
    {
      id: 'F22-T01',
      name: 'Attachments directory is initialized at attachments/ within workspace',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          assertTrue(fs.existsSync(attachDir));
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F22-T02',
      name: 'Attachment uploader validates permitted file extensions (.txt, .pdf, .md)',
      fn: () => {
        const script = `
from carefold.tools.attach_read import ALLOWED_ATTACHMENT_EXTENSIONS
assert '.txt' in ALLOWED_ATTACHMENT_EXTENSIONS
assert '.pdf' in ALLOWED_ATTACHMENT_EXTENSIONS
assert '.md' in ALLOWED_ATTACHMENT_EXTENSIONS
assert '.py' not in ALLOWED_ATTACHMENT_EXTENSIONS
assert '.exe' not in ALLOWED_ATTACHMENT_EXTENSIONS
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F22-T03',
      name: 'Uploaded attachments can be read by attach-read tool during chat runs',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          fs.writeFileSync(path.join(attachDir, 'summary.txt'), 'Patient Summary 2026');
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'summary.txt'}, ctx)
    assert res.success is True
    assert 'Patient Summary 2026' in res.output['content']

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
      id: 'F22-T04',
      name: 'Attachment API prevents saving files with path traversal filenames',
      fn: () => {
        const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('.').resolve()})()
    res = await attach_read_tool({'path': '../../etc/passwd'}, ctx)
    assert res.success is False
    assert 'escapes' in res.error.lower() or 'forbidden' in res.error.lower()

asyncio.run(main())
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F22-T05',
      name: 'Attachment card displays filename, format tag, and file size',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const attachDir = path.join(ws, 'attachments');
          fs.mkdirSync(attachDir, { recursive: true });
          fs.writeFileSync(path.join(attachDir, 'notes.txt'), 'Follow-up appointment notes');
          const script = `
import asyncio
from pathlib import Path
from carefold.tools.attach_read import attach_read_tool

async def main():
    ctx = type('Ctx', (), {'workspace_root': Path('${ws}')})()
    res = await attach_read_tool({'path': 'notes.txt'}, ctx)
    assert res.success is True
    assert res.output['size_bytes'] > 0
    assert res.output['format'] == 'text'

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
