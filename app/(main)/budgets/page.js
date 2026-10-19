import BudgetSummary from '../../_features/budgets/BudgetSummary';
import BudgetEditor from '../../_features/budgets/BudgetEditor';
import { getBudgets } from '../../_services/apiBudgets';
import { getCategories } from '../../_services/apiCategories';
import { monthRange } from '../../_utils/financialDates';
import { formatCurrency } from '../../_utils/helpers';
import MonthFilter from '../../_UI/MonthFilter';

export default async function BudgetsPage({ searchParams }) {
  const { month, label } = monthRange((await searchParams).month);
  const [budgets, categories] = await Promise.all([getBudgets(month), getCategories()]);
  return <div className="flex flex-col gap-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Budgets</h1><BudgetEditor categories={categories} /></div>
    <MonthFilter month={month} />
    <p className="text-sm text-grey-500">Spending in {label}, compared with your current monthly limits.</p>
    {budgets.length === 0 ? <div className="rounded-xl bg-white p-10 text-center"><h2 className="text-xl font-bold">Plan your spending</h2><p className="mt-3 text-grey-500">Add a budget to compare a category’s spending against a monthly limit.</p></div> :
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(280px,1fr)_2fr]">
        <BudgetSummary budgets={budgets} />
        <div className="grid gap-6">{budgets.map(budget => {
          const remaining = budget.maximum - budget.spent;
          return <section key={budget.id} className="rounded-xl bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="flex items-center gap-3 text-xl font-bold"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: budget.color ?? '#277C78' }} />{budget.name}</h2><BudgetEditor budget={budget} categories={categories} /></div>
            <p className="mt-4 text-sm text-grey-500">Maximum of {formatCurrency(budget.maximum)}</p>
            <progress className="mt-4 h-3 w-full accent-green" value={Math.min(budget.spent, budget.maximum)} max={budget.maximum} aria-label={`${budget.name} budget used`} />
            <div className="mt-4 flex flex-wrap justify-between gap-3"><p><span className="block text-xs text-grey-500">Spent</span><strong>{formatCurrency(budget.spent)}</strong></p><p className={remaining < 0 ? 'text-red' : ''}><span className="block text-xs">{remaining < 0 ? 'Over budget' : 'Remaining'}</span><strong>{formatCurrency(Math.abs(remaining))}</strong></p></div>
          </section>;
        })}</div>
      </div>}
  </div>;
}
