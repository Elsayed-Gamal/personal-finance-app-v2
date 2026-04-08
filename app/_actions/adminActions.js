'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { auth } from '../_services/auth';
import {
  getAllUsers,
  createUser,
  adminUpdateUser,
  adminDeleteUser,
  getUserByEmailForVerification,
} from '../_services/apiUsers';
import {
  adminCreateUserSchema,
  adminEditUserSchema,
} from '../_utils/validationSchemas';
import { setSetting } from '../_services/apiSettings';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getUsers() {
  await requireAdmin();
  return getAllUsers();
}

export async function adminCreate(prevState, formData) {
  await requireAdmin();

  const raw = {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    password: formData.get('password'),
    role: formData.get('role'),
  };

  const result = adminCreateUserSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password, role } = result.data;

  const existing = await getUserByEmailForVerification(email);
  if (existing) {
    return { errors: { email: ['This email is already in use.'] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await createUser({ name, email, password: hashedPassword, role });

  revalidatePath('/admin');
  return { success: 'User created successfully.' };
}

export async function adminEdit(userId, prevState, formData) {
  await requireAdmin();

  const raw = {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    role: formData.get('role'),
    newPassword: formData.get('newPassword') || undefined,
  };

  const result = adminEditUserSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, role, newPassword } = result.data;

  const updates = { name, email, role };
  if (newPassword) {
    updates.password = await bcrypt.hash(newPassword, 12);
  }

  await adminUpdateUser(userId, updates);

  revalidatePath('/admin');
  return { success: 'User updated successfully.' };
}

export async function adminDelete(userId) {
  await requireAdmin();
  await adminDeleteUser(userId);
  revalidatePath('/admin');
}

export async function toggleRegistration(currentValue) {
  await requireAdmin();
  await setSetting('registration_open', String(!currentValue));
  revalidatePath('/admin');
}
