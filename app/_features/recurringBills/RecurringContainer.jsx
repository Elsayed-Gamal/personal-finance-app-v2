import { getRecurringBills } from '@/app/_services/apiTransactions';
import Bills from './Bills';
import TotalSummary from './TotalSummary';

async function RecurringContainer() {
  const recurringBills = await getRecurringBills();

  return (
    <div className="grid grid-cols-[1fr_2fr] gap-6">
      <TotalSummary />
      <div className="rounded-xl bg-white p-8">
        <Bills recurringBills={recurringBills} />
      </div>
    </div>
  );
}

export default RecurringContainer;
