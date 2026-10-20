"use client";

import { useNavigation } from "@/app/_contexts/NavigationContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
      result.push("...");
    }
    result.push(sorted[i]);
  }

  return result;
}

function Pagination({ count, currentPage }) {
  const { startTransition } = useNavigation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = currentPage ?? (+searchParams.get("page") || 1);
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function goToPage(pg) {
    const params = new URLSearchParams(searchParams);
    params.set("page", pg);
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
    <nav aria-label="Transaction pages" className="flex w-full items-center justify-between gap-2">
      <button
        onClick={prevPage}
        disabled={page === 1}
        className="flex h-10 min-w-10 cursor-pointer items-center justify-center gap-4 rounded-lg border border-beige-500 px-3 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        style={{ font: "var(--text-preset-4)" }}
      >
        <Image
          src="/assets/images/icon-caret-left.svg"
          alt=""
          width={6}
          height={11}
        />
        <span className="hidden sm:inline">Prev</span>
      </button>
      <div className="flex items-center gap-1 sm:gap-2">
        {pages.map((pg, i) =>
          pg === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-grey-500">
              ...
            </span>
          ) : (
            <button
              key={pg}
              aria-label={`Page ${pg}`}
              aria-current={pg === page ? "page" : undefined}
              onClick={() => goToPage(pg)}
              className={`${
                pg === page
                  ? "bg-grey-900 border-grey-900 text-white"
                  : "text-grey-900"
              } h-10 w-10 cursor-pointer rounded-lg border border-beige-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
              style={{ font: "var(--text-preset-4)" }}
            >
              {pg}
            </button>
          ),
        )}
      </div>
      <button
        onClick={nextPage}
        disabled={page >= pageCount}
        className="flex h-10 min-w-10 cursor-pointer items-center justify-center gap-4 rounded-lg border border-beige-500 px-3 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        style={{ font: "var(--text-preset-4)" }}
      >
        <span className="hidden sm:inline">Next</span>
        <Image
          src="/assets/images/icon-caret-right.svg"
          alt=""
          width={6}
          height={11}
        />
      </button>
    </nav>
  );
}

export default Pagination;
