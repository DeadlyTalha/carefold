import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DisclaimerHeader } from '@/components/DisclaimerHeader';

describe('DisclaimerHeader Component (CF-S05)', () => {
  it('renders permanent safety notice with required canonical copy', () => {
    render(<DisclaimerHeader />);

    const banner = screen.getByTestId('safety-disclaimer-header');
    expect(banner).toBeInTheDocument();

    expect(banner.textContent?.toLowerCase()).toContain('wellness');
    expect(banner.textContent?.toLowerCase()).toContain('not diagnosis or treatment');
  });

  it('cannot be dismissed (no close button exists)', () => {
    render(<DisclaimerHeader />);
    expect(screen.queryByRole('button', { name: /close|dismiss/i })).not.toBeInTheDocument();
  });
});
