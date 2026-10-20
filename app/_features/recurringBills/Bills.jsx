'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigation } from '@/app/_contexts/NavigationContext';
import { formatCurrency, normalizeImageSrc } from '@/app/_utils/helpers';
import { formatOrdinal, getRecurringBillStatus } from './recurringBills';

const sorts = {
  date_desc: (first, second) => second.date.localeCompare(first.date),
  date_asc: (first, second) => first.date.localeCompare(second.date),
  name_asc: (first, second) => first.name.localeCompare(second.name),
  name_desc: (first, second) => second.name.localeCompare(first.name),
  amount_desc: (first, second) =>
    Math.abs(second.amount) - Math.abs(first.amount),
  amount_asc: (first, second) =>
    Math.abs(first.amount) - Math.abs(second.amount),
};

function StatusIcon({ status }) {
  if (status === 'paid') {
    return (
      <Image
        src="/assets/images/icon-bill-paid.svg"
        alt="Paid"
        width={14}
        height={14}
      />
    );
  }
  if (status === 'due-soon') {
    return (
      <Image
        src="/assets/images/icon-bill-due.svg"
        alt="Due soon"
        width={14}
        height={14}
      />
    );
  }
  return null;
}

function Bills({ recurringBills, now }) {
  const [query, setQuery] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isPending, startTransition } = useNavigation();
  const requestedSort = searchParams.get('sort') || 'date_desc';
  const sort = sorts[requestedSort] ? requestedSort : 'date_desc';

  const handleSortChange = (event) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', event.target.value);
    startTransition(() => {
      router.push(`/recurring-bills?${params.toString()}`, { scroll: false });
    });
  };

  const visibleBills = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return [...recurringBills]
      .filter((bill) => bill.name.toLocaleLowerCase().includes(normalizedQuery))
      .sort(sorts[sort]);
  }, [query, recurringBills, sort]);

  return (
    <section
      aria-busy={isPending}
      className={`rounded-xl bg-white px-5 py-6 transition-opacity sm:p-8 ${isPending ? 'opacity-60' : ''}`}
    >
      <div className="mb-6 flex items-center gap-6">
        <label className="relative min-w-0 flex-1 sm:max-w-[320px]">
          <span className="sr-only">Search bills</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isPending}
            placeholder="Search bills"
            className="w-full rounded-lg border border-beige-500 bg-white py-3 pr-12 pl-5 text-grey-900 outline-none placeholder:text-grey-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          />
          <Image
            src="/assets/images/icon-search.svg"
            alt=""
            width={16}
            height={16}
            className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2"
          />
        </label>

        <label className="ml-auto flex shrink-0 items-center gap-2 text-grey-500 sm:gap-4">
          <span
            className="hidden sm:inline"
            style={{ font: 'var(--text-preset-4)' }}
          >
            Sort by
          </span>
          <span className="sr-only sm:hidden">Sort bills</span>
          <select
            value={sort}
            onChange={handleSortChange}
            disabled={isPending}
            className="hidden rounded-lg border border-beige-500 bg-white px-5 py-3 font-bold text-grey-900 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green sm:block"
          >
            <option value="date_desc">Latest</option>
            <option value="date_asc">Oldest</option>
            <option value="name_asc">A to Z</option>
            <option value="name_desc">Z to A</option>
            <option value="amount_desc">Highest</option>
            <option value="amount_asc">Lowest</option>
          </select>
          <span className="relative h-5 w-5 sm:hidden">
            <Image
              src="/assets/images/icon-sort-mobile.svg"
              alt=""
              fill
              sizes="20px"
            />
            <select
              value={sort}
              onChange={handleSortChange}
              disabled={isPending}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Sort bills"
            >
              <option value="date_desc">Latest</option>
              <option value="date_asc">Oldest</option>
              <option value="name_asc">A to Z</option>
              <option value="name_desc">Z to A</option>
              <option value="amount_desc">Highest</option>
              <option value="amount_asc">Lowest</option>
            </select>
          </span>
        </label>
      </div>

      <div role="table" aria-label="Recurring bills">
        <div
          role="row"
          className="hidden grid-cols-[minmax(0,1.7fr)_minmax(100px,1fr)_minmax(90px,.7fr)] border-b border-grey-100 px-4 py-3 text-grey-500 sm:grid"
          style={{ font: 'var(--text-preset-5)' }}
        >
          <div role="columnheader">Bill Title</div>
          <div role="columnheader">Due Date</div>
          <div role="columnheader" className="text-right">
            Amount
          </div>
        </div>

        <div role="rowgroup">
          {visibleBills.map((bill) => {
            const status = getRecurringBillStatus(bill, new Date(now));
            return (
              <div
                role="row"
                key={bill.name}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-grey-100 py-5 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1.7fr)_minmax(100px,1fr)_minmax(90px,.7fr)] sm:px-4 sm:first:pt-5 sm:last:pb-5"
              >
                <div
                  role="cell"
                  className="col-span-2 flex min-w-0 items-center gap-4 sm:col-span-1"
                >
                  {bill.avatar ? (
                    <Image
                      src={normalizeImageSrc(bill.avatar)}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige-100 text-sm font-bold"
                    >
                      {bill.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span
                    className="truncate text-grey-900"
                    style={{ font: 'var(--text-preset-4-bold)' }}
                  >
                    {bill.name}
                  </span>
                </div>
                <div
                  role="cell"
                  className={`col-start-1 mt-2 flex min-w-0 items-center gap-2 sm:col-auto sm:mt-0 ${status === 'paid' ? 'text-green' : 'text-grey-500'}`}
                  style={{ font: 'var(--text-preset-5)' }}
                >
                  <span className="whitespace-nowrap">
                    Monthly - {formatOrdinal(bill.day)}
                  </span>
                  <StatusIcon status={status} />
                </div>
                <div
                  role="cell"
                  className={`col-start-2 row-start-2 mt-2 flex items-center justify-end sm:col-auto sm:row-auto sm:mt-0 ${status === 'due-soon' ? 'text-red' : 'text-grey-900'}`}
                  style={{ font: 'var(--text-preset-4-bold)' }}
                >
                  {formatCurrency(bill.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {visibleBills.length === 0 && (
        <p
          className="py-10 text-center text-grey-500"
          style={{ font: 'var(--text-preset-4)' }}
        >
          No recurring bills found.
        </p>
      )}
    </section>
  );
}

export default Bills;
