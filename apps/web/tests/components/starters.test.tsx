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

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StartersChips } from '@/components/StartersChips';

describe('StartersChips Component (CF-S50)', () => {
  const starters = [
    'Help me prepare questions for my physical next week.',
    'Organize my symptoms into a timeline.'
  ];

  it('renders list of starter prompt buttons', () => {
    render(<StartersChips starters={starters} onSelectStarter={vi.fn()} />);

    expect(screen.getByText('Help me prepare questions for my physical next week.')).toBeInTheDocument();
    expect(screen.getByText('Organize my symptoms into a timeline.')).toBeInTheDocument();
  });

  it('invokes onSelectStarter callback when a chip is clicked', () => {
    const handleSelect = vi.fn();
    render(<StartersChips starters={starters} onSelectStarter={handleSelect} />);

    const firstChip = screen.getByText('Help me prepare questions for my physical next week.');
    fireEvent.click(firstChip);

    expect(handleSelect).toHaveBeenCalledWith('Help me prepare questions for my physical next week.', true);
  });

  it('renders null when starters array is empty', () => {
    const { container } = render(<StartersChips starters={[]} onSelectStarter={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
