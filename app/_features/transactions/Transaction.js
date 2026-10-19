'use client';
import Image from 'next/image';
import { format } from 'date-fns';
import TransactionEditor from './TransactionEditor';
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function Transaction({ transaction, categories, balanceReady }) {
  const date = format(new Date(transaction.date), 'dd MMM yyyy');
  return <tr className="border-b border-grey-100 last:border-0">
    <td className="py-4 pr-3">
      <div className="flex items-center gap-3">
        {transaction.avatar ? <Image src={transaction.avatar} alt="" width={40} height={40} unoptimized className="hidden rounded-full sm:block" /> : <span aria-hidden="true" className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-beige-100 font-bold sm:flex">{transaction.name.slice(0, 1).toUpperCase()}</span>}
        <div><p className="font-bold break-words">{transaction.name}</p><p className="mt-1 text-xs text-grey-500 md:hidden">{transaction.categories?.name ?? 'Uncategorized'}</p><p className="mt-1 text-xs text-grey-500 sm:hidden">{date}</p></div>
      </div>
    </td>
    <td className="hidden py-4 pr-4 text-grey-500 md:table-cell">{transaction.categories?.name ?? 'Uncategorized'}</td>
    <td className="hidden whitespace-nowrap py-4 pr-4 text-grey-500 sm:table-cell">{date}</td>
    <td className={`whitespace-nowrap py-4 text-right font-bold ${transaction.amount > 0 ? 'text-green' : ''}`}>{transaction.amount > 0 ? '+' : ''}{currency.format(transaction.amount)}</td>
    <td className="py-4 pl-3"><TransactionEditor transaction={transaction} categories={categories} balanceReady={balanceReady} /></td>
  </tr>;
}
