'use server';

import {
  createUser,
  getUserByEmailForVerification,
} from '../_services/apiUsers';
import bcrypt from 'bcryptjs';
import { signIn } from '../_services/auth';
import { redirect } from 'next/navigation';
import { loginSchema, signupSchema } from '../_utils/validationSchemas';

export async function signup(prevState, formData) {
  const raw = {
    name: formData.get('name')?.trim(),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  const existing = await getUserByEmailForVerification(email);
  if (existing) {
    return {
      errors: {
        email: [
          'This email is already in use. Please log in or use a different email.',
        ],
      },
    };
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
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: 'Incorrect email or password.' };
  }

  redirect('/');
}
