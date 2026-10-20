import { describe, expect, it } from 'vitest';
import {
  buildRecurringBillsSummary,
  formatOrdinal,
  getRecurringBillStatus,
} from '../app/_features/recurringBills/recurringBills';

describe('recurring bills page helpers', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  const bills = [
    { name: 'Paid', amount: -25, date: '2026-10-05', day: 5 },
    { name: 'Due soon', amount: -15, date: '2026-09-23', day: 23 },
    { name: 'Upcoming', amount: -50, date: '2026-09-29', day: 29 },
  ];

  it('derives paid, due-soon, and upcoming states', () => {
    expect(bills.map((bill) => getRecurringBillStatus(bill, now))).toEqual([
      'paid',
      'due-soon',
      'upcoming',
    ]);
  });

  it('builds summary counts and amounts from the displayed bills', () => {
    expect(buildRecurringBillsSummary(bills, now)).toEqual({
      total: { count: 3, amount: 90 },
      paid: { count: 1, amount: 25 },
      upcoming: { count: 2, amount: 65 },
      dueSoon: { count: 1, amount: 15 },
    });
  });

  it('formats ordinal due dates', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21].map(formatOrdinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
    ]);
  });
});
