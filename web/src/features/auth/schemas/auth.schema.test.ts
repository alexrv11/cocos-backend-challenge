import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, formatCuil } from './auth.schema';

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' });
    expect(result.success).toBe(true);
  });

  it('fails with empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: '123' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: '123' });
    expect(result.success).toBe(false);
  });

  it('fails with empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    firstName: 'Juana',
    lastName: 'Perez',
    email: 'juana@test.com',
    cuil: '20-12345678-6',
    password: 'Test1234',
    terms: true as const,
  };

  it('passes with valid data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails with invalid CUIL check digit', () => {
    const result = registerSchema.safeParse({ ...validData, cuil: '20-12345678-0' });
    expect(result.success).toBe(false);
  });

  it('fails with CUIL too short', () => {
    const result = registerSchema.safeParse({ ...validData, cuil: '20-1234' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid CUIL prefix', () => {
    const result = registerSchema.safeParse({ ...validData, cuil: '99-12345678-5' });
    expect(result.success).toBe(false);
  });

  it('validates known valid CUIL 27-28372710-1', () => {
    const result = registerSchema.safeParse({ ...validData, cuil: '27-28372710-1' });
    expect(result.success).toBe(true);
  });

  it('fails with password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'Ab1' });
    expect(result.success).toBe(false);
  });

  it('fails with password without uppercase', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'test1234' });
    expect(result.success).toBe(false);
  });

  it('fails with password without number', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'Testtest' });
    expect(result.success).toBe(false);
  });

  it('fails when terms not accepted', () => {
    const result = registerSchema.safeParse({ ...validData, terms: false });
    expect(result.success).toBe(false);
  });

  it('fails with empty firstName', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: '' });
    expect(result.success).toBe(false);
  });
});

describe('formatCuil', () => {
  it('formats 2 digits without dash', () => {
    expect(formatCuil('20')).toBe('20');
  });

  it('formats 3+ digits with first dash', () => {
    expect(formatCuil('201')).toBe('20-1');
  });

  it('formats 10 digits with one dash', () => {
    expect(formatCuil('2012345678')).toBe('20-12345678');
  });

  it('formats 11 digits with both dashes', () => {
    expect(formatCuil('20123456786')).toBe('20-12345678-6');
  });

  it('strips non-digit characters', () => {
    expect(formatCuil('20-123abc45678-6')).toBe('20-12345678-6');
  });

  it('truncates to 11 digits', () => {
    expect(formatCuil('201234567899999')).toBe('20-12345678-9');
  });
});
