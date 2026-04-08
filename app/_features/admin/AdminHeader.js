'use client';

import Modal from '@/app/_UI/Modal';
import AddEditUser from './AddEditUser';

function AdminHeader() {
  return (
    <div className="mb-8 flex h-14 items-center justify-between">
      <h1 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        Admin Panel
      </h1>
      <Modal>
        <Modal.Open opens="create-user">
          <button
            className="bg-grey-900 h-13.25 cursor-pointer rounded-lg px-4 py-2 text-white"
            style={{ font: 'var(--text-preset-4-bold)' }}
          >
            + Add New User
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
