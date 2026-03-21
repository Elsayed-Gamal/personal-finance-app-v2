'use client';

import Table from '@/app/_UI/Table';
import { format } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function Transaction({ transaction }) {
  return (
    <Table.Row>
      <div
        className="text-grey-900 flex items-center"
        style={{ font: 'var(--text-preset-4-bold)' }}
      >
        <img
          src={transaction.avatar}
          alt={`Avatar of ${transaction.name}`}
          className="mr-2.5 inline-block h-[40px] w-[40px] rounded-full object-cover align-middle"
        />
        {transaction.name}
      </div>
      <div className="text-grey-500" style={{ font: 'var(--text-preset-5)' }}>
        {transaction.categories.name}
      </div>
      <div className="text-grey-500" style={{ font: 'var(--text-preset-5)' }}>
        {format(new Date(transaction.date), 'dd MMM yyyy')}
      </div>
      <div
        className={`ml-auto ${transaction.amount < 0 ? 'text-grey-900' : 'text-green'}`}
        style={{ font: 'var(--text-preset-4-bold)' }}
      >
        {transaction.amount > 0 && '+'}
        {currencyFormatter.format(transaction.amount)}
      </div>
    </Table.Row>
  );
}

export default Transaction;
