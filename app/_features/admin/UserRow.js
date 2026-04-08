'use client';

import { motion } from 'motion/react';
import Menus from '@/app/_UI/Menus';
import EllipsisIcon from '@/app/_UI/icons/EllipsisIcon';
import Modal from '@/app/_UI/Modal';
import AddEditUser from './AddEditUser';
import ConfirmDeleteUser from './ConfirmDeleteUser';

const roleBadgeClass = {
  ADMIN: 'bg-green/15 text-green',
  USER: 'bg-blue/15 text-blue',
};

function UserRow({ user, currentUserId }) {
  const isSelf = user.id === currentUserId;

  const initials = user.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : '?';

  return (
    <motion.tr
      className="border-beige-500/30 border-b last:border-b-0"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar + Name */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grey-900 text-white"
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <span
              className="text-grey-900"
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              {user.name}
              {isSelf && (
                <span
                  className="text-green ml-2"
                  style={{ font: 'var(--text-preset-5)' }}
                >
                  (you)
                </span>
              )}
            </span>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 pr-4">
        <span
          className="text-grey-500"
          style={{ font: 'var(--text-preset-4)' }}
        >
          {user.email}
        </span>
      </td>

      {/* Role Badge */}
      <td className="py-4 pr-4">
        <span
          className={`inline-block rounded-full px-3 py-1 -translate-x-2 ${roleBadgeClass[user.role] ?? roleBadgeClass.USER}`}
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          {user.role}
        </span>
      </td>

      {/* Joined date */}
      <td className="py-4 pr-4">
        <span
          className="text-grey-500"
          style={{ font: 'var(--text-preset-5)' }}
        >
          {new Date(user.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 text-right">
        <Menus.Toggle id={`user-${user.id}`}>
          <EllipsisIcon />
        </Menus.Toggle>

        <Modal>
          <Menus.List id={`user-${user.id}`}>
            <Modal.Open opens={`edit-user-${user.id}`}>
              <Menus.Button>Edit User</Menus.Button>
            </Modal.Open>
            {!isSelf && (
              <>
                <div className="bg-grey-100 h-px w-full"></div>
                <Modal.Open opens={`delete-user-${user.id}`}>
                  <Menus.Button type="delete">Delete User</Menus.Button>
                </Modal.Open>
              </>
            )}
          </Menus.List>

          <Modal.Content name={`edit-user-${user.id}`}>
            <AddEditUser type="edit" user={user} />
          </Modal.Content>
          {!isSelf && (
            <Modal.Content name={`delete-user-${user.id}`}>
              <ConfirmDeleteUser userId={user.id} userName={user.name} />
            </Modal.Content>
          )}
        </Modal>
      </td>
    </motion.tr>
  );
}

export default UserRow;
