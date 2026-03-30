'use client';

import { Cell, Pie, PieChart, Tooltip } from 'recharts';

function BudgetChart({ budgets }) {
  const totalSpent = budgets.reduce((acc, budget) => acc + budget.spent, 0);

  const data = budgets.map((budget) => ({
    name: budget.name,
    value: budget.spent,
    color: budget.color,
  }));

  return (
    <div className="relative">
      <PieChart
        style={{
          width: '364px',
          height: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          aspectRatio: 1,
        }}
        responsive
      >
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius="70%"
          innerRadius="50%"
          stroke="none"
          isAnimationActive={true}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} fillOpacity={0.75} />
          ))}
        </Pie>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={0}
          stroke="none"
          isAnimationActive={true}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip wrapperStyle={{ zIndex: 10 }} />
      </PieChart>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <p
          className="text-grey-900"
          style={{
            font: 'var(--text-preset-1)',
          }}
        >
          ${totalSpent}
        </p>
        <p
          className="text-grey-500"
          style={{
            font: 'var(--text-preset-5)',
          }}
        >
          of ${budgets.reduce((acc, budget) => acc + budget.maximum, 0)} limit
        </p>
      </div>
    </div>
  );
}

export default BudgetChart;
