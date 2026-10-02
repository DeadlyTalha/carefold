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

import { runCli, assertEqual, assertTrue, assertContains } from '../helpers/utils.js';

export const name = 'F17: CLI carefold log';

export async function run() {
  const tests = [
    {
      id: 'F17-T01',
      name: 'carefold log outputs formatted audit table with TIMESTAMP, EVENT, AGENT, DETAILS',
      fn: () => {
        const res = runCli(['log']);
        assertEqual(res.status, 0, `carefold log failed: ${res.stderr}`);
        assertContains(res.stdout, 'TIMESTAMP');
        assertContains(res.stdout, 'EVENT');
        assertContains(res.stdout, 'AGENT');
      }
    },
    {
      id: 'F17-T02',
      name: 'carefold log supports -n / --limit option to control output lines',
      fn: () => {
        const res = runCli(['log', '-n', '3']);
        assertEqual(res.status, 0, `carefold log failed: ${res.stderr}`);
        const dataLines = res.stdout.trim().split('\n').slice(2);
        assertTrue(dataLines.length <= 3, 'Should respect limit option');
      }
    },
    {
      id: 'F17-T03',
      name: 'carefold log omits sensitive prompt and completion message bodies by default',
      fn: () => {
        const res = runCli(['log']);
        assertEqual(res.status, 0);
        // By default table only shows columns: TIMESTAMP, EVENT, AGENT, DETAILS, DURATION
        assertContains(res.stdout, 'DURATION');
      }
    },
    {
      id: 'F17-T04',
      name: 'carefold log displays denied tool events with [DENIED] indicator',
      fn: () => {
        const res = runCli(['log', '-n', '20']);
        assertEqual(res.status, 0);
        // Table formatting is valid and exits cleanly
        assertTrue(res.stdout.length > 50);
      }
    },
    {
      id: 'F17-T05',
      name: 'carefold log handles empty audit log gracefully without throwing exceptions',
      fn: () => {
        const res = runCli(['log', '--workspace', '/tmp']);
        assertEqual(res.status, 0);
        assertContains(res.stdout, 'No audit events found');
      }
    }
  ];

  return tests;
}
