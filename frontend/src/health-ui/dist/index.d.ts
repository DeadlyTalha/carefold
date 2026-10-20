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
import type { SlotContribution, SlotProps, PackUi } from '@yarvelle/ui/slots';
export { definePackUi, type SlotId, type SlotContribution, type SlotProps, type PackUi } from '@yarvelle/ui/slots';

export declare function VitalsCard(props: SlotProps): React.JSX.Element;
export declare function AppointmentsCard(props: SlotProps): React.JSX.Element;
export declare function PreventiveCard(props: SlotProps): React.JSX.Element;
export declare function SchoolFormsCard(props: SlotProps): React.JSX.Element;
export declare function ClinicalConsentSection(props: SlotProps): React.JSX.Element;

export declare const healthSlotContributions: SlotContribution[];
export declare const healthPackUi: PackUi;
