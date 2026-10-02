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

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface CliTestWorkspace {
  workspaceDir: string;
  cleanup: () => Promise<void>;
  createFile: (relativePath: string, content: string) => Promise<string>;
  readFile: (relativePath: string) => Promise<string>;
  exists: (relativePath: string) => Promise<boolean>;
}

export async function createCliTestWorkspace(): Promise<CliTestWorkspace> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'carefold-cli-test-'));

  const workspace: CliTestWorkspace = {
    workspaceDir: tmpDir,
    cleanup: async () => {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {}
    },
    createFile: async (relPath: string, content: string) => {
      const fullPath = path.join(tmpDir, relPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
      return fullPath;
    },
    readFile: async (relPath: string) => {
      return fs.readFile(path.join(tmpDir, relPath), 'utf8');
    },
    exists: async (relPath: string) => {
      try {
        await fs.access(path.join(tmpDir, relPath));
        return true;
      } catch {
        return false;
      }
    }
  };

  return workspace;
}
