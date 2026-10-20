import RecurringIcon from '@/app/_UI/icons/RecurringIcon';
import { formatCurrency } from '@/app/_utils/helpers';

const rows = [
  ['Paid Bills', 'paid'],
  ['Total Upcoming', 'upcoming'],
  ['Due Soon', 'dueSoon'],
];

function TotalSummary({ summary }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
      <section className="flex min-h-[118px] items-center gap-5 rounded-xl bg-grey-900 p-6 text-white md:min-h-[190px] md:flex-col md:items-start md:justify-between md:gap-8">
        <RecurringIcon className="shrink-0" />
        <div className="flex flex-col gap-2.5">
          <p style={{ font: 'var(--text-preset-4)' }}>Total Bills</p>
          <h2 style={{ font: 'var(--text-preset-1)' }}>
            {formatCurrency(summary.total.amount)}
          </h2>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5">
        <h3
          className="mb-5 text-grey-900"
          style={{ font: 'var(--text-preset-3)' }}
        >
          Summary
        </h3>
        <dl>
          {rows.map(([label, key]) => (
            <div
              key={key}
              className={`flex items-center justify-between border-b border-grey-100 py-4 first:pt-0 last:border-0 last:pb-0 ${key === 'dueSoon' ? 'text-red' : ''}`}
            >
              <dt
                className={key === 'dueSoon' ? '' : 'text-grey-500'}
                style={{ font: 'var(--text-preset-5)' }}
              >
                {label}
              </dt>
              <dd style={{ font: 'var(--text-preset-5-bold)' }}>
                {summary[key].count} ({formatCurrency(summary[key].amount)})
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default TotalSummary;
