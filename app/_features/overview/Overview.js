import Image from "next/image";
import Link from "next/link";
import MonthFilter from "../../_UI/MonthFilter";
import BudgetChart from "../budgets/BudgetChart";
import { recurringSummary } from "./recurringSummary";
import { normalizeImageSrc } from "../../_utils/helpers";
import styles from "./Overview.module.css";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const compactMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function CardHeading({ title, href, action = "See Details" }) {
  return (
    <div className={styles.cardHeading}>
      <h2>{title}</h2>
      <Link href={href} className={styles.details}>
        {action}
        <span className="sr-only">: {title}</span>
        <Image
          src="/assets/images/overview/caret-down.svg"
          width={12}
          height={12}
          alt=""
          className="-rotate-90"
        />
      </Link>
    </div>
  );
}

function LegendItem({ name, amount, color, warning }) {
  return (
    <li className={styles.legendItem}>
      <span
        className={styles.colorTag}
        style={{ backgroundColor: color || "var(--color-green)" }}
      />
      <div className="min-w-0">
        <p className={styles.legendName}>{name}</p>
        <p className={styles.legendAmount}>{amount}</p>
        {warning && <p className="mt-1 text-xs text-red">{warning}</p>}
      </div>
    </li>
  );
}

export default function Overview({
  summary,
  recurringBills,
  month,
  monthLabel,
}) {
  const { balance, period, pots, budgets, transactions } = summary;
  const bills = recurringSummary(recurringBills);
  // Include categories beyond the API's four-item preview in the full chart.
  const otherMaximum = Math.max(
    0,
    budgets.maximum -
      budgets.items.reduce((total, item) => total + item.maximum, 0),
  );
  const chartBudgets =
    otherMaximum > 0
      ? [
          ...budgets.items,
          {
            name: "Other budgets",
            maximum: otherMaximum,
            color: "var(--color-grey-300)",
          },
        ]
      : budgets.items;
  return (
    <div className={styles.overview}>
      <header className={styles.heading}>
        <h1>Overview</h1>
        <details className={styles.monthPicker}>
          <summary>
            {monthLabel}
            <span className="sr-only"> — change reporting month</span>
          </summary>
          <div className={styles.monthPopover}>
            <MonthFilter month={month} />
          </div>
        </details>
      </header>
      <div className={styles.summary}>
        <section className={`${styles.summaryCard} ${styles.balance}`}>
          <h2 title="Current available balance, excluding money saved in pots">
            Current Balance
          </h2>
          <p>{balance === null ? "Not set up" : money.format(balance)}</p>
          <span className="sr-only">Excludes money saved in pots.</span>
        </section>
        {[
          ["Income", period.income],
          ["Expenses", period.expense],
        ].map(([title, amount]) => (
          <section
            className={styles.summaryCard}
            key={title}
            aria-label={`${title} for ${monthLabel}`}
          >
            <h2>{title}</h2>
            <p>{money.format(amount)}</p>
          </section>
        ))}
      </div>
      {balance === null && (
        <p
          role="status"
          className="rounded-lg border border-yellow bg-white p-4 text-sm"
        >
          Your opening balance has not been set up. Contact the administrator to
          confirm it before changing transactions or moving money.
        </p>
      )}
      <div className={styles.content}>
        <section className={`${styles.card} ${styles.pots}`}>
          <CardHeading title="Pots" href="/pots" />
          <div className={styles.potsContent}>
            <div className={styles.saved}>
              <Image
                src="/assets/images/overview/pot.svg"
                width={40}
                height={40}
                alt=""
              />
              <div className="min-w-0">
                <p>Total Saved</p>
                <strong>{compactMoney.format(pots.total)}</strong>
              </div>
            </div>
            {pots.count === 0 ? (
              <p className={styles.empty}>
                Create your first pot to start saving toward a goal.
              </p>
            ) : (
              <ul className={styles.potLegend}>
                {pots.items.map((pot) => (
                  <LegendItem
                    key={pot.id}
                    name={pot.name}
                    amount={compactMoney.format(pot.total ?? 0)}
                    color={pot.theme}
                  />
                ))}
              </ul>
            )}
          </div>
          {pots.count > pots.items.length && (
            <p className={styles.note}>
              Showing {pots.items.length} of {pots.count} pots. Total includes
              all pots.
            </p>
          )}
        </section>
        <section className={`${styles.card} ${styles.transactions}`}>
          <CardHeading
            title="Transactions"
            href="/transactions"
            action="View All"
          />
          <span className="sr-only">
            Your latest transactions across all months.
          </span>
          {transactions.length === 0 ? (
            <p className={styles.empty}>
              No transactions yet. Add income or an expense to get started.
            </p>
          ) : (
            <ul className={styles.transactionList}>
              {transactions.map((transaction) => (
                <li key={transaction.id} className={styles.transaction}>
                  <div className={styles.transactionIdentity}>
                    {transaction.avatar ? (
                      <Image
                        src={normalizeImageSrc(transaction.avatar)}
                        width={40}
                        height={40}
                        unoptimized
                        alt=""
                        className={styles.avatar}
                      />
                    ) : (
                      <span aria-hidden="true" className={styles.initial}>
                        {transaction.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <p>{transaction.name}</p>
                  </div>
                  <div className={styles.transactionValue}>
                    <p className={transaction.amount > 0 ? "text-green" : ""}>
                      {transaction.amount > 0 ? "+" : ""}
                      {money.format(transaction.amount)}
                    </p>
                    <time dateTime={transaction.date.slice(0, 10)}>
                      {dateFormat.format(
                        new Date(`${transaction.date.slice(0, 10)}T00:00:00Z`),
                      )}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={`${styles.card} ${styles.budgets}`}>
          <CardHeading title="Budgets" href={`/budgets?month=${month}`} />
          {budgets.count === 0 ? (
            <p className={styles.empty}>
              Set a monthly spending limit for your first category.
            </p>
          ) : (
            <div className={styles.budgetContent}>
              <div className={styles.chart}>
                <BudgetChart
                  budgets={chartBudgets}
                  overview
                  totalSpent={budgets.spent}
                  totalMaximum={budgets.maximum}
                />
              </div>
              <ul className={styles.budgetLegend}>
                {budgets.items.map((budget) => (
                  <LegendItem
                    key={budget.id}
                    name={budget.name}
                    amount={money.format(budget.maximum)}
                    color={budget.color}
                    warning={
                      budget.spent > budget.maximum
                        ? `Over by ${money.format(budget.spent - budget.maximum)}`
                        : null
                    }
                  />
                ))}
              </ul>
            </div>
          )}
          {budgets.count > budgets.items.length && (
            <p className={styles.note}>
              Showing {budgets.items.length} of {budgets.count} budgets. Chart
              includes all budgets.
            </p>
          )}
        </section>
        <section className={`${styles.card} ${styles.bills}`}>
          <CardHeading title="Recurring Bills" href="/recurring-bills" />
          <dl className={styles.billList}>
            {[
              ["Paid Bills", bills.paid, "var(--color-green)"],
              ["Total Upcoming", bills.upcoming, "var(--color-yellow)"],
              ["Due Soon", bills.dueSoon, "var(--color-red)"],
            ].map(([title, amount, color]) => (
              <div
                className={styles.bill}
                style={{ borderColor: color }}
                key={title}
              >
                <dt>{title}</dt>
                <dd>{money.format(amount)}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>
            {recurringBills.length
              ? "Current month · Upcoming amounts are estimated from your latest recurring payments; due soon means the next 5 days."
              : "No recurring bills yet. Mark an expense as recurring to track it here."}
          </p>
        </section>
      </div>
    </div>
  );
}
