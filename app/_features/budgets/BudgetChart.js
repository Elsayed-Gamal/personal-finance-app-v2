"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

function BudgetChart({
  budgets,
  overview = false,
  totalSpent: suppliedSpent,
  totalMaximum,
}) {
  const totalSpent =
    suppliedSpent ?? budgets.reduce((acc, budget) => acc + budget.spent, 0);
  const maximum =
    totalMaximum ?? budgets.reduce((acc, budget) => acc + budget.maximum, 0);
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const data = budgets.map((budget) => ({
    name: budget.name,
    value: overview ? budget.maximum : budget.spent,
    color: budget.color || "var(--color-green)",
  }));
  if (overview && !data.some((item) => item.value > 0))
    data.push({
      name: "No budget allocated",
      value: 1,
      color: "var(--color-grey-100)",
    });

  return (
    <div
      className={
        overview
          ? "relative h-60 w-60 shrink-0"
          : "relative h-[280px] w-[280px] max-w-full shrink-0"
      }
      role={overview ? "img" : undefined}
      aria-label={
        overview
          ? `${money.format(totalSpent)} spent of ${money.format(maximum)} budget limit. Segments show category limits.`
          : undefined
      }
    >
      <PieChart
        width={overview ? 240 : 280}
        height={overview ? 240 : 280}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={overview ? 105 : 94}
          innerRadius={overview ? 81 : 81}
          stroke="none"
          isAnimationActive={!overview}
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
          innerRadius={overview ? 93.75 : 94}
          outerRadius={overview ? 120 : 120}
          paddingAngle={0}
          stroke="none"
          isAnimationActive={!overview}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          formatter={overview ? (value) => money.format(value) : undefined}
        />
      </PieChart>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <p
          className="text-grey-900"
          style={{
            ...(overview
              ? {
                  fontSize: 32,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  maxWidth: 154,
                  overflowWrap: "anywhere",
                  textAlign: "center",
                }
              : { font: "var(--text-preset-1)" }),
          }}
        >
          {money.format(totalSpent)}
        </p>
        <p
          className="text-grey-500"
          style={{
            ...(overview
              ? {
                  fontSize: 12,
                  lineHeight: 1.5,
                  textAlign: "center",
                  maxWidth: 154,
                }
              : { font: "var(--text-preset-5)" }),
          }}
        >
          of {money.format(maximum)} limit
        </p>
      </div>
    </div>
  );
}

export default BudgetChart;
