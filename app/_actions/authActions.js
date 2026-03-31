'use server';

import {
  createUser,
  getUserByEmailForVerification,
} from '../_services/apiUsers';
import bcrypt from 'bcryptjs';
import { signIn } from '../_services/auth';
import { redirect } from 'next/navigation';

export async function signup(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  const existing = await getUserByEmailForVerification(email);
  if (existing) {
    throw new Error(
      'هذا الايميل مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام ايميل آخر.',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await createUser({
    name,
    email,
    password: hashedPassword,
  });

  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  redirect('/');
}

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }

  redirect('/');
}
