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

export function formatTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return '';
  }

  // Calculate maximum width for each column
  const colWidths = headers.map((header, colIndex) => {
    let maxWidth = header.length;
    for (const row of rows) {
      const cell = row[colIndex] || '';
      if (cell.length > maxWidth) {
        maxWidth = cell.length;
      }
    }
    return maxWidth;
  });

  // Render header line
  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('   ');
  const dividerLine = colWidths.map((w) => '─'.repeat(w)).join('   ');

  // Render rows
  const rowLines = rows.map((row) => {
    return headers.map((_, i) => (row[i] || '').padEnd(colWidths[i])).join('   ');
  });

  return [headerLine, dividerLine, ...rowLines].join('\n');
}

export function formatRiskBadge(riskClass: string): string {
  switch (riskClass) {
    case 'wellness':
      return 'wellness';
    case 'admin':
      return 'admin';
    case 'education':
      return 'education';
    case 'clinical_assist':
      return 'clinical_assist [RESTRICTED]';
    default:
      return riskClass;
  }
}
