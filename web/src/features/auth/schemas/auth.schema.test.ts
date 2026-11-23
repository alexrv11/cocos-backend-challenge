import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

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
    password: 'Test1234',
    terms: true as const,
  };

  it('passes with valid data', () => {
    const result = registerSchema.safeParse(validData);
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
