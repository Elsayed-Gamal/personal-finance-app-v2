'use client';

import AddEditUserForm from './AddEditUserForm';

function AddEditUser({ type, user }) {
  return <AddEditUserForm type={type} user={user} />;
}

export default AddEditUser;
