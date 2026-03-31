import TransWrapper from '../../_features/transactions/TransactionsWrapper';
import { getCategories } from '../../_services/apiCategories';
import SearchBar from '../../_features/transactions/SearchBar';
import NavigationProvider from '../../_contexts/NavigationContext';

export const dynamic = 'force-dynamic'; // This page needs to be dynamic because it relies on search params that can change frequently

async function TransactionsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="text-gray-900"
        style={{
          font: 'var(--text-preset-1)',
        }}
      >
        Transactions
      </h1>
      <div className="rounded-xl bg-white p-8">
        <NavigationProvider>
          <SearchBar categories={categories} />

          <TransWrapper searchParams={resolvedSearchParams} />
        </NavigationProvider>
      </div>
    </div>
  );
}

export default TransactionsPage;
