import { useContext, useState, useTransition } from 'react';
import { ModalContext } from '@/app/_UI/Modal';
import Loading from '@/app/_UI/Loading';
import { formatCurrency, formatPercentage } from '@/app/_utils/helpers';
import { addMoney, withdrawMoney } from '@/app/_actions/potsActions';

function AddWithdrawMoney({ type, pot }) {
  const [addAmount, setAddAmount] = useState('');
  const [isPending, startTransition] = useTransition();
  const maxAmountAdd = pot.target - pot.total;
  const maxAmountWithdraw = pot.total;

  const { close } = useContext(ModalContext);

  const handleAddMoney = async ({ potName, amount }) => {
    startTransition(async () => {
      await addMoney(potName, amount);
      close();
    });
  };

  const handleWithdrawMoney = async ({ potName, amount }) => {
    startTransition(async () => {
      await withdrawMoney(potName, amount);
      close();
    });
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numValue = Number(value);

    if (numValue < 0) return;
    if (type === 'add' && numValue > maxAmountAdd) {
      setAddAmount(maxAmountAdd);
      return;
    }
    if (type === 'withdraw' && numValue > maxAmountWithdraw) {
      setAddAmount(maxAmountWithdraw);
      return;
    }

    setAddAmount(value);
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <h2 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        {type === 'add' ? 'Add to' : 'Withdraw from'} ‘{pot.name}’
      </h2>
      <p className="text-grey-500" style={{ font: 'var(--text-preset-4)' }}>
        {type === 'add'
          ? 'Add money to your pot to keep it separate from your main balance. As soon as you add this money, it will be deducted from your current balance.'
          : 'Withdraw from your pot to put money back in your main balance. This will reduce the amount you have in this pot.'}
      </p>

      {isPending ? (
        <Loading />
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between">
              <h4
                className="text-grey-500"
                style={{ font: 'var(--text-preset-4)' }}
              >
                New Amount
              </h4>
              <span
                className="text-grey-900"
                style={{ font: 'var(--text-preset-1)' }}
              >
                {type === 'add'
                  ? formatCurrency(
                      pot.total + (addAmount ? Number(addAmount) : 0),
                    )
                  : formatCurrency(
                      pot.total - (addAmount ? Number(addAmount) : 0),
                    )}
              </span>
            </div>
            <div className="bg-beige-100 relative mt-4 mb-3.25 h-2 w-full rounded-full">
              <div
                className={`relative top-0 h-2 rounded-full ${type === 'add' ? "after:absolute after:right-0 after:h-2 after:w-0.5 after:bg-white after:content-['']" : ''}`}
                style={{
                  width: `${(pot.total / pot.target) * 100}%`,
                  backgroundColor:
                    type === 'add'
                      ? 'var(--color-grey-900)'
                      : 'var(--color-red)',
                  zIndex: type === 'add' ? 10 : 'auto',
                }}
              ></div>
              <div
                className={`absolute top-0 h-2 rounded-full ${type === 'withdraw' ? "after:absolute after:right-0 after:h-2 after:w-0.5 after:bg-white after:content-['']" : ''}`}
                style={{
                  width:
                    type === 'add'
                      ? `${((pot.total + (addAmount ? Number(addAmount) : 0)) / pot.target) * 100}%`
                      : `${((pot.total - (addAmount ? Number(addAmount) : 0)) / pot.target) * 100}%`,
                  backgroundColor:
                    type === 'add'
                      ? 'var(--color-green)'
                      : 'var(--color-grey-900)',
                  zIndex: type === 'add' ? 'auto' : 10,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={type === 'add' ? 'text-green' : 'text-red'}
                style={{ font: 'var(--text-preset-5-bold)' }}
              >
                {formatPercentage(
                  type === 'add'
                    ? (pot.total + (addAmount ? Number(addAmount) : 0)) /
                        pot.target
                    : (pot.total - (addAmount ? Number(addAmount) : 0)) /
                        pot.target,
                )}
              </span>
              <span
                className="text-grey-500"
                style={{ font: 'var(--text-preset-5)' }}
              >
                Target of {formatCurrency(pot.target, 0)}
              </span>
            </div>
          </div>
          <div>
            <h5
              className="text-grey-500"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              Amount to {type === 'add' ? 'Add' : 'Withdraw'}
            </h5>
            <input
              type="number"
              className="border-beige-500 mt-1 w-full rounded-lg border px-5 py-3 outline-none"
              placeholder="0"
              style={{ font: 'var(--text-preset-4)' }}
              value={addAmount}
              max={type === 'add' ? maxAmountAdd : maxAmountWithdraw}
              onChange={handleAmountChange}
            />
          </div>
          <button
            className="bg-grey-900 mt-4 h-13.25 w-full cursor-pointer rounded-lg p-4 text-white"
            style={{ font: 'var(--text-preset-4-bold)' }}
            onClick={() =>
              type === 'add'
                ? handleAddMoney({
                    potName: pot.name,
                    amount: Number(addAmount),
                  })
                : handleWithdrawMoney({
                    potName: pot.name,
                    amount: Number(addAmount),
                  })
            }
            disabled={!addAmount || Number(addAmount) === 0 || isPending}
          >
            Confirm {type === 'add' ? 'Addition' : 'Withdrawal'}
          </button>
        </>
      )}
    </div>
  );
}

export default AddWithdrawMoney;
