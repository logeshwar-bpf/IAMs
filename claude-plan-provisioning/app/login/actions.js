'use server';

import { redirect } from 'next/navigation';
import { generateToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function getAdminPasswordHash() {
  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH;
  }
  const rawPass = process.env.ADMIN_PASSWORD;
  if (!rawPass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD or ADMIN_PASSWORD_HASH environment variable is required in production');
    }
    return bcrypt.hashSync('admin123', 10);
  }
  return bcrypt.hashSync(rawPass, 10);
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

export async function login(prevState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const isValidUser = username === ADMIN_USERNAME;
  const adminHash = getAdminPasswordHash();
  const isValidPass = bcrypt.compareSync(password, adminHash);

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