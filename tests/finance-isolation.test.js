import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  session: null,
  tables: {},
  queries: [],
  rpcError: null,
  rpcData: null,
  failedTable: null,
}));
vi.mock("server-only", () => ({}));
vi.mock("../app/_services/auth", () => ({
  auth: vi.fn(async () => state.session),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../app/_services/supabase", () => {
  function from(table) {
    const query = { table, filters: [], orders: [], operation: "read" };
    state.queries.push(query);
    const value = (row, field) =>
      field.split(".").reduce((v, key) => v?.[key], row);
    const result = () => {
      if (state.failedTable === table)
        return { data: null, error: { message: "Database unavailable" } };
      let data = (state.tables[table] || []).filter((row) =>
        query.filters.every((filter) => filter(row)),
      );
      const count = data.length;
      if (query.operation === "insert") {
        const row = {
          id: "30000000-0000-4000-8000-000000000001",
          ...query.payload,
        };
        state.tables[table].push(row);
        data = [row];
      } else if (query.operation === "update") {
        data.forEach((row) => Object.assign(row, query.payload));
      } else if (query.operation === "delete") {
        state.tables[table] = state.tables[table].filter(
          (row) => !data.includes(row),
        );
      }
      for (const [field, ascending] of [...query.orders].reverse()) {
        data = [...data].sort(
          (a, b) =>
            (value(a, field) > value(b, field)
              ? 1
              : value(a, field) < value(b, field)
                ? -1
                : 0) * (ascending ? 1 : -1),
        );
      }
      if (query.range) data = data.slice(query.range[0], query.range[1] + 1);
      if (query.single) {
        if (
          data.length > 1 ||
          (query.single === "required" && data.length === 0)
        )
          return { data: null, error: { message: "Invalid cardinality" } };
        return { data: data[0] || null, error: null, count };
      }
      return { data, error: null, count };
    };
    const builder = {
      select() {
        return builder;
      },
      eq(field, expected) {
        query.filters.push((row) => value(row, field) === expected);
        return builder;
      },
      gte(field, expected) {
        query.filters.push((row) => value(row, field) >= expected);
        return builder;
      },
      lt(field, expected) {
        query.filters.push((row) => value(row, field) < expected);
        return builder;
      },
      lte(field, expected) {
        query.filters.push((row) => value(row, field) <= expected);
        return builder;
      },
      in(field, expected) {
        query.filters.push((row) => expected.includes(value(row, field)));
        return builder;
      },
      ilike(field, expected) {
        query.filters.push((row) =>
          value(row, field)
            .toLowerCase()
            .includes(expected.replaceAll("%", "").toLowerCase()),
        );
        return builder;
      },
      range(start, end) {
        query.range = [start, end];
        return builder;
      },
      order(field, { ascending = true } = {}) {
        query.orders.push([field, ascending]);
        return builder;
      },
      insert(payload) {
        query.operation = "insert";
        query.payload = payload;
        return builder;
      },
      update(payload) {
        query.operation = "update";
        query.payload = payload;
        return builder;
      },
      delete() {
        query.operation = "delete";
        return builder;
      },
      maybeSingle() {
        query.single = "optional";
        return builder;
      },
      single() {
        query.single = "required";
        return builder;
      },
      then(resolve, reject) {
        return Promise.resolve(result()).then(resolve, reject);
      },
    };
    return builder;
  }
  return {
    default: {
      from: vi.fn(from),
      rpc: vi.fn(async () => ({ error: state.rpcError, data: state.rpcData })),
    },
  };
});

import supabase from "../app/_services/supabase";
import { requireUser, requireAdmin } from "../app/_services/authorization";
import { getBalance, initializeBalance } from "../app/_services/apiBalance";
import { getBudgets, saveBudget } from "../app/_services/apiBudgets";
import { getOverview } from "../app/_services/apiOverview";
import {
  getTransactions,
  getRecurringBills,
  saveTransaction,
} from "../app/_services/apiTransactions";
import {
  addPot,
  editPot,
  getPots,
  getPotDetails,
  addMoneyToPot,
  withdrawMoneyFromPot,
  deletePot,
} from "../app/_services/apiPots";
import { addMoney } from "../app/_actions/potsActions";
import { deleteTransaction } from "../app/_actions/transactionActions";
import { setOpeningBalance } from "../app/_actions/profileActions";
import { revalidatePath } from "next/cache";

const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const PA = "10000000-0000-4000-8000-000000000001";
const PB = "10000000-0000-4000-8000-000000000002";
const CATEGORY = "40000000-0000-4000-8000-000000000001";
const fields = { name: "Savings", target: 100, theme: "#277C78" };
beforeEach(() => {
  state.session = { user: { id: A, role: "ADMIN" } };
  state.rpcError = null;
  state.rpcData = [];
  state.failedTable = null;
  state.queries = [];
  state.tables = {
    users: [
      { id: A, name: "A", role: "USER" },
      { id: B, name: "B", role: "USER" },
    ],
    balance_snapshots: [{ id: 1, user_id: A, current: 0 }],
    pots: [
      { ...fields, id: PA, user_id: A, total: 20 },
      { ...fields, id: PB, user_id: B, total: 40 },
    ],
    budgets: [
      {
        id: PA,
        user_id: A,
        maximum: 100,
        categories: { name: "Bills", theme: "#277C78" },
      },
      { id: PB, user_id: B, maximum: 900, categories: { name: "Bills" } },
    ],
    transactions: [
      {
        id: "tx-a",
        user_id: A,
        name: "Internet",
        amount: -10,
        date: "2024-08-01",
        recurring: true,
        categories: { name: "Bills" },
      },
      {
        id: "tx-b",
        user_id: B,
        name: "Internet",
        amount: -100,
        date: "2024-08-02",
        recurring: true,
        categories: { name: "Bills" },
      },
    ],
    unique_recurring_bills: [
      { user_id: A, name: "Internet", amount: -10, day: 1 },
      { user_id: B, name: "Internet", amount: -100, day: 2 },
    ],
  };
});

describe("current account authorization", () => {
  it("rejects missing sessions before accessing the database", async () => {
    state.session = null;
    await expect(requireUser()).rejects.toThrow("Unauthorized");
    expect(supabase.from).not.toHaveBeenCalled();
  });
  it("rejects a deleted account with a valid old JWT", async () => {
    state.tables.users = [];
    await expect(getPots()).rejects.toThrow("Unauthorized");
    expect(state.queries.map((q) => q.table)).toEqual(["users"]);
  });
  it("fails closed when the account lookup fails", async () => {
    state.failedTable = "users";
    await expect(getBalance()).rejects.toThrow("Unable to verify");
    expect(state.queries.map((q) => q.table)).toEqual(["users"]);
  });
  it("uses the current database role rather than a stale admin JWT", async () => {
    await expect(requireAdmin()).rejects.toThrow("Forbidden");
    state.tables.users[0].role = "ADMIN";
    await expect(requireAdmin()).resolves.toMatchObject({ id: A });
  });
});

describe("private financial reads", () => {
  it("distinguishes an actual zero from an uninitialized balance without writing", async () => {
    expect(await getBalance()).toBe(0);
    state.session.user.id = B;
    expect(await getBalance()).toBeNull();
    expect(state.tables.balance_snapshots).toHaveLength(1);
  });
  it("does not grant an admin access to other users finances", async () => {
    state.tables.users[0].role = "ADMIN";
    expect((await getPots()).map((p) => p.id)).toEqual([PA]);
  });
  it("scopes transaction records AND pagination counts before returning results", async () => {
    const result = await getTransactions(1, "Internet", "date_desc", "Bills");
    expect(result.count).toBe(1);
    expect(result.transactions.map((t) => t.id)).toEqual(["tx-a"]);
  });
  it("passes the authenticated user and selected month to the database budget report", async () => {
    state.rpcData = [
      { name: "Bills", maximum: 100, spent: 10, color: "#277C78" },
    ];
    expect(await getBudgets("2024-08")).toEqual(state.rpcData);
    expect(supabase.rpc).toHaveBeenCalledWith("get_owned_budget_summary", {
      p_user_id: A,
      p_start: "2024-08-01",
      p_end: "2024-09-01",
    });
  });
  it("returns an empty budget list for an account without budgets", async () => {
    state.tables.budgets = state.tables.budgets.filter((b) => b.user_id !== A);
    expect(await getBudgets()).toEqual([]);
    expect(state.queries.some((q) => q.table === "transactions")).toBe(false);
  });
  it("scopes recurring bills even when different users share a bill name", async () => {
    expect(await getRecurringBills()).toEqual([
      expect.objectContaining({ name: "Internet", amount: -10, day: 1 }),
    ]);
    const query = state.queries.find(
      (candidate) => candidate.table === "transactions",
    );
    expect(query.orders).toEqual([
      ["name", true],
      ["date", false],
      ["id", false],
    ]);
  });
  it("returns only the latest recurring transaction for each bill", async () => {
    state.tables.transactions.push(
      {
        id: "tx-old",
        user_id: A,
        name: "Internet",
        amount: -8,
        date: "2024-07-01",
        recurring: true,
      },
      {
        id: "tx-rent",
        user_id: A,
        name: "Rent",
        amount: -500,
        date: "2024-08-20",
        recurring: true,
      },
      {
        id: "tx-once",
        user_id: A,
        name: "One time",
        amount: -50,
        date: "2024-08-03",
        recurring: false,
      },
    );

    expect(await getRecurringBills()).toEqual([
      expect.objectContaining({ name: "Internet", amount: -10, day: 1 }),
      expect.objectContaining({ name: "Rent", amount: -500, day: 20 }),
    ]);
  });
});

describe("one-time opening balance", () => {
  it("uses the current session owner and accepts a zero opening balance", async () => {
    state.session.user.id = B;
    await initializeBalance(0);
    expect(supabase.rpc).toHaveBeenCalledWith("initialize_owned_balance", {
      p_user_id: B,
      p_opening_balance: 0,
    });
  });
  it.each([-1, NaN, Infinity, 0.001, "10"])(
    "rejects invalid opening balance %s before RPC",
    async (amount) => {
      await expect(initializeBalance(amount)).rejects.toThrow();
      expect(supabase.rpc).not.toHaveBeenCalled();
    },
  );
  it("returns an actionable retry result and never reports success", async () => {
    state.rpcError = { message: "BALANCE_ALREADY_INITIALIZED" };
    const formData = new FormData();
    formData.set("openingBalance", "25.50");
    expect(await setOpeningBalance(null, formData)).toEqual({
      error: expect.stringContaining("already been set"),
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("rejects an empty field without calling the database", async () => {
    const formData = new FormData();
    expect(await setOpeningBalance(null, formData)).toEqual({
      error: "Enter your current available balance.",
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
  it("invalidates financial pages after a successful initialization", async () => {
    const formData = new FormData();
    formData.set("openingBalance", "25.50");
    expect(await setOpeningBalance(null, formData)).toEqual({
      success: "Opening balance saved successfully.",
    });
    expect(revalidatePath.mock.calls).toEqual([
      ["/profile"],
      ["/"],
      ["/transactions"],
      ["/pots"],
    ]);
  });
});

describe("pot ownership and mutations", () => {
  it("reads the requested owned ID and rejects foreign or missing IDs equally", async () => {
    expect(await getPotDetails(PA)).toMatchObject({ id: PA, total: 20 });
    await expect(getPotDetails(PB)).rejects.toThrow("Pot not found.");
    await expect(
      getPotDetails("10000000-0000-4000-8000-000000000099"),
    ).rejects.toThrow("Pot not found.");
  });
  it("assigns ownership and total on the server, discarding forged fields", async () => {
    await addPot({ ...fields, user_id: B, total: 900 });
    expect(state.tables.pots.at(-1)).toMatchObject({ user_id: A, total: 0 });
  });
  it("cannot edit a different users pot or transfer ownership", async () => {
    await expect(editPot({ potId: PB, updatedFields: fields })).rejects.toThrow(
      "Pot not found",
    );
    await editPot({
      potId: PA,
      updatedFields: { ...fields, user_id: B, total: 900, name: "Renamed" },
    });
    expect(state.tables.pots[0]).toMatchObject({
      user_id: A,
      total: 20,
      name: "Renamed",
    });
    expect(state.tables.pots[1]).toMatchObject({
      user_id: B,
      total: 40,
      name: "Savings",
    });
  });
  it("rejects a target smaller than the currently saved amount", async () => {
    await expect(
      editPot({ potId: PA, updatedFields: { ...fields, target: 10 } }),
    ).rejects.toThrow("target");
    expect(state.tables.pots[0].target).toBe(100);
  });
  it.each([0, -1, NaN, Infinity, 0.001, "10"])(
    "rejects invalid amount %s before RPC",
    async (amount) => {
      await expect(addMoneyToPot({ potId: PA, amount })).rejects.toThrow();
      expect(supabase.rpc).not.toHaveBeenCalled();
    },
  );
  it("passes only the authenticated owner to each atomic operation", async () => {
    await addMoneyToPot({ potId: PA, amount: 1.25, user_id: B });
    await withdrawMoneyFromPot({ potId: PA, amount: 0.25, user_id: B });
    await deletePot(PA);
    expect(supabase.rpc.mock.calls.map(([, args]) => args)).toEqual([
      { p_user_id: A, p_pot_id: PA, p_operation: "add", p_amount: 1.25 },
      { p_user_id: A, p_pot_id: PA, p_operation: "withdraw", p_amount: 0.25 },
      { p_user_id: A, p_pot_id: PA, p_operation: "delete", p_amount: null },
    ]);
  });
  it("returns an actionable missing-balance error without reporting success", async () => {
    state.rpcError = { message: "BALANCE_NOT_INITIALIZED" };
    expect(await addMoney(PA, 1)).toEqual({
      error: expect.stringContaining("not set up"),
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("invalidates affected pages only after a successful mutation", async () => {
    expect(await addMoney(PA, 1)).toEqual({ success: true });
    expect(revalidatePath.mock.calls).toEqual([["/pots"], ["/"]]);
  });
});

describe("transaction and budget workflows", () => {
  const transaction = {
    name: "Internet",
    type: "expense",
    amount: 12.25,
    date: "2024-08-01",
    category_id: CATEGORY,
    recurring: true,
  };
  it("assigns the session owner and a signed amount, discarding a forged owner", async () => {
    await saveTransaction("create", PA, { ...transaction, user_id: B });
    expect(supabase.rpc).toHaveBeenLastCalledWith("mutate_owned_transaction", {
      p_user_id: A,
      p_transaction_id: PA,
      p_operation: "create",
      p_name: "Internet",
      p_amount: -12.25,
      p_date: "2024-08-01",
      p_category_id: CATEGORY,
      p_recurring: true,
    });
    await saveTransaction("edit", PA, {
      ...transaction,
      type: "income",
      recurring: false,
    });
    expect(supabase.rpc.mock.lastCall[1].p_amount).toBe(12.25);
  });
  it("rejects invalid financial input before writing", async () => {
    await expect(
      saveTransaction("create", PA, { ...transaction, amount: -10 }),
    ).rejects.toThrow();
    await expect(
      saveTransaction("create", "not-a-uuid", transaction),
    ).rejects.toThrow();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
  it("reports missing balance without invalidating pages or writing fallback values", async () => {
    state.rpcError = { message: "BALANCE_NOT_INITIALIZED" };
    expect(await deleteTransaction(PA)).toEqual({
      error: expect.stringContaining("not set up"),
    });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(state.queries.every((query) => query.operation === "read")).toBe(
      true,
    );
  });
  it("hides database internals and tells users how to handle duplicate submissions", async () => {
    state.rpcError = { message: "private database internals" };
    await expect(saveTransaction("delete", PA)).rejects.toThrow(
      "Unable to save the transaction.",
    );
    state.rpcError = { code: "23505" };
    await expect(saveTransaction("create", PA, transaction)).rejects.toThrow(
      "already saved",
    );
  });
  it("invalidates overview and reports only after the transaction succeeds", async () => {
    expect(await deleteTransaction(PA)).toEqual({ success: true });
    expect(revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/transactions"],
      ["/budgets"],
      ["/pots"],
      ["/recurring-bills"],
    ]);
  });
  it.each(["edit", "delete"])(
    "cannot %s a foreign budget, even with a stale admin session",
    async (operation) => {
      await expect(
        saveBudget(operation, PB, { category_id: CATEGORY, maximum: 20 }),
      ).rejects.toThrow("Budget not found");
      expect(
        state.tables.budgets.find((budget) => budget.id === PB).maximum,
      ).toBe(900);
    },
  );
  it("cannot transfer budget ownership or choose an ID through editable fields", async () => {
    await saveBudget("edit", PA, {
      category_id: CATEGORY,
      maximum: 20,
      user_id: B,
      id: PB,
    });
    expect(
      state.tables.budgets.find((budget) => budget.id === PA),
    ).toMatchObject({ maximum: 20, user_id: A });
    await saveBudget("delete", PA);
    expect(state.tables.budgets.map((budget) => budget.id)).toEqual([PB]);
  });
  it("clamps an out-of-range transaction page and counts only owned rows", async () => {
    const result = await getTransactions(999, "", "untrusted_sort");
    expect(result).toMatchObject({ count: 1, page: 1, pageCount: 1 });
    expect(result.transactions.map((row) => row.id)).toEqual(["tx-a"]);
    expect(
      state.queries.find((query) => query.table === "transactions").orders[0],
    ).toEqual(["date", false]);
  });
});

describe("overview service", () => {
  it("requests totals for the session owner and selected month, preserving unknown balances", async () => {
    state.rpcData = { balance: null, period: { income: 0, expense: 0 } };
    expect(await getOverview("2024-12")).toEqual(state.rpcData);
    expect(supabase.rpc).toHaveBeenCalledWith("get_owned_overview_summary", {
      p_user_id: A,
      p_start: "2024-12-01",
      p_end: "2025-01-01",
    });
  });
  it("does not disguise a reporting failure as a zero balance", async () => {
    state.rpcError = { message: "database internal failure" };
    await expect(getOverview()).rejects.toThrow(
      "Unable to load your overview.",
    );
  });
  it("rejects deleted accounts before requesting financial totals", async () => {
    state.tables.users = [];
    await expect(getOverview()).rejects.toThrow("Unauthorized");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
