'use client';
import Transaction from './Transaction';
import Pagination from './Pagination';
import { useNavigation } from '@/app/_contexts/NavigationContext';

export default function TransactionsTable({ transactions, count, page, categories, balanceReady }) {
  const { isPending } = useNavigation();
  return <div aria-busy={isPending} className={isPending ? 'opacity-60' : ''}>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Your income and expense transactions</caption>
        <thead className="border-b border-grey-100 text-xs text-grey-500"><tr>
          <th scope="col" className="py-4 pr-4">Recipient / sender</th>
          <th scope="col" className="hidden py-4 pr-4 md:table-cell">Category</th>
          <th scope="col" className="hidden py-4 pr-4 sm:table-cell">Date</th>
          <th scope="col" className="py-4 text-right">Amount</th>
          <th scope="col" className="py-4 pl-4 text-right">Actions</th>
        </tr></thead>
        <tbody>{transactions.map(transaction => <Transaction key={transaction.id} transaction={transaction} categories={categories} balanceReady={balanceReady} />)}</tbody>
      </table>
    </div>
    {transactions.length === 0 && <p className="py-12 text-center text-grey-500">No transactions found. Add a transaction or change your filters.</p>}
    {count > 0 && <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><Pagination count={count} currentPage={page} /></div>}
  </div>;
}
