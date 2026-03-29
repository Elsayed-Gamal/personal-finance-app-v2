'use client';

import RecurringIcon from '@/app/_UI/icons/RecurringIcon';
import Table from '@/app/_UI/Table';
import { formatCurrency } from '@/app/_utils/helpers';

function TotalSummary() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-grey-900 flex flex-col gap-8 rounded-xl p-6 text-white">
        <RecurringIcon />
        <div className="flex flex-col gap-2.75">
          <p
            style={{
              font: 'var(--text-preset-4)',
            }}
          >
            Total Bills
          </p>
          <h2
            style={{
              font: 'var(--text-preset-1)',
            }}
          >
            {formatCurrency(384.98)}
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-5 rounded-xl bg-white p-5">
        <h3
          className="text-grey-900"
          style={{
            font: 'var(--text-preset-3)',
          }}
        >
          Summary
        </h3>
        <Table columns="1fr 1fr">
          <Table.Body>
            <Table.Row
              styles={{
                paddingTop: '0',
                paddingBottom: '16px',
                paddingLeft: '0',
                paddingRight: '0',
              }}
            >
              <p
                className="text-grey-500"
                style={{
                  font: 'var(--text-preset-5)',
                }}
              >
                Paid Bills
              </p>
              <p
                className="text-grey-900 ml-auto"
                style={{
                  font: 'var(--text-preset-5-bold)',
                }}
              >
                4 ({formatCurrency(190)})
              </p>
            </Table.Row>
            <Table.Row
              styles={{
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '0',
                paddingRight: '0',
              }}
            >
              <p
                className="text-grey-500"
                style={{
                  font: 'var(--text-preset-5)',
                }}
              >
                Total Upcoming
              </p>
              <p
                className="text-grey-900 ml-auto"
                style={{
                  font: 'var(--text-preset-5-bold)',
                }}
              >
                4 ({formatCurrency(194.98)})
              </p>
            </Table.Row>
            <Table.Row
              styles={{
                paddingTop: '16px',
                paddingBottom: '0',
                paddingLeft: '0',
                paddingRight: '0',
                color: 'var(--color-red)',
              }}
            >
              <p
                style={{
                  font: 'var(--text-preset-5)',
                }}
              >
                Due Soon
              </p>
              <p
                className="ml-auto"
                style={{
                  font: 'var(--text-preset-5-bold)',
                }}
              >
                2 ({formatCurrency(59.98)})
              </p>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default TotalSummary;
