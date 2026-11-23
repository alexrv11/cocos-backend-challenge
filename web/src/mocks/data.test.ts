import { describe, it, expect } from 'vitest';
import { generateCandles, generateMarketData, instruments } from './data';

describe('generateCandles', () => {
  it('generates candles for a given instrument', () => {
    const candles = generateCandles(1, 30);
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0]).toHaveProperty('time');
    expect(candles[0]).toHaveProperty('open');
    expect(candles[0]).toHaveProperty('high');
    expect(candles[0]).toHaveProperty('low');
    expect(candles[0]).toHaveProperty('close');
  });

  it('generates deterministic candles (seeded)', () => {
    const a = generateCandles(1, 30);
    const b = generateCandles(1, 30);
    expect(a).toEqual(b);
  });

  it('generates different candles for different instruments', () => {
    const a = generateCandles(1, 30);
    const b = generateCandles(2, 30);
    expect(a[0].close).not.toBe(b[0].close);
  });

  it('high >= max(open, close) and low <= min(open, close)', () => {
    const candles = generateCandles(1, 90);
    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close) - 0.01);
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close) + 0.01);
    }
  });

  it('skips weekends', () => {
    const candles = generateCandles(1, 90);
    for (const c of candles) {
      const day = new Date(c.time).getUTCDay();
      expect(day).not.toBe(0); // Sunday
      expect(day).not.toBe(6); // Saturday
    }
  });
});

describe('generateMarketData', () => {
  it('returns one entry per instrument', () => {
    const data = generateMarketData();
    expect(data.length).toBe(instruments.length);
  });

  it('each entry has required fields', () => {
    const data = generateMarketData();
    for (const d of data) {
      expect(d).toHaveProperty('instrumentId');
      expect(d).toHaveProperty('close');
      expect(typeof d.close).toBe('number');
    }
  });
});

describe('instruments', () => {
  it('has at least 10 instruments', () => {
    expect(instruments.length).toBeGreaterThanOrEqual(10);
  });

  it('each has id, ticker, name, type', () => {
    for (const i of instruments) {
      expect(i.id).toBeGreaterThan(0);
      expect(i.ticker.length).toBeGreaterThan(0);
      expect(i.name.length).toBeGreaterThan(0);
      expect(i.type.length).toBeGreaterThan(0);
    }
  });
});
