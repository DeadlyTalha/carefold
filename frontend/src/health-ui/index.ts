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

import React from 'react';

// Health UI components
export {
  BloodPressureTrendChart,
  DiurnalTrendTable,
  LogVitalsModal,
  VitalsSummaryCards,
} from '@/components/vitals';

export {
  AppointmentCard,
  HowToBookSheet,
  RemindersChecklist,
} from '@/components/appointments';

export {
  PreventiveChecklist,
  ScheduleSourceSelector,
} from '@/components/preventive';

export {
  ClinicalImportWizard,
  ImportStagingReviewTable,
} from '@/components/imports';

export {
  SchoolFormPrefillSheet,
  SchoolFormsPanel,
} from '@/components/school-forms';

export { VisitPrepCard } from '@/components/chat/VisitPrepCard';
export { InsuranceBenefitsCard } from '@/components/chat/InsuranceBenefitsCard';
export { EmergencyEscalationCard } from '@/components/chat/EmergencyEscalationCard';
export { ClinicalConsentDialog } from '@/components/ClinicalConsentDialog';

// Slot and Pack Types
export type SlotId =
  | 'dashboard.card'
  | 'sidebar.item'
  | 'profile.detail'
  | 'chat.messageRenderer'
  | 'chat.composerAction'
  | 'chat.beforeSend'
  | 'settings.section'
  | 'onboarding.step';

export interface SlotContribution<P = Record<string, any>> {
  id: string;
  pack: string;
  slot: SlotId;
  title: string;
  icon?: string;
  order?: number;
  route?: string;
  requiredScopes: string[];
  audiences?: ('adult' | 'teen' | 'child' | 'viewer')[];
  messageKind?: string;
  load?: () => Promise<{ default: React.ComponentType<P> }>;
  component?: React.ComponentType<P>;
}

export interface SlotProps {
  profileId: string;
  scopes: string[];
  density?: 'compact' | 'comfortable';
}

export interface PackUi {
  pack: string;
  contributions: SlotContribution[];
  messages: Record<string, Record<string, string>>;
}

export function definePackUi(def: {
  pack: string;
  contributions: SlotContribution[];
  messages?: Record<string, Record<string, string>>;
}): PackUi {
  return {
    pack: def.pack,
    contributions: def.contributions,
    messages: def.messages || {},
  };
}

export const healthSlotContributions: SlotContribution[] = [
  {
    id: 'health.vitals.card',
    pack: 'health',
    slot: 'dashboard.card',
    title: 'Vitals & Biometrics',
    icon: 'Activity',
    order: 10,
    route: '/vitals',
    requiredScopes: ['health.clinical'],
    audiences: ['adult', 'teen', 'viewer'],
  },
  {
    id: 'health.appointments.card',
    pack: 'health',
    slot: 'dashboard.card',
    title: 'Upcoming Care & Visits',
    icon: 'Calendar',
    order: 20,
    route: '/appointments',
    requiredScopes: ['health.clinical'],
    audiences: ['adult', 'teen', 'viewer'],
  },
  {
    id: 'health.preventive.card',
    pack: 'health',
    slot: 'dashboard.card',
    title: 'Preventive Care Guidelines',
    icon: 'ShieldCheck',
    order: 30,
    route: '/preventive',
    requiredScopes: ['health.clinical'],
    audiences: ['adult', 'teen'],
  },
  {
    id: 'health.school-forms.card',
    pack: 'health',
    slot: 'dashboard.card',
    title: 'School & Camp Forms',
    icon: 'FileText',
    order: 40,
    route: '/schedule',
    requiredScopes: ['health.clinical'],
    audiences: ['adult', 'teen'],
  },
  {
    id: 'health.dossier.renderer',
    pack: 'health',
    slot: 'chat.messageRenderer',
    title: 'Health Dossier Renderer',
    messageKind: 'health.dossier',
    requiredScopes: ['health.clinical', 'health.paperwork'],
  },
  {
    id: 'health.emergency.renderer',
    pack: 'health',
    slot: 'chat.messageRenderer',
    title: 'Emergency Red-Flag Escalation',
    messageKind: 'health.emergency',
    requiredScopes: ['health.clinical'],
  },
  {
    id: 'health.consent.gate',
    pack: 'health',
    slot: 'chat.beforeSend',
    title: 'Clinical Consent Gate',
    requiredScopes: ['health.clinical'],
  },
  {
    id: 'health.clinical-consent.settings',
    pack: 'health',
    slot: 'settings.section',
    title: 'Clinical Assist Consents',
    order: 50,
    requiredScopes: ['health.clinical'],
  },
];

export const healthPackUi: PackUi = definePackUi({
  pack: 'health',
  contributions: healthSlotContributions,
  messages: {
    'en-US': {
      'health.vitals.title': 'Vitals & Biometrics',
      'health.appointments.title': 'Upcoming Appointments',
      'health.preventive.title': 'Preventive Care',
      'health.school-forms.title': 'School & Activity Forms',
      'health.emergency.title': 'Emergency Escalation',
    },
  },
});
