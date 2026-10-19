/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan (https://spectrayan.com)
 *
 * Licensed under the PolyForm Noncommercial License 1.0.0 and the
 * Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
 * Personal and household local use only. Commercial use, hosted service
 * offering, rebranding, white-labeling, and redistribution of modified
 * forks are prohibited without a written commercial license from Spectrayan.
 *
 * Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)
 */

import { describe, it, expect } from 'vitest';
import {
  productName,
  storageNamespace,
  CAREFOLD_STORAGE_KEYS,
  CarefoldLogo,
  carefoldLightTokens,
  carefoldDarkTokens
} from '../src/theme';
import { getScopedStorageKey, ScopedStorage } from '../src/lib/storageNamespace';

describe('GU5 Storage Key Preservation & Theme Token Invariants', () => {
  it('preserves exactly product name "Carefold" and storage namespace "carefold"', () => {
    expect(productName).toBe('Carefold');
    expect(storageNamespace).toBe('carefold');
  });

  it('preserves all 52 distinct Carefold storage and event keys/patterns', () => {
    expect(CAREFOLD_STORAGE_KEYS.length).toBe(52);

    // Verify critical storage keys are present
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_session');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_active_profile');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_theme');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_user_settings_v1');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_household_profiles_v1');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_viewer_invitations');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_share_bundles');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_setup_complete');

    // Verify guest keys
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_guest_user_settings_v1');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_guest_notes');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_guest_vitals_records');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_guest_preventive_records');

    // Verify prefix patterns
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_msgs_');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold_thread_');

    // Verify custom events
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:storage-detached');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:settings-changed');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:household-profiles-changed');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:locale-change');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:conversation-deleted');
    expect(CAREFOLD_STORAGE_KEYS).toContain('carefold:conversations-cleared');
  });

  it('generates storage keys strictly using the carefold namespace', () => {
    const guestKey = getScopedStorageKey(null, 'test_key');
    expect(guestKey).toMatch(/^carefold_guest_/);

    const userKey = getScopedStorageKey('usr-123', 'test_key');
    expect(userKey).toMatch(/^carefold_usr-123_/);

    const storage = new ScopedStorage({ userId: 'usr-abc' });
    expect(storage.getKey('prefs')).toBe('carefold_usr-abc_prefs');
  });

  it('exports valid CarefoldLogo component and dual-variable token maps', () => {
    expect(CarefoldLogo).toBeDefined();

    // Light tokens must define both --ui-* and --cf-* counterparts
    expect(carefoldLightTokens['--ui-bg-canvas']).toBe('#f7faf8');
    expect(carefoldLightTokens['--cf-canvas']).toBe('#f7faf8');
    expect(carefoldLightTokens['--ui-fg-default']).toBe('#0f172a');
    expect(carefoldLightTokens['--cf-fg']).toBe('#0f172a');
    expect(carefoldLightTokens['--ui-action-primary']).toBe('#047857');
    expect(carefoldLightTokens['--cf-primary']).toBe('#047857');

    // Dark tokens must define both --ui-* and --cf-* counterparts
    expect(carefoldDarkTokens['--ui-bg-canvas']).toBe('#0b1220');
    expect(carefoldDarkTokens['--cf-canvas']).toBe('#0b1220');
    expect(carefoldDarkTokens['--ui-action-primary']).toBe('#10b981');
    expect(carefoldDarkTokens['--cf-primary']).toBe('#10b981');
  });
});
