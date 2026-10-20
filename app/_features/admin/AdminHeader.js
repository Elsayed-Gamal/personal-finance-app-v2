'use client';

import Modal from '@/app/_UI/Modal';
import AddEditUser from './AddEditUser';

function AdminHeader() {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-2xl leading-[1.2] font-bold text-grey-900 sm:text-[32px]">
        Admin Panel
      </h1>
      <Modal>
        <Modal.Open opens="create-user">
          <button
            type="button"
            className="button-primary h-[53px] shrink-0 px-3 sm:px-4"
            style={{ font: 'var(--text-preset-4-bold)' }}
          >
            <span className="sm:hidden">+ Add User</span>
            <span className="hidden sm:inline">+ Add New User</span>
          </button>
        </Modal.Open>
        <Modal.Content name="create-user">
          <AddEditUser type="add" />
        </Modal.Content>
      </Modal>
    </div>
  );
}

export default AdminHeader;
