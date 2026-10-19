import { z } from 'zod';
import { moneyAmountSchema } from './potSchemas';
import { isCalendarDate, todayISO } from './financialDates';

export const recordIdSchema = z.string().uuid('Record not found.');
export const transactionSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(100, 'Use no more than 100 characters.'),
  type: z.enum(['income', 'expense']),
  amount: moneyAmountSchema,
  category_id: recordIdSchema,
  date: z.string().refine(isCalendarDate, 'Enter a valid date.')
    .refine(value => value >= '1900-01-01' && value <= todayISO(), 'Use a date between 1900 and today.'),
  recurring: z.boolean().default(false),
}).refine(value => !value.recurring || value.type === 'expense', {
  message: 'Only expenses can be recurring bills.', path: ['recurring'],
});

export const budgetSchema = z.object({ category_id: recordIdSchema, maximum: moneyAmountSchema });

export function parseFinancial(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);
  return result.data;
}
