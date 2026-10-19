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

/**
 * Carefold Design Tokens (W3C DTCG compliant).
 * Emits both --ui-* (Yarvelle standard) and --cf-* (Carefold legacy) CSS variable maps.
 */

export interface TokenValue {
  $value: string;
  $type: 'color' | 'dimension' | 'shadow' | 'duration' | 'cubicBezier' | 'fontFamily' | 'fontWeight';
  $description?: string;
}

export interface SemanticTokenMap {
  [category: string]: {
    [key: string]: string;
  };
}

export const carefoldLightTokens: Record<string, string> = {
  // Surfaces
  '--ui-bg-canvas': '#f7faf8',
  '--cf-canvas': '#f7faf8',
  '--ui-bg-surface': '#ffffff',
  '--cf-surface': '#ffffff',
  '--ui-bg-surface-2': '#f1f5f4',
  '--cf-surface-2': '#f1f5f4',
  '--ui-bg-surface-3': '#e7eeeb',
  '--cf-surface-3': '#e7eeeb',
  '--ui-bg-rail': '#f2f7f4',
  '--cf-rail': '#f2f7f4',
  '--ui-bg-overlay': 'rgb(15 23 42 / 0.40)',
  '--cf-overlay': 'rgb(15 23 42 / 0.40)',

  // Foreground
  '--ui-fg-default': '#0f172a',
  '--cf-fg': '#0f172a',
  '--ui-fg-muted': '#475569',
  '--cf-fg-muted': '#475569',
  '--ui-fg-subtle': '#5b6b7f',
  '--cf-fg-subtle': '#5b6b7f',
  '--ui-fg-on-primary': '#ffffff',
  '--cf-fg-on-primary': '#ffffff',
  '--ui-fg-link': '#047857',
  '--cf-fg-link': '#047857',

  // Borders
  '--ui-border-default': '#e2e8e5',
  '--cf-border': '#e2e8e5',
  '--ui-border-strong': '#7f8ea3',
  '--cf-border-strong': '#7f8ea3',

  // Primary & Brand
  '--ui-action-primary': '#047857',
  '--cf-primary': '#047857',
  '--ui-action-primary-hover': '#065f46',
  '--cf-primary-hover': '#065f46',
  '--ui-action-primary-soft': '#ecfdf5',
  '--cf-primary-soft': '#ecfdf5',
  '--ui-action-primary-soft-fg': '#065f46',
  '--cf-primary-soft-fg': '#065f46',
  '--ui-brand': '#059669',
  '--cf-brand': '#059669',
  '--ui-brand-mint': '#10b981',
  '--cf-brand-mint': '#10b981',

  // Status & Emergency
  '--ui-status-info-bg': '#eef2ff',
  '--cf-info-bg': '#eef2ff',
  '--ui-status-info-fg': '#3730a3',
  '--cf-info-fg': '#3730a3',
  '--ui-status-warn-bg': '#fffbeb',
  '--cf-warn-bg': '#fffbeb',
  '--ui-status-warn-fg': '#92400e',
  '--cf-warn-fg': '#92400e',
  '--ui-status-danger-bg': '#fef2f2',
  '--cf-danger-bg': '#fef2f2',
  '--ui-status-danger-fg': '#b91c1c',
  '--cf-danger-fg': '#b91c1c',
  '--ui-status-success-bg': '#ecfdf5',
  '--cf-success-bg': '#ecfdf5',
  '--ui-status-success-fg': '#065f46',
  '--cf-success-fg': '#065f46',
  '--ui-emergency': '#b91c1c',
  '--cf-emergency': '#b91c1c',
  '--ui-emergency-fg': '#ffffff',
  '--cf-emergency-fg': '#ffffff',

  // Focus
  '--ui-focus-ring': '#047857',
  '--cf-focus': '#047857',

  // Radius
  '--ui-radius-sm': '6px',
  '--cf-radius-sm': '6px',
  '--ui-radius-md': '10px',
  '--cf-radius-md': '10px',
  '--ui-radius-lg': '14px',
  '--cf-radius-lg': '14px',
  '--ui-radius-xl': '20px',
  '--cf-radius-xl': '20px',
  '--ui-radius-full': '9999px',
  '--cf-radius-full': '9999px',
};

export const carefoldDarkTokens: Record<string, string> = {
  // Surfaces
  '--ui-bg-canvas': '#0b1220',
  '--cf-canvas': '#0b1220',
  '--ui-bg-surface': '#111a2b',
  '--cf-surface': '#111a2b',
  '--ui-bg-surface-2': '#16213a',
  '--cf-surface-2': '#16213a',
  '--ui-bg-surface-3': '#1d2a45',
  '--cf-surface-3': '#1d2a45',
  '--ui-bg-rail': '#0e1726',
  '--cf-rail': '#0e1726',
  '--ui-bg-overlay': 'rgb(2 6 23 / 0.60)',
  '--cf-overlay': 'rgb(2 6 23 / 0.60)',

  // Foreground
  '--ui-fg-default': '#e2e8f0',
  '--cf-fg': '#e2e8f0',
  '--ui-fg-muted': '#94a3b8',
  '--cf-fg-muted': '#94a3b8',
  '--ui-fg-subtle': '#8291a7',
  '--cf-fg-subtle': '#8291a7',
  '--ui-fg-on-primary': '#04201a',
  '--cf-fg-on-primary': '#04201a',
  '--ui-fg-link': '#34d399',
  '--cf-fg-link': '#34d399',

  // Borders
  '--ui-border-default': '#1f2c44',
  '--cf-border': '#1f2c44',
  '--ui-border-strong': '#5b6e8a',
  '--cf-border-strong': '#5b6e8a',

  // Primary & Brand
  '--ui-action-primary': '#10b981',
  '--cf-primary': '#10b981',
  '--ui-action-primary-hover': '#34d399',
  '--cf-primary-hover': '#34d399',
  '--ui-action-primary-soft': 'rgb(16 185 129 / 0.12)',
  '--cf-primary-soft': 'rgb(16 185 129 / 0.12)',
  '--ui-action-primary-soft-fg': '#6ee7b7',
  '--cf-primary-soft-fg': '#6ee7b7',
  '--ui-brand': '#34d399',
  '--cf-brand': '#34d399',
  '--ui-brand-mint': '#10b981',
  '--cf-brand-mint': '#10b981',

  // Status & Emergency
  '--ui-status-info-bg': 'rgb(99 102 241 / 0.14)',
  '--cf-info-bg': 'rgb(99 102 241 / 0.14)',
  '--ui-status-info-fg': '#c7d2fe',
  '--cf-info-fg': '#c7d2fe',
  '--ui-status-warn-bg': 'rgb(245 158 11 / 0.12)',
  '--cf-warn-bg': 'rgb(245 158 11 / 0.12)',
  '--ui-status-warn-fg': '#fcd34d',
  '--cf-warn-fg': '#fcd34d',
  '--ui-status-danger-bg': 'rgb(239 68 68 / 0.12)',
  '--cf-danger-bg': 'rgb(239 68 68 / 0.12)',
  '--ui-status-danger-fg': '#fca5a5',
  '--cf-danger-fg': '#fca5a5',
  '--ui-status-success-bg': 'rgb(16 185 129 / 0.12)',
  '--cf-success-bg': 'rgb(16 185 129 / 0.12)',
  '--ui-status-success-fg': '#6ee7b7',
  '--cf-success-fg': '#6ee7b7',
  '--ui-emergency': '#b91c1c',
  '--cf-emergency': '#b91c1c',
  '--ui-emergency-fg': '#ffffff',
  '--cf-emergency-fg': '#ffffff',

  // Focus
  '--ui-focus-ring': '#34d399',
  '--cf-focus': '#34d399',

  // Radius
  '--ui-radius-sm': '6px',
  '--cf-radius-sm': '6px',
  '--ui-radius-md': '10px',
  '--cf-radius-md': '10px',
  '--ui-radius-lg': '14px',
  '--cf-radius-lg': '14px',
  '--ui-radius-xl': '20px',
  '--cf-radius-xl': '20px',
  '--ui-radius-full': '9999px',
  '--cf-radius-full': '9999px',
};
