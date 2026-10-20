import RecurringContainer from '../../_features/recurringBills/RecurringContainer';
import NavigationProvider from '../../_contexts/NavigationContext';

export const dynamic = 'force-dynamic';

function RecurringBillsPage() {
  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <h1
        className="text-gray-900"
        style={{
          font: 'var(--text-preset-1)',
        }}
      >
        Recurring Bills
      </h1>
      <NavigationProvider>
        <RecurringContainer />
      </NavigationProvider>
    </div>
  );
}

export default RecurringBillsPage;
