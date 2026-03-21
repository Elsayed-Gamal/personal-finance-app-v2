import { motion } from 'motion/react';
import Menus from '@/app/_UI/Menus';
import EllipsisIcon from '@/app/_UI/icons/EllipsisIcon';
import Modal from '@/app/_UI/Modal';
import AddEditPot from './AddEditPot';
import ConfirmDelete from '@/app/_UI/ConfirmDelete';
import AddWithdrawMoney from './AddWithdrawMoney';
import { formatCurrency, formatPercentage } from '@/app/_utils/helpers';

function Pot({ pot, themes }) {
  return (
    <motion.div className="flex flex-col gap-8 rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: pot.theme }}
          ></span>
          <h2
            className={`text-grey-900`}
            style={{ font: 'var(--text-preset-2)' }}
          >
            {pot.name}
          </h2>
        </div>
        <Menus.Toggle id={pot.name}>
          <EllipsisIcon />
        </Menus.Toggle>
      </div>
      <Modal>
        <Menus.List id={pot.name}>
          <Modal.Open opens="edit-pot">
            <Menus.Button>Edit Pot</Menus.Button>
          </Modal.Open>
          <div className="bg-grey-100 h-px w-full"></div>
          <Modal.Open opens="delete-pot">
            <Menus.Button type="delete">Delete Pot</Menus.Button>
          </Modal.Open>
        </Menus.List>

        <Modal.Content name="edit-pot">
          <AddEditPot type="edit" pot={pot} themes={themes} />
        </Modal.Content>
        <Modal.Content name="delete-pot">
          <ConfirmDelete potName={pot.name} />
        </Modal.Content>
      </Modal>

      <div className="flex flex-col gap-4 py-[10.5px]">
        <div className="flex justify-between">
          <h3
            className="text-grey-500"
            style={{ font: 'var(--text-preset-4)' }}
          >
            Total Saved
          </h3>
          <span
            className="text-grey-900"
            style={{ font: 'var(--text-preset-1)' }}
          >
            {formatCurrency(pot.total)}
          </span>
        </div>
        <div className="flex flex-col gap-3.25">
          <div className="bg-beige-100 h-2 w-full rounded-full">
            <div
              className={`h-2 rounded-full`}
              style={{
                width: `${(pot.total / pot.target) * 100}%`,
                backgroundColor: pot.theme,
              }}
            ></div>
          </div>
          <div className="flex justify-between">
            <span
              className="text-grey-500"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              {formatPercentage(pot.total / pot.target)}
            </span>
            <span
              className="text-grey-500"
              style={{ font: 'var(--text-preset-5)' }}
            >
              Target of {formatCurrency(pot.target, 0)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <Modal>
          <Modal.Open opens="add-money">
            <button
              className="bg-beige-100 text-grey-900 h-13.25 w-[50%] cursor-pointer rounded-lg p-4"
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              +Add Money
            </button>
          </Modal.Open>
          <Modal.Content name="add-money">
            <AddWithdrawMoney type="add" pot={pot} />
          </Modal.Content>

          <Modal.Open opens="withdraw-money">
            <button
              className="bg-beige-100 text-grey-900 h-13.25 w-[50%] cursor-pointer rounded-lg p-4"
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              Withdraw
            </button>
          </Modal.Open>
          <Modal.Content name="withdraw-money">
            <AddWithdrawMoney type="withdraw" pot={pot} />
          </Modal.Content>
        </Modal>
      </div>
    </motion.div>
  );
}

export default Pot;
