import "server-only";
import { requireUser } from "./authorization";
import supabase from "./supabase";
import { z } from "zod";

const openingBalanceSchema = z
  .number()
  .nonnegative("Opening balance cannot be negative.")
  .max(Number.MAX_SAFE_INTEGER / 100, "Opening balance is too large.")
  .multipleOf(0.01, "Use no more than two decimal places.");

export async function getBalance() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("balance_snapshots")
    .select("current")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Unable to load your balance. Please try again.");
  // Missing is different from zero. Never initialize legacy balances on read.
  return data ? data.current : null;
}

export async function initializeBalance(input) {
  const user = await requireUser();
  const parsed = openingBalanceSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { error } = await supabase.rpc("initialize_owned_balance", {
    p_user_id: user.id,
    p_opening_balance: parsed.data,
  });
  if (!error) return;

  const messages = {
    BALANCE_ALREADY_INITIALIZED:
      "Your opening balance has already been set. Refresh the page to see it.",
    INVALID_OPENING_BALANCE:
      "Enter zero or a positive amount with no more than two decimal places.",
    USER_NOT_FOUND: "Your account could not be found. Sign in again.",
  };
  throw new Error(
    messages[error.message] ||
      "Unable to set your opening balance. Please try again.",
  );
}
