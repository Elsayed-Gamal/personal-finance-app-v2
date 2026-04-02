'use server';

import {
  updateNameSchema,
  updatePasswordSchema,
} from '@/app/_utils/validationSchemas';
import {
  getUserByEmail,
  updateUserName,
  updateUserPassword,
} from '../_services/apiUsers';
import { auth } from '../_services/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateName(prevState, formData) {
  const raw = {
    name: formData.get('name'),
  };

  const { user } = await auth();

  const result = updateNameSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  await updateUserName(user.id, result.data.name);
  revalidatePath('/profile');

  return { success: 'Name updated successfully.', name: result.data.name };
}

export async function updatePassword(prevState, formData) {
  const raw = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const { user } = await auth();

  const result = updatePasswordSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const userFromDB = await getUserByEmail(user.email);

  const isValid = await bcrypt.compare(
    result.data.currentPassword,
    userFromDB.password,
  );

  if (!isValid) {
    return {
      errors: {
        currentPassword: ['Current password is incorrect'],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(result.data.newPassword, 12);

  await updateUserPassword(user.id, hashedPassword);
  return { success: 'Password updated successfully.' };
}
