import RecurringContainer from '../../_features/recurringBills/RecurringContainer';
import NavigationProvider from '../../_contexts/NavigationContext';

export const dynamic = 'force-dynamic';

function RecurringBillsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-8">
      <h1
        className="flex min-h-[54px] items-center text-grey-900 sm:min-h-14"
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
