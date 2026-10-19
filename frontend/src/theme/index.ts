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

export const productName = 'Carefold';
export const storageNamespace = 'carefold';

export { CarefoldLogo, type CarefoldLogoProps } from './CarefoldLogo';
export {
  carefoldLightTokens,
  carefoldDarkTokens,
  type TokenValue,
  type SemanticTokenMap
} from './tokens';

/**
 * 52 distinct Carefold storage and event keys/patterns preserved per GU5.
 */
export const CAREFOLD_STORAGE_KEYS = [
  // Auth & Session
  'carefold_session',
  'carefold_active_profile',
  'carefold_theme',
  'carefold_user_settings_v1',
  'carefold_household_profiles_v1',
  'carefold_viewer_invitations',
  'carefold_share_bundles',
  'carefold_setup_complete',

  // Guest scoped keys
  'carefold_guest_user_settings_v1',
  'carefold_guest_recent_agents',
  'carefold_guest_notes',
  'carefold_guest_reminders',
  'carefold_guest_routines',
  'carefold_guest_preventive_records',
  'carefold_guest_vitals_records',
  'carefold_guest_appointment_drafts',
  'carefold_guest_school_forms',
  'carefold_guest_imports_history',

  // Dynamic parameterized patterns
  'carefold_msgs_', // carefold_msgs_${threadId}
  'carefold_thread_', // carefold_thread_${agentId}
  'carefold_teen_handover_dismissed_', // carefold_teen_handover_dismissed_${profileId}
  'carefold_memory_paused_', // carefold_memory_paused_${profileId}

  // Preferences & Diagnostics
  'carefold_custom_endpoint',
  'carefold_model_preferences',
  'carefold_sidebar_collapsed',
  'carefold_diagnostic_logs',
  'carefold_audit_filter',
  'carefold_starred_agents',
  'carefold_recent_searches',
  'carefold_consent_dismissed',
  'carefold_clinical_consent_', // carefold_clinical_consent_${agentId}
  'carefold_clinical_consents',
  'carefold_locale',
  'carefold_active_thread_id',
  'carefold_draft_', // carefold_draft_${threadId}
  'carefold_onboarding_status',
  'carefold_export_history',
  'carefold_dismissed_announcements',
  'carefold_last_sync_', // carefold_last_sync_${profileId}
  'carefold_pending_approvals',
  'carefold_active_panel',
  'carefold_font_size',
  'carefold_motion_reduced',
  'carefold_high_contrast',

  // Storage and Domain Custom Events
  'carefold:storage-detached',
  'carefold:settings-changed',
  'carefold:household-profiles-changed',
  'carefold:locale-change',
  'carefold:conversation-deleted',
  'carefold:conversations-cleared',
  'carefold:setup-changed',
  'carefold:clinical-consent-updated',
] as const;

export type CarefoldStorageKey = typeof CAREFOLD_STORAGE_KEYS[number];
