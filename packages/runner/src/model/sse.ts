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

import type { ModelStreamChunk } from './types.js';

/**
 * Parses a Server-Sent Events (SSE) stream into structured ModelStreamChunks
 */
export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  fallbackModel: string = 'local-model'
): AsyncGenerator<ModelStreamChunk, void, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) {
          continue; // Keepalive or comment line
        }

        if (trimmed.startsWith('data:')) {
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(payload) as ModelStreamChunk;
            if (!parsed.model) {
              parsed.model = fallbackModel;
            }
            yield parsed;
          } catch (jsonErr) {
            // Ignore malformed chunk fragments
          }
        }
      }
    }

    // Process remainder of buffer
    if (buffer.trim().startsWith('data:')) {
      const payload = buffer.trim().slice(5).trim();
      if (payload !== '[DONE]') {
        try {
          const parsed = JSON.parse(payload) as ModelStreamChunk;
          if (!parsed.model) {
            parsed.model = fallbackModel;
          }
          yield parsed;
        } catch {}
      }
    }
  } finally {
    reader.releaseLock();
  }
}
