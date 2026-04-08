'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import OverviewIcon from './icons/OverviewIcon';
import TransactionsIcon from './icons/TransactionsIcon';
import PotsIcon from './icons/PotsIcon';
import RecurringBillsIcon from './icons/RecurringBillsIcon';
import BudgetsIcon from './icons/BudgetsIcon';
import { signOut, useSession } from 'next-auth/react';
import ProfileIcon from './icons/ProfileIcon';
import SignoutIcon from './icons/SignoutIcon';
import AdminIcon from './icons/AdminIcon';

function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const navLinkClass = (isActive) =>
    `flex items-center gap-4 px-8 py-4 w-[90%] rounded-tr-xl rounded-br-xl ${isActive ? 'bg-beige-100 text-grey-900 border-l-4 border-green' : 'text-grey-300'}`;

  const iconClass = (isActive) =>
    `${isActive ? 'fill-green' : 'fill-grey-300'}`;

  return (
    <aside
      className="min-h-screen rounded-tr-xl rounded-br-xl bg-gray-900 relative
    "
    >
      <Image
        src="/assets/images/logo-large.svg"
        alt="Logo"
        className="px-8 py-10"
        width={186}
        height={102}
      />
      <nav>
        <ul className="flex list-none flex-col">
          <li>
            <Link
              href="/"
              className={navLinkClass(pathname === '/')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <OverviewIcon className={iconClass(pathname === '/')} />
              Overview
            </Link>
          </li>
          <li>
            <Link
              href="/transactions"
              className={navLinkClass(pathname === '/transactions')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <TransactionsIcon
                className={iconClass(pathname === '/transactions')}
              />
              Transactions
            </Link>
          </li>
          <li>
            <Link
              href="/budgets"
              className={navLinkClass(pathname === '/budgets')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <BudgetsIcon className={iconClass(pathname === '/budgets')} />
              Budgets
            </Link>
          </li>
          <li>
            <Link
              href="/pots"
              className={navLinkClass(pathname === '/pots')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <PotsIcon className={iconClass(pathname === '/pots')} />
              Pots
            </Link>
          </li>
          <li>
            <Link
              href="/recurring-bills"
              className={navLinkClass(pathname === '/recurring-bills')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <RecurringBillsIcon
                className={iconClass(pathname === '/recurring-bills')}
              />
              Recurring Bills
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className={navLinkClass(pathname === '/profile')}
              style={{ font: 'var(--text-preset-3)' }}
            >
              <ProfileIcon className={iconClass(pathname === '/profile')} />
              Profile
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={navLinkClass(pathname === '/admin')}
                style={{ font: 'var(--text-preset-3)' }}
              >
                <AdminIcon className={iconClass(pathname === '/admin')} />
                Admin Panel
              </Link>
            </li>
          )}
          <li>
            <button
              className={navLinkClass(false)}
              style={{ font: 'var(--text-preset-3)', cursor: 'pointer' }}
              onClick={() => {
                signOut();
              }}
            >
              <SignoutIcon className={iconClass(false)} />
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
