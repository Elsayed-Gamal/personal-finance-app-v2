import TransactionsTable from './TransactionsTable';
import { getTransactions } from '@/app/_services/apiTransactions';

async function Transactions({ searchParams }) {
  const page = +searchParams.page || 1;
  const sort = searchParams.sort || 'date_desc';
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';

  const { transactions, count } = await getTransactions(
    page,
    search,
    sort,
    category,
  );

  return <TransactionsTable transactions={transactions} count={count} />;
}

export default Transactions;
