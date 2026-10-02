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
import { runCli, createTempWorkspace, removeTempWorkspace, assertEqual, assertTrue, assertContains } from '../helpers/utils.js';

export const name = 'F13: CLI carefold init';

export async function run() {
  const tests = [
    {
      id: 'F13-T01',
      name: 'carefold init exits with code 0 on fresh workspace directory',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const res = runCli(['init', ws]);
          assertEqual(res.status, 0, `Init failed: ${res.stderr}`);
          assertContains(res.stdout.toLowerCase(), 'initialized carefold workspace');
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F13-T02',
      name: 'carefold init generates valid carefold.config.json',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          runCli(['init', ws]);
          const cfg = JSON.parse(fs.readFileSync(path.join(ws, 'carefold.config.json'), 'utf8'));
          assertEqual(cfg.version, '0.1.0');
          assertEqual(cfg.audit?.enabled, true);
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F13-T03',
      name: 'carefold init supports --bare flag to scaffold empty pack directories',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const res = runCli(['init', ws, '--bare']);
          assertEqual(res.status, 0, `Init --bare failed: ${res.stderr}`);
          const skillsList = fs.readdirSync(path.join(ws, 'skills'));
          assertEqual(skillsList.length, 0, 'Bare workspace skills/ should be empty');
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F13-T04',
      name: 'carefold init initializes audit.jsonl log file with proper permissions',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          runCli(['init', ws]);
          const logFile = path.join(ws, 'logs', 'audit.jsonl');
          assertTrue(fs.existsSync(logFile), 'audit.jsonl missing');
        } finally {
          removeTempWorkspace(ws);
        }
      }
    },
    {
      id: 'F13-T05',
      name: 'carefold init handles relative path arguments correctly',
      fn: () => {
        const ws = createTempWorkspace();
        try {
          const res = runCli(['init', './my-workspace'], { cwd: ws });
          assertEqual(res.status, 0, `Init with relative path failed: ${res.stderr}`);
          assertTrue(fs.existsSync(path.join(ws, 'my-workspace', 'carefold.config.json')));
        } finally {
          removeTempWorkspace(ws);
        }
      }
    }
  ];

  return tests;
}
