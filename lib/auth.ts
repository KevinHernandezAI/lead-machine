import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || '';
  return password === expected;
}

export function createSessionCookie() {
  // If this runs without a request context (shouldn't), just no-op.
  try {
    cookies().set(COOKIE_NAME, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  } catch {
    // no-op
  }
}

export function clearSessionCookie() {
  try {
    cookies().set(COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0
    });
  } catch {
    // no-op
  }
}

export function isAuthenticated(): boolean {
  try {
    return !!cookies().get(COOKIE_NAME)?.value;
  } catch {
    // Build-time / no request context -> not authenticated
    return false;
  }
}