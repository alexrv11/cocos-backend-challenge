import { describe, it, expect } from 'vitest';
import { orderSchema } from './order.schema';

describe('orderSchema', () => {
  const validMarketOrder = {
    instrumentId: 1,
    side: 'BUY' as const,
    type: 'MARKET' as const,
    quantity: 100,
  };

  const validLimitOrder = {
    instrumentId: 1,
    side: 'SELL' as const,
    type: 'LIMIT' as const,
    quantity: 50,
    price: 6500.5,
  };

  it('passes valid MARKET order', () => {
    const result = orderSchema.safeParse(validMarketOrder);
    expect(result.success).toBe(true);
  });

  it('passes valid LIMIT order', () => {
    const result = orderSchema.safeParse(validLimitOrder);
    expect(result.success).toBe(true);
  });

  it('fails LIMIT order without price', () => {
    const result = orderSchema.safeParse({ ...validLimitOrder, price: undefined });
    expect(result.success).toBe(false);
  });

  it('fails with zero quantity', () => {
    const result = orderSchema.safeParse({ ...validMarketOrder, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('fails with negative quantity', () => {
    const result = orderSchema.safeParse({ ...validMarketOrder, quantity: -5 });
    expect(result.success).toBe(false);
  });

  it('fails with decimal quantity', () => {
    const result = orderSchema.safeParse({ ...validMarketOrder, quantity: 10.5 });
    expect(result.success).toBe(false);
  });

  it('fails with invalid side', () => {
    const result = orderSchema.safeParse({ ...validMarketOrder, side: 'HOLD' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid type', () => {
    const result = orderSchema.safeParse({ ...validMarketOrder, type: 'STOP' });
    expect(result.success).toBe(false);
  });

  it('MARKET order passes without price', () => {
    const result = orderSchema.safeParse(validMarketOrder);
    expect(result.success).toBe(true);
  });

  it('fails with negative price on LIMIT', () => {
    const result = orderSchema.safeParse({ ...validLimitOrder, price: -100 });
    expect(result.success).toBe(false);
  });
});
