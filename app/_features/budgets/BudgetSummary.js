import { Fragment } from 'react';
import BudgetChart from './BudgetChart';

function BudgetSummary({ budgets }) {
  return (
    <div className="flex flex-col gap-8 bg-white p-8 rounded-xl ">
      <BudgetChart budgets={budgets} />
      <div>
        <h2
          className="text-grey-900 mb-6"
          style={{ font: 'var(--text-preset-2)' }}
        >
          Spending Summary
        </h2>
        <div className="flex flex-col gap-4">
          {budgets.map((budget) => (
            <Fragment key={budget.name}>
              <div className="flex justify-between items-center h-5.25 gap-4">
                <div className="flex gap-4">
                  <span
                    className="inline-block h-5.25 w-1 rounded-lg"
                    style={{ backgroundColor: budget.color }}
                  ></span>
                  <p
                    className="text-grey-500"
                    style={{ font: 'var(--text-preset-4)' }}
                  >
                    {budget.name}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className="text-grey-900"
                    style={{ font: 'var(--text-preset-3)' }}
                  >
                    ${budget.spent.toFixed(2)}&nbsp;
                  </span>
                  <span
                    className="text-grey-500"
                    style={{ font: 'var(--text-preset-5)' }}
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
    </div>
  );
}

export default BudgetSummary;
