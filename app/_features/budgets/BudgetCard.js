import Image from "next/image";
import Link from "next/link";
import BudgetEditor from "./BudgetEditor";
import { formatCurrency } from "@/app/_utils/helpers";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function BudgetCard({
  budget,
  categories,
  themes,
  transactions = [],
}) {
  const remaining = budget.maximum - budget.spent;
  const progress =
    budget.maximum > 0
      ? Math.min(100, Math.max(0, (budget.spent / budget.maximum) * 100))
      : 0;

  return (
    <section className="rounded-xl bg-white p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-4 text-xl font-bold">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: budget.color ?? "#277C78" }}
          />
          <span className="truncate">{budget.name}</span>
        </h2>
        <BudgetEditor budget={budget} categories={categories} themes={themes} />
      </div>

      <div className="mt-5">
        <p className="text-sm text-grey-500">
          Maximum of {formatCurrency(budget.maximum)}
        </p>
        <div
          className="mt-4 h-8 rounded-sm bg-beige-100 p-1"
          role="progressbar"
          aria-label={`${budget.name} budget used`}
          aria-valuemin={0}
          aria-valuemax={budget.maximum}
          aria-valuenow={Math.min(budget.spent, budget.maximum)}
        >
          <div
            className="h-full rounded-sm"
            style={{
              width: `${progress}%`,
              backgroundColor: budget.color ?? "#277C78",
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex gap-4 border-r border-grey-100">
            <span
              className="w-1 shrink-0 rounded-lg"
              style={{ backgroundColor: budget.color ?? "#277C78" }}
            />
            <p>
              <span className="block text-xs text-grey-500">Spent</span>
              <strong className="text-sm">
                {formatCurrency(budget.spent)}
              </strong>
            </p>
          </div>
          <div className="flex gap-4">
            <span className="w-1 shrink-0 rounded-lg bg-beige-100" />
            <p className={remaining < 0 ? "text-red" : ""}>
              <span className="block text-xs text-grey-500">
                {remaining < 0 ? "Over budget" : "Remaining"}
              </span>
              <strong className="text-sm">
                {formatCurrency(Math.abs(remaining))}
              </strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-beige-100 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold">Latest Spending</h3>
          <Link
            href={`/transactions?category=${encodeURIComponent(budget.name)}`}
            className="text-sm text-grey-500 hover:text-grey-900"
          >
            See All{" "}
            <span aria-hidden="true" className="ml-2">
              ›
            </span>
          </Link>
        </div>
        {transactions.length > 0 ? (
          <ul className="mt-5">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-3 border-b border-grey-500/15 py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {transaction.avatar ? (
                    <Image
                      src={transaction.avatar}
                      alt=""
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold"
                    >
                      {transaction.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-xs font-bold">
                    {transaction.name}
                  </span>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <strong className="block">
                    -{formatCurrency(transaction.amount)}
                  </strong>
                  <time
                    className="mt-1 block text-grey-500"
                    dateTime={String(transaction.date)}
                  >
                    {dateFormatter.format(new Date(transaction.date))}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-grey-500">
            No spending in this category this month.
          </p>
        )}
      </div>
    </section>
  );
}
