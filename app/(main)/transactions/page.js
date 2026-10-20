import TransWrapper from '../../_features/transactions/TransactionsWrapper';
import { getCategories } from '../../_services/apiCategories';
import SearchBar from '../../_features/transactions/SearchBar';
import TransactionEditor from '../../_features/transactions/TransactionEditor';
import { getBalance } from '../../_services/apiBalance';
import NavigationProvider from '../../_contexts/NavigationContext';

export const dynamic = 'force-dynamic'; // This page needs to be dynamic because it relies on search params that can change frequently

async function TransactionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const [categories, balance] = await Promise.all([
    getCategories(),
    getBalance(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1
          className="text-grey-900"
          style={{
            font: 'var(--text-preset-1)',
          }}
        >
          Transactions
        </h1>
        <TransactionEditor
          categories={categories}
          balanceReady={balance !== null}
        />
      </div>
      {balance === null && (
        <p
          role="status"
          className="rounded-xl border border-yellow bg-white p-4 text-sm"
        >
          Your balance is not set up yet. You can view your transactions, but
          contact the administrator before adding, editing or deleting them.
        </p>
      )}
      <div className="rounded-xl bg-white p-5 sm:p-8">
        <NavigationProvider>
          <SearchBar categories={categories} />

          <TransWrapper
            searchParams={resolvedSearchParams}
            categories={categories}
            balanceReady={balance !== null}
          />
        </NavigationProvider>
      </div>
    </div>
  );
}

export default TransactionsPage;
