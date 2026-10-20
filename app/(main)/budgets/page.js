import BudgetSummary from "../../_features/budgets/BudgetSummary";
import BudgetEditor from "../../_features/budgets/BudgetEditor";
import BudgetCard from "../../_features/budgets/BudgetCard";
import { getBudgets, getBudgetSpending } from "../../_services/apiBudgets";
import { getCategories } from "../../_services/apiCategories";
import { getThemes } from "../../_services/apiThemes";
import { monthRange } from "../../_utils/financialDates";

export default async function BudgetsPage({ searchParams }) {
  const { month } = monthRange((await searchParams).month);
  const [budgets, categories, themes, spending] = await Promise.all([
    getBudgets(month),
    getCategories(),
    getThemes(),
    getBudgetSpending(month),
  ]);
  return (
    <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-grey-900" style={{ font: "var(--text-preset-1)" }}>
          Budgets
        </h1>
        <BudgetEditor categories={categories} themes={themes} />
      </div>
      {budgets.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center">
          <h2 className="text-xl font-bold">Plan your spending</h2>
          <p className="mt-3 text-grey-500">
            Add a budget to compare a category’s spending against a monthly
            limit.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[428px_minmax(0,1fr)]">
          <BudgetSummary budgets={budgets} />
          <div className="grid gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                categories={categories}
                themes={themes}
                transactions={spending[budget.category_id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
