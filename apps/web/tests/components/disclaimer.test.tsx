import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DisclaimerHeader } from '@/components/DisclaimerHeader';

describe('DisclaimerHeader Component (CF-S05)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders safety notice with required canonical copy', () => {
    render(<DisclaimerHeader />);

    const banner = screen.getByTestId('safety-disclaimer-header');
    expect(banner).toBeInTheDocument();

    expect(banner.textContent?.toLowerCase()).toContain('wellness');
    expect(banner.textContent?.toLowerCase()).toContain('not diagnosis or treatment');
  });

  it('can be dismissed when close button is clicked', () => {
    render(<DisclaimerHeader />);

    const dismissBtn = screen.getByRole('button', { name: /close|dismiss/i });
    expect(dismissBtn).toBeInTheDocument();

    fireEvent.click(dismissBtn);
    expect(screen.queryByTestId('safety-disclaimer-header')).not.toBeInTheDocument();
  });
});
