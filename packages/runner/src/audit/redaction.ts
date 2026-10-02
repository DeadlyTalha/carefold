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

import type { AuditEvent } from '../types/audit.js';
import type { CarefoldConfig } from '../types/context.js';

/**
 * Enforces Zero-Body privacy policy (CF-S23, CF-S25).
 * Strips prompt and completion bodies unless store_bodies is strictly true.
 */
export function redactAuditEvent(
  event: AuditEvent,
  configOrStoreBodies?: CarefoldConfig | boolean | { store_bodies?: boolean; storeBodies?: boolean }
): AuditEvent {
  let storeBodies = false;

  if (typeof configOrStoreBodies === 'boolean') {
    storeBodies = configOrStoreBodies;
  } else if (configOrStoreBodies && typeof configOrStoreBodies === 'object') {
    if ('storeBodies' in configOrStoreBodies && (configOrStoreBodies as any).storeBodies === true) {
      storeBodies = true;
    } else if ('store_bodies' in configOrStoreBodies && (configOrStoreBodies as any).store_bodies === true) {
      storeBodies = true;
    } else if ('audit' in configOrStoreBodies && (configOrStoreBodies as any).audit?.store_bodies === true) {
      storeBodies = true;
    }
  }

  const entry: AuditEvent = { ...event };

  if (!storeBodies) {
    delete entry.prompt;
    delete entry.completion;
  }

  return entry;
}
