import BudgetSummary from '../_features/budgets/BudgetSummary';
import { getBudgets } from '../_services/apiBudgets';

async function BudgetsPage() {
  const budgets = await getBudgets();

  console.log(budgets);

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="text-gray-900"
        style={{
          font: 'var(--text-preset-1)',
        }}
      >
        Budgets
      </h1>
      <div className="flex gap-6">
        <BudgetSummary budgets={budgets} />
      </div>
    </div>
  );
}

export default BudgetsPage;
