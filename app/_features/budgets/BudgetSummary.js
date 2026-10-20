import { Fragment } from "react";
import BudgetChart from "./BudgetChart";

function BudgetSummary({ budgets }) {
  return (
    <aside className="flex flex-col items-center gap-8 rounded-xl bg-white p-5 sm:flex-row sm:items-center sm:p-8 xl:sticky xl:top-8 xl:flex-col xl:items-stretch">
      <div className="flex flex-1 justify-center">
        <BudgetChart budgets={budgets} />
      </div>
      <div className="w-full flex-1">
        <h2
          className="text-grey-900 mb-6"
          style={{ font: "var(--text-preset-2)" }}
        >
          Spending Summary
        </h2>
        <div className="flex flex-col gap-4">
          {budgets.map((budget) => (
            <Fragment key={budget.name}>
              <div className="flex min-h-5 items-center justify-between gap-4">
                <div className="flex min-w-0 items-stretch gap-4">
                  <span
                    className="inline-block w-1 shrink-0 rounded-lg"
                    style={{ backgroundColor: budget.color }}
                  ></span>
                  <p
                    className="truncate text-grey-500"
                    style={{ font: "var(--text-preset-4)" }}
                  >
                    {budget.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <span
                    className="text-grey-900"
                    style={{ font: "var(--text-preset-3)" }}
                  >
                    ${budget.spent.toFixed(2)}&nbsp;
                  </span>
                  <span
                    className="text-grey-500"
                    style={{ font: "var(--text-preset-5)" }}
                  >
                    of ${budget.maximum.toFixed(2)}
                  </span>
                </div>
              </div>
              {budget !== budgets[budgets.length - 1] && (
                <div className="bg-grey-100 h-px"></div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default BudgetSummary;
