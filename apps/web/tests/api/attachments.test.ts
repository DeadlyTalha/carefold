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

import { describe, it, expect, afterEach } from 'vitest';
import { POST } from '@/app/api/attachments/route';
import { findWorkspaceRoot, getWorkspacePaths } from '@/lib/workspace';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('POST /api/attachments', () => {
  const testFilename = 'test_upload_summary.txt';
  const wsRoot = findWorkspaceRoot();
  const paths = getWorkspacePaths(wsRoot);
  const attachmentsDir = paths.attachments;

  afterEach(async () => {
    try {
      await fs.unlink(path.join(attachmentsDir, testFilename));
    } catch {}
    try {
      await fs.unlink(path.join(attachmentsDir, 'passwd.txt'));
    } catch {}
  });

  it('accepts and writes valid text attachment into attachments/ directory', async () => {
    const formData = new FormData();
    const file = new File(['Appointment notes and symptoms'], testFilename, { type: 'text/plain' });
    formData.append('file', file);

    const req = new Request('http://localhost:3000/api/attachments', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.filename).toBe(testFilename);
    expect(data.path).toBe(`attachments/${testFilename}`);

    const diskContent = await fs.readFile(path.join(attachmentsDir, testFilename), 'utf8');
    expect(diskContent).toBe('Appointment notes and symptoms');
  });

  it('rejects forbidden executable and binary file formats', async () => {
    const formData = new FormData();
    const file = new File(['bad payload'], 'malware.exe', { type: 'application/x-msdownload' });
    formData.append('file', file);

    const req = new Request('http://localhost:3000/api/attachments', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Unsupported file format');
  });

  it('rejects path traversal attempts in filename or sanitizes safely', async () => {
    const formData = new FormData();
    const file = new File(['content'], '../../../etc/passwd.txt', { type: 'text/plain' });
    formData.append('file', file);

    const req = new Request('http://localhost:3000/api/attachments', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    if (res.status === 201) {
      const data = await res.json();
      expect(data.filename).not.toContain('..');
      expect(data.path).toBe('attachments/passwd.txt');
    } else {
      expect(res.status).toBe(400);
    }
  });
});
