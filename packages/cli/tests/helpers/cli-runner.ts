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

import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RunCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RunCliOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

const BIN_PATH = path.resolve(__dirname, '../../bin/carefold.js');

/**
 * Execute CLI binary in child process
 */
export async function runCli(args: string[], options: RunCliOptions = {}): Promise<RunCliResult> {
  const nodeBinary = process.execPath;
  const entryPath = BIN_PATH;

  try {
    const { stdout, stderr } = await execFileAsync(nodeBinary, [entryPath, ...args], {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        CAREFOLD_CLI_TEST: '1',
        ...options.env
      },
      timeout: options.timeout || 15000
    });

    return {
      exitCode: 0,
      stdout: stdout.toString(),
      stderr: stderr.toString()
    };
  } catch (err: any) {
    return {
      exitCode: typeof err.code === 'number' ? err.code : 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : err.message
    };
  }
}
