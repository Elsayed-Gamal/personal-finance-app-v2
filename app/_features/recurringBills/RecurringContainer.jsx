import { getRecurringBills } from '@/app/_services/apiTransactions';
import Bills from './Bills';
import TotalSummary from './TotalSummary';
import { buildRecurringBillsSummary } from './recurringBills';

async function RecurringContainer() {
  const recurringBills = await getRecurringBills();
  const now = new Date();
  const summary = buildRecurringBillsSummary(recurringBills, now);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[337px_minmax(0,1fr)]">
      <TotalSummary summary={summary} />
      <Bills recurringBills={recurringBills} now={now.toISOString()} />
    </div>
  );
}

export default RecurringContainer;
