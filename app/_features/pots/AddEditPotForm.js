'use client';

import { addPot, editPot } from '@/app/_actions/potsActions';
import { ModalContext } from '@/app/_UI/Modal';
import { useContext, useState } from 'react';

function AddEditPotForm({
  type,
  potName: initialPotName,
  potTarget: initialPotTarget,
  potTheme: initialPotTheme,
  themes,
  startTransition,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeThemeHex, setActiveThemeHex] = useState(initialPotTheme ?? null);
  const { close } = useContext(ModalContext);

  const selectedTheme = themes?.find(
    (theme) => theme.hex_code === activeThemeHex,
  );

  const editPotWithName = editPot.bind(null, initialPotName);

  const handleSubmit = async (formData) => {
    startTransition(async () => {
      if (type === 'edit') {
        await editPotWithName(formData);
      } else if (type === 'add') {
        await addPot(formData);
      }

      close();
    });
  };

  return (
    <form
      className="text-grey-500 flex flex-col gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-1"
      action={handleSubmit}
    >
      <div>
        <label htmlFor="pot-name" style={{ font: 'var(--text-preset-5-bold)' }}>
          Pot Name
        </label>
        <input
          type="text"
          name="potName"
          id="pot-name"
          className="form-input"
          placeholder="e.g. Rainy Days"
          defaultValue={initialPotName}
          maxLength={30}
        />

        {/* <span className="self-end" style={{ font: 'var(--text-preset-5)' }}>
          {30 - potName.length} characters left
        </span> */}
      </div>
      <div>
        <label
          htmlFor="pot-target"
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          Target
        </label>
        <input
          type="number"
          id="pot-target"
          name="potTarget"
          className="form-input"
          placeholder="e.g. 2000"
          defaultValue={initialPotTarget}
        />
      </div>
      <div className="relative">
        <label
          htmlFor="pot-theme"
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          Theme
        </label>
        <input
          type="hidden"
          id="pot-theme"
          name="potTheme"
          value={activeThemeHex}
        />
        <button
          type="button"
          className="form-input flex w-full items-center gap-3 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedTheme ? (
            <>
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: selectedTheme.hex_code }}
              ></span>
              {selectedTheme.color}
            </>
          ) : (
            'Select a theme'
          )}
        </button>

        {isOpen && (
          <div className="border-beige-500 absolute z-10 mt-1 max-h-30 w-full overflow-auto rounded-lg border bg-white shadow-lg">
            {themes?.map((theme) => (
              <button
                type="button"
                key={theme.color}
                className="hover:bg-grey-100 text-grey-900 flex w-full items-center gap-3 p-3 text-left"
                onClick={() => {
                  setActiveThemeHex(theme.hex_code);
                  setIsOpen(false);
                }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ backgroundColor: theme.hex_code }}
                ></span>
                {theme.color}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        className="bg-grey-900 w-full cursor-pointer rounded-lg p-4 text-white"
        style={{ font: 'var(--text-preset-4-bold)' }}
      >
        {type === 'add' ? 'Add Pot' : 'Save Changes'}
      </button>
    </form>
  );
}

export default AddEditPotForm;
