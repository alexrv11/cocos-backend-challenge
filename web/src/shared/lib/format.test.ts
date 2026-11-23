import { describe, it, expect } from 'vitest';
import { formatARS, formatPercent } from './format';

describe('formatARS', () => {
  it('formats a number as ARS currency', () => {
    const result = formatARS(6512.5);
    // es-AR locale uses $ and comma for decimals
    expect(result).toContain('6');
    expect(result).toContain('512');
  });

  it('formats zero', () => {
    const result = formatARS(0);
    expect(result).toContain('0');
  });

  it('formats negative values', () => {
    const result = formatARS(-1000);
    expect(result).toContain('1');
  });
});

describe('formatPercent', () => {
  it('formats positive with + sign', () => {
    expect(formatPercent(2.14)).toBe('+2.14%');
  });

  it('formats negative without + sign', () => {
    expect(formatPercent(-1.5)).toBe('-1.50%');
  });

  it('formats zero with + sign', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});
