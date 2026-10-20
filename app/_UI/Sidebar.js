'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import OverviewIcon from './icons/OverviewIcon';
import TransactionsIcon from './icons/TransactionsIcon';
import PotsIcon from './icons/PotsIcon';
import RecurringBillsIcon from './icons/RecurringBillsIcon';
import BudgetsIcon from './icons/BudgetsIcon';
import { useSession } from 'next-auth/react';
import ProfileIcon from './icons/ProfileIcon';
import SignoutIcon from './icons/SignoutIcon';
import AdminIcon from './icons/AdminIcon';
import { signOutToLogin } from '../_utils/signOutToLogin';

const links = [
  { href: '/', label: 'Overview', Icon: OverviewIcon },
  { href: '/transactions', label: 'Transactions', Icon: TransactionsIcon },
  { href: '/budgets', label: 'Budgets', Icon: BudgetsIcon },
  { href: '/pots', label: 'Pots', Icon: PotsIcon },
  {
    href: '/recurring-bills',
    label: 'Recurring Bills',
    Icon: RecurringBillsIcon,
  },
];

function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const utilityLinks = [
    { href: '/profile', label: 'Profile', Icon: ProfileIcon },
    ...(session?.user?.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin Panel', Icon: AdminIcon }]
      : []),
  ];
  const activeUtilityLink = utilityLinks.find(
    ({ href }) => pathname === href,
  );
  const MobileUtilityIcon = activeUtilityLink?.Icon ?? ProfileIcon;
  const mobileUtilityActive = Boolean(activeUtilityLink);
  const mobileUtilityIconClass =
    MobileUtilityIcon === ProfileIcon
      ? mobileUtilityActive
        ? 'text-green'
        : 'text-grey-300'
      : mobileUtilityActive
        ? 'fill-green'
        : 'fill-grey-300';

  useEffect(() => {
    if (!accountOpen) return;

    function closeAccount(event) {
      if (event.key === 'Escape') setAccountOpen(false);
      if (
        event.type === 'pointerdown' &&
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener('keydown', closeAccount);
    document.addEventListener('pointerdown', closeAccount);
    return () => {
      document.removeEventListener('keydown', closeAccount);
      document.removeEventListener('pointerdown', closeAccount);
    };
  }, [accountOpen]);

  const itemClass = (active) =>
    `flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-t-lg px-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white min-[1120px]:min-h-14 min-[1120px]:w-full min-[1120px]:flex-none min-[1120px]:flex-row min-[1120px]:justify-start min-[1120px]:gap-4 min-[1120px]:rounded-l-none min-[1120px]:rounded-r-xl min-[1120px]:px-8 min-[1120px]:py-4 min-[1120px]:text-base ${active ? 'border-t-4 border-green bg-beige-100 text-grey-900 min-[1120px]:border-t-0 min-[1120px]:border-l-4 min-[1120px]:pl-7' : 'text-grey-300 hover:bg-grey-500/30 hover:text-white'}`;

  const navItem = (
    { href, label, Icon },
    desktopOnly = false,
    separated = false,
  ) => {
    const active = pathname === href;
    const iconClass =
      Icon === ProfileIcon
        ? active
          ? 'text-green'
          : 'text-grey-300'
        : active
          ? 'fill-green'
          : 'fill-grey-300';
    return (
      <li
        key={href}
        className={`${desktopOnly ? 'hidden min-[1120px]:flex' : 'flex'} ${separated ? 'min-[1120px]:mt-8' : ''} h-full min-w-0 flex-1 min-[1120px]:h-auto min-[1120px]:flex-none`}
      >
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          className={itemClass(active)}
          onClick={() => setAccountOpen(false)}
        >
          <span aria-hidden="true">
            <Icon className={iconClass} />
          </span>
          <span className="hidden max-w-full truncate sm:block">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 h-[52px] min-w-0 rounded-t-lg bg-grey-900 text-white min-[640px]:h-[74px] min-[1120px]:inset-y-0 min-[1120px]:right-auto min-[1120px]:left-0 min-[1120px]:h-dvh min-[1120px]:w-[300px] min-[1120px]:rounded-r-2xl min-[1120px]:rounded-l-none ">
      <div className="h-full min-[1120px]:overflow-y-auto">
        <Link
          href="/"
          aria-label="Finance home"
          className="hidden px-8 py-10 min-[1120px]:inline-block"
        >
          <Image
            src="/assets/images/logo-large.svg"
            alt="Finance"
            width={122}
            height={22}
            priority
          />
        </Link>
        <nav
          aria-label="Main navigation"
          className="h-full px-4 pt-2 min-[640px]:px-10 min-[1120px]:mt-6 min-[1120px]:h-auto min-[1120px]:overflow-visible min-[1120px]:px-0 min-[1120px]:pt-0 min-[1120px]:pr-6"
        >
          <ul className="flex h-full justify-around gap-1 min-[1120px]:h-auto min-[1120px]:flex-col">
            {links.map((item) => navItem(item))}
            {utilityLinks.map((item, index) =>
              navItem(item, true, index === 0),
            )}
            <li className="relative hidden h-auto min-w-0 flex-none min-[1120px]:mt-4 min-[1120px]:flex">
              <button
                type="button"
                className={itemClass(false)}
                onClick={signOutToLogin}
              >
                <span aria-hidden="true">
                  <SignoutIcon className="text-grey-300" />
                </span>
                <span>Sign Out</span>
              </button>
            </li>
            <li
              ref={accountRef}
              className="relative flex h-full min-w-0 flex-1 min-[1120px]:hidden"
            >
              <button
                type="button"
                className={itemClass(mobileUtilityActive)}
                aria-expanded={accountOpen}
                aria-controls="mobile-account-menu"
                aria-label={`Open account menu: ${activeUtilityLink?.label ?? 'Profile'}`}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span aria-hidden="true">
                  <MobileUtilityIcon className={mobileUtilityIconClass} />
                </span>
                <span className="hidden max-w-full truncate sm:block">
                  {activeUtilityLink?.label ?? 'Profile'}
                </span>
              </button>

              {accountOpen && (
                <div
                  id="mobile-account-menu"
                  className="absolute right-0 bottom-[calc(100%+12px)] w-52 rounded-xl bg-white p-2 text-grey-900 shadow-drop"
                >
                  {utilityLinks.map(({ href, label, Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setAccountOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold hover:bg-beige-100 focus-visible:outline-2 focus-visible:outline-green ${active ? 'bg-beige-100 text-green' : ''}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${Icon === ProfileIcon ? 'text-current' : 'fill-current'}`}
                        />
                        {label}
                      </Link>
                    );
                  })}
                  <div className="mx-3 h-px bg-grey-100" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold text-red hover:bg-beige-100 focus-visible:outline-2 focus-visible:outline-red"
                    onClick={signOutToLogin}
                  >
                    <SignoutIcon className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
