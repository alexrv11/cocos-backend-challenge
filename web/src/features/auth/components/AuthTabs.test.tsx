import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthTabs from './AuthTabs';

describe('AuthTabs', () => {
  it('renders both tabs', () => {
    render(<AuthTabs mode="login" onChange={() => {}} />);
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('marks login tab as selected when mode is login', () => {
    render(<AuthTabs mode="login" onChange={() => {}} />);
    expect(screen.getByText('Ingresar')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Registrarse')).toHaveAttribute('aria-selected', 'false');
  });

  it('marks register tab as selected when mode is register', () => {
    render(<AuthTabs mode="register" onChange={() => {}} />);
    expect(screen.getByText('Registrarse')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Ingresar')).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with login when clicking Ingresar', async () => {
    const onChange = vi.fn();
    render(<AuthTabs mode="register" onChange={onChange} />);
    await userEvent.click(screen.getByText('Ingresar'));
    expect(onChange).toHaveBeenCalledWith('login');
  });

  it('calls onChange with register when clicking Registrarse', async () => {
    const onChange = vi.fn();
    render(<AuthTabs mode="login" onChange={onChange} />);
    await userEvent.click(screen.getByText('Registrarse'));
    expect(onChange).toHaveBeenCalledWith('register');
  });
});
