"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import OverviewIcon from "./icons/OverviewIcon";
import TransactionsIcon from "./icons/TransactionsIcon";
import PotsIcon from "./icons/PotsIcon";
import RecurringBillsIcon from "./icons/RecurringBillsIcon";
import BudgetsIcon from "./icons/BudgetsIcon";
import { signOut, useSession } from "next-auth/react";
import ProfileIcon from "./icons/ProfileIcon";
import SignoutIcon from "./icons/SignoutIcon";
import AdminIcon from "./icons/AdminIcon";

const links = [
  { href: "/", label: "Overview", Icon: OverviewIcon },
  { href: "/transactions", label: "Transactions", Icon: TransactionsIcon },
  { href: "/budgets", label: "Budgets", Icon: BudgetsIcon },
  { href: "/pots", label: "Pots", Icon: PotsIcon },
  {
    href: "/recurring-bills",
    label: "Recurring Bills",
    Icon: RecurringBillsIcon,
  },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const visibleLinks =
    session?.user?.role === "ADMIN"
      ? [...links, { href: "/admin", label: "Admin Panel", Icon: AdminIcon }]
      : links;
  const itemClass = (active) =>
    `flex min-h-12 shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-full lg:rounded-l-none lg:rounded-r-xl lg:px-6 lg:py-4 lg:text-base ${active ? "border-b-4 border-green bg-beige-100 text-grey-900 lg:border-b-0 lg:border-l-4" : "text-grey-300 hover:bg-grey-500/30 hover:text-white"}`;
  return (
    <aside className="min-w-0 bg-grey-900 text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:rounded-r-xl">
      <Link
        href="/"
        aria-label="Finance home"
        className="inline-block px-5 py-5 lg:px-8 lg:py-10"
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
        className="overflow-x-auto px-3 pb-3 lg:overflow-visible lg:pl-0 lg:pr-5"
      >
        <ul className="flex gap-2 lg:flex-col lg:gap-1">
          {visibleLinks.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={itemClass(active)}
                >
                  <span aria-hidden="true">
                    <Icon className={active ? "fill-green" : "fill-grey-300"} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0 lg:mt-8">
            <button
              type="button"
              className={itemClass(false)}
              onClick={() => signOut()}
            >
              <span aria-hidden="true">
                <SignoutIcon className="fill-grey-300" />
              </span>
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
