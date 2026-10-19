import { describe, expect, it } from 'vitest';
import { todayISO, monthRange, isCalendarDate } from '../app/_utils/financialDates';
import { transactionSchema, budgetSchema } from '../app/_utils/financialSchemas';

describe('financial calendar boundaries', () => {
  it('uses the same Cairo calendar day on server and client', () => {
    expect(todayISO(new Date('2026-10-17T22:30:00Z'))).toBe('2026-10-18');
  });
  it('handles December rollover and leap years', () => {
    expect(monthRange('2024-12')).toMatchObject({ start: '2024-12-01', end: '2025-01-01' });
    expect(monthRange('2024-02')).toMatchObject({ start: '2024-02-01', end: '2024-03-01' });
    expect(isCalendarDate('2024-02-29')).toBe(true);
    expect(isCalendarDate('2025-02-29')).toBe(false);
    expect(isCalendarDate('2026-02-30')).toBe(false);
  });
  it.each(['2024-13','oops','2024-00',['2024-01'],null])('falls back to the current month for %s', value => {
    expect(monthRange(value, new Date('2026-10-18T12:00:00Z')).month).toBe('2026-10');
  });
});

const input = { name: 'Internet', type: 'expense', amount: 30.25, date: '2024-08-01', category_id: '40000000-0000-4000-8000-000000000001', recurring: false };
describe('transaction and budget validation', () => {
  it('strips client-supplied owner IDs and normalizes names', () => {
    expect(transactionSchema.parse({ ...input, name: '  Internet  ', user_id: 'forged' })).toEqual(input);
  });
  it.each([0,-1,NaN,Infinity,0.001,'30'])('rejects amount %s', amount => {
    expect(transactionSchema.safeParse({ ...input, amount }).success).toBe(false);
  });
  it('rejects malformed/future dates and income marked as a bill', () => {
    expect(transactionSchema.safeParse({ ...input, date: '2025-02-29' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...input, date: '2199-01-01' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...input, type: 'income', recurring: true }).success).toBe(false);
  });
  it('requires a category and a positive budget limit', () => {
    expect(budgetSchema.safeParse({ category_id: '', maximum: 50 }).success).toBe(false);
    expect(budgetSchema.safeParse({ category_id: input.category_id, maximum: 0 }).success).toBe(false);
    expect(budgetSchema.parse({ category_id: input.category_id, maximum: 50, user_id: 'forged' })).toEqual({ category_id: input.category_id, maximum: 50 });
  });
});
