import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'admin_session';

function sign(value: string) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || 'dev-secret').update(value).digest('hex');
}

export function createSessionCookie() {
  const payload = `${Date.now()}`;
  const token = `${payload}.${sign(payload)}`;
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

export function isAuthenticated() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split('.');
  return !!payload && signature === sign(payload);
}

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const incomingHash = crypto.createHash('sha256').update(password).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(expected).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(expectedHash));
}
