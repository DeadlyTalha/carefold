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

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@yarvelle/ui';
import { definePackUi } from '@yarvelle/ui/slots';

export function VitalsCard({ profileId }) {
  return React.createElement(
    Card,
    { 'data-testid': 'health-vitals-card', 'data-profile-id': profileId },
    React.createElement(
      CardHeader,
      null,
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(CardTitle, null, 'Vitals & Biometrics'),
        React.createElement(Badge, { variant: 'success' }, 'Recorded')
      ),
      React.createElement(CardDescription, null, 'Blood pressure, resting heart rate, glucose, and lab trends.')
    )
  );
}

export function AppointmentsCard({ profileId }) {
  return React.createElement(
    Card,
    { 'data-testid': 'health-appointments-card', 'data-profile-id': profileId },
    React.createElement(
      CardHeader,
      null,
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(CardTitle, null, 'Upcoming Care & Visits'),
        React.createElement(Badge, { variant: 'info' }, 'Scheduled')
      ),
      React.createElement(CardDescription, null, 'Clinical specialist visits, prep dossiers, and follow-up checklists.')
    )
  );
}

export function PreventiveCard({ profileId }) {
  return React.createElement(
    Card,
    { 'data-testid': 'health-preventive-card', 'data-profile-id': profileId },
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Preventive Guidelines'),
      React.createElement(CardDescription, null, 'USPSTF preventive screenings, annual physicals, and immunization tracking.')
    )
  );
}

export function SchoolFormsCard({ profileId }) {
  return React.createElement(
    Card,
    { 'data-testid': 'health-school-forms-card', 'data-profile-id': profileId },
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Health & Immunization Forms'),
      React.createElement(CardDescription, null, 'Vaccination records, sports physical clearance, and camp health forms.')
    )
  );
}

export function ClinicalConsentSection({ profileId }) {
  return React.createElement(
    Card,
    { 'data-testid': 'health-consent-section', 'data-profile-id': profileId },
    React.createElement(
      CardHeader,
      null,
      React.createElement(CardTitle, null, 'Clinical Assist Consents'),
      React.createElement(CardDescription, null, 'Patient consent verification and non-clinical informational boundaries.')
    )
  );
}

export const healthSlotContributions = [
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
    component: VitalsCard,
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
    component: AppointmentsCard,
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
    component: PreventiveCard,
  },
  {
    id: 'health.school-forms.card',
    pack: 'health',
    slot: 'dashboard.card',
    title: 'School & Activity Forms',
    icon: 'FileText',
    order: 40,
    route: '/schedule',
    requiredScopes: ['health.clinical'],
    audiences: ['adult', 'teen'],
    component: SchoolFormsCard,
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
    component: ClinicalConsentSection,
  },
];

export const healthPackUi = definePackUi({
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

export { definePackUi };
