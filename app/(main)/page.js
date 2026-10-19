import Overview from "../_features/overview/Overview";
import { getOverview } from "../_services/apiOverview";
import {
  getRecurringBills,
  getTransactions,
} from "../_services/apiTransactions";
import { monthRange } from "../_utils/financialDates";

export default async function Home({ searchParams }) {
  const { month, label } = monthRange((await searchParams).month);
  const [summary, recurringBills, recent] = await Promise.all([
    getOverview(month),
    getRecurringBills(),
    getTransactions(1, "", "date_desc", "all", 5),
  ]);
  const avatars = new Map(
    recent.transactions.map(({ id, avatar }) => [id, avatar]),
  );
  return (
    <Overview
      summary={{
        ...summary,
        transactions: summary.transactions.map((transaction) => ({
          ...transaction,
          avatar: avatars.get(transaction.id),
        })),
      }}
      recurringBills={recurringBills}
      month={month}
      monthLabel={label}
    />
  );
}
