import { z } from "zod";

export const potIdSchema = z.string().uuid("Pot not found.");
export const moneyAmountSchema = z
  .number()
  .positive("Enter an amount greater than zero.")
  .max(Number.MAX_SAFE_INTEGER / 100, "Amount is too large.")
  .multipleOf(0.01, "Use no more than two decimal places.");
export const potSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a pot name.")
    .max(30, "Use no more than 30 characters."),
  target: moneyAmountSchema,
  theme: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid theme."),
});
