import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrength from './PasswordStrength';

describe('PasswordStrength', () => {
  it('renders the hint text', () => {
    render(<PasswordStrength password="" />);
    expect(
      screen.getByText(/Minimo 8 caracteres/),
    ).toBeInTheDocument();
  });

  it('renders 4 strength bars', () => {
    const { container } = render(<PasswordStrength password="" />);
    const bars = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(bars.length).toBe(4);
  });

  it('shows no active bars for empty password', () => {
    const { container } = render(<PasswordStrength password="" />);
    const bars = container.querySelectorAll('[aria-hidden="true"] > div');
    bars.forEach((bar) => {
      expect(bar.className).toContain('bg-border');
    });
  });

  it('shows active bars for strong password', () => {
    const { container } = render(<PasswordStrength password="Test1234!" />);
    const bars = container.querySelectorAll('[aria-hidden="true"] > div');
    // All 4 criteria met: length>=8, uppercase, digit, special char
    bars.forEach((bar) => {
      expect(bar.className).toContain('bg-success');
    });
  });
});
