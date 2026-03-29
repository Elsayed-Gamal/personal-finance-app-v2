'use client';

import Table from '@/app/_UI/Table';
import { formatCurrency } from '@/app/_utils/helpers';

function Bills({ recurringBills }) {
  return (
    <Table columns="2fr 1fr 1fr">
      <Table.Header>
        <div>Bill Title</div>
        <div>Due Date</div>
        <div className="ml-auto">Amount</div>
      </Table.Header>
      <Table.Body>
        {recurringBills?.map((bill) => (
          <Table.Row styles={{ padding: '20px 16px' }} key={bill.name}>
            <div
              className="text-grey-900 flex items-center"
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              <img
                src={bill.avatar}
                alt={`Avatar of ${bill.name}`}
                className="mr-2.5 inline-block h-[32px] w-[32px] rounded-full object-cover align-middle"
              />
              {bill.name}
            </div>
            <div>{bill.day}</div>
            <div className="ml-auto">{formatCurrency(bill.amount)}</div>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export default Bills;
