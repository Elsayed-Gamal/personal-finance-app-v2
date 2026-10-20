'use client';

import { useNavigation } from '@/app/_contexts/NavigationContext';
import useDebounce from '@/app/_hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const SearchBar = ({ categories }) => {
  const { startTransition, isPending } = useNavigation();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('search') || '',
  );
  const debouncedSearchQuery = useDebounce(searchQuery);

  const sort = searchParams.get('sort') || 'date_desc';
  const selectedCategory = searchParams.get('category') || 'all';

  const router = useRouter();

  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';
    if (currentSearch === debouncedSearchQuery) return;

    const params = new URLSearchParams(searchParams);
    params.set('search', debouncedSearchQuery);
    params.set('page', '1'); // Reset to first page on new search
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`, { scroll: false });
    });
  }, [debouncedSearchQuery, router, searchParams, startTransition]);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', '1'); // Reset to first page on sort change
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`, { scroll: false });
    });
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('category', newCategory);
    params.set('page', '1'); // Reset to first page on category change
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="mb-6 flex min-w-0 items-center gap-4 sm:gap-6">
      <label className="relative min-w-0 flex-1 lg:max-w-[320px]">
        <span className="sr-only">Search transactions</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transaction"
          className="w-full rounded-lg border border-beige-500 py-3 pr-12 pl-5 text-grey-900 placeholder:text-grey-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          disabled={isPending}
        />
        <Image
          src="/assets/images/icon-search.svg"
          alt=""
          width={16}
          height={16}
          className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2"
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-6">
        <div className="relative flex items-center gap-3">
          <label htmlFor="sort" className="hidden text-grey-500 lg:block">
            Sort by
          </label>
          <span className="relative h-5 w-5 lg:hidden">
            <Image src="/assets/images/icon-sort-mobile.svg" alt="" fill sizes="20px" />
          </span>
          <select
            id="sort"
            aria-label="Sort transactions"
            className="absolute h-10 w-10 cursor-pointer opacity-0 lg:static lg:h-auto lg:w-auto lg:rounded-lg lg:border lg:border-beige-500 lg:bg-white lg:px-4 lg:py-3 lg:opacity-100 lg:focus-visible:outline-2 lg:focus-visible:outline-offset-2 lg:focus-visible:outline-green"
            value={sort}
            onChange={handleSortChange}
            disabled={isPending}
          >
            <option value="date_desc">Latest</option>
            <option value="date_asc">Oldest</option>
            <option value="name_asc">A to Z</option>
            <option value="name_desc">Z to A</option>
            <option value="amount_desc">Highest</option>
            <option value="amount_asc">Lowest</option>
          </select>
        </div>
        <div className="relative flex items-center gap-3">
          <label htmlFor="category" className="hidden text-grey-500 lg:block">
            Category
          </label>
          <span className="relative h-5 w-5 lg:hidden">
            <Image src="/assets/images/icon-filter-mobile.svg" alt="" fill sizes="20px" />
          </span>
          <select
            id="category"
            aria-label="Filter transactions by category"
            className="absolute h-10 w-10 cursor-pointer opacity-0 lg:static lg:h-auto lg:w-auto lg:rounded-lg lg:border lg:border-beige-500 lg:bg-white lg:px-4 lg:py-3 lg:opacity-100 lg:focus-visible:outline-2 lg:focus-visible:outline-offset-2 lg:focus-visible:outline-green"
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={isPending}
          >
            <option value="all">All Transactions</option>
            {categories &&
              categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
