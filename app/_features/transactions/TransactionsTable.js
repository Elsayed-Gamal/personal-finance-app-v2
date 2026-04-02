'use client';

import Table from '../../_UI/Table';
import Transaction from './Transaction';
import Pagination from './Pagination';
import { useNavigation } from '@/app/_contexts/NavigationContext';
import Loading from '@/app/_UI/Loading';

function TransactionsTable({ transactions, count }) {
  const { isPending } = useNavigation();

  if (isPending) return <Loading />;

  return (
    <Table columns="3fr 1fr 2fr 1fr">
      <Table.Header>
        <div>Recipient / Sender</div>
        <div>Category</div>
        <div>Transaction Date</div>
        <div className="ml-auto">Amount</div>
      </Table.Header>
      <Table.Body>
        {transactions.length === 0 && (
          <div className="col-span-4 text-center mt-10">
            No transactions found.
          </div>
        )}
        {transactions.map((transaction) => (
          <Transaction key={transaction.id} transaction={transaction} />
        ))}
      </Table.Body>
      <Table.Footer className="mt-8 flex items-center justify-between gap-4">
        {transactions.length > 0 && <Pagination count={count} />}
      </Table.Footer>
    </Table>
  );
}

export default TransactionsTable;
