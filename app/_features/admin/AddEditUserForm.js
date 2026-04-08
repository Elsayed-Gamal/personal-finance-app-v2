'use client';

import { useContext, useActionState, useTransition } from 'react';
import { ModalContext } from '@/app/_UI/Modal';
import { adminCreate, adminEdit } from '@/app/_actions/adminActions';
import Loading from '@/app/_UI/Loading';

function AddEditUserForm({ type, user, startTransition }) {
  const { close } = useContext(ModalContext);

  const boundAction =
    type === 'edit' ? adminEdit.bind(null, user.id) : adminCreate;

  async function handleAction(prevState, formData) {
    const result = await boundAction(prevState, formData);
    if (result?.success) {
      close();
    }
    return result;
  }

  const [state, formAction, isPending] = useActionState(handleAction, null);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        {type === 'edit' ? 'Edit User' : 'Add New User'}
      </h2>
      <p className="text-grey-500" style={{ font: 'var(--text-preset-4)' }}>
        {type === 'edit'
          ? "Update the user's details. Leave the password field empty to keep the existing password."
          : 'Fill in the details to create a new user account.'}
      </p>

      {isPending ? (
        <Loading />
      ) : (
        <form
          action={formAction}
          className="text-grey-500 flex flex-col gap-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-1"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="user-name"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="user-name"
              name="name"
              className="form-input w-full"
              placeholder="e.g. John Doe"
              defaultValue={user?.name ?? ''}
              maxLength={50}
            />
            {state?.errors?.name && (
              <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="user-email"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="user-email"
              name="email"
              className="form-input w-full"
              placeholder="e.g. john@example.com"
              defaultValue={user?.email ?? ''}
            />
            {state?.errors?.email && (
              <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="user-password"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              {type === 'edit' ? 'New Password (optional)' : 'Password'}
            </label>
            <input
              type="password"
              id="user-password"
              name={type === 'edit' ? 'newPassword' : 'password'}
              className="form-input w-full"
              placeholder={
                type === 'edit' ? 'Leave blank to keep current' : '••••••••'
              }
            />
            {(state?.errors?.password || state?.errors?.newPassword) && (
              <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
                {(state.errors.password ?? state.errors.newPassword)[0]}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="user-role"
              style={{ font: 'var(--text-preset-5-bold)' }}
            >
              Role
            </label>
            <select
              id="user-role"
              name="role"
              className="form-input w-full bg-white"
              defaultValue={user?.role ?? 'user'}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            {state?.errors?.role && (
              <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
                {state.errors.role[0]}
              </p>
            )}
          </div>

          {state?.success && (
            <p className="text-green" style={{ font: 'var(--text-preset-5)' }}>
              {state.success}
            </p>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <button
              type="submit"
              className="bg-grey-900 flex-1 cursor-pointer rounded-lg py-4 text-white transition"
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              {type === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
            <button
              type="button"
              className="text-grey-500 flex-1 cursor-pointer rounded-lg bg-transparent transition"
              onClick={close}
              style={{ font: 'var(--text-preset-4)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddEditUserForm;
