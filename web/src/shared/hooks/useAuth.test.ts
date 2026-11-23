import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuth';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null });
  });

  it('starts with null token and user', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth stores token and user in state and localStorage', () => {
    const user = { id: 1, email: 'a@b.com', accountNumber: 'ACC-00001' };
    useAuthStore.getState().setAuth('jwt-token', user);

    const state = useAuthStore.getState();
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(user);
    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(user);
  });

  it('logout clears state and localStorage', () => {
    useAuthStore.getState().setAuth('jwt-token', { id: 1, email: 'a@b.com', accountNumber: 'ACC-00001' });
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('hydrate restores from localStorage', () => {
    const user = { id: 2, email: 'x@y.com', accountNumber: 'ACC-00002' };
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(user));

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.token).toBe('stored-token');
    expect(state.user).toEqual(user);
  });

  it('hydrate with corrupt user JSON clears localStorage', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', '{invalid');

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('hydrate with no token does nothing', () => {
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
  });
});
