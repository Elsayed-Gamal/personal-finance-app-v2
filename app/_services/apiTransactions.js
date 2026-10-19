import "server-only";
import { requireUser } from "./authorization";
import supabase from "./supabase";
import {
  parseFinancial,
  recordIdSchema,
  transactionSchema,
} from "../_utils/financialSchemas";

const SORTS = new Set([
  "date_desc",
  "date_asc",
  "name_asc",
  "name_desc",
  "amount_desc",
  "amount_asc",
]);

export async function getTransactions(
  page = 1,
  searchQuery = "",
  sort = "date_desc",
  category = "all",
  limit = 10,
) {
  const user = await requireUser();
  const requestedPage =
    Number.isSafeInteger(Number(page)) && Number(page) > 0
      ? Math.min(Number(page), 1000000)
      : 1;
  const pageSize =
    Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  const [field, direction] = (SORTS.has(sort) ? sort : "date_desc").split("_");
  const hasCategory =
    typeof category === "string" && category !== "all" && category !== "";
  let query = supabase
    .from("transactions")
    .select(
      `name, ${hasCategory ? "categories!inner(name)" : "categories(name)"}, category_id, date, amount, avatar, id, recurring`,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .order(field, { ascending: direction === "asc" })
    .order("id", { ascending: true });
  if (typeof searchQuery === "string" && searchQuery.trim()) {
    query = query.ilike(
      "name",
      `%${searchQuery
        .trim()
        .slice(0, 100)
        .replace(/[\\%_]/g, "\\$&")}%`,
    );
  }
  if (hasCategory) query = query.eq("categories.name", category);
  const offset = (requestedPage - 1) * pageSize;
  let result = await query.range(offset, offset + pageSize - 1);
  if (result.error)
    throw new Error("Unable to load your transactions. Please try again.");
  const pageCount = Math.max(1, Math.ceil(result.count / pageSize));
  const currentPage = Math.min(requestedPage, pageCount);
  if (currentPage !== requestedPage && result.count > 0) {
    result = await query.range(
      (currentPage - 1) * pageSize,
      currentPage * pageSize - 1,
    );
    if (result.error)
      throw new Error("Unable to load your transactions. Please try again.");
  }
  return {
    transactions: result.data,
    count: result.count,
    page: currentPage,
    pageCount,
  };
}

export async function saveTransaction(operation, transactionId, input) {
  const user = await requireUser();
  const id = parseFinancial(recordIdSchema, transactionId);
  if (!["create", "edit", "delete"].includes(operation))
    throw new Error("Invalid operation.");
  const values =
    operation === "delete" ? null : parseFinancial(transactionSchema, input);
  const { error } = await supabase.rpc("mutate_owned_transaction", {
    p_user_id: user.id,
    p_transaction_id: id,
    p_operation: operation,
    ...(values
      ? {
          p_name: values.name,
          p_amount: values.type === "expense" ? -values.amount : values.amount,
          p_date: values.date,
          p_category_id: values.category_id,
          p_recurring: values.recurring,
        }
      : {}),
  });
  if (error) {
    const messages = {
      TRANSACTION_NOT_FOUND: "Transaction not found.",
      BALANCE_NOT_INITIALIZED:
        "Your balance is not set up yet. Contact the administrator before changing transactions.",
      INSUFFICIENT_BALANCE:
        "This change would make your available balance negative.",
      INVALID_CATEGORY: "Choose a valid category.",
      INVALID_TRANSACTION: "Check the transaction details and try again.",
    };
    if (error.code === "23505")
      throw new Error(
        "This transaction was already saved. Refresh the list before trying again.",
      );
    throw new Error(
      messages[error.message] ||
        "Unable to save the transaction. Please try again.",
    );
  }
}

export async function getRecurringBills() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, name, avatar, amount, date")
    .eq("user_id", user.id)
    .eq("recurring", true)
    .order("name", { ascending: true })
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error("Unable to load recurring bills. Please try again.");
  }

  const latestBillByName = new Map();

  for (const transaction of data ?? []) {
    if (latestBillByName.has(transaction.name)) continue;

    const date = String(transaction.date).slice(0, 10);
    const day = Number(date.slice(8, 10));

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(day)) continue;

    latestBillByName.set(transaction.name, {
      name: transaction.name,
      avatar: transaction.avatar,
      amount: transaction.amount,
      date,
      day,
    });
  }

  return [...latestBillByName.values()].sort(
    (first, second) =>
      first.day - second.day || first.name.localeCompare(second.name),
  );
}
