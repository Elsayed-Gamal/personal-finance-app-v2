'use client';

import { useNavigation } from '@/app/_contexts/NavigationContext';
import useDebounce from '@/app/_hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    <div className="mb-6 flex items-center justify-between">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search transaction"
        className="border-beige-500 placeholder:text-beige-500 w-[320px] rounded-lg border bg-[url('/assets/images/icon-search.svg')] bg-position-[center_right_1rem] bg-no-repeat py-3 pr-12 pl-5 focus:outline-none"
        disabled={isPending}
      />

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="sort">Sort by</label>
          <select
            name=""
            id="sort"
            className="border-beige-500 ml-4 rounded-lg border bg-white px-4 py-3 focus:outline-none"
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
        <div>
          <label htmlFor="category">Category</label>
          <select
            name=""
            id="category"
            className="border-beige-500 ml-4 rounded-lg border bg-white px-4 py-3 focus:outline-none"
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
