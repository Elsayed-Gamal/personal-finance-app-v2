'use client';

import Modal from '@/app/_UI/Modal';
import AddEditPot from './AddEditPot';

function PotsHeader({ themes }) {
  return (
    <div className="mb-8 flex h-14 items-center justify-between">
      <h1
        className="text-gray-900"
        style={{
          font: 'var(--text-preset-1)',
        }}
      >
        Pots
      </h1>
      <Modal>
        <Modal.Open opens="create-pot">
          <button
            className="bg-grey-900 h-13.25 cursor-pointer rounded-lg px-4 py-2 text-white"
            style={{ font: 'var(--text-preset-4-bold)' }}
          >
            + Add New Pot
          </button>
        </Modal.Open>
        <Modal.Content name="create-pot">
          <AddEditPot type="add" themes={themes} />
        </Modal.Content>
      </Modal>
    </div>
  );
}

export default PotsHeader;
