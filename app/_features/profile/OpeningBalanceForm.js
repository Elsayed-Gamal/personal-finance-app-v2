"use client";

import { setOpeningBalance } from "@/app/_actions/profileActions";
import { useActionState } from "react";

export default function OpeningBalanceForm() {
  const [state, action, pending] = useActionState(setOpeningBalance, null);

  return (
    <section className="flex flex-col gap-6 rounded-xl bg-white p-6 sm:p-8 lg:col-span-2">
      <div>
        <h2 className="text-grey-900 text-xl font-bold">Set opening balance</h2>
        <p className="text-grey-500 mt-2 text-sm">
          Enter the money currently available to spend. You can do this once, so
          check the amount before saving. Money already held in pots is
          separate.
        </p>
      </div>
      <form action={action} className="flex max-w-xl flex-col gap-4">
        <label className="field-label" htmlFor="openingBalance">
          Current available balance (USD)
          <input
            className="form-input"
            id="openingBalance"
            name="openingBalance"
            type="number"
            min="0"
            max="90071992547409.91"
            step="0.01"
            inputMode="decimal"
            required
            disabled={pending}
            aria-describedby="opening-balance-help"
          />
        </label>
        <p id="opening-balance-help" className="text-grey-500 text-xs">
          Use 0 if you currently have no available money. This does not create
          an income transaction or change saved pot amounts.
        </p>
        {state?.error && (
          <p role="alert" className="text-red">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p role="status" className="text-green">
            {state.success}
          </p>
        )}
        <button className="button-primary" type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save opening balance"}
        </button>
      </form>
    </section>
  );
}
