'use client';

import { AnimatePresence } from 'motion/react';
import Menus from '@/app/_UI/Menus';
import UserRow from './UserRow';

function UsersTable({ users, currentUserId }) {
  return (
    <div className="rounded-xl bg-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-grey-900" style={{ font: 'var(--text-preset-2)' }}>
          All Users
        </h2>
        <span
          className="bg-grey-100 text-grey-500 rounded-full px-3 py-1"
          style={{ font: 'var(--text-preset-5)' }}
        >
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-beige-500/30 border-b">
              <th
                className="text-grey-500 pb-3 text-left pr-4"
                style={{ font: 'var(--text-preset-5-bold)' }}
              >
                User
              </th>
              <th
                className="text-grey-500 pb-3 text-left pr-4"
                style={{ font: 'var(--text-preset-5-bold)' }}
              >
                Email
              </th>
              <th
                className="text-grey-500 pb-3 text-left pr-4"
                style={{ font: 'var(--text-preset-5-bold)' }}
              >
                Role
              </th>
              <th
                className="text-grey-500 pb-3 text-left pr-4"
                style={{ font: 'var(--text-preset-5-bold)' }}
              >
                Joined
              </th>
              <th className="pb-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <Menus>
            <tbody>
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUserId}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </Menus>
        </table>

        {users.length === 0 && (
          <p
            className="text-grey-500 mt-8 text-center"
            style={{ font: 'var(--text-preset-4)' }}
          >
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}

export default UsersTable;
