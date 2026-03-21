'use client';

import { useNavigation } from '@/app/_contexts/NavigationContext';
import { useRouter, useSearchParams } from 'next/navigation';

const PAGE_SIZE = 10;

function getPageNumbers(current, total) {
  const pages = new Set([1, total]);

  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 1 && i < total) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}

function Pagination({ count }) {
  const { startTransition } = useNavigation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = +searchParams.get('page') || 1;
  const pageCount = Math.ceil(count / PAGE_SIZE);

  function goToPage(pg) {
    const params = new URLSearchParams(searchParams);
    params.set('page', pg);
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`, { scroll: false });
    });
  }

  function nextPage() {
    if (page < pageCount) goToPage(page + 1);
  }

  function prevPage() {
    if (page > 1) goToPage(page - 1);
  }

  const pages = getPageNumbers(page, pageCount);

  return (
    <>
      <button
        onClick={prevPage}
        disabled={page === 1}
        className="border-beige-500 text-grey-900 flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ font: 'var(--text-preset-4)' }}
      >
        <img src="/assets/images/icon-caret-left.svg" alt="" />
        Prev
      </button>
      <div className="flex items-center gap-2">
        {pages.map((pg, i) =>
          pg === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-grey-500">
              ...
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => goToPage(pg)}
              className={`${
                pg === page
                  ? 'bg-grey-900 border-grey-900 text-white'
                  : 'text-grey-900'
              } border-beige-500 h-10 w-10 cursor-pointer rounded-lg border`}
              style={{ font: 'var(--text-preset-4)' }}
            >
              {pg}
            </button>
          ),
        )}
      </div>
      <button
        onClick={nextPage}
        disabled={page === pageCount}
        className="border-beige-500 text-grey-900 flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ font: 'var(--text-preset-4)' }}
      >
        Next
        <img src="/assets/images/icon-caret-right.svg" alt="" />
      </button>
    </>
  );
}

export default Pagination;
