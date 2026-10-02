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

import { describe, it, expect } from 'vitest';
import { cn, sanitizeAgentDescription, formatCategoryLabel } from '@/lib/utils';

describe('lib/utils', () => {
  it('combines and merges tailwind classnames', () => {
    expect(cn('px-2', 'py-1', { 'text-red-500': true, 'text-blue-500': false })).toBe('px-2 py-1 text-red-500');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  describe('sanitizeAgentDescription', () => {
    it('returns empty string for null, undefined, or empty values', () => {
      expect(sanitizeAgentDescription(null)).toBe('');
      expect(sanitizeAgentDescription(undefined)).toBe('');
      expect(sanitizeAgentDescription('')).toBe('');
    });

    it('strips ROLE & EMPATHY: headers', () => {
      expect(sanitizeAgentDescription('ROLE & EMPATHY:\nYou are Benefits Guide.')).toBe(
        'You are Benefits Guide.'
      );
      expect(sanitizeAgentDescription('ROLE & EMPATHY: You are Visit Steward.')).toBe(
        'You are Visit Steward.'
      );
      expect(sanitizeAgentDescription('role & empathy: test')).toBe('test');
    });

    it('strips markdown heading prefixes and colon labels', () => {
      expect(sanitizeAgentDescription('# Role & Empathy:\nAssistant persona.')).toBe(
        'Assistant persona.'
      );
      expect(sanitizeAgentDescription('ROLE:\nAssistant persona.')).toBe('Assistant persona.');
      expect(sanitizeAgentDescription('MISSION:\nAssistant persona.')).toBe('Assistant persona.');
    });

    it('preserves clean descriptions unchanged', () => {
      const clean = 'Cardiovascular care navigator assisting patients with hypertension tracking.';
      expect(sanitizeAgentDescription(clean)).toBe(clean);
    });
  });

  describe('formatCategoryLabel', () => {
    it('returns empty string for null, undefined, or empty category', () => {
      expect(formatCategoryLabel(null, 'clinical')).toBe('');
      expect(formatCategoryLabel(undefined, 'clinical')).toBe('');
      expect(formatCategoryLabel('', 'clinical')).toBe('');
    });

    it('strips redundant domain prefix and capitalizes subcategory', () => {
      expect(formatCategoryLabel('clinical.ophthalmology', 'clinical')).toBe('Ophthalmology');
      expect(formatCategoryLabel('navigation.insurance', 'navigation')).toBe('Insurance');
      expect(formatCategoryLabel('wellness.habits', 'wellness')).toBe('Habits');
      expect(formatCategoryLabel('navigation.prior_auth', 'navigation')).toBe('Prior Auth');
      expect(formatCategoryLabel('navigation.claims_appeals', 'navigation')).toBe('Claims Appeals');
    });

    it('extracts leaf segment if domain is different or omitted', () => {
      expect(formatCategoryLabel('clinical.cardiology')).toBe('Cardiology');
      expect(formatCategoryLabel('pediatrics.allergy.food')).toBe('Food');
    });

    it('omits badge if subcategory matches the domain itself', () => {
      expect(formatCategoryLabel('clinical', 'clinical')).toBe('');
      expect(formatCategoryLabel('wellness.wellness', 'wellness')).toBe('');
    });
  });
});
