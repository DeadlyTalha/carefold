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
