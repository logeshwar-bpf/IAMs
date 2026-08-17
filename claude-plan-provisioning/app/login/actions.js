'use server';

import { redirect } from 'next/navigation';
import { generateToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';

import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

export async function login(prevState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const isValidUser = username === ADMIN_USERNAME;
  const isValidPass = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (!isValidUser || !isValidPass) {
    return { error: 'Invalid username or password' };
  }

  const token = generateToken(username);
  await setAuthCookie(token);

  redirect('/');
}

export async function logout() {
  await clearAuthCookie();
  redirect('/login');
}