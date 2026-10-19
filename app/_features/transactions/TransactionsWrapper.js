import TransactionsTable from './TransactionsTable';
import { getTransactions } from '@/app/_services/apiTransactions';

async function Transactions({ searchParams, categories, balanceReady }) {
  const page = +searchParams.page || 1;
  const sort = searchParams.sort || 'date_desc';
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';

  const { transactions, count, page: currentPage } = await getTransactions(
    page,
    search,
    sort,
    category,
  );

  return <TransactionsTable transactions={transactions} count={count} page={currentPage} categories={categories} balanceReady={balanceReady} />;
}

export default Transactions;
